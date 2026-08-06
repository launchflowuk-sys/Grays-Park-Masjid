import { formatTime12, getTodayDateString, timeToMinutes } from "@/utils/prayerUtils";
import type { WidgetDay, WidgetPayload } from "@/utils/widgetData";

/**
 * Platform-agnostic view model derived from the shared widget payload.
 * Used by the Android widget renderer; iOS derives the same thing in Swift.
 */
export interface PrayerWidgetRow {
  name: string;
  adhan: string;
  iqamah: string;
}

export interface PrayerWidgetViewModel {
  hasData: boolean;
  masjid: string;
  hijri: string;
  dateLabel: string;
  rows: PrayerWidgetRow[];
  /** Index into `rows` of the next prayer today, or -1 when it is tomorrow. */
  nextIndex: number;
  nextName: string;
  nextTime: string;
  nextIsTomorrow: boolean;
}

export const EMPTY_VIEW_MODEL: PrayerWidgetViewModel = {
  hasData: false,
  masjid: "Grays Park Masjid",
  hijri: "",
  dateLabel: "",
  rows: [],
  nextIndex: -1,
  nextName: "",
  nextTime: "",
  nextIsTomorrow: false,
};

function formatDayLabel(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function toRows(day: WidgetDay): PrayerWidgetRow[] {
  return day.p.map((prayer) => ({
    name: prayer.n,
    adhan: formatTime12(prayer.a),
    iqamah: prayer.i ? formatTime12(prayer.i) : "—",
  }));
}

/**
 * Build the view model for "now" from the shared payload.
 *
 * Android widgets refresh at most every 30 minutes, so this renders absolute
 * times rather than a countdown that would immediately go stale.
 */
export function buildViewModel(
  payload: WidgetPayload | null,
  now: Date = new Date(),
): PrayerWidgetViewModel {
  const days = payload?.days;
  if (!days?.length) return EMPTY_VIEW_MODEL;

  const todayKey = getTodayDateString();
  const todayIndex = Math.max(
    days.findIndex((day) => day.d >= todayKey),
    0,
  );
  const today = days[todayIndex];
  if (!today?.p?.length) return EMPTY_VIEW_MODEL;

  const rows = toRows(today);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const isToday = today.d === todayKey;

  let nextIndex = -1;
  if (isToday) {
    nextIndex = today.p.findIndex((prayer) => timeToMinutes(prayer.a) > nowMinutes);
  } else {
    // Payload starts in the future — the whole day is still ahead.
    nextIndex = 0;
  }

  if (nextIndex >= 0) {
    return {
      hasData: true,
      masjid: payload?.masjid ?? EMPTY_VIEW_MODEL.masjid,
      hijri: today.h ?? "",
      dateLabel: formatDayLabel(today.d),
      rows,
      nextIndex,
      nextName: today.p[nextIndex].n,
      nextTime: formatTime12(today.p[nextIndex].a),
      nextIsTomorrow: false,
    };
  }

  // Every prayer today has passed — point at tomorrow's first prayer.
  const tomorrow = days[todayIndex + 1];
  const upcoming = tomorrow?.p?.[0] ?? today.p[0];

  return {
    hasData: true,
    masjid: payload?.masjid ?? EMPTY_VIEW_MODEL.masjid,
    hijri: today.h ?? "",
    dateLabel: formatDayLabel(today.d),
    rows,
    nextIndex: -1,
    nextName: upcoming.n,
    nextTime: formatTime12(upcoming.a),
    nextIsTomorrow: true,
  };
}
