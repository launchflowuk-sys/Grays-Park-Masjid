import { Ionicons } from "@expo/vector-icons";
import { useListQuranChapters } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type Chapter = {
  id: number;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
  translated_name?: { name: string };
  revelation_place?: string;
};

export default function QuranScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const { data: chapters, isLoading, isError, refetch } = useListQuranChapters();

  const filtered = useMemo(() => {
    if (!chapters) return [];
    const q = query.toLowerCase().trim();
    if (!q) return chapters as Chapter[];
    return (chapters as Chapter[]).filter(
      (c) =>
        c.name_simple.toLowerCase().includes(q) ||
        (c.translated_name?.name?.toLowerCase() ?? "").includes(q) ||
        String(c.id).includes(q)
    );
  }, [chapters, query]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const renderItem = ({ item }: { item: Chapter }) => (
    <Pressable
      style={({ pressed }) => [
        styles.surahRow,
        {
          backgroundColor: pressed ? colors.muted : colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={() => router.push(`/quran/${item.id}`)}
      testID={`surah-${item.id}`}
    >
      <View style={[styles.numberBadge, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
        <Text style={[styles.numberText, { color: colors.primary }]}>{item.id}</Text>
      </View>
      <View style={styles.surahInfo}>
        <Text style={[styles.surahName, { color: colors.foreground }]} numberOfLines={1}>
          {item.name_simple}
        </Text>
        <Text style={[styles.surahSub, { color: colors.mutedForeground }]} numberOfLines={1}>
          {item.translated_name?.name ?? ""} · {item.verses_count} verses
        </Text>
      </View>
      <View style={styles.arabicCol}>
        <Text style={[styles.arabicName, { color: colors.primary }]}>{item.name_arabic}</Text>
        <Text style={[styles.revelationBadge, { color: colors.mutedForeground }]}>
          {item.revelation_place === "makkah" ? "Meccan" : item.revelation_place === "madinah" ? "Medinan" : ""}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "PlayfairDisplay_700Bold" }]}>
          The Holy Qur'an
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>القرآن الكريم</Text>
        <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search surahs…"
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            returnKeyType="search"
            testID="quran-search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading && (
        <View style={styles.centerFlex}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading surahs…</Text>
        </View>
      )}

      {isError && (
        <View style={styles.centerFlex}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.mutedForeground} />
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Unable to load Qur'an</Text>
          <TouchableOpacity onPress={() => refetch()} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
            <Text style={[styles.retryText, { color: colors.primaryForeground }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !isError && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 90 },
          ]}
          scrollEnabled={filtered.length > 0}
          ListEmptyComponent={
            <View style={styles.centerFlex}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No surahs found for "{query}"
              </Text>
            </View>
          }
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centerFlex: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 28, fontWeight: "700" },
  subtitle: { fontSize: 20, marginTop: 2, marginBottom: 12 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  surahRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 0,
  },
  numberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: { fontSize: 14, fontWeight: "700" },
  surahInfo: { flex: 1 },
  surahName: { fontSize: 16, fontWeight: "600" },
  surahSub: { fontSize: 12, marginTop: 2 },
  arabicCol: { alignItems: "flex-end" },
  arabicName: { fontSize: 20, fontWeight: "400" },
  revelationBadge: { fontSize: 11, marginTop: 2 },
  separator: { height: 1, marginHorizontal: 16 },
  listContent: { paddingTop: 0 },
  loadingText: { fontSize: 15, marginTop: 8 },
  errorText: { fontSize: 15 },
  emptyText: { fontSize: 15, textAlign: "center" },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { fontSize: 15, fontWeight: "600" },
});
