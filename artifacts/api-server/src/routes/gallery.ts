import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, galleryAlbumsTable, galleryMediaTable, insertGalleryAlbumSchema, insertGalleryMediaSchema } from "@workspace/db";
import {
  registerAdminCreate,
  registerAdminItemRoutes,
  registerAdminList,
  registerPublicList,
} from "../lib/crud";
import { ALL_ROLES, CONTENT_WRITE } from "../lib/roles";

const router: IRouter = Router();

registerPublicList(router, "/gallery-albums", galleryAlbumsTable, eq(galleryAlbumsTable.published, true));
registerAdminList(router, "/admin/gallery-albums", galleryAlbumsTable, ALL_ROLES);
registerAdminCreate(
  router,
  "/admin/gallery-albums",
  galleryAlbumsTable,
  insertGalleryAlbumSchema,
  CONTENT_WRITE,
);
registerAdminItemRoutes(
  router,
  "/admin/gallery-albums",
  galleryAlbumsTable,
  galleryAlbumsTable.id,
  insertGalleryAlbumSchema.partial(),
  CONTENT_WRITE,
);

router.get("/gallery-media", async (req: Request, res: Response) => {
  const albumId = typeof req.query.albumId === "string" ? req.query.albumId : undefined;
  const rows = albumId
    ? await db.select().from(galleryMediaTable).where(eq(galleryMediaTable.albumId, albumId))
    : await db.select().from(galleryMediaTable);
  res.json(
    rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
    })),
  );
});

registerAdminList(router, "/admin/gallery-media", galleryMediaTable, ALL_ROLES);
registerAdminCreate(
  router,
  "/admin/gallery-media",
  galleryMediaTable,
  insertGalleryMediaSchema,
  CONTENT_WRITE,
);
registerAdminItemRoutes(
  router,
  "/admin/gallery-media",
  galleryMediaTable,
  galleryMediaTable.id,
  insertGalleryMediaSchema.partial(),
  CONTENT_WRITE,
);

export default router;
