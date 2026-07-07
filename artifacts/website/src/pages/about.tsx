import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { BookOpen, HandHeart, Heart, MapPin, Users, CheckCircle } from "lucide-react";
import { IslamicPattern, IslamicStar, ArchIconBadge } from "@/components/site/islamic-pattern";
import { Link } from "wouter";

const VALUES = [
  {
    icon: BookOpen,
    title: "Worship",
    arabic: "العبادة",
    description: "Providing a clean, peaceful space for the five daily prayers, Jumu'ah, and Taraweeh.",
  },
  {
    icon: Users,
    title: "Community",
    arabic: "المجتمع",
    description: "Bringing people together through events, volunteering, and mutual support.",
  },
  {
    icon: Heart,
    title: "Compassion",
    arabic: "الرحمة",
    description: "Supporting those in need within our congregation and the wider community.",
  },
  {
    icon: HandHeart,
    title: "Service",
    arabic: "الخدمة",
    description: "Serving Allah and our neighbours through education, charity, and care.",
  },
];

const FACILITIES = [
  "Separate prayer halls for brothers and sisters",
  "Wudu (ablution) facilities for brothers and sisters",
  "Weekend Islamic school (Madrassah) for children",
  "Community hall for events and gatherings",
  "Wheelchair accessible entrance",
  "Dedicated sisters' entrance",
  "Qur'an classes and adult education circles",
  "Janazah (funeral) preparation facilities",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────── */}
        <section className="relative bg-primary text-primary-foreground overflow-hidden">
          <IslamicPattern className="absolute inset-0 w-full h-full text-white/5 [background-size:60px_60px]" />
          <IslamicStar className="absolute -top-10 -right-10 w-56 h-56 text-white/5" />
          <IslamicStar className="absolute -bottom-10 -left-10 w-56 h-56 text-white/5" />
          <IslamicStar className="absolute top-1/2 right-1/4 w-20 h-20 text-white/4" />
          <div className="relative mx-auto max-w-4xl px-6 py-18 md:py-24 text-center">
            <p className="font-serif text-secondary text-2xl md:text-3xl mb-4 tracking-wider" aria-label="Bismillah">
              بسم الله الرحمن الرحيم
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight">
              About Grays Park Masjid
            </h1>
            <p className="mt-5 text-primary-foreground/70 max-w-2xl mx-auto text-lg leading-relaxed">
              A home for worship, learning, and community in the heart of Grays, Essex —
              serving the Muslim community for over two decades.
            </p>
          </div>
        </section>

        {/* ── Our Story ────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-6 py-16 md:py-20">
          <div className="flex items-center gap-3 mb-8">
            <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
            <h2 className="font-serif text-3xl">Our Story</h2>
          </div>
          <div className="border-l-4 border-secondary pl-6 mb-8">
            <p className="text-lg text-foreground/85 leading-relaxed font-serif italic">
              "What began as a small prayer space has grown into a thriving centre for worship,
              education, and community life."
            </p>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-5 text-base">
            Grays Park Masjid has served the Muslim community of Grays and Thurrock for over
            two decades. From its humble beginnings as a modest prayer room, the masjid has
            expanded steadily to meet the growing needs of our community — offering five daily
            congregational prayers, Friday Jumu'ah, an active Madrassah, and a wide range of
            educational and community services.
          </p>
          <p className="text-muted-foreground leading-relaxed text-base">
            We are committed to being a welcoming, inclusive space where Muslims of all
            backgrounds can deepen their connection to Allah, access Islamic knowledge, and
            build lasting bonds with their brothers and sisters. Our doors are also open to
            visitors of all faiths who seek to learn about Islam or engage with the community.
          </p>
        </section>

        {/* ── Mission & Values ─────────────────────────── */}
        <section className="relative overflow-hidden border-y border-primary/10">
          <div className="absolute inset-0 bg-primary/5" />
          <IslamicPattern className="absolute inset-0 w-full h-full text-primary/[0.04] [background-size:60px_60px]" />
          <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-20">
            <div className="text-center mb-12">
              <IslamicStar className="h-6 w-6 text-secondary mx-auto mb-4" />
              <h2 className="font-serif text-3xl md:text-4xl">Our Mission &amp; Values</h2>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                Everything we do is guided by the principles of Islam and a commitment to our community.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUES.map((val) => (
                <div
                  key={val.title}
                  className="group bg-card rounded-2xl border border-card-border px-6 py-8 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                >
                  <IslamicPattern className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 text-primary/[0.05] group-hover:text-primary/[0.1] transition-colors duration-300" />
                  <ArchIconBadge icon={val.icon} className="mx-auto mb-4" />
                  <div className="w-8 h-[2px] bg-secondary mx-auto mt-4 mb-3" />
                  <p className="font-serif text-lg mb-1">{val.title}</p>
                  <p className="font-serif text-xs text-secondary/70 mb-3">{val.arabic}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{val.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Visit Us + Facilities ────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
                <h2 className="font-serif text-3xl">Visit Us</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-5">
                We welcome visitors of all faiths and backgrounds. If you would like to learn
                more about Islam or see our masjid, you are always welcome to come during
                prayer times. For a guided visit or meeting with our Imam, please get in touch
                in advance.
              </p>
              <div className="flex items-center gap-3 text-foreground font-medium mb-6">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                Grays, Essex, United Kingdom
              </div>
              <Link href="/contact">
                <Button className="bg-primary hover:bg-primary/90">Get in Touch</Button>
              </Link>
            </div>

            <div className="bg-card rounded-2xl border border-card-border p-8 relative overflow-hidden">
              <IslamicPattern className="absolute -right-6 -top-6 h-24 w-24 text-primary/[0.06]" />
              <p className="font-serif text-xl mb-5">Our Facilities</p>
              <div className="w-8 h-[2px] bg-secondary mb-6" />
              <ul className="space-y-3">
                {FACILITIES.map((facility) => (
                  <li key={facility} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {facility}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── CTA Band ─────────────────────────────────── */}
        <section className="relative bg-primary text-primary-foreground overflow-hidden">
          <IslamicPattern className="absolute inset-0 w-full h-full text-white/5 [background-size:60px_60px]" />
          <IslamicStar className="absolute -top-6 -right-6 w-36 h-36 text-white/5" />
          <div className="relative mx-auto max-w-3xl px-6 py-14 text-center">
            <p className="font-serif text-secondary text-xl mb-3">تَعَالَوْا إِلَى الصَّلَاةِ</p>
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Come &amp; Pray With Us</h2>
            <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
              All five daily prayers are held in congregation. Check our prayer times and join
              us whenever you are able.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/prayer-times">
                <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold">
                  Prayer Times
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
