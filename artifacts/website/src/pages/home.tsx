import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, HandHeart, MapPin, Menu } from "lucide-react";

const PRAYER_TIMES = [
  { name: "Fajr", time: "05:12" },
  { name: "Dhuhr", time: "13:15" },
  { name: "Asr", time: "17:45" },
  { name: "Maghrib", time: "20:32" },
  { name: "Isha", time: "22:00" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-serif text-lg">
              G
            </div>
            <div>
              <p className="font-serif text-lg leading-tight">Grays Park Masjid</p>
              <p className="text-xs text-muted-foreground">Grays, Essex</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#prayer-times" className="hover:text-primary transition-colors">
              Prayer Times
            </a>
            <a href="#about" className="hover:text-primary transition-colors">
              About
            </a>
            <a href="#events" className="hover:text-primary transition-colors">
              Events
            </a>
            <a href="#donate" className="hover:text-primary transition-colors">
              Donate
            </a>
            <a href="#contact" className="hover:text-primary transition-colors">
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button className="hidden sm:inline-flex bg-secondary text-secondary-foreground hover:bg-secondary/90">
              Donate
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-10 pointer-events-none [background-image:radial-gradient(circle_at_20%_20%,white,transparent_35%),radial-gradient(circle_at_80%_60%,white,transparent_30%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32 text-center">
          <p className="uppercase tracking-[0.3em] text-sm text-secondary font-medium mb-4">
            Serving our community since 1998
          </p>
          <h1 className="font-serif text-4xl md:text-6xl leading-tight max-w-3xl mx-auto">
            Welcome to Grays Park Masjid
          </h1>
          <p className="mt-6 text-primary-foreground/80 max-w-xl mx-auto text-lg">
            A place of worship, learning, and community for Muslims in Grays and the
            surrounding areas of Essex.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              View Prayer Times
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
            >
              Plan a Visit
            </Button>
          </div>
        </div>
      </section>

      <section id="prayer-times" className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="font-serif text-2xl md:text-3xl text-center">Today's Prayer Times</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {PRAYER_TIMES.map((prayer) => (
            <Card key={prayer.name} className="text-center border-card-border">
              <CardContent className="py-6">
                <p className="text-sm uppercase tracking-wide text-muted-foreground">
                  {prayer.name}
                </p>
                <p className="mt-2 font-serif text-2xl text-primary">{prayer.time}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="about" className="bg-muted/40 border-y border-border">
        <div className="mx-auto max-w-6xl px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-serif text-3xl mb-4">About Our Masjid</h2>
            <p className="text-muted-foreground leading-relaxed">
              Grays Park Masjid has served the Muslim community of Grays and Thurrock for
              over two decades. We offer five daily prayers, Friday Jumu'ah, Islamic
              education for children and adults, and a range of community services.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-card-border">
              <CardContent className="py-6">
                <MapPin className="h-6 w-6 text-primary mb-3" />
                <p className="font-medium">Grays, Essex</p>
                <p className="text-sm text-muted-foreground">United Kingdom</p>
              </CardContent>
            </Card>
            <Card className="border-card-border">
              <CardContent className="py-6">
                <HandHeart className="h-6 w-6 text-secondary mb-3" />
                <p className="font-medium">Support Us</p>
                <p className="text-sm text-muted-foreground">Sadaqah &amp; Zakat welcome</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer id="contact" className="mx-auto max-w-6xl px-6 py-12 text-sm text-muted-foreground">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} Grays Park Masjid. All rights reserved.</p>
          <p>Grays, Essex, United Kingdom</p>
        </div>
      </footer>
    </div>
  );
}
