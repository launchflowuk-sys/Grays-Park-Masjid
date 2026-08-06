import AsyncStorage from "@react-native-async-storage/async-storage";

const PRAYER_TIMES_KEY = "@grayspark/prayer-times-cache-v1";

type Envelope<T> = { data: T; cachedAt: number };

/**
 * Reads the saved prayer timetable.
 *
 * Deliberately has no TTL: the published timetable covers months ahead and
 * stale times are always better than a dead-end error screen. Callers decide
 * how to present staleness to the user.
 */
export async function getCachedPrayerTimes<T>(): Promise<Envelope<T> | null> {
  try {
    const raw = await AsyncStorage.getItem(PRAYER_TIMES_KEY);
    if (!raw) return null;
    const env = JSON.parse(raw) as Envelope<T>;
    if (!env || typeof env.cachedAt !== "number" || env.data == null) return null;
    return env;
  } catch {
    return null;
  }
}

export async function setCachedPrayerTimes<T>(data: T): Promise<void> {
  try {
    const env: Envelope<T> = { data, cachedAt: Date.now() };
    await AsyncStorage.setItem(PRAYER_TIMES_KEY, JSON.stringify(env));
  } catch {}
}
