import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, AppState, Easing, Platform } from "react-native";

import {
  distanceBetweenKm,
  distanceToKaabaKm,
  normaliseDegrees,
  qiblaBearing,
  shortestDelta,
} from "@/utils/qibla";
import { getCachedQiblaFix, setCachedQiblaFix, type QiblaFix } from "@/utils/qiblaCache";

// ── Motion tuning ────────────────────────────────────────────────────────────

/**
 * How often a heading sample is pushed into the native animation (~15/s).
 *
 * The sensor fires far faster than this. Sampling here is what keeps the JS
 * thread quiet; the native driver interpolates the gaps at display refresh
 * rate, so the needle still moves at 60/120fps.
 */
const HEADING_DRIVE_MS = 66;
/**
 * Each sample eases over slightly longer than the drive interval, so a new
 * animation always starts before the previous one lands and the needle glides
 * continuously instead of stepping.
 */
const NEEDLE_EASE_MS = 110;
/** React state derived from the sensor refreshes at most 4x/sec. */
const UI_TICK_MS = 250;
/** Low-pass factor applied to ordinary magnetometer jitter. */
const SMOOTHING_ALPHA = 0.35;
/** A jump this large is a real turn, not noise, so follow it almost verbatim. */
const FAST_TURN_DEG = 25;
const FAST_TURN_ALPHA = 0.9;

// ── Alignment tuning ─────────────────────────────────────────────────────────

/** Enter alignment inside ±3°… */
const ALIGN_ENTER_DEG = 3;
/** …and only leave it past ±6°, so hovering on the edge cannot flicker. */
const ALIGN_EXIT_DEG = 6;
/** Hard floor between success buzzes, on top of the enter/exit hysteresis. */
const ALIGN_HAPTIC_COOLDOWN_MS = 1500;

// ── Sensor / location tuning ─────────────────────────────────────────────────

/**
 * expo-location grades compass calibration 3 = high, 2 = medium, 1 = low,
 * 0 = unusable. Below medium the reading can be tens of degrees out, which for
 * a religious tool is worse than admitting we don't know.
 */
const MIN_USABLE_HEADING_ACCURACY = 2;
/** Some Android builds report -1 for "unknown" rather than a grade. */
const UNKNOWN_HEADING_ACCURACY = -1;
/** No heading inside this window means there is no usable magnetometer. */
const HEADING_WATCHDOG_MS = 3000;
/** A last-known fix older than this is a starting point, never the answer. */
const LAST_KNOWN_MAX_AGE_MS = 10 * 60 * 1000;
/** Only pay for reverse geocoding again once the user has actually moved. */
const REGEOCODE_DISTANCE_KM = 5;

// ── Public shape ─────────────────────────────────────────────────────────────

export type QiblaPhase = "locating" | "denied" | "unavailable" | "ready";
export type CompassStatus = "starting" | "calibrating" | "live" | "unavailable";
/** How much we trust the position the bearing was computed from. */
export type FixQuality = "cached" | "coarse" | "precise";

export interface QiblaLocationState {
  phase: QiblaPhase;
  /** Human-readable explanation, only set when `phase` is "unavailable". */
  message?: string;
  /** Bearing to the Ka'bah in degrees from true north. */
  bearing?: number;
  distanceKm?: number;
  place?: string;
  quality?: FixQuality;
}

export interface QiblaReading {
  status: CompassStatus;
  /** True while the device points within the alignment window of the Qibla. */
  aligned: boolean;
  /** Whole degrees still to turn; positive is clockwise. Null with no sensor. */
  offset: number | null;
  /** False when the OS could not supply a declination-corrected heading. */
  trueNorth: boolean;
}

const INITIAL_READING: QiblaReading = {
  status: "starting",
  aligned: false,
  offset: null,
  trueNorth: true,
};

/**
 * True north where the OS can provide it (tilt-compensated and corrected for
 * magnetic declination), magnetic north otherwise. `trueHeading` is -1 when
 * location services can't supply a declination for the current position.
 */
function resolveHeading(reading: Location.LocationHeadingObject): number | null {
  const heading = reading.trueHeading >= 0 ? reading.trueHeading : reading.magHeading;
  if (!Number.isFinite(heading) || heading < 0) return null;
  return normaliseDegrees(heading);
}

/**
 * Drives the Qibla screen: acquires a position (cache first, then progressively
 * better fixes), subscribes to the device compass, and exposes the heading as a
 * single `Animated.Value` that callers hand straight to the native driver.
 *
 * The returned `headingAnim` carries a *continuous* angle — it keeps counting
 * past 360° rather than wrapping — so any rotation interpolated from it always
 * takes the short way round.
 */
export function useQiblaCompass() {
  const headingAnim = useRef(new Animated.Value(0)).current;
  const useNativeDriver = Platform.OS !== "web";

  const [location, setLocation] = useState<QiblaLocationState>({ phase: "locating" });
  const [reading, setReading] = useState<QiblaReading>(INITIAL_READING);

  // Mirrors of the two state objects, so the sensor path and the 4/sec tick can
  // read the latest values without re-creating callbacks or forcing renders.
  const locationRef = useRef<QiblaLocationState>({ phase: "locating" });
  const readingRef = useRef<QiblaReading>(INITIAL_READING);

  const headingSub = useRef<Location.LocationSubscription | null>(null);
  const watchdog = useRef<ReturnType<typeof setTimeout> | null>(null);
  /**
   * Lets `acquire` restart the sensor once permission lands, without the two
   * callbacks having to depend on each other.
   */
  const startHeadingRef = useRef<() => void>(() => {});
  /** Smoothed heading in [0, 360) — the value all UI logic reasons about. */
  const smoothedHeading = useRef<number | null>(null);
  /** Unwrapped accumulation of the same heading — what the animation follows. */
  const continuousHeading = useRef(0);
  const lastDriveAt = useRef(0);
  const headingAccuracy = useRef(UNKNOWN_HEADING_ACCURACY);
  const isTrueNorth = useRef(true);
  const sensorFailed = useRef(false);
  const lastHapticAt = useRef(0);
  /** Bumped on every new acquisition so stale async results are discarded. */
  const generation = useRef(0);

  const updateLocation = useCallback(
    (next: (prev: QiblaLocationState) => QiblaLocationState) => {
      const value = next(locationRef.current);
      locationRef.current = value;
      setLocation(value);
    },
    []
  );

  const applyFix = useCallback(
    (fix: QiblaFix, quality: FixQuality) => {
      updateLocation((prev) => ({
        phase: "ready",
        bearing: qiblaBearing(fix.lat, fix.lng),
        distanceKm: distanceToKaabaKm(fix.lat, fix.lng),
        place: fix.place ?? prev.place,
        quality,
      }));
    },
    [updateLocation]
  );

  // ── Location acquisition ───────────────────────────────────────────────────

  const acquire = useCallback(async () => {
    const gen = ++generation.current;
    const isStale = () => gen !== generation.current;

    // 1. Cached fix — draws a working compass before anything else has run.
    const cached = await getCachedQiblaFix();
    if (isStale()) return;
    if (cached) applyFix(cached, "cached");

    // 2. Permission. Only prompt when we're actually allowed to.
    let granted = false;
    try {
      const existing = await Location.getForegroundPermissionsAsync();
      granted = existing.granted;
      if (!granted && existing.canAskAgain) {
        const requested = await Location.requestForegroundPermissionsAsync();
        granted = requested.granted;
      }
    } catch {
      granted = false;
    }
    if (isStale()) return;
    if (!granted) {
      // Keep any cached bearing on screen — it is still the honest answer for
      // where the user last was, and the UI labels it as such.
      updateLocation((prev) => ({ ...prev, phase: "denied" }));
      return;
    }

    // Android only serves compass data once location permission exists, and on
    // first run the subscription above was attempted before the user answered
    // the prompt. Now that it has landed, try again.
    startHeadingRef.current();

    // 3. Last known position — usually resolves instantly.
    try {
      const last = await Location.getLastKnownPositionAsync({
        maxAge: LAST_KNOWN_MAX_AGE_MS,
      });
      if (isStale()) return;
      if (last) {
        applyFix(
          { lat: last.coords.latitude, lng: last.coords.longitude, savedAt: last.timestamp },
          "coarse"
        );
      }
    } catch {}

    // 4. A real fix to refine with. Balanced accuracy is plenty: a Qibla
    //    bearing does not change measurably over a few hundred metres, and it
    //    settles far faster (and cheaper) than a high-accuracy GPS lock.
    let precise: Location.LocationObject | null = null;
    try {
      precise = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
    } catch {
      precise = null;
    }
    if (isStale()) return;

    if (!precise) {
      if (locationRef.current.bearing != null) return; // Cached answer stands.
      const servicesEnabled = await Location.hasServicesEnabledAsync().catch(() => true);
      if (isStale()) return;
      updateLocation(() => ({
        phase: "unavailable",
        message: servicesEnabled
          ? "We couldn't get a location fix. Try again somewhere with a clearer view of the sky."
          : "Location services are switched off on this device.",
      }));
      return;
    }

    const lat = precise.coords.latitude;
    const lng = precise.coords.longitude;

    // 5. Reverse geocode only when we have no name, or the user has moved far
    //    enough that the old one would be wrong.
    let place = cached?.place;
    const movedFar =
      !cached || distanceBetweenKm(cached.lat, cached.lng, lat, lng) > REGEOCODE_DISTANCE_KM;
    if (!place || movedFar) {
      try {
        const [found] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        place = found?.city ?? found?.subregion ?? found?.region ?? place;
      } catch {}
    }
    if (isStale()) return;

    applyFix({ lat, lng, place, savedAt: Date.now() }, "precise");
    void setCachedQiblaFix({ lat, lng, place });
  }, [applyFix, updateLocation]);

  // ── Heading pipeline ───────────────────────────────────────────────────────

  const pushHeading = useCallback(
    (event: Location.LocationHeadingObject) => {
      const raw = resolveHeading(event);
      if (raw === null) return;

      headingAccuracy.current = event.accuracy;
      isTrueNorth.current = event.trueHeading >= 0;
      sensorFailed.current = false;

      if (smoothedHeading.current === null) {
        smoothedHeading.current = raw;
        continuousHeading.current = raw;
        headingAnim.setValue(raw);
        return;
      }

      const now = Date.now();
      if (now - lastDriveAt.current < HEADING_DRIVE_MS) return;
      lastDriveAt.current = now;

      // Circular low-pass: step a fraction of the *shortest* way to the new
      // reading, so smoothing behaves identically across the 0°/360° seam.
      const delta = shortestDelta(smoothedHeading.current, raw);
      const alpha = Math.abs(delta) > FAST_TURN_DEG ? FAST_TURN_ALPHA : SMOOTHING_ALPHA;
      const step = delta * alpha;

      smoothedHeading.current = normaliseDegrees(smoothedHeading.current + step);
      // The animated value accumulates the same steps *without* wrapping, which
      // is what guarantees the needle never spins the long way round.
      continuousHeading.current += step;

      Animated.timing(headingAnim, {
        toValue: continuousHeading.current,
        duration: NEEDLE_EASE_MS,
        easing: Easing.out(Easing.quad),
        useNativeDriver,
      }).start();
    },
    [headingAnim, useNativeDriver]
  );

  const stopHeading = useCallback(() => {
    if (watchdog.current) {
      clearTimeout(watchdog.current);
      watchdog.current = null;
    }
    headingSub.current?.remove();
    headingSub.current = null;
  }, []);

  const startHeading = useCallback(async () => {
    if (headingSub.current) return;
    if (Platform.OS === "web") {
      sensorFailed.current = true;
      return;
    }
    // Give the sensor a clean slate: a previous attempt may have failed only
    // because permission hadn't been granted yet.
    sensorFailed.current = false;
    if (watchdog.current) clearTimeout(watchdog.current);
    watchdog.current = setTimeout(() => {
      // Silence past this point means no usable magnetometer — a tablet, an
      // emulator, or hardware that simply doesn't have one.
      if (smoothedHeading.current === null) sensorFailed.current = true;
    }, HEADING_WATCHDOG_MS);

    try {
      headingSub.current = await Location.watchHeadingAsync(pushHeading, () => {
        sensorFailed.current = true;
      });
    } catch {
      sensorFailed.current = true;
    }
  }, [pushHeading]);

  useEffect(() => {
    startHeadingRef.current = () => {
      void startHeading();
    };
  }, [startHeading]);

  // ── Throttled derivation of everything React needs to render ───────────────

  const deriveReading = useCallback(() => {
    const heading = smoothedHeading.current;
    const bearing = locationRef.current.bearing;
    const previous = readingRef.current;

    const accuracy = headingAccuracy.current;
    const calibrated =
      accuracy === UNKNOWN_HEADING_ACCURACY || accuracy >= MIN_USABLE_HEADING_ACCURACY;

    let status: CompassStatus;
    if (sensorFailed.current && heading === null) status = "unavailable";
    else if (heading === null) status = "starting";
    else if (!calibrated) status = "calibrating";
    else status = "live";

    const rawOffset =
      heading !== null && bearing != null ? shortestDelta(heading, bearing) : null;
    // Hysteresis: a tighter gate to get in than to fall out of.
    const gate = previous.aligned ? ALIGN_EXIT_DEG : ALIGN_ENTER_DEG;
    const aligned = status === "live" && rawOffset !== null && Math.abs(rawOffset) <= gate;

    if (aligned && !previous.aligned) {
      const now = Date.now();
      if (now - lastHapticAt.current > ALIGN_HAPTIC_COOLDOWN_MS) {
        lastHapticAt.current = now;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    }

    const next: QiblaReading = {
      status,
      aligned,
      offset: rawOffset === null ? null : Math.round(rawOffset),
      trueNorth: isTrueNorth.current,
    };

    // Only re-render when something a human could actually see has changed.
    if (
      next.status === previous.status &&
      next.aligned === previous.aligned &&
      next.offset === previous.offset &&
      next.trueNorth === previous.trueNorth
    ) {
      return;
    }
    readingRef.current = next;
    setReading(next);
  }, []);

  const retry = useCallback(() => {
    // Refreshing an already-working dial must not blank it — only fall back to
    // the locating state when there is genuinely nothing to show.
    updateLocation((prev) =>
      prev.bearing == null ? { phase: "locating" } : { ...prev, phase: "ready" }
    );
    void acquire();
    void startHeading();
  }, [acquire, startHeading, updateLocation]);

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  useEffect(() => {
    void acquire();
    return () => {
      // Invalidate anything still in flight so it can't write after unmount.
      generation.current += 1;
    };
  }, [acquire]);

  useFocusEffect(
    useCallback(() => {
      void startHeading();

      // If the user left to grant permission in Settings, pick it up on return.
      const phase = locationRef.current.phase;
      if (phase === "denied" || phase === "unavailable") void acquire();

      const tick = setInterval(deriveReading, UI_TICK_MS);

      // The tab can stay focused while the app is backgrounded; the compass is
      // the most power-hungry screen in the app, so drop the sensor too.
      const appState = AppState.addEventListener("change", (next) => {
        if (next === "active") void startHeading();
        else stopHeading();
      });

      return () => {
        clearInterval(tick);
        appState.remove();
        stopHeading();
      };
    }, [acquire, deriveReading, startHeading, stopHeading])
  );

  return { headingAnim, location, reading, retry };
}
