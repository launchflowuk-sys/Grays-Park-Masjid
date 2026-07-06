import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useListDonationCampaignsPublic } from "@workspace/api-client-react";
import { HandHeart } from "lucide-react";

function formatCurrency(value: string | null | undefined) {
  const num = Number(value ?? 0);
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(num);
}

export default function DonatePage() {
  const { data, isLoading } = useListDonationCampaignsPublic();
  const active = (data ?? []).filter((c) => c.active);
  const featured = active.filter((c) => c.featured);
  const others = active.filter((c) => !c.featured);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <HandHeart className="h-8 w-8 text-secondary mx-auto mb-4" />
            <h1 className="font-serif text-3xl md:text-4xl">Donate</h1>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              Your Sadaqah and Zakat help us maintain the masjid and serve our community.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading campaigns...</p>
          ) : active.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No active donation campaigns at the moment. Please check back soon.
            </p>
          ) : (
            <div className="space-y-10">
              {[...featured, ...others].map((campaign) => {
                const target = campaign.targetAmount ? Number(campaign.targetAmount) : null;
                const raised = Number(campaign.raisedAmount);
                const pct = target && target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : null;

                return (
                  <Card key={campaign.id} className="border-card-border overflow-hidden" data-testid={`card-campaign-${campaign.id}`}>
                    <div className="grid md:grid-cols-5">
                      {campaign.imageUrl && (
                        <div
                          className="md:col-span-2 bg-cover bg-center min-h-[200px]"
                          style={{ backgroundImage: `url(${campaign.imageUrl})` }}
                        />
                      )}
                      <CardContent className={`py-8 ${campaign.imageUrl ? "md:col-span-3" : "md:col-span-5"}`}>
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <p className="font-serif text-xl">{campaign.title}</p>
                          {campaign.featured && (
                            <span className="text-xs uppercase tracking-wide bg-secondary/20 text-secondary-foreground px-2 py-1 rounded shrink-0">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                          {campaign.description}
                        </p>
                        {target && (
                          <div className="mb-6">
                            <Progress value={pct ?? 0} className="h-2 mb-2" />
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-primary">{formatCurrency(campaign.raisedAmount)} raised</span>
                              <span className="text-muted-foreground">Target {formatCurrency(campaign.targetAmount)}</span>
                            </div>
                          </div>
                        )}
                        {campaign.externalDonationUrl ? (
                          <a href={campaign.externalDonationUrl} target="_blank" rel="noopener noreferrer">
                            <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90" data-testid={`button-donate-${campaign.id}`}>
                              Donate to this campaign
                            </Button>
                          </a>
                        ) : (
                          <Button disabled variant="outline">
                            Donations coming soon
                          </Button>
                        )}
                      </CardContent>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
