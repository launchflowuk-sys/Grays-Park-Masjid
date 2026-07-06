import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import {
  db,
  coursesTable,
  courseRegistrationsTable,
  insertCourseSchema,
  insertCourseRegistrationSchema,
} from "@workspace/db";
import {
  registerAdminCreate,
  registerAdminExportCsv,
  registerAdminItemRoutes,
  registerAdminList,
  registerPublicList,
} from "../lib/crud";
import { ALL_ROLES, EDUCATION_WRITE } from "../lib/roles";
import { notifyModule, sendUserConfirmationEmail } from "../lib/notifications";
import { renderEmailTemplate, emailParagraphs, emailInfoBox, escapeHtml } from "../lib/email-templates";

const router: IRouter = Router();

registerPublicList(router, "/courses", coursesTable, eq(coursesTable.published, true));
registerAdminList(router, "/admin/courses", coursesTable, ALL_ROLES);
registerAdminCreate(router, "/admin/courses", coursesTable, insertCourseSchema, EDUCATION_WRITE);
registerAdminItemRoutes(
  router,
  "/admin/courses",
  coursesTable,
  coursesTable.id,
  insertCourseSchema.partial(),
  EDUCATION_WRITE,
);

function serializeRegistration(row: typeof courseRegistrationsTable.$inferSelect) {
  return {
    id: row.id,
    courseId: row.courseId,
    studentName: row.studentName,
    guardianName: row.guardianName,
    email: row.email,
    phone: row.phone,
    status: row.status,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
  };
}

router.post("/course-registrations", async (req: Request, res: Response) => {
  const parsed = insertCourseRegistrationSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, parsed.data.courseId)).limit(1);

  if (!course) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const [row] = await db.insert(courseRegistrationsTable).values(parsed.data).returning();
  res.status(201).json(serializeRegistration(row));

  const appBaseUrl = process.env.APP_BASE_URL ?? "";
  const adminUrl = `${appBaseUrl}/admin/courses`;

  void notifyModule("courses", {
    subject: `New course registration: ${course.title}`,
    text: `A new registration was submitted for "${course.title}" by ${row.studentName} (${row.email}).\n\nView in admin panel: ${adminUrl}`,
    html: renderEmailTemplate({
      preheader: `A new registration was submitted for "${course.title}".`,
      heading: "New course registration",
      bodyHtml:
        emailParagraphs([`A new registration was submitted for "${escapeHtml(course.title)}".`]) +
        emailInfoBox([
          { label: "Course", value: escapeHtml(course.title) },
          { label: "Student", value: escapeHtml(row.studentName) },
          { label: "Email", value: escapeHtml(row.email) },
        ]),
      ctaLabel: "View in admin panel",
      ctaUrl: adminUrl,
    }),
    smsBody: `New course registration for "${course.title}" from ${row.studentName}. View: ${adminUrl}`,
  });

  void sendUserConfirmationEmail({
    to: row.email,
    subject: `Registration received - ${course.title}`,
    text: `Assalamu Alaikum,\n\nThank you for registering ${row.studentName} for "${course.title}". We have received your registration and will be in touch soon.`,
    html: renderEmailTemplate({
      preheader: `Registration for "${course.title}" received.`,
      heading: "Registration received",
      bodyHtml: emailParagraphs([
        "Assalamu Alaikum,",
        `Thank you for registering ${escapeHtml(row.studentName)} for "${escapeHtml(course.title)}". We have received your registration and will be in touch soon.`,
      ]),
    }),
  });
});

registerAdminList(router, "/admin/course-registrations", courseRegistrationsTable, ALL_ROLES);
registerAdminExportCsv(
  router,
  "/admin/course-registrations",
  courseRegistrationsTable,
  [
    { key: "createdAt", header: "Date" },
    { key: "courseId", header: "Course ID" },
    { key: "studentName", header: "Student Name" },
    { key: "guardianName", header: "Guardian Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "status", header: "Status" },
    { key: "notes", header: "Notes" },
  ],
  ALL_ROLES,
  "course-registrations.csv",
);
registerAdminItemRoutes(
  router,
  "/admin/course-registrations",
  courseRegistrationsTable,
  courseRegistrationsTable.id,
  insertCourseRegistrationSchema.partial(),
  EDUCATION_WRITE,
);

export default router;
