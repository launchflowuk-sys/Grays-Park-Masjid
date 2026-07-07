import { Ionicons } from "@expo/vector-icons";
import { useGetBlogPostBySlug } from "@workspace/api-client-react";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Share,
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
    month: "long",
    year: "numeric",
  });
}

export default function BlogPostScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { width } = useWindowDimensions();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const contentWidth = width - 40;

  const { data: post, isLoading, isError } = useGetBlogPostBySlug(slug ?? "") as {
    data: BlogPost | undefined;
    isLoading: boolean;
    isError: boolean;
  };

  const tagsStyles = {
    p: {
      color: colors.foreground,
      fontSize: 16,
      lineHeight: 26,
      marginBottom: 8,
    },
    h1: { color: colors.foreground, fontSize: 26, fontWeight: "700" as const, marginBottom: 8 },
    h2: { color: colors.foreground, fontSize: 22, fontWeight: "700" as const, marginBottom: 6 },
    h3: { color: colors.foreground, fontSize: 18, fontWeight: "600" as const, marginBottom: 4 },
    a: { color: colors.primary },
    strong: { color: colors.foreground, fontWeight: "700" as const },
    em: { color: colors.foreground, fontStyle: "italic" as const },
    li: { color: colors.foreground, fontSize: 16, lineHeight: 24 },
    blockquote: {
      borderLeftColor: colors.accent,
      borderLeftWidth: 3,
      paddingLeft: 12,
      marginLeft: 0,
      color: colors.mutedForeground,
      fontStyle: "italic" as const,
    },
  };

  async function handleShare() {
    if (!post) return;
    try {
      await Share.share({
        title: post.title,
        message: `${post.title}\n\n${post.excerpt ?? ""}${post.excerpt ? "…\n\n" : ""}Read more at Grays Park Masjid`,
      });
    } catch {}
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Floating header buttons */}
      <View style={[styles.floatingHeader, { top: topPad + 8 }]}>
        <TouchableOpacity
          style={[styles.floatingBtn, { backgroundColor: colors.card + "F0" }]}
          onPress={() => router.back()}
          testID="back-btn"
        >
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        {post && (
          <TouchableOpacity
            style={[styles.floatingBtn, { backgroundColor: colors.card + "F0" }]}
            onPress={handleShare}
            testID="share-btn"
          >
            <Ionicons name="share-outline" size={22} color={colors.foreground} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading && (
        <View style={[styles.centerFlex, { paddingTop: topPad + 60 }]}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading article…</Text>
        </View>
      )}

      {isError && (
        <View style={[styles.centerFlex, { paddingTop: topPad + 60 }]}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.mutedForeground} />
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Article not found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.retryText, { color: colors.primaryForeground }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !isError && post && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        >
          {/* Hero */}
          {post.coverImage ? (
            <Image source={{ uri: post.coverImage }} style={styles.coverImage} contentFit="cover" />
          ) : (
            <View style={[styles.coverPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={[styles.coverArabic, { color: colors.accent }]}>بسم الله</Text>
            </View>
          )}

          <View style={styles.articleBody}>
            {post.category && (
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: colors.accent + "20", borderColor: colors.accent + "40" },
                ]}
              >
                <Text style={[styles.categoryText, { color: colors.accent }]}>{post.category}</Text>
              </View>
            )}

            <Text
              style={[
                styles.articleTitle,
                { color: colors.foreground, fontFamily: "PlayfairDisplay_700Bold" },
              ]}
            >
              {post.title}
            </Text>

            <View style={styles.metaRow}>
              {post.author && (
                <>
                  <Ionicons name="person-outline" size={13} color={colors.mutedForeground} />
                  <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{post.author}</Text>
                  <Text style={[styles.metaDot, { color: colors.border }]}>·</Text>
                </>
              )}
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {formatDate(post.publishedAt)}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.accent }]} />

            {post.excerpt && (
              <Text
                style={[
                  styles.excerpt,
                  { color: colors.foreground, fontFamily: "PlayfairDisplay_400Regular_Italic" },
                ]}
              >
                {post.excerpt}
              </Text>
            )}

            {/* HTML content rendered properly */}
            <RenderHtml
              contentWidth={contentWidth}
              source={{ html: post.content }}
              tagsStyles={tagsStyles}
              systemFonts={[...defaultSystemFonts, "Inter_400Regular", "PlayfairDisplay_700Bold"]}
              baseStyle={{ color: colors.foreground }}
            />

            {/* Share CTA at bottom */}
            <TouchableOpacity
              onPress={handleShare}
              style={[styles.shareRow, { borderColor: colors.border }]}
              testID="share-btn-bottom"
            >
              <Ionicons name="share-outline" size={18} color={colors.primary} />
              <Text style={[styles.shareText, { color: colors.primary }]}>Share this article</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centerFlex: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  floatingHeader: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  floatingBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollContent: {},
  coverImage: { width: "100%", height: 280 },
  coverPlaceholder: { width: "100%", height: 200, alignItems: "center", justifyContent: "center" },
  coverArabic: { fontSize: 36 },
  articleBody: { padding: 20, gap: 12 },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryText: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  articleTitle: { fontSize: 26, fontWeight: "700", lineHeight: 36 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 13 },
  metaDot: { fontSize: 13 },
  divider: { height: 2, borderRadius: 1, marginVertical: 4, opacity: 0.4 },
  excerpt: { fontSize: 17, lineHeight: 26, fontStyle: "italic" },
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  shareText: { fontSize: 15, fontWeight: "600" },
  loadingText: { fontSize: 15, marginTop: 8 },
  errorText: { fontSize: 15 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { fontSize: 15, fontWeight: "600" },
});
