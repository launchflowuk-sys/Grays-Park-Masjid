import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import {
  coursesTable,
  courseRegistrationsTable,
  insertCourseSchema,
  insertCourseRegistrationSchema,
} from "@workspace/db";
import {
  registerAdminCreate,
  registerAdminExportCsv,
  registerAdminItemRoutes,
  registerAdminList,
  registerPublicCreate,
  registerPublicList,
} from "../lib/crud";
import { ALL_ROLES, EDUCATION_WRITE } from "../lib/roles";

const router: IRouter = Router();

registerPublicList(router, "/courses", coursesTable, eq(coursesTable.published, true));
registerAdminList(router, "/admin/courses", coursesTable, ALL_ROLES);
registerAdminCreate(router, "/admin/courses", coursesTable, insertCourseSchema, EDUCATION_WRITE);
registerAdminItemRoutes(
  router,
  "/admin/courses",
  coursesTable,
  coursesTable.id,
  insertCourseSchema.partial(),
  EDUCATION_WRITE,
);

registerPublicCreate(router, "/course-registrations", courseRegistrationsTable, insertCourseRegistrationSchema);
registerAdminList(router, "/admin/course-registrations", courseRegistrationsTable, ALL_ROLES);
registerAdminExportCsv(
  router,
  "/admin/course-registrations",
  courseRegistrationsTable,
  [
    { key: "createdAt", header: "Date" },
    { key: "courseId", header: "Course ID" },
    { key: "studentName", header: "Student Name" },
    { key: "guardianName", header: "Guardian Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "status", header: "Status" },
    { key: "notes", header: "Notes" },
  ],
  ALL_ROLES,
  "course-registrations.csv",
);
registerAdminItemRoutes(
  router,
  "/admin/course-registrations",
  courseRegistrationsTable,
  courseRegistrationsTable.id,
  insertCourseRegistrationSchema.partial(),
  EDUCATION_WRITE,
);

export default router;
