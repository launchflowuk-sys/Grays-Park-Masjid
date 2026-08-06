/**
 * Self-contained tabular Hijri (Islamic civil) calendar converter.
 *
 * Pure arithmetic — no Intl.DateTimeFormat, so it is safe on Hermes/Android
 * where Intl calendar support is limited. Uses the arithmetic 30-year cycle
 * calendar (Kuwaiti algorithm, civil epoch 16 July 622 CE).
 *
 * The tabular calendar can differ from local moon sighting by ±1 day.
 * Adjust HIJRI_DAY_OFFSET if the Masjid announces a different date
 * (e.g. +1 or -1).
 */

/** Day adjustment for local moon-sighting differences (whole days). */
export const HIJRI_DAY_OFFSET = 0;

export const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  "Jumada al-Awwal",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhul-Qa'dah",
  "Dhul-Hijjah",
] as const;

export const RAMADAN_MONTH = 9;

export type HijriDate = {
  day: number;
  /** 1-based month (1 = Muharram … 9 = Ramadan … 12 = Dhul-Hijjah) */
  month: number;
  monthName: string;
  year: number;
};

/** Julian Day Number of 1 Muharram 1 AH (civil epoch, 16 July 622 CE). */
const ISLAMIC_EPOCH_JDN = 1948440;
const DAYS_PER_30_YEAR_CYCLE = 10631;

/** Gregorian calendar date → Julian Day Number (month is 1-based). */
function gregorianToJdn(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/** Convert a local Gregorian date to its tabular Hijri equivalent. */
export function getHijriDate(date: Date = new Date()): HijriDate {
  const jdn =
    gregorianToJdn(date.getFullYear(), date.getMonth() + 1, date.getDate()) +
    HIJRI_DAY_OFFSET;

  let l = jdn - ISLAMIC_EPOCH_JDN + 10632;
  const n = Math.floor((l - 1) / DAYS_PER_30_YEAR_CYCLE);
  l = l - DAYS_PER_30_YEAR_CYCLE * n + 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const month = Math.floor((24 * l) / 709);
  const day = l - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  return { day, month, monthName: HIJRI_MONTHS[month - 1], year };
}

/** e.g. "15 Safar 1448 AH" */
export function formatHijriDate(date: Date = new Date()): string {
  const h = getHijriDate(date);
  return `${h.day} ${h.monthName} ${h.year} AH`;
}

/** True when the given (local) date falls in Ramadan. */
export function isRamadan(date: Date = new Date()): boolean {
  return getHijriDate(date).month === RAMADAN_MONTH;
}
