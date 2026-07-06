import { pgTable, text, timestamp, uuid, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const galleryAlbumsTable = pgTable("gallery_albums", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  coverImageUrl: text("cover_image_url"),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGalleryAlbumSchema = createInsertSchema(galleryAlbumsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertGalleryAlbum = z.infer<typeof insertGalleryAlbumSchema>;
export type GalleryAlbum = typeof galleryAlbumsTable.$inferSelect;

export const galleryMediaTable = pgTable("gallery_media", {
  id: uuid("id").primaryKey().defaultRandom(),
  albumId: uuid("album_id")
    .notNull()
    .references(() => galleryAlbumsTable.id, { onDelete: "cascade" }),
  mediaUrl: text("media_url").notNull(),
  caption: text("caption"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGalleryMediaSchema = createInsertSchema(galleryMediaTable).omit({
  id: true,
  createdAt: true,
});
export type InsertGalleryMedia = z.infer<typeof insertGalleryMediaSchema>;
export type GalleryMedia = typeof galleryMediaTable.$inferSelect;
