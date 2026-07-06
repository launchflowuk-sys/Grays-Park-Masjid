import { Sunrise, Sun, CloudSun, Sunset, MoonStar, Landmark, Calendar, Clock } from "lucide-react";
import {
  usePrayerTimesToday,
  computeCurrentNext,
  IQAMAH_PRAYER_ORDER,
} from "@/components/prayer-times-widget";
import { useEffect, useState } from "react";
import type { PrayerTime } from "@workspace/api-client-react";

const PRAYER_ICONS: Record<string, typeof Sunrise> = {
  fajr: Sunrise,
  dhuhr: Sun,
  asr: CloudSun,
  maghrib: Sunset,
  isha: MoonStar,
};

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function formatHms(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function to12Hour(time?: string | null): string {
  if (!time) return "";
  const [hStr, mStr] = time.split(":");
  let h = Number(hStr);
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${mStr} ${period}`;
}

export function TodayPrayersBar() {
  const { isLoading, todayRow, tomorrowRow } = usePrayerTimesToday();
  const now = useNow(1000);
  const current = computeCurrentNext(todayRow, tomorrowRow, now);

  if (isLoading) {
    return (
      <div
        className="rounded-2xl bg-primary text-primary-foreground p-6 md:p-8 text-sm text-primary-foreground/70"
        data-testid="today-prayers-bar-loading"
      >
        Loading prayer times...
      </div>
    );
  }

  if (!todayRow) {
    return (
      <div
        className="rounded-2xl bg-primary text-primary-foreground p-6 md:p-8 text-sm text-primary-foreground/70"
        data-testid="today-prayers-bar-empty"
      >
        Prayer times have not been published yet.
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl bg-primary text-primary-foreground p-6 md:p-8 shadow-lg"
      data-testid="today-prayers-bar"
    >
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-4 w-4 text-secondary" />
        <span className="uppercase tracking-[0.15em] text-xs font-semibold text-secondary">
          Today's Prayer Times
        </span>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-4">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 flex-1">
          {IQAMAH_PRAYER_ORDER.map((prayer) => {
            const Icon = PRAYER_ICONS[prayer.key] ?? Sun;
            const iqamah = todayRow[`${prayer.key}Iqamah` as keyof PrayerTime] as string | null | undefined;
            const isCurrent = current?.currentKey === prayer.key;
            return (
              <div
                key={prayer.key}
                data-testid={`today-prayers-cell-${prayer.key}`}
                className={`flex flex-col items-center text-center gap-1.5 rounded-xl py-3 px-1 ${
                  isCurrent ? "bg-primary-foreground/10" : ""
                }`}
              >
                <Icon className="h-6 w-6 text-secondary" />
                <p className="text-sm font-medium">{prayer.label}</p>
                <p className="text-xs text-primary-foreground/70">{to12Hour(iqamah)}</p>
              </div>
            );
          })}
          {(todayRow.jummahKhutbah || todayRow.jummahIqamah) && (
            <div
              className="flex flex-col items-center text-center gap-1.5 rounded-xl py-3 px-1"
              data-testid="today-prayers-cell-jumuah"
            >
              <Landmark className="h-6 w-6 text-secondary" />
              <p className="text-sm font-medium">Jumu'ah</p>
              <p className="text-xs text-primary-foreground/70">
                {to12Hour(todayRow.jummahKhutbah)}
                {todayRow.jummahKhutbah && todayRow.jummahIqamah && <br />}
                {to12Hour(todayRow.jummahIqamah)}
              </p>
            </div>
          )}
        </div>

        {current && (
          <div className="flex items-center justify-between lg:justify-start gap-4 lg:gap-6 lg:border-l lg:border-primary-foreground/15 lg:pl-6 shrink-0">
            <div>
              <p className="uppercase tracking-[0.15em] text-xs font-semibold text-secondary mb-1">
                Next Prayer
              </p>
              <p className="font-serif text-xl md:text-2xl">
                {current.nextLabel} {to12Hour(current.nextTime)}
              </p>
              <p className="text-xs text-primary-foreground/70 mt-1" data-testid="text-next-prayer-countdown">
                {formatHms(current.countdownMs)} remaining
              </p>
            </div>
            <div className="w-14 h-14 rounded-full border-2 border-secondary flex items-center justify-center shrink-0">
              <Clock className="h-6 w-6 text-secondary" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
