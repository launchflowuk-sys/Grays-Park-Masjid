import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGetSquareConfig } from "@workspace/api-client-react";

declare global {
  interface Window {
    Square?: {
      payments: (
        applicationId: string,
        locationId: string,
      ) => {
        card: () => Promise<{
          attach: (selector: string) => Promise<void>;
          tokenize: () => Promise<{ status: string; token?: string; errors?: { message: string }[] }>;
          destroy: () => Promise<void>;
        }>;
      };
    };
  }
}

const SCRIPT_IDS: Record<"sandbox" | "production", string> = {
  sandbox: "https://sandbox.web.squarecdn.com/v1/square.js",
  production: "https://web.squarecdn.com/v1/square.js",
};

let squareScriptPromise: Promise<void> | null = null;

function loadSquareScript(environment: "sandbox" | "production") {
  if (window.Square) return Promise.resolve();
  if (!squareScriptPromise) {
    squareScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_IDS[environment];
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Square payment SDK"));
      document.body.appendChild(script);
    });
  }
  return squareScriptPromise;
}

export function SquarePaymentForm({
  onTokenize,
  disabled,
  submitting,
  submitLabel = "Pay Now",
}: {
  onTokenize: (sourceId: string) => Promise<void> | void;
  disabled?: boolean;
  submitting?: boolean;
  submitLabel?: string;
}) {
  const { data: config, isLoading: configLoading, error: configError } = useGetSquareConfig();
  const cardRef = useRef<{
    tokenize: () => Promise<{ status: string; token?: string; errors?: { message: string }[] }>;
    destroy: () => Promise<void>;
  } | null>(null);
  const containerId = useRef(`square-card-container-${Math.random().toString(36).slice(2)}`);
  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [tokenizing, setTokenizing] = useState(false);

  useEffect(() => {
    if (!config) return;
    let cancelled = false;
    let cardInstance: { destroy: () => Promise<void> } | null = null;

    async function init() {
      try {
        await loadSquareScript(config!.environment as "sandbox" | "production");
        if (cancelled || !window.Square) return;
        const payments = window.Square.payments(config!.applicationId, config!.locationId);
        const card = await payments.card();
        await card.attach(`#${containerId.current}`);
        if (cancelled) {
          await card.destroy();
          return;
        }
        cardInstance = card;
        cardRef.current = card;
        setReady(true);
      } catch (err) {
        setInitError(err instanceof Error ? err.message : "Failed to load payment form");
      }
    }

    init();

    return () => {
      cancelled = true;
      if (cardInstance) {
        cardInstance.destroy().catch(() => undefined);
      }
    };
  }, [config]);

  async function handlePay() {
    if (!cardRef.current) return;
    setTokenizing(true);
    setInitError(null);
    try {
      const result = await cardRef.current.tokenize();
      if (result.status === "OK" && result.token) {
        await onTokenize(result.token);
      } else {
        setInitError(result.errors?.[0]?.message ?? "Card could not be verified");
      }
    } catch (err) {
      setInitError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setTokenizing(false);
    }
  }

  if (configLoading) {
    return <p className="text-sm text-muted-foreground">Loading payment form...</p>;
  }

  if (configError) {
    return <p className="text-sm text-destructive">Unable to load the payment form. Please try again later.</p>;
  }

  return (
    <div className="space-y-4">
      <div id={containerId.current} data-testid="square-card-container" className="min-h-[90px] rounded-md border border-input p-3" />
      {!ready && !initError && <p className="text-sm text-muted-foreground">Loading card entry...</p>}
      {initError && <p className="text-sm text-destructive">{initError}</p>}
      <Button
        type="button"
        className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
        disabled={!ready || disabled || tokenizing || submitting}
        onClick={handlePay}
        data-testid="button-pay-now"
      >
        {tokenizing || submitting ? "Processing..." : submitLabel}
      </Button>
    </div>
  );
}
