import { pgTable, text, timestamp, uuid, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const volunteerOpportunitiesTable = pgTable("volunteer_opportunities", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVolunteerOpportunitySchema = createInsertSchema(volunteerOpportunitiesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertVolunteerOpportunity = z.infer<typeof insertVolunteerOpportunitySchema>;
export type VolunteerOpportunity = typeof volunteerOpportunitiesTable.$inferSelect;

export const volunteerApplicationStatusEnum = pgEnum("volunteer_application_status", [
  "pending",
  "accepted",
  "declined",
]);

export const volunteerApplicationsTable = pgTable("volunteer_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  opportunityId: uuid("opportunity_id")
    .notNull()
    .references(() => volunteerOpportunitiesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message"),
  status: volunteerApplicationStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVolunteerApplicationSchema = createInsertSchema(volunteerApplicationsTable)
  .omit({ id: true, createdAt: true, status: true })
  .extend({ email: z.string().email() });
export type InsertVolunteerApplication = z.infer<typeof insertVolunteerApplicationSchema>;
export type VolunteerApplication = typeof volunteerApplicationsTable.$inferSelect;
