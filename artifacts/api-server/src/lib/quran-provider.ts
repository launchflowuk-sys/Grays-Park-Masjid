import { eq } from "drizzle-orm";
import { db, quranCacheTable, quranSettingsTable } from "@workspace/db";
import { logger } from "./logger";

const QF_BASE = "https://api.quran.com/api/v4";
const QF_OAUTH_URL = "https://oauth2.quran.foundation/oauth2/token";

// ── OAuth2 token cache ────────────────────────────────────────────────────────
let _cachedToken: string | null = null;
let _tokenExpiresAt = 0;

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.QURAN_FOUNDATION_CLIENT_ID;
  const clientSecret = process.env.QURAN_FOUNDATION_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  if (_cachedToken && Date.now() < _tokenExpiresAt - 60_000) {
    return _cachedToken;
  }

  try {
    const res = await fetch(QF_OAUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { access_token: string; expires_in: number };
    _cachedToken = json.access_token;
    _tokenExpiresAt = Date.now() + json.expires_in * 1000;
    return _cachedToken;
  } catch {
    return null;
  }
}

async function qfFetch<T>(path: string): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const url = `${QF_BASE}${path}`;
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      const body = await res.text().catch(() => "(unreadable)");
      logger.error({ status: res.status, url, body }, "QF API upstream error");
      throw new QuranApiError(`Quran Foundation API failed (${res.status}): ${path}`);
    }
    return res.json() as Promise<T>;
  } catch (err) {
    if (err instanceof QuranApiError) throw err;
    logger.error({ err, url }, "QF API fetch threw");
    throw err;
  }
}

// ── ID mappings (legacy string → QF numeric) ─────────────────────────────────
const TRANSLATION_ID_MAP: Record<string, number> = {
  "en.sahih": 131,
  "en.pickthall": 85,
  "en.yusufali": 22,
  "en.hilali": 84,
  "en.asad": 4,
  "en.arberry": 25,
};

const RECITER_ID_MAP: Record<string, number> = {
  "ar.alafasy": 7,
  "ar.abdulbasitmurattal": 1,
  "ar.abdurrahmaansudais": 4,
  "ar.minshawi": 3,
  "ar.hudhaify": 6,
  "ar.mahermuaiqly": 10,
};

// ── Revelation place static lookup (Makki vs Madani) ─────────────────────────
const MADINAH_SURAHS = new Set([
  2, 3, 4, 5, 8, 9, 13, 22, 24, 33, 47, 48, 49, 57, 58, 59, 60, 61, 62, 63,
  64, 65, 66, 76, 98, 99, 110,
]);

function revelationPlace(surahNumber: number): string {
  return MADINAH_SURAHS.has(surahNumber) ? "Medinan" : "Meccan";
}

// ── Public API surface ────────────────────────────────────────────────────────
export const RECITERS = [
  { id: "ar.alafasy", name: "Mishary Rashid Alafasy" },
  { id: "ar.abdulbasitmurattal", name: "Abdul Basit (Murattal)" },
  { id: "ar.abdurrahmaansudais", name: "Abdul Rahman Al-Sudais" },
  { id: "ar.minshawi", name: "Mohamed Siddiq Al-Minshawi" },
  { id: "ar.hudhaify", name: "Ali Al-Hudhaify" },
  { id: "ar.mahermuaiqly", name: "Maher Al Muaiqly" },
] as const;

export const DEFAULT_TRANSLATIONS = [
  { id: "en.sahih", name: "Saheeh International", language: "en" },
  { id: "en.pickthall", name: "Mohammed Marmaduke Pickthall", language: "en" },
  { id: "en.yusufali", name: "Abdullah Yusuf Ali", language: "en" },
  { id: "en.hilali", name: "Hilali & Khan", language: "en" },
  { id: "en.asad", name: "Muhammad Asad", language: "en" },
  { id: "en.arberry", name: "A.J. Arberry", language: "en" },
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

export interface QuranSearchResult {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  arabic: string;
  translation: string;
}

class QuranApiError extends Error {}

// ── DB cache helpers ──────────────────────────────────────────────────────────
async function getCached<T>(
  cacheKey: string,
  cacheType: string,
  ttlMinutes: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  try {
    const [existing] = await db
      .select()
      .from(quranCacheTable)
      .where(eq(quranCacheTable.cacheKey, cacheKey))
      .limit(1);

    if (existing && existing.expiresAt.getTime() > Date.now()) {
      return JSON.parse(existing.dataJson) as T;
    }
  } catch (err) {
    logger.error({ err, cacheKey }, "quran getCached: DB read failed");
  }

  const data = await fetcher();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);
  const dataJson = JSON.stringify(data);

  try {
    await db
      .insert(quranCacheTable)
      .values({ cacheKey, cacheType, dataJson, expiresAt })
      .onConflictDoUpdate({
        target: quranCacheTable.cacheKey,
        set: { dataJson, expiresAt, cacheType, updatedAt: new Date() },
      });
  } catch (err) {
    logger.error({ err, cacheKey }, "quran getCached: DB write failed");
  }

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

// ── QF API response shapes ────────────────────────────────────────────────────
interface QFChapter {
  id: number;
  name_arabic: string;
  name_simple: string;
  verses_count: number;
  translated_name: { name: string };
}

interface QFVerse {
  id: number;
  verse_number: number;
  verse_key: string;
  text_uthmani: string;
  translations: { resource_id: number; text: string; resource_name: string }[];
  audio: { url: string } | null;
}

interface QFSearchResult {
  id: string;
  verse_key: string;
  verse_number: number;
  chapter_id: number;
  text_uthmani: string;
  translations: { resource_id: number; text: string; resource_name: string }[];
}

// ── Public fetchers ───────────────────────────────────────────────────────────
export async function fetchChapters(): Promise<QuranChapter[]> {
  const ttl = await getCacheDurationMinutes();
  return getCached("qf:chapters:list", "chapters", ttl, async () => {
    const data = await qfFetch<{ chapters: QFChapter[] }>("/chapters?language=en");
    return data.chapters.map((c) => ({
      number: c.id,
      name: c.name_arabic,
      englishName: c.name_simple,
      englishNameTranslation: c.translated_name.name,
      numberOfAyahs: c.verses_count,
      revelationType: revelationPlace(c.id),
    }));
  });
}

export async function fetchChapter(surahNumber: number): Promise<QuranChapter | null> {
  const chapters = await fetchChapters();
  return chapters.find((c) => c.number === surahNumber) ?? null;
}

export async function fetchChapterVerses(
  surahNumber: number,
  translationId: string,
  reciterId: string,
): Promise<QuranAyah[]> {
  const ttl = await getCacheDurationMinutes();
  const qfTranslation = TRANSLATION_ID_MAP[translationId] ?? TRANSLATION_ID_MAP["en.sahih"];
  const qfReciter = RECITER_ID_MAP[reciterId] ?? RECITER_ID_MAP["ar.alafasy"];

  return getCached(
    `qf:verses:${surahNumber}:${translationId}:${reciterId}`,
    "verses",
    ttl,
    async () => {
      const params = new URLSearchParams({
        translations: String(qfTranslation),
        audio: String(qfReciter),
        fields: "text_uthmani",
        per_page: "300",
        language: "en",
      });
      const data = await qfFetch<{ verses: QFVerse[] }>(
        `/verses/by_chapter/${surahNumber}?${params}`,
      );

      return data.verses.map((v) => ({
        surahNumber,
        ayahNumber: v.verse_number,
        numberInSurah: v.verse_number,
        arabic: v.text_uthmani,
        translation: v.translations[0]?.text ?? "",
        translationSource: translationId,
        audioUrl: v.audio?.url ?? null,
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

export async function searchQuran(
  keyword: string,
  translationId: string,
): Promise<QuranSearchResult[]> {
  if (!keyword.trim()) return [];

  const qfTranslation = TRANSLATION_ID_MAP[translationId] ?? TRANSLATION_ID_MAP["en.sahih"];
  const params = new URLSearchParams({
    q: keyword,
    size: "20",
    page: "1",
    language: "en",
    translations: String(qfTranslation),
  });

  try {
    const data = await qfFetch<{ search: { results: QFSearchResult[] } }>(
      `/search?${params}`,
    );

    const chaptersMap = await fetchChapters().then(
      (chs) => new Map(chs.map((c) => [c.number, c.englishName])),
    );

    return data.search.results.map((r) => ({
      surahNumber: r.chapter_id,
      surahName: chaptersMap.get(r.chapter_id) ?? `Surah ${r.chapter_id}`,
      ayahNumber: r.verse_number,
      arabic: r.text_uthmani,
      translation: r.translations[0]?.text ?? "",
    }));
  } catch (err) {
    if (err instanceof QuranApiError) return [];
    throw err;
  }
}
