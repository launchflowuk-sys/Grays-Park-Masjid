import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { eventsTable, insertEventSchema } from "@workspace/db";
import {
  registerAdminCreate,
  registerAdminItemRoutes,
  registerAdminList,
  registerPublicList,
} from "../lib/crud";
import { ALL_ROLES, CONTENT_WRITE } from "../lib/roles";

const router: IRouter = Router();

registerPublicList(router, "/events", eventsTable, eq(eventsTable.published, true));
registerAdminList(router, "/admin/events", eventsTable, ALL_ROLES);
registerAdminCreate(router, "/admin/events", eventsTable, insertEventSchema, CONTENT_WRITE);
registerAdminItemRoutes(
  router,
  "/admin/events",
  eventsTable,
  eventsTable.id,
  insertEventSchema.partial(),
  CONTENT_WRITE,
);

export default router;
