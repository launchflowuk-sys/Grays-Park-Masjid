import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { useGetSettingPublic } from "@workspace/api-client-react";
import { Heart, Phone, ShieldCheck } from "lucide-react";
import { IslamicPattern, IslamicStar, ArchIconBadge } from "@/components/site/islamic-pattern";
import { Link } from "wouter";

const DEFAULT_CONTENT = `Grays Park Masjid supports families through the Janazah (funeral) process with compassion and in accordance with Islamic guidance. We can assist with ghusl (ritual washing), kafan (shrouding), Salat al-Janazah (funeral prayer), and coordination with local burial grounds.

Our volunteer Janazah team is available at short notice — please contact the masjid office as soon as possible after a death so we can begin arrangements promptly, as Islamic burial should take place without unnecessary delay.

We also offer guidance and emotional support to bereaved families, and can put you in touch with sympathetic funeral directors experienced in Islamic burials.`;

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Ghusl & Kafan",
    description: "Ritual washing and shrouding performed by trained, experienced volunteers.",
  },
  {
    icon: Heart,
    title: "Salat al-Janazah",
    description: "Funeral prayer held at the masjid for the community to attend and make du'a.",
  },
  {
    icon: Phone,
    title: "24/7 Contact",
    description: "Call our office immediately following a death for urgent guidance and support.",
  },
];

export default function FuneralPage() {
  const { data } = useGetSettingPublic("funeral_content");
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
            <p className="font-serif text-secondary text-xl md:text-2xl mb-4 tracking-wider" aria-label="Inna lillahi wa inna ilayhi raji'un">
              إِنَّا لِلَّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
            </p>
            <h1 className="font-serif text-4xl md:text-5xl">Funeral &amp; Janazah Services</h1>
            <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto text-lg leading-relaxed">
              Compassionate support and guidance for families during a most difficult time.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto max-w-4xl px-6 py-14 md:py-16">
          <div className="flex items-center gap-3 mb-8">
            <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
            <h2 className="font-serif text-3xl">Janazah Services</h2>
          </div>
          <div className="border-l-4 border-secondary pl-6 mb-6">
            <p className="text-lg font-serif italic text-foreground/80 leading-relaxed">
              "Indeed, we belong to Allah, and indeed to Him we will return."
              <span className="block text-sm text-muted-foreground mt-2 not-italic">— Surah Al-Baqarah (2:156)</span>
            </p>
          </div>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base" data-testid="text-funeral-content">
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
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Need Immediate Assistance?</h2>
            <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
              Please get in touch with us as soon as possible so we can support your family during this time.
            </p>
            <Link href="/contact">
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold" data-testid="button-funeral-contact">
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
