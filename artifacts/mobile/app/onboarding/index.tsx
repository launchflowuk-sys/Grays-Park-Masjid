import { router } from "expo-router";
import React from "react";
import {
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height } = Dimensions.get("window");

export default function OnboardingWelcome() {
  return (
    <View style={styles.root}>
      <ImageBackground
        source={require("@/assets/images/splash-logo.png")}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.content}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>بِسْمِ ٱللَّٰهِ</Text>
          </View>

          <Text style={styles.title}>Grays Park{"\n"}Masjid</Text>

          <Text style={styles.subtitle}>
            Your companion for prayer times, Qur'an recitation, events, and
            community updates — right in your pocket.
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/onboarding/features")}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#1B3D2F" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 30, 22, 0.65)",
  },
  safe: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: height * 0.08,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(201,168,76,0.18)",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.4)",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 28,
  },
  badgeText: {
    color: "#C9A84C",
    fontSize: 18,
    fontFamily: "PlayfairDisplay_400Regular",
  },
  title: {
    color: "#FAF8F3",
    fontSize: 52,
    fontFamily: "PlayfairDisplay_700Bold",
    lineHeight: 60,
    marginBottom: 24,
  },
  subtitle: {
    color: "rgba(250,248,243,0.75)",
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  button: {
    backgroundColor: "#C9A84C",
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
  },
  buttonText: {
    color: "#1B3D2F",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
});
