import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import {
  db,
  quranSettingsTable,
  featuredAyahTable,
  quranReflectionsTable,
  insertQuranSettingsSchema,
  insertFeaturedAyahSchema,
  insertQuranReflectionSchema,
} from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";
import { ALL_ROLES, CONTENT_WRITE, SUPER_ADMIN_ONLY } from "../lib/roles";
import { coerceDates, serialize, registerAdminItemRoutes } from "../lib/crud";
import {
  RECITERS,
  DEFAULT_TRANSLATIONS,
  getQuranSettings,
  fetchChapters,
  fetchChapter,
  fetchChapterVerses,
  fetchAyah,
  searchQuran,
} from "../lib/quran-provider";

const router: IRouter = Router();

router.get("/quran/settings", async (_req: Request, res: Response) => {
  const settings = await getQuranSettings();
  res.json(serialize(settings));
});

router.get("/quran/reciters", async (_req: Request, res: Response) => {
  res.json(RECITERS);
});

router.get("/quran/translations", async (_req: Request, res: Response) => {
  res.json(DEFAULT_TRANSLATIONS);
});

router.get("/quran/chapters", async (_req: Request, res: Response) => {
  const chapters = await fetchChapters();
  const transformed = chapters.map((c) => ({
    id: c.number,
    name_simple: c.englishName,
    name_arabic: c.name,
    verses_count: c.numberOfAyahs,
    translated_name: { name: c.englishNameTranslation },
    revelation_place:
      c.revelationType.toLowerCase() === "meccan" ? "makkah" : "madinah",
  }));
  res.json(transformed);
});

router.get("/quran/chapters/:number", async (req: Request, res: Response) => {
  const number = Number(req.params.number);
  if (!Number.isInteger(number) || number < 1 || number > 114) {
    res.status(400).json({ error: "Invalid surah number" });
    return;
  }
  const chapter = await fetchChapter(number);
  if (!chapter) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({
    id: chapter.number,
    name_simple: chapter.englishName,
    name_arabic: chapter.name,
    verses_count: chapter.numberOfAyahs,
    translated_name: { name: chapter.englishNameTranslation },
    revelation_place:
      chapter.revelationType.toLowerCase() === "meccan" ? "makkah" : "madinah",
  });
});

router.get("/quran/chapters/:number/verses", async (req: Request, res: Response) => {
  const number = Number(req.params.number);
  if (!Number.isInteger(number) || number < 1 || number > 114) {
    res.status(400).json({ error: "Invalid surah number" });
    return;
  }
  const translation = String(req.query.translation ?? DEFAULT_TRANSLATIONS[0].id);
  const reciter = String(req.query.reciter ?? RECITERS[0].id);

  try {
    const verses = await fetchChapterVerses(number, translation, reciter);
    const response = verses.map((v) => ({
      id: `${v.surahNumber}:${v.numberInSurah}`,
      verse_key: `${v.surahNumber}:${v.numberInSurah}`,
      verse_number: v.numberInSurah,
      text_uthmani: v.arabic,
      translations: [
        { text: v.translation, resource_id: 0, resource_name: v.translationSource },
      ],
      audio: v.audioUrl ? { url: v.audioUrl } : null,
    }));
    res.json(response);
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch verses from Qur'an provider" });
  }
});

router.get("/quran/ayah/:surah/:ayah", async (req: Request, res: Response) => {
  const surah = Number(req.params.surah);
  const ayah = Number(req.params.ayah);
  const translation = String(req.query.translation ?? DEFAULT_TRANSLATIONS[0].id);
  const reciter = String(req.query.reciter ?? RECITERS[0].id);

  if (!Number.isInteger(surah) || !Number.isInteger(ayah)) {
    res.status(400).json({ error: "Invalid surah or ayah number" });
    return;
  }

  try {
    const result = await fetchAyah(surah, ayah, translation, reciter);
    if (!result) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({
      id: `${result.surahNumber}:${result.numberInSurah}`,
      verse_key: `${result.surahNumber}:${result.numberInSurah}`,
      verse_number: result.numberInSurah,
      text_uthmani: result.arabic,
      translations: [
        { text: result.translation, resource_id: 0, resource_name: result.translationSource },
      ],
      audio: result.audioUrl ? { url: result.audioUrl } : null,
    });
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch ayah from Qur'an provider" });
  }
});

router.get("/quran/search", async (req: Request, res: Response) => {
  const keyword = String(req.query.q ?? "");
  const translation = String(req.query.translation ?? DEFAULT_TRANSLATIONS[0].id);

  if (!keyword.trim()) {
    res.json([]);
    return;
  }

  try {
    const results = await searchQuran(keyword, translation);
    res.json(results);
  } catch (err) {
    res.status(502).json({ error: "Failed to search Qur'an provider" });
  }
});

router.get("/quran/featured-ayah", async (_req: Request, res: Response) => {
  const now = new Date();
  const rows = await db
    .select()
    .from(featuredAyahTable)
    .where(eq(featuredAyahTable.showOnHomepage, true));

  const active = rows.find(
    (row) =>
      row.isPublished &&
      (!row.startDate || row.startDate <= now) &&
      (!row.endDate || row.endDate >= now),
  );

  if (!active) {
    // Fallback: Ayat al-Kursi (2:255) — always a meaningful default
    res.json(
      serialize({
        id: "default",
        surahNumber: 2,
        ayahNumber: 255,
        reflectionTitle: "Ayat al-Kursi",
        reflectionText:
          "The Throne Verse — the greatest verse in the Qur'an. Recite it after every prayer and before sleeping.",
        isPublished: true,
        showOnHomepage: true,
        startDate: null,
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    return;
  }

  res.json(serialize(active));
});

router.get("/quran/reflections/:surah/:ayah", async (req: Request, res: Response) => {
  const surah = Number(req.params.surah);
  const ayah = Number(req.params.ayah);

  const rows = await db
    .select()
    .from(quranReflectionsTable)
    .where(eq(quranReflectionsTable.surahNumber, surah));

  const filtered = rows.filter(
    (r) => r.ayahNumber === ayah && r.showPublicly && r.status === "published",
  );

  res.json(filtered.map(serialize));
});

router.put(
  "/admin/quran/settings",
  requireAuth,
  requireRole(...SUPER_ADMIN_ONLY),
  async (req: Request, res: Response) => {
    const parsed = insertQuranSettingsSchema.partial().safeParse(coerceDates(req.body));
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    const existing = await getQuranSettings();
    const [row] = await db
      .update(quranSettingsTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(quranSettingsTable.id, existing.id))
      .returning();

    res.json(serialize(row));
  },
);

router.get(
  "/admin/quran/featured-ayah",
  requireAuth,
  requireRole(...ALL_ROLES),
  async (_req: Request, res: Response) => {
    const rows = await db.select().from(featuredAyahTable);
    res.json(rows.map(serialize));
  },
);

router.post(
  "/admin/quran/featured-ayah",
  requireAuth,
  requireRole(...CONTENT_WRITE),
  async (req: Request, res: Response) => {
    const parsed = insertFeaturedAyahSchema.safeParse(coerceDates(req.body));
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }
    const [row] = await db.insert(featuredAyahTable).values(parsed.data).returning();
    res.status(201).json(serialize(row));
  },
);

registerAdminItemRoutes(
  router,
  "/admin/quran/featured-ayah",
  featuredAyahTable,
  featuredAyahTable.id,
  insertFeaturedAyahSchema.partial(),
  CONTENT_WRITE,
);

router.get(
  "/admin/quran/reflections",
  requireAuth,
  requireRole(...ALL_ROLES),
  async (_req: Request, res: Response) => {
    const rows = await db.select().from(quranReflectionsTable);
    res.json(rows.map(serialize));
  },
);

router.post(
  "/admin/quran/reflections",
  requireAuth,
  requireRole(...CONTENT_WRITE),
  async (req: Request, res: Response) => {
    const parsed = insertQuranReflectionSchema.safeParse(coerceDates(req.body));
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }
    const [row] = await db.insert(quranReflectionsTable).values(parsed.data).returning();
    res.status(201).json(serialize(row));
  },
);

registerAdminItemRoutes(
  router,
  "/admin/quran/reflections",
  quranReflectionsTable,
  quranReflectionsTable.id,
  insertQuranReflectionSchema.partial(),
  CONTENT_WRITE,
);

export default router;
