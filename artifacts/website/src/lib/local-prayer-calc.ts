import { Coordinates, CalculationMethod, PrayerTimes, Madhab, HighLatitudeRule } from "adhan";

export type LocalPrayerTimesResult = {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  locationLabel: string;
  timezone: string;
};

export type LocalNextPrayer = {
  key: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
  label: string;
  time: string;
  countdownMs: number;
  isTomorrow: boolean;
};

const LOCAL_PRAYER_KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
const LABELS: Record<string, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

function formatInTz(date: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const h = parts.find((p) => p.type === "hour")?.value ?? "00";
  const m = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${h === "24" ? "00" : h}:${m}`;
}

function cityFromTimezone(tz: string): string {
  return (tz.split("/").pop() ?? tz).replace(/_/g, " ");
}

/** Calculate today's prayer times for any coordinates using the same
 *  Hanafi + MoonsightingCommittee method as Grays Park Masjid. */
export function calcLocalPrayerTimes(
  latitude: number,
  longitude: number,
): LocalPrayerTimesResult {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const coordinates = new Coordinates(latitude, longitude);
  const params = CalculationMethod.MoonsightingCommittee();
  params.madhab = Madhab.Hanafi;
  params.highLatitudeRule = HighLatitudeRule.SeventhOfTheNight;

  const now = new Date();
  const calcDate = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0),
  );

  const times = new PrayerTimes(coordinates, calcDate, params);

  return {
    fajr: formatInTz(times.fajr, tz),
    sunrise: formatInTz(times.sunrise, tz),
    dhuhr: formatInTz(times.dhuhr, tz),
    asr: formatInTz(times.asr, tz),
    maghrib: formatInTz(times.maghrib, tz),
    isha: formatInTz(times.isha, tz),
    locationLabel: cityFromTimezone(tz),
    timezone: tz,
  };
}

/** Given local prayer times (HH:MM strings in the user's timezone) and the
 *  current local time, find which prayer is next and compute the countdown. */
export function computeLocalNext(
  times: LocalPrayerTimesResult,
  now: Date,
): LocalNextPrayer {
  const nowMins =
    now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  for (const key of LOCAL_PRAYER_KEYS) {
    const time = times[key];
    const [h, m] = time.split(":").map(Number);
    const prayerMins = h * 60 + m;
    if (prayerMins > nowMins) {
      return {
        key,
        label: LABELS[key],
        time,
        countdownMs: Math.max(0, (prayerMins - nowMins) * 60_000),
        isTomorrow: false,
      };
    }
  }

  // All prayers have passed — next is Fajr tomorrow
  const [fh, fm] = times.fajr.split(":").map(Number);
  const fajrMins = fh * 60 + fm;
  return {
    key: "fajr",
    label: "Fajr",
    time: times.fajr,
    countdownMs: Math.max(0, (24 * 60 - nowMins + fajrMins) * 60_000),
    isTomorrow: true,
  };
}
