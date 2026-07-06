import twilio from "twilio";
import { logger } from "./logger";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function sendSms(to: string, body: string): Promise<void> {
  if (!client || !fromNumber) {
    logger.warn(
      { to },
      "Twilio is not configured (TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_PHONE_NUMBER). Skipping SMS send.",
    );
    return;
  }

  await client.messages.create({ to, from: fromNumber, body });
}
