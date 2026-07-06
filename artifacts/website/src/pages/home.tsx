import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import * as Icons from "lucide-react";
import {
  Clock,
  HandHeart,
  MapPin,
  Users,
  BookOpen,
  HeartHandshake,
  HandCoins,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Lock,
  Sparkles,
  CalendarDays,
  Megaphone,
  Pin,
  GraduationCap,
  CalendarClock,
  PoundSterling,
  Images,
} from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { HeroPrayerCard } from "@/components/hero-prayer-card";
import { TodayPrayersBar } from "@/components/today-prayers-bar";
import { ArchIconBadge, IslamicPattern, IslamicStar } from "@/components/site/islamic-pattern";
import { usePrayerTimesToday } from "@/components/prayer-times-widget";
import {
  useListDonationCampaignsPublic,
  useListServicesPublic,
  useListEventsPublic,
  useListAnnouncementsPublic,
  useListCoursesPublic,
  useListGalleryAlbumsPublic,
} from "@workspace/api-client-react";
import heroImage from "@/assets/Home_Hero_1783357048983.png";
import mosqueConstructionImage from "@/assets/generated_images/mosque_construction.png";
import { format, parseISO } from "date-fns";

const PRESET_AMOUNTS = ["10", "25", "50", "100"];

function formatCurrency(value: string | null | undefined) {
  const num = Number(value ?? 0);
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(num);
}

function toPascalCase(name: string): string {
  return name
    .split(/[-_ ]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function resolveServiceIcon(name?: string | null): Icons.LucideIcon {
  const iconMap = Icons as unknown as Record<string, Icons.LucideIcon>;
  return (name && (iconMap[name] || iconMap[toPascalCase(name)])) || HandHeart;
}

function ArchIconBadgeFor({ service }: { service: { icon?: string | null } }) {
  return <ArchIconBadge icon={resolveServiceIcon(service.icon)} />;
}

const GALLERY_SPANS = [
  "col-span-2 lg:col-span-3 lg:row-span-2",
  "col-span-1 lg:col-span-2",
  "col-span-1 lg:col-span-2",
  "col-span-1 lg:col-span-2 lg:row-span-2",
  "col-span-1 lg:col-span-3",
  "col-span-2 lg:col-span-2",
];

const STATS = [
  { icon: Users, title: "Welcoming Everyone", desc: "All are welcome" },
  { icon: BookOpen, title: "Islamic Education", desc: "Classes for all ages" },
  { icon: HeartHandshake, title: "Community Service", desc: "Serving the community" },
  { icon: HandCoins, title: "Donate & Support", desc: "Help build our future" },
  { icon: Calendar, title: "Events & Activities", desc: "Bringing people together" },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />

      <section className="relative">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={heroImage}
              alt="Grays Park Masjid building and grounds"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/55 via-primary/15 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>
          <IslamicPattern className="pointer-events-none absolute inset-0 w-full h-full text-primary-foreground/[0.04]" />

          <div className="relative z-10 mx-auto max-w-6xl px-6 w-full flex flex-col lg:flex-row lg:items-end justify-between gap-10 lg:gap-12 py-10 md:py-14 lg:pb-16">
            <div className="max-w-3xl pt-2 md:pt-4">
              <span className="inline-block rounded-full bg-black/40 backdrop-blur-sm border border-white/10 px-4 py-2 uppercase tracking-[0.15em] text-xs md:text-sm text-secondary font-semibold mb-5">
                In the name of Allah, the Most Gracious, the Most Merciful
              </span>
              <div className="max-w-2xl">
                <h1 className="font-serif text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.1] text-primary-foreground drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]">
                  A Place of Worship,
                  <br />
                  Learning &amp; Community
                </h1>
                <div className="w-14 h-[3px] bg-secondary my-6" />
                <p className="text-base md:text-lg text-primary-foreground/95 leading-relaxed max-w-md drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
                  Grays Park Masjid is a welcoming center for worship, education and
                  community service. All are welcome.
                </p>
              </div>
              <div className="mt-9 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 md:gap-4">
                <Link href="/prayer-times" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-12 md:h-14 px-6 md:px-8 text-sm md:text-base rounded-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                    data-testid="button-hero-prayer-times"
                  >
                    View Prayer Times <Clock className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/donate" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-12 md:h-14 px-6 md:px-8 text-sm md:text-base rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2"
                    data-testid="button-hero-donate"
                  >
                    Donate Now <HandHeart className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/about" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-12 md:h-14 px-6 md:px-8 text-sm md:text-base rounded-full border-2 border-primary-foreground/80 text-primary-foreground hover:bg-primary-foreground/10 gap-2"
                    data-testid="button-hero-visit"
                  >
                    Visit Us <MapPin className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="w-full lg:w-[420px] xl:w-[460px] lg:shrink-0">
              <HeroPrayerCard />
            </div>
          </div>
        </div>

        <div className="bg-primary pt-8 pb-8 md:pt-16 md:pb-9 relative overflow-hidden">
          <IslamicPattern className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 text-primary-foreground/[0.05]" />
          <div className="mx-auto max-w-6xl px-6 grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4 relative">
            {STATS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-primary-foreground/10 flex items-center justify-center text-secondary shrink-0">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-primary-foreground text-[13px] font-semibold tracking-wide">
                    {title}
                  </p>
                  <p className="text-primary-foreground/60 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MosqueProjectSection />

      <ServicesSection />

      <ThisWeekSection />

      <IslamicEducationSection />

      <GallerySection />

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <HandHeart className="h-10 w-10 text-secondary mx-auto mb-4" />
          <h2 className="font-serif text-3xl mb-4">Support Our Masjid</h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Your generosity keeps our doors open and our community thriving. Every donation,
            large or small, makes a difference.
          </p>
          <Link href="/donate">
            <Button size="lg" className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90" data-testid="button-donate-cta">
              Donate Now
            </Button>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function MosqueProjectSection() {
  const { data, isLoading } = useListDonationCampaignsPublic();
  const active = (data ?? []).filter((c) => c.active);
  const withTarget = active.filter((c) => c.targetAmount);
  const buildingMatch = withTarget.find((c) => /extension|new mosque|building/i.test(c.title));
  const campaign = buildingMatch ?? withTarget.find((c) => c.featured) ?? withTarget[0] ?? active[0];

  if (isLoading || !campaign) {
    return null;
  }

  const target = campaign.targetAmount ? Number(campaign.targetAmount) : null;
  const raised = Number(campaign.raisedAmount);
  const pct = target && target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-24 w-full">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">
        <div className="relative">
          <div
            className="absolute -inset-3 bg-primary/[0.08]"
            style={{ borderRadius: "3rem 3rem 1rem 3rem" }}
            aria-hidden="true"
          />
          <img
            src={campaign.imageUrl || mosqueConstructionImage}
            alt="New mosque construction project"
            className="relative w-full object-cover aspect-[4/3]"
            style={{ borderRadius: "2.5rem 2.5rem 0.75rem 2.5rem" }}
            data-testid="img-mosque-project"
          />
        </div>

        <div>
          <span className="inline-block uppercase tracking-[0.15em] text-xs font-semibold text-secondary-foreground/80 mb-3">
            New Mosque Project
          </span>
          <h2 className="font-serif text-3xl md:text-[2rem] leading-tight mb-4 max-w-md">
            Building for our future, together.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-md">
            {campaign.description}
          </p>

          {target && (
            <div className="bg-card rounded-[1.75rem] p-6 md:p-7 shadow-sm border border-card-border mb-6">
              <div className="flex justify-between items-baseline mb-4">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Raised</p>
                  <p className="text-2xl font-semibold text-primary mt-1">
                    {formatCurrency(campaign.raisedAmount)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Target</p>
                  <p className="text-lg font-semibold mt-1">{formatCurrency(String(target))}</p>
                </div>
              </div>
              <Progress value={pct ?? 0} className="h-2.5 mb-2" data-testid="progress-mosque-project" />
              <p className="text-xs text-muted-foreground mt-2">{pct}% of the final goal raised so far.</p>
            </div>
          )}

          <div className="grid grid-cols-5 gap-2 mb-5">
            {PRESET_AMOUNTS.map((preset) => (
              <Link key={preset} href="/donate">
                <Button
                  type="button"
                  variant={preset === "50" ? "default" : "outline"}
                  className={`w-full rounded-full ${preset === "50" ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
                  data-testid={`button-preset-amount-${preset}`}
                >
                  £{preset}
                </Button>
              </Link>
            ))}
            <Link href="/donate">
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-full border-secondary text-secondary-foreground hover:bg-secondary/10"
                data-testid="button-preset-amount-custom"
              >
                Custom
              </Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Link href="/donate" className="w-full sm:w-auto">
              <Button
                className="w-full sm:w-auto rounded-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                data-testid="button-mosque-donate-now"
              >
                Donate Now <HandHeart className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/about" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto rounded-full gap-2"
                data-testid="button-mosque-learn-more"
              >
                Learn More <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" /> 100% Donation Policy
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-primary" /> Secure &amp; Trusted
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-secondary-foreground/80" /> Sadaqah Jariyah
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const { data, isLoading } = useListServicesPublic();
  const { data: albumsData } = useListGalleryAlbumsPublic();
  const sorted = [...(data ?? [])].filter((s) => s.published).sort((a, b) => a.sortOrder - b.sortOrder);
  const featured = sorted.slice(0, 2);
  const rest = sorted.slice(2, 8);
  const featureImage = albumsData?.find((a) => a.coverImageUrl)?.coverImageUrl ?? mosqueConstructionImage;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 w-full">
      <div className="flex items-end justify-between gap-4 mb-10 flex-wrap">
        <div>
          <span className="inline-block uppercase tracking-[0.15em] text-xs font-semibold text-secondary-foreground/80 mb-2">
            Our Services
          </span>
          <h2 className="font-serif text-3xl">More Than a Place to Pray</h2>
        </div>
        <Link href="/services">
          <Button variant="outline" className="rounded-full gap-2" data-testid="button-view-all-services">
            View All Services <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground">Loading services...</p>
      ) : sorted.length === 0 ? (
        <p className="text-center text-muted-foreground">No services published yet.</p>
      ) : (
        <>
          <div className="grid lg:grid-cols-5 gap-6 mb-6">
            <div
              className="lg:col-span-3 relative min-h-[320px] overflow-hidden group"
              style={{ borderRadius: "3rem 3rem 3rem 1rem" }}
              data-testid="tile-home-services-feature"
            >
              <img
                src={featureImage}
                alt="Grays Park Masjid community"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-7 md:p-8">
                <h3 className="text-xl font-serif text-primary-foreground mb-2">Join our growing family</h3>
                <p className="text-primary-foreground/75 text-sm max-w-xs mb-4">
                  Everyone is welcome, from first prayer to lifelong member.
                </p>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-foreground underline decoration-primary-foreground/40 underline-offset-4 hover:decoration-primary-foreground transition-colors"
                >
                  View all services <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-6">
              {featured.length === 0 ? (
                <p className="text-sm text-muted-foreground">No services published yet.</p>
              ) : (
                featured.map((service) => (
                  <Card
                    key={service.id}
                    className="border-card-border bg-card flex-1 overflow-hidden"
                    style={{ borderRadius: "2rem 2rem 2rem 0.75rem" }}
                    data-testid={`card-home-service-${service.id}`}
                  >
                    <CardContent className="p-6 md:p-7">
                      <ArchIconBadgeFor service={service} />
                      <p className="font-serif text-base mt-4 mb-2">{service.title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {rest.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {rest.map((service, idx) => (
                <Card
                  key={service.id}
                  className="group relative overflow-hidden border-card-border bg-card rounded-tl-[2rem] rounded-tr-[2rem] rounded-bl-[2rem] rounded-br-md transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  data-testid={`card-home-service-${service.id}`}
                >
                  <IslamicPattern className="pointer-events-none absolute -right-5 -top-5 h-24 w-24 text-primary/[0.05] transition-colors duration-300 group-hover:text-primary/[0.09]" />
                  <CardContent className="relative p-5 md:p-6">
                    <div className="flex items-start justify-between mb-4">
                      <ArchIconBadgeFor service={service} />
                      <span className="font-serif text-2xl leading-none text-primary/10">
                        {String(idx + 3).padStart(2, "0")}
                      </span>
                    </div>
                    <p className="font-serif text-base mb-1.5">{service.title}</p>
                    <div className="w-7 h-[2px] bg-secondary mb-3" />
                    <p className="text-xs text-muted-foreground leading-relaxed">{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function formatEventDay(startsAt: string) {
  const d = parseISO(startsAt);
  return { day: format(d, "d"), month: format(d, "MMM").toUpperCase() };
}

function ThisWeekSection() {
  const { data: eventsData, isLoading: eventsLoading } = useListEventsPublic();
  const { data: announcementsData, isLoading: announcementsLoading } = useListAnnouncementsPublic();
  const { todayRow, isLoading: prayerLoading } = usePrayerTimesToday();

  const now = Date.now();
  const upcomingEvents = [...(eventsData ?? [])]
    .filter((e) => new Date(e.startsAt).getTime() >= now)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, 3);

  const topAnnouncements = [...(announcementsData ?? [])]
    .filter((a) => a.published)
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const aDate = a.publishedAt ?? a.createdAt;
      const bDate = b.publishedAt ?? b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    })
    .slice(0, 3);

  function to12Hour(time?: string | null): string {
    if (!time) return "";
    const [hStr, mStr] = time.split(":");
    let h = Number(hStr);
    const period = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${mStr} ${period}`;
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 w-full">
      <div className="flex items-end justify-between gap-4 mb-10 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-10 bg-secondary/60" />
            <IslamicStar className="h-4 w-4 text-secondary" />
          </div>
          <h2 className="font-serif text-3xl mb-2">This Week at the Masjid</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Upcoming gatherings, classes and reminders from the community.
          </p>
        </div>
        <Link href="/events" className="hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          View all events <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {eventsLoading ? (
        <p className="text-center text-muted-foreground">Loading events...</p>
      ) : upcomingEvents.length === 0 ? (
        <p className="text-center text-muted-foreground">No upcoming events at this time.</p>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {upcomingEvents.map((event) => {
            const { day, month } = formatEventDay(event.startsAt);
            return (
              <Link
                key={event.id}
                href="/events"
                className="group overflow-hidden bg-card border border-card-border block"
                style={{ borderRadius: "1.75rem 1.75rem 1.75rem 0.5rem" }}
                data-testid={`item-home-event-${event.id}`}
              >
                <div className="relative h-44 overflow-hidden bg-primary">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <CalendarDays className="h-8 w-8 text-primary-foreground/50" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-card/95 rounded-xl px-3 py-1.5 text-center leading-none shadow-sm">
                    <p className="text-lg font-serif text-primary">{day}</p>
                    <p className="text-[10px] font-semibold tracking-wide text-muted-foreground mt-0.5">{month}</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-base leading-snug mb-3">{event.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Clock className="h-3.5 w-3.5 shrink-0" /> {format(parseISO(event.startsAt), "h:mm a")}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" /> {event.location}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <Card
          className="lg:col-span-2 border-card-border overflow-hidden"
          style={{ borderRadius: "1.75rem 1.75rem 1.75rem 0.5rem" }}
          data-testid="card-home-announcements"
        >
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary" />
                <span className="uppercase tracking-[0.1em] text-xs font-semibold">Announcements</span>
              </div>
              <Link href="/announcements" className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {announcementsLoading ? (
              <p className="text-sm text-muted-foreground">Loading announcements...</p>
            ) : topAnnouncements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No announcements at this time.</p>
            ) : (
              <div className="divide-y divide-border">
                {topAnnouncements.map((announcement) => (
                  <div key={announcement.id} className="py-3 first:pt-0 last:pb-0" data-testid={`item-home-announcement-${announcement.id}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium leading-snug">{announcement.title}</p>
                      {announcement.pinned && (
                        <Badge variant="secondary" className="shrink-0 gap-1">
                          <Pin className="h-3 w-3" /> Pinned
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{announcement.body}</p>
                    {announcement.publishedAt && (
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        {format(parseISO(announcement.publishedAt), "d MMM yyyy")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div
          className="relative overflow-hidden bg-primary text-primary-foreground p-6 md:p-7 flex flex-col"
          style={{ borderRadius: "1.75rem 1.75rem 1.75rem 0.5rem" }}
          data-testid="card-home-jumuah-reminder"
        >
          <IslamicPattern className="pointer-events-none absolute -right-6 -bottom-6 h-40 w-40 text-primary-foreground/[0.06]" />
          <h3 className="font-serif text-xl mb-1 relative">Jumu'ah Reminder</h3>
          <div className="w-10 h-[2px] bg-secondary mb-4 relative" />
          <div className="space-y-3 mb-6 relative flex-1">
            <div className="flex items-center gap-2.5 text-sm">
              <Clock className="h-4 w-4 text-secondary shrink-0" />
              <span>
                {prayerLoading
                  ? "Loading khutbah time..."
                  : todayRow?.jummahKhutbah
                    ? `Khutbah starts at ${to12Hour(todayRow.jummahKhutbah)}`
                    : "See Prayer Times page for Jumu'ah timings"}
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <Users className="h-4 w-4 text-secondary shrink-0" />
              <span>Please arrive early</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <HeartHandshake className="h-4 w-4 text-secondary shrink-0" />
              <span>Separate facilities for sisters</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm">
              <MapPin className="h-4 w-4 text-secondary shrink-0" />
              <span>Car park available</span>
            </div>
          </div>
          <Link href="/jumuah" className="relative">
            <Button className="w-full rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2" data-testid="button-jumuah-information">
              Jumu'ah Information <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function IslamicEducationSection() {
  const { data, isLoading } = useListCoursesPublic();
  const courses = [...(data ?? [])].filter((c) => c.published).slice(0, 6);

  return (
    <section className="bg-muted/40 border-y border-border">
      <div className="mx-auto max-w-6xl px-6 py-16 w-full">
        <div className="flex items-end justify-between gap-4 mb-10 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <IslamicStar className="h-4 w-4 text-secondary" />
              <span className="uppercase tracking-[0.15em] text-xs font-semibold text-secondary-foreground/80">
                Islamic Education
              </span>
            </div>
            <h2 className="font-serif text-3xl mb-2">Nurturing Knowledge, Strengthening Faith</h2>
            <p className="text-sm text-muted-foreground">Building the future of our community, one class at a time.</p>
          </div>
          <Link href="/education">
            <Button variant="outline" className="rounded-full gap-2" data-testid="button-view-all-courses">
              View All Courses <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading courses...</p>
        ) : courses.length === 0 ? (
          <p className="text-center text-muted-foreground">No courses published yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="border-card-border bg-card overflow-hidden"
                style={{ borderRadius: "2rem 2rem 2rem 0.75rem" }}
                data-testid={`card-home-course-${course.id}`}
              >
                <CardContent className="py-6">
                  <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-serif text-base mb-1">{course.title}</p>
                  {course.ageGroup && (
                    <p className="text-xs text-muted-foreground mb-3">{course.ageGroup}</p>
                  )}
                  <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
                    {course.schedule && (
                      <div className="flex items-center gap-2">
                        <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                        <span>{course.schedule}</span>
                      </div>
                    )}
                    {course.fee && (
                      <div className="flex items-center gap-2">
                        <PoundSterling className="h-3.5 w-3.5 shrink-0" />
                        <span>£{course.fee}</span>
                      </div>
                    )}
                  </div>
                  <Link href="/education">
                    <Button variant="outline" size="sm" className="w-full rounded-full" data-testid={`button-home-course-info-${course.id}`}>
                      More Info
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div
          className="mt-10 bg-primary text-primary-foreground px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderRadius: "1.75rem 1.75rem 1.75rem 0.5rem" }}
        >
          <p className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-secondary shrink-0" />
            Registration is now open for all classes. Limited spaces available.
          </p>
          <Link href="/education" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2" data-testid="button-register-classes">
              Register For Classes <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function GallerySection() {
  const { data, isLoading } = useListGalleryAlbumsPublic();
  const albums = [...(data ?? [])].slice(0, 8);

  return (
    <section className="bg-primary text-primary-foreground relative overflow-hidden">
      <IslamicPattern className="pointer-events-none absolute -left-10 bottom-0 h-64 w-64 text-primary-foreground/[0.04]" />
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24 w-full relative">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="h-px w-10 md:w-14 bg-secondary/60" />
          <IslamicStar className="h-4 w-4 text-secondary" />
          <span className="h-px w-10 md:w-14 bg-secondary/60" />
        </div>
        <span className="block text-center uppercase tracking-[0.15em] text-xs font-semibold text-secondary mb-1">
          Gallery
        </span>
        <h2 className="text-center font-serif text-3xl md:text-[2rem] mb-10">
          Moments from our community
        </h2>

        {isLoading ? (
          <p className="text-center text-primary-foreground/70">Loading gallery...</p>
        ) : albums.length === 0 ? (
          <p className="text-center text-primary-foreground/70">No gallery albums published yet.</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 auto-rows-[130px] sm:auto-rows-[150px] md:auto-rows-[170px] gap-4 md:gap-5">
            {albums.map((album, idx) => {
              const span = GALLERY_SPANS[idx % GALLERY_SPANS.length];
              return (
                <Link
                  key={album.id}
                  href="/gallery"
                  className={span}
                  data-testid={`link-home-gallery-album-${album.id}`}
                >
                  <div
                    className="group relative h-full w-full overflow-hidden cursor-pointer"
                    style={{ borderRadius: "1.5rem" }}
                  >
                    {album.coverImageUrl ? (
                      <img
                        src={album.coverImageUrl}
                        alt={album.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary-foreground/10 flex items-center justify-center">
                        <Images className="h-8 w-8 text-primary-foreground/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                    <p className="absolute bottom-2.5 left-3 right-3 text-xs md:text-sm font-medium text-white leading-snug">
                      {album.title}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/gallery">
            <Button className="rounded-full gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90" data-testid="button-view-full-gallery">
              View Full Gallery <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
