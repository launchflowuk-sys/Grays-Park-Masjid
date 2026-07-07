import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/auth";
import { sendEmail } from "../lib/mail";
import { renderEmailTemplate } from "../lib/email-templates";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/admin/support-request", requireAuth, async (req, res) => {
  const { issueType, urgency, message } = req.body as {
    issueType?: string;
    urgency?: string;
    message?: string;
  };

  if (!issueType || !urgency || !message?.trim()) {
    res.status(400).json({ error: "issueType, urgency, and message are required." });
    return;
  }

  const adminName = (req as any).admin?.name ?? "Unknown admin";
  const adminEmail = (req as any).admin?.email ?? "unknown";
  const adminRole = (req as any).admin?.role ?? "unknown";

  const urgencyLabel: Record<string, string> = {
    low: "🟢 Low",
    medium: "🟡 Medium",
    high: "🔴 High",
    critical: "🚨 Critical",
  };

  const issueLabel: Record<string, string> = {
    website_error: "Website Error",
    dashboard_issue: "Dashboard Issue",
    feature_request: "Feature Request",
    other: "Other",
  };

  const subject = `[Support Request] ${issueLabel[issueType] ?? issueType} — ${urgencyLabel[urgency] ?? urgency} — ${adminName}`;

  const bodyHtml = `
    <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
      <tr><td style="padding:8px 0;border-bottom:1px solid #e7e2d5;color:#6b6b63;width:140px;">Issue Type</td><td style="padding:8px 0;border-bottom:1px solid #e7e2d5;font-weight:600;">${issueLabel[issueType] ?? issueType}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e7e2d5;color:#6b6b63;">Urgency</td><td style="padding:8px 0;border-bottom:1px solid #e7e2d5;font-weight:600;">${urgencyLabel[urgency] ?? urgency}</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid #e7e2d5;color:#6b6b63;">Submitted by</td><td style="padding:8px 0;border-bottom:1px solid #e7e2d5;">${adminName} &lt;${adminEmail}&gt;</td></tr>
      <tr><td style="padding:8px 0;color:#6b6b63;">Role</td><td style="padding:8px 0;">${adminRole}</td></tr>
    </table>
    <div style="margin-top:24px;">
      <p style="margin:0 0 8px;font-weight:600;color:#2b2b26;">Message</p>
      <div style="background:#f5f1e8;border-left:4px solid #c9a84c;padding:16px;border-radius:4px;white-space:pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
    </div>
  `;

  try {
    await sendEmail({
      to: "support@launchflow.co.uk",
      subject,
      text: `Issue Type: ${issueLabel[issueType] ?? issueType}\nUrgency: ${urgencyLabel[urgency] ?? urgency}\nSubmitted by: ${adminName} <${adminEmail}>\nRole: ${adminRole}\n\nMessage:\n${message}`,
      html: renderEmailTemplate({
        preheader: `New support request from ${adminName} — ${issueLabel[issueType] ?? issueType}`,
        heading: "New Support Request",
        bodyHtml,
      }),
    });

    logger.info({ issueType, urgency, adminEmail }, "Support request sent to support@launchflow.co.uk");
    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Failed to send support request email");
    res.status(500).json({ error: "Failed to send support request." });
  }
});

export default router;
