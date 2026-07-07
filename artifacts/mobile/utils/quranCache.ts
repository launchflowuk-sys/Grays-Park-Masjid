import AsyncStorage from "@react-native-async-storage/async-storage";

const CHAPTERS_KEY = "@grayspark/quranChapters";
const VERSES_KEY = (id: number) => `@grayspark/quranVerses_${id}`;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type Envelope<T> = { data: T; cachedAt: number };

async function load<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const env = JSON.parse(raw) as Envelope<T>;
    if (Date.now() - env.cachedAt > CACHE_TTL_MS) return null;
    return env.data;
  } catch {
    return null;
  }
}

async function save<T>(key: string, data: T): Promise<void> {
  try {
    const env: Envelope<T> = { data, cachedAt: Date.now() };
    await AsyncStorage.setItem(key, JSON.stringify(env));
  } catch {}
}

export const getCachedChapters = <T>() => load<T>(CHAPTERS_KEY);
export const setCachedChapters = <T>(data: T) => save<T>(CHAPTERS_KEY, data);
export const getCachedVerses = <T>(id: number) => load<T>(VERSES_KEY(id));
export const setCachedVerses = <T>(id: number, data: T) => save<T>(VERSES_KEY(id), data);
