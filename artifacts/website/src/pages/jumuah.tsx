import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { useGetSettingPublic } from "@workspace/api-client-react";
import { Clock, Mic, Users } from "lucide-react";

const DEFAULT_CONTENT = `Jumu'ah (Friday) prayer is held weekly at Grays Park Masjid and is open to all brothers and sisters. Please arrive early as the hall fills up quickly, especially during the khutbah (sermon).

The khutbah is delivered in English with key reminders also given in Urdu/Bengali where relevant, focusing on practical guidance for daily life alongside Qur'an and Sunnah teachings.

Car parking is limited, so we encourage walking, cycling, or car-sharing where possible. Overflow prayer space is available in the main hall extension during busier weeks such as Ramadan.`;

export default function JumuahPage() {
  const { data } = useGetSettingPublic("jumuah_content");
  const content = data?.value || DEFAULT_CONTENT;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h1 className="font-serif text-3xl md:text-4xl">Jumu'ah Prayer</h1>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              Join us every Friday for the weekly congregational prayer and khutbah.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="text-jumuah-content">
            {content}
          </p>
        </section>

        <section className="bg-muted/40 border-y border-border">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid sm:grid-cols-3 gap-6">
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <Clock className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Two Khutbahs</p>
                  <p className="text-sm text-muted-foreground">
                    See our Prayer Times page for exact Jumu'ah timings, which change with the seasons.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <Mic className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">English Khutbah</p>
                  <p className="text-sm text-muted-foreground">
                    Delivered mainly in English, accessible to all ages and backgrounds.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <Users className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">All Welcome</p>
                  <p className="text-sm text-muted-foreground">
                    Sisters' hall available with a separate entrance and full audio relay.
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
