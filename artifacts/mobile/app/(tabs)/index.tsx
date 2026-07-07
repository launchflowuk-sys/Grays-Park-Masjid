import { Ionicons } from "@expo/vector-icons";
import { useListPrayerTimesPublic } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useAudio } from "@/context/AudioContext";
import {
  formatDisplayDate,
  formatTime12,
  getCountdownToTime,
  getPrayerEntries,
  getTodayDateString,
  findNextPrayer,
  type PrayerEntry,
} from "@/utils/prayerUtils";

type PrayerTime = {
  id: string;
  date: string;
  fajrAdhan: string;
  fajrIqamah: string;
  sunrise: string;
  dhuhrAdhan: string;
  dhuhrIqamah: string;
  asrAdhan: string;
  asrIqamah: string;
  maghribAdhan: string;
  maghribIqamah: string;
  ishaAdhan: string;
  ishaIqamah: string;
};

async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

async function scheduleWeekNotifications(allTimes: PrayerTime[]): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const now = new Date();
    const sevenDays = now.getTime() + 7 * 24 * 60 * 60 * 1000;
    const todayStr = getTodayDateString();
    const relevant = allTimes.filter((pt) => {
      const d = new Date(pt.date + "T12:00:00").getTime();
      return d >= new Date(todayStr + "T00:00:00").getTime() && d <= sevenDays;
    });
    for (const pt of relevant) {
      const prayers = getPrayerEntries(pt);
      for (const prayer of prayers) {
        if (!prayer.adhan || prayer.name === "Sunrise") continue;
        const [h, m] = prayer.adhan.split(":").map(Number);
        const [y, mo, d] = pt.date.split("-").map(Number);
        const trigger = new Date(y, mo - 1, d, h, m, 0, 0);
        if (trigger > now) {
          const bodyMsg =
            prayer.name === "Fajr"
              ? "الصلاة خير من النوم — Prayer is better than sleep"
              : `Adhan for ${prayer.name} at Grays Park Masjid`;
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `${prayer.name} · ${prayer.label}`,
              body: bodyMsg,
              sound: true,
            },
            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger },
          });
        }
      }
    }
  } catch {}
}

export default function PrayerTimesScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const audio = useAudio();
  const [countdown, setCountdown] = useState("—");
  const [notifEnabled, setNotifEnabled] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { data: allTimes, isLoading, isError, refetch } = useListPrayerTimesPublic();

  const today = getTodayDateString();
  const allPrayerTimes = allTimes as PrayerTime[] | undefined;
  const todayPrayer = allPrayerTimes?.find((pt) => pt.date === today) ?? allPrayerTimes?.[0] ?? null;
  const prayers = todayPrayer ? getPrayerEntries(todayPrayer) : [];
  const nextInfo = prayers.length ? findNextPrayer(prayers) : null;

  useEffect(() => {
    if (!nextInfo) return;
    const timer = setInterval(() => {
      setCountdown(getCountdownToTime(nextInfo.prayer.adhan));
    }, 1000);
    setCountdown(getCountdownToTime(nextInfo.prayer.adhan));
    return () => clearInterval(timer);
  }, [nextInfo?.prayer.adhan]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  const toggleNotifications = async () => {
    if (notifEnabled) {
      if (Platform.OS !== "web") {
        await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
      }
      setNotifEnabled(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      const granted = await requestNotificationPermission();
      if (granted && allPrayerTimes?.length) {
        await scheduleWeekNotifications(allPrayerTimes);
        setNotifEnabled(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (!granted) {
        Alert.alert("Permission Required", "Enable notifications in Settings to receive Adhan reminders.");
      }
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const renderPrayer = ({ item, index }: { item: PrayerEntry; index: number }) => {
    const isNext = nextInfo?.index === index;
    const isSunrise = item.name === "Sunrise";
    return (
      <View
        style={[
          styles.prayerRow,
          {
            backgroundColor: isNext ? colors.primary : colors.card,
            borderColor: isNext ? colors.primary : colors.border,
          },
        ]}
      >
        <View style={styles.prayerLeft}>
          <Text style={[styles.prayerLabel, { color: isNext ? colors.accent : colors.mutedForeground }]}>
            {item.label}
          </Text>
          <Text style={[styles.prayerName, { color: isNext ? colors.primaryForeground : colors.foreground }]}>
            {item.name}
          </Text>
          {isNext && (
            <View style={[styles.nextBadge, { backgroundColor: colors.accent }]}>
              <Text style={[styles.nextBadgeText, { color: colors.primary }]}>Next</Text>
            </View>
          )}
        </View>
        <View style={styles.prayerTimes}>
          <View style={styles.prayerTimeCol}>
            <Text style={[styles.timeLabel, { color: isNext ? colors.primaryForeground + "99" : colors.mutedForeground }]}>
              Adhan
            </Text>
            <Text style={[styles.timeValue, { color: isNext ? colors.accent : colors.foreground }]}>
              {formatTime12(item.adhan)}
            </Text>
          </View>
          {!isSunrise && item.iqamah && (
            <View style={styles.prayerTimeCol}>
              <Text style={[styles.timeLabel, { color: isNext ? colors.primaryForeground + "99" : colors.mutedForeground }]}>
                Iqamah
              </Text>
              <Text style={[styles.timeValue, { color: isNext ? colors.primaryForeground : colors.foreground }]}>
                {formatTime12(item.iqamah)}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const ListHeader = () => (
    <View>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.primary }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.masjidName, { color: colors.primaryForeground, fontFamily: "PlayfairDisplay_700Bold" }]}>
              Grays Park Masjid
            </Text>
            <Text style={[styles.headerDate, { color: colors.accent }]}>
              {todayPrayer ? formatDisplayDate(todayPrayer.date) : new Date().toDateString()}
            </Text>
          </View>
          <TouchableOpacity onPress={toggleNotifications} style={styles.bellButton} testID="notif-toggle">
            <Ionicons
              name={notifEnabled ? "notifications" : "notifications-outline"}
              size={24}
              color={notifEnabled ? colors.accent : colors.primaryForeground}
            />
          </TouchableOpacity>
        </View>

        {nextInfo && (
          <Animated.View
            style={[styles.nextPrayerCard, { backgroundColor: colors.secondary, transform: [{ scale: pulseAnim }] }]}
          >
            <Text style={[styles.nextLabel, { color: colors.accent }]}>Next Prayer</Text>
            <Text style={[styles.nextPrayerName, { color: colors.primaryForeground, fontFamily: "PlayfairDisplay_700Bold" }]}>
              {nextInfo.prayer.name}
            </Text>
            <Text style={[styles.countdown, { color: colors.accent, fontFamily: "PlayfairDisplay_400Regular" }]}>
              {countdown}
            </Text>
            <Text style={[styles.nextTime, { color: colors.primaryForeground + "CC" }]}>
              {formatTime12(nextInfo.prayer.adhan)}
            </Text>
          </Animated.View>
        )}
        {!nextInfo && !isLoading && prayers.length > 0 && (
          <View style={[styles.nextPrayerCard, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.nextLabel, { color: colors.accent }]}>All prayers complete</Text>
            <Text style={[styles.nextPrayerName, { color: colors.primaryForeground, fontFamily: "PlayfairDisplay_700Bold" }]}>
              Alhamdulillah
            </Text>
          </View>
        )}

        {/* Live Radio bar */}
        <Pressable
          style={[styles.audioBar, { backgroundColor: colors.secondary, borderColor: colors.accent + "30" }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            audio.toggle();
          }}
          testID="audio-bar"
        >
          <Ionicons
            name={audio.isPlaying ? "pause-circle" : "play-circle-outline"}
            size={26}
            color={audio.isPlaying ? colors.accent : colors.primaryForeground}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.audioTitle, { color: audio.isPlaying ? colors.accent : colors.primaryForeground }]}>
              {audio.isLoading ? "Connecting…" : audio.isPlaying ? "Live Radio · Now Playing" : "Live Islamic Radio"}
            </Text>
            {audio.isPlaying && (
              <Text style={[styles.audioSub, { color: colors.primaryForeground + "80" }]}>Tap to stop</Text>
            )}
          </View>
          {audio.isLoading && <ActivityIndicator size="small" color={colors.accent} />}
        </Pressable>
      </View>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground, backgroundColor: colors.background }]}>
        Today's Prayer Times
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.centerFlex, { backgroundColor: colors.primary, paddingTop: topPad }]}>
        <ActivityIndicator color={colors.accent} size="large" />
        <Text style={[styles.loadingText, { color: colors.primaryForeground }]}>Loading prayer times…</Text>
      </View>
    );
  }

  if (isError || !allTimes) {
    return (
      <View style={[styles.centerFlex, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.mutedForeground} />
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Unable to load prayer times</Text>
        <TouchableOpacity onPress={() => refetch()} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
          <Text style={[styles.retryText, { color: colors.primaryForeground }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <FlatList
        data={prayers}
        keyExtractor={(item) => item.name}
        renderItem={renderPrayer}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
        scrollEnabled={!!prayers.length}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="moon-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No prayer times available for today
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centerFlex: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  masjidName: { fontSize: 22, fontWeight: "700", letterSpacing: 0.2 },
  headerDate: { fontSize: 13, marginTop: 3 },
  bellButton: { padding: 8, marginTop: -4 },
  nextPrayerCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 4,
    marginBottom: 14,
  },
  nextLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
  nextPrayerName: { fontSize: 32, fontWeight: "700" },
  countdown: { fontSize: 22, fontWeight: "500" },
  nextTime: { fontSize: 14, marginTop: 2 },
  audioBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  audioTitle: { fontSize: 14, fontWeight: "600" },
  audioSub: { fontSize: 11, marginTop: 2 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  prayerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  prayerLeft: { gap: 2 },
  prayerLabel: { fontSize: 18, fontWeight: "400" },
  prayerName: { fontSize: 17, fontWeight: "600" },
  nextBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  nextBadgeText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  prayerTimes: { flexDirection: "row", gap: 20 },
  prayerTimeCol: { alignItems: "flex-end" },
  timeLabel: { fontSize: 11, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5 },
  timeValue: { fontSize: 16, fontWeight: "600", marginTop: 2 },
  listContent: { paddingTop: 0 },
  emptyContainer: { alignItems: "center", paddingTop: 40, gap: 12 },
  emptyText: { fontSize: 15, textAlign: "center" },
  loadingText: { fontSize: 15, marginTop: 8 },
  errorText: { fontSize: 15 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { fontSize: 15, fontWeight: "600" },
});
