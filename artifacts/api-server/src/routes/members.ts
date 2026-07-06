import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, membersTable, insertMemberSchema, patchMemberSchema, type MemberStatus } from "@workspace/db";
import { registerAdminExportCsv, registerAdminList } from "../lib/crud";
import { requireAuth, requireRole } from "../middlewares/auth";
import { ALL_ROLES, MASJID_WRITE } from "../lib/roles";
import { notifyModule, sendUserConfirmationEmail } from "../lib/notifications";
import { renderEmailTemplate, emailParagraphs, emailInfoBox, escapeHtml } from "../lib/email-templates";

const router: IRouter = Router();

function serialize(row: typeof membersTable.$inferSelect) {
  return {
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    address: row.address,
    membershipType: row.membershipType,
    message: row.message,
    status: row.status,
    adminNotes: row.adminNotes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

router.post("/members", async (req: Request, res: Response) => {
  const parsed = insertMemberSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const [row] = await db.insert(membersTable).values(parsed.data).returning();
  res.status(201).json(serialize(row));

  const appBaseUrl = process.env.APP_BASE_URL ?? "";
  const adminUrl = `${appBaseUrl}/admin/members`;

  void notifyModule("members", {
    subject: `New membership application: ${row.fullName}`,
    text: `A new membership application was submitted by ${row.fullName} (${row.email}).\n\nMembership type: ${row.membershipType}\n\nView in admin panel: ${adminUrl}`,
    html: `<p>A new membership application was submitted by ${escapeHtml(row.fullName)} (${escapeHtml(row.email)}).</p><p><strong>Membership type:</strong> ${escapeHtml(row.membershipType)}</p><p><a href="${adminUrl}">View in admin panel</a></p>`,
    smsBody: `New membership application from ${row.fullName}. View: ${adminUrl}`,
  });

  void sendUserConfirmationEmail({
    to: row.email,
    subject: "We've received your membership application - Grays Park Masjid",
    text: `Assalamu Alaikum ${row.fullName},\n\nJazakAllah Khair for applying to join the Grays Park Masjid community. We have received your application and our team will review it shortly. We will be in touch with an update soon.`,
    html: renderEmailTemplate({
      preheader: "Your membership application has been received.",
      heading: "Application received",
      bodyHtml: emailParagraphs([
        `Assalamu Alaikum ${escapeHtml(row.fullName)},`,
        "JazakAllah Khair for applying to join the Grays Park Masjid community. We have received your application and our team will review it shortly.",
        "We will be in touch with an update as soon as the review is complete. In the meantime, if anything changes with your details, feel free to reply to this email.",
      ]) + emailInfoBox([{ label: "Membership type", value: escapeHtml(row.membershipType) }]),
    }),
  });
});

registerAdminList(router, "/admin/members", membersTable, ALL_ROLES);
registerAdminExportCsv(
  router,
  "/admin/members",
  membersTable,
  [
    { key: "createdAt", header: "Date" },
    { key: "fullName", header: "Full Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "address", header: "Address" },
    { key: "membershipType", header: "Membership Type" },
    { key: "message", header: "Message" },
    { key: "status", header: "Status" },
    { key: "adminNotes", header: "Admin Notes" },
  ],
  ALL_ROLES,
  "members.csv",
);

router.get("/admin/members/:id", requireAuth, requireRole(...ALL_ROLES), async (req: Request, res: Response) => {
  const [row] = await db.select().from(membersTable).where(eq(membersTable.id, (req.params.id as string))).limit(1);

  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json(serialize(row));
});

function statusEmail(status: MemberStatus, member: typeof membersTable.$inferSelect) {
  if (status === "approved") {
    return {
      subject: "Welcome! Your Grays Park Masjid membership has been approved",
      text: `Assalamu Alaikum ${member.fullName},\n\nAlhamdulillah, we're pleased to let you know that your membership application has been approved. Welcome to the Grays Park Masjid community!`,
      html: renderEmailTemplate({
        preheader: "Your membership has been approved.",
        heading: "Your membership is approved",
        bodyHtml: emailParagraphs([
          `Assalamu Alaikum ${escapeHtml(member.fullName)},`,
          "Alhamdulillah, we're pleased to let you know that your membership application has been approved. Welcome to the Grays Park Masjid community!",
          "We look forward to seeing you at the masjid and having you take part in our programmes and events.",
        ]),
        ctaLabel: "Visit our website",
        ctaUrl: process.env.APP_BASE_URL || undefined,
      }),
    };
  }

  if (status === "denied") {
    return {
      subject: "Update on your Grays Park Masjid membership application",
      text: `Assalamu Alaikum ${member.fullName},\n\nThank you for your interest in joining the Grays Park Masjid community. After review, we are unable to approve your membership application at this time.${member.adminNotes ? `\n\nNotes: ${member.adminNotes}` : ""}\n\nIf you have any questions, please get in touch with us.`,
      html: renderEmailTemplate({
        preheader: "An update on your membership application.",
        heading: "Update on your application",
        bodyHtml:
          emailParagraphs([
            `Assalamu Alaikum ${escapeHtml(member.fullName)},`,
            "Thank you for your interest in joining the Grays Park Masjid community. After review, we are unable to approve your membership application at this time.",
            "If you have any questions or would like to discuss this further, please don't hesitate to get in touch with us.",
          ]) + (member.adminNotes ? emailInfoBox([{ label: "Notes", value: escapeHtml(member.adminNotes) }]) : ""),
      }),
    };
  }

  return {
    subject: "We need a little more information - Grays Park Masjid membership",
    text: `Assalamu Alaikum ${member.fullName},\n\nThank you for applying to join the Grays Park Masjid community. Before we can complete our review, we need a little more information from you.${member.adminNotes ? `\n\nDetails: ${member.adminNotes}` : ""}\n\nPlease reply to this email with the requested details.`,
    html: renderEmailTemplate({
      preheader: "We need more information to complete your application.",
      heading: "A little more information needed",
      bodyHtml:
        emailParagraphs([
          `Assalamu Alaikum ${escapeHtml(member.fullName)},`,
          "Thank you for applying to join the Grays Park Masjid community. Before we can complete our review, we need a little more information from you.",
          "Please reply directly to this email with the details below so we can continue processing your application.",
        ]) + (member.adminNotes ? emailInfoBox([{ label: "Requested details", value: escapeHtml(member.adminNotes) }]) : ""),
    }),
  };
}

router.put("/admin/members/:id", requireAuth, requireRole(...MASJID_WRITE), async (req: Request, res: Response) => {
  const parsed = patchMemberSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const [existing] = await db.select().from(membersTable).where(eq(membersTable.id, (req.params.id as string))).limit(1);

  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const [row] = await db
    .update(membersTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(membersTable.id, (req.params.id as string)))
    .returning();

  res.json(serialize(row));

  const statusChanged = parsed.data.status && parsed.data.status !== existing.status;
  if (statusChanged && parsed.data.status !== "pending") {
    const email = statusEmail(parsed.data.status as MemberStatus, row);
    void sendUserConfirmationEmail({ to: row.email, ...email });
  }
});

router.delete(
  "/admin/members/:id",
  requireAuth,
  requireRole(...MASJID_WRITE),
  async (req: Request, res: Response) => {
    const [row] = await db.delete(membersTable).where(eq(membersTable.id, (req.params.id as string))).returning();

    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.status(204).end();
  },
);

export default router;
