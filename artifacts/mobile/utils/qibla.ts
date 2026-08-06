/**
 * Qibla geometry.
 *
 * Everything here is pure and side-effect free so the maths can be reasoned
 * about (and checked against published Qibla bearings) independently of the
 * sensor plumbing in `hooks/useQiblaCompass`.
 */

/** Geographic centre of the Ka'bah, Masjid al-Haram, Makkah. */
export const KAABA_LAT = 21.4225;
export const KAABA_LNG = 39.8262;

/** Mean Earth radius, the usual value for great-circle work. */
const EARTH_RADIUS_KM = 6371;
const KM_PER_MILE = 1.609344;

/** 16-point rose: each name covers a 22.5° sector centred on its own bearing. */
const COMPASS_POINTS = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSW",
  "SW",
  "WSW",
  "W",
  "WNW",
  "NW",
  "NNW",
] as const;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;
const toDegrees = (radians: number): number => (radians * 180) / Math.PI;

/** Wraps any angle into [0, 360). */
export function normaliseDegrees(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

/**
 * Signed shortest rotation from `from` to `to`, in [-180, 180).
 *
 * Positive means clockwise. This is what keeps the needle from spinning the
 * long way round at the 359° → 0° seam: callers accumulate these deltas into a
 * continuous angle rather than animating between wrapped values.
 */
export function shortestDelta(from: number, to: number): number {
  return normaliseDegrees(to - from + 180) - 180;
}

/**
 * Initial great-circle bearing from a position to the Ka'bah, in degrees
 * clockwise from true north.
 *
 * This is the standard forward-azimuth formula, and it is the definition of
 * the Qibla used by every reputable calculator — not the rhumb line, which
 * would be noticeably wrong at high latitudes.
 */
export function qiblaBearing(lat: number, lng: number): number {
  const deltaLng = toRadians(KAABA_LNG - lng);
  const fromLat = toRadians(lat);
  const kaabaLat = toRadians(KAABA_LAT);
  const y = Math.sin(deltaLng) * Math.cos(kaabaLat);
  const x =
    Math.cos(fromLat) * Math.sin(kaabaLat) -
    Math.sin(fromLat) * Math.cos(kaabaLat) * Math.cos(deltaLng);
  return normaliseDegrees(toDegrees(Math.atan2(y, x)));
}

/** Great-circle (haversine) distance between two positions, in kilometres. */
export function distanceBetweenKm(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): number {
  const deltaLat = toRadians(toLat - fromLat);
  const deltaLng = toRadians(toLng - fromLng);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(deltaLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Great-circle distance from a position to the Ka'bah, in kilometres. */
export function distanceToKaabaKm(lat: number, lng: number): number {
  return distanceBetweenKm(lat, lng, KAABA_LAT, KAABA_LNG);
}

export function kmToMiles(km: number): number {
  return km / KM_PER_MILE;
}

/** Nearest 16-point compass name for a bearing, e.g. 119° → "ESE". */
export function bearingToCardinal(bearing: number): string {
  const index = Math.round(normaliseDegrees(bearing) / 22.5) % COMPASS_POINTS.length;
  return COMPASS_POINTS[index];
}

/** Thousands-separated whole number, e.g. 4764 → "4,764". */
export function formatWhole(value: number): string {
  return Math.round(value).toLocaleString("en-GB");
}
