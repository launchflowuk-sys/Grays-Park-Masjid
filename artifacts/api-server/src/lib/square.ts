import { SquareClient, SquareEnvironment } from "square";
import { randomUUID } from "crypto";

const accessToken = process.env.SQUARE_ACCESS_TOKEN;
const applicationId = process.env.SQUARE_APPLICATION_ID;
const locationId = process.env.SQUARE_LOCATION_ID;

if (!accessToken || !applicationId || !locationId) {
  throw new Error(
    "SQUARE_ACCESS_TOKEN, SQUARE_APPLICATION_ID and SQUARE_LOCATION_ID environment variables are required.",
  );
}

export const squareEnvironment: "sandbox" | "production" = applicationId.startsWith("sandbox-")
  ? "sandbox"
  : "production";

export const squareClient = new SquareClient({
  token: accessToken,
  environment: squareEnvironment === "sandbox" ? SquareEnvironment.Sandbox : SquareEnvironment.Production,
});

export const squareConfig = {
  applicationId,
  locationId,
  environment: squareEnvironment,
};

export class SquarePaymentError extends Error {}

export async function createSquarePayment(params: { amount: string; sourceId: string }) {
  const amountInSmallestUnit = Math.round(Number(params.amount) * 100);

  if (!Number.isFinite(amountInSmallestUnit) || amountInSmallestUnit <= 0) {
    throw new SquarePaymentError("Invalid donation amount");
  }

  try {
    const response = await squareClient.payments.create({
      idempotencyKey: randomUUID(),
      sourceId: params.sourceId,
      locationId,
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
