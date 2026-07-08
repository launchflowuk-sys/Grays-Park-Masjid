import { useParams, Link } from "wouter";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useGetDonationCampaignBySlug } from "@workspace/api-client-react";
import { DonationWidget } from "@/components/donations/donation-widget";
import { IslamicPattern, IslamicStar } from "@/components/site/islamic-pattern";
import { ArrowLeft, HandHeart } from "lucide-react";
import { useState } from "react";

function formatCurrency(value: string | null | undefined) {
  const num = Number(value ?? 0);
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(num);
}

function GalleryImage({ src, alt, onClick }: { src: string; alt: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative overflow-hidden rounded-xl aspect-video bg-muted hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </button>
  );
}

function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-label="Image lightbox"
    >
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-[90vh] rounded-xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        type="button"
        className="absolute top-4 right-4 text-white text-2xl font-bold leading-none"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}

export default function DonateCampaignPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: campaign, isLoading, error } = useGetDonationCampaignBySlug(slug ?? "", {
    query: { enabled: !!slug },
  });
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground animate-pulse">Loading campaign…</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <IslamicStar className="h-12 w-12 text-muted-foreground/30" />
          <h1 className="font-serif text-2xl">Campaign not found</h1>
          <p className="text-muted-foreground text-sm text-center max-w-sm">
            This campaign may have ended or the link may be incorrect.
          </p>
          <Button asChild variant="outline">
            <Link href="/donate">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Donations
            </Link>
          </Button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const target = campaign.targetAmount ? Number(campaign.targetAmount) : null;
  const raised = Number(campaign.raisedAmount ?? 0);
  const pct = target && target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : null;
  const gallery = (campaign.galleryImages ?? []).filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-primary text-primary-foreground overflow-hidden">
          {campaign.imageUrl ? (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${campaign.imageUrl})` }}
              />
              <div className="absolute inset-0 bg-primary/70" />
            </>
          ) : (
            <>
              <IslamicPattern className="absolute inset-0 w-full h-full text-white/5 [background-size:60px_60px]" />
              <IslamicStar className="absolute -top-10 -right-10 w-56 h-56 text-white/5" />
            </>
          )}
          <div className="relative mx-auto max-w-5xl px-6 py-16 md:py-24">
            <Link
              href="/donate"
              className="inline-flex items-center gap-1.5 text-sm text-primary-foreground/70 hover:text-primary-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All campaigns
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                <HandHeart className="h-5 w-5 text-secondary" />
              </div>
              {campaign.featured && (
                <span className="text-xs uppercase tracking-widest font-semibold bg-secondary/20 text-secondary px-2.5 py-1 rounded-full">
                  Featured
                </span>
              )}
            </div>
            <h1 className="font-serif text-3xl md:text-5xl leading-tight mb-4">{campaign.title}</h1>
            <p className="text-primary-foreground/80 max-w-2xl text-lg leading-relaxed">{campaign.description}</p>
          </div>
        </section>

        {/* Body */}
        <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Left: content */}
            <div className="lg:col-span-3 space-y-10">
              {/* Progress */}
              {target && (
                <div className="rounded-2xl border border-card-border bg-card p-6">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="font-semibold text-primary text-base">{formatCurrency(campaign.raisedAmount)} raised</span>
                    <span className="text-muted-foreground">Target {formatCurrency(campaign.targetAmount)}</span>
                  </div>
                  <Progress value={pct ?? 0} className="h-2.5" />
                  {pct !== null && (
                    <p className="text-xs text-muted-foreground mt-2">{pct}% of target reached</p>
                  )}
                </div>
              )}

              {/* Long description */}
              {campaign.longDescription && (
                <div className="prose prose-stone max-w-none">
                  {campaign.longDescription.split("\n\n").map((para, i) => (
                    <p key={i} className="text-muted-foreground leading-relaxed mb-4 last:mb-0">
                      {para}
                    </p>
                  ))}
                </div>
              )}

              {/* Gallery */}
              {gallery.length > 0 && (
                <div>
                  <h2 className="font-serif text-xl mb-4">Project Photos</h2>
                  <div className={`grid gap-3 ${gallery.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                    {gallery.map((src, i) => (
                      <GalleryImage
                        key={i}
                        src={src}
                        alt={`${campaign.title} photo ${i + 1}`}
                        onClick={() => setLightboxSrc(src)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Ways to give note */}
              <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-primary/5 p-6">
                <IslamicPattern className="absolute inset-0 w-full h-full text-primary/[0.04] [background-size:40px_40px]" />
                <p className="relative text-sm text-muted-foreground leading-relaxed">
                  We accept <strong>Zakat</strong>, <strong>Sadaqah</strong>, and <strong>Lillah</strong>. All donations are processed securely. Bank transfer details are available from the masjid office on request.
                </p>
              </div>
            </div>

            {/* Right: donation widget (sticky on desktop) */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-24">
                <DonationWidget campaign={campaign} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />

      {lightboxSrc && (
        <Lightbox
          src={lightboxSrc}
          alt={campaign.title}
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </div>
  );
}
