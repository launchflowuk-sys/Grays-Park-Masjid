import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const NAV_LINKS = [
  { href: "/prayer-times", label: "Prayer Times" },
  { href: "/timetable", label: "Timetable" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

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
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
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
            <SheetContent side="right">
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
