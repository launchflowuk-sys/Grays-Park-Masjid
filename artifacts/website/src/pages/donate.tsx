import { useState } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { HandHeart, CheckCircle2 } from "lucide-react";

function formatCurrency(value: string | null | undefined) {
  const num = Number(value ?? 0);
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(num);
}

const PRESET_AMOUNTS = ["10", "25", "50", "100"];

function DonationDialog({
  campaign,
  open,
  onOpenChange,
}: {
  campaign: DonationCampaign | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
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
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDonationCampaignsPublicQueryKey() });
        setSuccess(true);
      },
      onError: (error: unknown) =>
        toast({
          title: "Payment failed",
          description: error instanceof Error ? error.message : "Please check your card details and try again.",
          variant: "destructive",
        }),
    },
  });

  function resetAndClose() {
    onOpenChange(false);
    setTimeout(() => {
      setAmount("25");
      setCustomAmount("");
      setDonorName("");
      setDonorEmail("");
      setSuccess(false);
    }, 200);
  }

  async function handleTokenize(sourceId: string) {
    if (!campaign || !isValidAmount) return;
    await checkoutMutation.mutateAsync({
      data: {
        campaignId: campaign.id,
        amount: parsedAmount.toFixed(2),
        sourceId,
        donorName: donorName.trim() || undefined,
        donorEmail: donorEmail.trim() || undefined,
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : resetAndClose())}>
      <DialogContent className="max-w-md">
        {success ? (
          <div className="py-6 text-center space-y-3" data-testid="donation-success">
            <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
            <DialogTitle>Jazak Allahu Khairan!</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Your donation of {formatCurrency(effectiveAmount)} to {campaign?.title} has been received.
            </p>
            <Button onClick={resetAndClose} className="mt-2" data-testid="button-close-success">
              Close
            </Button>
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
                    <Button
                      key={preset}
                      type="button"
                      variant={amount === preset && !customAmount ? "default" : "outline"}
                      onClick={() => {
                        setAmount(preset);
                        setCustomAmount("");
                      }}
                      data-testid={`button-amount-${preset}`}
                    >
                      £{preset}
                    </Button>
                  ))}
                </div>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Custom amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  data-testid="input-custom-amount"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1 block">Name (optional)</Label>
                  <Input
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    data-testid="input-donor-name"
                  />
                </div>
                <div>
                  <Label className="mb-1 block">Email (optional)</Label>
                  <Input
                    type="email"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    data-testid="input-donor-email"
                  />
                </div>
              </div>
              {!isValidAmount && (
                <p className="text-sm text-destructive">Please enter a valid amount.</p>
              )}
              <SquarePaymentForm
                onTokenize={handleTokenize}
                disabled={!isValidAmount}
                submitting={checkoutMutation.isPending}
                submitLabel={isValidAmount ? `Pay ${formatCurrency(effectiveAmount)}` : "Pay Now"}
              />
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
                        <Button
                          className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setDialogOpen(true);
                          }}
                          data-testid={`button-donate-${campaign.id}`}
                        >
                          Donate to this campaign
                        </Button>
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

      <DonationDialog campaign={selectedCampaign} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
