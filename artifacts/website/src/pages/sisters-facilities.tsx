import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { useGetSettingPublic } from "@workspace/api-client-react";
import { Baby, DoorOpen, HeartHandshake, Sparkles } from "lucide-react";

const DEFAULT_CONTENT = `Grays Park Masjid provides a dedicated, comfortable prayer hall for sisters with a separate entrance, so sisters can attend all five daily prayers, Jumu'ah, and Taraweeh with privacy and ease of access.

Our sisters' facilities include a spacious wudu area, a quiet space for mothers with young children, and step-free access throughout. The sisters' hall is also used for dedicated sisters-only classes, halaqas, and community events.

We regularly consult with sisters in our community to improve these facilities and welcome feedback through our Contact page.`;

export default function SistersFacilitiesPage() {
  const { data } = useGetSettingPublic("sisters_facilities_content");
  const content = data?.value || DEFAULT_CONTENT;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h1 className="font-serif text-3xl md:text-4xl">Sisters' Facilities</h1>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              A dedicated, welcoming space for sisters to pray, learn, and connect.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="text-sisters-content">
            {content}
          </p>
        </section>

        <section className="bg-muted/40 border-y border-border">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <DoorOpen className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Separate Entrance</p>
                  <p className="text-sm text-muted-foreground">
                    A private, step-free entrance dedicated to sisters.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <Sparkles className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Wudu Facilities</p>
                  <p className="text-sm text-muted-foreground">
                    Clean, spacious ablution areas within the sisters' hall.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <Baby className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Family Friendly</p>
                  <p className="text-sm text-muted-foreground">
                    A quiet space for mothers attending with young children.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <HeartHandshake className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Sisters' Classes</p>
                  <p className="text-sm text-muted-foreground">
                    Regular halaqas and classes held in the sisters' hall.
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
