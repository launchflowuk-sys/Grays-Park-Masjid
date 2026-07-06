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
    <div
      className="absolute left-6 md:left-[calc((100vw-72rem)/2+24px)] -bottom-28 md:-bottom-32 z-20 w-[calc(100%-3rem)] max-w-[420px]"
      data-testid="hero-prayer-card"
    >
      <div className="bg-card rounded-2xl shadow-2xl shadow-black/20 border border-card-border p-6">
        {current && (
          <div className="flex items-center justify-between gap-3">
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
            <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0">
              <Landmark className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-6 gap-1.5 mt-5">
          {IQAMAH_PRAYER_ORDER.map((p) => {
            const iqamah = todayRow[`${p.key}Iqamah` as keyof PrayerTime] as string | null | undefined;
            const isNext = current?.nextKey === p.key;
            return (
              <div
                key={p.key}
                className={`text-center rounded-lg py-2 px-1 ${isNext ? "bg-primary/10" : ""}`}
              >
                <p className="text-[10px] text-muted-foreground font-semibold truncate">
                  {SHORT_LABELS[p.key] ?? p.label}
                </p>
                <p className="text-[11px] font-semibold text-primary mt-1 leading-tight">
                  {formatTime12h(iqamah)}
                </p>
              </div>
            );
          })}
        </div>

        <Link
          href="/prayer-times"
          className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          View full timetable <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
