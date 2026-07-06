import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { staffMembersTable, insertStaffMemberSchema } from "@workspace/db";
import {
  registerAdminCreate,
  registerAdminItemRoutes,
  registerAdminList,
  registerPublicList,
} from "../lib/crud";
import { ALL_ROLES, CONTENT_WRITE } from "../lib/roles";

const router: IRouter = Router();

registerPublicList(router, "/staff", staffMembersTable, eq(staffMembersTable.published, true));
registerAdminList(router, "/admin/staff", staffMembersTable, ALL_ROLES);
registerAdminCreate(router, "/admin/staff", staffMembersTable, insertStaffMemberSchema, CONTENT_WRITE);
registerAdminItemRoutes(
  router,
  "/admin/staff",
  staffMembersTable,
  staffMembersTable.id,
  insertStaffMemberSchema.partial(),
  CONTENT_WRITE,
);

export default router;
