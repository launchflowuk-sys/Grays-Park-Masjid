import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { useGetSettingPublic } from "@workspace/api-client-react";
import { BookOpen, Clock, Users } from "lucide-react";
import { IslamicPattern, IslamicStar, ArchIconBadge } from "@/components/site/islamic-pattern";
import { Link } from "wouter";

const DEFAULT_CONTENT = `Our Madrassah provides structured Islamic education for children aged 5 to 16, covering Qur'an recitation and memorisation (Hifz and Nazira), Islamic studies (Aqeedah, Fiqh, Seerah), and basic Arabic reading and writing.

Classes run every weekday evening after Maghrib, plus a dedicated weekend programme on Saturday and Sunday mornings for families who prefer weekend-only attendance. Children are grouped by age and ability, with regular progress assessments shared with parents.

Our teachers are qualified in Tajweed and child safeguarding, and all Madrassah staff undergo enhanced DBS checks. We keep class sizes small to ensure every student gets individual attention.`;

const FEATURES = [
  {
    icon: BookOpen,
    title: "Curriculum",
    arabic: "المنهج",
    description: "Qur'an, Tajweed, Islamic studies (Aqeedah, Fiqh, Seerah), and Arabic language.",
  },
  {
    icon: Clock,
    title: "Timings",
    arabic: "المواعيد",
    description: "Weekday evenings after Maghrib, plus Saturday and Sunday morning classes.",
  },
  {
    icon: Users,
    title: "Ages 5–16",
    arabic: "الأعمار",
    description: "Small class sizes grouped by age and ability, with regular parent updates.",
  },
];

export default function MadrassahPage() {
  const { data } = useGetSettingPublic("madrassah_content");
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
            <p className="font-serif text-secondary text-2xl md:text-3xl mb-4 tracking-wider" aria-label="Iqra">
              اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ
            </p>
            <h1 className="font-serif text-4xl md:text-5xl">Madrassah</h1>
            <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto text-lg leading-relaxed">
              Qur'an, Islamic studies, and Arabic classes for children in a caring, structured environment.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto max-w-4xl px-6 py-14 md:py-16">
          <div className="flex items-center gap-3 mb-8">
            <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
            <h2 className="font-serif text-3xl">Islamic Education for Children</h2>
          </div>
          <div className="border-l-4 border-secondary pl-6 mb-6">
            <p className="text-lg font-serif italic text-foreground/80 leading-relaxed">
              "Read! In the name of your Lord who created."
              <span className="block text-sm text-muted-foreground mt-2 not-italic">— Surah Al-'Alaq (96:1) — the first words of revelation</span>
            </p>
          </div>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base" data-testid="text-madrassah-content">
            {content}
          </p>
        </section>

        {/* Features */}
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
                  <p className="font-serif text-lg mb-1">{feat.title}</p>
                  <p className="font-serif text-xs text-secondary/70 mb-3">{feat.arabic}</p>
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
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Ready to Enrol?</h2>
            <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
              Register your child through our Education page or get in touch with any questions about the programme.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/education">
                <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold" data-testid="button-madrassah-register">
                  View Classes &amp; Register
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" data-testid="button-madrassah-contact">
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
