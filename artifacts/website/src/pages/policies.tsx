import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { useGetSettingPublic } from "@workspace/api-client-react";
import { FileLock2, FileText, Scale } from "lucide-react";

const DEFAULT_CONTENT = `Grays Park Masjid maintains a set of governing policies to ensure we operate safely, transparently, and in line with charity and legal requirements. These include our Safeguarding Policy, Privacy Policy, Equality &amp; Diversity Policy, Health &amp; Safety Policy, and Complaints Procedure.

Copies of our full policy documents are available on request from the masjid office. We review all policies at least annually, or sooner if legislation or best practice changes.

Our Privacy Policy explains how we collect, use, and protect personal information submitted through this website, including contact forms, course registrations, and donations. We never sell or share personal data with third parties for marketing purposes.`;

export default function PoliciesPage() {
  const { data } = useGetSettingPublic("policies_content");
  const content = data?.value || DEFAULT_CONTENT;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h1 className="font-serif text-3xl md:text-4xl">Policies</h1>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              Our governing policies, available for transparency and reference.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="text-policies-content">
            {content}
          </p>
        </section>

        <section className="bg-muted/40 border-y border-border">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid sm:grid-cols-3 gap-6">
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <FileLock2 className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Privacy Policy</p>
                  <p className="text-sm text-muted-foreground">
                    How we collect, use, and protect your personal information.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <Scale className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Equality &amp; Diversity</p>
                  <p className="text-sm text-muted-foreground">
                    Our commitment to fair and inclusive treatment for everyone.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <FileText className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Complaints Procedure</p>
                  <p className="text-sm text-muted-foreground">
                    Request full policy documents from the masjid office at any time.
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
