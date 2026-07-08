import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { MapPin, ArrowRight, Maximize2 } from "lucide-react";
import { calcLocalPrayerTimes, computeLocalNext } from "@/lib/local-prayer-calc";
import { formatCountdown } from "@/components/prayer-times-widget";
import { IslamicPattern, IslamicStar } from "@/components/site/islamic-pattern";
import { Button } from "@/components/ui/button";

function formatTime12h(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** Same arabesque SVG as HeroPrayerCard — keeps visual parity. */
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
          id="gpm-arabesque-local"
          x="0"
          y="0"
          width="72"
          height="72"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M36,0 A36,36 0 0,0 0,36  M72,36 A36,36 0 0,0 36,0  M36,72 A36,36 0 0,0 72,36  M0,36 A36,36 0 0,0 36,72"
            stroke="white"
            strokeWidth="0.65"
            fill="none"
          />
          <circle cx="36" cy="36" r="2.2" fill="none" stroke="white" strokeWidth="0.55" />
          <circle cx="0"  cy="0"  r="2.2" fill="none" stroke="white" strokeWidth="0.55" />
          <circle cx="72" cy="0"  r="2.2" fill="none" stroke="white" strokeWidth="0.55" />
          <circle cx="0"  cy="72" r="2.2" fill="none" stroke="white" strokeWidth="0.55" />
          <circle cx="72" cy="72" r="2.2" fill="none" stroke="white" strokeWidth="0.55" />
          <circle cx="36" cy="0"  r="1" fill="white" />
          <circle cx="36" cy="72" r="1" fill="white" />
          <circle cx="0"  cy="36" r="1" fill="white" />
          <circle cx="72" cy="36" r="1" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#gpm-arabesque-local)" opacity="0.09" />
    </svg>
  );
}

const PRAYER_KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
const PRAYER_LABELS: Record<string, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

interface Props {
  coords: GeolocationCoordinates;
  /**
   * - "card"  — homepage floating card (matches HeroPrayerCard layout)
   * - "hero"  — full-width hero section swap for prayer-times page
   */
  variant?: "card" | "hero";
}

export function LocalPrayerTimesCard({ coords, variant = "card" }: Props) {
  const times = useMemo(
    () => calcLocalPrayerTimes(coords.latitude, coords.longitude),
    [coords.latitude, coords.longitude],
  );

  const now = useNow(1000);
  const next = computeLocalNext(times, now);

  /* ── "hero" variant — full-width section replacing prayer-times page hero ── */
  if (variant === "hero") {
    return (
      <section
        className="relative bg-primary text-primary-foreground overflow-hidden"
        data-testid="local-prayer-times-hero"
      >
        <IslamicPattern className="absolute inset-0 w-full h-full text-white/5 [background-size:60px_60px]" />
        <IslamicStar className="absolute -top-6 -left-6 w-40 h-40 text-white/5" />
        <IslamicStar className="absolute -bottom-6 -right-6 w-40 h-40 text-white/5" />

        <div className="relative mx-auto max-w-4xl px-6 py-14 md:py-20 text-center">
          <p
            className="font-serif text-secondary text-2xl md:text-3xl mb-3 tracking-wider"
            aria-label="Bismillah"
          >
            بسم الله الرحمن الرحيم
          </p>
          <h1 className="font-serif text-4xl md:text-5xl mt-2">Prayer Times</h1>
          <div className="mt-2 flex items-center justify-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-secondary/70 shrink-0" />
            <p className="text-primary-foreground/70 text-sm tracking-wide">
              {times.locationLabel} · your local times
            </p>
          </div>

          {/* Next prayer countdown — same styling as masjid hero */}
          <div className="mt-8 inline-flex flex-col items-center gap-1 bg-white/10 rounded-2xl px-8 py-5 backdrop-blur-sm border border-white/15">
            <span className="text-xs font-semibold tracking-widest uppercase text-primary-foreground/60">
              {next.isTomorrow ? "Tomorrow's" : "Next"} Prayer
            </span>
            <span className="font-serif text-3xl md:text-4xl text-secondary">
              {next.label}
            </span>
            <span className="text-xl md:text-2xl font-bold tabular-nums">
              {formatCountdown(next.countdownMs)}
            </span>
            <span className="text-xs text-primary-foreground/60">
              starts at {formatTime12h(next.time)}
            </span>
          </div>

          {/* 5-prayer quick-glance strip */}
          <div className="mt-6 flex items-center justify-center gap-4 sm:gap-7 flex-wrap">
            {PRAYER_KEYS.map((key) => {
              const isNext = next.key === key && !next.isTomorrow;
              return (
                <div
                  key={key}
                  className={`flex flex-col items-center gap-0.5 transition-opacity ${
                    isNext ? "opacity-100" : "opacity-50"
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-widest text-primary-foreground/70">
                    {PRAYER_LABELS[key]}
                  </p>
                  <p
                    className={`text-sm font-semibold tabular-nums ${
                      isNext ? "text-secondary" : "text-white"
                    }`}
                  >
                    {formatTime12h(times[key])}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <Link href="/prayer-times/display">
              <Button
                variant="outline"
                size="sm"
                className="border-white/30 text-primary-foreground hover:bg-white/10"
                data-testid="button-kiosk-display"
              >
                <Maximize2 className="h-3.5 w-3.5 mr-2" />
                Full-Screen Display
              </Button>
            </Link>
            <span className="text-xs text-white/30">·</span>
            <p className="text-xs text-white/50">
              Grays Park Masjid timetable below ↓
            </p>
          </div>
        </div>
      </section>
    );
  }

  /* ── "card" variant — homepage floating card matching HeroPrayerCard ── */
  return (
    <div className="w-full max-w-[720px]" data-testid="local-prayer-times-card">
      <div className="relative bg-primary rounded-3xl overflow-hidden shadow-2xl shadow-black/30">
        <ArabesqueBg />

        {/* Header */}
        <div className="relative flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <MapPin className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-tight">
                Your Local Prayer Times
              </p>
              <p className="text-white/50 text-xs leading-tight">
                {times.locationLabel} · Hanafi method
              </p>
            </div>
          </div>

          <Link
            href="/prayer-times"
            className="flex items-center gap-1 text-xs text-white/50 hover:text-white/80 transition-colors text-right"
          >
            Grays Park times
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Next prayer */}
        <div className="relative px-6 pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40 mb-2">
            {next.isTomorrow ? "Tomorrow · " : ""}Next Prayer
          </p>

          <div className="flex items-end justify-between gap-3">
            <p className="font-serif text-4xl md:text-5xl text-white leading-none">
              {next.label}
            </p>
            <p className="font-bold text-3xl md:text-4xl tabular-nums text-white leading-none pb-0.5">
              {formatCountdown(next.countdownMs)}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-3 text-sm text-white/50">
            <span>
              at{" "}
              <span className="text-white/80 font-medium">{formatTime12h(next.time)}</span>
            </span>
            <span className="text-white/20">·</span>
            <span className="text-[11px] bg-secondary/20 text-secondary px-1.5 py-0.5 rounded-full font-semibold">
              Calculated for your location
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="relative mx-6 mb-1">
          <div className="h-px bg-white/8" />
          <div className="absolute left-0 top-0 h-px w-16 bg-secondary/50" />
        </div>

        {/* All prayers row */}
        <div className="relative grid grid-cols-5 gap-1 px-4 py-5">
          {PRAYER_KEYS.map((key) => {
            const isNext = next.key === key && !next.isTomorrow;
            return (
              <div
                key={key}
                className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl transition-colors ${
                  isNext ? "bg-white/10" : ""
                }`}
              >
                <p
                  className={`text-[10px] font-semibold uppercase tracking-wide ${
                    isNext ? "text-secondary" : "text-white/40"
                  }`}
                >
                  {PRAYER_LABELS[key]}
                </p>
                <p
                  className={`text-sm font-bold tabular-nums leading-tight ${
                    isNext ? "text-white" : "text-white/65"
                  }`}
                >
                  {formatTime12h(times[key])}
                </p>
                {isNext && (
                  <span className="flex h-1.5 w-1.5 mt-0.5">
                    <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-secondary opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-secondary" />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="relative px-6 pb-5">
          <p className="text-[10px] text-white/30 text-center">
            Visiting Grays Park Masjid?{" "}
            <Link
              href="/prayer-times"
              className="underline text-white/50 hover:text-white/70 transition-colors"
            >
              See our full timetable →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
