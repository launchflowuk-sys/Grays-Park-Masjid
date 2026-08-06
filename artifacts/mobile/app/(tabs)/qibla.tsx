import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IslamicPatternBg } from "@/components/IslamicPatternBg";
import { QiblaCompass } from "@/components/QiblaCompass";
import { useColors } from "@/hooks/useColors";
import { useQiblaCompass, type QiblaReading } from "@/hooks/useQiblaCompass";
import { bearingToCardinal, formatWhole, kmToMiles } from "@/utils/qibla";

/**
 * The dial is tipped back in 3D, so it projects to roughly three-quarters of
 * `size` in height. It is drawn a little larger than a flat dial would be to
 * keep the same visual weight on screen.
 */
const MAX_COMPASS_SIZE = 340;
const COMPASS_MARGIN = 48;

type Tone = "gold" | "plain" | "muted";

interface Guidance {
  text: string;
  tone: Tone;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

/**
 * The single line under the dial that tells the user what to do next.
 *
 * Honesty first: while the compass is starting, calibrating or missing we say
 * so rather than implying the dial is trustworthy.
 */
function describeReading(reading: QiblaReading, hasBearing: boolean): Guidance | null {
  if (!hasBearing) return null;
  if (reading.status === "unavailable") {
    return {
      text: "No compass on this device — bearing only",
      tone: "muted",
      icon: "compass-off-outline",
    };
  }
  if (reading.status === "starting") {
    return { text: "Finding north…", tone: "muted", icon: "compass-outline" };
  }
  if (reading.status === "calibrating") {
    return { text: "Calibrating…", tone: "muted", icon: "sync" };
  }
  if (reading.aligned) {
    return { text: "Facing the Qibla", tone: "gold", icon: "check-circle" };
  }
  if (reading.offset === null) {
    return { text: "Finding north…", tone: "muted", icon: "compass-outline" };
  }
  const clockwise = reading.offset > 0;
  return {
    text: `Turn ${Math.abs(reading.offset)}° ${clockwise ? "right" : "left"}`,
    tone: "plain",
    icon: clockwise ? "rotate-right" : "rotate-left",
  };
}

export default function QiblaScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { width } = useWindowDimensions();
  const { headingAnim, location, reading, retry } = useQiblaCompass();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const compassSize = Math.min(width - COMPASS_MARGIN, MAX_COMPASS_SIZE);

  const bearing = location.bearing ?? null;
  const confident = reading.status === "live";
  const guidance: Guidance | null =
    bearing === null && location.phase === "locating"
      ? { text: "Finding your location…", tone: "muted", icon: "crosshairs-gps" }
      : describeReading(reading, bearing !== null);

  const surface = colors.primaryForeground + "0F";
  const hairline = colors.primaryForeground + "24";
  const softText = colors.primaryForeground + "AA";

  const guidanceColor =
    guidance?.tone === "gold"
      ? colors.accent
      : guidance?.tone === "muted"
        ? softText
        : colors.primaryForeground;

  return (
    <View style={[styles.flex, { backgroundColor: colors.primary }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <IslamicPatternBg
        color={colors.primaryForeground}
        patternOpacity={0.05}
        shimmer={false}
        animatePattern={false}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 12, paddingBottom: insets.bottom + 96 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Title ── */}
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              { color: colors.primaryForeground, fontFamily: "PlayfairDisplay_700Bold" },
            ]}
          >
            Qibla Direction
          </Text>
          <Text style={[styles.subtitle, { color: colors.accent }]}>
            اتجاه القبلة · Direction of the Ka'bah
          </Text>
        </View>

        {/* ── Compass ── */}
        <View style={styles.compassWrap}>
          <QiblaCompass
            size={compassSize}
            headingAnim={headingAnim}
            bearing={bearing}
            aligned={reading.aligned}
            confident={confident}
          />
        </View>

        {/* ── What to do next ── */}
        {guidance && (
          <View
            style={[
              styles.guidance,
              {
                backgroundColor:
                  guidance.tone === "gold" ? colors.accent + "22" : surface,
                borderColor: guidance.tone === "gold" ? colors.accent + "66" : hairline,
              },
            ]}
          >
            <MaterialCommunityIcons name={guidance.icon} size={18} color={guidanceColor} />
            <Text style={[styles.guidanceText, { color: guidanceColor }]}>
              {guidance.text}
            </Text>
          </View>
        )}

        {/* ── Numbers ── */}
        {bearing !== null && (
          <View style={styles.statRow}>
            <View style={[styles.stat, { backgroundColor: surface, borderColor: hairline }]}>
              <Text style={[styles.statValue, { color: colors.accent }]}>
                {Math.round(bearing)}° {bearingToCardinal(bearing)}
              </Text>
              <Text style={[styles.statLabel, { color: softText }]}>
                from {reading.trueNorth ? "true" : "magnetic"} north
              </Text>
            </View>
            {location.distanceKm != null && (
              <View style={[styles.stat, { backgroundColor: surface, borderColor: hairline }]}>
                <Text style={[styles.statValue, { color: colors.primaryForeground }]}>
                  {formatWhole(location.distanceKm)} km
                </Text>
                <Text style={[styles.statLabel, { color: softText }]}>
                  {formatWhole(kmToMiles(location.distanceKm))} miles to Makkah
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── Where the bearing came from ── */}
        {bearing !== null && (
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={14} color={softText} />
            <Text style={[styles.metaText, { color: softText }]}>
              {location.place ?? "Your current location"}
              {location.quality === "cached" && " · last known position"}
              {location.quality === "coarse" && " · refining"}
            </Text>
            <TouchableOpacity onPress={retry} hitSlop={8}>
              <Text style={[styles.metaAction, { color: colors.accent }]}>Update</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Calibration hint ── */}
        {reading.status === "calibrating" && (
          <View
            style={[
              styles.note,
              { backgroundColor: colors.accent + "18", borderColor: colors.accent + "3A" },
            ]}
          >
            <MaterialCommunityIcons name="gesture" size={18} color={colors.accent} />
            <Text style={[styles.noteText, { color: colors.accent }]}>
              Move your phone in a figure-8 a few times to calibrate the compass. Keep it
              away from magnets and metal.
            </Text>
          </View>
        )}

        {/* ── Magnetic north disclosure ── */}
        {confident && !reading.trueNorth && (
          <View style={[styles.note, { backgroundColor: surface, borderColor: hairline }]}>
            <MaterialCommunityIcons name="magnet" size={18} color={softText} />
            <Text style={[styles.noteText, { color: softText }]}>
              Using magnetic north — your device couldn't correct for magnetic declination
              here, so the reading may be a few degrees out.
            </Text>
          </View>
        )}

        {/* ── No compass hardware ── */}
        {reading.status === "unavailable" && bearing !== null && (
          <View style={[styles.note, { backgroundColor: surface, borderColor: hairline }]}>
            <MaterialCommunityIcons name="information-outline" size={18} color={softText} />
            <Text style={[styles.noteText, { color: softText }]}>
              This device has no usable compass. The bearing above is still correct — line it
              up with a separate compass or a map.
            </Text>
          </View>
        )}

        {/* ── Permission needed ── */}
        {location.phase === "denied" && (
          <View style={[styles.card, { backgroundColor: surface, borderColor: hairline }]}>
            <MaterialCommunityIcons
              name="map-marker-off-outline"
              size={28}
              color={colors.accent}
            />
            <Text style={[styles.cardTitle, { color: colors.primaryForeground }]}>
              Location access is off
            </Text>
            <Text style={[styles.cardBody, { color: softText }]}>
              We need your location to work out the direction of the Ka'bah from where you
              are. It is only used on this device.
            </Text>
            <TouchableOpacity
              onPress={() => {
                Linking.openSettings().catch(() => {});
              }}
              style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
              accessibilityRole="button"
            >
              <Text style={[styles.primaryBtnText, { color: colors.accentForeground }]}>
                Enable location
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Couldn't get a fix ── */}
        {location.phase === "unavailable" && (
          <View style={[styles.card, { backgroundColor: surface, borderColor: hairline }]}>
            <MaterialCommunityIcons name="crosshairs-off" size={28} color={colors.accent} />
            <Text style={[styles.cardTitle, { color: colors.primaryForeground }]}>
              Couldn't find your location
            </Text>
            <Text style={[styles.cardBody, { color: softText }]}>{location.message}</Text>
            <TouchableOpacity
              onPress={retry}
              style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
              accessibilityRole="button"
            >
              <Text style={[styles.primaryBtnText, { color: colors.accentForeground }]}>
                Try again
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── About ── */}
        <View style={[styles.card, { backgroundColor: surface, borderColor: hairline }]}>
          <Text
            style={[
              styles.cardTitle,
              { color: colors.accent, fontFamily: "PlayfairDisplay_700Bold" },
            ]}
          >
            About the Qibla
          </Text>
          <Text style={[styles.cardBody, { color: softText }]}>
            The Qibla (قبلة) is the direction of the Masjid al-Haram in Makkah, which Muslims
            face during Salah. The dial shows the great-circle bearing — the shortest path
            across the surface of the Earth — from your position to the Ka'bah.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { gap: 14, paddingHorizontal: 16 },
  header: { alignItems: "center", gap: 4 },
  title: { fontSize: 28, fontWeight: "700" },
  subtitle: { fontSize: 13 },
  compassWrap: { alignItems: "center", paddingVertical: 2 },
  guidance: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
  },
  guidanceText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  statRow: { flexDirection: "row", gap: 12 },
  stat: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 3,
  },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, textAlign: "center" },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  metaText: { fontSize: 12 },
  metaAction: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  noteText: { flex: 1, fontSize: 12, lineHeight: 17 },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    alignItems: "flex-start",
  },
  cardTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  cardBody: { fontSize: 13, lineHeight: 19 },
  primaryBtn: {
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: "stretch",
    alignItems: "center",
  },
  primaryBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
