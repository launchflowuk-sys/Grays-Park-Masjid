import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "moon.stars", selected: "moon.stars.fill" }} />
        <Label>Prayer</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="quran">
        <Icon sf={{ default: "book.pages", selected: "book.pages.fill" }} />
        <Label>Qur'an</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="blog">
        <Icon sf={{ default: "newspaper", selected: "newspaper.fill" }} />
        <Label>Blog</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="events">
        <Icon sf={{ default: "calendar", selected: "calendar.fill" }} />
        <Label>Events</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="qibla">
        <Icon sf={{ default: "location.north.line", selected: "location.north.line.fill" }} />
        <Label>Qibla</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
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
          ...(isWeb ? { height: 84 } : {}),
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
      <Tabs.Screen
        name="index"
        options={{
          title: "Prayer",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "moon.stars.fill" : "moon.stars"} tintColor={color} size={23} />
            ) : (
              <MaterialCommunityIcons name="mosque" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="quran"
        options={{
          title: "Qur'an",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="book.pages" tintColor={color} size={23} />
            ) : (
              <Feather name="book-open" size={21} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="blog"
        options={{
          title: "Blog",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="newspaper" tintColor={color} size={23} />
            ) : (
              <Feather name="file-text" size={21} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="calendar" tintColor={color} size={23} />
            ) : (
              <Feather name="calendar" size={21} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="qibla"
        options={{
          title: "Qibla",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="location.north.line" tintColor={color} size={23} />
            ) : (
              <MaterialCommunityIcons name="compass" size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
