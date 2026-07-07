import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const deviceTokensTable = pgTable("device_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  deviceId: text("device_id").notNull().unique(),
  token: text("token").notNull().unique(),
  platform: text("platform").notNull().default("unknown"),
  memberId: text("member_id"),
  categories: jsonb("categories").notNull().default({
    announcements: true,
    events: true,
    blog: true,
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDeviceTokenSchema = createInsertSchema(deviceTokensTable, {
  deviceId: z.string().min(1),
  token: z.string().min(1),
  platform: z.string().optional(),
  memberId: z.string().optional().nullable(),
  categories: z
    .object({
      announcements: z.boolean().optional(),
      events: z.boolean().optional(),
      blog: z.boolean().optional(),
    })
    .optional(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const patchDeviceTokenSchema = z.object({
  token: z.string().min(1).optional(),
  memberId: z.string().optional().nullable(),
  categories: z.object({
    announcements: z.boolean().optional(),
    events: z.boolean().optional(),
    blog: z.boolean().optional(),
  }).optional(),
});

export type DeviceToken = typeof deviceTokensTable.$inferSelect;
export type InsertDeviceToken = z.infer<typeof insertDeviceTokenSchema>;
export type PatchDeviceToken = z.infer<typeof patchDeviceTokenSchema>;
