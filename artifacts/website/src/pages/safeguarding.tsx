import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { useGetSettingPublic } from "@workspace/api-client-react";
import { AlertTriangle, ShieldCheck, UserCheck } from "lucide-react";
import { IslamicPattern, IslamicStar, ArchIconBadge } from "@/components/site/islamic-pattern";

const DEFAULT_CONTENT = `Grays Park Masjid is committed to the safety and wellbeing of every child, young person, and vulnerable adult who attends our premises or activities. We follow a formal Safeguarding Policy, reviewed annually, which sets out our procedures for preventing, identifying, and responding to concerns.

All staff, teachers, and volunteers working with children or vulnerable adults undergo an enhanced DBS (Disclosure and Barring Service) check before starting, and receive regular safeguarding training.

We have a designated Safeguarding Officer who can be contacted confidentially with any concerns. If you believe a child or vulnerable adult is at immediate risk, please contact the police on 999.`;

const FEATURES = [
  { icon: ShieldCheck, title: "DBS Checked Staff", description: "All staff and volunteers working with children are enhanced DBS checked." },
  { icon: UserCheck, title: "Designated Officer", description: "A trained Safeguarding Officer is available for confidential concerns." },
  { icon: AlertTriangle, title: "Report a Concern", description: "Contact us confidentially, or call 999 in an emergency." },
];

export default function SafeguardingPage() {
  const { data } = useGetSettingPublic("safeguarding_content");
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
            <h1 className="font-serif text-4xl md:text-5xl">Safeguarding</h1>
            <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto text-lg leading-relaxed">
              Protecting children and vulnerable adults is at the heart of everything we do.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-14 md:py-16">
          <div className="flex items-center gap-3 mb-8">
            <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
            <h2 className="font-serif text-3xl">Our Commitment to Safety</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base" data-testid="text-safeguarding-content">
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
