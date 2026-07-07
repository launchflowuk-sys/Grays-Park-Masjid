import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MEMBER_ID_KEY = "@grayspark/memberId";
const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

const MEMBERSHIP_TYPES = ["individual", "family", "student", "senior"] as const;
type MembershipType = (typeof MEMBERSHIP_TYPES)[number];
const MEMBERSHIP_LABELS: Record<MembershipType, string> = {
  individual: "Individual",
  family: "Family",
  student: "Student",
  senior: "Senior",
};

export default function OnboardingSignup() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [membershipType, setMembershipType] = useState<MembershipType>("individual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const skip = () => router.push("/onboarding/permissions");

  const submit = async () => {
    setError("");
    if (!fullName.trim()) { setError("Please enter your full name."); return; }
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email address."); return; }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || null,
          membershipType,
        }),
      });

      if (res.ok) {
        const data = await res.json() as { id: string };
        await AsyncStorage.setItem(MEMBER_ID_KEY, data.id);
      }
    } catch {
      // Non-fatal: sign-up failure shouldn't block onboarding
    } finally {
      setLoading(false);
      router.push("/onboarding/permissions");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.eyebrow}>Optional</Text>
            <Text style={styles.title}>Join the Community</Text>
            <Text style={styles.subtitle}>
              Register as a member of Grays Park Masjid to receive updates and
              access member benefits. You can skip this step.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Abdullah Ali"
                placeholderTextColor="#5A8070"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#5A8070"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Phone Number (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="+44 7700 000000"
                placeholderTextColor="#5A8070"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Membership Type</Text>
              <View style={styles.chipRow}>
                {MEMBERSHIP_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.chip,
                      membershipType === type && styles.chipActive,
                    ]}
                    onPress={() => setMembershipType(type)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        membershipType === type && styles.chipTextActive,
                      ]}
                    >
                      {MEMBERSHIP_LABELS[type]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={submit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#1B3D2F" />
            ) : (
              <Text style={styles.primaryButtonText}>Continue</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={skip}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1B3D2F",
  },
  scroll: {
    padding: 28,
    paddingBottom: 8,
  },
  header: {
    gap: 8,
    marginBottom: 28,
  },
  eyebrow: {
    fontSize: 11,
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
  form: {
    gap: 20,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: "#A8C8B8",
    fontFamily: "Inter_500Medium",
  },
  input: {
    backgroundColor: "#2A5240",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#FAF8F3",
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#2A5240",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  chipActive: {
    backgroundColor: "#C9A84C",
    borderColor: "#C9A84C",
  },
  chipText: {
    fontSize: 13,
    color: "#A8C8B8",
    fontFamily: "Inter_500Medium",
  },
  chipTextActive: {
    color: "#1B3D2F",
    fontFamily: "Inter_600SemiBold",
  },
  errorText: {
    fontSize: 13,
    color: "#E8776A",
    fontFamily: "Inter_400Regular",
  },
  footer: {
    paddingHorizontal: 28,
    paddingBottom: Platform.OS === "android" ? 32 : 16,
    paddingTop: 12,
    gap: 12,
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
