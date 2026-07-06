import { Router, type IRouter, type Request, type Response } from "express";
import { eq, sql, desc } from "drizzle-orm";
import {
  db,
  donationCampaignsTable,
  donationTransactionsTable,
  insertDonationCampaignSchema,
} from "@workspace/db";
import { CheckoutDonationBody } from "@workspace/api-zod";
import {
  registerAdminCreate,
  registerAdminItemRoutes,
  registerAdminList,
  registerPublicList,
} from "../lib/crud";
import { ALL_ROLES, DONATION_WRITE } from "../lib/roles";
import { requireAuth, requireRole } from "../middlewares/auth";
import { createSquarePayment, squareConfig, SquarePaymentError } from "../lib/square";
import { logger } from "../lib/logger";
import { notifyModule, sendUserConfirmationEmail } from "../lib/notifications";

const router: IRouter = Router();

registerPublicList(router, "/donation-campaigns", donationCampaignsTable, eq(donationCampaignsTable.active, true));
registerAdminList(router, "/admin/donation-campaigns", donationCampaignsTable, ALL_ROLES);
registerAdminCreate(
  router,
  "/admin/donation-campaigns",
  donationCampaignsTable,
  insertDonationCampaignSchema,
  DONATION_WRITE,
);
registerAdminItemRoutes(
  router,
  "/admin/donation-campaigns",
  donationCampaignsTable,
  donationCampaignsTable.id,
  insertDonationCampaignSchema.partial(),
  DONATION_WRITE,
);

function serializeTransaction(row: typeof donationTransactionsTable.$inferSelect) {
  return {
    id: row.id,
    campaignId: row.campaignId,
    amount: row.amount,
    donorName: row.donorName,
    donorEmail: row.donorEmail,
    squarePaymentId: row.squarePaymentId,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/donations/square-config", (_req: Request, res: Response) => {
  res.json(squareConfig);
});

router.post("/donations/checkout", async (req: Request, res: Response) => {
  const parsed = CheckoutDonationBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const { campaignId, amount, sourceId, donorName, donorEmail } = parsed.data;

  const [campaign] = await db
    .select()
    .from(donationCampaignsTable)
    .where(eq(donationCampaignsTable.id, campaignId))
    .limit(1);

  if (!campaign || !campaign.active) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }

  try {
    const payment = await createSquarePayment({ amount, sourceId });

    const [transaction] = await db
      .insert(donationTransactionsTable)
      .values({
        campaignId,
        amount,
        donorName: donorName ?? null,
        donorEmail: donorEmail ?? null,
        squarePaymentId: payment.id as string,
        status: "succeeded",
      })
      .returning();

    await db
      .update(donationCampaignsTable)
      .set({ raisedAmount: sql`${donationCampaignsTable.raisedAmount} + ${amount}` })
      .where(eq(donationCampaignsTable.id, campaignId));

    res.status(201).json(serializeTransaction(transaction));

    void notifyModule("donations", {
      subject: `New donation received: ${campaign.title}`,
      text: `A new donation of £${amount} was received for "${campaign.title}"${donorName ? ` from ${donorName}` : ""}.`,
      html: `<p>A new donation of £${amount} was received for "${campaign.title}"${donorName ? ` from ${donorName}` : ""}.</p>`,
      smsBody: `New donation of £${amount} for "${campaign.title}"`,
    });

    if (donorEmail) {
      void sendUserConfirmationEmail({
        to: donorEmail,
        subject: `Thank you for your donation - Grays Park Masjid`,
        text: `Assalamu Alaikum${donorName ? ` ${donorName}` : ""},\n\nJazakAllah Khair for your donation of £${amount} to "${campaign.title}". May Allah reward you for your generosity.`,
        html: `<p>Assalamu Alaikum${donorName ? ` ${donorName}` : ""},</p><p>JazakAllah Khair for your donation of £${amount} to "${campaign.title}". May Allah reward you for your generosity.</p>`,
      });
    }
  } catch (err) {
    if (err instanceof SquarePaymentError) {
      logger.warn({ err, campaignId }, "Donation payment failed");
      res.status(402).json({ error: err.message });
      return;
    }

    logger.error({ err, campaignId }, "Unexpected error processing donation payment");
    res.status(500).json({ error: "Failed to process payment" });
  }
});

router.get(
  "/admin/donations/transactions",
  requireAuth,
  requireRole(...DONATION_WRITE),
  async (req: Request, res: Response) => {
    const campaignId = typeof req.query.campaignId === "string" ? req.query.campaignId : undefined;

    const rows = campaignId
      ? await db
          .select()
          .from(donationTransactionsTable)
          .where(eq(donationTransactionsTable.campaignId, campaignId))
          .orderBy(desc(donationTransactionsTable.createdAt))
      : await db
          .select()
          .from(donationTransactionsTable)
          .orderBy(desc(donationTransactionsTable.createdAt));

    res.json(rows.map(serializeTransaction));
  },
);

export default router;
