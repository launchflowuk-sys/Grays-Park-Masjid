/**
 * Next-prayer Live Activity (Lock Screen + Dynamic Island).
 *
 * iOS 16.2+ only. The native module is absent on Android and web, and every
 * native function already no-ops below 16.2, so callers only need to guard on
 * `Platform.OS === "ios"` plus `areActivitiesEnabled()`.
 *
 * The countdown itself is rendered by SwiftUI's `Text(timerInterval:)` — the
 * activity does not need push updates, timers or background tasks. It only has
 * to be restarted when the next prayer changes.
 */
import { requireOptionalNativeModule } from "expo";
import { Platform } from "react-native";

export type PrayerActivityInput = {
  /** e.g. "Maghrib" */
  prayer: string;
  /** Pre-formatted adhan clock time, e.g. "8:05 PM". */
  adhan: string;
  /** Pre-formatted iqamah clock time, or null when none is published. */
  iqamah?: string | null;
  /** Adhan instant as epoch milliseconds. */
  endsAt: number;
};

type LiveActivityNativeModule = {
  areActivitiesEnabled(): boolean;
  startPrayerActivity(input: PrayerActivityInput): Promise<boolean>;
  updatePrayerActivity(input: PrayerActivityInput): Promise<boolean>;
  endPrayerActivity(): Promise<boolean>;
};

const nativeModule =
  Platform.OS === "ios"
    ? requireOptionalNativeModule<LiveActivityNativeModule>("LiveActivity")
    : null;

/** False whenever Live Activities are unsupported or switched off by the user. */
export function areActivitiesEnabled(): boolean {
  if (!nativeModule) return false;
  try {
    return nativeModule.areActivitiesEnabled();
  } catch {
    return false;
  }
}

/** Replaces any running prayer activity with one for `input`. */
export async function startPrayerActivity(
  input: PrayerActivityInput,
): Promise<boolean> {
  if (!nativeModule) return false;
  try {
    return await nativeModule.startPrayerActivity(input);
  } catch {
    return false;
  }
}

/**
 * Refreshes the running activity. Falls back to starting a new one when the
 * prayer changed (ActivityKit attributes are immutable) or none is running.
 */
export async function updatePrayerActivity(
  input: PrayerActivityInput,
): Promise<boolean> {
  if (!nativeModule) return false;
  try {
    return await nativeModule.updatePrayerActivity(input);
  } catch {
    return false;
  }
}

/** Dismisses any running prayer activity immediately. */
export async function endPrayerActivity(): Promise<boolean> {
  if (!nativeModule) return false;
  try {
    return await nativeModule.endPrayerActivity();
  } catch {
    return false;
  }
}
