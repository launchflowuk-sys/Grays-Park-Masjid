import { Ionicons } from "@expo/vector-icons";
import { useGetQuranChapter, useGetQuranChapterVerses } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import RenderHtml, { defaultSystemFonts } from "react-native-render-html";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type QuranVerse = {
  id: string;
  verse_number: number;
  verse_key: string;
  text_uthmani?: string;
  translations?: Array<{ text: string; resource_id: number; resource_name?: string }>;
  audio?: { url: string } | null;
};

const TOTAL_SURAHS = 114;
const FLOAT_THRESHOLD = 300;
const MINI_PLAYER_H = 80;

const PATTERN: Array<{ top?: number; bottom?: number; left?: number; right?: number; size: number; opacity: number }> = [
  { top: -6, right: -6, size: 28, opacity: 0.18 },
  { bottom: -4, left: -4, size: 20, opacity: 0.14 },
  { top: 10, right: 8, size: 12, opacity: 0.12 },
  { bottom: 10, left: 8, size: 14, opacity: 0.10 },
  { top: -2, left: 16, size: 8, opacity: 0.12 },
];

export default function SurahScreen() {
  const { number } = useLocalSearchParams<{ number: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { width } = useWindowDimensions();
  const surahNum = Number(number);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const translationWidth = width - 28 - 32;

  const flatListRef = useRef<FlatList<QuranVerse>>(null);
  const floatOpacity = useRef(new Animated.Value(0)).current;
  const scrollYRef = useRef(0);

  const playerRef = useRef<unknown>(null);
  const subscriptionRef = useRef<{ remove: () => void } | null>(null);
  const playingKeyRef = useRef<string | null>(null);
  const playAllRef = useRef(false);
  const versesRef = useRef<QuranVerse[]>([]);

  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playAllMode, setPlayAllMode] = useState(false);

  const { data: chapter } = useGetQuranChapter(surahNum);
  const { data: verses, isLoading, isError, refetch } = useGetQuranChapterVerses(surahNum) as {
    data: QuranVerse[] | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  useEffect(() => {
    versesRef.current = verses ?? [];
  }, [verses]);

  useEffect(() => {
    return () => {
      subscriptionRef.current?.remove();
      if (playerRef.current) {
        const p = playerRef.current as { remove: () => void };
        try { p.remove(); } catch {}
      }
    };
  }, []);

  const stopAudio = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    if (playerRef.current) {
      const p = playerRef.current as { remove: () => void };
      try { p.remove(); } catch {}
      playerRef.current = null;
    }
    playingKeyRef.current = null;
    playAllRef.current = false;
    setPlayingKey(null);
    setIsAudioPlaying(false);
    setAudioProgress(0);
    setAudioDuration(0);
    setPlayAllMode(false);
  }, []);

  const startTrack = useCallback(async (key: string, url: string, allMode: boolean) => {
    if (Platform.OS === "web") return;

    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    if (playerRef.current) {
      const p = playerRef.current as { remove: () => void };
      try { p.remove(); } catch {}
      playerRef.current = null;
    }

    playingKeyRef.current = key;
    playAllRef.current = allMode;
    setPlayingKey(key);
    setPlayAllMode(allMode);
    setAudioProgress(0);
    setAudioDuration(0);
    setIsAudioPlaying(false);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const { createAudioPlayer, setAudioModeAsync } = await import("expo-audio");
      await setAudioModeAsync({ playsInSilentModeIOS: true });
      const player = createAudioPlayer({ uri: url });
      player.play();
      playerRef.current = player;

      const sub = player.addListener("playbackStatusUpdate", (status: unknown) => {
        const s = status as {
          playing?: boolean;
          currentTime?: number;
          duration?: number;
          didJustFinish?: boolean;
        };
        setIsAudioPlaying(!!s.playing);
        setAudioProgress(s.currentTime ?? 0);
        setAudioDuration(s.duration ?? 0);

        if (s.didJustFinish) {
          if (playAllRef.current) {
            const currentKey = playingKeyRef.current;
            const list = versesRef.current;
            const idx = list.findIndex((v) => v.verse_key === currentKey);
            const next = idx >= 0 ? list[idx + 1] : null;
            if (next?.audio?.url) {
              startTrack(next.verse_key, next.audio.url, true);
            } else {
              stopAudio();
            }
          } else {
            setIsAudioPlaying(false);
            setPlayingKey(null);
            playingKeyRef.current = null;
          }
        }
      });
      subscriptionRef.current = sub;
    } catch {
      stopAudio();
    }
  }, [stopAudio]);

  const playAudio = useCallback(
    async (key: string, url: string) => {
      if (Platform.OS === "web") return;
      if (playingKey === key) {
        stopAudio();
        return;
      }
      startTrack(key, url, false);
    },
    [playingKey, startTrack, stopAudio],
  );

  const toggleAudio = useCallback(() => {
    if (!playerRef.current) return;
    const p = playerRef.current as { play: () => void; pause: () => void };
    if (isAudioPlaying) {
      p.pause();
      setIsAudioPlaying(false);
    } else {
      p.play();
      setIsAudioPlaying(true);
    }
  }, [isAudioPlaying]);

  const playPrev = useCallback(() => {
    const list = versesRef.current;
    const idx = list.findIndex((v) => v.verse_key === playingKeyRef.current);
    const prev = idx > 0 ? list[idx - 1] : null;
    if (prev?.audio?.url) startTrack(prev.verse_key, prev.audio.url, playAllRef.current);
  }, [startTrack]);

  const playNext = useCallback(() => {
    const list = versesRef.current;
    const idx = list.findIndex((v) => v.verse_key === playingKeyRef.current);
    const next = idx >= 0 ? list[idx + 1] : null;
    if (next?.audio?.url) startTrack(next.verse_key, next.audio.url, playAllRef.current);
  }, [startTrack]);

  const playAll = useCallback(() => {
    const list = versesRef.current;
    const first = list.find((v) => v.audio?.url);
    if (first?.audio?.url) startTrack(first.verse_key, first.audio.url, true);
  }, [startTrack]);

  const handleScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      const y = event.nativeEvent.contentOffset.y;
      const wasAbove = scrollYRef.current < FLOAT_THRESHOLD;
      const isAbove = y < FLOAT_THRESHOLD;
      scrollYRef.current = y;
      if (wasAbove !== isAbove) {
        Animated.timing(floatOpacity, {
          toValue: isAbove ? 0 : 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    },
    [floatOpacity],
  );

  const scrollToTop = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const goToPrev = useCallback(() => {
    if (surahNum > 1) { stopAudio(); router.replace(`/quran/${surahNum - 1}`); }
  }, [surahNum, router, stopAudio]);

  const goToNext = useCallback(() => {
    if (surahNum < TOTAL_SURAHS) { stopAudio(); router.replace(`/quran/${surahNum + 1}`); }
  }, [surahNum, router, stopAudio]);

  const currentVerseNum = (() => {
    const v = versesRef.current.find((v) => v.verse_key === playingKey);
    return v?.verse_number ?? null;
  })();

  const canPlayPrev = (() => {
    const list = versesRef.current;
    const idx = list.findIndex((v) => v.verse_key === playingKey);
    return idx > 0;
  })();

  const canPlayNext = (() => {
    const list = versesRef.current;
    const idx = list.findIndex((v) => v.verse_key === playingKey);
    return idx >= 0 && idx + 1 < list.length && !!list[idx + 1]?.audio?.url;
  })();

  const miniPlayerBottom = insets.bottom + 16;
  const listBottomPad = insets.bottom + (playingKey ? MINI_PLAYER_H + 24 + 16 : 16) + 72;

  const renderVerse = ({ item }: { item: QuranVerse }) => {
    const rawTranslation = item.translations?.[0]?.text ?? "";
    const isPlaying = playingKey === item.verse_key;
    const hasAudio = !!(item.audio?.url) && Platform.OS !== "web";

    const translationHtml = rawTranslation
      ? `<span style="font-size:15px;line-height:22px;color:${colors.mutedForeground}">${rawTranslation}</span>`
      : "";

    return (
      <View style={[styles.verseCard, { backgroundColor: colors.card, borderColor: isPlaying ? colors.primary : colors.border, borderWidth: isPlaying ? 1.5 : 1 }]}>
        <View style={styles.verseHeader}>
          <View style={[styles.verseNumber, { backgroundColor: isPlaying ? colors.primary : colors.primary + "15" }]}>
            <Text style={[styles.verseNumberText, { color: isPlaying ? "#FAF8F3" : colors.primary }]}>
              {item.verse_number}
            </Text>
          </View>
          {hasAudio && (
            <TouchableOpacity
              onPress={() => playAudio(item.verse_key, item.audio!.url)}
              style={[
                styles.playBtn,
                { backgroundColor: isPlaying ? colors.primary : colors.muted },
              ]}
              testID={`verse-play-${item.verse_number}`}
            >
              <Ionicons
                name={isPlaying && isAudioPlaying ? "pause" : "play"}
                size={18}
                color={isPlaying ? "#FAF8F3" : colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>

        {item.text_uthmani && (
          <Text style={[styles.arabicText, { color: colors.foreground }]}>
            {item.text_uthmani}
          </Text>
        )}

        {translationHtml ? (
          <RenderHtml
            contentWidth={translationWidth}
            source={{ html: translationHtml }}
            systemFonts={[...defaultSystemFonts, "Inter_400Regular"]}
            tagsStyles={{
              sup: { fontSize: 10, color: colors.primary, lineHeight: 14 },
              span: { color: colors.mutedForeground },
            }}
            baseStyle={{ color: colors.mutedForeground }}
          />
        ) : null}
      </View>
    );
  };

  const hasSurahAudio = verses?.some((v) => v.audio?.url) && Platform.OS !== "web";

  const ListHeader = () => (
    <View>
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => { stopAudio(); router.back(); }} style={styles.headerBtn} testID="back-btn">
          <Ionicons name="chevron-back" size={24} color={colors.primaryForeground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerArabic, { color: colors.accent }]}>
            {chapter?.name_arabic ?? ""}
          </Text>
          <Text
            style={[
              styles.headerTitle,
              { color: colors.primaryForeground, fontFamily: "PlayfairDisplay_700Bold" },
            ]}
          >
            {chapter?.name_simple ?? `Surah ${number}`}
          </Text>
          <Text style={[styles.headerSub, { color: colors.primaryForeground + "BB" }]}>
            {chapter?.translated_name?.name ?? ""} · {chapter?.verses_count ?? "…"} verses
            {chapter?.revelation_place
              ? ` · ${chapter.revelation_place === "makkah" ? "Meccan" : "Medinan"}`
              : ""}
          </Text>
        </View>
        <View style={styles.headerBtn} />
      </View>

      {surahNum !== 9 && surahNum !== 1 && (
        <View style={[styles.bismillah, { backgroundColor: colors.background }]}>
          <Text style={[styles.bismillahText, { color: colors.primary }]}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </Text>
        </View>
      )}

      {hasSurahAudio && (
        <TouchableOpacity
          onPress={playAll}
          style={[styles.playAllBtn, { backgroundColor: colors.primary, borderColor: colors.accent + "60" }]}
          testID="play-all-btn"
        >
          <View style={styles.playAllIcon}>
            <Ionicons name="play" size={16} color={colors.primary} />
          </View>
          <Text style={[styles.playAllText, { color: "#FAF8F3", fontFamily: "Inter_600SemiBold" }]}>
            Play Surah
          </Text>
          <Text style={[styles.playAllSub, { color: "rgba(250,248,243,0.55)" }]}>
            {verses?.filter((v) => v.audio?.url).length} verses
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isError) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>
        <View style={styles.centerFlex}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.mutedForeground} />
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
            Unable to load surah
          </Text>
          <TouchableOpacity
            onPress={refetch}
            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.retryText, { color: colors.primaryForeground }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const hasPrev = surahNum > 1;
  const hasNext = surahNum < TOTAL_SURAHS;
  const pct = audioDuration > 0 ? (audioProgress / audioDuration) * 100 : 0;

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      {isLoading ? (
        <>
          <ListHeader />
          <View style={styles.centerFlex}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
              Loading verses…
            </Text>
          </View>
        </>
      ) : (
        <FlatList
          ref={flatListRef}
          data={verses ?? []}
          keyExtractor={(item, index) => item.verse_key ?? String(index)}
          renderItem={renderVerse}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={[styles.listContent, { paddingBottom: listBottomPad }]}
          scrollEnabled={!!(verses && verses.length > 0)}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListEmptyComponent={
            <View style={styles.centerFlex}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No verses found
              </Text>
            </View>
          }
        />
      )}

      {/* Mini player bar */}
      {playingKey && (
        <View
          style={[
            styles.miniPlayer,
            { bottom: miniPlayerBottom, backgroundColor: colors.primary },
          ]}
        >
          {/* Pattern overlay */}
          {PATTERN.map((p, i) => (
            <View
              key={i}
              pointerEvents="none"
              style={{
                position: "absolute",
                top: p.top,
                bottom: p.bottom,
                left: p.left,
                right: p.right,
                width: p.size,
                height: p.size,
                backgroundColor: "#C9A84C",
                opacity: p.opacity,
                transform: [{ rotate: "45deg" }],
              }}
            />
          ))}

          {/* Track info */}
          <View style={styles.miniInfo}>
            <Text style={styles.miniSurah} numberOfLines={1}>
              {chapter?.name_simple ?? `Surah ${number}`}
            </Text>
            <Text style={styles.miniVerse}>
              {playAllMode ? "Playing all · " : ""}
              {currentVerseNum != null
                ? `Verse ${currentVerseNum}${verses?.length ? ` / ${verses.length}` : ""}`
                : ""}
            </Text>
          </View>

          {/* Controls */}
          <View style={styles.miniControls}>
            <TouchableOpacity
              onPress={playPrev}
              disabled={!canPlayPrev}
              style={[styles.miniSkipBtn, !canPlayPrev && { opacity: 0.35 }]}
              testID="mini-prev"
            >
              <Ionicons name="play-skip-back" size={20} color="rgba(250,248,243,0.85)" />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleAudio} style={styles.miniPlayBtn} testID="mini-toggle">
              {PATTERN.slice(0, 2).map((p, i) => (
                <View
                  key={i}
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    top: p.top ? p.top / 2 : undefined,
                    bottom: p.bottom ? p.bottom / 2 : undefined,
                    left: p.left ? p.left / 2 : undefined,
                    right: p.right ? p.right / 2 : undefined,
                    width: p.size * 0.6,
                    height: p.size * 0.6,
                    backgroundColor: "#C9A84C",
                    opacity: p.opacity * 0.9,
                    borderRadius: 2,
                    transform: [{ rotate: "45deg" }],
                  }}
                />
              ))}
              <Ionicons
                name={isAudioPlaying ? "pause" : "play"}
                size={24}
                color={colors.primary}
                style={{ marginLeft: isAudioPlaying ? 0 : 2 }}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={playNext}
              disabled={!canPlayNext}
              style={[styles.miniSkipBtn, !canPlayNext && { opacity: 0.35 }]}
              testID="mini-next"
            >
              <Ionicons name="play-skip-forward" size={20} color="rgba(250,248,243,0.85)" />
            </TouchableOpacity>
          </View>

          {/* Close */}
          <TouchableOpacity onPress={stopAudio} style={styles.miniClose} testID="mini-close">
            <Ionicons name="close" size={18} color="rgba(250,248,243,0.55)" />
          </TouchableOpacity>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%` as `${number}%` }]} />
          </View>
        </View>
      )}

      {/* Floating navigation panel */}
      <Animated.View
        style={[
          styles.floatPanel,
          {
            bottom: playingKey ? miniPlayerBottom + MINI_PLAYER_H + 8 : insets.bottom + 16,
            opacity: floatOpacity,
          },
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.floatInner}>
          <TouchableOpacity onPress={() => { stopAudio(); router.back(); }} style={styles.floatBtn} testID="float-back">
            <Ionicons name="arrow-back" size={18} color="#FAF8F3" />
          </TouchableOpacity>
          <View style={styles.floatDivider} />
          <TouchableOpacity
            onPress={goToPrev}
            style={[styles.floatBtn, !hasPrev && styles.floatBtnDisabled]}
            disabled={!hasPrev}
            testID="float-prev"
          >
            <Ionicons name="chevron-back-circle-outline" size={18} color={hasPrev ? "#FAF8F3" : "rgba(250,248,243,0.3)"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={scrollToTop} style={styles.floatBtnAccent} testID="float-top">
            <Ionicons name="arrow-up" size={18} color="#1B3D2F" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={goToNext}
            style={[styles.floatBtn, !hasNext && styles.floatBtnDisabled]}
            disabled={!hasNext}
            testID="float-next"
          >
            <Ionicons name="chevron-forward-circle-outline" size={18} color={hasNext ? "#FAF8F3" : "rgba(250,248,243,0.3)"} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centerFlex: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  headerCenter: { flex: 1, alignItems: "center", gap: 4 },
  headerArabic: { fontSize: 24 },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  headerSub: { fontSize: 12, textAlign: "center" },
  headerBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  bismillah: { padding: 24, alignItems: "center" },
  bismillahText: { fontSize: 22, textAlign: "center" },

  // Play all button
  playAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 14,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 12,
    overflow: "hidden",
  },
  playAllIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#C9A84C",
    alignItems: "center",
    justifyContent: "center",
  },
  playAllText: { fontSize: 16, flex: 1 },
  playAllSub: { fontSize: 12 },

  listContent: {},
  verseCard: {
    marginHorizontal: 14,
    marginBottom: 10,
    borderRadius: 12,
    padding: 16,
    gap: 10,
  },
  verseHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  verseNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  verseNumberText: { fontSize: 13, fontWeight: "700" },
  playBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  arabicText: { fontSize: 24, lineHeight: 42, textAlign: "right" },
  loadingText: { fontSize: 15, marginTop: 8 },
  errorText: { fontSize: 15 },
  emptyText: { fontSize: 15 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { fontSize: 15, fontWeight: "600" },

  // Mini player
  miniPlayer: {
    position: "absolute",
    left: 14,
    right: 14,
    height: MINI_PLAYER_H,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  miniInfo: { flex: 1, gap: 2 },
  miniSurah: { color: "#FAF8F3", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  miniVerse: { color: "rgba(250,248,243,0.60)", fontSize: 11 },
  miniControls: { flexDirection: "row", alignItems: "center", gap: 6 },
  miniSkipBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  miniPlayBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#C9A84C",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  miniClose: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  progressFill: {
    height: 3,
    backgroundColor: "#C9A84C",
  },

  // Floating panel
  floatPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  floatInner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(27,61,47,0.92)",
    borderRadius: 32,
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  floatBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  floatBtnAccent: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C9A84C",
  },
  floatBtnDisabled: { opacity: 0.4 },
  floatDivider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(250,248,243,0.2)",
    marginHorizontal: 2,
  },
});
