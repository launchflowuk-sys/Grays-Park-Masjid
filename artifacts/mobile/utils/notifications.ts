import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const DEVICE_ID_KEY = "@grayspark/deviceId";

export async function getOrCreateDeviceId(): Promise<string> {
  let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

// UUID v4 pattern — Expo push token registration requires a valid project UUID.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function requestAndRegisterPushToken(
  baseUrl: string,
  memberId?: string | null,
): Promise<boolean> {
  // Skip silently when no valid EAS project ID is configured.
  // This is expected during development before the app is registered on EAS.
  const projectId = process.env.EXPO_PUBLIC_PROJECT_ID ?? "";
  if (!UUID_RE.test(projectId)) {
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return false;

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;
    const deviceId = await getOrCreateDeviceId();

    await fetch(`${baseUrl}/api/device-tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId,
        token,
        platform: Platform.OS,
        ...(memberId ? { memberId } : {}),
      }),
    });

    return true;
  } catch (err) {
    console.error("[notifications] registration failed:", err);
    return false;
  }
}

export async function updateNotificationCategories(
  baseUrl: string,
  categories: { announcements?: boolean; events?: boolean; blog?: boolean },
): Promise<void> {
  try {
    const deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) return;
    await fetch(`${baseUrl}/api/device-tokens/${encodeURIComponent(deviceId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categories }),
    });
  } catch (err) {
    console.error("[notifications] category update failed:", err);
  }
}
