import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { useListServicesPublic } from "@workspace/api-client-react";
import * as Icons from "lucide-react";
import { HandHeart } from "lucide-react";

function ServiceIcon({ name }: { name?: string | null }) {
  const IconComp = (name && (Icons as unknown as Record<string, Icons.LucideIcon>)[name]) || HandHeart;
  return <IconComp className="h-7 w-7 text-primary" />;
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
              {sorted.map((service) => (
                <Card key={service.id} className="border-card-border" data-testid={`card-service-${service.id}`}>
                  <CardContent className="py-8">
                    {service.imageUrl ? (
                      <img
                        src={service.imageUrl}
                        alt={service.title}
                        className="w-full h-40 object-cover rounded-lg mb-4"
                        data-testid={`img-service-${service.id}`}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <ServiceIcon name={service.icon} />
                      </div>
                    )}
                    <p className="font-serif text-lg mb-2">{service.title}</p>
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
