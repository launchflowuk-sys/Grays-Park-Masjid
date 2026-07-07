import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { requestAndRegisterPushToken } from "@/utils/notifications";

const ONBOARDED_KEY = "@grayspark/onboarded";
const MEMBER_ID_KEY = "@grayspark/memberId";

export default function OnboardingPermissions() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(MEMBER_ID_KEY).then((id) => setMemberId(id));
  }, []);

  const complete = async () => {
    await AsyncStorage.setItem(ONBOARDED_KEY, "true");
    router.replace("/(tabs)");
  };

  const handleEnable = async () => {
    setLoading(true);
    try {
      const baseUrl = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
      await requestAndRegisterPushToken(baseUrl, memberId);
    } finally {
      setLoading(false);
      await complete();
    }
  };

  const handleSkip = async () => {
    await complete();
  };

  const BENEFITS = [
    { icon: "clock", text: "Prayer time reminders" },
    { icon: "calendar", text: "Upcoming event alerts" },
    { icon: "bell", text: "Masjid announcements" },
  ] as const;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.body}>
        <View style={styles.iconRing}>
          <Feather name="bell" size={40} color="#C9A84C" />
        </View>

        <Text style={styles.title}>Stay Connected</Text>
        <Text style={styles.subtitle}>
          Enable notifications to receive timely updates from Grays Park Masjid.
        </Text>

        <View style={styles.benefitsList}>
          {BENEFITS.map((b) => (
            <View key={b.icon} style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Feather name={b.icon} size={16} color="#C9A84C" />
              </View>
              <Text style={styles.benefitText}>{b.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleEnable}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#1B3D2F" />
          ) : (
            <Text style={styles.primaryButtonText}>Enable Notifications</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1B3D2F",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingBottom: Platform.OS === "android" ? 32 : 16,
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  iconRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#2A5240",
    borderWidth: 2,
    borderColor: "#C9A84C33",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    color: "#FAF8F3",
    fontFamily: "PlayfairDisplay_700Bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#A8C8B8",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  benefitsList: {
    width: "100%",
    gap: 12,
    marginTop: 8,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#2A5240",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#1B3D2F",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: {
    fontSize: 14,
    color: "#FAF8F3",
    fontFamily: "Inter_500Medium",
  },
  footer: {
    gap: 12,
    paddingTop: 8,
  },
  primaryButton: {
    backgroundColor: "#C9A84C",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#C9A84C",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    color: "#1B3D2F",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 14,
    color: "#7AA893",
    fontFamily: "Inter_400Regular",
  },
});
