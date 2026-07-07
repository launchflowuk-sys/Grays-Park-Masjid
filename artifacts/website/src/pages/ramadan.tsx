import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { useGetSettingPublic } from "@workspace/api-client-react";
import { Moon, Soup, Star } from "lucide-react";
import { IslamicPattern, IslamicStar, ArchIconBadge } from "@/components/site/islamic-pattern";
import { Link } from "wouter";

const DEFAULT_CONTENT = `Ramadan Mubarak! Grays Park Masjid runs a full programme throughout the blessed month of Ramadan, including daily Iftar (fast-breaking meals), nightly Taraweeh prayers, and special Qur'an circles for all ages.

Iftar is provided free of charge each evening, generously funded through community donations and sponsorships. We welcome volunteers to help with food preparation, serving, and clean-up throughout the month.

Taraweeh prayers are led by our Huffaz (Qur'an memorisers) with a complete recitation of the Qur'an (Khatm) over the course of the month. The final ten nights include extended night prayers (Qiyam al-Layl) in search of Laylat al-Qadr.`;

const FEATURES = [
  { icon: Soup, title: "Daily Iftar", arabic: "الإفطار", description: "Free fast-breaking meals served every evening throughout Ramadan." },
  { icon: Moon, title: "Nightly Taraweeh", arabic: "التراويح", description: "Full Qur'an recitation led by our Huffaz across the blessed month." },
  { icon: Star, title: "Last Ten Nights", arabic: "ليلة القدر", description: "Extended Qiyam al-Layl in search of the Night of Power." },
];

export default function RamadanPage() {
  const { data } = useGetSettingPublic("ramadan_content");
  const content = data?.value || DEFAULT_CONTENT;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative bg-primary text-primary-foreground overflow-hidden">
          <IslamicPattern className="absolute inset-0 w-full h-full text-white/5 [background-size:60px_60px]" />
          <IslamicStar className="absolute -top-10 -right-10 w-56 h-56 text-white/5" />
          <IslamicStar className="absolute -bottom-10 -left-10 w-48 h-48 text-white/5" />
          <IslamicStar className="absolute top-6 left-1/3 w-16 h-16 text-white/4" />
          <div className="relative mx-auto max-w-4xl px-6 py-16 md:py-20 text-center">
            <p className="font-serif text-secondary text-2xl md:text-3xl mb-4 tracking-wider">رَمَضَان مُبَارَك</p>
            <h1 className="font-serif text-4xl md:text-5xl">Ramadan at Grays Park Masjid</h1>
            <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto text-lg leading-relaxed">
              A month of worship, community, and generosity — join us for Iftar and Taraweeh.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-14 md:py-16">
          <div className="flex items-center gap-3 mb-8">
            <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
            <h2 className="font-serif text-3xl">Ramadan Programme</h2>
          </div>
          <div className="border-l-4 border-secondary pl-6 mb-6">
            <p className="text-lg font-serif italic text-foreground/80 leading-relaxed">
              "The month of Ramadan in which was revealed the Qur'an, a guidance for the people."
              <span className="block text-sm text-muted-foreground mt-2 not-italic">— Surah Al-Baqarah (2:185)</span>
            </p>
          </div>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base" data-testid="text-ramadan-content">
            {content}
          </p>
        </section>

        <section className="relative overflow-hidden border-y border-primary/10">
          <div className="absolute inset-0 bg-primary/5" />
          <IslamicPattern className="absolute inset-0 w-full h-full text-primary/[0.04] [background-size:60px_60px]" />
          <div className="relative mx-auto max-w-6xl px-6 py-14">
            <div className="grid sm:grid-cols-3 gap-6">
              {FEATURES.map((feat) => (
                <div key={feat.title} className="group bg-card rounded-2xl border border-card-border px-6 py-8 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden">
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

        <section className="relative bg-primary text-primary-foreground overflow-hidden">
          <IslamicPattern className="absolute inset-0 w-full h-full text-white/5 [background-size:60px_60px]" />
          <IslamicStar className="absolute -top-6 -right-6 w-36 h-36 text-white/5" />
          <div className="relative mx-auto max-w-3xl px-6 py-14 text-center">
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Support Our Ramadan Programme</h2>
            <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
              Sponsor an Iftar, donate towards Taraweeh expenses, or volunteer your time — every contribution helps.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/donate">
                <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold" data-testid="button-ramadan-donate">Donate</Button>
              </Link>
              <Link href="/volunteer">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" data-testid="button-ramadan-volunteer">Volunteer</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
