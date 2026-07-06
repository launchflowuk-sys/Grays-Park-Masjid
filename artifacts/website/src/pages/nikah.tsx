import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetSettingPublic } from "@workspace/api-client-react";
import { BookOpenCheck, FileText, Heart } from "lucide-react";
import { Link } from "wouter";

const DEFAULT_CONTENT = `Grays Park Masjid is pleased to conduct Nikah (Islamic marriage) ceremonies for couples in our community. Our Imam can officiate the ceremony at the masjid or, where suitable, at an external venue.

To arrange a Nikah, please contact the masjid office at least four weeks in advance so we can schedule pre-marriage guidance, verify documentation, and confirm a convenient date and time.

We also offer basic guidance on marriage counselling and can direct couples to community resources for pre- and post-marriage support.`;

export default function NikahPage() {
  const { data } = useGetSettingPublic("nikah_content");
  const content = data?.value || DEFAULT_CONTENT;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h1 className="font-serif text-3xl md:text-4xl">Nikah Services</h1>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              Celebrating marriage according to the Sunnah, with care and guidance for every couple.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="text-nikah-content">
            {content}
          </p>
        </section>

        <section className="bg-muted/40 border-y border-border">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid sm:grid-cols-3 gap-6">
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <Heart className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Nikah Ceremony</p>
                  <p className="text-sm text-muted-foreground">
                    Officiated by our Imam at the masjid or an approved external venue.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <FileText className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Documentation</p>
                  <p className="text-sm text-muted-foreground">
                    Guidance on paperwork and Nikah certificates.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <BookOpenCheck className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Pre-Marriage Guidance</p>
                  <p className="text-sm text-muted-foreground">
                    Basic counselling and resources for couples preparing for marriage.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="font-serif text-2xl mb-4">Planning Your Nikah?</h2>
          <p className="text-muted-foreground mb-6">Get in touch to check availability and start planning.</p>
          <Link href="/contact">
            <Button className="bg-primary hover:bg-primary/90" data-testid="button-nikah-contact">
              Contact Us
            </Button>
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
