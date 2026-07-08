import { useState } from "react";
import { Link } from "wouter";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useListDonationCampaignsPublic,
  type DonationCampaign,
} from "@workspace/api-client-react";
import { DonationWidget } from "@/components/donations/donation-widget";
import { HandHeart, ArrowRight } from "lucide-react";
import { IslamicPattern, IslamicStar } from "@/components/site/islamic-pattern";

function formatCurrency(value: string | null | undefined) {
  const num = Number(value ?? 0);
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(num);
}

function CampaignCard({
  campaign,
  onDonateWithoutSlug,
}: {
  campaign: DonationCampaign;
  onDonateWithoutSlug: (c: DonationCampaign) => void;
}) {
  const target = campaign.targetAmount ? Number(campaign.targetAmount) : null;
  const raised = Number(campaign.raisedAmount);
  const pct = target && target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : null;

  const inner = (
    <div
      data-testid={`card-campaign-${campaign.id}`}
      className="relative overflow-hidden rounded-2xl border border-card-border bg-card transition-shadow hover:shadow-md group"
    >
      <IslamicPattern className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 text-primary/[0.04]" />
      <div className="grid md:grid-cols-5">
        {campaign.imageUrl && (
          <div
            className="md:col-span-2 bg-cover bg-center min-h-[220px] rounded-t-2xl md:rounded-t-none md:rounded-l-2xl overflow-hidden"
            style={{ backgroundImage: `url(${campaign.imageUrl})` }}
          />
        )}
        <div className={`relative p-7 ${campaign.imageUrl ? "md:col-span-3" : "md:col-span-5"}`}>
          <div className="flex items-start justify-between gap-4 mb-3">
            <p className="font-serif text-xl leading-snug">{campaign.title}</p>
            {campaign.featured && (
              <span className="text-xs uppercase tracking-widest font-semibold bg-secondary/20 text-secondary-foreground px-2.5 py-1 rounded-full shrink-0">
                Featured
              </span>
            )}
          </div>
          <div className="w-8 h-[2px] bg-secondary mb-4" />
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 line-clamp-3">{campaign.description}</p>
          {target && (
            <div className="mb-6">
              <Progress value={pct ?? 0} className="h-2 mb-2" />
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-primary">{formatCurrency(campaign.raisedAmount)} raised</span>
                <span className="text-muted-foreground">Target {formatCurrency(campaign.targetAmount)}</span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-secondary text-secondary-foreground font-semibold text-sm transition-colors group-hover:bg-secondary/90">
              {campaign.slug ? (
                <>Learn more & Donate <ArrowRight className="h-4 w-4" /></>
              ) : (
                "Donate to this campaign"
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (campaign.slug) {
    return (
      <Link href={`/donate/${campaign.slug}`} data-testid={`button-donate-${campaign.id}`}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="block w-full text-left"
      onClick={() => onDonateWithoutSlug(campaign)}
      data-testid={`button-donate-${campaign.id}`}
    >
      {inner}
    </button>
  );
}

export default function DonatePage() {
  const { data, isLoading } = useListDonationCampaignsPublic();
  const active = (data ?? []).filter((c) => c.active);
  const featured = active.filter((c) => c.featured);
  const others = active.filter((c) => !c.featured);

  const [inlineDialogCampaign, setInlineDialogCampaign] = useState<DonationCampaign | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative bg-primary text-primary-foreground overflow-hidden">
          <IslamicPattern className="absolute inset-0 w-full h-full text-white/5 [background-size:60px_60px]" />
          <IslamicStar className="absolute -top-10 -right-10 w-56 h-56 text-white/5" />
          <IslamicStar className="absolute -bottom-10 -left-10 w-48 h-48 text-white/5" />
          <IslamicStar className="absolute top-6 left-1/4 w-16 h-16 text-white/4" />
          <div className="relative mx-auto max-w-4xl px-6 py-16 md:py-20 text-center">
            <div className="h-14 w-14 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-5">
              <HandHeart className="h-7 w-7 text-secondary" />
            </div>
            <p className="font-serif text-secondary text-xl md:text-2xl mb-3 tracking-wider">وَأَنفِقُوا فِي سَبِيلِ اللَّٰهِ</p>
            <h1 className="font-serif text-4xl md:text-5xl">Donate</h1>
            <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto text-lg leading-relaxed">
              Your Sadaqah and Zakat help us maintain the masjid and serve our community throughout the year.
            </p>
          </div>
        </section>

        {/* Campaigns */}
        <section className="mx-auto max-w-6xl px-6 py-14 md:py-16">
          <div className="flex items-center gap-3 mb-8">
            <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
            <h2 className="font-serif text-3xl">Active Campaigns</h2>
          </div>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-16">Loading campaigns…</p>
          ) : active.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center">
              <p className="text-muted-foreground">No active donation campaigns at the moment. Please check back soon.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {[...featured, ...others].map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onDonateWithoutSlug={setInlineDialogCampaign}
                />
              ))}
            </div>
          )}
        </section>

        {/* Giving types band */}
        <section className="relative overflow-hidden border-y border-primary/10">
          <div className="absolute inset-0 bg-primary/5" />
          <IslamicPattern className="absolute inset-0 w-full h-full text-primary/[0.04] [background-size:60px_60px]" />
          <div className="relative mx-auto max-w-4xl px-6 py-12 text-center">
            <p className="font-serif text-xl mb-2">Ways to Give</p>
            <p className="text-muted-foreground text-sm">
              We accept <strong>Zakat</strong> (obligatory), <strong>Sadaqah</strong> (voluntary), and <strong>Lillah</strong> (general donations) online. Bank transfer details are available on request from the masjid office.
            </p>
          </div>
        </section>

      </main>
      <SiteFooter />

      {/* Fallback inline donation dialog for campaigns without a slug */}
      <Dialog
        open={!!inlineDialogCampaign}
        onOpenChange={(open) => !open && setInlineDialogCampaign(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">{inlineDialogCampaign?.title}</DialogTitle>
          </DialogHeader>
          {inlineDialogCampaign && (
            <DonationWidget campaign={inlineDialogCampaign} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
