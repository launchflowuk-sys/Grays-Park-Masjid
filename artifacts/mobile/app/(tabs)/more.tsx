import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CompassSvg } from "@/components/IslamicPattern";
import { useAudio } from "@/context/AudioContext";
import { useColors } from "@/hooks/useColors";

const KAABA_LAT = 21.3891;
const KAABA_LNG = 39.8579;

function calculateQibla(lat: number, lng: number): number {
  const dLng = (KAABA_LNG - lng) * (Math.PI / 180);
  const lat1 = lat * (Math.PI / 180);
  const lat2 = KAABA_LAT * (Math.PI / 180);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const bearing = Math.atan2(y, x) * (180 / Math.PI);
  return (bearing + 360) % 360;
}

type QiblaState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "denied" }
  | { status: "ready"; qibla: number; city?: string }
  | { status: "error"; message: string };

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const router = useRouter();
  const audio = useAudio();
  const [qibla, setQibla] = useState<QiblaState>({ status: "idle" });
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  async function findQibla() {
    setQibla({ status: "loading" });
    try {
      if (Platform.OS === "web") {
        if (!navigator.geolocation) {
          setQibla({ status: "error", message: "Geolocation not available" });
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const angle = calculateQibla(pos.coords.latitude, pos.coords.longitude);
            setQibla({ status: "ready", qibla: angle });
          },
          () => setQibla({ status: "denied" })
        );
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setQibla({ status: "denied" });
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const angle = calculateQibla(loc.coords.latitude, loc.coords.longitude);
      const [place] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      setQibla({
        status: "ready",
        qibla: angle,
        city: place?.city ?? place?.district ?? undefined,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Location error";
      setQibla({ status: "error", message: msg });
    }
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 12, paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.screenTitle, { color: colors.foreground, fontFamily: "PlayfairDisplay_700Bold", paddingHorizontal: 20 }]}>
          More
        </Text>

        {/* Live Audio Section */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.primary + "15" }]}>
              <Ionicons name="radio-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "PlayfairDisplay_700Bold" }]}>
                Live Islamic Radio
              </Text>
              <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
                Stream 24/7 Qur'an recitation
              </Text>
            </View>
          </View>

          <View style={[styles.audioPlayer, { backgroundColor: colors.primary }]}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="disc-outline" size={36} color={colors.accent} />
            </Animated.View>
            <View style={styles.audioInfo}>
              <Text style={[styles.audioTitle, { color: colors.primaryForeground }]}>
                Islamic Radio
              </Text>
              <Text style={[styles.audioStatus, { color: audio.isPlaying ? colors.accent : colors.primaryForeground + "88" }]}>
                {audio.isLoading ? "Connecting…" : audio.isPlaying ? "Live · Playing" : "Tap to play"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                await audio.toggle();
              }}
              style={[styles.playButton, { backgroundColor: colors.accent }]}
              testID="audio-play-btn"
              disabled={audio.isLoading}
            >
              {audio.isLoading ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Ionicons
                  name={audio.isPlaying ? "pause" : "play"}
                  size={24}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Qibla Compass Section */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.accent + "15" }]}>
              <MaterialCommunityIcons name="compass-outline" size={20} color={colors.accent} />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "PlayfairDisplay_700Bold" }]}>
                Qibla Direction
              </Text>
              <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>
                Find the direction of the Ka'bah
              </Text>
            </View>
          </View>

          {qibla.status === "idle" && (
            <TouchableOpacity
              onPress={findQibla}
              style={[styles.qiblaButton, { backgroundColor: colors.primary }]}
              testID="qibla-find-btn"
            >
              <Ionicons name="location-outline" size={18} color={colors.primaryForeground} />
              <Text style={[styles.qiblaButtonText, { color: colors.primaryForeground }]}>
                Find My Qibla
              </Text>
            </TouchableOpacity>
          )}

          {qibla.status === "loading" && (
            <View style={styles.qiblaCenter}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.qiblaStatusText, { color: colors.mutedForeground }]}>
                Getting your location…
              </Text>
            </View>
          )}

          {qibla.status === "denied" && (
            <View style={styles.qiblaCenter}>
              <Ionicons name="location-off-outline" size={36} color={colors.mutedForeground} />
              <Text style={[styles.qiblaStatusText, { color: colors.mutedForeground }]}>
                Location permission required
              </Text>
              <TouchableOpacity onPress={findQibla} style={[styles.qiblaSmallBtn, { borderColor: colors.primary }]}>
                <Text style={[styles.qiblaSmallBtnText, { color: colors.primary }]}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {(qibla.status === "error") && (
            <View style={styles.qiblaCenter}>
              <Ionicons name="alert-circle-outline" size={36} color={colors.mutedForeground} />
              <Text style={[styles.qiblaStatusText, { color: colors.mutedForeground }]}>
                {qibla.message}
              </Text>
              <TouchableOpacity onPress={findQibla} style={[styles.qiblaSmallBtn, { borderColor: colors.primary }]}>
                <Text style={[styles.qiblaSmallBtnText, { color: colors.primary }]}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {qibla.status === "ready" && (
            <View style={styles.compassContainer}>
              {qibla.city && (
                <Text style={[styles.compassCity, { color: colors.mutedForeground }]}>
                  From {qibla.city}
                </Text>
              )}
              <CompassSvg
                size={220}
                qiblaAngle={qibla.qibla}
                primaryColor={colors.primary}
                accentColor={colors.accent}
              />
              <View style={[styles.qiblaAngleBadge, { backgroundColor: colors.primary }]}>
                <Text style={[styles.qiblaAngleDeg, { color: colors.accent }]}>
                  {Math.round(qibla.qibla)}°
                </Text>
                <Text style={[styles.qiblaAngleLabel, { color: colors.primaryForeground + "CC" }]}>
                  from North
                </Text>
              </View>
              <TouchableOpacity onPress={findQibla} style={[styles.qiblaSmallBtn, { borderColor: colors.border, marginTop: 8 }]}>
                <Text style={[styles.qiblaSmallBtnText, { color: colors.mutedForeground }]}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Links */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "PlayfairDisplay_700Bold", marginBottom: 12 }]}>
            Grays Park Masjid
          </Text>

          {[
            { icon: "home-outline" as const, label: "Visit Website", action: () => {} },
            { icon: "mail-outline" as const, label: "Contact Us", action: () => {} },
            { icon: "people-outline" as const, label: "About", action: () => {} },
          ].map((item) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.linkRow,
                { borderBottomColor: colors.border, backgroundColor: pressed ? colors.muted : "transparent" },
              ]}
              onPress={item.action}
            >
              <View style={[styles.linkIcon, { backgroundColor: colors.muted }]}>
                <Ionicons name={item.icon} size={18} color={colors.primary} />
              </View>
              <Text style={[styles.linkLabel, { color: colors.foreground }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: 20 },
  screenTitle: { fontSize: 28, fontWeight: "700", marginBottom: 20 },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    padding: 16,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  sectionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  sectionHeaderText: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  sectionSub: { fontSize: 12, marginTop: 1 },
  audioPlayer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 12,
  },
  audioInfo: { flex: 1 },
  audioTitle: { fontSize: 15, fontWeight: "600" },
  audioStatus: { fontSize: 12, marginTop: 2 },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  qiblaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  qiblaButtonText: { fontSize: 16, fontWeight: "600" },
  qiblaCenter: { alignItems: "center", gap: 10, paddingVertical: 20 },
  qiblaStatusText: { fontSize: 14, textAlign: "center" },
  qiblaSmallBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  qiblaSmallBtnText: { fontSize: 14, fontWeight: "500" },
  compassContainer: { alignItems: "center", gap: 8 },
  compassCity: { fontSize: 13 },
  qiblaAngleBadge: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, alignItems: "center" },
  qiblaAngleDeg: { fontSize: 20, fontWeight: "700" },
  qiblaAngleLabel: { fontSize: 11, marginTop: 2 },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  linkIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  linkLabel: { flex: 1, fontSize: 15 },
});
