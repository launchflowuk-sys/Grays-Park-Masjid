import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import { formatHijriDate } from "@/utils/hijri";
import { getTodayDateString } from "@/utils/prayerUtils";

/**
 * Shared prayer-time payload for the ANDROID home-screen widget.
 *
 * The payload is written to AsyncStorage; the headless widget task handler
 * reads it on every widget update (Android widgets cannot fetch on their own).
 *
 * iOS is NOT handled here. The iOS widget extension fetches
 * `https://graysparkmasjid.org.uk/api/prayer-times` directly in Swift and
 * caches the result inside its own sandbox — there is no App Group, no shared
 * UserDefaults and no App Group entitlement anywhere in this project.
 */

/** AsyncStorage key holding the rendered-from payload. */
export const WIDGET_STORAGE_KEY = "prayerTimes";
/** Must match the `name` in the react-native-android-widget plugin config. */
export const ANDROID_WIDGET_NAME = "PrayerTimes";

const MAX_DAYS = 35;
const PAYLOAD_VERSION = 1;
const MASJID_NAME = "Grays Park Masjid";

/** The five obligatory prayers, in order, as `[label, adhanKey, iqamahKey]`. */
const PRAYER_FIELDS = [
  ["Fajr", "fajrAdhan", "fajrIqamah"],
  ["Dhuhr", "dhuhrAdhan", "dhuhrIqamah"],
  ["Asr", "asrAdhan", "asrIqamah"],
  ["Maghrib", "maghribAdhan", "maghribIqamah"],
  ["Isha", "ishaAdhan", "ishaIqamah"],
] as const;

/** Structural subset of the app's `PrayerTime` record. */
export interface WidgetPrayerTimeInput {
  date: string;
  fajrAdhan: string;
  fajrIqamah?: string;
  sunrise?: string;
  dhuhrAdhan: string;
  dhuhrIqamah?: string;
  asrAdhan: string;
  asrIqamah?: string;
  maghribAdhan: string;
  maghribIqamah?: string;
  ishaAdhan: string;
  ishaIqamah?: string;
}

export interface WidgetPrayer {
  /** Prayer name, e.g. "Fajr" */
  n: string;
  /** Adhan time, "HH:mm" (24h) */
  a: string;
  /** Iqamah time, "HH:mm" (24h) — omitted when the masjid has not set one */
  i?: string;
}

export interface WidgetDay {
  /** Local calendar date, "yyyy-MM-dd" */
  d: string;
  /** Precomputed Hijri string, e.g. "22 Safar 1448 AH" */
  h: string;
  /** Sunrise, "HH:mm" (24h) */
  sr?: string;
  /** Always the five obligatory prayers, in order */
  p: WidgetPrayer[];
}

export interface WidgetPayload {
  v: number;
  /** Epoch seconds the payload was generated. */
  updated: number;
  masjid: string;
  days: WidgetDay[];
}

/** Last payload we actually wrote, minus `updated` — used to avoid churn. */
let lastWrittenSignature: string | null = null;

function isValidTime(value: unknown): value is string {
  return typeof value === "string" && /^\d{1,2}:\d{2}/.test(value);
}

function toWidgetDay(entry: WidgetPrayerTimeInput): WidgetDay | null {
  if (!entry?.date) return null;

  const prayers: WidgetPrayer[] = [];
  for (const [name, adhanKey, iqamahKey] of PRAYER_FIELDS) {
    const adhan = entry[adhanKey];
    if (!isValidTime(adhan)) continue;
    const iqamah = entry[iqamahKey];
    prayers.push(
      isValidTime(iqamah) ? { n: name, a: adhan, i: iqamah } : { n: name, a: adhan },
    );
  }
  if (!prayers.length) return null;

  // Midday avoids DST edges when converting the date string to a Date.
  const hijri = formatHijriDate(new Date(`${entry.date}T12:00:00`));

  const day: WidgetDay = { d: entry.date, h: hijri, p: prayers };
  if (isValidTime(entry.sunrise)) day.sr = entry.sunrise;
  return day;
}

/** Build the compact widget payload from the app's prayer-time records. */
export function buildWidgetPayload(
  times: readonly WidgetPrayerTimeInput[],
): WidgetPayload {
  const today = getTodayDateString();

  const days = times
    .filter((entry) => typeof entry?.date === "string" && entry.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, MAX_DAYS)
    .map(toWidgetDay)
    .filter((day): day is WidgetDay => day !== null);

  return {
    v: PAYLOAD_VERSION,
    updated: Math.floor(Date.now() / 1000),
    masjid: MASJID_NAME,
    days,
  };
}

/** Everything except the timestamp — same signature means nothing to do. */
function signatureOf(payload: WidgetPayload): string {
  return JSON.stringify({ v: payload.v, days: payload.days });
}

async function refreshAndroidWidget(): Promise<void> {
  try {
    const [{ requestWidgetUpdate }, { renderPrayerWidget }] = await Promise.all([
      import("react-native-android-widget"),
      import("@/widgets/PrayerTimesWidget"),
    ]);
    await requestWidgetUpdate({
      widgetName: ANDROID_WIDGET_NAME,
      renderWidget: (info) => renderPrayerWidget(info),
    });
  } catch {
    // No widget on the home screen, or the native module is unavailable.
  }
}

/**
 * Publish prayer times to the Android home-screen widget.
 *
 * Safe to call on every data load — it no-ops on web and iOS (the iOS widget
 * fetches for itself) and skips all work when the payload has not changed.
 */
export async function syncWidgetData(
  times: readonly WidgetPrayerTimeInput[] | undefined | null,
): Promise<void> {
  if (Platform.OS !== "android") return;
  if (!times?.length) return;

  const payload = buildWidgetPayload(times);
  if (!payload.days.length) return;

  const signature = signatureOf(payload);
  if (signature === lastWrittenSignature) return;

  // Survives app restarts so a cold launch does not rewrite identical data.
  if (lastWrittenSignature === null) {
    try {
      const cached = await AsyncStorage.getItem(WIDGET_STORAGE_KEY);
      if (cached) {
        const previous = JSON.parse(cached) as WidgetPayload;
        if (signatureOf(previous) === signature) {
          lastWrittenSignature = signature;
          return;
        }
      }
    } catch {
      // Corrupt or missing cache — fall through and rewrite.
    }
  }

  lastWrittenSignature = signature;

  try {
    await AsyncStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Nothing to render from — bail out rather than drawing stale data.
    return;
  }

  await refreshAndroidWidget();
}

/** Read the payload the Android widget renders from. */
export async function readWidgetPayload(): Promise<WidgetPayload | null> {
  try {
    const cached = await AsyncStorage.getItem(WIDGET_STORAGE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached) as WidgetPayload;
    return Array.isArray(parsed?.days) ? parsed : null;
  } catch {
    return null;
  }
}
