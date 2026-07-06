import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { donationCampaignsTable, insertDonationCampaignSchema } from "@workspace/db";
import {
  registerAdminCreate,
  registerAdminItemRoutes,
  registerAdminList,
  registerPublicList,
} from "../lib/crud";
import { ALL_ROLES, DONATION_WRITE } from "../lib/roles";

const router: IRouter = Router();

registerPublicList(router, "/donation-campaigns", donationCampaignsTable, eq(donationCampaignsTable.active, true));
registerAdminList(router, "/admin/donation-campaigns", donationCampaignsTable, ALL_ROLES);
registerAdminCreate(
  router,
  "/admin/donation-campaigns",
  donationCampaignsTable,
  insertDonationCampaignSchema,
  DONATION_WRITE,
);
registerAdminItemRoutes(
  router,
  "/admin/donation-campaigns",
  donationCampaignsTable,
  donationCampaignsTable.id,
  insertDonationCampaignSchema.partial(),
  DONATION_WRITE,
);

export default router;
