import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetSettingPublic } from "@workspace/api-client-react";
import { Moon, Soup, Star } from "lucide-react";
import { Link } from "wouter";

const DEFAULT_CONTENT = `Ramadan Mubarak! Grays Park Masjid runs a full programme throughout the blessed month of Ramadan, including daily Iftar (fast-breaking meals), nightly Taraweeh prayers, and special Qur'an circles for all ages.

Iftar is provided free of charge each evening, generously funded through community donations and sponsorships. We welcome volunteers to help with food preparation, serving, and clean-up throughout the month.

Taraweeh prayers are led by our Huffaz (Qur'an memorisers) with a complete recitation of the Qur'an (Khatm) over the course of the month. The final ten nights include extended night prayers (Qiyam al-Layl) in search of Laylat al-Qadr.`;

export default function RamadanPage() {
  const { data } = useGetSettingPublic("ramadan_content");
  const content = data?.value || DEFAULT_CONTENT;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h1 className="font-serif text-3xl md:text-4xl">Ramadan at Grays Park Masjid</h1>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              A month of worship, community, and generosity — join us for Iftar and Taraweeh.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="text-ramadan-content">
            {content}
          </p>
        </section>

        <section className="bg-muted/40 border-y border-border">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid sm:grid-cols-3 gap-6">
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <Soup className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Daily Iftar</p>
                  <p className="text-sm text-muted-foreground">
                    Free fast-breaking meals served every evening throughout Ramadan.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <Moon className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Nightly Taraweeh</p>
                  <p className="text-sm text-muted-foreground">
                    Full Qur'an recitation led by our Huffaz across the month.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <Star className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Last Ten Nights</p>
                  <p className="text-sm text-muted-foreground">
                    Extended Qiyam al-Layl in search of Laylat al-Qadr.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="font-serif text-2xl mb-4">Support Our Ramadan Programme</h2>
          <p className="text-muted-foreground mb-6">
            Sponsor an Iftar or volunteer your time — every contribution helps.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/donate">
              <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90" data-testid="button-ramadan-donate">
                Donate
              </Button>
            </Link>
            <Link href="/volunteer">
              <Button variant="outline" data-testid="button-ramadan-volunteer">
                Volunteer
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
