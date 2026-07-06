import { eq } from "drizzle-orm";
import { db, quranCacheTable, quranSettingsTable } from "@workspace/db";

const ALQURAN_BASE = "https://api.alquran.cloud/v1";

export const RECITERS = [
  { id: "ar.alafasy", name: "Mishary Rashid Alafasy" },
  { id: "ar.abdulbasitmurattal", name: "Abdul Basit (Murattal)" },
  { id: "ar.abdurrahmaansudais", name: "Abdul Rahman Al-Sudais" },
  { id: "ar.minshawi", name: "Mohamed Siddiq Al-Minshawi" },
] as const;

export const DEFAULT_TRANSLATIONS = [
  { id: "en.sahih", name: "Saheeh International", language: "en" },
  { id: "en.pickthall", name: "Mohammed Marmaduke Pickthall", language: "en" },
  { id: "en.yusufali", name: "Abdullah Yusuf Ali", language: "en" },
  { id: "en.hilali", name: "Hilali & Khan", language: "en" },
] as const;

export interface QuranChapter {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface QuranAyah {
  surahNumber: number;
  ayahNumber: number;
  numberInSurah: number;
  arabic: string;
  translation: string;
  translationSource: string;
  audioUrl: string | null;
}

class QuranApiError extends Error {}

async function alQuranFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${ALQURAN_BASE}${path}`);
  if (!res.ok) {
    throw new QuranApiError(`AlQuran.cloud request failed (${res.status}): ${path}`);
  }
  const json = (await res.json()) as { code: number; status: string; data: T };
  if (json.code !== 200) {
    throw new QuranApiError(`AlQuran.cloud returned status ${json.status} for ${path}`);
  }
  return json.data;
}

async function getCached<T>(
  cacheKey: string,
  cacheType: string,
  ttlMinutes: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const [existing] = await db
    .select()
    .from(quranCacheTable)
    .where(eq(quranCacheTable.cacheKey, cacheKey))
    .limit(1);

  if (existing && existing.expiresAt.getTime() > Date.now()) {
    return JSON.parse(existing.dataJson) as T;
  }

  const data = await fetcher();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);
  const dataJson = JSON.stringify(data);

  await db
    .insert(quranCacheTable)
    .values({ cacheKey, cacheType, dataJson, expiresAt })
    .onConflictDoUpdate({
      target: quranCacheTable.cacheKey,
      set: { dataJson, expiresAt, cacheType, updatedAt: new Date() },
    });

  return data;
}

export async function getQuranSettings() {
  const [existing] = await db.select().from(quranSettingsTable).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(quranSettingsTable).values({}).returning();
  return created;
}

async function getCacheDurationMinutes(): Promise<number> {
  const settings = await getQuranSettings();
  return settings.cacheDurationMinutes;
}

export async function fetchChapters(): Promise<QuranChapter[]> {
  const ttl = await getCacheDurationMinutes();
  return getCached("chapters:list", "chapters", ttl, async () => {
    const data = await alQuranFetch<
      { number: number; name: string; englishName: string; englishNameTranslation: string; numberOfAyahs: number; revelationType: string }[]
    >("/surah");
    return data.map((s) => ({
      number: s.number,
      name: s.name,
      englishName: s.englishName,
      englishNameTranslation: s.englishNameTranslation,
      numberOfAyahs: s.numberOfAyahs,
      revelationType: s.revelationType,
    }));
  });
}

export async function fetchChapter(surahNumber: number): Promise<QuranChapter | null> {
  const chapters = await fetchChapters();
  return chapters.find((c) => c.number === surahNumber) ?? null;
}

interface EditionAyah {
  number: number;
  audio?: string;
  text: string;
  numberInSurah: number;
  surah?: { number: number };
}

interface EditionResult {
  edition: { identifier: string };
  ayahs: EditionAyah[];
}

export async function fetchChapterVerses(
  surahNumber: number,
  translationId: string,
  reciterId: string,
): Promise<QuranAyah[]> {
  const ttl = await getCacheDurationMinutes();
  return getCached(
    `verses:${surahNumber}:${translationId}:${reciterId}`,
    "verses",
    ttl,
    async () => {
      const editions = `quran-uthmani,${translationId},${reciterId}`;
      const data = await alQuranFetch<EditionResult[]>(`/surah/${surahNumber}/editions/${editions}`);
      const arabicEd = data.find((d) => d.edition.identifier === "quran-uthmani");
      const translationEd = data.find((d) => d.edition.identifier === translationId);
      const audioEd = data.find((d) => d.edition.identifier === reciterId);

      if (!arabicEd) throw new QuranApiError("Missing Arabic edition in response");

      return arabicEd.ayahs.map((ayah, idx) => ({
        surahNumber,
        ayahNumber: ayah.numberInSurah,
        numberInSurah: ayah.numberInSurah,
        arabic: ayah.text,
        translation: translationEd?.ayahs[idx]?.text ?? "",
        translationSource: translationId,
        audioUrl: audioEd?.ayahs[idx]?.audio ?? null,
      }));
    },
  );
}

export async function fetchAyah(
  surahNumber: number,
  ayahNumber: number,
  translationId: string,
  reciterId: string,
): Promise<QuranAyah | null> {
  const verses = await fetchChapterVerses(surahNumber, translationId, reciterId);
  return verses.find((v) => v.ayahNumber === ayahNumber) ?? null;
}

export interface QuranSearchResult {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  arabic: string;
  translation: string;
}

export async function searchQuran(keyword: string, translationId: string): Promise<QuranSearchResult[]> {
  if (!keyword.trim()) return [];
  const data = await alQuranFetch<{
    count: number;
    matches: { surah: { number: number; englishName: string }; numberInSurah: number; text: string }[];
  }>(`/search/${encodeURIComponent(keyword)}/all/${translationId}`).catch((err) => {
    if (err instanceof QuranApiError) return { count: 0, matches: [] };
    throw err;
  });

  const results: QuranSearchResult[] = [];
  for (const match of data.matches.slice(0, 30)) {
    const arabicVerse = await fetchAyah(match.surah.number, match.numberInSurah, translationId, RECITERS[0].id).catch(
      () => null,
    );
    results.push({
      surahNumber: match.surah.number,
      surahName: match.surah.englishName,
      ayahNumber: match.numberInSurah,
      arabic: arabicVerse?.arabic ?? "",
      translation: match.text,
    });
  }
  return results;
}
