import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, announcementsTable, insertAnnouncementSchema } from "@workspace/db";
import {
  registerAdminItemRoutes,
  registerAdminList,
  registerPublicList,
  coerceDates,
  serialize,
} from "../lib/crud";
import { requireAuth, requireRole } from "../middlewares/auth";
import { ALL_ROLES, CONTENT_WRITE } from "../lib/roles";
import { broadcastPush } from "../lib/push";

const router: IRouter = Router();

registerPublicList(router, "/announcements", announcementsTable, eq(announcementsTable.published, true));
registerAdminList(router, "/admin/announcements", announcementsTable, ALL_ROLES);

router.post(
  "/admin/announcements",
  requireAuth,
  requireRole(...CONTENT_WRITE),
  async (req: Request, res: Response) => {
    const parsed = insertAnnouncementSchema.safeParse(coerceDates(req.body));
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }
    const [row] = await db.insert(announcementsTable).values(parsed.data as never).returning();
    res.status(201).json(serialize(row));
    if (row.published) {
      broadcastPush(
        row.title,
        row.body.slice(0, 120),
        "announcements",
        row.id,
      ).catch((err: unknown) => console.error("[push] announcements broadcast error:", err));
    }
  },
);

registerAdminItemRoutes(
  router,
  "/admin/announcements",
  announcementsTable,
  announcementsTable.id,
  insertAnnouncementSchema.partial(),
  CONTENT_WRITE,
);

export default router;
