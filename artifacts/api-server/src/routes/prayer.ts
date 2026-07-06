import { Router, type IRouter, type Request, type Response } from "express";
import { and, eq, gte, lte } from "drizzle-orm";
import {
  db,
  prayerTimesTable,
  timetablePdfsTable,
  prayerCalculationSettingsTable,
  insertPrayerTimeSchema,
  insertTimetablePdfSchema,
  insertPrayerCalculationSettingsSchema,
} from "@workspace/db";
import {
  registerAdminCreate,
  registerAdminItemRoutes,
  registerAdminList,
  registerPublicList,
  serialize,
  coerceDates,
} from "../lib/crud";
import { MASJID_WRITE, ALL_ROLES } from "../lib/roles";
import { requireAuth, requireRole } from "../middlewares/auth";
import { calculateDayTimes, enumerateDates, type PrayerCalcSettings } from "../lib/prayer-calc";
import { z } from "zod/v4";

const router: IRouter = Router();

registerPublicList(router, "/prayer-times", prayerTimesTable);
registerAdminList(router, "/admin/prayer-times", prayerTimesTable, ALL_ROLES);
registerAdminCreate(
  router,
  "/admin/prayer-times",
  prayerTimesTable,
  insertPrayerTimeSchema,
  MASJID_WRITE,
);

router.get(
  "/admin/prayer-times/:id",
  requireAuth,
  requireRole(...ALL_ROLES),
  async (req: Request, res: Response) => {
    const id: string = req.params.id as string;
    const [row] = await db
      .select()
      .from(prayerTimesTable)
      .where(eq(prayerTimesTable.id, id))
      .limit(1);
    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(serialize(row));
  },
);

router.put(
  "/admin/prayer-times/:id",
  requireAuth,
  requireRole(...MASJID_WRITE),
  async (req: Request, res: Response) => {
    const id: string = req.params.id as string;
    const parsed = insertPrayerTimeSchema.partial().safeParse(coerceDates(req.body));
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    const { isManualOverride: _ignored, ...rest } = parsed.data as Record<string, unknown>;
    const [row] = await db
      .update(prayerTimesTable)
      .set({ ...rest, isManualOverride: true, updatedAt: new Date() } as never)
      .where(eq(prayerTimesTable.id, id))
      .returning();

    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(serialize(row));
  },
);

router.delete(
  "/admin/prayer-times/:id",
  requireAuth,
  requireRole(...MASJID_WRITE),
  async (req: Request, res: Response) => {
    const id: string = req.params.id as string;
    const [row] = await db
      .delete(prayerTimesTable)
      .where(eq(prayerTimesTable.id, id))
      .returning();
    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(204).end();
  },
);

const DEFAULT_CALC_SETTINGS: PrayerCalcSettings = {
  latitude: 51.4762,
  longitude: 0.3247,
  timezone: "Europe/London",
  calculationMethod: "MoonsightingCommittee",
  madhab: "hanafi",
  highLatitudeRule: "seventhofthenight",
  fajrAdjustment: 0,
  sunriseAdjustment: 0,
  dhuhrAdjustment: 0,
  asrAdjustment: 0,
  maghribAdjustment: 0,
  ishaAdjustment: 0,
  fajrIqamahOffset: 20,
  dhuhrIqamahOffset: 10,
  asrIqamahOffset: 15,
  maghribIqamahOffset: 5,
  ishaIqamahOffset: 15,
  iqamahRoundingMinutes: 5,
};

async function loadCalcSettings(): Promise<PrayerCalcSettings & { id: string; updatedAt: Date }> {
  const [row] = await db
    .select()
    .from(prayerCalculationSettingsTable)
    .where(eq(prayerCalculationSettingsTable.id, "default"))
    .limit(1);

  if (row) return row as PrayerCalcSettings & { id: string; updatedAt: Date };

  const [created] = await db
    .insert(prayerCalculationSettingsTable)
    .values({ id: "default", ...DEFAULT_CALC_SETTINGS })
    .onConflictDoNothing()
    .returning();

  if (created) return created as PrayerCalcSettings & { id: string; updatedAt: Date };

  const [existing] = await db
    .select()
    .from(prayerCalculationSettingsTable)
    .where(eq(prayerCalculationSettingsTable.id, "default"))
    .limit(1);
  return existing as PrayerCalcSettings & { id: string; updatedAt: Date };
}

router.get(
  "/admin/prayer-calculation-settings",
  requireAuth,
  requireRole(...ALL_ROLES),
  async (_req, res) => {
    const settings = await loadCalcSettings();
    res.json(serialize(settings as unknown as Record<string, unknown>));
  },
);

router.put(
  "/admin/prayer-calculation-settings",
  requireAuth,
  requireRole(...MASJID_WRITE),
  async (req, res) => {
    const parsed = insertPrayerCalculationSettingsSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    const [row] = await db
      .insert(prayerCalculationSettingsTable)
      .values({ id: "default", ...DEFAULT_CALC_SETTINGS, ...parsed.data })
      .onConflictDoUpdate({
        target: prayerCalculationSettingsTable.id,
        set: { ...parsed.data, updatedAt: new Date() },
      })
      .returning();

    res.json(serialize(row));
  },
);

const generateRequestSchema = z
  .object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .refine((v) => v.startDate <= v.endDate, { message: "startDate must be before endDate" });

router.post(
  "/admin/prayer-times/generate",
  requireAuth,
  requireRole(...MASJID_WRITE),
  async (req, res) => {
    const parsed = generateRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    const { startDate, endDate } = parsed.data;
    const dates = enumerateDates(startDate, endDate);
    if (dates.length > 400) {
      res.status(400).json({ error: "Date range too large (max 400 days)" });
      return;
    }

    const settings = await loadCalcSettings();
    const existingRows = await db
      .select()
      .from(prayerTimesTable)
      .where(and(gte(prayerTimesTable.date, startDate), lte(prayerTimesTable.date, endDate)));
    const existingByDate = new Map(existingRows.map((r) => [r.date, r]));

    let generated = 0;
    let skipped = 0;

    for (const date of dates) {
      const existing = existingByDate.get(date);
      if (existing?.isManualOverride) {
        skipped++;
        continue;
      }

      const calc = calculateDayTimes(date, settings);

      if (existing) {
        await db
          .update(prayerTimesTable)
          .set({
            fajrAdhan: calc.fajrAdhan,
            fajrIqamah: calc.fajrIqamah,
            sunrise: calc.sunrise,
            dhuhrAdhan: calc.dhuhrAdhan,
            dhuhrIqamah: calc.dhuhrIqamah,
            asrAdhan: calc.asrAdhan,
            asrIqamah: calc.asrIqamah,
            maghribAdhan: calc.maghribAdhan,
            maghribIqamah: calc.maghribIqamah,
            ishaAdhan: calc.ishaAdhan,
            ishaIqamah: calc.ishaIqamah,
            isManualOverride: false,
            updatedAt: new Date(),
          })
          .where(eq(prayerTimesTable.id, existing.id));
      } else {
        await db.insert(prayerTimesTable).values({
          date: calc.date,
          fajrAdhan: calc.fajrAdhan,
          fajrIqamah: calc.fajrIqamah,
          sunrise: calc.sunrise,
          dhuhrAdhan: calc.dhuhrAdhan,
          dhuhrIqamah: calc.dhuhrIqamah,
          asrAdhan: calc.asrAdhan,
          asrIqamah: calc.asrIqamah,
          maghribAdhan: calc.maghribAdhan,
          maghribIqamah: calc.maghribIqamah,
          ishaAdhan: calc.ishaAdhan,
          ishaIqamah: calc.ishaIqamah,
          isManualOverride: false,
        });
      }
      generated++;
    }

    res.json({ generated, skipped, total: dates.length });
  },
);

registerPublicList(router, "/timetable-pdfs", timetablePdfsTable, eq(timetablePdfsTable.active, true));
registerAdminList(router, "/admin/timetable-pdfs", timetablePdfsTable, ALL_ROLES);
registerAdminCreate(
  router,
  "/admin/timetable-pdfs",
  timetablePdfsTable,
  insertTimetablePdfSchema,
  MASJID_WRITE,
);
registerAdminItemRoutes(
  router,
  "/admin/timetable-pdfs",
  timetablePdfsTable,
  timetablePdfsTable.id,
  insertTimetablePdfSchema.partial(),
  MASJID_WRITE,
);

export default router;
