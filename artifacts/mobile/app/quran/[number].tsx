import { Ionicons } from "@expo/vector-icons";
import { useGetQuranChapter, useGetQuranChapterVerses } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
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

export default function SurahScreen() {
  const { number } = useLocalSearchParams<{ number: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { width } = useWindowDimensions();
  const surahNum = Number(number);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const soundRef = useRef<unknown>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const translationWidth = width - 28 - 32;

  const flatListRef = useRef<FlatList<QuranVerse>>(null);
  const floatOpacity = useRef(new Animated.Value(0)).current;
  const scrollYRef = useRef(0);

  const { data: chapter } = useGetQuranChapter(surahNum);
  const { data: verses, isLoading, isError, refetch } = useGetQuranChapterVerses(surahNum) as {
    data: QuranVerse[] | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

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
    if (surahNum > 1) router.replace(`/quran/${surahNum - 1}`);
  }, [surahNum, router]);

  const goToNext = useCallback(() => {
    if (surahNum < TOTAL_SURAHS) router.replace(`/quran/${surahNum + 1}`);
  }, [surahNum, router]);

  const playAudio = useCallback(
    async (key: string, url: string) => {
      if (Platform.OS === "web") return;
      try {
        if (soundRef.current) {
          const s = soundRef.current as {
            stopAsync: () => Promise<void>;
            unloadAsync: () => Promise<void>;
          };
          await s.stopAsync();
          await s.unloadAsync();
          soundRef.current = null;
        }
        if (playingKey === key) {
          setPlayingKey(null);
          return;
        }
        setPlayingKey(key);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const { Audio } = await import("expo-av");
        const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate((status: unknown) => {
          const s = status as { didJustFinish?: boolean; isLoaded?: boolean };
          if (s.isLoaded && s.didJustFinish) {
            soundRef.current = null;
            setPlayingKey(null);
          }
        });
      } catch {
        setPlayingKey(null);
      }
    },
    [playingKey],
  );

  const renderVerse = ({ item }: { item: QuranVerse }) => {
    const rawTranslation = item.translations?.[0]?.text ?? "";
    const isPlaying = playingKey === item.verse_key;
    const hasAudio = !!(item.audio?.url) && Platform.OS !== "web";

    const translationHtml = rawTranslation
      ? `<span style="font-size:15px;line-height:22px;color:${colors.mutedForeground}">${rawTranslation}</span>`
      : "";

    return (
      <View style={[styles.verseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.verseHeader}>
          <View style={[styles.verseNumber, { backgroundColor: colors.primary + "15" }]}>
            <Text style={[styles.verseNumberText, { color: colors.primary }]}>
              {item.verse_number}
            </Text>
          </View>
          {hasAudio && (
            <TouchableOpacity
              onPress={() => playAudio(item.verse_key, item.audio!.url)}
              style={[
                styles.playBtn,
                { backgroundColor: isPlaying ? colors.accent : colors.muted },
              ]}
              testID={`verse-play-${item.verse_number}`}
            >
              <Ionicons
                name={isPlaying ? "stop" : "play"}
                size={14}
                color={isPlaying ? colors.primary : colors.mutedForeground}
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

  const ListHeader = () => (
    <View>
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} testID="back-btn">
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
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 96 },
          ]}
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

      {/* Floating navigation panel */}
      <Animated.View
        style={[
          styles.floatPanel,
          {
            bottom: insets.bottom + 16,
            opacity: floatOpacity,
          },
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.floatInner}>
          {/* Back */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.floatBtn}
            testID="float-back"
          >
            <Ionicons name="arrow-back" size={18} color="#FAF8F3" />
          </TouchableOpacity>

          <View style={styles.floatDivider} />

          {/* Previous surah */}
          <TouchableOpacity
            onPress={goToPrev}
            style={[styles.floatBtn, !hasPrev && styles.floatBtnDisabled]}
            disabled={!hasPrev}
            testID="float-prev"
          >
            <Ionicons
              name="chevron-back-circle-outline"
              size={18}
              color={hasPrev ? "#FAF8F3" : "rgba(250,248,243,0.3)"}
            />
          </TouchableOpacity>

          {/* Scroll to top */}
          <TouchableOpacity
            onPress={scrollToTop}
            style={styles.floatBtnAccent}
            testID="float-top"
          >
            <Ionicons name="arrow-up" size={18} color="#1B3D2F" />
          </TouchableOpacity>

          {/* Next surah */}
          <TouchableOpacity
            onPress={goToNext}
            style={[styles.floatBtn, !hasNext && styles.floatBtnDisabled]}
            disabled={!hasNext}
            testID="float-next"
          >
            <Ionicons
              name="chevron-forward-circle-outline"
              size={18}
              color={hasNext ? "#FAF8F3" : "rgba(250,248,243,0.3)"}
            />
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
  listContent: {},
  verseCard: {
    marginHorizontal: 14,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  verseHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  verseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  verseNumberText: { fontSize: 13, fontWeight: "700" },
  playBtn: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  arabicText: { fontSize: 24, lineHeight: 42, textAlign: "right" },
  loadingText: { fontSize: 15, marginTop: 8 },
  errorText: { fontSize: 15 },
  emptyText: { fontSize: 15 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { fontSize: 15, fontWeight: "600" },

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
  floatBtnDisabled: {
    opacity: 0.4,
  },
  floatDivider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(250,248,243,0.2)",
    marginHorizontal: 2,
  },
});
