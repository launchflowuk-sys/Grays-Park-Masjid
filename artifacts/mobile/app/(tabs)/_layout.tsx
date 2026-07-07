import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { AppDrawer } from "@/components/AppDrawer";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === "ios";
  const [drawerOpen, setDrawerOpen] = useState(false);

  const ACTIVE = colors.accent;
  const INACTIVE = "rgba(250,248,243,0.45)";
  const BAR_HEIGHT = 56 + insets.bottom;

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: ACTIVE,
          tabBarInactiveTintColor: INACTIVE,
          tabBarStyle: {
            height: BAR_HEIGHT,
            backgroundColor: colors.primary,
            borderTopWidth: 1,
            borderTopColor: "rgba(201,168,76,0.25)",
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: "Inter_600SemiBold",
            letterSpacing: 0.2,
            marginBottom: insets.bottom > 0 ? insets.bottom - 2 : 6,
          },
          tabBarItemStyle: {
            paddingTop: 8,
          },
        }}
      >
        {/* ── Prayer ── */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Prayer",
            tabBarIcon: ({ color, focused }) =>
              isIOS ? (
                <SymbolView
                  name={focused ? "moon.stars.fill" : "moon.stars"}
                  tintColor={color}
                  size={22}
                />
              ) : (
                <MaterialCommunityIcons name="mosque" size={22} color={color} />
              ),
          }}
        />

        {/* ── Qur'an ── */}
        <Tabs.Screen
          name="quran"
          options={{
            title: "Qur'an",
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name="book.pages" tintColor={color} size={22} />
              ) : (
                <Feather name="book-open" size={21} color={color} />
              ),
          }}
        />

        {/* ── Qibla ── */}
        <Tabs.Screen
          name="qibla"
          options={{
            title: "Qibla",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="compass" size={22} color={color} />
            ),
          }}
        />

        {/* ── Events ── */}
        <Tabs.Screen
          name="events"
          options={{
            title: "Events",
            tabBarIcon: ({ color }) =>
              isIOS ? (
                <SymbolView name="calendar" tintColor={color} size={22} />
              ) : (
                <Feather name="calendar" size={21} color={color} />
              ),
          }}
        />

        {/* ── More — opens drawer ── */}
        <Tabs.Screen
          name="more"
          options={{
            title: "More",
            tabBarButton: () => (
              <TouchableOpacity
                style={[styles.moreBtn, { paddingBottom: insets.bottom > 0 ? insets.bottom - 2 : 6 }]}
                onPress={() => setDrawerOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="More options"
              >
                <Feather name="menu" size={22} color={INACTIVE} />
                <Text style={styles.moreLabel}>More</Text>
              </TouchableOpacity>
            ),
          }}
        />

        {/* ── Hidden routes ── */}
        <Tabs.Screen name="blog" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
      </Tabs>

      <AppDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  moreBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingTop: 8,
    gap: 3,
  },
  moreLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
    color: "rgba(250,248,243,0.45)",
    marginBottom: 0,
  },
});
