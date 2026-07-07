import { Ionicons } from "@expo/vector-icons";
import { useListPrayerTimesPublic, useGetSettingPublic } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Switch,
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

const DEFAULT_ADHAN_URL =
  "https://cdn.prayertimes.net/audio/adhan-masjid-al-haram.mp3";
const DEFAULT_FAJR_ADHAN_URL =
  "https://cdn.prayertimes.net/audio/adhan-fajr-masjid-al-haram.mp3";

type ViewMode = "today" | "week";

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
      return (
        d >= new Date(todayStr + "T00:00:00").getTime() && d <= sevenDays
      );
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
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: trigger,
            },
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
  const [viewMode, setViewMode] = useState<ViewMode>("today");
  const [adhanPlaying, setAdhanPlaying] = useState(false);
  const [adhanPrayerName, setAdhanPrayerName] = useState("");
  const [useFajrForAll, setUseFajrForAll] = useState(false);
  const adhanSoundRef = useRef<unknown>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Site-setting adhan URL overrides (fallback gracefully if setting doesn't exist)
  const { data: adhanSetting } = useGetSettingPublic("adhan_audio_url");
  const { data: adhanFajrSetting } = useGetSettingPublic("adhan_fajr_audio_url");
  const regularAdhanUrl =
    (adhanSetting as { value?: string } | undefined)?.value ?? DEFAULT_ADHAN_URL;
  const fajrAdhanUrl =
    (adhanFajrSetting as { value?: string } | undefined)?.value ?? DEFAULT_FAJR_ADHAN_URL;

  const { data: allTimes, isLoading, isError, refetch } = useListPrayerTimesPublic();
  const allPrayerTimes = allTimes as PrayerTime[] | undefined;

  const today = getTodayDateString();
  const todayPrayer =
    allPrayerTimes?.find((pt) => pt.date === today) ?? allPrayerTimes?.[0] ?? null;
  const prayers = todayPrayer ? getPrayerEntries(todayPrayer) : [];
  const nextInfo = prayers.length ? findNextPrayer(prayers) : null;

  // Next 7 days for week view
  const weekDays = useMemo(() => {
    if (!allPrayerTimes) return [];
    const todayTs = new Date(today + "T00:00:00").getTime();
    const sevenDaysTs = todayTs + 7 * 24 * 60 * 60 * 1000;
    return allPrayerTimes
      .filter((pt) => {
        const d = new Date(pt.date + "T12:00:00").getTime();
        return d >= todayTs && d <= sevenDaysTs;
      })
      .slice(0, 7);
  }, [allPrayerTimes, today]);

  // Countdown timer
  useEffect(() => {
    if (!nextInfo) return;
    const timer = setInterval(() => {
      setCountdown(getCountdownToTime(nextInfo.prayer.adhan));
    }, 1000);
    setCountdown(getCountdownToTime(nextInfo.prayer.adhan));
    return () => clearInterval(timer);
  }, [nextInfo?.prayer.adhan]);

  // Pulse animation for next-prayer card
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  // ── Adhan functions ──────────────────────────────────────────────────────────
  const playAdhan = async (prayerName: string) => {
    if (Platform.OS === "web") return;
    try {
      if (adhanSoundRef.current) {
        const s = adhanSoundRef.current as {
          stopAsync: () => Promise<void>;
          unloadAsync: () => Promise<void>;
        };
        await s.stopAsync().catch(() => {});
        await s.unloadAsync().catch(() => {});
        adhanSoundRef.current = null;
      }
      const isFajr = prayerName === "Fajr" || useFajrForAll;
      const url = isFajr ? fajrAdhanUrl : regularAdhanUrl;
      const { Audio } = await import("expo-av");
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );
      adhanSoundRef.current = sound;
      setAdhanPlaying(true);
      setAdhanPrayerName(prayerName);
      sound.setOnPlaybackStatusUpdate((status: unknown) => {
        const st = status as { didJustFinish?: boolean; isLoaded?: boolean };
        if (st.isLoaded && st.didJustFinish) {
          adhanSoundRef.current = null;
          setAdhanPlaying(false);
        }
      });
    } catch {
      setAdhanPlaying(false);
    }
  };

  const stopAdhan = async () => {
    if (adhanSoundRef.current) {
      const s = adhanSoundRef.current as {
        stopAsync: () => Promise<void>;
        unloadAsync: () => Promise<void>;
      };
      await s.stopAsync().catch(() => {});
      await s.unloadAsync().catch(() => {});
      adhanSoundRef.current = null;
    }
    setAdhanPlaying(false);
  };

  // Notification received listener → play adhan in foreground
  useEffect(() => {
    if (Platform.OS === "web") return;
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const title = notification.request.content.title ?? "";
      const prayerName = title.split(" · ")[0];
      if (prayerName) playAdhan(prayerName);
    });
    return () => subscription.remove();
  }, [regularAdhanUrl, fajrAdhanUrl, useFajrForAll]);

  // Cleanup adhan on unmount
  useEffect(() => {
    return () => {
      if (adhanSoundRef.current) {
        const s = adhanSoundRef.current as {
          stopAsync: () => Promise<void>;
          unloadAsync: () => Promise<void>;
        };
        s.stopAsync().catch(() => {});
        s.unloadAsync().catch(() => {});
      }
    };
  }, []);
  // ────────────────────────────────────────────────────────────────────────────

  const toggleNotifications = async () => {
    if (notifEnabled) {
      if (Platform.OS !== "web")
        await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
      setNotifEnabled(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      const granted = await requestNotificationPermission();
      if (granted && allPrayerTimes?.length) {
        await scheduleWeekNotifications(allPrayerTimes);
        setNotifEnabled(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (!granted) {
        Alert.alert(
          "Permission Required",
          "Enable notifications in Settings to receive Adhan reminders."
        );
      }
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  // ── Prayer row (today view) ──────────────────────────────────────────────────
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

  // ── Week-day row ─────────────────────────────────────────────────────────────
  const renderWeekDay = ({ item }: { item: PrayerTime }) => {
    const dayPrayers = getPrayerEntries(item);
    const isToday = item.date === today;
    return (
      <View
        style={[
          styles.weekCard,
          {
            backgroundColor: isToday ? colors.primary + "12" : colors.card,
            borderColor: isToday ? colors.primary : colors.border,
          },
        ]}
      >
        <View style={[styles.weekDayHeader, { borderBottomColor: isToday ? colors.primary + "30" : colors.border }]}>
          <Text style={[styles.weekDayLabel, { color: isToday ? colors.primary : colors.mutedForeground, fontFamily: "PlayfairDisplay_700Bold" }]}>
            {isToday
              ? "Today"
              : new Date(item.date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
          </Text>
          {isToday && (
            <View style={[styles.todayPill, { backgroundColor: colors.primary }]}>
              <Text style={[styles.todayPillText, { color: colors.primaryForeground }]}>Today</Text>
            </View>
          )}
        </View>
        <View style={styles.weekPrayerGrid}>
          {dayPrayers.map((p) => (
            <View key={p.name} style={styles.weekPrayerItem}>
              <Text style={[styles.weekPrayerName, { color: colors.mutedForeground }]}>{p.name}</Text>
              <Text style={[styles.weekPrayerTime, { color: colors.foreground }]}>{formatTime12(p.adhan)}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // ── List header (shared) ─────────────────────────────────────────────────────
  const ListHeader = () => (
    <View>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.primary }]}>
        {/* Title row */}
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

        {/* Today/Week toggle */}
        <View style={[styles.viewToggle, { backgroundColor: colors.secondary }]}>
          {(["today", "week"] as ViewMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              onPress={() => {
                setViewMode(mode);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.viewToggleBtn,
                viewMode === mode && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.viewToggleTxt,
                  { color: viewMode === mode ? colors.primaryForeground : colors.primaryForeground + "80" },
                ]}
              >
                {mode === "today" ? "Today" : "Week Timetable"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Adhan now-playing banner */}
        {adhanPlaying && (
          <Pressable
            style={[styles.adhanBanner, { backgroundColor: colors.accent }]}
            onPress={stopAdhan}
            testID="adhan-banner"
          >
            <Ionicons name="musical-notes" size={18} color={colors.primary} />
            <Text style={[styles.adhanBannerText, { color: colors.primary }]}>
              {adhanPrayerName ? `Adhan — ${adhanPrayerName}` : "Adhan is playing"}
            </Text>
            <View style={styles.adhanStopPill}>
              <Ionicons name="stop-circle" size={16} color={colors.primary} />
              <Text style={[styles.adhanStopText, { color: colors.primary }]}>Stop</Text>
            </View>
          </Pressable>
        )}

        {/* Next prayer card (only in today view) */}
        {viewMode === "today" && nextInfo && (
          <Animated.View
            style={[
              styles.nextPrayerCard,
              { backgroundColor: colors.secondary, transform: [{ scale: pulseAnim }] },
            ]}
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
        {viewMode === "today" && !nextInfo && !isLoading && prayers.length > 0 && (
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

      {/* Adhan settings row (Fajr toggle) — shown below header */}
      {Platform.OS !== "web" && (
        <View style={[styles.adhanSettingsRow, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.adhanSettingLabel, { color: colors.foreground }]}>
              Use Fajr Adhan for all prayers
            </Text>
            <Text style={[styles.adhanSettingSubtext, { color: colors.mutedForeground }]}>
              Off: Fajr plays Fajr adhan, others play standard
            </Text>
          </View>
          <Switch
            value={useFajrForAll}
            onValueChange={setUseFajrForAll}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={useFajrForAll ? colors.accent : colors.muted}
            testID="fajr-toggle"
          />
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: colors.mutedForeground, backgroundColor: colors.background }]}>
        {viewMode === "today" ? "Today's Prayer Times" : "7-Day Timetable"}
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

  if (viewMode === "week") {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <FlatList
          data={weekDays}
          keyExtractor={(item) => item.date}
          renderItem={renderWeekDay}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No timetable available</Text>
            </View>
          }
        />
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
    marginBottom: 16,
  },
  masjidName: { fontSize: 22, fontWeight: "700", letterSpacing: 0.2 },
  headerDate: { fontSize: 13, marginTop: 3 },
  bellButton: { padding: 8, marginTop: -4 },
  viewToggle: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  viewToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: "center",
  },
  viewToggleTxt: { fontSize: 13, fontWeight: "600" },
  adhanBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  adhanBannerText: { flex: 1, fontSize: 14, fontWeight: "600" },
  adhanStopPill: { flexDirection: "row", alignItems: "center", gap: 4 },
  adhanStopText: { fontSize: 13, fontWeight: "700" },
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
  adhanSettingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  adhanSettingLabel: { fontSize: 14, fontWeight: "600" },
  adhanSettingSubtext: { fontSize: 12, marginTop: 2 },
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
  weekCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  weekDayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  weekDayLabel: { fontSize: 15, fontWeight: "600" },
  todayPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  todayPillText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  weekPrayerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  weekPrayerItem: {
    width: "30%",
    alignItems: "center",
    paddingVertical: 6,
    gap: 2,
  },
  weekPrayerName: { fontSize: 11, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.3 },
  weekPrayerTime: { fontSize: 15, fontWeight: "600" },
  listContent: { paddingTop: 0 },
  emptyContainer: { alignItems: "center", paddingTop: 40, gap: 12 },
  emptyText: { fontSize: 15, textAlign: "center" },
  loadingText: { fontSize: 15, marginTop: 8 },
  errorText: { fontSize: 15 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { fontSize: 15, fontWeight: "600" },
});
