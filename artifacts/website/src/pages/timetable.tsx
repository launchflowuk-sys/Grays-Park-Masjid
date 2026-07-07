import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import {
  useListPrayerTimesPublic,
  useListTimetablePdfsPublic,
} from "@workspace/api-client-react";
import type { PrayerTime } from "@workspace/api-client-react";
import { IslamicPattern, IslamicStar } from "@/components/site/islamic-pattern";
import { ChevronLeft, ChevronRight, Printer, Download, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";

function formatTime12h(time: string | null | undefined): string {
  if (!time) return "--";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

function PrayerCell({
  adhan,
  iqamah,
  isToday,
  fridayIqamah,
  last,
}: {
  adhan: string | null | undefined;
  iqamah: string | null | undefined;
  isToday?: boolean;
  fridayIqamah?: boolean;
  last?: boolean;
}) {
  return (
    <td className={`text-center px-3 py-3 ${last ? "" : "border-r border-border/60"}`}>
      <p className="text-[11px] text-muted-foreground tabular-nums leading-none">
        {formatTime12h(adhan)}
      </p>
      <p
        className={`text-sm font-semibold tabular-nums mt-1 leading-none ${
          isToday ? "text-primary" : "text-foreground"
        }`}
      >
        {formatTime12h(iqamah)}
        {fridayIqamah && (
          <span className="ml-1 text-[9px] font-bold text-secondary/80 align-top">J</span>
        )}
      </p>
    </td>
  );
}

const PRAYER_COLS = [
  { key: "fajr",    label: "Fajr",    arabic: "الفجر",   hasBoth: true  },
  { key: "sunrise", label: "Sunrise", arabic: "الشروق",  hasBoth: false },
  { key: "dhuhr",   label: "Dhuhr",   arabic: "الظهر",   hasBoth: true  },
  { key: "asr",     label: "Asr",     arabic: "العصر",   hasBoth: true  },
  { key: "maghrib", label: "Maghrib", arabic: "المغرب",  hasBoth: true  },
  { key: "isha",    label: "Isha",    arabic: "العشاء",  hasBoth: true  },
] as const;

export default function TimetablePage() {
  const { data: prayerData, isLoading: prayerLoading } = useListPrayerTimesPublic();
  const { data: pdfData, isLoading: pdfLoading } = useListTimetablePdfsPublic();

  const todayYm = new Date().toISOString().slice(0, 7);
  const todayFull = new Date().toISOString().slice(0, 10);

  const sortedPdfs = [...(pdfData ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  const { availableMonths, monthRows } = useMemo(() => {
    const all = [...(prayerData ?? [])].sort((a, b) => a.date.localeCompare(b.date));
    const monthSet = new Set(all.map((r) => r.date.slice(0, 7)));
    const months = Array.from(monthSet).sort();
    const byMonth: Record<string, PrayerTime[]> = {};
    for (const r of all) {
      const ym = r.date.slice(0, 7);
      (byMonth[ym] ??= []).push(r);
    }
    return { availableMonths: months, monthRows: byMonth };
  }, [prayerData]);

  const defaultMonth = useMemo(() => {
    if (availableMonths.includes(todayYm)) return todayYm;
    const future = availableMonths.find((m) => m >= todayYm);
    return future ?? availableMonths[availableMonths.length - 1] ?? todayYm;
  }, [availableMonths, todayYm]);

  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const activeMonth = selectedMonth ?? defaultMonth;

  const monthIdx = availableMonths.indexOf(activeMonth);
  const canPrev = monthIdx > 0;
  const canNext = monthIdx < availableMonths.length - 1;

  const rows = monthRows[activeMonth] ?? [];
  const monthLabel = activeMonth
    ? format(parseISO(`${activeMonth}-01`), "MMMM yyyy")
    : "";

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">

        {/* ── Hero ───────────────────────────────────────── */}
        <section className="relative bg-primary text-primary-foreground overflow-hidden print:hidden">
          <IslamicPattern className="absolute inset-0 w-full h-full text-white/5 [background-size:60px_60px]" />
          <IslamicStar className="absolute -top-6 -left-6 w-40 h-40 text-white/5" />
          <IslamicStar className="absolute -bottom-6 -right-6 w-40 h-40 text-white/5" />
          <div className="relative mx-auto max-w-4xl px-6 py-14 md:py-18 text-center">
            <p className="font-serif text-secondary text-2xl md:text-3xl mb-3 tracking-wider" aria-label="Bismillah">
              بسم الله الرحمن الرحيم
            </p>
            <h1 className="font-serif text-4xl md:text-5xl mt-2">Prayer Timetable</h1>
            <p className="mt-3 text-primary-foreground/70 max-w-xl mx-auto">
              Full Adhan and Iqamah times for Grays Park Masjid — browse by month, or download the official PDF.
            </p>
          </div>
        </section>

        {/* ── Live Monthly Timetable ──────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">

          {/* Print-only header */}
          <div className="hidden print:block mb-6 text-center">
            <p className="font-serif text-2xl font-bold">Grays Park Masjid</p>
            <p className="text-lg text-muted-foreground">Prayer Timetable — {monthLabel}</p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
            <div className="flex items-center gap-3">
              <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
              <div>
                <h2 className="font-serif text-2xl md:text-3xl">Monthly Timetable</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Browse prayer times by month
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handlePrint}
              disabled={rows.length === 0}
            >
              <Printer className="h-4 w-4" />
              Print {monthLabel}
            </Button>
          </div>

          {/* Month navigation */}
          <div className="flex items-center justify-between gap-3 mb-5 print:hidden">
            <Button
              variant="outline"
              size="sm"
              disabled={!canPrev}
              onClick={() => setSelectedMonth(availableMonths[monthIdx - 1])}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">
                {canPrev ? format(parseISO(`${availableMonths[monthIdx - 1]}-01`), "MMM yyyy") : ""}
              </span>
            </Button>

            <div className="flex items-center gap-2">
              <span className="font-serif text-xl md:text-2xl font-semibold">{monthLabel}</span>
              {activeMonth === todayYm && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-foreground bg-secondary px-2 py-0.5 rounded-full">
                  This Month
                </span>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={!canNext}
              onClick={() => setSelectedMonth(availableMonths[monthIdx + 1])}
              className="gap-1"
            >
              <span className="hidden sm:inline">
                {canNext ? format(parseISO(`${availableMonths[monthIdx + 1]}-01`), "MMM yyyy") : ""}
              </span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Month tabs for quick jumping */}
          {availableMonths.length > 1 && (
            <div className="flex gap-1.5 flex-wrap mb-6 print:hidden">
              {availableMonths.map((ym) => (
                <button
                  key={ym}
                  onClick={() => setSelectedMonth(ym)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                    ym === activeMonth
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {format(parseISO(`${ym}-01`), "MMM yy")}
                </button>
              ))}
            </div>
          )}

          {/* Table */}
          {prayerLoading ? (
            <div className="flex items-center justify-center h-48">
              <p className="text-muted-foreground">Loading timetable…</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center">
              <p className="text-muted-foreground">
                No prayer times published for {monthLabel} yet.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-primary/20 shadow-sm" data-testid="timetable-live">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse text-sm">

                  {/* Header */}
                  <thead>
                    <tr className="bg-primary text-primary-foreground">
                      <th className="sticky left-0 z-10 bg-primary text-left px-4 py-4 font-semibold tracking-wide border-r border-white/10 min-w-[110px]">
                        <span className="block text-[10px] uppercase tracking-widest text-primary-foreground/60 font-normal mb-0.5">
                          اليوم
                        </span>
                        Date
                      </th>
                      {PRAYER_COLS.map((col) => (
                        <th
                          key={col.key}
                          className="text-center px-3 py-4 font-semibold tracking-wide border-r border-white/10 last:border-r-0 min-w-[100px]"
                        >
                          <span className="block font-serif text-base text-secondary/90 leading-none mb-0.5">
                            {col.arabic}
                          </span>
                          <span className="block text-sm">{col.label}</span>
                          {col.hasBoth && (
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

                  {/* Body */}
                  <tbody>
                    {rows.map((row, idx) => {
                      const isToday = row.date === todayFull;
                      const dayOfWeek = parseISO(row.date).getDay();
                      const isFri = dayOfWeek === 5;

                      const rowBg = isToday
                        ? "bg-secondary/20"
                        : isFri
                          ? "bg-secondary/8"
                          : idx % 2 === 0
                            ? "bg-background"
                            : "bg-muted/30";

                      const stickyBg = isToday
                        ? "bg-secondary/20"
                        : isFri
                          ? "bg-secondary/8"
                          : idx % 2 === 0
                            ? "bg-background"
                            : "bg-muted/30";

                      return (
                        <tr
                          key={row.id}
                          data-testid={`timetable-row-${row.date}`}
                          className={`border-b border-border/60 last:border-b-0 transition-colors hover:brightness-95 ${rowBg}`}
                        >
                          {/* Sticky date column */}
                          <td className={`sticky left-0 z-10 px-4 py-3 border-r border-border/60 ${stickyBg}`}>
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="min-w-0">
                                <p className={`font-semibold tabular-nums leading-tight ${isToday ? "text-primary" : "text-foreground"}`}>
                                  {format(parseISO(row.date), "d MMM")}
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                  {format(parseISO(row.date), "EEEE")}
                                </p>
                              </div>
                              {isToday && (
                                <span className="shrink-0 text-[9px] font-bold uppercase tracking-widest text-secondary-foreground bg-secondary px-1.5 py-0.5 rounded-full leading-none">
                                  Today
                                </span>
                              )}
                              {isFri && !isToday && (
                                <span className="shrink-0 text-[9px] font-semibold text-secondary/80 leading-none whitespace-nowrap">
                                  Jumu'ah
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Fajr */}
                          <PrayerCell
                            adhan={row.fajrAdhan}
                            iqamah={row.fajrIqamah}
                            isToday={isToday}
                          />

                          {/* Sunrise — time only */}
                          <td className="text-center px-3 py-3 border-r border-border/60">
                            <p className="text-sm font-medium tabular-nums text-muted-foreground">
                              {formatTime12h(row.sunrise as string | null | undefined)}
                            </p>
                          </td>

                          {/* Dhuhr — swap to Jumu'ah iqamah on Fridays */}
                          <PrayerCell
                            adhan={row.dhuhrAdhan}
                            iqamah={isFri ? (row.jummahIqamah ?? row.dhuhrIqamah) : row.dhuhrIqamah}
                            isToday={isToday}
                            fridayIqamah={isFri && !!row.jummahIqamah}
                          />

                          {/* Asr */}
                          <PrayerCell
                            adhan={row.asrAdhan}
                            iqamah={row.asrIqamah}
                            isToday={isToday}
                          />

                          {/* Maghrib */}
                          <PrayerCell
                            adhan={row.maghribAdhan}
                            iqamah={row.maghribIqamah}
                            isToday={isToday}
                          />

                          {/* Isha */}
                          <PrayerCell
                            adhan={row.ishaAdhan}
                            iqamah={row.ishaIqamah}
                            isToday={isToday}
                            last
                          />
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table footer legend */}
              <div className="bg-primary/5 border-t border-primary/10 px-5 py-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground print:hidden">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-sm bg-secondary/30 border border-secondary/40" />
                  Today
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-sm bg-secondary/10" />
                  Friday / Jumu'ah
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="font-bold text-secondary/80">J</span>
                  Jumu'ah Iqamah (replaces Dhuhr)
                </span>
                <span className="ml-auto text-muted-foreground/60 hidden sm:block">
                  Scroll right to see all prayers on small screens
                </span>
              </div>
            </div>
          )}

          {/* Print footer */}
          <div className="hidden print:block mt-6 text-center text-xs text-muted-foreground">
            <p>Grays Park Masjid · Thurrock Islamic Education &amp; Cultural Association</p>
            <p>Times are subject to change. Please verify with the masjid.</p>
          </div>
        </section>

        {/* ── PDF Downloads ──────────────────────────────── */}
        <section className="border-t border-border bg-muted/30 print:hidden">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
            <div className="flex items-center gap-3 mb-6">
              <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
              <div>
                <h2 className="font-serif text-xl md:text-2xl">Official PDF Timetables</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Downloadable timetables published monthly by the masjid
                </p>
              </div>
            </div>

            {pdfLoading ? (
              <p className="text-muted-foreground text-sm">Loading…</p>
            ) : sortedPdfs.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No PDF timetables have been published yet.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sortedPdfs.map((pdf) => (
                  <div
                    key={pdf.id}
                    data-testid={`card-timetable-${pdf.id}`}
                    className="flex items-center gap-4 rounded-xl border border-card-border bg-card px-4 py-4"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{pdf.title}</p>
                      <p className="text-xs text-muted-foreground">{pdf.monthLabel}</p>
                    </div>
                    <a href={pdf.fileUrl} target="_blank" rel="noopener noreferrer" download>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 shrink-0"
                        aria-label={`Download ${pdf.title}`}
                        data-testid={`button-download-${pdf.id}`}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </main>
      <SiteFooter />

      {/* Print styles */}
      <style>{`
        @media print {
          @page { margin: 1.5cm; size: A4 landscape; }
          body { background: white !important; }
          nav, footer { display: none !important; }
          table { font-size: 10px !important; }
          th, td { padding: 6px 8px !important; }
          .sticky { position: static !important; }
        }
      `}</style>
    </div>
  );
}
