import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FEATURES = [
  {
    icon: <MaterialCommunityIcons name="mosque" size={26} color="#C9A84C" />,
    title: "Prayer Times",
    description: "Accurate daily prayer times and adhan alerts for Grays Park Masjid.",
  },
  {
    icon: <Feather name="book-open" size={24} color="#C9A84C" />,
    title: "Qur'an",
    description: "Read and listen to all 114 surahs with translations and audio recitation.",
  },
  {
    icon: <Feather name="calendar" size={24} color="#C9A84C" />,
    title: "Events",
    description: "Stay informed about upcoming programmes, talks, and community gatherings.",
  },
  {
    icon: <Feather name="file-text" size={24} color="#C9A84C" />,
    title: "Blog & Announcements",
    description: "Articles, Friday khutbahs, and important notices from the masjid.",
  },
] as const;

export default function OnboardingFeatures() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.eyebrow}>What's inside</Text>
        <Text style={styles.title}>Everything you need</Text>
        <Text style={styles.subtitle}>
          One app for staying connected to the masjid and your deen.
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {FEATURES.map((f) => (
          <View key={f.title} style={styles.featureCard}>
            <View style={styles.iconContainer}>{f.icon}</View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDescription}>{f.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/onboarding/signup")}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1B3D2F",
    paddingBottom: Platform.OS === "android" ? 32 : 16,
  },
  header: {
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 8,
    gap: 6,
  },
  eyebrow: {
    fontSize: 12,
    color: "#C9A84C",
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 28,
    color: "#FAF8F3",
    fontFamily: "PlayfairDisplay_700Bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#A8C8B8",
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  featureCard: {
    flexDirection: "row",
    backgroundColor: "#2A5240",
    borderRadius: 14,
    padding: 18,
    gap: 16,
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1B3D2F",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontSize: 15,
    color: "#FAF8F3",
    fontFamily: "Inter_600SemiBold",
  },
  featureDescription: {
    fontSize: 13,
    color: "#A8C8B8",
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 32,
    paddingTop: 12,
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
});
