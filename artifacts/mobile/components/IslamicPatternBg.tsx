import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, { Circle, Defs, Line, Path, Pattern, Rect } from "react-native-svg";

interface IslamicPatternBgProps {
  shimmer?: boolean;
  color?: string;
  patternOpacity?: number;
}

/**
 * Absolute-fill background layer with a tiling 8-pointed Islamic star pattern.
 * Place it as the first child of any dark-green panel and it will fill the bounds.
 *
 * Props:
 *  shimmer        — slow sweeping highlight (enabled for the prayer header)
 *  color          — stroke colour of the pattern (default "#ffffff")
 *  patternOpacity — base opacity (default 0.08 ≈ barely-there texture)
 */
export function IslamicPatternBg({
  shimmer = false,
  color = "#ffffff",
  patternOpacity = 0.08,
}: IslamicPatternBgProps) {
  const { width } = useWindowDimensions();
  const nativeDriver = Platform.OS !== "web";

  const breathOpacity = useRef(new Animated.Value(patternOpacity)).current;
  const shimmerX = useRef(new Animated.Value(-(width * 0.6))).current;
  const shimmerTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Each SVG instance needs a unique pattern ID so they don't clash on web.
  const patternId = useRef(`isp${Math.floor(Math.random() * 999999)}`).current;

  // ── Breath: opacity pulses ±0.02–0.03 on a ~4.4 s cycle ─────────────────────
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(breathOpacity, {
          toValue: patternOpacity + 0.03,
          duration: 2200,
          useNativeDriver: nativeDriver,
        }),
        Animated.timing(breathOpacity, {
          toValue: Math.max(0.02, patternOpacity - 0.02),
          duration: 2200,
          useNativeDriver: nativeDriver,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [patternOpacity, nativeDriver]);

  // ── Shimmer: light streak sweeps left → right every ~9 s ─────────────────────
  useEffect(() => {
    if (!shimmer) return;

    const run = () => {
      shimmerX.setValue(-(width * 0.6));
      Animated.timing(shimmerX, {
        toValue: width + width * 0.6,
        duration: 5500,
        useNativeDriver: nativeDriver,
      }).start(({ finished }) => {
        if (finished) {
          shimmerTimeout.current = setTimeout(run, 3500);
        }
      });
    };
    run();

    return () => {
      shimmerX.stopAnimation();
      if (shimmerTimeout.current) clearTimeout(shimmerTimeout.current);
    };
  }, [shimmer, width, nativeDriver]);

  // ── 8-pointed Islamic star path, 80×80 tile, centre (40,40) ──────────────────
  // Outer radius 18 px, inner radius 7 px; 16 vertices (8 outer + 8 inner).
  // Vertex coordinates computed analytically from standard star polygon formula.
  const STAR =
    "M40,22L42.68,33.53L52.73,27.27L46.47,37.32L58,40" +
    "L46.47,42.68L52.73,52.73L42.68,46.47L40,58" +
    "L37.32,46.47L27.27,52.73L33.53,42.68L22,40" +
    "L33.53,37.32L27.27,27.27L37.32,33.53Z";

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}>
      {/* ── Breathing pattern ── */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: breathOpacity }]}>
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            <Pattern
              id={patternId}
              x="0"
              y="0"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              {/* Main 8-pointed star */}
              <Path d={STAR} fill="none" stroke={color} strokeWidth="0.9" />

              {/* Pointed arches at the 4 cardinal star tips — the "pillar/arch" motif */}
              {/* Top arch (above top tip at 40,22): curves up toward y=15 */}
              <Path d="M36,22 Q40,14.5 44,22" fill="none" stroke={color} strokeWidth="0.75" />
              {/* Bottom arch */}
              <Path d="M36,58 Q40,65.5 44,58" fill="none" stroke={color} strokeWidth="0.75" />
              {/* Left arch */}
              <Path d="M22,36 Q14.5,40 22,44" fill="none" stroke={color} strokeWidth="0.75" />
              {/* Right arch */}
              <Path d="M58,36 Q65.5,40 58,44" fill="none" stroke={color} strokeWidth="0.75" />

              {/* Small diamonds at the tile edge midpoints — connect across adjacent tiles */}
              <Path d="M40,-7L47,0L40,7L33,0Z" fill="none" stroke={color} strokeWidth="0.6" />
              <Path d="M73,40L80,47L87,40L80,33Z" fill="none" stroke={color} strokeWidth="0.6" />
              <Path d="M40,73L47,80L40,87L33,80Z" fill="none" stroke={color} strokeWidth="0.6" />
              <Path d="M-7,40L0,47L7,40L0,33Z" fill="none" stroke={color} strokeWidth="0.6" />

              {/* Thin stem lines connecting star tips to edge diamonds */}
              <Line x1="40" y1="22" x2="40" y2="7" stroke={color} strokeWidth="0.45" />
              <Line x1="58" y1="40" x2="73" y2="40" stroke={color} strokeWidth="0.45" />
              <Line x1="40" y1="58" x2="40" y2="73" stroke={color} strokeWidth="0.45" />
              <Line x1="22" y1="40" x2="7" y2="40" stroke={color} strokeWidth="0.45" />

              {/* Tiny centre circle */}
              <Circle cx="40" cy="40" r="2" fill="none" stroke={color} strokeWidth="0.55" />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </Svg>
      </Animated.View>

      {/* ── Shimmer sweep ── */}
      {shimmer && (
        <Animated.View
          style={[
            styles.shimmerBand,
            { width: width * 0.52, transform: [{ translateX: shimmerX }] },
          ]}
          pointerEvents="none"
        >
          <LinearGradient
            colors={[
              "transparent",
              "rgba(255,255,255,0.04)",
              "rgba(255,255,255,0.10)",
              "rgba(255,255,255,0.04)",
              "transparent",
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  shimmerBand: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
  },
});
