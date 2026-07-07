import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { AppDrawer } from "@/components/AppDrawer";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === "ios";
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Float the bar above the home indicator (or above the bottom edge on devices without one)
  const bottomOffset = insets.bottom > 0 ? insets.bottom + 6 : 16;
  const BAR_H = 62;

  const ACTIVE = colors.accent;        // gold #C9A84C
  const INACTIVE = "rgba(250,248,243,0.50)";

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: ACTIVE,
          tabBarInactiveTintColor: INACTIVE,
          tabBarStyle: {
            position: "absolute",
            bottom: bottomOffset,
            left: 20,
            right: 20,
            height: BAR_H,
            backgroundColor: colors.primary,
            borderRadius: 22,
            borderTopWidth: 0,
            elevation: 14,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.32,
            shadowRadius: 18,
            overflow: "visible",
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: "Inter_600SemiBold",
            letterSpacing: 0.3,
            marginBottom: 2,
          },
          tabBarItemStyle: {
            paddingTop: 8,
          },
          tabBarBackground: () => null,
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

        {/* ── Qibla — inline, no raised bubble ── */}
        <Tabs.Screen
          name="qibla"
          options={{
            title: "Qibla",
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.qiblaIcon, focused && { backgroundColor: colors.accent + "22" }]}>
                <MaterialCommunityIcons
                  name="compass"
                  size={24}
                  color={color}
                />
              </View>
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
                style={styles.moreBtn}
                onPress={() => setDrawerOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="More options"
              >
                <Feather name="menu" size={22} color={INACTIVE} />
                <Text style={[styles.moreLabel, { color: INACTIVE }]}>More</Text>
              </TouchableOpacity>
            ),
          }}
        />

        {/* ── Hidden routes — removed from bar layout ── */}
        <Tabs.Screen name="blog" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
      </Tabs>

      <AppDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  qiblaIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  moreBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingTop: 8,
    paddingBottom: 6,
    gap: 2,
  },
  moreLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
});
