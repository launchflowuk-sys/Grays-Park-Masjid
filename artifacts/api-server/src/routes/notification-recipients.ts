import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, notificationRecipientsTable, insertNotificationRecipientSchema } from "@workspace/db";
import { registerAdminItemRoutes } from "../lib/crud";
import { SUPER_ADMIN_ONLY } from "../lib/roles";
import { requireAuth, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

function serialize(row: typeof notificationRecipientsTable.$inferSelect) {
  return {
    id: row.id,
    adminUserId: row.adminUserId,
    module: row.module,
    emailEnabled: row.emailEnabled,
    smsEnabled: row.smsEnabled,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

router.get(
  "/admin/notification-recipients",
  requireAuth,
  requireRole(...SUPER_ADMIN_ONLY),
  async (_req, res) => {
    const rows = await db.select().from(notificationRecipientsTable);
    res.json(rows.map(serialize));
  },
);

router.post(
  "/admin/notification-recipients",
  requireAuth,
  requireRole(...SUPER_ADMIN_ONLY),
  async (req, res) => {
    const parsed = insertNotificationRecipientSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    const [existing] = await db
      .select({ id: notificationRecipientsTable.id })
      .from(notificationRecipientsTable)
      .where(
        and(
          eq(notificationRecipientsTable.adminUserId, parsed.data.adminUserId),
          eq(notificationRecipientsTable.module, parsed.data.module),
        ),
      )
      .limit(1);

    if (existing) {
      res.status(409).json({ error: "This admin is already assigned to this module" });
      return;
    }

    const [created] = await db.insert(notificationRecipientsTable).values(parsed.data).returning();
    res.status(201).json(serialize(created));
  },
);

registerAdminItemRoutes(
  router,
  "/admin/notification-recipients",
  notificationRecipientsTable,
  notificationRecipientsTable.id,
  insertNotificationRecipientSchema.partial(),
  SUPER_ADMIN_ONLY,
);

export default router;
