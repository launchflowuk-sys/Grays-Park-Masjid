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
import { requestAndRegisterPushToken } from "@/utils/notifications";
import { IslamicPatternBg } from "@/components/IslamicPatternBg";
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
  jummahKhutbah?: string;
  jummahIqamah?: string;
};

const ORDINALS = ["1st", "2nd", "3rd", "4th"];

const DEFAULT_ADHAN_URL =
  "https://cdn.prayertimes.net/audio/adhan-masjid-al-haram.mp3";
const DEFAULT_FAJR_ADHAN_URL =
  "https://cdn.prayertimes.net/audio/adhan-fajr-masjid-al-haram.mp3";
const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN ?? ""}`;

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
  const { data: jummahTimesSetting } = useGetSettingPublic("jummah_times");
  const { data: eidFitrDateSetting } = useGetSettingPublic("eid_al_fitr_date");
  const { data: eidFitrTimesSetting } = useGetSettingPublic("eid_al_fitr_times");
  const { data: eidAdhaDateSetting } = useGetSettingPublic("eid_al_adha_date");
  const { data: eidAdhaTimesSetting } = useGetSettingPublic("eid_al_adha_times");
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

  const isTodayFriday = new Date(today + "T12:00:00").getDay() === 5;

  const jummahTimes = useMemo(() => {
    try {
      const v = (jummahTimesSetting as { value?: string } | undefined)?.value;
      return v ? (JSON.parse(v) as string[]) : [];
    } catch { return []; }
  }, [jummahTimesSetting]);

  const eidFitrDate = (eidFitrDateSetting as { value?: string } | undefined)?.value ?? "";
  const eidAdhaDate = (eidAdhaDateSetting as { value?: string } | undefined)?.value ?? "";

  const eidFitrTimes = useMemo(() => {
    try {
      const v = (eidFitrTimesSetting as { value?: string } | undefined)?.value;
      return v ? (JSON.parse(v) as string[]) : [];
    } catch { return []; }
  }, [eidFitrTimesSetting]);

  const eidAdhaTimes = useMemo(() => {
    try {
      const v = (eidAdhaTimesSetting as { value?: string } | undefined)?.value;
      return v ? (JSON.parse(v) as string[]) : [];
    } catch { return []; }
  }, [eidAdhaTimesSetting]);

  const isEidFitrToday = eidFitrDate === today;
  const isEidAdhaToday = eidAdhaDate === today;
  const eidTodayTimes = isEidFitrToday ? eidFitrTimes : isEidAdhaToday ? eidAdhaTimes : [];
  const eidTodayName = isEidFitrToday ? "Eid ul-Fitr" : isEidAdhaToday ? "Eid ul-Adha" : "";

  // Countdown timer — always ticking, wraps to tomorrow's Fajr after Isha
  useEffect(() => {
    if (!nextInfo) return;
    const tick = () => setCountdown(getCountdownToTime(nextInfo.prayer.adhan, nextInfo.isTomorrow));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [nextInfo?.prayer.adhan, nextInfo?.isTomorrow]);

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
        const p = adhanSoundRef.current as { remove: () => void };
        try { p.remove(); } catch {}
        adhanSoundRef.current = null;
      }
      const isFajr = prayerName === "Fajr" || useFajrForAll;
      const url = isFajr ? fajrAdhanUrl : regularAdhanUrl;
      const { createAudioPlayer, setAudioModeAsync } = await import("expo-audio");
      await setAudioModeAsync({ playsInSilentModeIOS: true });
      const player = createAudioPlayer({ uri: url });
      player.play();
      adhanSoundRef.current = player;
      setAdhanPlaying(true);
      setAdhanPrayerName(prayerName);
      player.addListener("playbackStatusUpdate", (status: unknown) => {
        const st = status as { didJustFinish?: boolean };
        if (st.didJustFinish) {
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
      const p = adhanSoundRef.current as { remove: () => void };
      try { p.remove(); } catch {}
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
        const p = adhanSoundRef.current as { remove: () => void };
        try { p.remove(); } catch {}
      }
    };
  }, []);

  // Register Expo push token once on app launch (silent — user already prompted for permission)
  useEffect(() => {
    if (Platform.OS === "web") return;
    void requestAndRegisterPushToken(BASE_URL);
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
    const isJumuah = isTodayFriday && item.name === "Dhuhr";

    // ── Sunrise — distinct amber/dawn card ──────────────────────────────
    if (isSunrise) {
      return (
        <View
          style={[
            styles.prayerRow,
            {
              backgroundColor: "#2C1600",
              shadowColor: "#D97706",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.28,
              shadowRadius: 10,
              elevation: 4,
            },
          ]}
        >
          <View style={[styles.accentStrip, { backgroundColor: "#E07B00" }]} />
          <View style={styles.prayerInner}>
            <View style={styles.prayerLeft}>
              <Text style={[styles.prayerLabel, { color: "#E07B0099" }]}>
                {item.label}
              </Text>
              <Text style={[styles.prayerName, { color: "#FCD34D", fontFamily: "PlayfairDisplay_700Bold" }]}>
                {item.name}
              </Text>
              <Text style={styles.sunriseNote}>Fajr prayer time ends</Text>
            </View>
            <View style={styles.prayerTimes}>
              <View style={styles.prayerTimeCol}>
                <Text style={[styles.timeLabel, { color: "#E07B0099" }]}>Time</Text>
                <Text style={[styles.timeValue, { color: "#FCD34D" }]}>
                  {formatTime12(item.adhan)}
                </Text>
              </View>
              <View style={[styles.timesDivider, { backgroundColor: "#E07B0025" }]} />
              <View style={styles.prayerTimeCol}>
                <Text style={[styles.timeLabel, { color: "#E07B0099" }]}>Prayer</Text>
                <Text style={[styles.timeValue, { color: "#E07B00CC", fontSize: 12 }]}>
                  No Iqamah
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
    }

    // ── Jumu'ah — prominent green card replacing Dhuhr on Fridays ───────
    if (isJumuah) {
      const khutbah = todayPrayer?.jummahKhutbah;
      const jIqamah = todayPrayer?.jummahIqamah;
      return (
        <View
          style={[
            styles.prayerRow,
            styles.jumuahRow,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.32,
              shadowRadius: 16,
              elevation: 10,
            },
          ]}
        >
          <IslamicPatternBg animatePattern={false} shimmer={false} color="#ffffff" patternOpacity={0.08} />
          <View style={[styles.accentStrip, { backgroundColor: colors.accent }]} />
          <View style={[styles.prayerInner, { paddingVertical: 18 }]}>
            <View style={styles.prayerLeft}>
              <Text style={[styles.prayerLabel, { color: colors.accent + "BB", fontSize: 22 }]}>
                الجمعة
              </Text>
              <Text style={[styles.prayerName, { color: colors.primaryForeground, fontFamily: "PlayfairDisplay_700Bold", fontSize: 20 }]}>
                Jumu'ah
              </Text>
              <View style={[styles.nextBadge, { backgroundColor: colors.accent, marginTop: 5 }]}>
                <Text style={[styles.nextBadgeText, { color: colors.primary }]}>Friday Prayer</Text>
              </View>
            </View>
            <View style={styles.prayerTimes}>
              {khutbah ? (
                <>
                  <View style={styles.prayerTimeCol}>
                    <Text style={[styles.timeLabel, { color: colors.primaryForeground + "80" }]}>Khutbah</Text>
                    <Text style={[styles.timeValue, { color: colors.accent, fontSize: 18 }]}>
                      {formatTime12(khutbah)}
                    </Text>
                  </View>
                  {jIqamah && <View style={[styles.timesDivider, { backgroundColor: colors.primaryForeground + "25" }]} />}
                </>
              ) : null}
              {jIqamah ? (
                <View style={styles.prayerTimeCol}>
                  <Text style={[styles.timeLabel, { color: colors.primaryForeground + "80" }]}>Iqamah</Text>
                  <Text style={[styles.timeValue, { color: colors.primaryForeground, fontSize: 18 }]}>
                    {formatTime12(jIqamah)}
                  </Text>
                </View>
              ) : !khutbah ? (
                <View style={styles.prayerTimeCol}>
                  <Text style={[styles.timeLabel, { color: colors.primaryForeground + "80" }]}>Adhan</Text>
                  <Text style={[styles.timeValue, { color: colors.accent, fontSize: 18 }]}>
                    {formatTime12(item.adhan)}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      );
    }

    // ── Regular prayer card ──────────────────────────────────────────────
    return (
      <View
        style={[
          styles.prayerRow,
          {
            backgroundColor: isNext ? colors.primary : colors.card,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: isNext ? 6 : 2 },
            shadowOpacity: isNext ? 0.22 : 0.07,
            shadowRadius: isNext ? 14 : 8,
            elevation: isNext ? 8 : 2,
          },
        ]}
      >
        {isNext && (
          <IslamicPatternBg animatePattern={false} shimmer={false} color="#ffffff" patternOpacity={0.06} />
        )}
        <View style={[styles.accentStrip, { backgroundColor: isNext ? colors.accent : colors.primary + "45" }]} />
        <View style={styles.prayerInner}>
          <View style={styles.prayerLeft}>
            <Text style={[styles.prayerLabel, { color: isNext ? colors.accent + "CC" : colors.mutedForeground }]}>
              {item.label}
            </Text>
            <Text style={[styles.prayerName, { color: isNext ? colors.primaryForeground : colors.foreground, fontFamily: "PlayfairDisplay_700Bold" }]}>
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
              <Text style={[styles.timeLabel, { color: isNext ? colors.primaryForeground + "80" : colors.mutedForeground }]}>
                Adhan
              </Text>
              <Text style={[styles.timeValue, { color: isNext ? colors.accent : colors.primary }]}>
                {formatTime12(item.adhan)}
              </Text>
            </View>
            {item.iqamah && (
              <>
                <View style={[styles.timesDivider, { backgroundColor: isNext ? colors.primaryForeground + "25" : colors.border }]} />
                <View style={styles.prayerTimeCol}>
                  <Text style={[styles.timeLabel, { color: isNext ? colors.primaryForeground + "80" : colors.mutedForeground }]}>
                    Iqamah
                  </Text>
                  <Text style={[styles.timeValue, { color: isNext ? colors.primaryForeground : colors.foreground }]}>
                    {formatTime12(item.iqamah)}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  // ── Week-day row ─────────────────────────────────────────────────────────────
  const renderWeekDay = ({ item }: { item: PrayerTime }) => {
    const dayPrayers = getPrayerEntries(item);
    const isToday = item.date === today;
    const isFriday = new Date(item.date + "T12:00:00").getDay() === 5;
    const dateObj = new Date(item.date + "T12:00:00");
    const dayName = isToday
      ? "Today"
      : dateObj.toLocaleDateString("en-GB", { weekday: "long" });
    const dateStr = dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

    return (
      <View
        style={[
          styles.weekCard,
          {
            backgroundColor: isFriday ? colors.primary : isToday ? colors.muted : colors.card,
            borderColor: isFriday ? colors.accent + "50" : isToday ? colors.primary + "40" : colors.border,
            borderLeftWidth: isToday && !isFriday ? 3 : 1,
            borderLeftColor: isToday && !isFriday ? colors.accent : isFriday ? colors.accent + "50" : colors.border,
            shadowColor: isFriday ? colors.primary : "#000",
            shadowOffset: { width: 0, height: isFriday ? 6 : 2 },
            shadowOpacity: isFriday ? 0.2 : 0.06,
            shadowRadius: isFriday ? 14 : 8,
            elevation: isFriday ? 6 : isToday ? 3 : 1,
          },
        ]}
      >
        {isFriday && (
          <IslamicPatternBg animatePattern={false} shimmer={false} color="#ffffff" patternOpacity={0.07} />
        )}
        <View
          style={[
            styles.weekDayHeader,
            { borderBottomColor: isFriday ? colors.accent + "35" : isToday ? colors.primary + "20" : colors.border },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.weekDayLabel,
                {
                  color: isFriday ? colors.accent : isToday ? colors.primary : colors.foreground,
                  fontFamily: "PlayfairDisplay_700Bold",
                },
              ]}
            >
              {dayName}
            </Text>
            <Text
              style={[
                styles.weekDayDate,
                { color: isFriday ? colors.primaryForeground + "80" : colors.mutedForeground },
              ]}
            >
              {dateStr}
            </Text>
          </View>
          {isFriday && isToday && (
            <View style={{ flexDirection: "row", gap: 6 }}>
              <View style={[styles.fridayBadge, { backgroundColor: colors.accent }]}>
                <Text style={[styles.fridayBadgeText, { color: colors.primary }]}>Jumu'ah</Text>
              </View>
              <View style={[styles.todayPill, { backgroundColor: colors.primaryForeground + "20" }]}>
                <Text style={[styles.todayPillText, { color: colors.primaryForeground }]}>Today</Text>
              </View>
            </View>
          )}
          {isFriday && !isToday && (
            <View style={[styles.fridayBadge, { backgroundColor: colors.accent }]}>
              <Text style={[styles.fridayBadgeText, { color: colors.primary }]}>Jumu'ah</Text>
            </View>
          )}
          {isToday && !isFriday && (
            <View style={[styles.todayPill, { backgroundColor: colors.primary }]}>
              <Text style={[styles.todayPillText, { color: colors.primaryForeground }]}>Today</Text>
            </View>
          )}
        </View>
        <View style={styles.weekPrayerGrid}>
          {dayPrayers.map((p, i) => (
            <View
              key={p.name}
              style={[
                styles.weekPrayerItem,
                {
                  borderRightWidth: i % 3 !== 2 ? 1 : 0,
                  borderBottomWidth: i < 3 ? 1 : 0,
                  borderRightColor: isFriday ? colors.accent + "30" : colors.border,
                  borderBottomColor: isFriday ? colors.accent + "25" : colors.border,
                },
              ]}
            >
              <Text style={[styles.weekPrayerName, { color: isFriday ? colors.accent + "BB" : colors.mutedForeground }]}>
                {p.name}
              </Text>
              <Text style={[styles.weekPrayerTime, { color: isFriday ? colors.primaryForeground : colors.foreground }]}>
                {formatTime12(p.adhan)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // ── Today footer — Jumu'ah multi-slot card + Eid card ───────────────────────
  const TodayListFooter = () => {
    const hasJummah = isTodayFriday && jummahTimes.length > 0;
    const hasEid = !!eidTodayName && eidTodayTimes.length > 0;
    if (!hasJummah && !hasEid) return null;
    return (
      <View style={{ paddingHorizontal: 16, paddingTop: 4, gap: 10 }}>

        {/* ── Jumu'ah multi-slot card ── */}
        {hasJummah && (
          <View style={[styles.jummahFooterCard, { backgroundColor: colors.primary, overflow: "hidden" }]}>
            <IslamicPatternBg animatePattern={false} shimmer={false} color="#ffffff" patternOpacity={0.07} />
            <View style={[styles.accentStrip, { backgroundColor: colors.accent }]} />
            <View style={styles.jummahFooterInner}>
              <View style={{ marginBottom: 12 }}>
                <Text style={[styles.jummahFooterArabic, { color: colors.accent }]}>الجمعة</Text>
                <Text style={[styles.jummahFooterTitle, { color: colors.primaryForeground, fontFamily: "PlayfairDisplay_700Bold" }]}>
                  Jumu'ah — Friday Jamah Times
                </Text>
                <Text style={[styles.jummahFooterSub, { color: colors.primaryForeground + "70" }]}>
                  Weekly Friday congregational prayer
                </Text>
              </View>
              <View style={styles.jummahSlotsRow}>
                {jummahTimes.map((t, i) => (
                  <View key={i} style={[styles.jummahSlot, { borderColor: colors.accent + "35", backgroundColor: colors.secondary + "60" }]}>
                    <Text style={[styles.jummahSlotOrdinal, { color: colors.accent + "99" }]}>
                      {ORDINALS[i] ?? `${i + 1}th`} Jamah
                    </Text>
                    <Text style={[styles.jummahSlotTime, { color: colors.accent, fontFamily: "PlayfairDisplay_700Bold" }]}>
                      {formatTime12(t)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ── Eid prayer card ── */}
        {hasEid && (
          <View style={[styles.jummahFooterCard, { backgroundColor: "#1A3D1A", overflow: "hidden" }]}>
            <IslamicPatternBg animatePattern={false} shimmer={false} color="#ffffff" patternOpacity={0.07} />
            <View style={[styles.accentStrip, { backgroundColor: "#C9A84C" }]} />
            <View style={styles.jummahFooterInner}>
              <View style={{ marginBottom: 12 }}>
                <Text style={[styles.jummahFooterArabic, { color: "#C9A84C" }]}>
                  {eidTodayName === "Eid ul-Fitr" ? "عيد الفطر" : "عيد الأضحى"}
                </Text>
                <Text style={[styles.jummahFooterTitle, { color: "#FFFFFF", fontFamily: "PlayfairDisplay_700Bold" }]}>
                  {eidTodayName} — Prayer Times
                </Text>
                <Text style={[styles.jummahFooterSub, { color: "#FFFFFF70" }]}>
                  Eid congregational prayer
                </Text>
              </View>
              <View style={styles.jummahSlotsRow}>
                {eidTodayTimes.map((t, i) => (
                  <View key={i} style={[styles.jummahSlot, { borderColor: "#C9A84C35", backgroundColor: "#2A5240" }]}>
                    <Text style={[styles.jummahSlotOrdinal, { color: "#C9A84C99" }]}>
                      {ORDINALS[i] ?? `${i + 1}th`} Jamah
                    </Text>
                    <Text style={[styles.jummahSlotTime, { color: "#C9A84C", fontFamily: "PlayfairDisplay_700Bold" }]}>
                      {formatTime12(t)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  // ── List header (shared) ─────────────────────────────────────────────────────
  const ListHeader = () => (
    <View>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.primary, overflow: "hidden" }]}>
        <IslamicPatternBg shimmer color="#ffffff" patternOpacity={0.08} />
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
            <Text style={[styles.nextLabel, { color: colors.primaryForeground + "60" }]}>
              {nextInfo.isTomorrow ? "Tomorrow · First Prayer" : "Next Prayer"}
            </Text>
            <Text style={[styles.nextPrayerName, { color: colors.primaryForeground, fontFamily: "PlayfairDisplay_700Bold" }]}>
              {nextInfo.prayer.name}
            </Text>
            <Text style={[styles.countdown, { color: colors.primaryForeground, fontFamily: "PlayfairDisplay_400Regular" }]}>
              {countdown}
            </Text>
            <Text style={[styles.nextTime, { color: colors.primaryForeground + "80" }]}>
              {formatTime12(nextInfo.prayer.adhan)}
            </Text>
          </Animated.View>
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

      <View style={[styles.sectionDivider, { backgroundColor: colors.background }]}>
        <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
          {viewMode === "today" ? "Today's Prayers" : "Weekly Timetable"}
        </Text>
        <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
      </View>
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
        <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}>
          <IslamicPatternBg color={colors.primary} patternOpacity={0.025} animatePattern={false} shimmer={false} />
        </View>
        <FlatList
          data={weekDays}
          keyExtractor={(item) => item.date}
          renderItem={renderWeekDay}
          ListHeaderComponent={ListHeader}
          showsVerticalScrollIndicator={false}
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
      <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}>
        <IslamicPatternBg color={colors.primary} patternOpacity={0.025} animatePattern={false} shimmer={false} />
      </View>
      <FlatList
        data={prayers}
        keyExtractor={(item) => item.name}
        renderItem={renderPrayer}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={TodayListFooter}
        showsVerticalScrollIndicator={false}
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
    borderRadius: 8,
    padding: 3,
    marginBottom: 14,
  },
  viewToggleBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 6,
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
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    gap: 12,
  },
  sectionLine: { flex: 1, height: 1 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  prayerRow: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    overflow: "hidden",
  },
  accentStrip: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    zIndex: 1,
  },
  prayerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 14,
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
  prayerTimes: { flexDirection: "row", gap: 14, alignItems: "center" },
  timesDivider: { width: 1, height: 28, alignSelf: "center" },
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
  weekDayDate: { fontSize: 12, marginTop: 2 },
  fridayBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  fridayBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
  },
  weekPrayerItem: {
    width: "33.33%",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 3,
  },
  weekPrayerName: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  weekPrayerTime: { fontSize: 14, fontWeight: "700" },
  listContent: { paddingTop: 0 },
  emptyContainer: { alignItems: "center", paddingTop: 40, gap: 12 },
  emptyText: { fontSize: 15, textAlign: "center" },
  loadingText: { fontSize: 15, marginTop: 8 },
  errorText: { fontSize: 15 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { fontSize: 15, fontWeight: "600" },
  // Sunrise card
  sunriseNote: { fontSize: 11, color: "#E07B00BB", marginTop: 3, fontWeight: "500" },
  // Jumu'ah card
  jumuahRow: { marginBottom: 10 },
  // Jumu'ah footer card
  jummahFooterCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 6,
  },
  jummahFooterInner: {
    paddingLeft: 20,
    paddingRight: 16,
    paddingVertical: 18,
  },
  jummahFooterArabic: { fontSize: 22, fontWeight: "400", marginBottom: 2 },
  jummahFooterTitle: { fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },
  jummahFooterSub: { fontSize: 12, marginTop: 2 },
  jummahSlotsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  jummahSlot: {
    flex: 1,
    minWidth: "40%",
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 3,
  },
  jummahSlotOrdinal: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8 },
  jummahSlotTime: { fontSize: 18, fontWeight: "700" },
});
