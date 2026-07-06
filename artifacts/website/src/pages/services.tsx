import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { useListServicesPublic } from "@workspace/api-client-react";
import * as Icons from "lucide-react";
import { HandHeart } from "lucide-react";
import { ArchIconBadge, IslamicPattern } from "@/components/site/islamic-pattern";

function toPascalCase(name: string): string {
  return name
    .split(/[-_ ]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
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
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h1 className="font-serif text-3xl md:text-4xl">Our Services</h1>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              We offer a range of religious, educational, and community services to support
              our congregation.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : sorted.length === 0 ? (
            <p className="text-center text-muted-foreground">No services published yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((service, idx) => (
                <Card
                  key={service.id}
                  className="group relative overflow-hidden border-card-border bg-card rounded-tl-md rounded-tr-2xl rounded-bl-2xl rounded-br-md transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  data-testid={`card-service-${service.id}`}
                >
                  <IslamicPattern className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 text-primary/[0.05] transition-colors duration-300 group-hover:text-primary/[0.09]" />
                  <CardContent className="relative py-7 px-6">
                    {service.imageUrl ? (
                      <img
                        src={service.imageUrl}
                        alt={service.title}
                        className="w-full h-40 object-cover rounded-lg mb-4"
                        data-testid={`img-service-${service.id}`}
                      />
                    ) : (
                      <div className="flex items-start justify-between mb-4">
                        <ArchIconBadge icon={resolveServiceIcon(service.icon)} />
                        <span className="font-serif text-2xl leading-none text-primary/10">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      </div>
                    )}
                    <p className="font-serif text-lg mb-1.5">{service.title}</p>
                    <div className="w-8 h-[2px] bg-secondary mb-3" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
