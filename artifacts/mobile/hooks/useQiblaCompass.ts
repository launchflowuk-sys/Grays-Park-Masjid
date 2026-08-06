import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";
import { DeviceMotion, type DeviceMotionMeasurement } from "expo-sensors";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, AppState, Platform } from "react-native";

import {
  createAngleUnwrapper,
  createNorthReference,
  createOneEuroFilter,
} from "@/utils/headingFilter";
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
 * Requested fused-sensor period, ~60Hz.
 *
 * This is the animation driver. `Location.watchHeadingAsync` cannot be: on
 * Android it samples the magnetometer at SENSOR_DELAY_NORMAL (200ms) and then
 * only emits once the azimuth has moved ~2°, so the needle arrives late and in
 * visible steps. DeviceMotion instead reads the platform's *fused* orientation
 * (iOS CMDeviceMotion attitude, Android TYPE_ROTATION_VECTOR — both gyro
 * assisted) as fast as the display can show it.
 */
const MOTION_INTERVAL_MS = 16;
/** React state derived from the sensor refreshes at most 2x/sec. */
const UI_TICK_MS = 500;

/**
 * One Euro filter constants, in degrees.
 *
 * `minCutoff` sets the calm at rest: 0.6Hz is a ~0.27s time constant, which
 * swallows the degree or so of magnetometer shiver without being slow enough to
 * feel like the needle is catching up. `beta` reopens it with speed — a brisk
 * 120°/s turn lands near a 10Hz cutoff, i.e. roughly half the remaining error
 * closed every frame, which reads as 1:1. `derivativeCutoff` is deliberately
 * above 1Hz so the filter notices a turn starting rather than easing into it.
 */
const HEADING_MIN_CUTOFF = 0.6;
const HEADING_BETA = 0.08;
const HEADING_DERIVATIVE_CUTOFF = 1.5;

/** How firmly each OS compass reading pulls the learned north offset. */
const NORTH_TRACKING_ALPHA = 0.12;
/** Above this turn rate the two sources are too far out of step to compare. */
const NORTH_SETTLED_DEG_PER_S = 15;

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
/** Nothing from either sensor inside this window means there is no compass. */
const HEADING_WATCHDOG_MS = 3000;
/** A last-known fix older than this is a starting point, never the answer. */
const LAST_KNOWN_MAX_AGE_MS = 10 * 60 * 1000;
/** Only pay for reverse geocoding again once the user has actually moved. */
const REGEOCODE_DISTANCE_KM = 5;

const RADIANS_TO_DEGREES = 180 / Math.PI;

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
 * Fused device yaw → compass heading in degrees.
 *
 * `rotation.alpha` is yaw in radians and it runs *counter* to a compass on both
 * platforms, so the same negation serves each:
 *  • iOS forwards CMDeviceMotion `attitude.yaw`, a right-handed rotation about
 *    the upward vertical — turning left (heading falling) makes yaw rise.
 *  • Android negates `SensorManager.getOrientation()`'s azimuth before it
 *    reaches JS, so alpha is likewise the negative of the heading.
 *
 * The zero point differs per platform (and on iOS is not even guaranteed to be
 * magnetic north — CoreMotion falls back to an arbitrary reference frame when
 * magnetic data is unavailable). None of that is hardcoded here: the remaining
 * offset is learned at runtime by `northReference`.
 */
function yawToHeading(alpha: number): number {
  return normaliseDegrees(-alpha * RADIANS_TO_DEGREES);
}

/**
 * Drives the Qibla screen: acquires a position (cache first, then progressively
 * better fixes), subscribes to the device compass, and exposes the heading as a
 * single `Animated.Value` that callers hand straight to the native driver.
 *
 * The returned `headingAnim` carries a *continuous* angle — it keeps counting
 * past 360° rather than wrapping — so any rotation interpolated from it always
 * takes the short way round. Nothing on the sensor path touches React state;
 * the value is pushed straight into the native animation graph at sensor rate,
 * and everything a human actually reads is derived on a slow timer instead.
 */
export function useQiblaCompass() {
  const headingAnim = useRef(new Animated.Value(0)).current;

  const [location, setLocation] = useState<QiblaLocationState>({ phase: "locating" });
  const [reading, setReading] = useState<QiblaReading>(INITIAL_READING);

  // Mirrors of the two state objects, so the sensor path and the slow tick can
  // read the latest values without re-creating callbacks or forcing renders.
  const locationRef = useRef<QiblaLocationState>({ phase: "locating" });
  const readingRef = useRef<QiblaReading>(INITIAL_READING);

  const motionSub = useRef<{ remove: () => void } | null>(null);
  const headingSub = useRef<Location.LocationSubscription | null>(null);
  const watchdog = useRef<ReturnType<typeof setTimeout> | null>(null);
  /**
   * Lets `acquire` restart the sensors once permission lands, without the
   * callbacks having to depend on each other.
   */
  const startSensorsRef = useRef<() => void>(() => {});

  // ── Motion pipeline state ──
  const unwrapper = useRef(createAngleUnwrapper()).current;
  const smoother = useRef(
    createOneEuroFilter({
      minCutoff: HEADING_MIN_CUTOFF,
      beta: HEADING_BETA,
      derivativeCutoff: HEADING_DERIVATIVE_CUTOFF,
    })
  ).current;
  const northReference = useRef(createNorthReference(NORTH_TRACKING_ALPHA)).current;

  /** Filtered continuous heading before the north offset, or null before data. */
  const fusedContinuous = useRef<number | null>(null);
  /** Wrapped, north-corrected heading — what all the UI logic reasons about. */
  const displayHeading = useRef<number | null>(null);
  /** True once the fused sensor has delivered a usable sample. */
  const motionAlive = useRef(false);
  /** True once the OS compass has delivered a usable sample. */
  const compassAlive = useRef(false);
  const sensorFailed = useRef(false);

  const headingAccuracy = useRef(UNKNOWN_HEADING_ACCURACY);
  const isTrueNorth = useRef(true);
  const alignedRef = useRef(false);
  const lastHapticAt = useRef(0);
  /** Bumped on every new acquisition so stale async results are discarded. */
  const generation = useRef(0);
  /** Set by the sensor path when alignment flips, read by the slow tick. */
  const deriveNowRef = useRef<() => void>(() => {});

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
    startSensorsRef.current();

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

  /**
   * The hot path. Runs at sensor rate and must never touch React state: it
   * unwraps, filters, and pushes the result straight into the native animation
   * value. `setValue` is used rather than `Animated.timing` on purpose —
   * starting a fresh timing animation every frame queues overlapping easings
   * that fight each other, which is itself a source of stutter. Smoothing is
   * the filter's job, not the animation's.
   */
  const pushFusedHeading = useCallback(
    (rawHeading: number, atMs: number) => {
      const continuous = smoother.filter(unwrapper.unwrap(rawHeading), atMs);
      fusedContinuous.current = continuous;

      const offset = northReference.offset();
      if (offset === null) return; // Nothing honest to draw until north is known.

      headingAnim.setValue(continuous + offset);
      const heading = normaliseDegrees(continuous + offset);
      displayHeading.current = heading;

      // Alignment is judged here rather than on the slow tick so the haptic
      // lands the instant the user crosses the line. Only the *transition*
      // escapes to React, which the hysteresis keeps rare.
      const bearing = locationRef.current.bearing;
      if (bearing == null) return;
      const gate = alignedRef.current ? ALIGN_EXIT_DEG : ALIGN_ENTER_DEG;
      const next = Math.abs(shortestDelta(heading, bearing)) <= gate;
      if (next === alignedRef.current) return;

      alignedRef.current = next;
      if (next) {
        const now = Date.now();
        if (now - lastHapticAt.current > ALIGN_HAPTIC_COOLDOWN_MS) {
          lastHapticAt.current = now;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        }
      }
      deriveNowRef.current();
    },
    [headingAnim, northReference, smoother, unwrapper]
  );

  const onMotion = useCallback(
    (event: DeviceMotionMeasurement) => {
      const alpha = event.rotation?.alpha;
      if (typeof alpha !== "number" || !Number.isFinite(alpha)) return;

      if (!motionAlive.current) {
        motionAlive.current = true;
        sensorFailed.current = false;
        // The OS compass may have been driving the dial until now; make the
        // next reading re-learn the offset against this sensor instead.
        northReference.relock();
      }
      pushFusedHeading(yawToHeading(alpha), Date.now());
    },
    [northReference, pushFusedHeading]
  );

  /**
   * The OS compass. Slow and quantised, so it is never the animation driver —
   * it exists to tell the smooth-but-relative fused sensor where true north is.
   */
  const onCompass = useCallback(
    (event: Location.LocationHeadingObject) => {
      const absolute = resolveHeading(event);
      if (absolute === null) return;

      compassAlive.current = true;
      sensorFailed.current = false;
      headingAccuracy.current = event.accuracy;
      isTrueNorth.current = event.trueHeading >= 0;

      if (!motionAlive.current) {
        // No fused sensor on this device. Fall back to driving the dial from
        // this source: already absolute, so the offset is exactly zero. The
        // filter still smooths what little we get.
        northReference.lockTo(0);
        pushFusedHeading(absolute, Date.now());
        return;
      }

      const fused = fusedContinuous.current;
      if (fused === null) return;
      northReference.observe(
        normaliseDegrees(fused),
        absolute,
        Math.abs(smoother.speed()) < NORTH_SETTLED_DEG_PER_S
      );
    },
    [northReference, pushFusedHeading, smoother]
  );

  const stopSensors = useCallback(() => {
    if (watchdog.current) {
      clearTimeout(watchdog.current);
      watchdog.current = null;
    }
    motionSub.current?.remove();
    motionSub.current = null;
    headingSub.current?.remove();
    headingSub.current = null;
    // A stale speed estimate would otherwise make the first sample after a
    // resume look like a violent turn and blow the filter wide open.
    smoother.reset();
  }, [smoother]);

  const startSensors = useCallback(async () => {
    if (Platform.OS === "web") {
      sensorFailed.current = true;
      return;
    }
    // Give the sensors a clean slate: a previous attempt may have failed only
    // because permission hadn't been granted yet.
    if (!motionAlive.current && !compassAlive.current) sensorFailed.current = false;
    if (watchdog.current) clearTimeout(watchdog.current);
    watchdog.current = setTimeout(() => {
      // Silence past this point means no usable compass hardware — a tablet,
      // an emulator, or a device with neither magnetometer nor gyroscope.
      if (!motionAlive.current && !compassAlive.current) sensorFailed.current = true;
    }, HEADING_WATCHDOG_MS);

    if (!motionSub.current) {
      try {
        if (await DeviceMotion.isAvailableAsync()) {
          DeviceMotion.setUpdateInterval(MOTION_INTERVAL_MS);
          motionSub.current = DeviceMotion.addListener(onMotion);
        }
      } catch {
        motionSub.current = null;
      }
    }

    if (!headingSub.current) {
      try {
        headingSub.current = await Location.watchHeadingAsync(onCompass, () => {
          compassAlive.current = false;
        });
      } catch {
        headingSub.current = null;
      }
    }
  }, [onCompass, onMotion]);

  useEffect(() => {
    startSensorsRef.current = () => {
      void startSensors();
    };
  }, [startSensors]);

  // ── Throttled derivation of everything React needs to render ───────────────

  const deriveReading = useCallback(() => {
    const heading = displayHeading.current;
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
    const aligned = status === "live" && alignedRef.current;

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

  useEffect(() => {
    deriveNowRef.current = deriveReading;
  }, [deriveReading]);

  const retry = useCallback(() => {
    // Refreshing an already-working dial must not blank it — only fall back to
    // the locating state when there is genuinely nothing to show.
    updateLocation((prev) =>
      prev.bearing == null ? { phase: "locating" } : { ...prev, phase: "ready" }
    );
    void acquire();
    void startSensors();
  }, [acquire, startSensors, updateLocation]);

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
      void startSensors();

      // If the user left to grant permission in Settings, pick it up on return.
      const phase = locationRef.current.phase;
      if (phase === "denied" || phase === "unavailable") void acquire();

      const tick = setInterval(deriveReading, UI_TICK_MS);

      // The tab can stay focused while the app is backgrounded; the compass is
      // the most power-hungry screen in the app, so drop the sensors too.
      const appState = AppState.addEventListener("change", (next) => {
        if (next === "active") void startSensors();
        else stopSensors();
      });

      return () => {
        clearInterval(tick);
        appState.remove();
        stopSensors();
      };
    }, [acquire, deriveReading, startSensors, stopSensors])
  );

  return { headingAnim, location, reading, retry };
}
