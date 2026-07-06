import { pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const memberStatusEnum = pgEnum("member_status", [
  "pending",
  "approved",
  "denied",
  "info_requested",
]);

export const membersTable = pgTable("members", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  membershipType: text("membership_type").notNull().default("individual"),
  message: text("message"),
  status: memberStatusEnum("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMemberSchema = createInsertSchema(membersTable)
  .omit({ id: true, status: true, adminNotes: true, createdAt: true, updatedAt: true })
  .extend({ email: z.string().email() });
export type InsertMember = z.infer<typeof insertMemberSchema>;

export const patchMemberSchema = createInsertSchema(membersTable)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({ email: z.string().email() })
  .partial();
export type PatchMember = z.infer<typeof patchMemberSchema>;

export type Member = typeof membersTable.$inferSelect;
export type MemberStatus = (typeof memberStatusEnum.enumValues)[number];
export const MEMBER_STATUSES = memberStatusEnum.enumValues;
