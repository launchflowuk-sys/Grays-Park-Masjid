import Expo, { type ExpoPushMessage } from "expo-server-sdk";
import { db, deviceTokensTable, notificationBroadcastsTable } from "@workspace/db";

const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

export type PushCategory = "announcements" | "events" | "blog";

function resolveUrl(category: PushCategory, refId?: string): string {
  if (category === "blog" && refId) return `/blog/${refId}`;
  if (category === "events") return "/(tabs)/events";
  return "/(tabs)";
}

export async function broadcastPush(
  title: string,
  body: string,
  category: PushCategory,
  refId?: string,
): Promise<number> {
  const url = resolveUrl(category, refId);

  let allTokens: { token: string; categories: unknown }[] = [];
  try {
    allTokens = await db
      .select({ token: deviceTokensTable.token, categories: deviceTokensTable.categories })
      .from(deviceTokensTable);
  } catch (err) {
    console.error("[push] failed to fetch device tokens:", err);
    return 0;
  }

  const eligible = allTokens.filter((t) => {
    if (!Expo.isExpoPushToken(t.token)) return false;
    const cats = (t.categories as Record<string, boolean>) ?? {};
    return cats[category] !== false;
  });

  if (eligible.length === 0) return 0;

  const messages: ExpoPushMessage[] = eligible.map((t) => ({
    to: t.token,
    title,
    body,
    data: { category, refId: refId ?? null, url },
    sound: "default",
  }));

  const chunks = expo.chunkPushNotifications(messages);
  let sent = 0;
  for (const chunk of chunks) {
    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      sent += tickets.filter((t) => t.status === "ok").length;
    } catch (err) {
      console.error("[push] chunk send error:", err);
    }
  }

  try {
    await db.insert(notificationBroadcastsTable).values({
      title,
      body,
      category,
      refId: refId ?? null,
      sentCount: sent,
    });
  } catch (err) {
    console.error("[push] failed to log broadcast:", err);
  }

  return sent;
}
