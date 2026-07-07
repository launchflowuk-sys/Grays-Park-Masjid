import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  return (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360;
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

type QiblaStatus =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "denied" }
  | { status: "ready"; qibla: number; deviceHeading: number; distance: number; city?: string }
  | { status: "error"; message: string };

const COMPASS_SIZE = 240;

export default function QiblaScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [state, setState] = useState<QiblaStatus>({ status: "idle" });
  const [showCalibration, setShowCalibration] = useState(false);
  const sensorSub = useRef<{ remove: () => void } | null>(null);
  const compassRot = useSharedValue(0);
  const currentAngle = useRef(0);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const compassStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${compassRot.value}deg` }],
  }));

  useEffect(() => {
    return () => {
      sensorSub.current?.remove();
    };
  }, []);

  function updateNeedle(qibla: number, deviceHeading: number) {
    const target = ((qibla - deviceHeading) + 360) % 360;
    let delta = target - currentAngle.current;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const next = currentAngle.current + delta;
    currentAngle.current = next;
    compassRot.value = withTiming(next, { duration: 150 });
  }

  async function startQibla() {
    setState({ status: "loading" });
    try {
      let lat: number, lng: number;
      if (Platform.OS === "web") {
        await new Promise<void>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation not available"));
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              lat = pos.coords.latitude;
              lng = pos.coords.longitude;
              resolve();
            },
            (err) => reject(err)
          );
        });
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setState({ status: "denied" });
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
      }

      const qibla = calculateQibla(lat, lng);
      const distance = haversineDistance(lat, lng, KAABA_LAT, KAABA_LNG);
      let city: string | undefined;

      if (Platform.OS !== "web") {
        try {
          const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
          city = place?.city ?? place?.district ?? undefined;
        } catch {}
      }

      setState({
        status: "ready",
        qibla,
        deviceHeading: 0,
        distance,
        city,
      });

      if (Platform.OS !== "web") {
        try {
          const { Magnetometer } = await import("expo-sensors");
          const isAvailable = await Magnetometer.isAvailableAsync();
          if (isAvailable) {
            Magnetometer.setUpdateInterval(100);
            sensorSub.current = Magnetometer.addListener((data) => {
              const heading = (-(Math.atan2(data.y, data.x) * (180 / Math.PI)) + 360) % 360;
              setState((prev) => {
                if (prev.status !== "ready") return prev;
                return { ...prev, deviceHeading: heading };
              });
              updateNeedle(qibla, heading);
            });
            setShowCalibration(true);
            setTimeout(() => setShowCalibration(false), 4000);
          } else {
            updateNeedle(qibla, 0);
          }
        } catch {
          updateNeedle(qibla, 0);
        }
      } else {
        updateNeedle(qibla, 0);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Location error";
      setState({ status: "error", message: msg });
    }
  }

  function resetQibla() {
    sensorSub.current?.remove();
    sensorSub.current = null;
    setState({ status: "idle" });
    compassRot.value = 0;
    currentAngle.current = 0;
  }

  const s = state;

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
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "PlayfairDisplay_700Bold" }]}>
            Qibla Direction
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            اتجاه القبلة · Direction of the Ka'bah
          </Text>
        </View>

        {/* Compass */}
        <View style={[styles.compassCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {(s.status === "idle" || s.status === "error" || s.status === "denied") && (
            <View style={styles.compassPlaceholder}>
              <MaterialCommunityIcons
                name="compass-outline"
                size={80}
                color={s.status === "error" || s.status === "denied" ? colors.mutedForeground : colors.primary + "50"}
              />
              {s.status === "idle" && (
                <Text style={[styles.placeholderText, { color: colors.mutedForeground }]}>
                  Tap below to find your Qibla
                </Text>
              )}
              {s.status === "denied" && (
                <Text style={[styles.placeholderText, { color: colors.mutedForeground }]}>
                  Location access is required
                </Text>
              )}
              {s.status === "error" && (
                <Text style={[styles.placeholderText, { color: colors.mutedForeground }]}>
                  {s.message}
                </Text>
              )}
            </View>
          )}

          {s.status === "loading" && (
            <View style={styles.compassPlaceholder}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={[styles.placeholderText, { color: colors.mutedForeground }]}>
                Getting your location…
              </Text>
            </View>
          )}

          {s.status === "ready" && (
            <View style={styles.compassReady}>
              {/* Compass ring */}
              <View style={[styles.compassRing, { borderColor: colors.border }]}>
                <View style={[styles.compassRingInner, { borderColor: colors.primary + "30" }]} />
                {["N", "E", "S", "W"].map((label, i) => {
                  const angle = i * 90;
                  const rad = ((angle - 90) * Math.PI) / 180;
                  const d = COMPASS_SIZE / 2 - 20;
                  const lx = COMPASS_SIZE / 2 + Math.cos(rad) * d;
                  const ly = COMPASS_SIZE / 2 + Math.sin(rad) * d;
                  return (
                    <Text
                      key={label}
                      style={[
                        styles.cardinalLabel,
                        {
                          color: label === "N" ? colors.destructive : colors.mutedForeground,
                          left: lx - 8,
                          top: ly - 10,
                        },
                      ]}
                    >
                      {label}
                    </Text>
                  );
                })}

                {/* Needle */}
                <Animated.View
                  style={[
                    styles.needleContainer,
                    { width: COMPASS_SIZE, height: COMPASS_SIZE },
                    compassStyle,
                  ]}
                >
                  <View style={styles.needleTip} />
                  <View style={[styles.needleBody, { backgroundColor: colors.accent }]} />
                  <View style={styles.needleTail} />
                  <View style={[styles.needleCenter, { backgroundColor: colors.primary, borderColor: colors.accent }]} />
                </Animated.View>

                {/* Kaaba icon at needle tip direction */}
                <View style={[styles.kaabaIcon, { backgroundColor: colors.primary }]}>
                  <Text style={styles.kaabaEmoji}>🕋</Text>
                </View>
              </View>

              <View style={styles.angleRow}>
                <View style={[styles.angleBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.angleDeg, { color: colors.accent }]}>
                    {Math.round(s.qibla)}°
                  </Text>
                  <Text style={[styles.angleLabel, { color: colors.primaryForeground + "AA" }]}>
                    from North
                  </Text>
                </View>
                <View style={[styles.distBadge, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.distValue, { color: colors.foreground }]}>
                    {s.distance.toLocaleString()}
                  </Text>
                  <Text style={[styles.distLabel, { color: colors.mutedForeground }]}>
                    km to Makkah
                  </Text>
                </View>
              </View>

              {s.city && (
                <Text style={[styles.cityText, { color: colors.mutedForeground }]}>
                  Calculated from {s.city}
                </Text>
              )}

              {showCalibration && (
                <View style={[styles.calibrationBar, { backgroundColor: colors.accent + "20", borderColor: colors.accent + "40" }]}>
                  <MaterialCommunityIcons name="gesture" size={18} color={colors.accent} />
                  <Text style={[styles.calibrationText, { color: colors.accent }]}>
                    Move your phone in a figure-8 to calibrate the compass
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          {(s.status === "idle" || s.status === "error" || s.status === "denied") && (
            <TouchableOpacity
              onPress={startQibla}
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              testID="qibla-find-btn"
            >
              <MaterialCommunityIcons name="compass" size={20} color={colors.accent} />
              <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>
                {s.status === "idle" ? "Find My Qibla" : "Try Again"}
              </Text>
            </TouchableOpacity>
          )}
          {s.status === "ready" && (
            <TouchableOpacity
              onPress={resetQibla}
              style={[styles.secondaryBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.secondaryBtnText, { color: colors.mutedForeground }]}>
                Reset
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Info card */}
        <View style={[styles.infoCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "25" }]}>
          <Text style={[styles.infoTitle, { color: colors.primary, fontFamily: "PlayfairDisplay_700Bold" }]}>
            About the Qibla
          </Text>
          <Text style={[styles.infoText, { color: colors.foreground }]}>
            The Qibla (قبلة) is the direction of the Masjid al-Haram in Makkah, Saudi Arabia. Muslims face the Qibla when performing Salah (prayer).
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { gap: 16 },
  title: { fontSize: 28, fontWeight: "700" },
  subtitle: { fontSize: 13, marginTop: 4 },
  compassCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    minHeight: 300,
  },
  compassPlaceholder: {
    height: 300,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 20,
  },
  placeholderText: { fontSize: 14, textAlign: "center" },
  compassReady: { alignItems: "center", padding: 24, gap: 16 },
  compassRing: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: COMPASS_SIZE / 2,
    borderWidth: 2,
    position: "relative",
  },
  compassRingInner: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    borderRadius: COMPASS_SIZE / 2,
    borderWidth: 1,
  },
  cardinalLabel: {
    position: "absolute",
    fontSize: 12,
    fontWeight: "700",
    width: 16,
    textAlign: "center",
  },
  needleContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  needleTip: {
    position: "absolute",
    top: COMPASS_SIZE * 0.1,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: COMPASS_SIZE * 0.38,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#C9A84C",
  },
  needleBody: {
    position: "absolute",
    top: COMPASS_SIZE * 0.5 - 2,
    width: 4,
    height: COMPASS_SIZE * 0.38,
  },
  needleTail: {
    position: "absolute",
    bottom: COMPASS_SIZE * 0.1,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: COMPASS_SIZE * 0.3,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#7AA893",
  },
  needleCenter: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  kaabaIcon: {
    position: "absolute",
    top: -18,
    left: COMPASS_SIZE / 2 - 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  kaabaEmoji: { fontSize: 16 },
  angleRow: { flexDirection: "row", gap: 12 },
  angleBadge: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  angleDeg: { fontSize: 22, fontWeight: "700" },
  angleLabel: { fontSize: 11, marginTop: 2 },
  distBadge: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  distValue: { fontSize: 22, fontWeight: "700" },
  distLabel: { fontSize: 11, marginTop: 2 },
  cityText: { fontSize: 13 },
  calibrationBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: "stretch",
  },
  calibrationText: { flex: 1, fontSize: 12, lineHeight: 16 },
  actions: { paddingHorizontal: 16, gap: 8 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  primaryBtnText: { fontSize: 17, fontWeight: "600" },
  secondaryBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  secondaryBtnText: { fontSize: 15 },
  infoCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  infoTitle: { fontSize: 16, fontWeight: "700" },
  infoText: { fontSize: 14, lineHeight: 20 },
});
