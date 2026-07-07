import { Ionicons } from "@expo/vector-icons";
import { useListBlogPostsPublic } from "@workspace/api-client-react";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  content: string;
  category?: string | null;
  publishedAt?: string | null;
  coverImage?: string | null;
  author?: string | null;
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BlogScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: posts, isLoading, isError, refetch } = useListBlogPostsPublic();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const categories = Array.from(
    new Set((posts ?? []).map((p: BlogPost) => p.category).filter(Boolean))
  ) as string[];

  const filtered = activeCategory
    ? (posts ?? []).filter((p: BlogPost) => p.category === activeCategory)
    : (posts ?? []);

  const renderPost = ({ item, index }: { item: BlogPost; index: number }) => {
    const isFeatured = index === 0 && !activeCategory;
    const cardHeight = isFeatured ? 280 : 210;

    return (
      <Pressable
        style={({ pressed }) => [styles.card, { opacity: pressed ? 0.93 : 1 }]}
        onPress={() => router.push(`/blog/${item.slug}`)}
        testID={`blog-post-${item.id}`}
      >
        <View style={[styles.imageContainer, { height: cardHeight }]}>
          {item.coverImage ? (
            <Image
              source={{ uri: item.coverImage }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }]}>
              <Text style={{ fontSize: 36, color: colors.accent }}>بسم الله</Text>
            </View>
          )}

          {/* Magazine gradient overlay — transparent top to dark green bottom */}
          <LinearGradient
            colors={["transparent", "rgba(27,61,47,0.55)", "rgba(27,61,47,0.94)"]}
            locations={[0.3, 0.62, 1]}
            style={StyleSheet.absoluteFill}
          />

          {/* Content overlaid on gradient */}
          <View style={styles.cardOverlay}>
            {item.category && (
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>{item.category}</Text>
              </View>
            )}
            <Text
              style={[styles.cardTitle, isFeatured && styles.cardTitleFeatured]}
              numberOfLines={isFeatured ? 3 : 2}
            >
              {item.title}
            </Text>
            <View style={styles.cardMeta}>
              {item.author && (
                <Text style={styles.cardMetaText}>{item.author}</Text>
              )}
              {item.author && item.publishedAt && (
                <Text style={styles.cardMetaDot}>·</Text>
              )}
              <Text style={styles.cardMetaText}>{formatDate(item.publishedAt)}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "PlayfairDisplay_700Bold" }]}>
          From the Masjid
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Articles, reflections &amp; news
        </Text>
        {categories.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {[null, ...categories].map((cat) => (
              <TouchableOpacity
                key={cat ?? "all"}
                onPress={() => setActiveCategory(cat)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: activeCategory === cat ? colors.primary : colors.muted,
                    borderColor: activeCategory === cat ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: activeCategory === cat ? colors.primaryForeground : colors.foreground },
                  ]}
                >
                  {cat ?? "All"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {isLoading && (
        <View style={styles.centerFlex}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading articles…</Text>
        </View>
      )}

      {isError && (
        <View style={styles.centerFlex}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.mutedForeground} />
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Unable to load blog posts</Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.retryText, { color: colors.primaryForeground }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !isError && (
        <FlatList
          data={filtered as BlogPost[]}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
          scrollEnabled={filtered.length > 0}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.centerFlex}>
              <Ionicons name="newspaper-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No articles yet</Text>
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
  title: { fontSize: 28, fontWeight: "700" },
  subtitle: { fontSize: 14, marginTop: 2, marginBottom: 12 },
  categoryScroll: { marginBottom: 4 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryChipText: { fontSize: 13, fontWeight: "500" },
  listContent: { paddingTop: 12, paddingHorizontal: 16, gap: 14 },
  card: { borderRadius: 16, overflow: "hidden" },
  imageContainer: { borderRadius: 16, overflow: "hidden", position: "relative" },
  cardOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    gap: 6,
  },
  categoryPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(201,168,76,0.25)",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 2,
  },
  categoryPillText: {
    color: "#C9A84C",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  cardTitle: {
    color: "#FAF8F3",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 25,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  cardTitleFeatured: { fontSize: 22, lineHeight: 30 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 5 },
  cardMetaText: { color: "rgba(250,248,243,0.72)", fontSize: 12 },
  cardMetaDot: { color: "rgba(250,248,243,0.5)", fontSize: 12 },
  loadingText: { fontSize: 15, marginTop: 8 },
  errorText: { fontSize: 15 },
  emptyText: { fontSize: 15 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { fontSize: 15, fontWeight: "600" },
});
