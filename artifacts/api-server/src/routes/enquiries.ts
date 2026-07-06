import { Router, type IRouter, type Request, type Response } from "express";
import { db, enquiriesTable, insertEnquirySchema, patchEnquirySchema } from "@workspace/db";
import {
  registerAdminExportCsv,
  registerAdminItemRoutes,
  registerAdminList,
} from "../lib/crud";
import { ALL_ROLES, MASJID_WRITE } from "../lib/roles";
import { notifyModule, sendUserConfirmationEmail } from "../lib/notifications";

const router: IRouter = Router();

function serialize(row: typeof enquiriesTable.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

router.post("/enquiries", async (req: Request, res: Response) => {
  const parsed = insertEnquirySchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const [row] = await db.insert(enquiriesTable).values(parsed.data).returning();
  res.status(201).json(serialize(row));

  void notifyModule("enquiries", {
    subject: `New enquiry: ${row.subject}`,
    text: `A new enquiry was submitted by ${row.name} (${row.email}).\n\nSubject: ${row.subject}\n\nMessage:\n${row.message}`,
    html: `<p>A new enquiry was submitted by ${row.name} (${row.email}).</p><p><strong>Subject:</strong> ${row.subject}</p><p><strong>Message:</strong><br/>${row.message}</p>`,
    smsBody: `New enquiry from ${row.name}: ${row.subject}`,
  });

  void sendUserConfirmationEmail({
    to: row.email,
    subject: "We received your enquiry - Grays Park Masjid",
    text: `Assalamu Alaikum ${row.name},\n\nThank you for contacting Grays Park Masjid. We have received your enquiry and will get back to you soon.\n\nYour message:\n${row.message}`,
    html: `<p>Assalamu Alaikum ${row.name},</p><p>Thank you for contacting Grays Park Masjid. We have received your enquiry and will get back to you soon.</p><p><strong>Your message:</strong><br/>${row.message}</p>`,
  });
});

registerAdminList(router, "/admin/enquiries", enquiriesTable, ALL_ROLES);
registerAdminExportCsv(
  router,
  "/admin/enquiries",
  enquiriesTable,
  [
    { key: "createdAt", header: "Date" },
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "subject", header: "Subject" },
    { key: "message", header: "Message" },
    { key: "status", header: "Status" },
  ],
  ALL_ROLES,
  "enquiries.csv",
);
registerAdminItemRoutes(
  router,
  "/admin/enquiries",
  enquiriesTable,
  enquiriesTable.id,
  patchEnquirySchema,
  MASJID_WRITE,
);

export default router;
