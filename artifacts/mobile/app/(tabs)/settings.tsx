import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { updateNotificationCategories } from "@/utils/notifications";

const SETTINGS_KEY = "@grayspark/notifCategories";
const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

type NotifSettings = {
  announcements: boolean;
  events: boolean;
  blog: boolean;
};

const DEFAULT_SETTINGS: NotifSettings = {
  announcements: true,
  events: true,
  blog: true,
};

const CATEGORIES: { key: keyof NotifSettings; label: string; description: string; icon: keyof typeof Feather.glyphMap }[] = [
  {
    key: "announcements",
    label: "Announcements",
    description: "Important notices from the masjid",
    icon: "bell",
  },
  {
    key: "events",
    label: "Events",
    description: "Upcoming programmes and gatherings",
    icon: "calendar",
  },
  {
    key: "blog",
    label: "Blog & Articles",
    description: "New articles and Friday khutbahs",
    icon: "file-text",
  },
];

export default function NotificationSettingsScreen() {
  const [settings, setSettings] = useState<NotifSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY)
      .then((raw) => {
        if (raw) setSettings(JSON.parse(raw) as NotifSettings);
      })
      .finally(() => setLoaded(true));
  }, []);

  const toggle = async (key: keyof NotifSettings, value: boolean) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    setSaving(true);
    try {
      await updateNotificationCategories(BASE_URL, { [key]: value });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>App</Text>
        <Text style={styles.title}>Notification Settings</Text>
        <Text style={styles.subtitle}>
          Choose which updates you'd like to receive from Grays Park Masjid.
        </Text>
      </View>

      {!loaded ? (
        <View style={styles.loader}>
          <ActivityIndicator color="#C9A84C" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {CATEGORIES.map((cat) => (
            <View key={cat.key} style={styles.row}>
              <View style={styles.rowIcon}>
                <Feather name={cat.icon} size={18} color="#C9A84C" />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{cat.label}</Text>
                <Text style={styles.rowDesc}>{cat.description}</Text>
              </View>
              <Switch
                value={settings[cat.key]}
                onValueChange={(v) => toggle(cat.key, v)}
                trackColor={{ false: "#3A3A3A", true: "#2A5240" }}
                thumbColor={settings[cat.key] ? "#C9A84C" : "#888"}
                ios_backgroundColor="#3A3A3A"
              />
            </View>
          ))}

          {saving && (
            <View style={styles.savingRow}>
              <ActivityIndicator size="small" color="#7AA893" />
              <Text style={styles.savingText}>Saving…</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1B3D2F",
  },
  header: {
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  eyebrow: {
    fontSize: 11,
    color: "#C9A84C",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 24,
    color: "#FAF8F3",
    fontFamily: "PlayfairDisplay_700Bold",
  },
  subtitle: {
    fontSize: 13,
    color: "#A8C8B8",
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A5240",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#1B3D2F",
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 14,
    color: "#FAF8F3",
    fontFamily: "Inter_600SemiBold",
  },
  rowDesc: {
    fontSize: 12,
    color: "#A8C8B8",
    fontFamily: "Inter_400Regular",
  },
  savingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 4,
  },
  savingText: {
    fontSize: 12,
    color: "#7AA893",
    fontFamily: "Inter_400Regular",
  },
});
