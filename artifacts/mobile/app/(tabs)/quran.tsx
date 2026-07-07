import { Ionicons } from "@expo/vector-icons";
import { useListQuranChapters } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
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

type RevFilter = "all" | "makkah" | "madinah";

export default function QuranScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [revFilter, setRevFilter] = useState<RevFilter>("all");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: chapters, isLoading, isError, refetch } = useListQuranChapters();

  const filtered = useMemo(() => {
    if (!chapters) return [];
    let list = chapters as Chapter[];
    if (revFilter !== "all") {
      list = list.filter((c) => c.revelation_place === revFilter);
    }
    const q = query.toLowerCase().trim();
    if (!q) return list;
    return list.filter(
      (c) =>
        c.name_simple.toLowerCase().includes(q) ||
        (c.translated_name?.name?.toLowerCase() ?? "").includes(q) ||
        String(c.id).includes(q)
    );
  }, [chapters, query, revFilter]);

  const FILTERS: { key: RevFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "makkah", label: "Meccan" },
    { key: "madinah", label: "Medinan" },
  ];

  const renderItem = ({ item }: { item: Chapter }) => (
    <Pressable
      style={({ pressed }) => [
        styles.surahRow,
        { backgroundColor: pressed ? colors.muted : colors.card },
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
        <Text style={[styles.revBadge, { color: item.revelation_place === "makkah" ? colors.accent : colors.mutedForeground }]}>
          {item.revelation_place === "makkah" ? "Meccan" : item.revelation_place === "madinah" ? "Medinan" : ""}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.title, { color: colors.foreground, fontFamily: "PlayfairDisplay_700Bold" }]}>
              The Holy Qur'an
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>القرآن الكريم</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/quran/search")}
            style={[styles.searchIconBtn, { backgroundColor: colors.muted }]}
            testID="quran-search-btn"
          >
            <Ionicons name="search" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Filter by name or number…"
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            returnKeyType="search"
            testID="quran-filter"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setRevFilter(f.key)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: revFilter === f.key ? colors.primary : colors.muted,
                  borderColor: revFilter === f.key ? colors.primary : colors.border,
                },
              ]}
              testID={`filter-${f.key}`}
            >
              <Text style={[styles.filterChipText, { color: revFilter === f.key ? colors.primaryForeground : colors.foreground }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
          scrollEnabled={filtered.length > 0}
          ListEmptyComponent={
            <View style={styles.centerFlex}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No surahs match your filter
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
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 },
  title: { fontSize: 28, fontWeight: "700" },
  subtitle: { fontSize: 18, marginTop: 2 },
  searchIconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginTop: 4 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  filterScroll: { marginBottom: 4 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 4,
  },
  filterChipText: { fontSize: 13, fontWeight: "600" },
  surahRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
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
  arabicName: { fontSize: 20 },
  revBadge: { fontSize: 11, marginTop: 2 },
  separator: { height: 1, marginHorizontal: 16 },
  listContent: { paddingTop: 0 },
  loadingText: { fontSize: 15, marginTop: 8 },
  errorText: { fontSize: 15 },
  emptyText: { fontSize: 15 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { fontSize: 15, fontWeight: "600" },
});
