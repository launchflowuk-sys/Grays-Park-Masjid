import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { useListEventsPublic } from "@workspace/api-client-react";
import { CalendarDays, MapPin } from "lucide-react";
import { IslamicPattern, IslamicStar } from "@/components/site/islamic-pattern";
import masjidBuildingImage from "@/assets/generated_images/masjid_building.webp";

function formatDateRange(startsAt: string, endsAt?: string | null) {
  const start = new Date(startsAt);
  const startStr = start.toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" });
  if (!endsAt) return startStr;
  const end = new Date(endsAt);
  const endStr = end.toLocaleString("en-GB", { hour: "numeric", minute: "2-digit" });
  return `${startStr} – ${endStr}`;
}

export default function EventsPage() {
  const { data, isLoading } = useListEventsPublic();
  const now = Date.now();
  const sorted = [...(data ?? [])].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  const upcoming = sorted.filter((e) => new Date(e.startsAt).getTime() >= now);
  const past = sorted.filter((e) => new Date(e.startsAt).getTime() < now).reverse();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative bg-primary text-primary-foreground overflow-hidden">
          <IslamicPattern className="absolute inset-0 w-full h-full text-white/5 [background-size:60px_60px]" />
          <IslamicStar className="absolute -top-10 -right-10 w-56 h-56 text-white/5" />
          <IslamicStar className="absolute -bottom-10 -left-10 w-48 h-48 text-white/5" />
          <div className="relative mx-auto max-w-4xl px-6 py-16 md:py-20 text-center">
            <h1 className="font-serif text-4xl md:text-5xl">Events</h1>
            <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto text-lg leading-relaxed">
              Join us for upcoming lectures, community gatherings, and special occasions.
            </p>
          </div>
        </section>

        {/* Events listing */}
        <section className="mx-auto max-w-6xl px-6 py-14 md:py-16">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-16">Loading events…</p>
          ) : sorted.length === 0 ? (
            <div className="text-center py-16">
              <CalendarDays className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground">No events scheduled at this time. Please check back soon.</p>
            </div>
          ) : (
            <>
              {/* Upcoming */}
              <div className="flex items-center gap-3 mb-8">
                <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
                <h2 className="font-serif text-3xl">Upcoming Events</h2>
              </div>
              {upcoming.length === 0 ? (
                <p className="text-muted-foreground mb-14">No upcoming events at this time — check back soon.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                  {upcoming.map((event) => (
                    <div
                      key={event.id}
                      data-testid={`card-event-${event.id}`}
                      className="group relative overflow-hidden rounded-2xl border border-card-border bg-card hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col"
                    >
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={event.imageUrl || masjidBuildingImage}
                          alt={event.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <p className="font-serif text-lg mb-3 leading-snug">{event.title}</p>
                        <div className="flex items-start gap-2 text-xs text-muted-foreground mb-2">
                          <CalendarDays className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/60" />
                          <span>{formatDateRange(event.startsAt, event.endsAt)}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-start gap-2 text-xs text-muted-foreground mb-3">
                            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary/60" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed flex-1">{event.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Past */}
              {past.length > 0 && (
                <>
                  <div className="flex items-center gap-3 mb-8 pt-4 border-t border-border">
                    <IslamicStar className="h-5 w-5 text-secondary/50 shrink-0" />
                    <h2 className="font-serif text-2xl text-muted-foreground">Past Events</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 opacity-65">
                    {past.map((event) => (
                      <div key={event.id} data-testid={`card-event-${event.id}`} className="rounded-2xl border border-card-border bg-card p-5">
                        <p className="font-serif text-base mb-2">{event.title}</p>
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CalendarDays className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                          <span>{formatDateRange(event.startsAt, event.endsAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
