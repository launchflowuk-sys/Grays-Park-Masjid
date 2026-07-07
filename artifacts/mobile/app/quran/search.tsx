import { Ionicons } from "@expo/vector-icons";
import { useSearchQuran, getSearchQuranQueryKey } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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

type SearchResult = {
  verse_key: string;
  text: string;
  surah_name?: string;
  surah_number?: number;
  verse_number?: number;
  translations?: Array<{ text: string; resource_name?: string }>;
};

export default function QuranSearchScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data, isLoading } = useSearchQuran(
    { q: submitted } as Record<string, unknown>,
    {
      query: {
        enabled: submitted.length >= 2,
        queryKey: getSearchQuranQueryKey({ q: submitted }),
      },
    }
  );

  const results: SearchResult[] = (data as { results?: SearchResult[] } | undefined)?.results ?? [];
  const total: number = (data as { total_results?: number } | undefined)?.total_results ?? 0;

  function submit() {
    if (query.trim().length >= 2) {
      setSubmitted(query.trim());
    }
  }

  function cleanTranslation(text: string) {
    return text.replace(/<sup[^>]*>.*?<\/sup>/g, "").replace(/<[^>]*>/g, "");
  }

  const renderResult = ({ item }: { item: SearchResult }) => {
    const surahNum = item.verse_key?.split(":")?.[0];
    const translation = cleanTranslation(item.translations?.[0]?.text ?? "");
    return (
      <Pressable
        style={({ pressed }) => [
          styles.resultRow,
          {
            backgroundColor: pressed ? colors.muted : colors.card,
            borderColor: colors.border,
          },
        ]}
        onPress={() => surahNum && router.push(`/quran/${surahNum}`)}
      >
        <View style={[styles.verseKeyBadge, { backgroundColor: colors.primary + "15" }]}>
          <Text style={[styles.verseKey, { color: colors.primary }]}>{item.verse_key}</Text>
        </View>
        {item.text ? (
          <Text style={[styles.arabicText, { color: colors.foreground }]} numberOfLines={2}>
            {item.text}
          </Text>
        ) : null}
        {translation ? (
          <Text style={[styles.translationText, { color: colors.mutedForeground }]} numberOfLines={2}>
            {translation}
          </Text>
        ) : null}
        {item.surah_name && (
          <Text style={[styles.surahName, { color: colors.accent }]}>{item.surah_name}</Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} testID="back-btn">
          <Ionicons name="chevron-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border, flex: 1 }]}>
          <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Search the Qur'an…"
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={submit}
            autoFocus
            returnKeyType="search"
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(""); setSubmitted(""); }}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={submit} style={[styles.searchBtn, { backgroundColor: colors.primary }]}>
          <Text style={[styles.searchBtnText, { color: colors.primaryForeground }]}>Search</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.centerFlex}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Searching…</Text>
        </View>
      )}

      {!isLoading && submitted && results.length === 0 && (
        <View style={styles.centerFlex}>
          <Ionicons name="search-outline" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No results for "{submitted}"</Text>
        </View>
      )}

      {!isLoading && !submitted && (
        <View style={styles.centerFlex}>
          <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
            Search for a word or phrase in the Qur'an
          </Text>
        </View>
      )}

      {!isLoading && results.length > 0 && (
        <>
          <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
            {total} results for "{submitted}"
          </Text>
          <FlatList
            data={results}
            keyExtractor={(item) => item.verse_key}
            renderItem={renderResult}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + 20 },
            ]}
            ItemSeparatorComponent={() => (
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centerFlex: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  input: { flex: 1, fontSize: 15, padding: 0 },
  searchBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  searchBtnText: { fontSize: 14, fontWeight: "600" },
  resultCount: {
    fontSize: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listContent: { paddingHorizontal: 16, paddingTop: 4 },
  resultRow: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 8,
  },
  verseKeyBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verseKey: { fontSize: 12, fontWeight: "700" },
  arabicText: { fontSize: 20, textAlign: "right", lineHeight: 34 },
  translationText: { fontSize: 14, lineHeight: 20 },
  surahName: { fontSize: 12, fontWeight: "600" },
  separator: { height: 0 },
  loadingText: { fontSize: 14 },
  emptyText: { fontSize: 15, textAlign: "center" },
  hintText: { fontSize: 15, textAlign: "center" },
});
