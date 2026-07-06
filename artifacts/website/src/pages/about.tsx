import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, HandHeart, Heart, MapPin, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h1 className="font-serif text-3xl md:text-4xl">About Grays Park Masjid</h1>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              A home for worship, learning, and community in the heart of Grays, Essex.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="font-serif text-2xl mb-4">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Grays Park Masjid has served the Muslim community of Grays and Thurrock for over
            two decades. What began as a small prayer space has grown into a thriving centre
            offering five daily prayers, Friday Jumu'ah, Islamic education for children and
            adults, and a wide range of community services.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            We are committed to being a welcoming, inclusive space where people of all
            backgrounds can learn about Islam, connect with their faith, and build lasting
            friendships. Our doors are open to worshippers, visitors, and anyone seeking
            guidance or support.
          </p>
        </section>

        <section className="bg-muted/40 border-y border-border">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="font-serif text-2xl mb-10 text-center">Our Mission &amp; Values</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <BookOpen className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Worship</p>
                  <p className="text-sm text-muted-foreground">
                    Providing a clean, peaceful space for the five daily prayers and Jumu'ah.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <Users className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Community</p>
                  <p className="text-sm text-muted-foreground">
                    Bringing people together through events, volunteering, and support.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <Heart className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Compassion</p>
                  <p className="text-sm text-muted-foreground">
                    Supporting those in need within our congregation and the wider community.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-card-border text-center">
                <CardContent className="py-8">
                  <HandHeart className="h-7 w-7 text-primary mx-auto mb-4" />
                  <p className="font-serif text-lg mb-2">Service</p>
                  <p className="text-sm text-muted-foreground">
                    Serving Allah and our neighbours through education, charity, and care.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-serif text-2xl mb-4">Visit Us</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We welcome visitors of all faiths and backgrounds. If you would like to learn
              more about Islam or simply see our masjid, please feel free to visit us during
              prayer times or get in touch beforehand.
            </p>
            <div className="flex items-center gap-2 text-foreground font-medium">
              <MapPin className="h-5 w-5 text-primary" />
              Grays, Essex, United Kingdom
            </div>
          </div>
          <Card className="border-card-border">
            <CardContent className="py-8">
              <p className="font-serif text-lg mb-3">Facilities</p>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>Separate prayer areas for brothers and sisters</li>
                <li>Wudu (ablution) facilities</li>
                <li>Weekend Islamic school for children</li>
                <li>Community hall for events</li>
                <li>Wheelchair accessible entrance</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
