import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Menu,
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
} from "lucide-react";
import { PrayerTimesWidget } from "@/components/prayer-times-widget";
import { IslamicPattern, IslamicStar } from "@/components/site/islamic-pattern";
import gpmLogo from "@/assets/GPM_Logo_1783358587809.png";

const NAV_LINKS = [
  { href: "/prayer-times", label: "Prayer Times" },
  { href: "/timetable", label: "Timetable" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const COMMUNITY_LINKS = [
  { href: "/events", label: "Events", icon: CalendarDays, desc: "What's on at the masjid" },
  { href: "/education", label: "Education", icon: GraduationCap, desc: "Islamic classes for all ages" },
  { href: "/announcements", label: "News", icon: Newspaper, desc: "Latest updates & notices" },
  { href: "/madrassah", label: "Madrassah", icon: BookOpenCheck, desc: "Weekend Islamic school" },
  { href: "/sisters-facilities", label: "Sisters' Facilities", icon: HeartHandshake, desc: "Spaces for our sisters" },
  { href: "/youth-programmes", label: "Youth Programmes", icon: Sparkles, desc: "Activities for young people" },
  { href: "/gallery", label: "Gallery", icon: Images, desc: "Photos from our community" },
  { href: "/volunteer", label: "Volunteer", icon: HandHeart, desc: "Give your time & skills" },
  { href: "/join", label: "Join the Masjid", icon: UserPlus, desc: "Become a member" },
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
  links: { href: string; label: string; icon: import("lucide-react").LucideIcon; desc: string }[];
  onNavigate?: () => void;
  feature: { title: string; desc: string; href: string; cta: string; icon: import("lucide-react").LucideIcon };
}) {
  const FeatureIcon = feature.icon;
  return (
    <div className="relative w-[min(92vw,44rem)] overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
      <IslamicPattern className="pointer-events-none absolute -right-6 -top-10 h-40 w-40 text-primary/[0.05]" />
      <div className="relative grid grid-cols-1 md:grid-cols-[1.5fr_1fr]">
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 p-4">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <NavigationMenuLink asChild>
                  <Link
                    href={link.href}
                    onClick={onNavigate}
                    className="group flex items-start gap-3 rounded-lg p-3 hover-elevate transition-colors"
                    data-testid={`link-nav-${link.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-t-full rounded-b-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium leading-tight">{link.label}</span>
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
          <IslamicStar className="pointer-events-none absolute -bottom-4 -right-4 h-24 w-24 text-primary-foreground/10" />
          <div className="relative">
            <FeatureIcon className="h-6 w-6 text-secondary mb-3" strokeWidth={1.75} />
            <p className="font-serif text-lg leading-snug mb-1.5">{feature.title}</p>
            <p className="text-xs text-primary-foreground/75 leading-relaxed">{feature.desc}</p>
          </div>
          <Link href={feature.href} onClick={onNavigate} className="relative mt-5">
            <Button
              size="sm"
              className="w-full rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-1.5"
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
  const communityActive = COMMUNITY_LINKS.some((link) => link.href === location);
  const servicesActive = SERVICES_LINKS.some((link) => link.href === location);
  const infoActive = INFO_LINKS.some((link) => link.href === location);

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-40">
      <div className="bg-primary/5 border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-1.5 flex justify-center md:justify-end">
          <PrayerTimesWidget variant="compact" />
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
            {NAV_LINKS.map((link) => (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink asChild>
                  <Link
                    href={link.href}
                    className={`inline-flex h-9 items-center rounded-md px-3 hover:text-primary hover:bg-transparent transition-colors ${
                      location === link.href ? "text-primary" : ""
                    }`}
                    data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {link.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
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
                    title: "Join Our Community",
                    desc: "Become a registered member of Grays Park Masjid and stay connected with everything we offer.",
                    href: "/join",
                    cta: "Join the Masjid",
                    icon: UserPlus,
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
              className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 px-9 font-semibold shadow-md shadow-secondary/30"
              data-testid="button-donate-nav"
            >
              Donate
            </Button>
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu" data-testid="button-mobile-menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="overflow-y-auto">
              <nav className="flex flex-col gap-6 mt-10 text-lg font-medium">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-border pt-6">
                  <p className="text-sm text-muted-foreground mb-4 font-normal">Community</p>
                  <div className="flex flex-col gap-5">
                    {COMMUNITY_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 hover:text-primary transition-colors"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-t-full rounded-b-md bg-primary/10 text-primary">
                          <link.icon className="h-4 w-4" strokeWidth={1.75} />
                        </span>
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="border-t border-border pt-6">
                  <p className="text-sm text-muted-foreground mb-4 font-normal">Services</p>
                  <div className="flex flex-col gap-5">
                    {SERVICES_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 hover:text-primary transition-colors"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-t-full rounded-b-md bg-primary/10 text-primary">
                          <link.icon className="h-4 w-4" strokeWidth={1.75} />
                        </span>
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="border-t border-border pt-6">
                  <p className="text-sm text-muted-foreground mb-4 font-normal">Info</p>
                  <div className="flex flex-col gap-5">
                    {INFO_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 hover:text-primary transition-colors"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-t-full rounded-b-md bg-primary/10 text-primary">
                          <link.icon className="h-4 w-4" strokeWidth={1.75} />
                        </span>
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <Link href="/donate" onClick={() => setOpen(false)} className="donate-glow block rounded-full">
                  <Button className="w-full rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 px-9 font-semibold shadow-md shadow-secondary/30">
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
