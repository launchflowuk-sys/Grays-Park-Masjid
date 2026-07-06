import { pgTable, text, timestamp, uuid, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const donationCampaignsTable = pgTable("donation_campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  targetAmount: numeric("target_amount", { precision: 12, scale: 2 }),
  raisedAmount: numeric("raised_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  externalDonationUrl: text("external_donation_url"),
  active: boolean("active").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDonationCampaignSchema = createInsertSchema(donationCampaignsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertDonationCampaign = z.infer<typeof insertDonationCampaignSchema>;
export type DonationCampaign = typeof donationCampaignsTable.$inferSelect;
