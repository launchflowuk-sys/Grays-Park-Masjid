import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { useListServicesPublic } from "@workspace/api-client-react";
import * as Icons from "lucide-react";
import { HandHeart } from "lucide-react";
import { ArchIconBadge, IslamicPattern, IslamicStar } from "@/components/site/islamic-pattern";

function toPascalCase(name: string): string {
  return name.split(/[-_ ]+/).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
}
function resolveServiceIcon(name?: string | null): Icons.LucideIcon {
  const iconMap = Icons as unknown as Record<string, Icons.LucideIcon>;
  return (name && (iconMap[name] || iconMap[toPascalCase(name)])) || HandHeart;
}

export default function ServicesPage() {
  const { data, isLoading } = useListServicesPublic();
  const sorted = [...(data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative bg-primary text-primary-foreground overflow-hidden">
          <IslamicPattern className="absolute inset-0 w-full h-full text-white/5 [background-size:60px_60px]" />
          <IslamicStar className="absolute -top-10 -right-10 w-56 h-56 text-white/5" />
          <IslamicStar className="absolute -bottom-10 -left-10 w-48 h-48 text-white/5" />
          <div className="relative mx-auto max-w-4xl px-6 py-16 md:py-20 text-center">
            <h1 className="font-serif text-4xl md:text-5xl">Our Services</h1>
            <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto text-lg leading-relaxed">
              Religious, educational, and community services to support our congregation and the wider community.
            </p>
          </div>
        </section>

        {/* Services */}
        <section className="mx-auto max-w-6xl px-6 py-14 md:py-16">
          <div className="flex items-center gap-3 mb-8">
            <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
            <h2 className="font-serif text-3xl">What We Offer</h2>
          </div>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-16">Loading services…</p>
          ) : sorted.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">No services published yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((service, idx) => (
                <div
                  key={service.id}
                  className="group relative overflow-hidden border border-card-border bg-card rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  data-testid={`card-service-${service.id}`}
                >
                  <IslamicPattern className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 text-primary/[0.05] transition-colors duration-300 group-hover:text-primary/[0.09]" />
                  <div className="relative p-6 md:p-7">
                    {service.imageUrl ? (
                      <div className="overflow-hidden rounded-xl mb-5 h-40">
                        <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-testid={`img-service-${service.id}`} />
                      </div>
                    ) : (
                      <div className="flex items-start justify-between mb-5">
                        <ArchIconBadge icon={resolveServiceIcon(service.icon)} />
                        <span className="font-serif text-2xl leading-none text-primary/10">{String(idx + 1).padStart(2, "0")}</span>
                      </div>
                    )}
                    <p className="font-serif text-lg mb-1.5">{service.title}</p>
                    <div className="w-8 h-[2px] bg-secondary mb-3" />
                    <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pattern CTA band */}
        <section className="relative bg-primary text-primary-foreground overflow-hidden">
          <IslamicPattern className="absolute inset-0 w-full h-full text-white/5 [background-size:60px_60px]" />
          <IslamicStar className="absolute -top-6 -right-6 w-36 h-36 text-white/5" />
          <div className="relative mx-auto max-w-3xl px-6 py-12 text-center">
            <h2 className="font-serif text-2xl md:text-3xl mb-3">Have a Question About Our Services?</h2>
            <p className="text-primary-foreground/70 mb-6 max-w-lg mx-auto">
              Get in touch with us and a member of our team will be happy to help.
            </p>
            <a href="/contact">
              <button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold px-6 py-2.5 rounded-md text-sm transition-colors">
                Contact Us
              </button>
            </a>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
