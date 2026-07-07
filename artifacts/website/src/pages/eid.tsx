import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { useGetSettingPublic } from "@workspace/api-client-react";
import { PartyPopper, Sun, Users2 } from "lucide-react";
import { IslamicPattern, IslamicStar, ArchIconBadge } from "@/components/site/islamic-pattern";
import { Link } from "wouter";

const DEFAULT_CONTENT = `Eid Mubarak! Grays Park Masjid holds multiple Eid prayer congregations for both Eid al-Fitr and Eid al-Adha to accommodate our growing community, with a dedicated marquee or hired hall used for overflow when needed.

Please check our Events page and social media closer to each Eid for exact prayer times, the number of congregations, and the venue for that year, as these can vary depending on expected attendance.

Family activities, refreshments, and a children's Eid fair are typically organised after the prayers — a wonderful opportunity to celebrate together as a community.`;

const FEATURES = [
  { icon: Sun, title: "Multiple Congregations", description: "Several Eid prayer times to accommodate every member of our community." },
  { icon: PartyPopper, title: "Community Celebration", description: "Refreshments and a children's Eid fair after the prayers." },
  { icon: Users2, title: "Family Friendly", description: "A welcoming atmosphere for families and children of all ages." },
];

export default function EidPage() {
  const { data } = useGetSettingPublic("eid_content");
  const content = data?.value || DEFAULT_CONTENT;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative bg-primary text-primary-foreground overflow-hidden">
          <IslamicPattern className="absolute inset-0 w-full h-full text-white/5 [background-size:60px_60px]" />
          <IslamicStar className="absolute -top-10 -right-10 w-56 h-56 text-white/5" />
          <IslamicStar className="absolute -bottom-10 -left-10 w-48 h-48 text-white/5" />
          <div className="relative mx-auto max-w-4xl px-6 py-16 md:py-20 text-center">
            <p className="font-serif text-secondary text-2xl md:text-3xl mb-4 tracking-wider">عيد مبارك</p>
            <h1 className="font-serif text-4xl md:text-5xl">Eid Celebrations</h1>
            <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto text-lg leading-relaxed">
              Join our community for Eid al-Fitr and Eid al-Adha prayers and celebrations.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-14 md:py-16">
          <div className="flex items-center gap-3 mb-8">
            <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
            <h2 className="font-serif text-3xl">Eid at Our Masjid</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base" data-testid="text-eid-content">
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
                  <p className="font-serif text-lg mb-2">{feat.title}</p>
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
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Check Eid Times</h2>
            <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
              Eid times are announced closer to the date. Check our Events page for the latest information.
            </p>
            <Link href="/events">
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold">View Events</Button>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
