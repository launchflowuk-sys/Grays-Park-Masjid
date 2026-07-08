import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { useGetSettingPublic } from "@workspace/api-client-react";
import { Clock, Mic, Users } from "lucide-react";
import { IslamicPattern, IslamicStar, ArchIconBadge } from "@/components/site/islamic-pattern";
import { Link } from "wouter";

const DEFAULT_CONTENT = `Jumu'ah (Friday) prayer is held weekly at Grays Park Masjid and is open to all brothers and sisters. Please arrive early as the hall fills up quickly, especially during the khutbah (sermon).

The khutbah is delivered in English with key reminders also given in Urdu/Bengali where relevant, focusing on practical guidance for daily life alongside Qur'an and Sunnah teachings.

Overflow prayer space is available in the main hall extension during busier weeks such as Ramadan.`;

const FEATURES = [
  {
    icon: Clock,
    title: "Two Khutbahs",
    description: "See our Prayer Times page for exact Jumu'ah timings, which change with the seasons.",
  },
  {
    icon: Mic,
    title: "English Khutbah",
    description: "Delivered mainly in English, accessible to all ages and backgrounds.",
  },
  {
    icon: Users,
    title: "All Welcome",
    description: "Sisters' hall available with a separate entrance and full audio relay.",
  },
];

export default function JumuahPage() {
  const { data } = useGetSettingPublic("jumuah_content");
  const content = data?.value || DEFAULT_CONTENT;

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
            <p className="font-serif text-secondary text-2xl md:text-3xl mb-4 tracking-wider" aria-label="Jumu'ah Arabic">
              يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا نُودِيَ لِلصَّلَاةِ
            </p>
            <h1 className="font-serif text-4xl md:text-5xl">Jumu'ah Prayer</h1>
            <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto text-lg leading-relaxed">
              Join us every Friday for the weekly congregational prayer and khutbah.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto max-w-4xl px-6 py-14 md:py-16">
          <div className="flex items-center gap-3 mb-8">
            <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
            <h2 className="font-serif text-3xl">About Jumu'ah at Our Masjid</h2>
          </div>
          <div className="border-l-4 border-secondary pl-6 mb-6">
            <p className="text-lg font-serif italic text-foreground/80 leading-relaxed">
              "O you who believe! When the call for prayer is made on Friday, hasten to the remembrance of Allah."
              <span className="block text-sm text-muted-foreground mt-2 not-italic">— Surah Al-Jumu'ah (62:9)</span>
            </p>
          </div>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base" data-testid="text-jumuah-content">
            {content}
          </p>
        </section>

        {/* Features on pattern band */}
        <section className="relative overflow-hidden border-y border-primary/10">
          <div className="absolute inset-0 bg-primary/5" />
          <IslamicPattern className="absolute inset-0 w-full h-full text-primary/[0.04] [background-size:60px_60px]" />
          <div className="relative mx-auto max-w-6xl px-6 py-14">
            <div className="grid sm:grid-cols-3 gap-6">
              {FEATURES.map((feat) => (
                <div
                  key={feat.title}
                  className="group bg-card rounded-2xl border border-card-border px-6 py-8 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                >
                  <IslamicPattern className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 text-primary/[0.05] group-hover:text-primary/[0.1] transition-colors duration-300" />
                  <ArchIconBadge icon={feat.icon} className="mx-auto mb-4" />
                  <div className="w-8 h-[2px] bg-secondary mx-auto mt-4 mb-3" />
                  <p className="font-serif text-lg mb-2">{feat.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative bg-primary text-primary-foreground overflow-hidden">
          <IslamicPattern className="absolute inset-0 w-full h-full text-white/5 [background-size:60px_60px]" />
          <IslamicStar className="absolute -top-6 -right-6 w-36 h-36 text-white/5" />
          <div className="relative mx-auto max-w-3xl px-6 py-14 text-center">
            <h2 className="font-serif text-3xl md:text-4xl mb-4">See Today's Jumu'ah Time</h2>
            <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
              Jumu'ah iqamah times change throughout the year. Check our prayer times page for this week's schedule.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/prayer-times">
                <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold">
                  Prayer Times
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
