import { Ionicons } from "@expo/vector-icons";
import { useListEventsPublic } from "@workspace/api-client-react";
import { Image } from "expo-image";
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

type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  startsAt: string;
  endsAt?: string | null;
  location?: string | null;
  imageUrl?: string | null;
};

function formatDateRange(start: string, end?: string | null): string {
  const s = new Date(start);
  const label = s.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  if (!end || end === start) return label;
  const e = new Date(end);
  return `${label} — ${e.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
}

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: events, isLoading, isError, refetch } = useListEventsPublic();

  const upcoming = [...((events ?? []) as EventItem[])]
    .filter((e) => new Date(e.endsAt ?? e.startsAt) >= new Date())
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  const renderEvent = ({ item, index }: { item: EventItem; index: number }) => {
    const startDate = new Date(item.startsAt);
    const day = startDate.getDate().toString();
    const month = startDate.toLocaleString("en-GB", { month: "short" }).toUpperCase();
    const isFeatured = index === 0;

    return (
      <View
        style={[
          styles.eventCard,
          isFeatured && styles.featuredCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={isFeatured ? styles.featuredImage : styles.regularImage} contentFit="cover" />
        )}
        {!item.imageUrl && isFeatured && (
          <View style={[styles.featuredImage, { backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }]}>
            <Text style={{ fontSize: 40 }}>🕌</Text>
          </View>
        )}
        <View style={styles.cardBody}>
          <View style={styles.topRow}>
            <View style={[styles.dateBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.dateDay, { color: colors.accent }]}>{day}</Text>
              <Text style={[styles.dateMonth, { color: colors.primaryForeground + "CC" }]}>{month}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.eventTitle,
                  { color: colors.foreground, fontFamily: "PlayfairDisplay_700Bold" },
                  isFeatured && styles.featuredTitle,
                ]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <Text style={[styles.eventDate, { color: colors.mutedForeground }]} numberOfLines={1}>
                {formatDateRange(item.startsAt, item.endsAt)}
              </Text>
              {item.location && (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={13} color={colors.mutedForeground} />
                  <Text style={[styles.locationText, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {item.location}
                  </Text>
                </View>
              )}
            </View>
          </View>
          {item.description && (
            <Text style={[styles.eventDesc, { color: colors.mutedForeground }]} numberOfLines={isFeatured ? 3 : 2}>
              {item.description}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "PlayfairDisplay_700Bold" }]}>Events</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Upcoming at the Masjid</Text>
      </View>

      {isLoading && (
        <View style={styles.centerFlex}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading events…</Text>
        </View>
      )}

      {isError && (
        <View style={styles.centerFlex}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.mutedForeground} />
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Unable to load events</Text>
          <TouchableOpacity onPress={() => refetch()} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
            <Text style={[styles.retryText, { color: colors.primaryForeground }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoading && !isError && (
        <FlatList
          data={upcoming}
          keyExtractor={(item) => item.id}
          renderItem={renderEvent}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
          scrollEnabled={upcoming.length > 0}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.centerFlex}>
              <Ionicons name="calendar-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No upcoming events</Text>
              <Text style={[styles.emptySubText, { color: colors.mutedForeground + "99" }]}>
                Check back soon for new events
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
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 28, fontWeight: "700" },
  subtitle: { fontSize: 14, marginTop: 2 },
  listContent: { padding: 16, gap: 12 },
  eventCard: { borderRadius: 16, overflow: "hidden", borderWidth: 1 },
  featuredCard: {},
  featuredImage: { width: "100%", height: 180 },
  regularImage: { width: "100%", height: 120 },
  cardBody: { padding: 16, gap: 10 },
  topRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  dateBadge: {
    width: 48,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    gap: 2,
    flexShrink: 0,
  },
  dateDay: { fontSize: 20, fontWeight: "700" },
  dateMonth: { fontSize: 11, fontWeight: "600" },
  eventTitle: { fontSize: 16, fontWeight: "700", lineHeight: 22, marginBottom: 3 },
  featuredTitle: { fontSize: 19 },
  eventDate: { fontSize: 12 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 3 },
  locationText: { fontSize: 12, flex: 1 },
  eventDesc: { fontSize: 13, lineHeight: 19 },
  loadingText: { fontSize: 15, marginTop: 8 },
  errorText: { fontSize: 15 },
  emptyText: { fontSize: 16, fontWeight: "600" },
  emptySubText: { fontSize: 14 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { fontSize: 15, fontWeight: "600" },
});
