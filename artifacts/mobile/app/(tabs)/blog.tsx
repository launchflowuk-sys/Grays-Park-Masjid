import { Ionicons } from "@expo/vector-icons";
import { useListBlogPostsPublic } from "@workspace/api-client-react";
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
import { truncateText } from "@/utils/htmlToText";

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
    const snippet =
      item.excerpt ?? truncateText(item.content, isFeatured ? 140 : 80);
    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          isFeatured ? styles.featuredCard : styles.regularCard,
          {
            backgroundColor: pressed ? colors.muted : colors.card,
            borderColor: colors.border,
          },
        ]}
        onPress={() => router.push(`/blog/${item.slug}`)}
        testID={`blog-post-${item.id}`}
      >
        {item.coverImage ? (
          <Image
            source={{ uri: item.coverImage }}
            style={[styles.coverImage, isFeatured ? styles.featuredImage : styles.regularImage]}
            contentFit="cover"
          />
        ) : (
          <View
            style={[
              styles.coverImagePlaceholder,
              isFeatured ? styles.featuredImage : styles.regularImage,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text style={[styles.placeholderArabic, { color: colors.accent }]}>بسم الله</Text>
          </View>
        )}
        <View style={styles.cardBody}>
          {item.category && (
            <View style={[styles.categoryBadge, { backgroundColor: colors.accent + "20", borderColor: colors.accent + "40" }]}>
              <Text style={[styles.categoryText, { color: colors.accent }]}>{item.category}</Text>
            </View>
          )}
          <Text
            style={[styles.postTitle, { color: colors.foreground, fontFamily: "PlayfairDisplay_700Bold" }, isFeatured && styles.featuredTitle]}
            numberOfLines={isFeatured ? 3 : 2}
          >
            {item.title}
          </Text>
          {snippet ? (
            <Text style={[styles.excerpt, { color: colors.mutedForeground }]} numberOfLines={isFeatured ? 3 : 2}>
              {snippet}
            </Text>
          ) : null}
          <View style={styles.meta}>
            {item.author && (
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{item.author}</Text>
            )}
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {formatDate(item.publishedAt)}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
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
                <Text style={[styles.categoryChipText, { color: activeCategory === cat ? colors.primaryForeground : colors.foreground }]}>
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
          <TouchableOpacity onPress={() => refetch()} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
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
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />
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
  listContent: { paddingTop: 12, paddingHorizontal: 16, gap: 12 },
  card: { borderRadius: 14, overflow: "hidden", borderWidth: 1 },
  featuredCard: { marginBottom: 4 },
  regularCard: {},
  coverImage: { width: "100%" },
  coverImagePlaceholder: { width: "100%", alignItems: "center", justifyContent: "center" },
  featuredImage: { height: 220 },
  regularImage: { height: 160 },
  placeholderArabic: { fontSize: 28, fontWeight: "400" },
  cardBody: { padding: 16, gap: 6 },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryText: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  postTitle: { fontSize: 19, fontWeight: "700", lineHeight: 26 },
  featuredTitle: { fontSize: 22, lineHeight: 30 },
  excerpt: { fontSize: 14, lineHeight: 20 },
  meta: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  metaText: { fontSize: 12 },
  loadingText: { fontSize: 15, marginTop: 8 },
  errorText: { fontSize: 15 },
  emptyText: { fontSize: 15 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { fontSize: 15, fontWeight: "600" },
});
