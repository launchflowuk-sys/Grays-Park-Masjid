import { Router, type IRouter, type Request, type Response } from "express";
import { desc } from "drizzle-orm";
import { db, notificationBroadcastsTable } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";
import { ALL_ROLES } from "../lib/roles";
import { broadcastPush, type PushCategory } from "../lib/push";
import { z } from "zod/v4";

const router: IRouter = Router();

const manualBroadcastSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(300),
  category: z.enum(["announcements", "events", "blog"]),
});

router.get(
  "/admin/push-notifications/history",
  requireAuth,
  requireRole(...ALL_ROLES),
  async (_req: Request, res: Response) => {
    const rows = await db
      .select()
      .from(notificationBroadcastsTable)
      .orderBy(desc(notificationBroadcastsTable.createdAt))
      .limit(20);

    res.json(
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        body: r.body,
        category: r.category,
        sentCount: r.sentCount,
        createdAt: r.createdAt.toISOString(),
      })),
    );
  },
);

router.post(
  "/admin/push-notifications/broadcast",
  requireAuth,
  requireRole(...ALL_ROLES),
  async (req: Request, res: Response) => {
    const parsed = manualBroadcastSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    const { title, body, category } = parsed.data;
    const sent = await broadcastPush(title, body, category as PushCategory);
    res.json({ sent });
  },
);

export default router;
