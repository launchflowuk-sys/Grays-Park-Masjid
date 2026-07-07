import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { eq, and } from "drizzle-orm";
import sanitizeHtml from "sanitize-html";
import { db, blogPostsTable, insertBlogPostSchema } from "@workspace/db";
import {
  registerAdminItemRoutes,
  registerAdminList,
  coerceDates,
  serialize,
} from "../lib/crud";
import { requireAuth, requireRole } from "../middlewares/auth";
import { CONTENT_WRITE, ALL_ROLES } from "../lib/roles";
import { broadcastPush } from "../lib/push";

const ALLOWED_TAGS = [
  "h2", "h3", "h4", "p", "br", "strong", "em", "u", "s",
  "ul", "ol", "li", "blockquote", "pre", "code", "hr",
  "a", "img",
];

const ALLOWED_ATTRS: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "title", "rel", "target"],
  img: ["src", "alt", "width", "height"],
};

function sanitizeContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRS,
    allowedSchemes: ["https", "http", "mailto"],
    disallowedTagsMode: "discard",
  });
}

function sanitizeBlogBody(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body.content === "string") {
    req.body.content = sanitizeContent(req.body.content);
  }
  next();
}

const router: IRouter = Router();

router.use("/admin/blog-posts", sanitizeBlogBody);

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

router.post(
  "/admin/blog-posts",
  requireAuth,
  requireRole(...CONTENT_WRITE),
  sanitizeBlogBody,
  async (req: Request, res: Response) => {
    const parsed = insertBlogPostSchema.safeParse(coerceDates(req.body));
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }
    const [row] = await db.insert(blogPostsTable).values(parsed.data as never).returning();
    res.status(201).json(serialize(row));
    if (row.published) {
      broadcastPush(
        row.title,
        row.excerpt ?? "New article from the masjid",
        "blog",
        row.slug,
      ).catch((err: unknown) => console.error("[push] blog broadcast error:", err));
    }
  },
);

registerAdminItemRoutes(
  router,
  "/admin/blog-posts",
  blogPostsTable,
  blogPostsTable.id,
  insertBlogPostSchema.partial(),
  CONTENT_WRITE,
);

export default router;
