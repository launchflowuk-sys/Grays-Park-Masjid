import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import {
  db,
  volunteerOpportunitiesTable,
  volunteerApplicationsTable,
  insertVolunteerOpportunitySchema,
  insertVolunteerApplicationSchema,
} from "@workspace/db";
import {
  registerAdminCreate,
  registerAdminExportCsv,
  registerAdminItemRoutes,
  registerAdminList,
  registerPublicList,
} from "../lib/crud";
import { ALL_ROLES, MASJID_WRITE } from "../lib/roles";
import { notifyModule, sendUserConfirmationEmail } from "../lib/notifications";

const router: IRouter = Router();

registerPublicList(
  router,
  "/volunteer-opportunities",
  volunteerOpportunitiesTable,
  eq(volunteerOpportunitiesTable.active, true),
);
registerAdminList(router, "/admin/volunteer-opportunities", volunteerOpportunitiesTable, ALL_ROLES);
registerAdminCreate(
  router,
  "/admin/volunteer-opportunities",
  volunteerOpportunitiesTable,
  insertVolunteerOpportunitySchema,
  MASJID_WRITE,
);
registerAdminItemRoutes(
  router,
  "/admin/volunteer-opportunities",
  volunteerOpportunitiesTable,
  volunteerOpportunitiesTable.id,
  insertVolunteerOpportunitySchema.partial(),
  MASJID_WRITE,
);

function serializeApplication(row: typeof volunteerApplicationsTable.$inferSelect) {
  return {
    id: row.id,
    opportunityId: row.opportunityId,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

router.post("/volunteer-applications", async (req: Request, res: Response) => {
  const parsed = insertVolunteerApplicationSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const [opportunity] = await db
    .select()
    .from(volunteerOpportunitiesTable)
    .where(eq(volunteerOpportunitiesTable.id, parsed.data.opportunityId))
    .limit(1);

  if (!opportunity) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const [row] = await db.insert(volunteerApplicationsTable).values(parsed.data).returning();
  res.status(201).json(serializeApplication(row));

  const appBaseUrl = process.env.APP_BASE_URL ?? "";
  const adminUrl = `${appBaseUrl}/admin/volunteers`;

  void notifyModule("volunteers", {
    subject: `New volunteer application: ${opportunity.title}`,
    text: `A new volunteer application was submitted for "${opportunity.title}" by ${row.name} (${row.email}).\n\nView in admin panel: ${adminUrl}`,
    html: `<p>A new volunteer application was submitted for "${opportunity.title}" by ${row.name} (${row.email}).</p><p><a href="${adminUrl}">View in admin panel</a></p>`,
    smsBody: `New volunteer application for "${opportunity.title}" from ${row.name}. View: ${adminUrl}`,
  });

  void sendUserConfirmationEmail({
    to: row.email,
    subject: `Application received - ${opportunity.title}`,
    text: `Assalamu Alaikum ${row.name},\n\nThank you for applying to volunteer for "${opportunity.title}". We have received your application and will be in touch soon.`,
    html: `<p>Assalamu Alaikum ${row.name},</p><p>Thank you for applying to volunteer for "${opportunity.title}". We have received your application and will be in touch soon.</p>`,
  });
});

registerAdminList(router, "/admin/volunteer-applications", volunteerApplicationsTable, ALL_ROLES);
registerAdminExportCsv(
  router,
  "/admin/volunteer-applications",
  volunteerApplicationsTable,
  [
    { key: "createdAt", header: "Date" },
    { key: "opportunityId", header: "Opportunity ID" },
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "message", header: "Message" },
    { key: "status", header: "Status" },
  ],
  ALL_ROLES,
  "volunteer-applications.csv",
);
registerAdminItemRoutes(
  router,
  "/admin/volunteer-applications",
  volunteerApplicationsTable,
  volunteerApplicationsTable.id,
  insertVolunteerApplicationSchema.partial(),
  MASJID_WRITE,
);

export default router;
