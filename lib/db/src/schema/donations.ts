import { pgTable, text, timestamp, uuid, boolean, numeric, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const donationCampaignsTable = pgTable("donation_campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  longDescription: text("long_description"),
  imageUrl: text("image_url"),
  galleryImages: jsonb("gallery_images").$type<string[]>().notNull().default([]),
  targetAmount: numeric("target_amount", { precision: 12, scale: 2 }),
  raisedAmount: numeric("raised_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  presetAmounts: jsonb("preset_amounts").$type<number[]>().notNull().default([10, 25, 50, 100]),
  externalDonationUrl: text("external_donation_url"),
  allowOneTime: boolean("allow_one_time").notNull().default(true),
  allowMonthly: boolean("allow_monthly").notNull().default(false),
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

export const donationTransactionStatusEnum = pgEnum("donation_transaction_status", [
  "succeeded",
  "failed",
]);

export const donationTransactionsTable = pgTable("donation_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id")
    .notNull()
    .references(() => donationCampaignsTable.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  donorName: text("donor_name"),
  donorEmail: text("donor_email"),
  squarePaymentId: text("square_payment_id").notNull().unique(),
  status: donationTransactionStatusEnum("status").notNull().default("succeeded"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type InsertDonationTransaction = typeof donationTransactionsTable.$inferInsert;
export type DonationTransaction = typeof donationTransactionsTable.$inferSelect;
