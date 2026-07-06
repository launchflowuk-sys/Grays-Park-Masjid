import { pgTable, text, timestamp, uuid, boolean, integer, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const coursesTable = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  ageGroup: text("age_group"),
  schedule: text("schedule"),
  fee: numeric("fee", { precision: 10, scale: 2 }),
  capacity: integer("capacity"),
  imageUrl: text("image_url"),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCourseSchema = createInsertSchema(coursesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof coursesTable.$inferSelect;

export const registrationStatusEnum = pgEnum("registration_status", [
  "pending",
  "confirmed",
  "waitlisted",
  "cancelled",
]);

export const courseRegistrationsTable = pgTable("course_registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => coursesTable.id, { onDelete: "cascade" }),
  studentName: text("student_name").notNull(),
  guardianName: text("guardian_name"),
  email: text("email").notNull(),
  phone: text("phone"),
  status: registrationStatusEnum("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCourseRegistrationSchema = createInsertSchema(courseRegistrationsTable)
  .omit({ id: true, createdAt: true, status: true })
  .extend({ email: z.string().email() });
export type InsertCourseRegistration = z.infer<typeof insertCourseRegistrationSchema>;
export type CourseRegistration = typeof courseRegistrationsTable.$inferSelect;
