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
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  imageUrl?: string | null;
};

function formatEventDate(dateStr: string): { day: string; month: string; year: string } {
  const d = new Date(dateStr);
  return {
    day: d.getDate().toString(),
    month: d.toLocaleString("en-GB", { month: "short" }).toUpperCase(),
    year: d.getFullYear().toString(),
  };
}

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
  return `${label} — ${e.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`;
}

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const { data: events, isLoading, isError, refetch } = useListEventsPublic();

  const sorted = [...(events ?? []) as EventItem[]].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const upcoming = sorted.filter((e) => {
    const endDate = e.endDate ?? e.startDate;
    return new Date(endDate) >= new Date();
  });

  const past = sorted.filter((e) => {
    const endDate = e.endDate ?? e.startDate;
    return new Date(endDate) < new Date();
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const renderEvent = ({ item }: { item: EventItem }) => {
    const { day, month, year } = formatEventDate(item.startDate);
    const isUpcoming = new Date(item.endDate ?? item.startDate) >= new Date();
    return (
      <View style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.dateBadge, { backgroundColor: isUpcoming ? colors.primary : colors.muted }]}>
          <Text style={[styles.dateDay, { color: isUpcoming ? colors.accent : colors.mutedForeground }]}>{day}</Text>
          <Text style={[styles.dateMonth, { color: isUpcoming ? colors.primaryForeground + "CC" : colors.mutedForeground }]}>{month}</Text>
          <Text style={[styles.dateYear, { color: isUpcoming ? colors.primaryForeground + "88" : colors.mutedForeground + "88" }]}>{year}</Text>
        </View>
        <View style={styles.eventContent}>
          {item.imageUrl && (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.eventImage}
              contentFit="cover"
            />
          )}
          <Text style={[styles.eventTitle, { color: colors.foreground, fontFamily: "PlayfairDisplay_700Bold" }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.eventDate, { color: colors.mutedForeground }]} numberOfLines={1}>
            {formatDateRange(item.startDate, item.endDate)}
          </Text>
          {item.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color={colors.mutedForeground} />
              <Text style={[styles.locationText, { color: colors.mutedForeground }]} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
          )}
          {item.description && (
            <Text style={[styles.eventDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const ListHeader = () => (
    <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.foreground, fontFamily: "PlayfairDisplay_700Bold" }]}>Events</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>What's happening at the Masjid</Text>
    </View>
  );

  type Section = { type: "header-upcoming" | "header-past" | "event"; data?: EventItem };
  const sections: Section[] = [];
  if (upcoming.length > 0) {
    sections.push({ type: "header-upcoming" });
    upcoming.forEach((e) => sections.push({ type: "event", data: e }));
  }
  if (past.length > 0) {
    sections.push({ type: "header-past" });
    past.forEach((e) => sections.push({ type: "event", data: e }));
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ListHeader />

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
          data={sections}
          keyExtractor={(item, idx) => (item.type === "event" ? item.data!.id : `${item.type}-${idx}`)}
          renderItem={({ item: section }) => {
            if (section.type === "header-upcoming") {
              return (
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Upcoming</Text>
              );
            }
            if (section.type === "header-past") {
              return (
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Past</Text>
              );
            }
            if (section.type === "event" && section.data) {
              return renderEvent({ item: section.data });
            }
            return null;
          }}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
          scrollEnabled={sections.length > 0}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.centerFlex}>
              <Ionicons name="calendar-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No events scheduled</Text>
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
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 28, fontWeight: "700" },
  subtitle: { fontSize: 14, marginTop: 2 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  listContent: { paddingBottom: 20 },
  eventCard: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
  },
  dateBadge: {
    width: 58,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 2,
  },
  dateDay: { fontSize: 22, fontWeight: "700" },
  dateMonth: { fontSize: 12, fontWeight: "600" },
  dateYear: { fontSize: 10 },
  eventContent: { flex: 1, padding: 14, gap: 4 },
  eventImage: { width: "100%", height: 100, borderRadius: 6, marginBottom: 6 },
  eventTitle: { fontSize: 16, fontWeight: "700", lineHeight: 22 },
  eventDate: { fontSize: 12 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  locationText: { fontSize: 12, flex: 1 },
  eventDesc: { fontSize: 13, lineHeight: 18 },
  loadingText: { fontSize: 15, marginTop: 8 },
  errorText: { fontSize: 15 },
  emptyText: { fontSize: 15 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { fontSize: 15, fontWeight: "600" },
});
