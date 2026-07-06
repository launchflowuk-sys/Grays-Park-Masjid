import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useListTimetablePdfsPublic } from "@workspace/api-client-react";
import { CalendarDays, Download, FileText } from "lucide-react";

export default function TimetablePage() {
  const { data, isLoading } = useListTimetablePdfsPublic();
  const sorted = [...(data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <CalendarDays className="h-8 w-8 text-secondary mx-auto mb-4" />
            <h1 className="font-serif text-3xl md:text-4xl">Full Year Timetable</h1>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              Download our official prayer timetable for the full year, published monthly.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : sorted.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No timetable documents have been published yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {sorted.map((pdf) => (
                <Card key={pdf.id} className="border-card-border" data-testid={`card-timetable-${pdf.id}`}>
                  <CardContent className="py-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{pdf.title}</p>
                      <p className="text-sm text-muted-foreground">{pdf.monthLabel}</p>
                    </div>
                    <a href={pdf.fileUrl} target="_blank" rel="noopener noreferrer" download>
                      <Button size="icon" variant="outline" aria-label={`Download ${pdf.title}`} data-testid={`button-download-${pdf.id}`}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
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
