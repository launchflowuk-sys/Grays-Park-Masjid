import { Image } from "expo-image";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text } from "react-native";

type Props = {
  onComplete: () => void;
};

export function SplashAnimation({ onComplete }: Props) {
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const ND = Platform.OS !== "web";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 700, useNativeDriver: ND }),
      Animated.spring(logoScale, { toValue: 1, friction: 7, tension: 70, useNativeDriver: ND }),
    ]).start();

    const fadeTimer = setTimeout(() => {
      Animated.timing(containerOpacity, { toValue: 0, duration: 500, useNativeDriver: ND }).start();
    }, 1700);

    const doneTimer = setTimeout(onComplete, 2400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.container, { opacity: containerOpacity }]}
      pointerEvents="none"
    >
      <Animated.View
        style={[styles.logoWrapper, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
      >
        {/* Icon rendered without border-radius so its dark green background
            blends seamlessly with the splash background — logo mark floats */}
        <Image
          source={require("../assets/images/splash-logo.png")}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.name}>Grays Park Masjid</Text>
        <Text style={styles.tagline}>مسجد جريز بارك</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 999,
    elevation: 999,
    backgroundColor: "#1B3D2F",
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: {
    alignItems: "center",
    gap: 20,
  },
  logo: {
    width: 220,
    height: 220,
  },
  name: {
    color: "#FAF8F3",
    fontSize: 24,
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: 0.3,
  },
  tagline: {
    color: "#C9A84C",
    fontSize: 18,
  },
});
