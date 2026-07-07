import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { useGetSettingPublic } from "@workspace/api-client-react";
import { BookOpenCheck, FileText, Heart } from "lucide-react";
import { IslamicPattern, IslamicStar, ArchIconBadge } from "@/components/site/islamic-pattern";
import { Link } from "wouter";

const DEFAULT_CONTENT = `Grays Park Masjid is pleased to conduct Nikah (Islamic marriage) ceremonies for couples in our community. Our Imam can officiate the ceremony at the masjid or, where suitable, at an external venue.

To arrange a Nikah, please contact the masjid office at least four weeks in advance so we can schedule pre-marriage guidance, verify documentation, and confirm a convenient date and time.

We also offer basic guidance on marriage counselling and can direct couples to community resources for pre- and post-marriage support.`;

const FEATURES = [
  {
    icon: Heart,
    title: "Nikah Ceremony",
    description: "Officiated by our Imam at the masjid or an approved external venue.",
  },
  {
    icon: FileText,
    title: "Documentation",
    description: "Guidance on paperwork, witnesses, and Nikah certificates.",
  },
  {
    icon: BookOpenCheck,
    title: "Pre-Marriage Guidance",
    description: "Basic counselling and resources for couples preparing for marriage.",
  },
];

export default function NikahPage() {
  const { data } = useGetSettingPublic("nikah_content");
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
            <p className="font-serif text-secondary text-2xl md:text-3xl mb-4 tracking-wider" aria-label="Nikah Arabic">
              وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا
            </p>
            <h1 className="font-serif text-4xl md:text-5xl">Nikah Services</h1>
            <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto text-lg leading-relaxed">
              Celebrating marriage according to the Sunnah, with care and guidance for every couple.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto max-w-4xl px-6 py-14 md:py-16">
          <div className="flex items-center gap-3 mb-8">
            <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
            <h2 className="font-serif text-3xl">Nikah at Grays Park Masjid</h2>
          </div>
          <div className="border-l-4 border-secondary pl-6 mb-6">
            <p className="text-lg font-serif italic text-foreground/80 leading-relaxed">
              "And among His signs is that He created for you mates from among yourselves, that you may dwell in tranquillity with them."
              <span className="block text-sm text-muted-foreground mt-2 not-italic">— Surah Ar-Rum (30:21)</span>
            </p>
          </div>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base" data-testid="text-nikah-content">
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
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Planning Your Nikah?</h2>
            <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
              Get in touch at least four weeks before your intended date to check availability and begin arrangements.
            </p>
            <Link href="/contact">
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold" data-testid="button-nikah-contact">
                Contact Us
              </Button>
            </Link>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
