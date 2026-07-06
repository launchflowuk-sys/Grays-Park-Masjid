import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, HandHeart, MapPin, GraduationCap, Users, BookOpen } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { useListPrayerTimesPublic } from "@workspace/api-client-react";

const PRAYER_ORDER = [
  { key: "fajr", label: "Fajr" },
  { key: "dhuhr", label: "Dhuhr" },
  { key: "asr", label: "Asr" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isha", label: "Isha" },
] as const;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function Home() {
  const { data: prayerTimes, isLoading } = useListPrayerTimesPublic();
  const today = todayIso();
  const todayRow = prayerTimes?.find((p) => p.date === today);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />

      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-10 pointer-events-none [background-image:radial-gradient(circle_at_20%_20%,white,transparent_35%),radial-gradient(circle_at_80%_60%,white,transparent_30%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32 text-center">
          <p className="uppercase tracking-[0.3em] text-sm text-secondary font-medium mb-4">
            Serving our community since 1998
          </p>
          <h1 className="font-serif text-4xl md:text-6xl leading-tight max-w-3xl mx-auto">
            Welcome to Grays Park Masjid
          </h1>
          <p className="mt-6 text-primary-foreground/80 max-w-xl mx-auto text-lg">
            A place of worship, learning, and community for Muslims in Grays and the
            surrounding areas of Essex.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/prayer-times">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90" data-testid="button-hero-prayer-times">
                View Prayer Times
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
                data-testid="button-hero-visit"
              >
                Plan a Visit
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 w-full">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="font-serif text-2xl md:text-3xl text-center">Today's Prayer Times</h2>
        </div>
        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading prayer times...</p>
        ) : todayRow ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {PRAYER_ORDER.map((prayer) => (
              <Card key={prayer.key} className="text-center border-card-border" data-testid={`card-prayer-${prayer.key}`}>
                <CardContent className="py-6">
                  <p className="text-sm uppercase tracking-wide text-muted-foreground">
                    {prayer.label}
                  </p>
                  <p className="mt-2 font-serif text-2xl text-primary">
                    {todayRow[`${prayer.key}Iqamah` as keyof typeof todayRow] as string}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            Prayer times have not been published yet. Check back soon.
          </p>
        )}
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
