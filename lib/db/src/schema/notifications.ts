import { pgTable, uuid, timestamp, boolean, pgEnum, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { adminUsersTable } from "./admin-users";

export const notificationModuleEnum = pgEnum("notification_module", [
  "donations",
  "enquiries",
  "courses",
  "volunteers",
  "members",
]);

export const notificationRecipientsTable = pgTable(
  "notification_recipients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    adminUserId: uuid("admin_user_id")
      .notNull()
      .references(() => adminUsersTable.id, { onDelete: "cascade" }),
    module: notificationModuleEnum("module").notNull(),
    emailEnabled: boolean("email_enabled").notNull().default(true),
    smsEnabled: boolean("sms_enabled").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.adminUserId, table.module)],
);

export const insertNotificationRecipientSchema = createInsertSchema(notificationRecipientsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertNotificationRecipient = z.infer<typeof insertNotificationRecipientSchema>;
export type NotificationRecipient = typeof notificationRecipientsTable.$inferSelect;
export type NotificationModule = (typeof notificationModuleEnum.enumValues)[number];
export const NOTIFICATION_MODULES = notificationModuleEnum.enumValues;
