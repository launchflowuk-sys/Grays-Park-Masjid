import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { useGetSettingPublic } from "@workspace/api-client-react";
import { PartyPopper, Sun, Users2 } from "lucide-react";

const DEFAULT_CONTENT = `Eid Mubarak! Grays Park Masjid holds multiple Eid prayer congregations for both Eid al-Fitr and Eid al-Adha to accommodate our growing community, with a dedicated marquee or hired hall used for overflow when needed.

Please check our Events page and social media closer to each Eid for exact prayer times, the number of congregations, and the venue for that year, as these can vary depending on expected attendance.

Family activities, refreshments, and a children's Eid fair are typically organised after the prayers — a wonderful opportunity to celebrate together as a community.`;

export default function EidPage() {
  const { data } = useGetSettingPublic("eid_content");
  const content = data?.value || DEFAULT_CONTENT;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h1 className="font-serif text-3xl md:text-4xl">Eid Celebrations</h1>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              Join our community for Eid al-Fitr and Eid al-Adha prayers and celebrations.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="text-eid-content">
            {content}
          </p>
        </section>

        <section className="bg-muted/40 border-y border-border">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid sm:grid-cols-3 gap-6">
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <Sun className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Multiple Congregations</p>
                  <p className="text-sm text-muted-foreground">
                    Several Eid prayer times to accommodate our whole community.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <PartyPopper className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Community Celebration</p>
                  <p className="text-sm text-muted-foreground">
                    Refreshments and a children's Eid fair after the prayers.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <Users2 className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Family Friendly</p>
                  <p className="text-sm text-muted-foreground">
                    A welcoming atmosphere for families and children of all ages.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
