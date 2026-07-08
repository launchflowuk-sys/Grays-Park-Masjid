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
import { Maximize2, Sunrise } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useGetSettingPublic } from "@workspace/api-client-react";
import type { PrayerTime } from "@workspace/api-client-react";
import { useVisitorLocation } from "@/hooks/use-visitor-location";
import { LocalPrayerTimesCard } from "@/components/local-prayer-times-card";

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

function PrayerCell({
  adhan,
  iqamah,
  isToday,
  fridayIqamah,
  last,
  isFriday,
}: {
  adhan: string | null | undefined;
  iqamah: string | null | undefined;
  isToday?: boolean;
  fridayIqamah?: boolean;
  last?: boolean;
  isFriday?: boolean;
}) {
  return (
    <td className={`text-center px-3 py-3 ${last ? "" : `border-r ${isFriday ? "border-white/15" : "border-border/60"}`}`}>
      <p className={`text-[11px] tabular-nums leading-none ${isFriday ? "text-primary-foreground/55" : "text-muted-foreground"}`}>
        {formatTime12h(adhan)}
      </p>
      <p className={`text-sm font-semibold tabular-nums mt-1 leading-none ${isToday ? "text-primary" : isFriday ? "text-secondary" : "text-foreground"}`}>
        {formatTime12h(iqamah)}
        {fridayIqamah && (
          <span className={`ml-1 text-[9px] font-bold align-top ${isFriday ? "text-secondary/70" : "text-secondary/80"}`}>J</span>
        )}
      </p>
    </td>
  );
}

export default function PrayerTimesPage() {
  const { data, isLoading, today, todayRow, tomorrowRow } = usePrayerTimesToday();
  const now = useNow(1000);
  const current = todayRow ? computeCurrentNext(todayRow, tomorrowRow, now) : null;
  const { isLocal, coords } = useVisitorLocation();

  const sorted = [...(data ?? [])].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = sorted.filter((p) => p.date >= today);

  const hasJumuah = todayRow?.jummahKhutbah || todayRow?.jummahIqamah;
  const isFriday = new Date().getDay() === 5;

  const todayStr = new Date().toISOString().split("T")[0];

  const { data: jummahTimesSetting } = useGetSettingPublic("jummah_times");
  const { data: eidFitrDateSetting } = useGetSettingPublic("eid_al_fitr_date");
  const { data: eidFitrTimesSetting } = useGetSettingPublic("eid_al_fitr_times");
  const { data: eidAdhaDateSetting } = useGetSettingPublic("eid_al_adha_date");
  const { data: eidAdhaTimesSetting } = useGetSettingPublic("eid_al_adha_times");

  const parseTimes = (setting: unknown): string[] => {
    try {
      const v = (setting as { value?: string } | undefined)?.value;
      return v ? (JSON.parse(v) as string[]) : [];
    } catch { return []; }
  };
  const jummahTimesArr = parseTimes(jummahTimesSetting);
  const eidFitrDate = (eidFitrDateSetting as { value?: string } | undefined)?.value ?? "";
  const eidAdhaDate = (eidAdhaDateSetting as { value?: string } | undefined)?.value ?? "";
  const eidFitrTimesArr = parseTimes(eidFitrTimesSetting);
  const eidAdhaTimesArr = parseTimes(eidAdhaTimesSetting);
  const isEidFitrToday = eidFitrDate === todayStr;
  const isEidAdhaToday = eidAdhaDate === todayStr;
  const eidTodayName = isEidFitrToday ? "Eid ul-Fitr" : isEidAdhaToday ? "Eid ul-Adha" : "";
  const eidTodayTimes = isEidFitrToday ? eidFitrTimesArr : isEidAdhaToday ? eidAdhaTimesArr : [];
  const ORDINALS = ["1st", "2nd", "3rd", "4th"];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────
             Non-local visitors see their own local prayer times here.
             Local / unknown visitors see the Grays Park masjid hero.
        ──────────────────────────────────────────────────────────── */}
        {!isLocal && coords ? (
          <LocalPrayerTimesCard coords={coords} variant="hero" />
        ) : (
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
        )}

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

              {/* Prayer grid — 5 prayer cards + 1 pale sunrise info card */}
              <div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 items-start"
                data-testid="prayer-grid-today"
              >
                {PRAYER_ORDER.map((prayer) => {
                  const isSunrise = prayer.key === "sunrise";

                  // Sunrise is stored as todayRow.sunrise, not sunriseAdhan
                  const adhan = isSunrise
                    ? (todayRow.sunrise as string | null | undefined)
                    : (todayRow[`${prayer.key}Adhan` as keyof PrayerTime] as string | null | undefined);

                  const iqamah = isSunrise
                    ? null
                    : (todayRow[`${prayer.key}Iqamah` as keyof PrayerTime] as string | null | undefined);

                  const isCurrent = current?.currentKey === prayer.key;
                  const isNext = current?.nextKey === prayer.key;

                  // Sunrise: prominent amber/dawn card
                  if (isSunrise) {
                    return (
                      <div
                        key={prayer.key}
                        data-testid="card-prayer-sunrise"
                        className="relative flex flex-col items-center justify-center text-center rounded-2xl border border-amber-300/60 bg-amber-50 px-3 py-6 gap-1 overflow-hidden shadow-sm"
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-amber-100/80 to-orange-50/40 pointer-events-none" />
                        <Sunrise className="h-6 w-6 text-amber-600 mb-0.5 relative z-10" />
                        <p className="font-serif text-base tracking-wide text-amber-800 relative z-10">
                          {ARABIC_LABELS.sunrise}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700/80 relative z-10">
                          Sunrise
                        </p>
                        <p className="font-serif text-2xl font-semibold tabular-nums text-amber-900 mt-1.5 relative z-10">
                          {formatTime12h(adhan)}
                        </p>
                        <p className="text-[9px] text-amber-700/70 uppercase tracking-wide mt-0.5 relative z-10">
                          Fajr ends
                        </p>
                      </div>
                    );
                  }

                  // Regular prayer card
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
                        {adhan && (
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
                          {formatTime12h(iqamah)}
                        </p>
                        {iqamah && (
                          <p
                            className={`text-[10px] ${
                              isCurrent ? "text-secondary-foreground/60" : "text-muted-foreground"
                            }`}
                          >
                            Iqamah
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Jumu'ah / Friday section ── */}
              {(hasJumuah || isFriday || jummahTimesArr.length > 0) && (
                <div className="mt-6 space-y-4">
                  <div
                    className="relative overflow-hidden rounded-2xl border border-primary/30 bg-primary text-primary-foreground px-6 py-6"
                    data-testid="card-jumuah"
                  >
                    <IslamicPattern className="absolute inset-0 w-full h-full text-white/5 [background-size:60px_60px]" />
                    <div className="relative">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                        <div className="flex-1">
                          <p className="font-serif text-secondary text-2xl">الجمعة</p>
                          <p className="font-semibold text-primary-foreground text-lg mt-0.5">Jumu'ah — Friday Prayer</p>
                          <p className="text-sm text-primary-foreground/60 mt-1">
                            Weekly Friday congregational prayer
                          </p>
                        </div>
                        {/* Multi-slot Jummah times */}
                        {jummahTimesArr.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {jummahTimesArr.map((t, i) => (
                              <div
                                key={i}
                                className="flex flex-col items-center justify-center bg-white/10 rounded-xl px-4 py-3 border border-white/15 text-center"
                                data-testid={`card-jummah-slot-${i}`}
                              >
                                <p className="text-[10px] font-bold uppercase tracking-widest text-secondary/80">
                                  {ORDINALS[i]} Jamah
                                </p>
                                <p className="font-serif text-xl font-semibold text-secondary mt-1 tabular-nums">
                                  {formatTime12h(t)}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          /* Fallback to per-day jummahKhutbah/jummahIqamah */
                          <div className="flex gap-6 sm:gap-10">
                            {todayRow.jummahKhutbah && (
                              <div className="text-center">
                                <p className="text-xs uppercase tracking-wide text-primary-foreground/50">Khutbah</p>
                                <p className="font-serif text-xl font-semibold text-secondary mt-0.5">
                                  {formatTime12h(todayRow.jummahKhutbah)}
                                </p>
                              </div>
                            )}
                            {todayRow.jummahIqamah && (
                              <div className="text-center">
                                <p className="text-xs uppercase tracking-wide text-primary-foreground/50">Iqamah</p>
                                <p className="font-serif text-xl font-semibold text-secondary mt-0.5">
                                  {formatTime12h(todayRow.jummahIqamah)}
                                </p>
                              </div>
                            )}
                            {!todayRow.jummahKhutbah && !todayRow.jummahIqamah && (
                              <p className="text-sm text-primary-foreground/50 italic">Times not yet published</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Eid prayer card (shown on Eid day) ── */}
              {eidTodayName && eidTodayTimes.length > 0 && (
                <div className="mt-4">
                  <div
                    className="relative overflow-hidden rounded-2xl border border-secondary/40 bg-secondary text-secondary-foreground px-6 py-6"
                    data-testid="card-eid"
                  >
                    <IslamicPattern className="absolute inset-0 w-full h-full text-white/5 [background-size:60px_60px]" />
                    <div className="relative flex flex-col sm:flex-row sm:items-start gap-6">
                      <div className="flex-1">
                        <p className="font-serif text-2xl text-white/80">
                          {eidTodayName === "Eid ul-Fitr" ? "عيد الفطر" : "عيد الأضحى"}
                        </p>
                        <p className="font-semibold text-lg mt-0.5">{eidTodayName} Prayer</p>
                        <p className="text-sm text-secondary-foreground/60 mt-1">Eid congregational prayer times</p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {eidTodayTimes.map((t, i) => (
                          <div
                            key={i}
                            className="flex flex-col items-center justify-center bg-white/15 rounded-xl px-4 py-3 border border-white/20 text-center"
                            data-testid={`card-eid-slot-${i}`}
                          >
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                              {ORDINALS[i]} Jamah
                            </p>
                            <p className="font-serif text-xl font-semibold mt-1 tabular-nums">
                              {formatTime12h(t)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* ── Monthly Timetable ───────────────────────────────────── */}
        {upcoming.length > 0 && (
          <section className="border-t border-border">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
              <div className="flex items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                  <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
                  <div>
                    <h2 className="font-serif text-2xl md:text-3xl">Monthly Timetable</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Iqamah times for the next {upcoming.slice(0, 31).length} days
                    </p>
                  </div>
                </div>
                <Link href="/timetable">
                  <Button variant="outline" size="sm" className="shrink-0">
                    PDF Downloads
                  </Button>
                </Link>
              </div>

              {/* Scrollable table wrapper */}
              <div className="rounded-2xl overflow-hidden border border-primary/20 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] border-collapse text-sm" data-testid="timetable-monthly">
                    {/* ── Header ── */}
                    <thead>
                      <tr className="bg-primary text-primary-foreground">
                        {/* Date column */}
                        <th className="sticky left-0 z-10 bg-primary text-left px-4 py-4 font-semibold text-sm tracking-wide border-r border-white/10 min-w-[110px]">
                          <span className="block text-[10px] uppercase tracking-widest text-primary-foreground/60 font-normal mb-0.5">
                            اليوم
                          </span>
                          Date
                        </th>
                        {[
                          { key: "fajr", label: "Fajr", arabic: "الفجر" },
                          { key: "sunrise", label: "Sunrise", arabic: "الشروق" },
                          { key: "dhuhr", label: "Dhuhr", arabic: "الظهر" },
                          { key: "asr", label: "Asr", arabic: "العصر" },
                          { key: "maghrib", label: "Maghrib", arabic: "المغرب" },
                          { key: "isha", label: "Isha", arabic: "العشاء" },
                        ].map((col) => (
                          <th
                            key={col.key}
                            className="text-center px-3 py-4 font-semibold tracking-wide border-r border-white/10 last:border-r-0 min-w-[100px]"
                          >
                            <span className="block font-serif text-base text-secondary/90 leading-none mb-0.5">
                              {col.arabic}
                            </span>
                            <span className="block text-sm">{col.label}</span>
                            {col.key !== "sunrise" && (
                              <div className="flex justify-center gap-2 mt-1.5 text-[9px] uppercase tracking-widest text-primary-foreground/50 font-normal">
                                <span>Adhan</span>
                                <span>·</span>
                                <span>Iqamah</span>
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    {/* ── Body ── */}
                    <tbody>
                      {upcoming.slice(0, 31).map((row, idx) => {
                        const isToday = row.date === today;
                        const dayOfWeek = parseISO(row.date).getDay();
                        const isFri = dayOfWeek === 5;

                        const rowBg = isToday
                          ? "bg-secondary/20 border-secondary/30"
                          : isFri
                            ? "bg-primary hover:bg-primary/90"
                            : idx % 2 === 0
                              ? "bg-background hover:bg-muted/40"
                              : "bg-muted/30 hover:bg-muted/50";

                        return (
                          <tr
                            key={row.id}
                            data-testid={`timetable-row-${row.date}`}
                            className={`transition-colors border-b border-border/60 last:border-b-0 ${rowBg}`}
                          >
                            {/* Date cell — sticky on mobile. Solid brand-green background
                                prevents scrolling content bleeding through on horizontal scroll. */}
                            <td
                              className="sticky left-0 z-10 px-4 py-3 border-r border-white/15"
                              style={{ backgroundColor: isToday ? "#2A5240" : "#1B3D2F" }}
                            >
                              <div className="flex items-center gap-2">
                                <div>
                                  <p className={`font-semibold tabular-nums leading-none ${isToday || isFri ? "text-[#C9A84C]" : "text-white"}`}>
                                    {format(parseISO(row.date), "d MMM")}
                                  </p>
                                  <p className="text-[11px] text-white/55 mt-0.5">
                                    {format(parseISO(row.date), "EEE")}
                                  </p>
                                </div>
                                {isToday && (
                                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#1B3D2F] bg-[#C9A84C] px-1.5 py-0.5 rounded-full leading-none">
                                    Today
                                  </span>
                                )}
                                {isFri && !isToday && (
                                  <span className="text-[9px] font-semibold text-[#C9A84C] leading-none">
                                    Jumu'ah
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Fajr */}
                            <PrayerCell adhan={row.fajrAdhan} iqamah={row.fajrIqamah} isToday={isToday} isFriday={isFri} />

                            {/* Sunrise — adhan only, no iqamah */}
                            <td className={`text-center px-3 py-3 border-r ${isFri ? "border-white/15" : "border-border/60"}`}>
                              <p className={`text-sm font-medium tabular-nums ${isFri ? "text-primary-foreground/55" : "text-muted-foreground"}`}>
                                {formatTime12h(row.sunrise as string | null | undefined)}
                              </p>
                            </td>

                            {/* Dhuhr */}
                            <PrayerCell adhan={row.dhuhrAdhan} iqamah={isFri ? (row.jummahIqamah ?? row.dhuhrIqamah) : row.dhuhrIqamah} isToday={isToday} fridayIqamah={isFri && !!row.jummahIqamah} isFriday={isFri} />

                            {/* Asr */}
                            <PrayerCell adhan={row.asrAdhan} iqamah={row.asrIqamah} isToday={isToday} isFriday={isFri} />

                            {/* Maghrib */}
                            <PrayerCell adhan={row.maghribAdhan} iqamah={row.maghribIqamah} isToday={isToday} isFriday={isFri} />

                            {/* Isha */}
                            <PrayerCell adhan={row.ishaAdhan} iqamah={row.ishaIqamah} isToday={isToday} isFriday={isFri} last />
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Table footer */}
                <div className="bg-primary/5 border-t border-primary/10 px-5 py-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 rounded-sm bg-secondary/30 border border-secondary/40" />
                    Today
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 rounded-sm bg-secondary/10" />
                    Friday / Jumu'ah
                  </span>
                  <span className="ml-auto text-muted-foreground/60 italic">
                    All times shown as Iqamah · Scroll right for all prayers
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
