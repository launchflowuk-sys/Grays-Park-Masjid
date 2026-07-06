import { pgTable, text, timestamp, integer, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const prayerCalculationSettingsTable = pgTable("prayer_calculation_settings", {
  id: text("id").primaryKey().default("default"),
  latitude: doublePrecision("latitude").notNull().default(51.4762),
  longitude: doublePrecision("longitude").notNull().default(0.3247),
  timezone: text("timezone").notNull().default("Europe/London"),
  calculationMethod: text("calculation_method").notNull().default("MoonsightingCommittee"),
  madhab: text("madhab").notNull().default("hanafi"),
  highLatitudeRule: text("high_latitude_rule").notNull().default("seventhofthenight"),
  fajrAdjustment: integer("fajr_adjustment").notNull().default(0),
  sunriseAdjustment: integer("sunrise_adjustment").notNull().default(0),
  dhuhrAdjustment: integer("dhuhr_adjustment").notNull().default(0),
  asrAdjustment: integer("asr_adjustment").notNull().default(0),
  maghribAdjustment: integer("maghrib_adjustment").notNull().default(0),
  ishaAdjustment: integer("isha_adjustment").notNull().default(0),
  fajrIqamahOffset: integer("fajr_iqamah_offset").notNull().default(20),
  dhuhrIqamahOffset: integer("dhuhr_iqamah_offset").notNull().default(10),
  asrIqamahOffset: integer("asr_iqamah_offset").notNull().default(15),
  maghribIqamahOffset: integer("maghrib_iqamah_offset").notNull().default(5),
  ishaIqamahOffset: integer("isha_iqamah_offset").notNull().default(15),
  iqamahRoundingMinutes: integer("iqamah_rounding_minutes").notNull().default(5),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPrayerCalculationSettingsSchema = createInsertSchema(
  prayerCalculationSettingsTable,
).omit({
  id: true,
  updatedAt: true,
});
export type InsertPrayerCalculationSettings = z.infer<typeof insertPrayerCalculationSettingsSchema>;
export type PrayerCalculationSettings = typeof prayerCalculationSettingsTable.$inferSelect;
