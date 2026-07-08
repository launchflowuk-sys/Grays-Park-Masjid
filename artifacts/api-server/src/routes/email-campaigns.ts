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
      bannerImageUrl: bannerImageUrl ?? undefined,
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

    let recipientEmails: string[] = [];

    if (campaign.recipientType === "all_members") {
      const members = await db
        .select({ email: membersTable.email })
        .from(membersTable)
        .where(isNotNull(membersTable.email));
      recipientEmails = members.map((m) => m.email).filter(Boolean) as string[];
    } else {
      const storedEmails = (campaign.recipientEmails ?? []).filter(Boolean);
      if (storedEmails.length > 0) {
        const members = await db
          .select({ email: membersTable.email })
          .from(membersTable)
          .where(inArray(membersTable.email, storedEmails));
        recipientEmails = members.map((m) => m.email).filter(Boolean) as string[];
      }
    }

    const uniqueEmails = [...new Set(recipientEmails)];

    if (uniqueEmails.length === 0) {
      res.status(400).json({ error: "No recipients found" });
      return;
    }

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

    const htmlBody = renderEmailTemplate({
      heading: campaign.subject,
      bodyHtml,
      bannerImageUrl: campaign.bannerImageUrl ?? undefined,
      ctaLabel: campaign.ctaLabel ?? undefined,
      ctaUrl: campaign.ctaUrl ?? undefined,
    });

    let sent = 0;
    let failed = 0;

    for (const email of uniqueEmails) {
      try {
        await sendEmail({
          to: email,
          subject: campaign.subject,
          text: plainText,
          html: htmlBody,
        });
        sent++;
      } catch (err) {
        failed++;
        logger.error({ err, email }, "Failed to send campaign email");
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
