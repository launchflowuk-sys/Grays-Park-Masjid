import { Link } from "wouter";
import { MapPin, Mail, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="mx-auto max-w-6xl px-6 py-14 grid gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-serif text-lg">
              G
            </div>
            <p className="font-serif text-lg">Grays Park Masjid</p>
          </div>
          <p className="text-sm text-primary-foreground/70 leading-relaxed">
            Serving the Muslim community of Grays and Thurrock with prayer, education, and
            care for over two decades.
          </p>
        </div>
        <div>
          <p className="font-serif text-base mb-4">Quick Links</p>
          <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
            <Link href="/prayer-times" className="hover:text-primary-foreground transition-colors">
              Prayer Times
            </Link>
            <Link href="/timetable" className="hover:text-primary-foreground transition-colors">
              Full Year Timetable
            </Link>
            <Link href="/about" className="hover:text-primary-foreground transition-colors">
              About Us
            </Link>
            <Link href="/services" className="hover:text-primary-foreground transition-colors">
              Services
            </Link>
            <Link href="/donate" className="hover:text-primary-foreground transition-colors">
              Donate
            </Link>
            <Link href="/contact" className="hover:text-primary-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
        <div>
          <p className="font-serif text-base mb-4">Get In Touch</p>
          <div className="flex flex-col gap-3 text-sm text-primary-foreground/70">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>Grays, Essex, United Kingdom</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              <span>Contact us via the enquiry form</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              <Link href="/contact" className="hover:text-primary-foreground transition-colors">
                Send us a message
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} Grays Park Masjid. All rights reserved.</p>
          <Link href="/admin/login" className="hover:text-primary-foreground transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
