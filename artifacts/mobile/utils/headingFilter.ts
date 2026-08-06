/**
 * Heading smoothing.
 *
 * Everything here is pure and side-effect free so the motion maths can be
 * reasoned about independently of the sensor plumbing in
 * `hooks/useQiblaCompass`.
 *
 * A compass needle has two failure modes that pull in opposite directions:
 * smooth it enough to kill sensor jitter and it visibly lags a fast turn; make
 * it responsive enough to track a fast turn and it shivers when the phone is
 * held still. A single fixed smoothing factor cannot win — it can only pick
 * which of the two to fail at.
 *
 * The answer is an *adaptive* low-pass: the One Euro filter (Casiez, Roussel &
 * Vogel, CHI 2012), which raises its own cutoff frequency in proportion to how
 * fast the signal is currently moving. Phone still → low cutoff → heavy
 * smoothing → no shiver. Phone turning → high cutoff → effectively 1:1 → no
 * lag. Because the cutoff moves continuously there is no threshold to cross
 * and so no visible change of behaviour mid-turn.
 */

import { normaliseDegrees, shortestDelta } from "@/utils/qibla";

/**
 * Sampling gaps are clamped before they reach the filter. A gap far outside
 * this band means the sensor stalled or the app was suspended, and feeding the
 * real value would make the derivative term meaningless.
 */
const MIN_DELTA_S = 0.001;
const MAX_DELTA_S = 0.25;

/**
 * Exponential smoothing factor for a given cutoff frequency and time step —
 * the standard first-order low-pass discretisation.
 */
function smoothingFactor(deltaSeconds: number, cutoffHz: number): number {
  const tau = 1 / (2 * Math.PI * cutoffHz);
  return 1 / (1 + tau / deltaSeconds);
}

export interface OneEuroOptions {
  /**
   * Cutoff in Hz used when the signal is stationary. Lower means calmer at
   * rest and slower to settle.
   */
  minCutoff: number;
  /**
   * How aggressively the cutoff opens up with speed, in Hz per unit/second.
   * Higher means it tracks fast movement more literally.
   */
  beta: number;
  /** Cutoff in Hz for the internal speed estimate that drives `beta`. */
  derivativeCutoff: number;
}

export interface OneEuroFilter {
  /** Feeds a sample taken at `atMs` and returns the filtered value. */
  filter(value: number, atMs: number): number;
  /** Smoothed rate of change, in units per second. */
  speed(): number;
  /** Drops the filter's history without moving the reported value. */
  reset(): void;
}

/**
 * A One Euro filter over an ordinary (non-circular) signal.
 *
 * Callers working with angles must unwrap them first — see
 * `createAngleUnwrapper`.
 */
export function createOneEuroFilter({
  minCutoff,
  beta,
  derivativeCutoff,
}: OneEuroOptions): OneEuroFilter {
  let lastRaw: number | null = null;
  let lastFiltered = 0;
  let lastSpeed = 0;
  let lastAtMs = 0;

  return {
    filter(value, atMs) {
      if (lastRaw === null) {
        lastRaw = value;
        lastFiltered = value;
        lastSpeed = 0;
        lastAtMs = atMs;
        return value;
      }

      const gap = (atMs - lastAtMs) / 1000;
      const deltaSeconds = Math.min(Math.max(gap, MIN_DELTA_S), MAX_DELTA_S);
      lastAtMs = atMs;

      // Speed drives the cutoff, so it gets its own (fixed, gentle) low-pass —
      // a raw difference would be far too noisy to steer the filter with.
      const rawSpeed = (value - lastRaw) / deltaSeconds;
      lastRaw = value;
      lastSpeed += smoothingFactor(deltaSeconds, derivativeCutoff) * (rawSpeed - lastSpeed);

      const cutoff = minCutoff + beta * Math.abs(lastSpeed);
      lastFiltered += smoothingFactor(deltaSeconds, cutoff) * (value - lastFiltered);
      return lastFiltered;
    },

    speed() {
      return lastSpeed;
    },

    reset() {
      lastRaw = null;
      lastSpeed = 0;
    },
  };
}

export interface AngleUnwrapper {
  /** Maps a wrapped angle in [0, 360) onto a continuous, ever-accumulating one. */
  unwrap(degrees: number): number;
}

/**
 * Converts a wrapped compass angle into a continuous one.
 *
 * This is the step that makes the 0°/360° seam a non-issue. Interpolating
 * between wrapped angles is what makes a needle whip the long way round when it
 * crosses north: 359 → 1 is a 2° turn in reality but a -358° journey to any
 * filter that just sees the numbers. Accumulating *shortest* deltas instead
 * produces a signal that simply keeps counting (…358, 359, 360, 361…), and
 * once it does, every ordinary linear filter and interpolation works on it
 * unchanged.
 *
 * `continuous` modulo 360 is always the most recent input, so the unwrapper
 * re-anchors itself for free after a gap in the samples — a compass that stops
 * and restarts never jumps.
 */
export function createAngleUnwrapper(): AngleUnwrapper {
  let continuous: number | null = null;

  return {
    unwrap(degrees) {
      if (continuous === null) {
        continuous = degrees;
        return continuous;
      }
      continuous += shortestDelta(normaliseDegrees(continuous), degrees);
      return continuous;
    },
  };
}

export interface NorthReference {
  /** Degrees to add to the fused heading to get north, or null before lock. */
  offset(): number | null;
  /**
   * Folds in an absolute heading from the OS compass. `settled` should be
   * false while the device is turning.
   */
  observe(fusedHeading: number, absoluteHeading: number, settled: boolean): void;
  /** Forces the next observation to be taken as-is rather than eased into. */
  relock(): void;
  /** Locks the offset to an exact value, for the no-fused-sensor fallback. */
  lockTo(value: number): void;
}

/**
 * Tracks the constant angle between the fused orientation sensor and true
 * north — the low-frequency half of a complementary filter.
 *
 * The fused sensor gives beautifully smooth *relative* motion but its zero is
 * not true north: it is magnetic north on both platforms, and on iOS it can
 * degrade to an entirely arbitrary reference when magnetic data is
 * unavailable. The OS compass is the reverse — absolute and declination
 * corrected, but slow and quantised.
 *
 * Averaging the difference between the two over time takes the best of each:
 * short-term smoothness from the fused sensor, long-term truth from the OS.
 * Nothing platform-specific is hardcoded because the offset is *learned*,
 * which also means it self-corrects gyro drift and iOS's arbitrary frame.
 *
 * Observations are only folded in while the device is settled: during a turn
 * the two sources are sampled at different instants, so their difference is
 * contaminated by the turn itself rather than describing the true offset.
 */
export function createNorthReference(trackingAlpha: number): NorthReference {
  let offset: number | null = null;
  let relocking = false;

  return {
    offset() {
      return offset;
    },

    observe(fusedHeading, absoluteHeading, settled) {
      const target = shortestDelta(fusedHeading, absoluteHeading);
      if (offset === null || relocking) {
        offset = target;
        relocking = false;
        return;
      }
      if (!settled) return;
      // Stepped in circular space, so the correction never takes the long way.
      offset = shortestDelta(0, offset + shortestDelta(offset, target) * trackingAlpha);
    },

    relock() {
      relocking = true;
    },

    lockTo(value) {
      offset = value;
      relocking = false;
    },
  };
}
