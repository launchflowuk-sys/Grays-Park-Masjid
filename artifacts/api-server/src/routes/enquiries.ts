import { Router, type IRouter } from "express";
import { enquiriesTable, insertEnquirySchema, patchEnquirySchema } from "@workspace/db";
import {
  registerAdminExportCsv,
  registerAdminItemRoutes,
  registerAdminList,
  registerPublicCreate,
} from "../lib/crud";
import { ALL_ROLES, MASJID_WRITE } from "../lib/roles";

const router: IRouter = Router();

registerPublicCreate(router, "/enquiries", enquiriesTable, insertEnquirySchema);
registerAdminList(router, "/admin/enquiries", enquiriesTable, ALL_ROLES);
registerAdminExportCsv(
  router,
  "/admin/enquiries",
  enquiriesTable,
  [
    { key: "createdAt", header: "Date" },
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "subject", header: "Subject" },
    { key: "message", header: "Message" },
    { key: "status", header: "Status" },
  ],
  ALL_ROLES,
  "enquiries.csv",
);
registerAdminItemRoutes(
  router,
  "/admin/enquiries",
  enquiriesTable,
  enquiriesTable.id,
  patchEnquirySchema,
  MASJID_WRITE,
);

export default router;
