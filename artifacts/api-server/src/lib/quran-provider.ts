import { eq } from "drizzle-orm";
import { db, quranCacheTable, quranSettingsTable } from "@workspace/db";

// ── API bases ─────────────────────────────────────────────────────────────────
const QF_BASE = "https://api.quran.com/api/v4";
const AQ_BASE = "https://api.alquran.cloud/v1";

// ── AlQuran.cloud fetch (no auth required) ────────────────────────────────────
async function aqFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${AQ_BASE}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`AlQuran.cloud API failed (${res.status}): ${path}`);
  }
  return res.json() as Promise<T>;
}

// ── Quran Foundation fetch (optional OAuth, used for chapters + search) ───────
const QF_OAUTH_URL = "https://oauth2.quran.foundation/oauth2/token";
let _cachedToken: string | null = null;
let _tokenExpiresAt = 0;

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.QURAN_FOUNDATION_CLIENT_ID;
  const clientSecret = process.env.QURAN_FOUNDATION_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  if (_cachedToken && Date.now() < _tokenExpiresAt - 60_000) return _cachedToken;
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
  const res = await fetch(`${QF_BASE}${path}`, { headers });
  if (!res.ok) {
    throw new Error(`Quran Foundation API failed (${res.status}): ${path}`);
  }
  return res.json() as Promise<T>;
}

// ── QF numeric ID map (search only) ──────────────────────────────────────────
const TRANSLATION_ID_MAP: Record<string, number> = {
  "en.sahih": 131,
  "en.pickthall": 85,
  "en.yusufali": 22,
  "en.hilali": 84,
  "en.asad": 4,
  "en.arberry": 25,
};

// ── AlQuran.cloud reciter edition identifiers ─────────────────────────────────
const AQ_RECITER_MAP: Record<string, string> = {
  "ar.alafasy": "ar.alafasy",
  "ar.abdulbasitmurattal": "ar.abdulbasitmujawwad",
  "ar.abdurrahmaansudais": "ar.abdurrahmaansudais",
  "ar.minshawi": "ar.minshawi",
  "ar.hudhaify": "ar.hudhaify",
  "ar.mahermuaiqly": "ar.mahermuaiqly",
};

// ── Revelation place static lookup ───────────────────────────────────────────
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
  } catch {
    // DB read failed — proceed to fetch fresh
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
  } catch {
    // Cache write failed — data still returned to caller
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

// ── QF API response shapes (chapters + search) ────────────────────────────────
interface QFChapter {
  id: number;
  name_arabic: string;
  name_simple: string;
  verses_count: number;
  translated_name: { name: string };
}

interface QFSearchResult {
  id: string;
  verse_key: string;
  verse_number: number;
  chapter_id: number;
  text_uthmani: string;
  translations?: { resource_id: number; text: string; resource_name: string }[];
}

// ── AlQuran.cloud response shapes ────────────────────────────────────────────
interface AQAyah {
  numberInSurah: number;
  text: string;
  audio?: string;
}

interface AQEdition {
  edition: { identifier: string; format: string };
  ayahs: AQAyah[];
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

// Verses use AlQuran.cloud — free, no auth, full translations + CDN audio URLs
export async function fetchChapterVerses(
  surahNumber: number,
  translationId: string,
  reciterId: string,
): Promise<QuranAyah[]> {
  const ttl = await getCacheDurationMinutes();
  const aqReciter = AQ_RECITER_MAP[reciterId] ?? "ar.alafasy";

  return getCached(
    `aq:verses:${surahNumber}:${translationId}:${aqReciter}`,
    "verses",
    ttl,
    async () => {
      const editions = `quran-uthmani,${translationId},${aqReciter}`;
      const data = await aqFetch<{ data: AQEdition[] }>(
        `/surah/${surahNumber}/editions/${editions}`,
      );

      const arabicEd = data.data.find((e) => e.edition.identifier === "quran-uthmani");
      const transEd = data.data.find((e) => e.edition.identifier === translationId);
      const audioEd = data.data.find((e) => e.edition.identifier === aqReciter);

      if (!arabicEd) throw new Error("AlQuran.cloud: missing Arabic edition");

      return arabicEd.ayahs.map((ayah, i) => ({
        surahNumber,
        ayahNumber: ayah.numberInSurah,
        numberInSurah: ayah.numberInSurah,
        arabic: ayah.text,
        translation: transEd?.ayahs[i]?.text ?? "",
        translationSource: translationId,
        audioUrl: audioEd?.ayahs[i]?.audio ?? null,
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
      translation: r.translations?.[0]?.text ?? "",
    }));
  } catch {
    return [];
  }
}
