import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, eventsTable, insertEventSchema } from "@workspace/db";
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

registerPublicList(router, "/events", eventsTable, eq(eventsTable.published, true));
registerAdminList(router, "/admin/events", eventsTable, ALL_ROLES);

router.post(
  "/admin/events",
  requireAuth,
  requireRole(...CONTENT_WRITE),
  async (req: Request, res: Response) => {
    const parsed = insertEventSchema.safeParse(coerceDates(req.body));
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }
    const [row] = await db.insert(eventsTable).values(parsed.data as never).returning();
    res.status(201).json(serialize(row));
    if (row.published) {
      const dateStr = row.startsAt
        ? new Date(row.startsAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "";
      broadcastPush(
        row.title,
        dateStr ? `Event on ${dateStr}` : "New event at Grays Park Masjid",
        "events",
        row.id,
      ).catch((err: unknown) => console.error("[push] events broadcast error:", err));
    }
  },
);

registerAdminItemRoutes(
  router,
  "/admin/events",
  eventsTable,
  eventsTable.id,
  insertEventSchema.partial(),
  CONTENT_WRITE,
);

export default router;
