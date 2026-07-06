import { SquareClient, SquareEnvironment } from "square";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db, siteSettingsTable } from "@workspace/db";

export const SQUARE_ACCESS_TOKEN_KEY = "square_access_token";
export const SQUARE_APPLICATION_ID_KEY = "square_application_id";
export const SQUARE_LOCATION_ID_KEY = "square_location_id";

export const SQUARE_SETTING_KEYS = [
  SQUARE_ACCESS_TOKEN_KEY,
  SQUARE_APPLICATION_ID_KEY,
  SQUARE_LOCATION_ID_KEY,
] as const;

type SquareCredentials = {
  accessToken: string;
  applicationId: string;
  locationId: string;
};

async function getSetting(key: string): Promise<string | undefined> {
  const [row] = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, key)).limit(1);
  return row?.value || undefined;
}

async function getSquareCredentials(): Promise<SquareCredentials | null> {
  const [accessToken, applicationId, locationId] = await Promise.all([
    getSetting(SQUARE_ACCESS_TOKEN_KEY),
    getSetting(SQUARE_APPLICATION_ID_KEY),
    getSetting(SQUARE_LOCATION_ID_KEY),
  ]);

  if (!accessToken || !applicationId || !locationId) {
    return null;
  }

  return { accessToken, applicationId, locationId };
}

export class SquarePaymentError extends Error {}

export async function getSquareConfig(): Promise<{
  applicationId: string;
  locationId: string;
  environment: "sandbox" | "production";
} | null> {
  const creds = await getSquareCredentials();

  if (!creds) {
    return null;
  }

  return {
    applicationId: creds.applicationId,
    locationId: creds.locationId,
    environment: creds.applicationId.startsWith("sandbox-") ? "sandbox" : "production",
  };
}

export async function createSquarePayment(params: { amount: string; sourceId: string }) {
  const creds = await getSquareCredentials();

  if (!creds) {
    throw new SquarePaymentError(
      "Square is not configured. Add Square credentials in Admin \u2192 Site Settings.",
    );
  }

  const amountInSmallestUnit = Math.round(Number(params.amount) * 100);

  if (!Number.isFinite(amountInSmallestUnit) || amountInSmallestUnit <= 0) {
    throw new SquarePaymentError("Invalid donation amount");
  }

  const environment = creds.applicationId.startsWith("sandbox-")
    ? SquareEnvironment.Sandbox
    : SquareEnvironment.Production;

  const client = new SquareClient({ token: creds.accessToken, environment });

  try {
    const response = await client.payments.create({
      idempotencyKey: randomUUID(),
      sourceId: params.sourceId,
      locationId: creds.locationId,
      amountMoney: {
        amount: BigInt(amountInSmallestUnit),
        currency: "GBP",
      },
    });

    const payment = response.payment;

    if (!payment || !payment.id || payment.status !== "COMPLETED") {
      throw new SquarePaymentError("Payment was not completed");
    }

    return payment;
  } catch (err) {
    if (err instanceof SquarePaymentError) throw err;
    const message = err instanceof Error ? err.message : "Payment processing failed";
    throw new SquarePaymentError(message);
  }
}
