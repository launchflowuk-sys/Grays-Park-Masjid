import { pgTable, text, timestamp, uuid, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quranSettingsTable = pgTable("quran_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  isQuranPageEnabled: boolean("is_quran_page_enabled").notNull().default(true),
  showInNavigation: boolean("show_in_navigation").notNull().default(true),
  showOnHomepage: boolean("show_on_homepage").notNull().default(true),
  defaultTranslation: text("default_translation").notNull().default("en.sahih"),
  defaultReciter: text("default_reciter").notNull().default("ar.alafasy"),
  defaultDisplayMode: text("default_display_mode").notNull().default("arabic_translation"),
  defaultFontSize: text("default_font_size").notNull().default("medium"),
  defaultTheme: text("default_theme").notNull().default("light"),
  primaryApiProvider: text("primary_api_provider").notNull().default("alquran_cloud"),
  fallbackApiProvider: text("fallback_api_provider").notNull().default("alquran_cloud"),
  cacheDurationMinutes: integer("cache_duration_minutes").notNull().default(1440),
  attributionText: text("attribution_text").notNull().default("Qur'an text and translations provided by AlQuran.cloud."),
  homepageTitle: text("homepage_title").notNull().default("Ayah of the Day"),
  homepageIntro: text("homepage_intro").notNull().default("Reflect on a verse from the Qur'an, refreshed daily."),
  homepageButtonText: text("homepage_button_text").notNull().default("Read the Qur'an"),
  homepageButtonLink: text("homepage_button_link").notNull().default("/quran"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertQuranSettingsSchema = createInsertSchema(quranSettingsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertQuranSettings = z.infer<typeof insertQuranSettingsSchema>;
export type QuranSettings = typeof quranSettingsTable.$inferSelect;

export const featuredAyahTable = pgTable("featured_ayah", {
  id: uuid("id").primaryKey().defaultRandom(),
  surahNumber: integer("surah_number").notNull(),
  ayahNumber: integer("ayah_number").notNull(),
  reflectionTitle: text("reflection_title"),
  reflectionText: text("reflection_text"),
  isPublished: boolean("is_published").notNull().default(false),
  showOnHomepage: boolean("show_on_homepage").notNull().default(false),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFeaturedAyahSchema = createInsertSchema(featuredAyahTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertFeaturedAyah = z.infer<typeof insertFeaturedAyahSchema>;
export type FeaturedAyah = typeof featuredAyahTable.$inferSelect;

export const quranReflectionsTable = pgTable("quran_reflections", {
  id: uuid("id").primaryKey().defaultRandom(),
  surahNumber: integer("surah_number").notNull(),
  ayahNumber: integer("ayah_number").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  author: text("author"),
  status: text("status").notNull().default("draft"),
  showPublicly: boolean("show_publicly").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertQuranReflectionSchema = createInsertSchema(quranReflectionsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertQuranReflection = z.infer<typeof insertQuranReflectionSchema>;
export type QuranReflection = typeof quranReflectionsTable.$inferSelect;

export const quranCacheTable = pgTable("quran_cache", {
  id: uuid("id").primaryKey().defaultRandom(),
  cacheKey: text("cache_key").notNull().unique(),
  cacheType: text("cache_type").notNull(),
  dataJson: text("data_json").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertQuranCacheSchema = createInsertSchema(quranCacheTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertQuranCache = z.infer<typeof insertQuranCacheSchema>;
export type QuranCache = typeof quranCacheTable.$inferSelect;
