import React, { memo, useMemo } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";

import { KaabaMark } from "@/components/KaabaMark";
import { useColors } from "@/hooks/useColors";

const CARDINALS = [
  { label: "N", angle: 0 },
  { label: "E", angle: 90 },
  { label: "S", angle: 180 },
  { label: "W", angle: 270 },
] as const;

/** Half-width of the Qibla beam wedge, in degrees. */
const BEAM_HALF_ANGLE = 5.5;
const KAABA_MARK_SIZE = 34;
const CARDINAL_BOX = 24;

interface QiblaCompassProps {
  size: number;
  /**
   * Continuous (never-wrapping) device heading in degrees. Interpolated
   * straight into rotations on the native thread — this component never reads
   * the value in JS, so nothing here re-renders as the device turns.
   */
  headingAnim: Animated.Value;
  /** Bearing to the Ka'bah from true north, or null while still locating. */
  bearing: number | null;
  aligned: boolean;
  /**
   * False while the compass is starting, calibrating or absent. The rose is
   * visibly knocked back and the beam goes dashed, so an unreliable reading is
   * never dressed up as a confident one.
   */
  confident: boolean;
}

function polar(centre: number, radius: number, degrees: number) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return {
    x: centre + radius * Math.cos(radians),
    y: centre + radius * Math.sin(radians),
  };
}

/**
 * The compass rose.
 *
 * The whole rose rotates by -heading, so north always points at true north and
 * the Ka'bah marker — pinned to the rose at the Qibla bearing — slides under
 * the fixed index at the top of the dial exactly when the user is facing it.
 * Cardinal letters and the Ka'bah counter-rotate by +heading so they stay
 * upright and readable throughout.
 */
function QiblaCompassView({
  size,
  headingAnim,
  bearing,
  aligned,
  confident,
}: QiblaCompassProps) {
  const colors = useColors();

  const geo = useMemo(() => {
    const centre = size / 2;
    const ring = centre - 1.5;
    const tickOuter = centre - 13;
    return {
      centre,
      ring,
      tickOuter,
      minorInner: tickOuter - 7,
      majorInner: tickOuter - 14,
      kaabaTrack: tickOuter - 33,
      cardinal: tickOuter - 66,
      beamOuter: tickOuter - 50,
      hub: 9,
    };
  }, [size]);

  // Rotating the rose backwards is what makes the dial read as a real compass.
  const roseRotate = useMemo(
    () =>
      headingAnim.interpolate({
        inputRange: [0, 360],
        outputRange: ["0deg", "-360deg"],
      }),
    [headingAnim]
  );

  // Exact inverse, so anything wearing it stays upright on screen.
  const uprightRotate = useMemo(
    () =>
      headingAnim.interpolate({
        inputRange: [0, 360],
        outputRange: ["0deg", "360deg"],
      }),
    [headingAnim]
  );

  const highlight = aligned ? colors.accent : colors.primaryForeground;

  const ticks = useMemo(() => {
    const marks = [];
    for (let deg = 0; deg < 360; deg += 10) {
      const isMajor = deg % 30 === 0;
      const isNorth = deg === 0;
      const inner = isMajor ? geo.majorInner : geo.minorInner;
      const from = polar(geo.centre, geo.tickOuter, deg);
      const to = polar(geo.centre, isNorth ? inner - 5 : inner, deg);
      marks.push(
        <Line
          key={deg}
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke={isNorth ? colors.accent : colors.primaryForeground}
          strokeOpacity={isNorth ? 1 : isMajor ? 0.55 : 0.24}
          strokeWidth={isNorth ? 3 : isMajor ? 2 : 1}
          strokeLinecap="round"
        />
      );
    }
    return marks;
  }, [geo, colors.accent, colors.primaryForeground]);

  const beam = useMemo(() => {
    if (bearing === null) return null;
    const { centre, beamOuter, hub } = geo;
    const edgeA = polar(centre, beamOuter, bearing - BEAM_HALF_ANGLE);
    const edgeB = polar(centre, beamOuter, bearing + BEAM_HALF_ANGLE);
    const tip = polar(centre, beamOuter, bearing);
    const root = polar(centre, hub, bearing);
    const tail = polar(centre, beamOuter * 0.45, bearing + 180);
    const tailRoot = polar(centre, hub, bearing + 180);
    return (
      <>
        <Path
          d={`M ${centre} ${centre} L ${edgeA.x} ${edgeA.y} A ${beamOuter} ${beamOuter} 0 0 1 ${edgeB.x} ${edgeB.y} Z`}
          fill={colors.accent}
          fillOpacity={confident ? (aligned ? 0.34 : 0.16) : 0}
        />
        <Line
          x1={tailRoot.x}
          y1={tailRoot.y}
          x2={tail.x}
          y2={tail.y}
          stroke={colors.primaryForeground}
          strokeOpacity={0.3}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Line
          x1={root.x}
          y1={root.y}
          x2={tip.x}
          y2={tip.y}
          stroke={colors.accent}
          strokeWidth={aligned ? 4 : 3}
          strokeLinecap="round"
          strokeDasharray={confident ? undefined : "5 6"}
        />
      </>
    );
  }, [bearing, geo, colors.accent, colors.primaryForeground, aligned, confident]);

  return (
    <View style={{ width: size, height: size }}>
      {/* ── Rotating rose ── */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { opacity: confident ? 1 : 0.45, transform: [{ rotate: roseRotate }] },
        ]}
      >
        <Svg width={size} height={size}>
          <Circle
            cx={geo.centre}
            cy={geo.centre}
            r={geo.ring}
            fill="none"
            stroke={highlight}
            strokeOpacity={aligned ? 0.9 : 0.22}
            strokeWidth={aligned ? 3 : 1.5}
          />
          <Circle
            cx={geo.centre}
            cy={geo.centre}
            r={geo.majorInner}
            fill="none"
            stroke={colors.primaryForeground}
            strokeOpacity={0.12}
            strokeWidth={1}
          />
          {ticks}
          {beam}
        </Svg>

        {CARDINALS.map(({ label, angle }) => {
          const point = polar(geo.centre, geo.cardinal, angle);
          return (
            <Animated.View
              key={label}
              style={[
                styles.upright,
                {
                  left: point.x - CARDINAL_BOX / 2,
                  top: point.y - CARDINAL_BOX / 2,
                  width: CARDINAL_BOX,
                  height: CARDINAL_BOX,
                  transform: [{ rotate: uprightRotate }],
                },
              ]}
            >
              <Text
                style={[
                  styles.cardinal,
                  {
                    color: label === "N" ? colors.accent : colors.primaryForeground,
                    opacity: label === "N" ? 1 : 0.55,
                  },
                ]}
              >
                {label}
              </Text>
            </Animated.View>
          );
        })}

        {bearing !== null && (
          <Animated.View
            style={[
              styles.upright,
              {
                left: polar(geo.centre, geo.kaabaTrack, bearing).x - KAABA_MARK_SIZE / 2,
                top: polar(geo.centre, geo.kaabaTrack, bearing).y - KAABA_MARK_SIZE / 2,
                width: KAABA_MARK_SIZE,
                height: KAABA_MARK_SIZE,
                transform: [{ rotate: uprightRotate }],
              },
            ]}
          >
            <KaabaMark size={KAABA_MARK_SIZE} cloth={colors.foreground} band={colors.accent} />
          </Animated.View>
        )}
      </Animated.View>

      {/* ── Fixed overlay: where the device is actually pointing ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={size} height={size}>
          <Path
            d={`M ${geo.centre - 8} 4 L ${geo.centre + 8} 4 L ${geo.centre} 17 Z`}
            fill={colors.accent}
            fillOpacity={aligned ? 1 : 0.65}
          />
          <Line
            x1={geo.centre}
            y1={20}
            x2={geo.centre}
            y2={31}
            stroke={colors.accent}
            strokeOpacity={aligned ? 0.8 : 0.35}
            strokeWidth={1.5}
          />
          <Circle
            cx={geo.centre}
            cy={geo.centre}
            r={geo.hub}
            fill={colors.primary}
            stroke={colors.accent}
            strokeWidth={2}
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  upright: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  cardinal: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
});

/**
 * Memoised: the parent re-renders up to 4x/sec from throttled sensor state,
 * but the rose only needs rebuilding when the bearing or the visual state
 * genuinely changes. Rotation itself never goes through React at all.
 */
export const QiblaCompass = memo(QiblaCompassView);
