import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu } from "lucide-react";

const NAV_LINKS = [
  { href: "/prayer-times", label: "Prayer Times" },
  { href: "/timetable", label: "Timetable" },
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/education", label: "Education" },
  { href: "/announcements", label: "News" },
  { href: "/contact", label: "Contact" },
];

const COMMUNITY_LINKS = [
  { href: "/madrassah", label: "Madrassah" },
  { href: "/sisters-facilities", label: "Sisters' Facilities" },
  { href: "/youth-programmes", label: "Youth Programmes" },
  { href: "/gallery", label: "Gallery" },
  { href: "/volunteer", label: "Volunteer" },
  { href: "/join", label: "Join the Masjid" },
];

const SERVICES_LINKS = [
  { href: "/services", label: "Our Services" },
  { href: "/jumuah", label: "Jumu'ah" },
  { href: "/funeral", label: "Funeral / Janazah" },
  { href: "/nikah", label: "Nikah" },
  { href: "/ramadan", label: "Ramadan" },
  { href: "/eid", label: "Eid" },
  { href: "/zakat", label: "Zakat / Sadaqah / Lillah" },
];

const INFO_LINKS = [
  { href: "/safeguarding", label: "Safeguarding" },
  { href: "/policies", label: "Policies" },
  { href: "/faqs", label: "FAQs" },
];

export function SiteHeader() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const communityActive = COMMUNITY_LINKS.some((link) => link.href === location);
  const servicesActive = SERVICES_LINKS.some((link) => link.href === location);
  const infoActive = INFO_LINKS.some((link) => link.href === location);

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-serif text-lg">
            G
          </div>
          <div>
            <p className="font-serif text-lg leading-tight">Grays Park Masjid</p>
            <p className="text-xs text-muted-foreground">Grays, Essex</p>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-primary transition-colors ${
                location === link.href ? "text-primary" : ""
              }`}
              data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {link.label}
            </Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`flex items-center gap-1 hover:text-primary transition-colors outline-none ${
                communityActive ? "text-primary" : ""
              }`}
              data-testid="link-nav-community"
            >
              Community
              <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {COMMUNITY_LINKS.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link
                    href={link.href}
                    data-testid={`link-nav-${link.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  >
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`flex items-center gap-1 hover:text-primary transition-colors outline-none ${
                servicesActive ? "text-primary" : ""
              }`}
              data-testid="link-nav-services"
            >
              Services
              <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {SERVICES_LINKS.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link
                    href={link.href}
                    data-testid={`link-nav-${link.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  >
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`flex items-center gap-1 hover:text-primary transition-colors outline-none ${
                infoActive ? "text-primary" : ""
              }`}
              data-testid="link-nav-info"
            >
              Info
              <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {INFO_LINKS.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link
                    href={link.href}
                    data-testid={`link-nav-${link.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  >
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/donate" className="hidden sm:inline-flex">
            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90" data-testid="button-donate-nav">
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
                  <div className="flex flex-col gap-6">
                    {COMMUNITY_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="border-t border-border pt-6">
                  <p className="text-sm text-muted-foreground mb-4 font-normal">Services</p>
                  <div className="flex flex-col gap-6">
                    {SERVICES_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="border-t border-border pt-6">
                  <p className="text-sm text-muted-foreground mb-4 font-normal">Info</p>
                  <div className="flex flex-col gap-6">
                    {INFO_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
                <Link href="/donate" onClick={() => setOpen(false)}>
                  <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
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
