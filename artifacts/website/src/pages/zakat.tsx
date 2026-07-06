import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetSettingPublic } from "@workspace/api-client-react";
import { Coins, HandCoins, Landmark } from "lucide-react";
import { Link } from "wouter";

const DEFAULT_CONTENT = `Zakat is one of the five pillars of Islam, an obligatory annual charity given by those whose wealth exceeds the Nisab threshold. Grays Park Masjid accepts Zakat donations and distributes them in accordance with the eight categories specified in the Qur'an, prioritising those in genuine need within our local community and beyond.

Sadaqah (voluntary charity) and Lillah (general donations for the sake of Allah) are also welcomed and support our day-to-day operations, from utility bills to community programmes.

If you are unsure how to calculate your Zakat, our team can point you to reliable calculators and, where needed, offer general guidance — though we recommend consulting a qualified scholar for personalised rulings.`;

export default function ZakatPage() {
  const { data } = useGetSettingPublic("zakat_content");
  const content = data?.value || DEFAULT_CONTENT;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h1 className="font-serif text-3xl md:text-4xl">Zakat, Sadaqah &amp; Lillah</h1>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              Fulfil your obligation and support our community through charitable giving.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="text-zakat-content">
            {content}
          </p>
        </section>

        <section className="bg-muted/40 border-y border-border">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid sm:grid-cols-3 gap-6">
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <Coins className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Zakat</p>
                  <p className="text-sm text-muted-foreground">
                    Obligatory annual charity distributed to those in genuine need.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <HandCoins className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Sadaqah</p>
                  <p className="text-sm text-muted-foreground">
                    Voluntary charity given at any time, in any amount.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <Landmark className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Lillah</p>
                  <p className="text-sm text-muted-foreground">
                    General donations supporting the masjid's day-to-day running costs.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="font-serif text-2xl mb-4">Ready to Give?</h2>
          <p className="text-muted-foreground mb-6">Visit our Donate page to give online or view bank transfer details.</p>
          <Link href="/donate">
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90" data-testid="button-zakat-donate">
              Donate Now
            </Button>
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
