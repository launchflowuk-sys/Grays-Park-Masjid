import {
  CalculationMethod,
  Coordinates,
  HighLatitudeRule,
  Madhab,
  PrayerTimes,
} from "adhan";

export const CALCULATION_METHODS = [
  "MuslimWorldLeague",
  "Egyptian",
  "Karachi",
  "UmmAlQura",
  "Dubai",
  "MoonsightingCommittee",
  "NorthAmerica",
  "Kuwait",
  "Qatar",
  "Singapore",
  "Tehran",
  "Turkey",
  "Other",
] as const;
export type CalculationMethodKey = (typeof CALCULATION_METHODS)[number];

export const MADHABS = ["shafi", "hanafi"] as const;
export type MadhabKey = (typeof MADHABS)[number];

export const HIGH_LATITUDE_RULES = [
  "middleofthenight",
  "seventhofthenight",
  "twilightangle",
] as const;
export type HighLatitudeRuleKey = (typeof HIGH_LATITUDE_RULES)[number];

export interface PrayerCalcSettings {
  latitude: number;
  longitude: number;
  timezone: string;
  calculationMethod: CalculationMethodKey;
  madhab: MadhabKey;
  highLatitudeRule: HighLatitudeRuleKey;
  fajrAdjustment: number;
  sunriseAdjustment: number;
  dhuhrAdjustment: number;
  asrAdjustment: number;
  maghribAdjustment: number;
  ishaAdjustment: number;
  fajrIqamahOffset: number;
  dhuhrIqamahOffset: number;
  asrIqamahOffset: number;
  maghribIqamahOffset: number;
  ishaIqamahOffset: number;
  iqamahRoundingMinutes: number;
}

export interface CalculatedDayTimes {
  date: string;
  fajrAdhan: string;
  fajrIqamah: string;
  sunrise: string;
  dhuhrAdhan: string;
  dhuhrIqamah: string;
  asrAdhan: string;
  asrIqamah: string;
  maghribAdhan: string;
  maghribIqamah: string;
  ishaAdhan: string;
  ishaIqamah: string;
}

function formatInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${hour === "24" ? "00" : hour}:${minute}`;
}

function addMinutesToHHMM(hhmm: string, minutesToAdd: number, roundingMinutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  let total = h * 60 + m + minutesToAdd;
  if (roundingMinutes > 0) {
    total = Math.ceil(total / roundingMinutes) * roundingMinutes;
  }
  total = ((total % 1440) + 1440) % 1440;
  const hh = Math.floor(total / 60).toString().padStart(2, "0");
  const mm = (total % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * Computes accurate adhan and derived iqamah times for a single calendar date,
 * using the `adhan` astronomical calculation library. The date is anchored at
 * noon UTC before calculation so that DST transitions in the target timezone
 * are resolved purely by `Intl.DateTimeFormat` when formatting the result,
 * never by the calculation itself.
 */
export function calculateDayTimes(dateIso: string, settings: PrayerCalcSettings): CalculatedDayTimes {
  const coordinates = new Coordinates(settings.latitude, settings.longitude);
  const params = CalculationMethod[settings.calculationMethod]();
  params.madhab = Madhab[settings.madhab === "hanafi" ? "Hanafi" : "Shafi"];
  params.highLatitudeRule =
    settings.highLatitudeRule === "middleofthenight"
      ? HighLatitudeRule.MiddleOfTheNight
      : settings.highLatitudeRule === "twilightangle"
        ? HighLatitudeRule.TwilightAngle
        : HighLatitudeRule.SeventhOfTheNight;
  params.adjustments = {
    fajr: settings.fajrAdjustment,
    sunrise: settings.sunriseAdjustment,
    dhuhr: settings.dhuhrAdjustment,
    asr: settings.asrAdjustment,
    maghrib: settings.maghribAdjustment,
    isha: settings.ishaAdjustment,
  };

  const [y, mo, d] = dateIso.split("-").map(Number);
  const date = new Date(Date.UTC(y, mo - 1, d, 12, 0, 0));

  const times = new PrayerTimes(coordinates, date, params);

  const fajrAdhan = formatInTimeZone(times.fajr, settings.timezone);
  const sunrise = formatInTimeZone(times.sunrise, settings.timezone);
  const dhuhrAdhan = formatInTimeZone(times.dhuhr, settings.timezone);
  const asrAdhan = formatInTimeZone(times.asr, settings.timezone);
  const maghribAdhan = formatInTimeZone(times.maghrib, settings.timezone);
  const ishaAdhan = formatInTimeZone(times.isha, settings.timezone);

  return {
    date: dateIso,
    fajrAdhan,
    fajrIqamah: addMinutesToHHMM(fajrAdhan, settings.fajrIqamahOffset, settings.iqamahRoundingMinutes),
    sunrise,
    dhuhrAdhan,
    dhuhrIqamah: addMinutesToHHMM(dhuhrAdhan, settings.dhuhrIqamahOffset, settings.iqamahRoundingMinutes),
    asrAdhan,
    asrIqamah: addMinutesToHHMM(asrAdhan, settings.asrIqamahOffset, settings.iqamahRoundingMinutes),
    maghribAdhan,
    maghribIqamah: addMinutesToHHMM(
      maghribAdhan,
      settings.maghribIqamahOffset,
      settings.iqamahRoundingMinutes,
    ),
    ishaAdhan,
    ishaIqamah: addMinutesToHHMM(ishaAdhan, settings.ishaIqamahOffset, settings.iqamahRoundingMinutes),
  };
}

export function enumerateDates(startIso: string, endIso: string): string[] {
  const dates: string[] = [];
  const [sy, sm, sd] = startIso.split("-").map(Number);
  const [ey, em, ed] = endIso.split("-").map(Number);
  const cursor = new Date(Date.UTC(sy, sm - 1, sd));
  const end = new Date(Date.UTC(ey, em - 1, ed));
  while (cursor.getTime() <= end.getTime()) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}
