import AsyncStorage from "@react-native-async-storage/async-storage";

const SURAH_KEY = (id: number) => `@grayspark/quranBookmark_${id}`;
const LAST_READ_KEY = "@grayspark/quranLastRead";

export type BookmarkData = {
  surahId: number;
  surahName: string;
  verseKey: string;
  verseNumber: number;
  savedAt: number;
};

export async function saveBookmark(data: BookmarkData): Promise<void> {
  try {
    const serialised = JSON.stringify(data);
    await AsyncStorage.multiSet([
      [SURAH_KEY(data.surahId), serialised],
      [LAST_READ_KEY, serialised],
    ]);
  } catch {}
}

export async function loadBookmark(surahId: number): Promise<BookmarkData | null> {
  try {
    const raw = await AsyncStorage.getItem(SURAH_KEY(surahId));
    return raw ? (JSON.parse(raw) as BookmarkData) : null;
  } catch {
    return null;
  }
}

export async function loadLastRead(): Promise<BookmarkData | null> {
  try {
    const raw = await AsyncStorage.getItem(LAST_READ_KEY);
    return raw ? (JSON.parse(raw) as BookmarkData) : null;
  } catch {
    return null;
  }
}

export async function clearBookmark(surahId: number): Promise<void> {
  try {
    await AsyncStorage.removeItem(SURAH_KEY(surahId));
  } catch {}
}
