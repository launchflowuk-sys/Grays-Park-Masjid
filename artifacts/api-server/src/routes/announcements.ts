import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { announcementsTable, insertAnnouncementSchema } from "@workspace/db";
import {
  registerAdminCreate,
  registerAdminItemRoutes,
  registerAdminList,
  registerPublicList,
} from "../lib/crud";
import { ALL_ROLES, CONTENT_WRITE } from "../lib/roles";

const router: IRouter = Router();

registerPublicList(router, "/announcements", announcementsTable, eq(announcementsTable.published, true));
registerAdminList(router, "/admin/announcements", announcementsTable, ALL_ROLES);
registerAdminCreate(
  router,
  "/admin/announcements",
  announcementsTable,
  insertAnnouncementSchema,
  CONTENT_WRITE,
);
registerAdminItemRoutes(
  router,
  "/admin/announcements",
  announcementsTable,
  announcementsTable.id,
  insertAnnouncementSchema.partial(),
  CONTENT_WRITE,
);

export default router;
