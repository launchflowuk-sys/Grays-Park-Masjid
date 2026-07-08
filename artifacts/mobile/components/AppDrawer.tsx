import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IslamicPatternBg } from "@/components/IslamicPatternBg";
import { useColors } from "@/hooks/useColors";

interface AppDrawerProps {
  visible: boolean;
  onClose: () => void;
}

const DRAWER_CONTENT_HEIGHT = 420;

const ITEMS = [
  {
    key: "blog",
    label: "Blog",
    sublabel: "Articles & reflections from the Masjid",
    icon: "book-open" as const,
    href: "/(tabs)/blog",
  },
  {
    key: "alerts",
    label: "Notification Settings",
    sublabel: "Manage your Adhan & event alerts",
    icon: "bell" as const,
    href: "/(tabs)/settings",
  },
];

export function AppDrawer({ visible, onClose }: AppDrawerProps) {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(DRAWER_CONTENT_HEIGHT + 100)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 68,
          friction: 12,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: DRAWER_CONTENT_HEIGHT + 100,
          duration: 230,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim]);

  const navigate = (href: string) => {
    onClose();
    setTimeout(() => router.push(href as never), 200);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {/* Dimmed backdrop */}
        <Animated.View
          style={[styles.backdrop, { opacity: backdropAnim }]}
          pointerEvents={visible ? "auto" : "none"}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Drawer panel */}
        <Animated.View
          style={[
            styles.drawer,
            { paddingBottom: insets.bottom + 24, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* ── Islamic header ── */}
          <View style={[styles.header, { backgroundColor: colors.primary }]}>
            <IslamicPatternBg
              animatePattern={false}
              shimmer={false}
              color="#C9A84C"
              patternOpacity={0.14}
            />
            <View style={styles.headerContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerArabic}>القائمة</Text>
                <Text style={styles.headerTitle}>Menu</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Close menu"
              >
                <Feather name="x" size={19} color="#FAF8F3" />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Menu rows ── */}
          <View style={[styles.itemList, { backgroundColor: colors.card }]}>
            {ITEMS.map((item, i) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.itemRow,
                  i < ITEMS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
                onPress={() => navigate(item.href)}
                activeOpacity={0.72}
              >
                <View style={[styles.itemIcon, { backgroundColor: colors.primary + "18" }]}>
                  <Feather name={item.icon} size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemLabel, { color: colors.foreground }]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.itemSub, { color: colors.mutedForeground }]}>
                    {item.sublabel}
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.50)",
  },
  drawer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 24,
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 18,
    overflow: "hidden",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    zIndex: 1,
  },
  headerArabic: {
    fontFamily: "PlayfairDisplay_400Regular",
    fontSize: 13,
    color: "#C9A84C",
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 24,
    color: "#FAF8F3",
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  itemList: {},
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 14,
  },
  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  itemLabel: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  itemSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
});
