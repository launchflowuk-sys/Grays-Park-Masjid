import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { useGetSettingPublic } from "@workspace/api-client-react";
import { Coins, HandCoins, Landmark } from "lucide-react";
import { IslamicPattern, IslamicStar, ArchIconBadge } from "@/components/site/islamic-pattern";
import { Link } from "wouter";

const DEFAULT_CONTENT = `Zakat is one of the five pillars of Islam, an obligatory annual charity given by those whose wealth exceeds the Nisab threshold. Grays Park Masjid accepts Zakat donations and distributes them in accordance with the eight categories specified in the Qur'an, prioritising those in genuine need within our local community and beyond.

Sadaqah (voluntary charity) and Lillah (general donations for the sake of Allah) are also welcomed and support our day-to-day operations, from utility bills to community programmes.

If you are unsure how to calculate your Zakat, our team can point you to reliable calculators and, where needed, offer general guidance — though we recommend consulting a qualified scholar for personalised rulings.`;

const FEATURES = [
  {
    icon: Coins,
    title: "Zakat",
    arabic: "الزكاة",
    description: "Obligatory annual charity distributed to those in genuine need.",
  },
  {
    icon: HandCoins,
    title: "Sadaqah",
    arabic: "الصدقة",
    description: "Voluntary charity given at any time, in any amount, for the sake of Allah.",
  },
  {
    icon: Landmark,
    title: "Lillah",
    arabic: "لله",
    description: "General donations supporting the masjid's day-to-day running costs.",
  },
];

export default function ZakatPage() {
  const { data } = useGetSettingPublic("zakat_content");
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
            <p className="font-serif text-secondary text-2xl md:text-3xl mb-4 tracking-wider" aria-label="Zakat Ayah">
              وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ
            </p>
            <h1 className="font-serif text-4xl md:text-5xl">Zakat, Sadaqah &amp; Lillah</h1>
            <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto text-lg leading-relaxed">
              Fulfil your obligation and support our community through charitable giving.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto max-w-4xl px-6 py-14 md:py-16">
          <div className="flex items-center gap-3 mb-8">
            <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
            <h2 className="font-serif text-3xl">Giving in the Way of Allah</h2>
          </div>
          <div className="border-l-4 border-secondary pl-6 mb-6">
            <p className="text-lg font-serif italic text-foreground/80 leading-relaxed">
              "Establish the prayer and give Zakat."
              <span className="block text-sm text-muted-foreground mt-2 not-italic">— Surah Al-Baqarah (2:43)</span>
            </p>
          </div>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base" data-testid="text-zakat-content">
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
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Ready to Give?</h2>
            <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
              Donate online through our secure donation page. Every contribution — large or small — makes a difference.
            </p>
            <Link href="/donate">
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold" data-testid="button-zakat-donate">
                Donate Now
              </Button>
            </Link>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
