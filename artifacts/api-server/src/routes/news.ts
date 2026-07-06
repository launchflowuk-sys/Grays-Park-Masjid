import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { newsPostsTable, insertNewsPostSchema } from "@workspace/db";
import {
  registerAdminCreate,
  registerAdminItemRoutes,
  registerAdminList,
  registerPublicList,
} from "../lib/crud";
import { ALL_ROLES, CONTENT_WRITE } from "../lib/roles";

const router: IRouter = Router();

registerPublicList(router, "/news", newsPostsTable, eq(newsPostsTable.published, true));
registerAdminList(router, "/admin/news", newsPostsTable, ALL_ROLES);
registerAdminCreate(router, "/admin/news", newsPostsTable, insertNewsPostSchema, CONTENT_WRITE);
registerAdminItemRoutes(
  router,
  "/admin/news",
  newsPostsTable,
  newsPostsTable.id,
  insertNewsPostSchema.partial(),
  CONTENT_WRITE,
);

export default router;
