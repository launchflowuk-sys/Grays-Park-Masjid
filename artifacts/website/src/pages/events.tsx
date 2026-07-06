import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { useListEventsPublic } from "@workspace/api-client-react";
import { CalendarDays, MapPin } from "lucide-react";

function formatDateRange(startsAt: string, endsAt?: string | null) {
  const start = new Date(startsAt);
  const startStr = start.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  if (!endsAt) return startStr;
  const end = new Date(endsAt);
  const endStr = end.toLocaleString("en-GB", { hour: "numeric", minute: "2-digit" });
  return `${startStr} - ${endStr}`;
}

export default function EventsPage() {
  const { data, isLoading } = useListEventsPublic();
  const now = Date.now();
  const sorted = [...(data ?? [])].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );
  const upcoming = sorted.filter((e) => new Date(e.startsAt).getTime() >= now);
  const past = sorted.filter((e) => new Date(e.startsAt).getTime() < now).reverse();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h1 className="font-serif text-3xl md:text-4xl">Events</h1>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              Join us for upcoming events, lectures, and community gatherings.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : sorted.length === 0 ? (
            <p className="text-center text-muted-foreground">No events scheduled at this time.</p>
          ) : (
            <>
              <h2 className="font-serif text-2xl mb-6">Upcoming Events</h2>
              {upcoming.length === 0 ? (
                <p className="text-muted-foreground mb-12">No upcoming events at this time.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                  {upcoming.map((event) => (
                    <Card key={event.id} className="border-card-border overflow-hidden" data-testid={`card-event-${event.id}`}>
                      {event.imageUrl && (
                        <img src={event.imageUrl} alt={event.title} className="h-40 w-full object-cover" />
                      )}
                      <CardContent className="py-6">
                        <p className="font-serif text-lg mb-2">{event.title}</p>
                        <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                          <CalendarDays className="h-4 w-4 mt-0.5 shrink-0" />
                          <span>{formatDateRange(event.startsAt, event.endsAt)}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
                            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {past.length > 0 && (
                <>
                  <h2 className="font-serif text-2xl mb-6">Past Events</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
                    {past.map((event) => (
                      <Card key={event.id} className="border-card-border" data-testid={`card-event-${event.id}`}>
                        <CardContent className="py-6">
                          <p className="font-serif text-lg mb-2">{event.title}</p>
                          <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
                            <CalendarDays className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>{formatDateRange(event.startsAt, event.endsAt)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
                        </CardContent>
                      </Card>
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
