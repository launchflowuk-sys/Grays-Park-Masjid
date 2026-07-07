import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, siteSettingsTable } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";
import { SUPER_ADMIN_ONLY, ALL_ROLES } from "../lib/roles";

const router: IRouter = Router();

// Only these keys may be read via the unauthenticated public endpoint below.
// Anything not explicitly listed here (e.g. Square API credentials) stays
// admin-only, even if a row for it exists in site_settings.
const PUBLIC_SETTING_KEYS = new Set([
  "site_phone",
  "site_email",
  "site_address",
  "site_hours",
  "site_facebook_url",
  "site_instagram_url",
  "site_youtube_url",
  "site_whatsapp_url",
  "site_announcement",
  "donation_bank_details",
  "madrassah_content",
  "sisters_facilities_content",
  "youth_programmes_content",
  "jumuah_content",
  "funeral_content",
  "nikah_content",
  "ramadan_content",
  "eid_content",
  "zakat_content",
  "safeguarding_content",
  "policies_content",
  "faqs_content",
  "jummah_times",
  "eid_al_fitr_date",
  "eid_al_fitr_times",
  "eid_al_adha_date",
  "eid_al_adha_times",
]);

function serializeSetting(row: typeof siteSettingsTable.$inferSelect) {
  return { ...row, updatedAt: row.updatedAt.toISOString() };
}

router.get("/settings/:key", async (req: Request, res: Response) => {
  const key = String(req.params.key);

  if (!PUBLIC_SETTING_KEYS.has(key)) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const [row] = await db
    .select()
    .from(siteSettingsTable)
    .where(eq(siteSettingsTable.key, key))
    .limit(1);

  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json(serializeSetting(row));
});

router.get(
  "/admin/settings",
  requireAuth,
  requireRole(...ALL_ROLES),
  async (_req: Request, res: Response) => {
    const rows = await db.select().from(siteSettingsTable);
    res.json(rows.map(serializeSetting));
  },
);

router.put(
  "/admin/settings/:key",
  requireAuth,
  requireRole(...SUPER_ADMIN_ONLY),
  async (req: Request, res: Response) => {
    const key = String(req.params.key);
    const value = typeof req.body?.value === "string" ? req.body.value : undefined;

    if (value === undefined) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    const [row] = await db
      .insert(siteSettingsTable)
      .values({ key, value })
      .onConflictDoUpdate({
        target: siteSettingsTable.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();

    res.json(serializeSetting(row));
  },
);

export default router;
