import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGetSettingPublic } from "@workspace/api-client-react";
import { Trophy, Users, MessageCircle } from "lucide-react";
import { Link } from "wouter";

const DEFAULT_CONTENT = `Our Youth Programmes are designed for teenagers and young adults to build strong Islamic identity, brotherhood/sisterhood, and life skills alongside their peers.

Activities include weekly youth circles covering contemporary Islamic topics, sports nights (football and gym sessions), residential trips and camps, and volunteering opportunities that give young people a chance to give back to the community.

We also run mentoring sessions with local scholars and professionals to support young people through education, career, and personal challenges. All youth activities are supervised by DBS-checked youth leaders.`;

export default function YouthProgrammesPage() {
  const { data } = useGetSettingPublic("youth_programmes_content");
  const content = data?.value || DEFAULT_CONTENT;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h1 className="font-serif text-3xl md:text-4xl">Youth Programmes</h1>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              Building faith, friendship, and future leaders through activities for teens and young adults.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="text-youth-content">
            {content}
          </p>
        </section>

        <section className="bg-muted/40 border-y border-border">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid sm:grid-cols-3 gap-6">
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <Users className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Weekly Circles</p>
                  <p className="text-sm text-muted-foreground">
                    Discussions on faith, identity, and contemporary issues.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <Trophy className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Sports &amp; Trips</p>
                  <p className="text-sm text-muted-foreground">
                    Football nights, gym sessions, and residential camps.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <MessageCircle className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Mentoring</p>
                  <p className="text-sm text-muted-foreground">
                    Guidance from scholars and professionals in the community.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="font-serif text-2xl mb-4">Get Involved</h2>
          <p className="text-muted-foreground mb-6">
            Check our Events page for upcoming youth activities, or volunteer to help run a session.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/events">
              <Button className="bg-primary hover:bg-primary/90" data-testid="button-youth-events">
                View Events
              </Button>
            </Link>
            <Link href="/volunteer">
              <Button variant="outline" data-testid="button-youth-volunteer">
                Volunteer
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
