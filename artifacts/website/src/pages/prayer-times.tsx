import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useListPrayerTimesPublic } from "@workspace/api-client-react";
import { Clock } from "lucide-react";
import { format, parseISO } from "date-fns";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function PrayerTimesPage() {
  const { data, isLoading } = useListPrayerTimesPublic();
  const today = todayIso();
  const sorted = [...(data ?? [])].sort((a, b) => a.date.localeCompare(b.date));
  const todayRow = sorted.find((p) => p.date === today);
  const upcoming = sorted.filter((p) => p.date >= today);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <Clock className="h-8 w-8 text-secondary mx-auto mb-4" />
            <h1 className="font-serif text-3xl md:text-4xl">Prayer Times</h1>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              Daily Adhan and Iqamah times for Grays Park Masjid.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : todayRow ? (
            <>
              <h2 className="font-serif text-2xl mb-6 text-center">
                Today &mdash; {format(parseISO(todayRow.date), "EEEE d MMMM yyyy")}
              </h2>
              <div className="overflow-x-auto mb-16">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prayer</TableHead>
                      <TableHead>Adhan</TableHead>
                      <TableHead>Iqamah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { label: "Fajr", adhan: todayRow.fajrAdhan, iqamah: todayRow.fajrIqamah },
                      { label: "Sunrise", adhan: todayRow.sunrise, iqamah: null },
                      { label: "Dhuhr", adhan: todayRow.dhuhrAdhan, iqamah: todayRow.dhuhrIqamah },
                      { label: "Asr", adhan: todayRow.asrAdhan, iqamah: todayRow.asrIqamah },
                      { label: "Maghrib", adhan: todayRow.maghribAdhan, iqamah: todayRow.maghribIqamah },
                      { label: "Isha", adhan: todayRow.ishaAdhan, iqamah: todayRow.ishaIqamah },
                      { label: "Jumu'ah Khutbah", adhan: todayRow.jummahKhutbah, iqamah: todayRow.jummahIqamah },
                    ].map((row) => (
                      <TableRow key={row.label} data-testid={`row-prayer-${row.label.toLowerCase()}`}>
                        <TableCell className="font-medium">{row.label}</TableCell>
                        <TableCell>{row.adhan ?? "-"}</TableCell>
                        <TableCell className="text-primary font-medium">{row.iqamah ?? "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground mb-16">
              Today's prayer times have not been published yet.
            </p>
          )}

          <h2 className="font-serif text-2xl mb-6 text-center">Upcoming Days</h2>
          {upcoming.length === 0 ? (
            <p className="text-center text-muted-foreground">No upcoming prayer times published.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.slice(0, 9).map((row) => (
                <Card key={row.id} className="border-card-border" data-testid={`card-day-${row.date}`}>
                  <CardContent className="py-5">
                    <p className="font-serif text-lg mb-3">{format(parseISO(row.date), "EEE d MMM")}</p>
                    <div className="grid grid-cols-5 gap-1 text-xs text-center text-muted-foreground">
                      <span>Fajr</span>
                      <span>Dhuhr</span>
                      <span>Asr</span>
                      <span>Maghrib</span>
                      <span>Isha</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 text-sm text-center font-medium text-primary">
                      <span>{row.fajrIqamah}</span>
                      <span>{row.dhuhrIqamah}</span>
                      <span>{row.asrIqamah}</span>
                      <span>{row.maghribIqamah}</span>
                      <span>{row.ishaIqamah}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
