import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { servicesTable, insertServiceSchema } from "@workspace/db";
import {
  registerAdminCreate,
  registerAdminItemRoutes,
  registerAdminList,
  registerPublicList,
} from "../lib/crud";
import { ALL_ROLES, MASJID_WRITE } from "../lib/roles";

const router: IRouter = Router();

registerPublicList(router, "/services", servicesTable, eq(servicesTable.published, true));
registerAdminList(router, "/admin/services", servicesTable, ALL_ROLES);
registerAdminCreate(router, "/admin/services", servicesTable, insertServiceSchema, MASJID_WRITE);
registerAdminItemRoutes(
  router,
  "/admin/services",
  servicesTable,
  servicesTable.id,
  insertServiceSchema.partial(),
  MASJID_WRITE,
);

export default router;
