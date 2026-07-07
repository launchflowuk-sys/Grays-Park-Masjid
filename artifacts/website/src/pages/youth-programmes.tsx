import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { useGetSettingPublic } from "@workspace/api-client-react";
import { Trophy, Users, MessageCircle } from "lucide-react";
import { IslamicPattern, IslamicStar, ArchIconBadge } from "@/components/site/islamic-pattern";
import { Link } from "wouter";

const DEFAULT_CONTENT = `Our Youth Programmes are designed for teenagers and young adults to build strong Islamic identity, brotherhood/sisterhood, and life skills alongside their peers.

Activities include weekly youth circles covering contemporary Islamic topics, sports nights (football and gym sessions), residential trips and camps, and volunteering opportunities that give young people a chance to give back to the community.

We also run mentoring sessions with local scholars and professionals to support young people through education, career, and personal challenges. All youth activities are supervised by DBS-checked youth leaders.`;

const FEATURES = [
  { icon: Users, title: "Weekly Circles", description: "Discussions on faith, identity, and contemporary issues facing young Muslims." },
  { icon: Trophy, title: "Sports & Trips", description: "Football nights, gym sessions, and residential camps to build brotherhood." },
  { icon: MessageCircle, title: "Mentoring", description: "Guidance from scholars and professionals within our community." },
];

export default function YouthProgrammesPage() {
  const { data } = useGetSettingPublic("youth_programmes_content");
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
            <h1 className="font-serif text-4xl md:text-5xl">Youth Programmes</h1>
            <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto text-lg leading-relaxed">
              Building faith, friendship, and future leaders through activities for teens and young adults.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-14 md:py-16">
          <div className="flex items-center gap-3 mb-8">
            <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
            <h2 className="font-serif text-3xl">For the Next Generation</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base" data-testid="text-youth-content">
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

        <section className="relative bg-primary text-primary-foreground overflow-hidden">
          <IslamicPattern className="absolute inset-0 w-full h-full text-white/5 [background-size:60px_60px]" />
          <IslamicStar className="absolute -top-6 -right-6 w-36 h-36 text-white/5" />
          <div className="relative mx-auto max-w-3xl px-6 py-14 text-center">
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Get Involved</h2>
            <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
              Check our Events page for upcoming youth activities, or volunteer to help run a session.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/events">
                <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold" data-testid="button-youth-events">View Events</Button>
              </Link>
              <Link href="/volunteer">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" data-testid="button-youth-volunteer">Volunteer</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
