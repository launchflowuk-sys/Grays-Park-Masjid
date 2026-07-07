import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  X,
  CalendarDays,
  GraduationCap,
  Newspaper,
  BookOpenCheck,
  HeartHandshake,
  Sparkles,
  Images,
  HandHeart,
  UserPlus,
  LayoutGrid,
  Users,
  Flower2,
  Moon,
  PartyPopper,
  HandCoins,
  ShieldCheck,
  FileText,
  HelpCircle,
  ArrowRight,
  Clock,
  Star,
  BookOpen,
  PenLine,
} from "lucide-react";
import { PrayerTimesWidget } from "@/components/prayer-times-widget";
import { IslamicPattern, IslamicStar } from "@/components/site/islamic-pattern";
import { useGetQuranSettingsPublic } from "@workspace/api-client-react";
import gpmLogo from "@/assets/GPM_Logo_1783358587809.png";

const BASE_NAV_LINKS = [
  { href: "/prayer-times", label: "Prayer Times" },
  { href: "/timetable", label: "Timetable" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const COMMUNITY_LINKS = [
  { href: "/events", label: "Events", icon: CalendarDays, desc: "What's on at the masjid", featured: false },
  { href: "/education", label: "Education", icon: GraduationCap, desc: "Islamic classes for all ages", featured: false },
  { href: "/announcements", label: "News", icon: Newspaper, desc: "Latest updates & notices", featured: false },
  { href: "/blog", label: "Blog", icon: PenLine, desc: "Articles & Islamic content", featured: false },
  { href: "/prophet", label: "Prophet Muhammad ﷺ", icon: Star, desc: "Life, teachings & legacy of the Prophet", featured: true },
  { href: "/stories", label: "Islamic Stories", icon: BookOpen, desc: "Stories & wisdom for all ages", featured: false },
  { href: "/madrassah", label: "Madrassah", icon: BookOpenCheck, desc: "Weekend Islamic school", featured: false },
  { href: "/sisters-facilities", label: "Sisters' Facilities", icon: HeartHandshake, desc: "Spaces for our sisters", featured: false },
  { href: "/youth-programmes", label: "Youth Programmes", icon: Sparkles, desc: "Activities for young people", featured: false },
  { href: "/gallery", label: "Gallery", icon: Images, desc: "Photos from our community", featured: false },
  { href: "/volunteer", label: "Volunteer", icon: HandHeart, desc: "Give your time & skills", featured: false },
  { href: "/join", label: "Join the Masjid", icon: UserPlus, desc: "Become a member", featured: false },
];

const SERVICES_LINKS = [
  { href: "/services", label: "Our Services", icon: LayoutGrid, desc: "Everything we offer" },
  { href: "/jumuah", label: "Jumu'ah", icon: Users, desc: "Friday prayer timings" },
  { href: "/funeral", label: "Funeral / Janazah", icon: Flower2, desc: "Bereavement support" },
  { href: "/nikah", label: "Nikah", icon: HeartHandshake, desc: "Islamic marriage ceremonies" },
  { href: "/ramadan", label: "Ramadan", icon: Moon, desc: "Iftars, taraweeh & more" },
  { href: "/eid", label: "Eid", icon: PartyPopper, desc: "Eid prayers & celebrations" },
  { href: "/zakat", label: "Zakat / Sadaqah / Lillah", icon: HandCoins, desc: "Give your obligatory charity" },
];

const INFO_LINKS = [
  { href: "/safeguarding", label: "Safeguarding", icon: ShieldCheck, desc: "Keeping our community safe" },
  { href: "/policies", label: "Policies", icon: FileText, desc: "Our governance & policies" },
  { href: "/faqs", label: "FAQs", icon: HelpCircle, desc: "Common questions answered" },
];

function MegaPanel({
  links,
  onNavigate,
  feature,
}: {
  links: { href: string; label: string; icon: import("lucide-react").LucideIcon; desc: string; featured?: boolean }[];
  onNavigate?: () => void;
  feature: { title: string; desc: string; href: string; cta: string; icon: import("lucide-react").LucideIcon };
}) {
  const FeatureIcon = feature.icon;
  return (
    <div className="relative w-[min(92vw,48rem)] overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
      <IslamicPattern className="pointer-events-none absolute -right-6 -top-10 h-40 w-40 text-primary/[0.05]" />
      <div className="relative grid grid-cols-1 md:grid-cols-[1.6fr_1fr]">
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-4">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <NavigationMenuLink asChild>
                  <Link
                    href={link.href}
                    onClick={onNavigate}
                    className={`group flex items-start gap-3 rounded-lg p-3 hover-elevate transition-colors ${link.featured ? "ring-1 ring-secondary/40 bg-secondary/5" : ""}`}
                    data-testid={`link-nav-${link.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-t-full rounded-b-md transition-colors ${link.featured ? "bg-secondary text-secondary-foreground group-hover:bg-secondary/80" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"}`}>
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-sm leading-tight ${link.featured ? "font-bold" : "font-medium"}`}>{link.label}</span>
                      <span className="block text-xs text-muted-foreground mt-0.5 leading-snug">
                        {link.desc}
                      </span>
                    </span>
                  </Link>
                </NavigationMenuLink>
              </li>
            );
          })}
        </ul>
        <div className="relative bg-primary text-primary-foreground p-6 flex flex-col justify-between overflow-hidden">
          <IslamicStar className="pointer-events-none absolute -bottom-4 -right-4 h-28 w-28 text-primary-foreground/10" />
          <IslamicPattern className="pointer-events-none absolute -left-8 top-0 h-24 w-24 text-secondary/10" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <FeatureIcon className="h-5 w-5 text-secondary" strokeWidth={1.75} />
              <span className="text-xs uppercase tracking-[0.15em] text-secondary font-semibold">Featured</span>
            </div>
            <p className="font-serif text-xl leading-snug mb-2">{feature.title}</p>
            <p className="text-xs text-primary-foreground/75 leading-relaxed">{feature.desc}</p>
          </div>
          <Link href={feature.href} onClick={onNavigate} className="relative mt-6">
            <Button
              size="sm"
              className="w-full rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-1.5 font-semibold"
              data-testid={`button-mega-feature-${feature.cta.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {feature.cta} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { data: quranSettings } = useGetQuranSettingsPublic();
  const showQuranNav = quranSettings ? quranSettings.showInNavigation : true;
  const NAV_LINKS = showQuranNav
    ? [...BASE_NAV_LINKS.slice(0, 2), { href: "/quran", label: "Qur'an" }, ...BASE_NAV_LINKS.slice(2)]
    : BASE_NAV_LINKS;
  const communityActive = COMMUNITY_LINKS.some((link) => link.href === location);
  const servicesActive = SERVICES_LINKS.some((link) => link.href === location);
  const infoActive = INFO_LINKS.some((link) => link.href === location);

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-40">
      <div className="bg-primary border-b border-primary/30">
        <div className="mx-auto max-w-6xl px-3 sm:px-6 py-1.5 sm:py-2 flex justify-center overflow-x-auto">
          <PrayerTimesWidget variant="topbar" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img
            src={gpmLogo}
            alt="Grays Park Masjid"
            className="h-12 md:h-14 w-auto"
            data-testid="img-site-logo"
          />
        </Link>
        <NavigationMenu className="hidden md:flex max-w-none flex-none">
          <NavigationMenuList className="gap-1 text-sm font-medium">
            {NAV_LINKS.map((link) => {
              const isQuran = link.href === "/quran";
              return (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={link.href}
                      className={
                        isQuran
                          ? `inline-flex h-9 items-center gap-1.5 rounded-full px-4 font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md shadow-secondary/25 border border-secondary/50 transition-all text-sm tracking-wide`
                          : `inline-flex h-9 items-center rounded-md px-3 hover:text-primary hover:bg-transparent transition-colors text-sm ${location === link.href ? "text-primary font-semibold" : ""}`
                      }
                      data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {isQuran && <BookOpen className="h-3.5 w-3.5 shrink-0" />}
                      {link.label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={`h-9 bg-transparent px-3 text-sm font-medium hover:text-primary hover:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-primary ${
                  communityActive ? "text-primary" : ""
                }`}
                data-testid="link-nav-community"
              >
                Community
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <MegaPanel
                  links={COMMUNITY_LINKS}
                  feature={{
                    title: "The Prophet Muhammad ﷺ",
                    desc: "Explore the blessed life, teachings and eternal legacy of the final Messenger of Allah — our perfect guide and example.",
                    href: "/prophet",
                    cta: "Explore His Legacy",
                    icon: Star,
                  }}
                />
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={`h-9 bg-transparent px-3 text-sm font-medium hover:text-primary hover:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-primary ${
                  servicesActive ? "text-primary" : ""
                }`}
                data-testid="link-nav-services"
              >
                Services
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <MegaPanel
                  links={SERVICES_LINKS}
                  feature={{
                    title: "Support Our Masjid",
                    desc: "Give Zakat, Sadaqah or Lillah and help us continue serving the community.",
                    href: "/donate",
                    cta: "Donate Now",
                    icon: HandHeart,
                  }}
                />
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={`h-9 bg-transparent px-3 text-sm font-medium hover:text-primary hover:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-primary ${
                  infoActive ? "text-primary" : ""
                }`}
                data-testid="link-nav-info"
              >
                Info
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <MegaPanel
                  links={INFO_LINKS}
                  feature={{
                    title: "Prayer Times",
                    desc: "Check today's prayer and iqamah times before you visit us.",
                    href: "/prayer-times",
                    cta: "View Times",
                    icon: Clock,
                  }}
                />
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-3">
          <Link href="/donate" className="donate-glow hidden sm:inline-flex rounded-full">
            <Button
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-9 font-semibold shadow-md shadow-primary/30"
              data-testid="button-donate-nav"
            >
              Donate
            </Button>
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                size="icon"
                className="md:hidden h-11 w-11 rounded-xl bg-primary hover:bg-primary/90 shadow-md shadow-primary/30 border border-secondary/40"
                aria-label="Menu"
                data-testid="button-mobile-menu"
              >
                <span className="flex flex-col items-center justify-center gap-[5px]">
                  <span className="h-[3px] w-6 rounded-full bg-secondary" />
                  <span className="h-[3px] w-6 rounded-full bg-secondary" />
                  <span className="h-[3px] w-4 self-start ml-[3px] rounded-full bg-secondary" />
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              hideDefaultClose
              className="overflow-y-auto p-0 bg-primary text-primary-foreground border-l border-secondary/30 w-[85vw] sm:max-w-sm"
            >
              <div className="relative overflow-hidden bg-primary px-6 pt-8 pb-6 border-b border-secondary/30">
                <IslamicPattern className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 text-secondary/10" />
                <IslamicStar className="pointer-events-none absolute -bottom-6 left-8 h-16 w-16 text-secondary/10" />
                <SheetPrimitive.Close asChild>
                  <button
                    type="button"
                    aria-label="Close menu"
                    data-testid="button-mobile-menu-close"
                    className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary shadow-md shadow-black/20 hover:bg-secondary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-primary"
                  >
                    <X className="h-5 w-5" strokeWidth={2.5} />
                  </button>
                </SheetPrimitive.Close>
                <img
                  src={gpmLogo}
                  alt="Grays Park Masjid"
                  className="relative h-11 w-auto brightness-0 invert"
                />
              </div>
              <nav className="flex flex-col px-4 py-4">
                <div className="flex flex-col gap-1 pb-2">
                  {NAV_LINKS.map((link) => {
                    const isQuran = link.href === "/quran";
                    return isQuran ? (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center gap-2 rounded-full mx-1 px-4 py-2.5 text-base font-bold tracking-wide bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors shadow shadow-black/20"
                        data-testid={`link-mobile-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <BookOpen className="h-4 w-4 shrink-0" />
                        {link.label}
                      </Link>
                    ) : (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={`rounded-lg px-3 py-3 text-base font-semibold tracking-wide hover:bg-primary-foreground/10 transition-colors ${
                          location === link.href ? "text-secondary" : ""
                        }`}
                        data-testid={`link-mobile-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
                <Accordion type="multiple" className="border-t border-secondary/20 mt-1">
                  <AccordionItem value="community" className="border-secondary/20">
                    <AccordionTrigger className="px-3 text-sm font-semibold uppercase tracking-[0.1em] text-secondary hover:no-underline">
                      Community
                    </AccordionTrigger>
                    <AccordionContent className="px-1">
                      <div className="flex flex-col gap-1">
                        {COMMUNITY_LINKS.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-primary-foreground/10 transition-colors ${link.featured ? "ring-1 ring-secondary/40 bg-secondary/10 rounded-xl" : ""}`}
                          >
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-t-full rounded-b-md ${link.featured ? "bg-secondary text-secondary-foreground" : "bg-secondary/15 text-secondary"}`}>
                              <link.icon className="h-4 w-4" strokeWidth={1.75} />
                            </span>
                            <span className={`text-sm ${link.featured ? "font-bold" : ""}`}>{link.label}</span>
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="services" className="border-secondary/20">
                    <AccordionTrigger className="px-3 text-sm font-semibold uppercase tracking-[0.1em] text-secondary hover:no-underline">
                      Services
                    </AccordionTrigger>
                    <AccordionContent className="px-1">
                      <div className="flex flex-col gap-1">
                        {SERVICES_LINKS.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-primary-foreground/10 transition-colors"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-t-full rounded-b-md bg-secondary/15 text-secondary">
                              <link.icon className="h-4 w-4" strokeWidth={1.75} />
                            </span>
                            <span className="text-sm">{link.label}</span>
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="info" className="border-secondary/20">
                    <AccordionTrigger className="px-3 text-sm font-semibold uppercase tracking-[0.1em] text-secondary hover:no-underline">
                      Info
                    </AccordionTrigger>
                    <AccordionContent className="px-1">
                      <div className="flex flex-col gap-1">
                        {INFO_LINKS.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-primary-foreground/10 transition-colors"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-t-full rounded-b-md bg-secondary/15 text-secondary">
                              <link.icon className="h-4 w-4" strokeWidth={1.75} />
                            </span>
                            <span className="text-sm">{link.label}</span>
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <Link
                  href="/donate"
                  onClick={() => setOpen(false)}
                  className="donate-glow block rounded-full mt-6 mb-4"
                >
                  <Button className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-9 font-semibold shadow-md shadow-primary/30">
                    Donate
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
