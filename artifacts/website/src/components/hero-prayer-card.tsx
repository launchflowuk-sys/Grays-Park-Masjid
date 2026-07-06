import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Landmark } from "lucide-react";
import type { PrayerTime } from "@workspace/api-client-react";
import {
  IQAMAH_PRAYER_ORDER,
  computeCurrentNext,
  formatCountdown,
  usePrayerTimesToday,
} from "@/components/prayer-times-widget";

function formatTime12h(time: string | null | undefined): string {
  if (!time) return "--";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

const SHORT_LABELS: Record<string, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Magh.",
  isha: "Isha",
};

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function HeroPrayerCard() {
  const { isLoading, todayRow, tomorrowRow } = usePrayerTimesToday();
  const now = useNow(1000);
  const current = todayRow ? computeCurrentNext(todayRow, tomorrowRow, now) : null;

  if (isLoading || !todayRow) {
    return null;
  }

  return (
    <div className="w-full max-w-[720px]" data-testid="hero-prayer-card">
      <div className="bg-card rounded-2xl shadow-2xl shadow-black/20 border border-card-border p-5 md:p-7">
        {current && (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-secondary text-xs font-semibold tracking-wide uppercase">
                Next Prayer
              </p>
              <p className="text-2xl font-bold font-serif text-primary mt-1">
                {current.nextLabel}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold tabular-nums text-primary">
                {formatCountdown(current.countdownMs)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                starts at {formatTime12h(current.nextTime)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0">
              <Landmark className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-5 gap-3 mt-6">
          {IQAMAH_PRAYER_ORDER.map((p) => {
            const iqamah = todayRow[`${p.key}Iqamah` as keyof PrayerTime] as string | null | undefined;
            const isNext = current?.nextKey === p.key;
            return (
              <div
                key={p.key}
                className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-colors ${
                  isNext
                    ? "bg-primary/10 border-primary/30"
                    : "bg-muted/40 border-transparent"
                }`}
              >
                {isNext && (
                  <span className="absolute top-2 right-2 flex h-2.5 w-2.5" data-testid="indicator-next-prayer-pulse">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                  </span>
                )}
                <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">
                  {SHORT_LABELS[p.key] ?? p.label}
                </p>
                <p className="text-sm font-bold text-primary leading-tight">
                  {formatTime12h(iqamah)}
                </p>
              </div>
            );
          })}
        </div>

        <Link
          href="/prayer-times"
          className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          View full timetable <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
