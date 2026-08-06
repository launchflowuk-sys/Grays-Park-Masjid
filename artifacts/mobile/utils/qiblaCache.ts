import AsyncStorage from "@react-native-async-storage/async-storage";

const QIBLA_FIX_KEY = "@grayspark/qibla-fix-v1";

export interface QiblaFix {
  lat: number;
  lng: number;
  /** Reverse-geocoded town/region for this position, when one was resolved. */
  place?: string;
  savedAt: number;
}

function isValidFix(value: unknown): value is QiblaFix {
  if (typeof value !== "object" || value === null) return false;
  const fix = value as Partial<QiblaFix>;
  return (
    typeof fix.lat === "number" &&
    Number.isFinite(fix.lat) &&
    Math.abs(fix.lat) <= 90 &&
    typeof fix.lng === "number" &&
    Number.isFinite(fix.lng) &&
    Math.abs(fix.lng) <= 180 &&
    typeof fix.savedAt === "number"
  );
}

/**
 * Reads the last position the Qibla was calculated from.
 *
 * Deliberately has no TTL. The Qibla bearing moves by well under a degree
 * across a whole town, so yesterday's fix draws a compass that is right to the
 * eye — and showing it instantly is the difference between a screen that feels
 * alive on open and one that makes the user wait. A fresher fix always
 * overwrites it moments later.
 */
export async function getCachedQiblaFix(): Promise<QiblaFix | null> {
  try {
    const raw = await AsyncStorage.getItem(QIBLA_FIX_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValidFix(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function setCachedQiblaFix(
  fix: Omit<QiblaFix, "savedAt">
): Promise<void> {
  try {
    const envelope: QiblaFix = { ...fix, savedAt: Date.now() };
    await AsyncStorage.setItem(QIBLA_FIX_KEY, JSON.stringify(envelope));
  } catch {}
}
