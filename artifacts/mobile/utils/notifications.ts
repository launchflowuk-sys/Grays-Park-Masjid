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

export async function requestAndRegisterPushToken(
  baseUrl: string,
): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return false;

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    const token = tokenData.data;
    const deviceId = await getOrCreateDeviceId();

    await fetch(`${baseUrl}/api/device-tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId, token, platform: Platform.OS }),
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
