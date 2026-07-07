import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const notificationBroadcastsTable = pgTable("notification_broadcasts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  category: text("category").notNull(),
  refId: text("ref_id"),
  sentCount: integer("sent_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type NotificationBroadcast = typeof notificationBroadcastsTable.$inferSelect;

export const insertNotificationBroadcastSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  category: z.string().min(1),
  refId: z.string().optional(),
  sentCount: z.number().int().optional(),
});
