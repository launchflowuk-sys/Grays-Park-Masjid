import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import type { PrayerTime } from "@workspace/api-client-react";
import {
  IQAMAH_PRAYER_ORDER,
  computeCurrentNext,
  formatCountdown,
  usePrayerTimesToday,
} from "@/components/prayer-times-widget";
import gpmIcon from "@/assets/gpm_favi_1783401080435.png";

function formatTime12h(time: string | null | undefined): string {
  if (!time) return "--";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

function iqamahOffset(
  adhan: string | null | undefined,
  iqamah: string | null | undefined,
): string | null {
  if (!adhan || !iqamah) return null;
  const [ah, am] = adhan.split(":").map(Number);
  const [ih, im] = iqamah.split(":").map(Number);
  const diff = ih * 60 + im - (ah * 60 + am);
  if (diff <= 0) return null;
  return `+${diff}m`;
}

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/**
 * Arabesque curvilinear pattern — four circular arcs connecting midpoints
 * of each tile, forming an interlocking clover/leaf mesh. Deliberately
 * different from the angular geometric IslamicPattern used elsewhere.
 */
function ArabesqueBg() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id="gpm-arabesque-hero"
          x="0"
          y="0"
          width="72"
          height="72"
          patternUnits="userSpaceOnUse"
        >
          {/* 4 circular arc curves connecting tile midpoints — interlocking clover */}
          <path
            d="M36,0 A36,36 0 0,0 0,36  M72,36 A36,36 0 0,0 36,0  M36,72 A36,36 0 0,0 72,36  M0,36 A36,36 0 0,0 36,72"
            stroke="white"
            strokeWidth="0.65"
            fill="none"
          />
          {/* Small accent circles at tile corners and center */}
          <circle cx="36" cy="36" r="2.2" fill="none" stroke="white" strokeWidth="0.55" />
          <circle cx="0"  cy="0"  r="2.2" fill="none" stroke="white" strokeWidth="0.55" />
          <circle cx="72" cy="0"  r="2.2" fill="none" stroke="white" strokeWidth="0.55" />
          <circle cx="0"  cy="72" r="2.2" fill="none" stroke="white" strokeWidth="0.55" />
          <circle cx="72" cy="72" r="2.2" fill="none" stroke="white" strokeWidth="0.55" />
          {/* Tiny midpoint dots for added detail */}
          <circle cx="36" cy="0"  r="1" fill="white" />
          <circle cx="36" cy="72" r="1" fill="white" />
          <circle cx="0"  cy="36" r="1" fill="white" />
          <circle cx="72" cy="36" r="1" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#gpm-arabesque-hero)" opacity="0.09" />
    </svg>
  );
}

const PRAYER_LABELS: Record<string, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

export function HeroPrayerCard() {
  const { isLoading, todayRow, tomorrowRow } = usePrayerTimesToday();
  const now = useNow(1000);
  const current = todayRow ? computeCurrentNext(todayRow, tomorrowRow, now) : null;

  if (isLoading || !todayRow) return null;

  const nextAdhan = current
    ? (todayRow[`${current.nextKey}Adhan` as keyof PrayerTime] as string | null | undefined)
    : null;
  const nextIqamah = current
    ? (todayRow[`${current.nextKey}Iqamah` as keyof PrayerTime] as string | null | undefined)
    : null;
  const nextOffset = iqamahOffset(nextAdhan, nextIqamah);

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="w-full max-w-[720px]" data-testid="hero-prayer-card">
      <div className="relative bg-primary rounded-3xl overflow-hidden shadow-2xl shadow-black/30">
        <ArabesqueBg />

        {/* ── Header ── */}
        <div className="relative flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <img
              src={gpmIcon}
              alt="Grays Park Masjid"
              className="h-12 w-12 object-contain shrink-0"
            />
            <div>
              <p className="text-white text-sm font-semibold leading-tight">Grays Park Masjid</p>
              <p className="text-white/50 text-xs leading-tight">{today}</p>
            </div>
          </div>

          <Link
            href="/prayer-times"
            className="flex items-center gap-1 text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            Full timetable
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* ── Next prayer ── */}
        {current && (
          <div className="relative px-6 pb-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40 mb-2">
              Next Prayer
            </p>

            <div className="flex items-end justify-between gap-3">
              <p className="font-serif text-4xl md:text-5xl text-white leading-none">
                {PRAYER_LABELS[current.nextKey] ?? current.nextLabel}
              </p>
              <p className="font-bold text-3xl md:text-4xl tabular-nums text-white leading-none pb-0.5">
                {formatCountdown(current.countdownMs)}
              </p>
            </div>

            <div className="flex items-center gap-3 mt-3 text-sm text-white/50">
              <span>
                Adhan{" "}
                <span className="text-white/80 font-medium">{formatTime12h(nextAdhan)}</span>
              </span>
              {nextIqamah && (
                <>
                  <span className="text-white/20">·</span>
                  <span>
                    Iqamah{" "}
                    <span className="text-white/80 font-medium">{formatTime12h(nextIqamah)}</span>
                    {nextOffset && (
                      <span className="ml-1.5 text-[11px] bg-secondary/20 text-secondary px-1.5 py-0.5 rounded-full font-semibold">
                        {nextOffset}
                      </span>
                    )}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Divider ── */}
        <div className="relative mx-6 mb-1">
          <div className="h-px bg-white/8" />
          <div className="absolute left-0 top-0 h-px w-16 bg-secondary/50" />
        </div>

        {/* ── All prayers row ── */}
        <div className="relative grid grid-cols-5 gap-1 px-4 py-5">
          {IQAMAH_PRAYER_ORDER.map((p) => {
            const adhan = todayRow[`${p.key}Adhan` as keyof PrayerTime] as string | null | undefined;
            const iqamah = todayRow[`${p.key}Iqamah` as keyof PrayerTime] as string | null | undefined;
            const offset = iqamahOffset(adhan, iqamah);
            const isNext = current?.nextKey === p.key;
            const isCurrent = current?.currentKey === p.key;

            return (
              <div
                key={p.key}
                className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl transition-colors ${
                  isNext
                    ? "bg-white/10"
                    : isCurrent
                      ? "bg-secondary/10"
                      : ""
                }`}
              >
                <p
                  className={`text-[10px] font-semibold uppercase tracking-wide ${
                    isNext ? "text-secondary" : "text-white/40"
                  }`}
                >
                  {p.label}
                </p>
                <p
                  className={`text-sm font-bold tabular-nums leading-tight ${
                    isNext ? "text-white" : isCurrent ? "text-secondary/90" : "text-white/65"
                  }`}
                >
                  {formatTime12h(adhan)}
                </p>
                {offset ? (
                  <span
                    className={`text-[10px] font-semibold rounded px-1 leading-snug ${
                      isNext
                        ? "text-secondary bg-secondary/20"
                        : "text-white/30"
                    }`}
                  >
                    {offset}
                  </span>
                ) : (
                  <span className="text-[10px] text-transparent select-none">·</span>
                )}
                {isNext && (
                  <span className="flex h-1.5 w-1.5 mt-0.5" data-testid="indicator-next-prayer-pulse">
                    <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-secondary opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-secondary" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
