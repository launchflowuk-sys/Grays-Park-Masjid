import { Router, type IRouter, type Request, type Response } from "express";
import { eq, desc, isNotNull, inArray } from "drizzle-orm";
import {
  db,
  emailCampaignsTable,
  membersTable,
  insertEmailCampaignSchema,
  patchEmailCampaignSchema,
} from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";
import { MASJID_WRITE, ALL_ROLES } from "../lib/roles";
import { sendEmail } from "../lib/mail";
import { renderEmailTemplate, emailParagraphs, escapeHtml } from "../lib/email-templates";
import { logger } from "../lib/logger";

const router: IRouter = Router();

/**
 * Resolve a potentially relative image URL to an absolute one.
 * Relative URLs (starting with "/") break in actual email clients because they
 * have no origin to resolve against. Use APP_BASE_URL if set, otherwise derive
 * from the incoming request host.
 */
function resolveImageUrl(url: string | null | undefined, req: Request): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("/")) {
    const appBaseUrl =
      process.env.APP_BASE_URL ||
      `${(req.headers["x-forwarded-proto"] as string | undefined) ?? req.protocol}://${(req.headers["x-forwarded-host"] as string | undefined) ?? req.get("host")}`;
    return `${appBaseUrl.replace(/\/$/, "")}${url}`;
  }
  return url;
}

router.get(
  "/admin/email-campaigns",
  requireAuth,
  requireRole(...ALL_ROLES),
  async (_req: Request, res: Response) => {
    const campaigns = await db
      .select()
      .from(emailCampaignsTable)
      .orderBy(desc(emailCampaignsTable.createdAt));
    res.json(campaigns);
  },
);

router.get(
  "/admin/email-campaigns/:id",
  requireAuth,
  requireRole(...ALL_ROLES),
  async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const [campaign] = await db
      .select()
      .from(emailCampaignsTable)
      .where(eq(emailCampaignsTable.id, id))
      .limit(1);

    if (!campaign) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }

    res.json(campaign);
  },
);

router.post(
  "/admin/email-campaigns/preview",
  requireAuth,
  requireRole(...ALL_ROLES),
  async (req: Request, res: Response) => {
    const { subject, bannerImageUrl, bodyText, ctaLabel, ctaUrl } = req.body as {
      subject?: string;
      bannerImageUrl?: string | null;
      bodyText?: string;
      ctaLabel?: string | null;
      ctaUrl?: string | null;
    };

    const resolvedBody = bodyText ?? "";
    const resolvedSubject = subject ?? "Preview";

    const bodyHtml = emailParagraphs(
      resolvedBody
        .split("\n")
        .map((line) => escapeHtml(line))
        .filter(Boolean),
    ) || `<p style="margin:0 0 14px 0;">Your email body will appear here.</p>`;

    const html = renderEmailTemplate({
      heading: resolvedSubject,
      bodyHtml,
      bannerImageUrl: resolveImageUrl(bannerImageUrl, req),
      ctaLabel: ctaLabel ?? undefined,
      ctaUrl: ctaUrl ?? undefined,
    });

    res.json({ html });
  },
);

router.post(
  "/admin/email-campaigns",
  requireAuth,
  requireRole(...MASJID_WRITE),
  async (req: Request, res: Response) => {
    const parsed = insertEmailCampaignSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data", details: parsed.error.flatten() });
      return;
    }

    const [campaign] = await db
      .insert(emailCampaignsTable)
      .values(parsed.data)
      .returning();

    res.status(201).json(campaign);
  },
);

router.patch(
  "/admin/email-campaigns/:id",
  requireAuth,
  requireRole(...MASJID_WRITE),
  async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const [existing] = await db
      .select()
      .from(emailCampaignsTable)
      .where(eq(emailCampaignsTable.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }

    if (existing.status === "sent") {
      res.status(400).json({ error: "Cannot edit a sent campaign" });
      return;
    }

    const parsed = patchEmailCampaignSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data", details: parsed.error.flatten() });
      return;
    }

    const [updated] = await db
      .update(emailCampaignsTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(emailCampaignsTable.id, id))
      .returning();

    res.json(updated);
  },
);

router.delete(
  "/admin/email-campaigns/:id",
  requireAuth,
  requireRole(...MASJID_WRITE),
  async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const [existing] = await db
      .select()
      .from(emailCampaignsTable)
      .where(eq(emailCampaignsTable.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }

    await db.delete(emailCampaignsTable).where(eq(emailCampaignsTable.id, id));
    res.status(204).end();
  },
);

router.post(
  "/admin/email-campaigns/:id/send",
  requireAuth,
  requireRole(...MASJID_WRITE),
  async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const [campaign] = await db
      .select()
      .from(emailCampaignsTable)
      .where(eq(emailCampaignsTable.id, id))
      .limit(1);

    if (!campaign) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }

    if (campaign.status === "sent") {
      res.status(400).json({ error: "Campaign has already been sent" });
      return;
    }

    type Recipient = { email: string; statusToken: string };
    let recipients: Recipient[] = [];

    if (campaign.recipientType === "all_members") {
      const rows = await db
        .select({ email: membersTable.email, statusToken: membersTable.statusToken })
        .from(membersTable)
        .where(eq(membersTable.emailOptOut, false));
      recipients = rows.filter((r) => r.email) as Recipient[];
    } else {
      const storedEmails = (campaign.recipientEmails ?? []).filter(Boolean);
      if (storedEmails.length > 0) {
        const rows = await db
          .select({ email: membersTable.email, statusToken: membersTable.statusToken, emailOptOut: membersTable.emailOptOut })
          .from(membersTable)
          .where(inArray(membersTable.email, storedEmails));
        recipients = rows.filter((r) => r.email && !r.emailOptOut) as Recipient[];
      }
    }

    // Deduplicate by email, keeping the first occurrence
    const seen = new Set<string>();
    const uniqueRecipients = recipients.filter((r) => {
      if (seen.has(r.email)) return false;
      seen.add(r.email);
      return true;
    });

    if (uniqueRecipients.length === 0) {
      res.status(400).json({ error: "No recipients found (all may have unsubscribed)" });
      return;
    }

    const appBaseUrl = process.env.APP_BASE_URL ?? "";
    const bodyLines = campaign.bodyText.split("\n").filter((l) => l.trim());

    const bodyHtml = emailParagraphs(bodyLines.map((line) => escapeHtml(line)));

    const plainText = [
      campaign.subject,
      "",
      ...bodyLines,
      ...(campaign.ctaLabel && campaign.ctaUrl
        ? ["", `${campaign.ctaLabel}: ${campaign.ctaUrl}`]
        : []),
      "",
      "Grays Park Masjid, Grays, Essex",
    ].join("\n");

    let sent = 0;
    let failed = 0;

    for (const recipient of uniqueRecipients) {
      const unsubscribeUrl = `${appBaseUrl}/unsubscribe?token=${encodeURIComponent(recipient.statusToken)}`;
      const htmlBody = renderEmailTemplate({
        heading: campaign.subject,
        bodyHtml,
        bannerImageUrl: resolveImageUrl(campaign.bannerImageUrl, req),
        ctaLabel: campaign.ctaLabel ?? undefined,
        ctaUrl: campaign.ctaUrl ?? undefined,
        unsubscribeUrl,
      });
      try {
        await sendEmail({
          to: recipient.email,
          subject: campaign.subject,
          text: `${plainText}\n\nUnsubscribe: ${unsubscribeUrl}`,
          html: htmlBody,
        });
        sent++;
      } catch (err) {
        failed++;
        logger.error({ err, email: recipient.email }, "Failed to send campaign email");
      }
    }

    if (sent === 0) {
      res.status(500).json({
        error: "No emails were delivered. The campaign remains a draft and can be retried.",
        sent: 0,
        failed,
      });
      return;
    }

    const [updated] = await db
      .update(emailCampaignsTable)
      .set({ status: "sent", sentAt: new Date(), sentCount: sent, updatedAt: new Date() })
      .where(eq(emailCampaignsTable.id, id))
      .returning();

    res.json({ campaign: updated, sent, failed });
  },
);

export default router;
