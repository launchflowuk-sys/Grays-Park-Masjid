import { Router, type IRouter } from "express";
import { enquiriesTable, insertEnquirySchema } from "@workspace/db";
import {
  registerAdminItemRoutes,
  registerAdminList,
  registerPublicCreate,
} from "../lib/crud";
import { ALL_ROLES, MASJID_WRITE } from "../lib/roles";

const router: IRouter = Router();

registerPublicCreate(router, "/enquiries", enquiriesTable, insertEnquirySchema);
registerAdminList(router, "/admin/enquiries", enquiriesTable, ALL_ROLES);
registerAdminItemRoutes(
  router,
  "/admin/enquiries",
  enquiriesTable,
  enquiriesTable.id,
  insertEnquirySchema.partial(),
  MASJID_WRITE,
);

export default router;
