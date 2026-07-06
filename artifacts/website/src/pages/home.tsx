import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  HandHeart,
  MapPin,
  GraduationCap,
  Users,
  BookOpen,
  HeartHandshake,
  HandCoins,
  Calendar,
} from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { PrayerTimesWidget } from "@/components/prayer-times-widget";
import { HeroPrayerCard } from "@/components/hero-prayer-card";
import heroImage from "@assets/Home_Hero_1783357048983.png";

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
              <h1 className="font-serif text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.1] text-primary-foreground drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
                A Place of Worship,
                <br />
                Learning &amp; Community
              </h1>
              <div className="w-14 h-[3px] bg-secondary my-6" />
              <p className="text-base md:text-lg text-primary-foreground/90 leading-relaxed max-w-md drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)]">
                Grays Park Masjid is a welcoming center for worship, education and
                community service. All are welcome.
              </p>
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

      <section className="mx-auto max-w-6xl px-6 py-16 w-full">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="font-serif text-2xl md:text-3xl text-center">Today's Prayer Times</h2>
        </div>
        <PrayerTimesWidget variant="full" />
        <div className="text-center mt-8">
          <Link href="/prayer-times" className="text-primary font-medium hover:underline" data-testid="link-full-prayer-times">
            View full prayer timetable &rarr;
          </Link>
        </div>
      </section>

      <section className="bg-muted/40 border-y border-border">
        <div className="mx-auto max-w-6xl px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-serif text-3xl mb-4">About Our Masjid</h2>
            <p className="text-muted-foreground leading-relaxed">
              Grays Park Masjid has served the Muslim community of Grays and Thurrock for
              over two decades. We offer five daily prayers, Friday Jumu'ah, Islamic
              education for children and adults, and a range of community services.
            </p>
            <Link href="/about">
              <Button variant="link" className="px-0 mt-4 text-primary" data-testid="link-learn-more">
                Learn more about us &rarr;
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-card-border">
              <CardContent className="py-6">
                <MapPin className="h-6 w-6 text-primary mb-3" />
                <p className="font-medium">Grays, Essex</p>
                <p className="text-sm text-muted-foreground">United Kingdom</p>
              </CardContent>
            </Card>
            <Card className="border-card-border">
              <CardContent className="py-6">
                <HandHeart className="h-6 w-6 text-secondary mb-3" />
                <p className="font-medium">Support Us</p>
                <p className="text-sm text-muted-foreground">Sadaqah &amp; Zakat welcome</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 w-full">
        <h2 className="font-serif text-3xl mb-10 text-center">What We Offer</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <Card className="border-card-border text-center">
            <CardContent className="py-8">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-4" />
              <p className="font-serif text-lg mb-2">Islamic Education</p>
              <p className="text-sm text-muted-foreground">
                Quran classes and Islamic studies for children and adults.
              </p>
            </CardContent>
          </Card>
          <Card className="border-card-border text-center">
            <CardContent className="py-8">
              <Users className="h-8 w-8 text-primary mx-auto mb-4" />
              <p className="font-serif text-lg mb-2">Community Support</p>
              <p className="text-sm text-muted-foreground">
                Volunteering, welfare support, and events for the whole family.
              </p>
            </CardContent>
          </Card>
          <Card className="border-card-border text-center">
            <CardContent className="py-8">
              <GraduationCap className="h-8 w-8 text-primary mx-auto mb-4" />
              <p className="font-serif text-lg mb-2">Guidance &amp; Counsel</p>
              <p className="text-sm text-muted-foreground">
                Marriage services, funeral guidance, and pastoral care.
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="text-center mt-10">
          <Link href="/services">
            <Button size="lg" variant="outline" data-testid="button-view-services">
              View All Services
            </Button>
          </Link>
        </div>
      </section>

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
