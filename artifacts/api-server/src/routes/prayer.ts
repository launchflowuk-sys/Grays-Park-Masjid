import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import {
  prayerTimesTable,
  timetablePdfsTable,
  insertPrayerTimeSchema,
  insertTimetablePdfSchema,
} from "@workspace/db";
import {
  registerAdminCreate,
  registerAdminItemRoutes,
  registerAdminList,
  registerPublicList,
} from "../lib/crud";
import { MASJID_WRITE, ALL_ROLES } from "../lib/roles";

const router: IRouter = Router();

registerPublicList(router, "/prayer-times", prayerTimesTable);
registerAdminList(router, "/admin/prayer-times", prayerTimesTable, ALL_ROLES);
registerAdminCreate(router, "/admin/prayer-times", prayerTimesTable, insertPrayerTimeSchema, MASJID_WRITE);
registerAdminItemRoutes(
  router,
  "/admin/prayer-times",
  prayerTimesTable,
  prayerTimesTable.id,
  insertPrayerTimeSchema.partial(),
  MASJID_WRITE,
);

registerPublicList(router, "/timetable-pdfs", timetablePdfsTable, eq(timetablePdfsTable.active, true));
registerAdminList(router, "/admin/timetable-pdfs", timetablePdfsTable, ALL_ROLES);
registerAdminCreate(
  router,
  "/admin/timetable-pdfs",
  timetablePdfsTable,
  insertTimetablePdfSchema,
  MASJID_WRITE,
);
registerAdminItemRoutes(
  router,
  "/admin/timetable-pdfs",
  timetablePdfsTable,
  timetablePdfsTable.id,
  insertTimetablePdfSchema.partial(),
  MASJID_WRITE,
);

export default router;
