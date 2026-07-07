import { useEffect, useState } from "react";
import { Link } from "wouter";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import {
  usePrayerTimesToday,
  computeCurrentNext,
  formatCountdown,
  PRAYER_ORDER,
} from "@/components/prayer-times-widget";
import { IslamicPattern, IslamicStar } from "@/components/site/islamic-pattern";
import { Maximize2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { PrayerTime } from "@workspace/api-client-react";

const ARABIC_LABELS: Record<string, string> = {
  fajr: "الفجر",
  sunrise: "الشروق",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};

function formatTime12h(time: string | null | undefined): string {
  if (!time) return "--";
  const [h, m] = time.split(":").map(Number);
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

export default function PrayerTimesPage() {
  const { data, isLoading, today, todayRow, tomorrowRow } = usePrayerTimesToday();
  const now = useNow(1000);
  const current = todayRow ? computeCurrentNext(todayRow, tomorrowRow, now) : null;

  const sorted = [...(data ?? [])].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = sorted.filter((p) => p.date >= today);

  const hasJumuah = todayRow?.jummahKhutbah || todayRow?.jummahIqamah;
  const isFriday = new Date().getDay() === 5;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">

        {/* ── Hero ───────────────────────────────────────────────── */}
        <section className="relative bg-primary text-primary-foreground overflow-hidden">
          <IslamicPattern className="absolute inset-0 w-full h-full text-white/5 [background-size:60px_60px]" />
          <IslamicStar className="absolute -top-6 -left-6 w-40 h-40 text-white/5" />
          <IslamicStar className="absolute -bottom-6 -right-6 w-40 h-40 text-white/5" />

          <div className="relative mx-auto max-w-4xl px-6 py-14 md:py-20 text-center">
            <p className="font-serif text-secondary text-2xl md:text-3xl mb-3 tracking-wider" aria-label="Bismillah">
              بسم الله الرحمن الرحيم
            </p>
            <h1 className="font-serif text-4xl md:text-5xl mt-2">Prayer Times</h1>
            {todayRow && (
              <p className="mt-3 text-primary-foreground/70 text-sm tracking-wide">
                {format(parseISO(todayRow.date), "EEEE, d MMMM yyyy")}
              </p>
            )}

            {current && (
              <div className="mt-8 inline-flex flex-col items-center gap-1 bg-white/10 rounded-2xl px-8 py-5 backdrop-blur-sm border border-white/15">
                <span className="text-xs font-semibold tracking-widest uppercase text-primary-foreground/60">
                  {current.isNextTomorrow ? "Tomorrow's" : "Next"} Prayer
                </span>
                <span className="font-serif text-3xl md:text-4xl text-secondary">
                  {current.nextLabel}
                </span>
                <span className="text-xl md:text-2xl font-bold tabular-nums">
                  {formatCountdown(current.countdownMs)}
                </span>
                <span className="text-xs text-primary-foreground/60">
                  starts at {formatTime12h(current.nextTime)}
                </span>
              </div>
            )}

            <div className="mt-8">
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
            </div>
          </div>
        </section>

        {/* ── Today's Prayer Cards ────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12 md:py-16">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Loading prayer times…</p>
            </div>
          ) : !todayRow ? (
            <p className="text-center text-muted-foreground py-12">
              Today's prayer times have not been published yet.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif text-2xl md:text-3xl">Today's Schedule</h2>
                <span className="text-sm text-muted-foreground">
                  {format(parseISO(todayRow.date), "EEE d MMM")}
                </span>
              </div>

              {/* Prayer grid */}
              <div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4"
                data-testid="prayer-grid-today"
              >
                {PRAYER_ORDER.map((prayer) => {
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
                      data-testid={`card-prayer-${prayer.key}`}
                      className={`relative flex flex-col items-center justify-center text-center rounded-2xl border px-3 py-6 gap-1 transition-all duration-300 ${
                        isCurrent
                          ? "bg-secondary border-secondary/60 shadow-lg shadow-secondary/20"
                          : isNext
                            ? "bg-primary/8 border-primary/30 shadow-sm"
                            : "bg-card border-card-border"
                      }`}
                    >
                      {isCurrent && (
                        <span className="absolute top-2.5 left-3 text-[9px] font-bold uppercase tracking-widest text-secondary-foreground/70">
                          Current
                        </span>
                      )}
                      {isNext && (
                        <span
                          className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5"
                          data-testid={`indicator-next-prayer-pulse-${prayer.key}`}
                        >
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                        </span>
                      )}

                      <p
                        className={`font-serif text-base tracking-wide ${
                          isCurrent ? "text-secondary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {ARABIC_LABELS[prayer.key]}
                      </p>
                      <p
                        className={`text-xs font-semibold uppercase tracking-widest ${
                          isCurrent ? "text-secondary-foreground/80" : "text-muted-foreground"
                        }`}
                      >
                        {prayer.label}
                      </p>

                      <div className="mt-2 space-y-1 w-full">
                        {adhan && prayer.key !== "sunrise" && (
                          <p
                            className={`text-xs ${
                              isCurrent ? "text-secondary-foreground/60" : "text-muted-foreground"
                            }`}
                          >
                            Adhan {formatTime12h(adhan)}
                          </p>
                        )}
                        <p
                          className={`font-serif text-xl md:text-2xl font-semibold tabular-nums ${
                            isCurrent
                              ? "text-secondary-foreground"
                              : isNext
                                ? "text-primary"
                                : "text-foreground"
                          }`}
                        >
                          {prayer.key === "sunrise"
                            ? formatTime12h(adhan)
                            : formatTime12h(iqamah)}
                        </p>
                        {prayer.key !== "sunrise" && iqamah && (
                          <p
                            className={`text-[10px] ${
                              isCurrent ? "text-secondary-foreground/60" : "text-muted-foreground"
                            }`}
                          >
                            Iqamah
                          </p>
                        )}
                        {prayer.key === "sunrise" && (
                          <p
                            className={`text-[10px] ${
                              isCurrent ? "text-secondary-foreground/60" : "text-muted-foreground"
                            }`}
                          >
                            No Iqamah
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Jumu'ah / Friday section */}
              {(hasJumuah || isFriday) && (
                <div className="mt-6">
                  <div
                    className="rounded-2xl border border-secondary/40 bg-secondary/10 px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4"
                    data-testid="card-jumuah"
                  >
                    <div className="flex-1">
                      <p className="font-serif text-secondary text-lg">الجمعة</p>
                      <p className="font-semibold text-foreground">Jumu'ah — Friday Prayer</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Weekly Friday congregational prayer
                      </p>
                    </div>
                    <div className="flex gap-6 sm:gap-10">
                      {todayRow.jummahKhutbah && (
                        <div className="text-center">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Khutbah</p>
                          <p className="font-serif text-xl font-semibold text-primary mt-0.5">
                            {formatTime12h(todayRow.jummahKhutbah)}
                          </p>
                        </div>
                      )}
                      {todayRow.jummahIqamah && (
                        <div className="text-center">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Iqamah</p>
                          <p className="font-serif text-xl font-semibold text-primary mt-0.5">
                            {formatTime12h(todayRow.jummahIqamah)}
                          </p>
                        </div>
                      )}
                      {!todayRow.jummahKhutbah && !todayRow.jummahIqamah && (
                        <p className="text-sm text-muted-foreground italic">Times not yet published</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* ── Upcoming Days ───────────────────────────────────────── */}
        {upcoming.length > 0 && (
          <section className="bg-muted/40 border-t border-border">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 md:py-16">
              <div className="flex items-center gap-3 mb-8">
                <IslamicStar className="h-5 w-5 text-secondary" />
                <h2 className="font-serif text-2xl md:text-3xl">Upcoming Days</h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {upcoming.slice(0, 8).map((row) => {
                  const isToday = row.date === today;
                  return (
                    <div
                      key={row.id}
                      data-testid={`card-day-${row.date}`}
                      className={`rounded-xl border px-5 py-4 ${
                        isToday
                          ? "border-primary/40 bg-primary/5"
                          : "border-card-border bg-card"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-serif text-base font-semibold text-foreground">
                          {format(parseISO(row.date), "EEE d MMM")}
                        </p>
                        {isToday && (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-5 gap-1 text-center">
                        {[
                          { key: "fajr", label: "Fajr", time: row.fajrIqamah },
                          { key: "dhuhr", label: "Dhuhr", time: row.dhuhrIqamah },
                          { key: "asr", label: "Asr", time: row.asrIqamah },
                          { key: "maghrib", label: "Maghrib", time: row.maghribIqamah },
                          { key: "isha", label: "Isha", time: row.ishaIqamah },
                        ].map((p) => (
                          <div key={p.key} className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                              {p.key === "maghrib" ? "Magh" : p.label}
                            </span>
                            <span className="text-xs font-semibold text-primary tabular-nums">
                              {p.time ?? "-"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 text-center">
                <Link href="/timetable">
                  <Button variant="outline" size="sm">
                    View Full Timetable
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
