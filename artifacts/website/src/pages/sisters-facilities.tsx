import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { useGetSettingPublic } from "@workspace/api-client-react";
import { Baby, DoorOpen, HeartHandshake, Sparkles } from "lucide-react";
import { IslamicPattern, IslamicStar, ArchIconBadge } from "@/components/site/islamic-pattern";

const DEFAULT_CONTENT = `Grays Park Masjid provides a dedicated, comfortable prayer hall for sisters with a separate entrance, so sisters can attend all five daily prayers, Jumu'ah, and Taraweeh with privacy and ease of access.

Our sisters' facilities include a spacious wudu area, a quiet space for mothers with young children, and step-free access throughout. The sisters' hall is also used for dedicated sisters-only classes, halaqas, and community events.

We regularly consult with sisters in our community to improve these facilities and welcome feedback through our Contact page.`;

const FEATURES = [
  { icon: DoorOpen, title: "Separate Entrance", description: "A private, step-free entrance dedicated to sisters." },
  { icon: Sparkles, title: "Wudu Facilities", description: "Clean, spacious ablution areas within the sisters' hall." },
  { icon: Baby, title: "Family Friendly", description: "A quiet space for mothers attending with young children." },
  { icon: HeartHandshake, title: "Sisters' Classes", description: "Regular halaqas and classes held in the sisters' hall." },
];

export default function SistersFacilitiesPage() {
  const { data } = useGetSettingPublic("sisters_facilities_content");
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
            <h1 className="font-serif text-4xl md:text-5xl">Sisters' Facilities</h1>
            <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto text-lg leading-relaxed">
              A dedicated, welcoming space for sisters to pray, learn, and connect.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-14 md:py-16">
          <div className="flex items-center gap-3 mb-8">
            <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
            <h2 className="font-serif text-3xl">A Space for Sisters</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base" data-testid="text-sisters-content">
            {content}
          </p>
        </section>

        <section className="relative overflow-hidden border-y border-primary/10">
          <div className="absolute inset-0 bg-primary/5" />
          <IslamicPattern className="absolute inset-0 w-full h-full text-primary/[0.04] [background-size:60px_60px]" />
          <div className="relative mx-auto max-w-6xl px-6 py-14">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
