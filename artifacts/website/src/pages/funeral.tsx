import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetSettingPublic } from "@workspace/api-client-react";
import { Heart, Phone, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

const DEFAULT_CONTENT = `Grays Park Masjid supports families through the Janazah (funeral) process with compassion and in accordance with Islamic guidance. We can assist with ghusl (ritual washing), kafan (shrouding), Salat al-Janazah (funeral prayer), and coordination with local burial grounds.

Our volunteer Janazah team is available at short notice — please contact the masjid office as soon as possible after a death so we can begin arrangements promptly, as Islamic burial should take place without unnecessary delay.

We also offer guidance and emotional support to bereaved families, and can put you in touch with sympathetic funeral directors experienced in Islamic burials.`;

export default function FuneralPage() {
  const { data } = useGetSettingPublic("funeral_content");
  const content = data?.value || DEFAULT_CONTENT;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h1 className="font-serif text-3xl md:text-4xl">Funeral &amp; Janazah Services</h1>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              Compassionate support and guidance for families during a difficult time.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="text-funeral-content">
            {content}
          </p>
        </section>

        <section className="bg-muted/40 border-y border-border">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid sm:grid-cols-3 gap-6">
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <ShieldCheck className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Ghusl &amp; Kafan</p>
                  <p className="text-sm text-muted-foreground">
                    Ritual washing and shrouding performed by trained volunteers.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <Heart className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Salat al-Janazah</p>
                  <p className="text-sm text-muted-foreground">
                    Funeral prayer held at the masjid for the community to attend.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <Phone className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">24/7 Contact</p>
                  <p className="text-sm text-muted-foreground">
                    Call our office immediately following a death for urgent guidance.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="font-serif text-2xl mb-4">Need Immediate Assistance?</h2>
          <p className="text-muted-foreground mb-6">
            Please get in touch with us as soon as possible so we can support your family.
          </p>
          <Link href="/contact">
            <Button className="bg-primary hover:bg-primary/90" data-testid="button-funeral-contact">
              Contact Us
            </Button>
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
