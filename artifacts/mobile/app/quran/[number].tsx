import { Ionicons } from "@expo/vector-icons";
import { useGetQuranChapter, useGetQuranChapterVerses } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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

type QuranChapter = {
  id: number;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
  revelation_place?: string;
  translated_name?: { name: string };
};

export default function SurahScreen() {
  const { number } = useLocalSearchParams<{ number: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const surahNum = Number(number);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const soundRef = useRef<unknown>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: chapter } = useGetQuranChapter(surahNum) as { data: QuranChapter | undefined };
  const { data: verses, isLoading, isError, refetch } = useGetQuranChapterVerses(
    surahNum,
    { translation: "131", reciter: "7" } as Record<string, unknown>
  ) as { data: QuranVerse[] | undefined; isLoading: boolean; isError: boolean; refetch: () => void };

  const playAudio = useCallback(async (key: string, url: string) => {
    if (Platform.OS === "web") return;
    try {
      if (soundRef.current) {
        const s = soundRef.current as { stopAsync: () => Promise<void>; unloadAsync: () => Promise<void> };
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
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true }
      );
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
  }, [playingKey]);

  const renderVerse = ({ item }: { item: QuranVerse }) => {
    const translation = item.translations?.[0]?.text ?? "";
    const cleanTranslation = translation.replace(/<sup[^>]*>.*?<\/sup>/g, "").replace(/<[^>]*>/g, "");
    const isPlaying = playingKey === item.verse_key;
    const hasAudio = !!(item.audio?.url) && Platform.OS !== "web";

    return (
      <View style={[styles.verseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.verseHeader}>
          <View style={[styles.verseNumber, { backgroundColor: colors.primary + "15" }]}>
            <Text style={[styles.verseNumberText, { color: colors.primary }]}>{item.verse_number}</Text>
          </View>
          {hasAudio && (
            <TouchableOpacity
              onPress={() => playAudio(item.verse_key, item.audio!.url)}
              style={[styles.playBtn, { backgroundColor: isPlaying ? colors.accent : colors.muted }]}
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
          <Text style={[styles.arabicText, { color: colors.foreground }]}>{item.text_uthmani}</Text>
        )}
        {cleanTranslation ? (
          <Text style={[styles.translationText, { color: colors.mutedForeground }]}>{cleanTranslation}</Text>
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
          <Text style={[styles.headerArabic, { color: colors.accent }]}>{chapter?.name_arabic ?? ""}</Text>
          <Text style={[styles.headerTitle, { color: colors.primaryForeground, fontFamily: "PlayfairDisplay_700Bold" }]}>
            {chapter?.name_simple ?? `Surah ${number}`}
          </Text>
          <Text style={[styles.headerSub, { color: colors.primaryForeground + "BB" }]}>
            {chapter?.translated_name?.name ?? ""} · {chapter?.verses_count ?? "…"} verses
            {chapter?.revelation_place ? ` · ${chapter.revelation_place === "makkah" ? "Meccan" : "Medinan"}` : ""}
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
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Unable to load surah</Text>
          <TouchableOpacity onPress={refetch} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
            <Text style={[styles.retryText, { color: colors.primaryForeground }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      {isLoading ? (
        <>
          <ListHeader />
          <View style={styles.centerFlex}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading verses…</Text>
          </View>
        </>
      ) : (
        <FlatList
          data={verses ?? []}
          keyExtractor={(item) => item.verse_key}
          renderItem={renderVerse}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 30 }]}
          scrollEnabled={!!(verses && verses.length > 0)}
          ListEmptyComponent={
            <View style={styles.centerFlex}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No verses found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centerFlex: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 8, paddingBottom: 20 },
  headerCenter: { flex: 1, alignItems: "center", gap: 4 },
  headerArabic: { fontSize: 24 },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  headerSub: { fontSize: 12, textAlign: "center" },
  headerBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  bismillah: { padding: 24, alignItems: "center" },
  bismillahText: { fontSize: 22, textAlign: "center" },
  listContent: {},
  verseCard: { marginHorizontal: 14, marginBottom: 10, borderRadius: 12, borderWidth: 1, padding: 16, gap: 10 },
  verseHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  verseNumber: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  verseNumberText: { fontSize: 13, fontWeight: "700" },
  playBtn: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  arabicText: { fontSize: 24, lineHeight: 42, textAlign: "right" },
  translationText: { fontSize: 15, lineHeight: 22 },
  loadingText: { fontSize: 15, marginTop: 8 },
  errorText: { fontSize: 15 },
  emptyText: { fontSize: 15 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { fontSize: 15, fontWeight: "600" },
});
