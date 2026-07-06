import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetSettingPublic } from "@workspace/api-client-react";
import { BookOpen, Clock, Users } from "lucide-react";
import { Link } from "wouter";

const DEFAULT_CONTENT = `Our Madrassah provides structured Islamic education for children aged 5 to 16, covering Qur'an recitation and memorisation (Hifz and Nazira), Islamic studies (Aqeedah, Fiqh, Seerah), and basic Arabic reading and writing.

Classes run every weekday evening after Maghrib, plus a dedicated weekend programme on Saturday and Sunday mornings for families who prefer weekend-only attendance. Children are grouped by age and ability, with regular progress assessments shared with parents.

Our teachers are qualified in Tajweed and child safeguarding, and all Madrassah staff undergo enhanced DBS checks. We keep class sizes small to ensure every student gets individual attention.`;

export default function MadrassahPage() {
  const { data } = useGetSettingPublic("madrassah_content");
  const content = data?.value || DEFAULT_CONTENT;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h1 className="font-serif text-3xl md:text-4xl">Madrassah</h1>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              Qur'an, Islamic studies, and Arabic classes for children in a caring, structured environment.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="text-madrassah-content">
            {content}
          </p>
        </section>

        <section className="bg-muted/40 border-y border-border">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid sm:grid-cols-3 gap-6">
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <BookOpen className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Curriculum</p>
                  <p className="text-sm text-muted-foreground">
                    Qur'an, Tajweed, Islamic studies, and Arabic language.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <Clock className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Timings</p>
                  <p className="text-sm text-muted-foreground">
                    Weekday evenings after Maghrib, plus weekend morning classes.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <Users className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Ages 5–16</p>
                  <p className="text-sm text-muted-foreground">
                    Small class sizes grouped by age and ability.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="font-serif text-2xl mb-4">Ready to Enrol?</h2>
          <p className="text-muted-foreground mb-6">
            Register your child through our Education page or get in touch with any questions.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/education">
              <Button className="bg-primary hover:bg-primary/90" data-testid="button-madrassah-register">
                View Classes &amp; Register
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" data-testid="button-madrassah-contact">
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
