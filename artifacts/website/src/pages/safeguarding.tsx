import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { useGetSettingPublic } from "@workspace/api-client-react";
import { AlertTriangle, ShieldCheck, UserCheck } from "lucide-react";

const DEFAULT_CONTENT = `Grays Park Masjid is committed to the safety and wellbeing of every child, young person, and vulnerable adult who attends our premises or activities. We follow a formal Safeguarding Policy, reviewed annually, which sets out our procedures for preventing, identifying, and responding to concerns.

All staff, teachers, and volunteers working with children or vulnerable adults undergo an enhanced DBS (Disclosure and Barring Service) check before starting, and receive regular safeguarding training.

We have a designated Safeguarding Officer who can be contacted confidentially with any concerns. If you believe a child or vulnerable adult is at immediate risk, please contact the police on 999.`;

export default function SafeguardingPage() {
  const { data } = useGetSettingPublic("safeguarding_content");
  const content = data?.value || DEFAULT_CONTENT;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h1 className="font-serif text-3xl md:text-4xl">Safeguarding</h1>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              Protecting children and vulnerable adults is at the heart of everything we do.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="text-safeguarding-content">
            {content}
          </p>
        </section>

        <section className="bg-muted/40 border-y border-border">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid sm:grid-cols-3 gap-6">
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <ShieldCheck className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">DBS Checked Staff</p>
                  <p className="text-sm text-muted-foreground">
                    All staff and volunteers working with children are enhanced DBS checked.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <UserCheck className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Designated Officer</p>
                  <p className="text-sm text-muted-foreground">
                    A trained Safeguarding Officer is available for confidential concerns.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <AlertTriangle className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Report a Concern</p>
                  <p className="text-sm text-muted-foreground">
                    Contact us confidentially, or call 999 in an emergency.
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
