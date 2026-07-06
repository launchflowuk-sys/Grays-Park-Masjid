import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import {
  volunteerOpportunitiesTable,
  volunteerApplicationsTable,
  insertVolunteerOpportunitySchema,
  insertVolunteerApplicationSchema,
} from "@workspace/db";
import {
  registerAdminCreate,
  registerAdminItemRoutes,
  registerAdminList,
  registerPublicCreate,
  registerPublicList,
} from "../lib/crud";
import { ALL_ROLES, MASJID_WRITE } from "../lib/roles";

const router: IRouter = Router();

registerPublicList(
  router,
  "/volunteer-opportunities",
  volunteerOpportunitiesTable,
  eq(volunteerOpportunitiesTable.active, true),
);
registerAdminList(router, "/admin/volunteer-opportunities", volunteerOpportunitiesTable, ALL_ROLES);
registerAdminCreate(
  router,
  "/admin/volunteer-opportunities",
  volunteerOpportunitiesTable,
  insertVolunteerOpportunitySchema,
  MASJID_WRITE,
);
registerAdminItemRoutes(
  router,
  "/admin/volunteer-opportunities",
  volunteerOpportunitiesTable,
  volunteerOpportunitiesTable.id,
  insertVolunteerOpportunitySchema.partial(),
  MASJID_WRITE,
);

registerPublicCreate(router, "/volunteer-applications", volunteerApplicationsTable, insertVolunteerApplicationSchema);
registerAdminList(router, "/admin/volunteer-applications", volunteerApplicationsTable, ALL_ROLES);
registerAdminItemRoutes(
  router,
  "/admin/volunteer-applications",
  volunteerApplicationsTable,
  volunteerApplicationsTable.id,
  insertVolunteerApplicationSchema.partial(),
  MASJID_WRITE,
);

export default router;
