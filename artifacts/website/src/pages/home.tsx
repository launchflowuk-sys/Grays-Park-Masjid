import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { HeroPrayerCard } from "@/components/hero-prayer-card";
import { TodayPrayersBar } from "@/components/today-prayers-bar";
import { ArchIconBadge, IslamicPattern } from "@/components/site/islamic-pattern";
import { useListDonationCampaignsPublic, useListServicesPublic } from "@workspace/api-client-react";
import heroImage from "@assets/Home_Hero_1783357048983.png";
import mosqueConstructionImage from "@assets/generated_images/mosque_construction.png";

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
        <div className="relative overflow-hidden md:min-h-[740px]">
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="Grays Park Masjid building and grounds"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/55 via-primary/15 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl px-6 w-full flex flex-col gap-12 md:h-full md:justify-between py-10 md:py-12">
            <div className="max-w-3xl pt-2 md:pt-4">
              <span className="inline-block rounded-full bg-black/40 backdrop-blur-sm border border-white/10 px-4 py-2 uppercase tracking-[0.15em] text-xs md:text-sm text-secondary font-semibold mb-5">
                In the name of Allah, the Most Gracious, the Most Merciful
              </span>
              <div className="inline-block bg-black/35 backdrop-blur-[2px] rounded-2xl px-5 py-5 md:px-7 md:py-6 -mx-1">
                <h1 className="font-serif text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.1] text-primary-foreground">
                  A Place of Worship,
                  <br />
                  Learning &amp; Community
                </h1>
                <div className="w-14 h-[3px] bg-secondary my-6" />
                <p className="text-base md:text-lg text-primary-foreground/95 leading-relaxed max-w-md">
                  Grays Park Masjid is a welcoming center for worship, education and
                  community service. All are welcome.
                </p>
              </div>
              <div className="mt-9 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 md:gap-4">
                <Link href="/prayer-times" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-12 md:h-14 px-6 md:px-8 text-sm md:text-base bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                    data-testid="button-hero-prayer-times"
                  >
                    View Prayer Times <Clock className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/donate" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto h-12 md:h-14 px-6 md:px-8 text-sm md:text-base bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2"
                    data-testid="button-hero-donate"
                  >
                    Donate Now <HandHeart className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/about" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto h-12 md:h-14 px-6 md:px-8 text-sm md:text-base border-2 border-primary-foreground/80 text-primary-foreground hover:bg-primary-foreground/10 gap-2"
                    data-testid="button-hero-visit"
                  >
                    Visit Us <MapPin className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="pb-2 md:pb-4">
              <HeroPrayerCard />
            </div>
          </div>
        </div>

        <div className="bg-primary pt-10 pb-10 md:pt-10 md:pb-10">
          <div className="mx-auto max-w-6xl px-6 grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4">
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

      <section className="mx-auto max-w-6xl px-6 pt-10 md:pt-12 w-full">
        <TodayPrayersBar />
      </section>

      <MosqueProjectSection />

      <ServicesSection />

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <HandHeart className="h-10 w-10 text-secondary mx-auto mb-4" />
          <h2 className="font-serif text-3xl mb-4">Support Our Masjid</h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Your generosity keeps our doors open and our community thriving. Every donation,
            large or small, makes a difference.
          </p>
          <Link href="/donate">
            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90" data-testid="button-donate-cta">
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
    <section className="mx-auto max-w-6xl px-6 py-16 w-full">
      <div className="rounded-2xl border border-card-border bg-card overflow-hidden">
        <div className="grid lg:grid-cols-[1fr_1.1fr_0.9fr] gap-8 lg:gap-6 p-6 md:p-8 lg:items-center">
          <div>
            <span className="inline-block uppercase tracking-[0.15em] text-xs font-semibold text-secondary-foreground/80 mb-3">
              New Mosque Project
            </span>
            <h2 className="font-serif text-3xl md:text-[2rem] leading-tight mb-4">
              Building for our future, together.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {campaign.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/donate" className="w-full sm:w-auto">
                <Button
                  className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                  data-testid="button-mosque-donate-now"
                >
                  Donate Now <HandHeart className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto gap-2"
                  data-testid="button-mosque-learn-more"
                >
                  Learn More <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div>
            {target && (
              <>
                <p className="uppercase tracking-[0.1em] text-xs text-muted-foreground mb-1">
                  Total Target
                </p>
                <p className="font-serif text-2xl md:text-3xl mb-4">{formatCurrency(String(target))}</p>
                <p className="uppercase tracking-[0.1em] text-xs text-muted-foreground mb-1">
                  Raised So Far
                </p>
                <p className="font-serif text-2xl md:text-3xl text-primary mb-3">
                  {formatCurrency(campaign.raisedAmount)}
                </p>
                <Progress value={pct ?? 0} className="h-2.5 mb-2" data-testid="progress-mosque-project" />
                <p className="text-xs font-medium text-primary mb-5">{pct}% Completed</p>
              </>
            )}

            <div className="grid grid-cols-5 gap-2 mb-5">
              {PRESET_AMOUNTS.map((preset) => (
                <Link key={preset} href="/donate">
                  <Button
                    type="button"
                    variant={preset === "50" ? "default" : "outline"}
                    className={`w-full ${preset === "50" ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`}
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
                  className="w-full border-secondary text-secondary-foreground hover:bg-secondary/10"
                  data-testid="button-preset-amount-custom"
                >
                  Custom
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

          <div className="hidden lg:block">
            <img
              src={campaign.imageUrl || mosqueConstructionImage}
              alt="New mosque construction project"
              className="w-full h-full min-h-[260px] object-cover rounded-xl"
              data-testid="img-mosque-project"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  const { data, isLoading } = useListServicesPublic();
  const sorted = [...(data ?? [])].filter((s) => s.published).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 w-full">
      <div className="flex items-end justify-between gap-4 mb-10 flex-wrap">
        <div>
          <span className="inline-block uppercase tracking-[0.15em] text-xs font-semibold text-secondary-foreground/80 mb-2">
            Our Services
          </span>
          <h2 className="font-serif text-3xl">Serving Our Community</h2>
        </div>
        <Link href="/services">
          <Button variant="outline" className="gap-2" data-testid="button-view-all-services">
            View All Services <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground">Loading services...</p>
      ) : sorted.length === 0 ? (
        <p className="text-center text-muted-foreground">No services published yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-5">
          {sorted.slice(0, 8).map((service, idx) => (
            <Card
              key={service.id}
              className="group relative overflow-hidden border-card-border bg-card rounded-tl-md rounded-tr-2xl rounded-bl-2xl rounded-br-md transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              data-testid={`card-home-service-${service.id}`}
            >
              <IslamicPattern className="pointer-events-none absolute -right-5 -top-5 h-24 w-24 text-primary/[0.05] transition-colors duration-300 group-hover:text-primary/[0.09]" />
              <CardContent className="relative p-5 md:p-6">
                <div className="flex items-start justify-between mb-4">
                  <ArchIconBadgeFor service={service} />
                  <span className="font-serif text-2xl leading-none text-primary/10">
                    {String(idx + 1).padStart(2, "0")}
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
    </section>
  );
}
