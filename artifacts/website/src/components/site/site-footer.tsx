import { Link } from "wouter";
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  ChevronRight,
  Link2,
  BookOpen,
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
  Users,
  HeartHandshake,
  Calendar,
  ArrowUp,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import gpmLogoWhite from "@/assets/GPM_Logo_white_1783358587808.png";
import { useGetSettingPublic, useListServicesPublic } from "@workspace/api-client-react";

const QUICK_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/prayer-times", label: "Prayer Times" },
  { href: "/events", label: "Events" },
  { href: "/education", label: "Islamic Education" },
  { href: "/donate", label: "Donations" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact Us" },
];

const FOOTER_FEATURES = [
  { icon: Users, title: "Community Focused", desc: "Building a stronger, united community" },
  { icon: BookOpen, title: "Islamic Education", desc: "Nurturing knowledge, strengthening faith" },
  { icon: HeartHandshake, title: "Support & Care", desc: "Here for you in times of need" },
  { icon: Calendar, title: "Events & Activities", desc: "Engaging events for all ages" },
];

function useSetting(key: string): string | undefined {
  const { data } = useGetSettingPublic(key);
  return data?.value || undefined;
}

function SocialLink({ href, label, icon: Icon }: { href: string; label: string; icon: typeof Facebook }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="h-9 w-9 rounded-full border border-primary-foreground/25 flex items-center justify-center text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors"
      data-testid={`link-footer-social-${label.toLowerCase()}`}
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}

export function SiteFooter() {
  const phone = useSetting("site_phone");
  const email = useSetting("site_email");
  const address = useSetting("site_address");
  const hours = useSetting("site_hours");
  const facebookUrl = useSetting("site_facebook_url");
  const instagramUrl = useSetting("site_instagram_url");
  const youtubeUrl = useSetting("site_youtube_url");
  const whatsappUrl = useSetting("site_whatsapp_url");

  const { data: servicesData } = useListServicesPublic();
  const services = [...(servicesData ?? [])]
    .filter((s) => s.published)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 8);

  const hasSocial = facebookUrl || instagramUrl || youtubeUrl || whatsappUrl;

  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="mx-auto max-w-6xl px-6 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img
              src={gpmLogoWhite}
              alt="Grays Park Masjid"
              className="h-11 w-auto"
              data-testid="img-footer-logo"
            />
            <div>
              <p className="font-serif text-lg leading-tight">Grays Park Masjid</p>
              <p className="text-[11px] text-primary-foreground/60 leading-tight">
                Thurrock Islamic Education &amp; Cultural Association
              </p>
            </div>
          </div>
          <div className="w-10 h-[2px] bg-secondary mb-4" />
          <p className="text-sm text-primary-foreground/70 leading-relaxed mb-5">
            A place of worship, learning and community serving the people of Grays and
            surrounding areas with faith, compassion and unity.
          </p>
          {hasSocial && (
            <div className="flex items-center gap-3">
              {facebookUrl && <SocialLink href={facebookUrl} label="Facebook" icon={Facebook} />}
              {instagramUrl && <SocialLink href={instagramUrl} label="Instagram" icon={Instagram} />}
              {youtubeUrl && <SocialLink href={youtubeUrl} label="YouTube" icon={Youtube} />}
              {whatsappUrl && <SocialLink href={whatsappUrl} label="WhatsApp" icon={MessageCircle} />}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Link2 className="h-4 w-4 text-secondary" />
            <p className="uppercase tracking-[0.1em] text-xs font-semibold">Quick Links</p>
          </div>
          <div className="w-8 h-[2px] bg-secondary mb-4" />
          <div className="flex flex-col gap-2.5 text-sm text-primary-foreground/70">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 hover:text-primary-foreground transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5 text-secondary shrink-0" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-4 w-4 text-secondary" />
            <p className="uppercase tracking-[0.1em] text-xs font-semibold">Our Services</p>
          </div>
          <div className="w-8 h-[2px] bg-secondary mb-4" />
          <div className="flex flex-col gap-2.5 text-sm text-primary-foreground/70">
            {services.length === 0 ? (
              <Link href="/services" className="flex items-center gap-1.5 hover:text-primary-foreground transition-colors">
                <ChevronRight className="h-3.5 w-3.5 text-secondary shrink-0" />
                View All Services
              </Link>
            ) : (
              services.map((service) => (
                <Link
                  key={service.id}
                  href="/services"
                  className="flex items-center gap-1.5 hover:text-primary-foreground transition-colors"
                  data-testid={`link-footer-service-${service.id}`}
                >
                  <ChevronRight className="h-3.5 w-3.5 text-secondary shrink-0" />
                  {service.title}
                </Link>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-4 w-4 text-secondary" />
            <p className="uppercase tracking-[0.1em] text-xs font-semibold">Visit Us</p>
          </div>
          <div className="w-8 h-[2px] bg-secondary mb-4" />
          <div className="flex flex-col gap-3 text-sm text-primary-foreground/70 mb-6">
            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              <span data-testid="text-footer-address">{address || "Grays, Essex, United Kingdom"}</span>
            </div>
            {phone && (
              <a href={`tel:${phone.replace(/\s+/g, "")}`} className="flex items-center gap-2.5 hover:text-primary-foreground transition-colors" data-testid="link-footer-phone">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{phone}</span>
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="flex items-center gap-2.5 hover:text-primary-foreground transition-colors" data-testid="link-footer-email">
                <Mail className="h-4 w-4 shrink-0" />
                <span>{email}</span>
              </a>
            )}
            {hours && (
              <div className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                <span data-testid="text-footer-hours">{hours}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-primary-foreground/60 mb-3">
            Your donations help us maintain our masjid and continue serving our community.
          </p>
          <Link href="/donate">
            <Button className="w-full gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90" data-testid="button-footer-donate">
              Donate Now <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-primary-foreground/[0.04] border-y border-primary-foreground/10">
        <div className="mx-auto max-w-6xl px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {FOOTER_FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary-foreground/10 flex items-center justify-center text-secondary shrink-0">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide">{title}</p>
                <p className="text-[11px] text-primary-foreground/60 mt-0.5 leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-primary-foreground/60">
          <p className="text-center md:text-left">
            &copy; {new Date().getFullYear()} Grays Park Masjid. All rights reserved.
            <br className="md:hidden" /> Thurrock Islamic Education &amp; Cultural Association.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link href="/policies" className="hover:text-primary-foreground transition-colors">
              Privacy Policy
            </Link>
            <span className="text-primary-foreground/25">|</span>
            <Link href="/policies" className="hover:text-primary-foreground transition-colors">
              Terms &amp; Conditions
            </Link>
            <span className="text-primary-foreground/25">|</span>
            <Link href="/safeguarding" className="hover:text-primary-foreground transition-colors">
              Safeguarding
            </Link>
            <span className="text-primary-foreground/25">|</span>
            <Link href="/policies" className="hover:text-primary-foreground transition-colors">
              Accessibility
            </Link>
            <span className="text-primary-foreground/25">|</span>
            <Link href="/policies" className="hover:text-primary-foreground transition-colors">
              Cookies Policy
            </Link>
          </div>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="h-9 w-9 rounded-md border border-secondary/60 flex items-center justify-center text-secondary hover:bg-secondary/10 transition-colors shrink-0"
            data-testid="button-footer-back-to-top"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
