import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { MapPin, ArrowRight } from "lucide-react";
import { calcLocalPrayerTimes, computeLocalNext } from "@/lib/local-prayer-calc";
import { formatCountdown } from "@/components/prayer-times-widget";

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
  /** Variant: "card" (homepage floating card) or "page" (prayer times page hero) */
  variant?: "card" | "page";
}

export function LocalPrayerTimesCard({ coords, variant = "card" }: Props) {
  const times = useMemo(
    () => calcLocalPrayerTimes(coords.latitude, coords.longitude),
    [coords.latitude, coords.longitude],
  );

  const now = useNow(1000);
  const next = computeLocalNext(times, now);

  if (variant === "page") {
    return (
      <div
        className="relative overflow-hidden bg-primary text-primary-foreground rounded-2xl px-6 py-7 mb-6"
        data-testid="local-prayer-times-page"
      >
        <ArabesqueBg />
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-secondary shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white leading-tight">
                  Your Local Prayer Times
                </p>
                <p className="text-[11px] text-white/50 leading-tight">
                  {times.locationLabel} · Hanafi · Moonsighting
                </p>
              </div>
            </div>
            <Link
              href="/prayer-times"
              className="flex items-center gap-1 text-xs text-white/50 hover:text-white/80 transition-colors"
            >
              Grays Park times below
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Next prayer + all prayers row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="shrink-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40 mb-1">
                {next.isTomorrow ? "Tomorrow · " : ""}Next Prayer
              </p>
              <p className="font-serif text-3xl text-white leading-none">{next.label}</p>
              <p className="font-bold text-xl tabular-nums text-white mt-1">
                {formatCountdown(next.countdownMs)}
              </p>
              <p className="text-xs text-white/50 mt-0.5">
                at {formatTime12h(next.time)}
              </p>
            </div>

            <div className="h-px sm:h-auto sm:w-px bg-white/10 sm:self-stretch shrink-0" />

            <div className="grid grid-cols-5 gap-1 flex-1">
              {PRAYER_KEYS.map((key) => {
                const isNext = next.key === key && !next.isTomorrow;
                return (
                  <div
                    key={key}
                    className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-colors ${isNext ? "bg-white/10" : ""}`}
                  >
                    <p className={`text-[10px] font-semibold uppercase tracking-wide ${isNext ? "text-secondary" : "text-white/40"}`}>
                      {PRAYER_LABELS[key]}
                    </p>
                    <p className={`text-sm font-bold tabular-nums leading-tight ${isNext ? "text-white" : "text-white/65"}`}>
                      {formatTime12h(times[key])}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: "card" variant — matches HeroPrayerCard layout exactly
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
                className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl transition-colors ${isNext ? "bg-white/10" : ""}`}
              >
                <p className={`text-[10px] font-semibold uppercase tracking-wide ${isNext ? "text-secondary" : "text-white/40"}`}>
                  {PRAYER_LABELS[key]}
                </p>
                <p className={`text-sm font-bold tabular-nums leading-tight ${isNext ? "text-white" : "text-white/65"}`}>
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
            <Link href="/prayer-times" className="underline text-white/50 hover:text-white/70 transition-colors">
              See our full timetable →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
