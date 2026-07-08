import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SquarePaymentForm } from "@/components/donations/square-payment-form";
import { useCheckoutDonation, getListDonationCampaignsPublicQueryKey, type DonationCampaign } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, ExternalLink } from "lucide-react";

function formatCurrency(value: number | string) {
  const num = Number(value);
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(num);
}

interface DonationWidgetProps {
  campaign: DonationCampaign;
  onSuccess?: () => void;
}

function OneTimeTab({ campaign }: { campaign: DonationCampaign }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const presets = campaign.presetAmounts?.length ? campaign.presetAmounts : [10, 25, 50, 100];
  const defaultPreset = String(presets[1] ?? presets[0] ?? 25);

  const [selectedPreset, setSelectedPreset] = useState(defaultPreset);
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const effectiveAmount = customAmount.trim() !== "" ? customAmount.trim() : selectedPreset;
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

  async function handleTokenize(sourceId: string) {
    if (!isValidAmount) return;
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

  if (success) {
    return (
      <div className="py-8 text-center space-y-3" data-testid="donation-success">
        <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
        <p className="font-serif text-xl">Jazak Allahu Khairan!</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your donation of {formatCurrency(effectiveAmount)} has been received. May Allah accept it and reward you greatly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <Label className="mb-2 block text-sm font-medium">Amount (£)</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-2">
          {presets.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant={selectedPreset === String(preset) && !customAmount ? "default" : "outline"}
              onClick={() => { setSelectedPreset(String(preset)); setCustomAmount(""); }}
              data-testid={`button-amount-${preset}`}
              className="font-semibold"
            >
              £{preset}
            </Button>
          ))}
        </div>
        <Input
          type="number"
          min="1"
          step="0.01"
          placeholder="Other amount"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          data-testid="input-custom-amount"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1 block text-sm">Name (optional)</Label>
          <Input value={donorName} onChange={(e) => setDonorName(e.target.value)} data-testid="input-donor-name" />
        </div>
        <div>
          <Label className="mb-1 block text-sm">Email (optional)</Label>
          <Input type="email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} data-testid="input-donor-email" />
        </div>
      </div>

      {!isValidAmount && customAmount && (
        <p className="text-sm text-destructive">Please enter a valid amount.</p>
      )}

      <SquarePaymentForm
        onTokenize={handleTokenize}
        disabled={!isValidAmount}
        submitting={checkoutMutation.isPending}
        submitLabel={isValidAmount ? `Donate ${formatCurrency(effectiveAmount)}` : "Donate Now"}
      />
    </div>
  );
}

function MonthlyTab({ campaign }: { campaign: DonationCampaign }) {
  const platformLabel = (() => {
    if (!campaign.externalDonationUrl) return "Monthly Giving";
    try {
      const url = new URL(campaign.externalDonationUrl);
      const host = url.hostname.replace(/^www\./, "");
      return host.split(".")[0].charAt(0).toUpperCase() + host.split(".")[0].slice(1);
    } catch {
      return "our giving platform";
    }
  })();

  return (
    <div className="py-4 space-y-4">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Set up a monthly standing order to support this campaign regularly. Regular giving helps us plan and deliver lasting impact.
      </p>
      {campaign.externalDonationUrl ? (
        <Button
          className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold"
          onClick={() => window.open(campaign.externalDonationUrl!, "_blank", "noopener")}
          data-testid="button-monthly-external"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Give monthly via {platformLabel}
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          Please contact the masjid office to set up a regular standing order.
        </p>
      )}
    </div>
  );
}

export function DonationWidget({ campaign }: DonationWidgetProps) {
  const showOneTime = campaign.allowOneTime !== false;
  const showMonthly = campaign.allowMonthly === true && !!campaign.externalDonationUrl;
  const bothTabs = showOneTime && showMonthly;

  if (!showOneTime && !showMonthly) {
    return (
      <div className="rounded-2xl border border-card-border bg-card p-6 text-center text-sm text-muted-foreground">
        Contact the masjid office to donate to this campaign.
      </div>
    );
  }

  if (!bothTabs) {
    return (
      <div className="rounded-2xl border border-card-border bg-card p-6 space-y-4">
        <p className="font-serif text-lg">Make a Donation</p>
        <div className="w-8 h-[2px] bg-secondary" />
        {showOneTime ? <OneTimeTab campaign={campaign} /> : <MonthlyTab campaign={campaign} />}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-card-border bg-card p-6">
      <p className="font-serif text-lg mb-1">Make a Donation</p>
      <div className="w-8 h-[2px] bg-secondary mb-4" />
      <Tabs defaultValue="one-time">
        <TabsList className="w-full mb-5">
          <TabsTrigger value="one-time" className="flex-1" data-testid="tab-one-time">One-time</TabsTrigger>
          <TabsTrigger value="monthly" className="flex-1" data-testid="tab-monthly">Monthly</TabsTrigger>
        </TabsList>
        <TabsContent value="one-time">
          <OneTimeTab campaign={campaign} />
        </TabsContent>
        <TabsContent value="monthly">
          <MonthlyTab campaign={campaign} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
