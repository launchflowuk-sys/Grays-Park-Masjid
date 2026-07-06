import { pgTable, text, timestamp, uuid, date, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const prayerTimesTable = pgTable("prayer_times", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: date("date").notNull().unique(),
  fajrAdhan: text("fajr_adhan").notNull(),
  fajrIqamah: text("fajr_iqamah").notNull(),
  dhuhrAdhan: text("dhuhr_adhan").notNull(),
  dhuhrIqamah: text("dhuhr_iqamah").notNull(),
  asrAdhan: text("asr_adhan").notNull(),
  asrIqamah: text("asr_iqamah").notNull(),
  maghribAdhan: text("maghrib_adhan").notNull(),
  maghribIqamah: text("maghrib_iqamah").notNull(),
  ishaAdhan: text("isha_adhan").notNull(),
  ishaIqamah: text("isha_iqamah").notNull(),
  jummahKhutbah: text("jummah_khutbah"),
  jummahIqamah: text("jummah_iqamah"),
  sunrise: text("sunrise"),
  isManualOverride: boolean("is_manual_override").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPrayerTimeSchema = createInsertSchema(prayerTimesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPrayerTime = z.infer<typeof insertPrayerTimeSchema>;
export type PrayerTime = typeof prayerTimesTable.$inferSelect;

export const timetablePdfsTable = pgTable("timetable_pdfs", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  fileUrl: text("file_url").notNull(),
  monthLabel: text("month_label").notNull(),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTimetablePdfSchema = createInsertSchema(timetablePdfsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertTimetablePdf = z.infer<typeof insertTimetablePdfSchema>;
export type TimetablePdf = typeof timetablePdfsTable.$inferSelect;
