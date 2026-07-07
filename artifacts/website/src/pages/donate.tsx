import { useState } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { SquarePaymentForm } from "@/components/donations/square-payment-form";
import {
  useListDonationCampaignsPublic,
  useCheckoutDonation,
  getListDonationCampaignsPublicQueryKey,
  type DonationCampaign,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, HandHeart } from "lucide-react";
import { IslamicPattern, IslamicStar } from "@/components/site/islamic-pattern";

function formatCurrency(value: string | null | undefined) {
  const num = Number(value ?? 0);
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(num);
}

const PRESET_AMOUNTS = ["10", "25", "50", "100"];

function DonationDialog({ campaign, open, onOpenChange }: { campaign: DonationCampaign | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("25");
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const effectiveAmount = customAmount.trim() !== "" ? customAmount.trim() : amount;
  const parsedAmount = Number(effectiveAmount);
  const isValidAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;

  const checkoutMutation = useCheckoutDonation({
    mutation: {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListDonationCampaignsPublicQueryKey() }); setSuccess(true); },
      onError: (error: unknown) => toast({ title: "Payment failed", description: error instanceof Error ? error.message : "Please check your card details and try again.", variant: "destructive" }),
    },
  });

  function resetAndClose() {
    onOpenChange(false);
    setTimeout(() => { setAmount("25"); setCustomAmount(""); setDonorName(""); setDonorEmail(""); setSuccess(false); }, 200);
  }

  async function handleTokenize(sourceId: string) {
    if (!campaign || !isValidAmount) return;
    await checkoutMutation.mutateAsync({ data: { campaignId: campaign.id, amount: parsedAmount.toFixed(2), sourceId, donorName: donorName.trim() || undefined, donorEmail: donorEmail.trim() || undefined } });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : resetAndClose())}>
      <DialogContent className="max-w-md">
        {success ? (
          <div className="py-6 text-center space-y-3" data-testid="donation-success">
            <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
            <DialogTitle>Jazak Allahu Khairan!</DialogTitle>
            <p className="text-sm text-muted-foreground">Your donation of {formatCurrency(effectiveAmount)} to {campaign?.title} has been received. May Allah accept it.</p>
            <Button onClick={resetAndClose} className="mt-2" data-testid="button-close-success">Close</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Donate to {campaign?.title}</DialogTitle>
              <DialogDescription>Enter an amount and complete your donation securely via Square.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Amount (£)</Label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {PRESET_AMOUNTS.map((preset) => (
                    <Button key={preset} type="button" variant={amount === preset && !customAmount ? "default" : "outline"} onClick={() => { setAmount(preset); setCustomAmount(""); }} data-testid={`button-amount-${preset}`}>
                      £{preset}
                    </Button>
                  ))}
                </div>
                <Input type="number" min="1" step="0.01" placeholder="Custom amount" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} data-testid="input-custom-amount" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="mb-1 block">Name (optional)</Label><Input value={donorName} onChange={(e) => setDonorName(e.target.value)} data-testid="input-donor-name" /></div>
                <div><Label className="mb-1 block">Email (optional)</Label><Input type="email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} data-testid="input-donor-email" /></div>
              </div>
              {!isValidAmount && <p className="text-sm text-destructive">Please enter a valid amount.</p>}
              <SquarePaymentForm onTokenize={handleTokenize} disabled={!isValidAmount} submitting={checkoutMutation.isPending} submitLabel={isValidAmount ? `Pay ${formatCurrency(effectiveAmount)}` : "Pay Now"} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function DonatePage() {
  const { data, isLoading } = useListDonationCampaignsPublic();
  const active = (data ?? []).filter((c) => c.active);
  const featured = active.filter((c) => c.featured);
  const others = active.filter((c) => !c.featured);
  const [selectedCampaign, setSelectedCampaign] = useState<DonationCampaign | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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
              {[...featured, ...others].map((campaign) => {
                const target = campaign.targetAmount ? Number(campaign.targetAmount) : null;
                const raised = Number(campaign.raisedAmount);
                const pct = target && target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : null;

                return (
                  <div
                    key={campaign.id}
                    data-testid={`card-campaign-${campaign.id}`}
                    className="relative overflow-hidden rounded-2xl border border-card-border bg-card"
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
                        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{campaign.description}</p>
                        {target && (
                          <div className="mb-6">
                            <Progress value={pct ?? 0} className="h-2 mb-2" />
                            <div className="flex justify-between text-sm">
                              <span className="font-semibold text-primary">{formatCurrency(campaign.raisedAmount)} raised</span>
                              <span className="text-muted-foreground">Target {formatCurrency(campaign.targetAmount)}</span>
                            </div>
                          </div>
                        )}
                        <Button
                          className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold"
                          onClick={() => { setSelectedCampaign(campaign); setDialogOpen(true); }}
                          data-testid={`button-donate-${campaign.id}`}
                        >
                          Donate to this campaign
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
      <DonationDialog campaign={selectedCampaign} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
