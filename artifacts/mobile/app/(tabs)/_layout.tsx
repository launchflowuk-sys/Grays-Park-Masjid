import { BlurView } from "expo-blur";
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
  const isWeb = Platform.OS === "web";
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Respect the home-indicator safe area so nothing gets clipped
  const BOTTOM_INSET = insets.bottom;
  const TAB_INNER_H = 56; // height for icon + label row
  const TAB_H = TAB_INNER_H + BOTTOM_INSET;

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.tabBarActive,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarStyle: {
            position: "absolute",
            backgroundColor: isIOS ? colors.tabBar + "E8" : colors.tabBar,
            borderTopWidth: 0,
            elevation: 0,
            height: TAB_H,
            paddingBottom: BOTTOM_INSET,
            overflow: "visible",
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: "Inter_600SemiBold",
            letterSpacing: 0.2,
          },
          tabBarItemStyle: {
            paddingTop: 8,
          },
          tabBarBackground: () =>
            isIOS ? (
              <BlurView
                intensity={60}
                tint="dark"
                style={[StyleSheet.absoluteFill, { backgroundColor: colors.tabBar + "CC" }]}
              />
            ) : isWeb ? (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.tabBar }]} />
            ) : null,
        }}
      >
        {/* ── Prayer ── */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Prayer",
            tabBarIcon: ({ color, focused }) =>
              isIOS ? (
                <SymbolView name={focused ? "moon.stars.fill" : "moon.stars"} tintColor={color} size={22} />
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

        {/* ── Qibla — elevated centre button ── */}
        <Tabs.Screen
          name="qibla"
          options={{
            title: "Qibla",
            tabBarButton: (props) => {
              const selected = props.accessibilityState?.selected ?? false;
              return (
                <TouchableOpacity
                  onPress={props.onPress ?? undefined}
                  onLongPress={props.onLongPress ?? undefined}
                  style={[styles.qiblaWrapper, { paddingBottom: BOTTOM_INSET }]}
                  accessibilityRole="button"
                  accessibilityLabel="Qibla"
                  accessibilityState={{ selected }}
                >
                  <View
                    style={[
                      styles.qiblaCircle,
                      {
                        backgroundColor: selected ? colors.accent : colors.secondary,
                        borderColor: colors.accent,
                        shadowColor: colors.accent,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="compass"
                      size={28}
                      color={selected ? colors.primary : colors.accent}
                    />
                  </View>
                  <Text
                    style={[
                      styles.qiblaLabel,
                      { color: selected ? colors.tabBarActive : colors.tabBarInactive },
                    ]}
                  >
                    Qibla
                  </Text>
                </TouchableOpacity>
              );
            },
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

        {/* ── More — opens AppDrawer, never navigates ── */}
        <Tabs.Screen
          name="more"
          options={{
            title: "More",
            tabBarButton: () => (
              <TouchableOpacity
                style={[styles.moreWrapper, { paddingBottom: BOTTOM_INSET }]}
                onPress={() => setDrawerOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="More options"
              >
                <Feather name="menu" size={22} color={colors.tabBarInactive} />
                <Text style={[styles.moreLabel, { color: colors.tabBarInactive }]}>More</Text>
              </TouchableOpacity>
            ),
          }}
        />

        {/* ── Blog — hidden from bar; navigable via AppDrawer ── */}
        <Tabs.Screen
          name="blog"
          options={{
            title: "Blog",
            tabBarButton: () => null,
          }}
        />

        {/* ── Settings/Alerts — hidden from bar; navigable via AppDrawer ── */}
        <Tabs.Screen
          name="settings"
          options={{
            title: "Alerts",
            tabBarButton: () => null,
          }}
        />
      </Tabs>

      <AppDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  qiblaWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingTop: 4,
    gap: 2,
  },
  qiblaCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateY: -12 }],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  qiblaLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
    marginTop: -8,
  },
  moreWrapper: {
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
  },
});
