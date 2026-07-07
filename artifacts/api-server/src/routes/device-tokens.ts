import { Router, type IRouter, type Request, type Response } from "express";
import { eq, sql } from "drizzle-orm";
import { db, deviceTokensTable, insertDeviceTokenSchema, patchDeviceTokenSchema } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";
import { ALL_ROLES } from "../lib/roles";
import { coerceDates, serialize } from "../lib/crud";

const router: IRouter = Router();

router.post("/device-tokens", async (req: Request, res: Response) => {
  const parsed = insertDeviceTokenSchema.safeParse(coerceDates(req.body));
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const [row] = await db
    .insert(deviceTokensTable)
    .values(parsed.data as never)
    .onConflictDoUpdate({
      target: deviceTokensTable.deviceId,
      set: {
        token: parsed.data.token,
        platform: parsed.data.platform ?? "unknown",
        updatedAt: new Date(),
      },
    })
    .returning();

  res.status(200).json(serialize(row));
});

router.patch("/device-tokens/:deviceId", async (req: Request, res: Response) => {
  const deviceId = req.params.deviceId as string;
  const parsed = patchDeviceTokenSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const [existing] = await db
    .select()
    .from(deviceTokensTable)
    .where(eq(deviceTokensTable.deviceId, deviceId))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.token !== undefined) updates.token = parsed.data.token;
  if (parsed.data.categories !== undefined) {
    const merged = { ...(existing.categories as object), ...parsed.data.categories };
    updates.categories = merged;
  }

  const [row] = await db
    .update(deviceTokensTable)
    .set(updates as never)
    .where(eq(deviceTokensTable.deviceId, deviceId))
    .returning();

  res.json(serialize(row));
});

router.delete("/device-tokens/:deviceId", async (req: Request, res: Response) => {
  const deviceId = req.params.deviceId as string;
  await db.delete(deviceTokensTable).where(eq(deviceTokensTable.deviceId, deviceId));
  res.status(204).send();
});

router.get(
  "/admin/device-tokens/stats",
  requireAuth,
  requireRole(...ALL_ROLES),
  async (_req: Request, res: Response) => {
    const [result] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(deviceTokensTable);
    res.json({ count: result?.count ?? 0 });
  },
);

export default router;
