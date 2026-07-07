import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, blogPostsTable, insertBlogPostSchema } from "@workspace/db";
import {
  registerAdminCreate,
  registerAdminItemRoutes,
  registerAdminList,
  serialize,
} from "../lib/crud";
import { CONTENT_WRITE, ALL_ROLES } from "../lib/roles";

const router: IRouter = Router();

router.get("/blog-posts", async (req, res) => {
  const { category } = req.query;
  const conditions = [eq(blogPostsTable.published, true)];
  if (category && typeof category === "string") {
    conditions.push(eq(blogPostsTable.category, category));
  }
  const rows = await db.select().from(blogPostsTable).where(and(...conditions));
  res.json(rows.map(serialize));
});

router.get("/blog-posts/:slug", async (req, res) => {
  const slug = req.params.slug as string;
  const [row] = await db
    .select()
    .from(blogPostsTable)
    .where(and(eq(blogPostsTable.slug, slug), eq(blogPostsTable.published, true)))
    .limit(1);
  if (!row) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(serialize(row));
});

registerAdminList(router, "/admin/blog-posts", blogPostsTable, ALL_ROLES);
registerAdminCreate(router, "/admin/blog-posts", blogPostsTable, insertBlogPostSchema, CONTENT_WRITE);
registerAdminItemRoutes(
  router,
  "/admin/blog-posts",
  blogPostsTable,
  blogPostsTable.id,
  insertBlogPostSchema.partial(),
  CONTENT_WRITE,
);

export default router;
