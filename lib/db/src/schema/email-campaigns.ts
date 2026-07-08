import { pgTable, text, timestamp, uuid, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const emailCampaignStatusEnum = pgEnum("email_campaign_status", ["draft", "sent"]);

export const emailCampaignRecipientTypeEnum = pgEnum("email_campaign_recipient_type", [
  "all_members",
  "specific",
]);

export const emailCampaignsTable = pgTable("email_campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  subject: text("subject").notNull(),
  bannerImageUrl: text("banner_image_url"),
  bodyText: text("body_text").notNull(),
  ctaLabel: text("cta_label"),
  ctaUrl: text("cta_url"),
  recipientType: emailCampaignRecipientTypeEnum("recipient_type").notNull().default("all_members"),
  recipientEmails: text("recipient_emails").array().notNull().default([]),
  status: emailCampaignStatusEnum("status").notNull().default("draft"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  sentCount: integer("sent_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEmailCampaignSchema = createInsertSchema(emailCampaignsTable).omit({
  id: true,
  status: true,
  sentAt: true,
  sentCount: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEmailCampaign = z.infer<typeof insertEmailCampaignSchema>;

export const patchEmailCampaignSchema = createInsertSchema(emailCampaignsTable)
  .omit({ id: true, status: true, sentAt: true, sentCount: true, createdAt: true, updatedAt: true })
  .partial();
export type PatchEmailCampaign = z.infer<typeof patchEmailCampaignSchema>;

export type EmailCampaign = typeof emailCampaignsTable.$inferSelect;
export type EmailCampaignStatus = (typeof emailCampaignStatusEnum.enumValues)[number];
export type EmailCampaignRecipientType = (typeof emailCampaignRecipientTypeEnum.enumValues)[number];
