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
    let list = [...chapters];
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

  const FILTERS: { key: RevFilter; label: string; icon: keyof typeof Ionicons.glyphMap; activeColor: string }[] = [
    { key: "all", label: "All Surahs", icon: "book-outline", activeColor: colors.primary },
    { key: "makkah", label: "Meccan", icon: "sunny-outline", activeColor: "#92400E" },
    { key: "madinah", label: "Medinan", icon: "water-outline", activeColor: "#1B5E20" },
  ];

  const renderItem = ({ item }: { item: (typeof filtered)[number] }) => {
    const isMakkah = item.revelation_place === "makkah";
    const accentColor = isMakkah ? colors.accent : colors.secondary;
    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: pressed ? colors.muted : colors.card,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.07,
            shadowRadius: 4,
            elevation: 2,
          },
        ]}
        onPress={() => router.push(`/quran/${item.id}`)}
        testID={`surah-${item.id}`}
      >
        <View style={[styles.accentStrip, { backgroundColor: accentColor }]} />

        <View style={styles.diamondWrap}>
          <View style={[styles.diamond, { backgroundColor: accentColor + "18", borderColor: accentColor + "45" }]}>
            <Text style={[styles.diamondNum, { color: accentColor, fontFamily: "PlayfairDisplay_700Bold" }]}>
              {item.id}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={[styles.cardName, { color: colors.foreground, fontFamily: "PlayfairDisplay_700Bold" }]} numberOfLines={1}>
            {item.name_simple}
          </Text>
          <Text style={[styles.cardMeaning, { color: colors.mutedForeground }]} numberOfLines={1}>
            {item.translated_name?.name ?? ""}
          </Text>
          <View style={styles.metaRow}>
            <Text style={[styles.metaRev, { color: accentColor }]}>
              {isMakkah ? "Meccan" : "Medinan"}
            </Text>
            <View style={[styles.metaDot, { backgroundColor: colors.border }]} />
            <Text style={[styles.metaVerses, { color: colors.mutedForeground }]}>
              {item.verses_count} verses
            </Text>
          </View>
        </View>

        <Text style={[styles.arabicName, { color: colors.primary, fontFamily: "PlayfairDisplay_700Bold" }]}>
          {item.name_arabic}
        </Text>
      </Pressable>
    );
  };

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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingRight: 8 }}>
          {FILTERS.map((f) => {
            const active = revFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => setRevFilter(f.key)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? f.activeColor : colors.card,
                    borderColor: active ? f.activeColor : colors.border,
                  },
                ]}
                testID={`filter-${f.key}`}
              >
                <Ionicons
                  name={f.icon}
                  size={15}
                  color={active ? "#FFFFFF" : colors.mutedForeground}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.filterChipText, { color: active ? "#FFFFFF" : colors.foreground }]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
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
  searchIconBtn: { width: 44, height: 44, borderRadius: 8, alignItems: "center", justifyContent: "center", marginTop: 2 },
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 4,
  },
  filterChipText: { fontSize: 13, fontWeight: "700" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
    paddingVertical: 18,
    paddingLeft: 22,
    paddingRight: 14,
    gap: 12,
  },
  accentStrip: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  diamondWrap: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  diamond: {
    width: 36,
    height: 36,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "45deg" }],
  },
  diamondNum: {
    fontSize: 13,
    fontWeight: "700",
    transform: [{ rotate: "-45deg" }],
  },
  cardBody: { flex: 1 },
  cardName: { fontSize: 17, fontWeight: "700" },
  cardMeaning: { fontSize: 12, marginTop: 2 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    gap: 6,
  },
  metaRev: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  metaDot: { width: 3, height: 3, borderRadius: 1.5 },
  metaVerses: { fontSize: 11 },
  arabicName: { fontSize: 24, textAlign: "right" },
  listContent: { paddingTop: 8, paddingBottom: 0 },
  loadingText: { fontSize: 15, marginTop: 8 },
  errorText: { fontSize: 15 },
  emptyText: { fontSize: 15 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { fontSize: 15, fontWeight: "600" },
});
