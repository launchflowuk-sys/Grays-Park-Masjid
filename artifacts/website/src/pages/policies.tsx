import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { useGetSettingPublic } from "@workspace/api-client-react";
import { FileLock2, FileText, Scale } from "lucide-react";
import { IslamicPattern, IslamicStar, ArchIconBadge } from "@/components/site/islamic-pattern";

const DEFAULT_CONTENT = `Grays Park Masjid maintains a set of governing policies to ensure we operate safely, transparently, and in line with charity and legal requirements. These include our Safeguarding Policy, Privacy Policy, Equality & Diversity Policy, Health & Safety Policy, and Complaints Procedure.

Copies of our full policy documents are available on request from the masjid office. We review all policies at least annually, or sooner if legislation or best practice changes.

Our Privacy Policy explains how we collect, use, and protect personal information submitted through this website, including contact forms, course registrations, and donations. We never sell or share personal data with third parties for marketing purposes.`;

const FEATURES = [
  { icon: FileLock2, title: "Privacy Policy", description: "How we collect, use, and protect your personal information." },
  { icon: Scale, title: "Equality & Diversity", description: "Our commitment to fair and inclusive treatment for everyone." },
  { icon: FileText, title: "Complaints Procedure", description: "Request full policy documents from the masjid office at any time." },
];

export default function PoliciesPage() {
  const { data } = useGetSettingPublic("policies_content");
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
            <h1 className="font-serif text-4xl md:text-5xl">Policies</h1>
            <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto text-lg leading-relaxed">
              Our governing policies, maintained for transparency and legal compliance.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-14 md:py-16">
          <div className="flex items-center gap-3 mb-8">
            <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
            <h2 className="font-serif text-3xl">Governing Policies</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base" data-testid="text-policies-content">
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
      </main>
      <SiteFooter />
    </div>
  );
}
