import { useEffect, useState } from "react";
import { useListPrayerTimesPublic, type PrayerTime } from "@workspace/api-client-react";
import { Clock } from "lucide-react";

export const PRAYER_ORDER = [
  { key: "fajr", label: "Fajr" },
  { key: "sunrise", label: "Sunrise" },
  { key: "dhuhr", label: "Dhuhr" },
  { key: "asr", label: "Asr" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isha", label: "Isha" },
] as const;

export const IQAMAH_PRAYER_ORDER = PRAYER_ORDER.filter((p) => p.key !== "sunrise");

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToLabel(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export type CurrentNextPrayer = {
  currentKey: (typeof IQAMAH_PRAYER_ORDER)[number]["key"] | null;
  nextKey: (typeof IQAMAH_PRAYER_ORDER)[number]["key"];
  nextTime: string;
  nextLabel: string;
  countdownMs: number;
  isNextTomorrow: boolean;
};

export function computeCurrentNext(
  todayRow: PrayerTime | undefined,
  tomorrowRow: PrayerTime | undefined,
  now: Date,
): CurrentNextPrayer | null {
  if (!todayRow) return null;
  const nowMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  const entries = IQAMAH_PRAYER_ORDER.map((p) => ({
    key: p.key,
    label: p.label,
    time: todayRow[`${p.key}Adhan` as keyof PrayerTime] as string,
  })).filter((e) => !!e.time);

  let currentKey: CurrentNextPrayer["currentKey"] = null;
  let next: { key: (typeof IQAMAH_PRAYER_ORDER)[number]["key"]; label: string; time: string } | null = null;

  for (let i = 0; i < entries.length; i++) {
    const entryMinutes = timeToMinutes(entries[i].time);
    if (entryMinutes <= nowMinutes) {
      currentKey = entries[i].key;
    } else {
      next = entries[i];
      break;
    }
  }

  let isNextTomorrow = false;
  if (!next) {
    if (tomorrowRow?.fajrAdhan) {
      next = { key: "fajr", label: "Fajr", time: tomorrowRow.fajrAdhan };
      isNextTomorrow = true;
    } else if (entries[0]) {
      next = entries[0];
      isNextTomorrow = true;
    }
  }

  if (!next) return null;

  const nextMinutesTotal = isNextTomorrow ? timeToMinutes(next.time) + 24 * 60 : timeToMinutes(next.time);
  const countdownMs = Math.max(0, (nextMinutesTotal - nowMinutes) * 60 * 1000);

  return {
    currentKey,
    nextKey: next.key,
    nextTime: next.time,
    nextLabel: next.label,
    countdownMs,
    isNextTomorrow,
  };
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function tomorrowIso() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function usePrayerTimesToday() {
  const { data, isLoading } = useListPrayerTimesPublic();
  const today = todayIso();
  const tomorrow = tomorrowIso();
  const todayRow = data?.find((p) => p.date === today);
  const tomorrowRow = data?.find((p) => p.date === tomorrow);
  return { data, isLoading, today, todayRow, tomorrowRow };
}

export function PrayerTimesWidget({ variant = "compact" }: { variant?: "compact" | "full" | "kiosk" }) {
  const { isLoading, todayRow, tomorrowRow } = usePrayerTimesToday();
  const now = useNow(1000);
  const current = computeCurrentNext(todayRow, tomorrowRow, now);

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground" data-testid="prayer-widget-loading">
        Loading prayer times...
      </div>
    );
  }

  if (!todayRow) {
    return (
      <div className="text-sm text-muted-foreground" data-testid="prayer-widget-empty">
        Prayer times have not been published yet.
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 text-sm" data-testid="prayer-widget-compact">
        <Clock className="h-4 w-4 text-primary shrink-0" />
        {current ? (
          <span>
            <span className="text-muted-foreground">Next: </span>
            <span className="font-medium">{current.nextLabel}</span>{" "}
            <span className="text-primary font-medium">
              {minutesToLabel(timeToMinutes(current.nextTime))}
            </span>{" "}
            <span className="text-muted-foreground">
              (in {formatCountdown(current.countdownMs)})
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">Prayer times unavailable</span>
        )}
      </div>
    );
  }

  const cells = variant === "kiosk" ? PRAYER_ORDER : IQAMAH_PRAYER_ORDER;

  return (
    <div data-testid={`prayer-widget-${variant}`}>
      {current && (
        <div className="text-center mb-8">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">Next Prayer</p>
          <p className={variant === "kiosk" ? "font-serif text-6xl text-primary mt-2" : "font-serif text-3xl text-primary mt-2"}>
            {current.nextLabel}
          </p>
          <p className={variant === "kiosk" ? "text-4xl mt-2 font-medium" : "text-xl mt-1 font-medium"}>
            in {formatCountdown(current.countdownMs)}
          </p>
        </div>
      )}
      <div
        className={`grid gap-4 ${variant === "kiosk" ? "grid-cols-3 md:grid-cols-6" : "grid-cols-2 sm:grid-cols-5"}`}
      >
        {cells.map((prayer) => {
          const adhan = todayRow[`${prayer.key}Adhan` as keyof PrayerTime] as string | null | undefined;
          const iqamah =
            prayer.key === "sunrise"
              ? null
              : (todayRow[`${prayer.key}Iqamah` as keyof PrayerTime] as string | null | undefined);
          const isCurrent = current?.currentKey === prayer.key;
          const isNext = current?.nextKey === prayer.key;
          return (
            <div
              key={prayer.key}
              data-testid={`prayer-widget-cell-${prayer.key}`}
              className={`relative text-center rounded-lg border p-4 ${
                isCurrent
                  ? "border-primary bg-primary/10"
                  : isNext
                    ? "border-secondary bg-secondary/10"
                    : "border-card-border"
              }`}
            >
              {isNext && (
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5" data-testid={`indicator-next-prayer-pulse-${prayer.key}`}>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                </span>
              )}
              <p
                className={`uppercase tracking-wide text-muted-foreground ${
                  variant === "kiosk" ? "text-lg" : "text-sm"
                }`}
              >
                {prayer.label}
              </p>
              {adhan && prayer.key !== "sunrise" && (
                <p className={`text-muted-foreground ${variant === "kiosk" ? "text-lg mt-1" : "text-xs mt-1"}`}>
                  Adhan {adhan}
                </p>
              )}
              <p
                className={`font-serif text-primary ${
                  variant === "kiosk" ? "text-4xl mt-2" : "text-2xl mt-2"
                }`}
              >
                {prayer.key === "sunrise" ? adhan : iqamah}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
