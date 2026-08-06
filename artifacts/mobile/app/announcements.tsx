import { Ionicons } from "@expo/vector-icons";
import { useListAnnouncementsPublic, type Announcement } from "@workspace/api-client-react";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AnnouncementsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data, isLoading, isError, refetch } = useListAnnouncementsPublic();

  const sorted = [...((data ?? []) as Announcement[])].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return (
      new Date(b.publishedAt ?? b.createdAt).getTime() -
      new Date(a.publishedAt ?? a.createdAt).getTime()
    );
  });

  const renderAnnouncement = ({ item }: { item: Announcement }) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: item.pinned ? colors.accent + "60" : colors.border,
        },
        item.pinned && { backgroundColor: colors.accent + "0D" },
      ]}
    >
      {item.pinned && <View style={[styles.accentStrip, { backgroundColor: colors.accent }]} />}
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} contentFit="cover" />
      )}
      <View style={styles.cardBody}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.cardTitle,
              { color: colors.foreground, fontFamily: "PlayfairDisplay_700Bold" },
            ]}
          >
            {item.title}
          </Text>
          {item.pinned && (
            <View style={[styles.pinnedBadge, { backgroundColor: colors.accent }]}>
              <Ionicons name="pin" size={11} color={colors.accentForeground} />
              <Text style={[styles.pinnedText, { color: colors.accentForeground }]}>Pinned</Text>
            </View>
          )}
        </View>
        <Text style={[styles.cardBodyText, { color: colors.mutedForeground }]}>{item.body}</Text>
        {item.publishedAt && (
          <Text style={[styles.cardDate, { color: colors.mutedForeground + "99" }]}>
            {formatDate(item.publishedAt)}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.card }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Go back"
          testID="back-btn"
        >
          <Ionicons name="chevron-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.title, { color: colors.foreground, fontFamily: "PlayfairDisplay_700Bold" }]}
          >
            Announcements
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Latest notices from the Masjid
          </Text>
        </View>
      </View>

      {isLoading && (
        <View style={styles.centerFlex}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
            Loading announcements…
          </Text>
        </View>
      )}

      {isError && (
        <View style={styles.centerFlex}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.mutedForeground} />
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
            Unable to load announcements
          </Text>
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
          data={sorted}
          keyExtractor={(item) => item.id}
          renderItem={renderAnnouncement}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={sorted.length > 0}
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
              <Ionicons name="megaphone-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No announcements at this time
              </Text>
              <Text style={[styles.emptySubText, { color: colors.mutedForeground + "99" }]}>
                Check back soon for updates
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
  centerFlex: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, paddingTop: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
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
  title: { fontSize: 26, fontWeight: "700" },
  subtitle: { fontSize: 13, marginTop: 2 },
  listContent: { padding: 16, gap: 12 },
  card: { borderRadius: 16, overflow: "hidden", borderWidth: 1 },
  accentStrip: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    zIndex: 1,
  },
  cardImage: { width: "100%", height: 160 },
  cardBody: { padding: 16, gap: 8 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  cardTitle: { flex: 1, fontSize: 17, fontWeight: "700", lineHeight: 24 },
  pinnedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    flexShrink: 0,
    marginTop: 2,
  },
  pinnedText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  cardBodyText: { fontSize: 14, lineHeight: 21 },
  cardDate: { fontSize: 12, marginTop: 4 },
  loadingText: { fontSize: 15, marginTop: 8 },
  errorText: { fontSize: 15 },
  emptyText: { fontSize: 16, fontWeight: "600" },
  emptySubText: { fontSize: 14 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { fontSize: 15, fontWeight: "600" },
});
