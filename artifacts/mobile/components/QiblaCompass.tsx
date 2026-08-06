import React, { memo, useMemo } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

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

// ── 3D staging ───────────────────────────────────────────────────────────────

/**
 * How far the dial is tipped away from the viewer.
 *
 * 50° is enough to read unmistakably as a solid object sitting on a surface
 * while still leaving the tick ring and the beam easy to judge by eye. Anything
 * past ~60° starts costing legibility, which on a religious tool is not a trade
 * worth making.
 */
const TILT_DEG = 50;
const TILT_RAD = (TILT_DEG * Math.PI) / 180;
const SIN_TILT = Math.sin(TILT_RAD);
const COS_TILT = Math.cos(TILT_RAD);
/** Exact inverse of the stage tilt, worn by anything that must face the viewer. */
const UNTILT_DEG = `-${TILT_DEG}deg`;

/** Eye distance, as a multiple of the dial box. Scales with `size` so the dial looks identical on every phone. */
const PERSPECTIVE_RATIO = 3.6;
/**
 * Billboarded children un-tilt themselves *orthographically*: composed with the
 * stage's `perspective · rotateX(θ)`, a plain `rotateX(-θ)` cancels the rotation
 * exactly and leaves only the perspective, so the label ends up facing the
 * camera, undistorted, scaled purely by its depth. A very distant camera on the
 * child is the portable way to say "no perspective of your own".
 */
const UPRIGHT_PERSPECTIVE_RATIO = 30;

/**
 * Rim radius as a fraction of the half-box.
 *
 * The near edge of a tilted disc projects *wider* than the disc itself, so the
 * drawn dial has to be inset or it would spill out of its own layout box.
 */
const RIM_RATIO = 0.88;
/** Rendered height as a fraction of `size` — a tilted circle needs far less. */
const BOX_RATIO = 0.78;

/** How far the Ka'bah floats above the dial face, as a fraction of `size`. */
const KAABA_LIFT_RATIO = 0.05;
/** Ditto the centre cap. */
const HUB_LIFT_RATIO = 0.022;

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
 * The compass rose, staged as a physical dial seen at an angle.
 *
 * Three flat layers stack inside one tilted container: a static base (bezel,
 * inset face, rim shadow), the rotating rose (ticks, beam, cast shadows) and
 * the raised furniture (Ka'bah, centre cap, index). Depth is entirely static —
 * SVG gradients and fixed offsets — so tipping the dial costs nothing per
 * frame.
 *
 * The whole rose rotates by -heading, so north always points at true north and
 * the Ka'bah marker — pinned to the rose at the Qibla bearing — slides under
 * the fixed index at the top of the dial exactly when the user is facing it.
 * Cardinal letters and the Ka'bah counter-rotate by +heading *and* counter-tilt
 * by -TILT, which leaves them facing the camera, upright and undistorted.
 */
function QiblaCompassView({
  size,
  headingAnim,
  bearing,
  aligned,
  confident,
}: QiblaCompassProps) {
  const colors = useColors();
  const { accent, foreground, primary, primaryForeground, secondary } = colors;

  const geo = useMemo(() => {
    const centre = size / 2;
    const perspective = size * PERSPECTIVE_RATIO;
    const rimOuter = centre * RIM_RATIO;
    const bezelWidth = size * 0.052;
    const faceRadius = rimOuter - bezelWidth;
    const tickOuter = faceRadius - size * 0.022;
    const boxHeight = Math.round(size * BOX_RATIO);

    /**
     * Where a point `r` from the dial centre lands on screen once tilted and
     * projected. `sign` is +1 for the receding (top) edge, -1 for the near one.
     */
    const project = (r: number, sign: 1 | -1) =>
      (r * COS_TILT * perspective) / (perspective + sign * r * SIN_TILT);

    const up = project(rimOuter, 1);
    const down = project(rimOuter, -1);
    // The projection is not symmetric about the centre, so nudge the whole
    // stage until the *visible* dial sits in the middle of the layout box.
    const stageTop = boxHeight / 2 - (down - up) / 2 - centre;

    return {
      centre,
      perspective,
      uprightPerspective: size * UPRIGHT_PERSPECTIVE_RATIO,
      rimOuter,
      bezelWidth,
      faceRadius,
      tickOuter,
      minorInner: tickOuter - size * 0.021,
      majorInner: tickOuter - size * 0.042,
      kaabaTrack: tickOuter - size * 0.098,
      cardinal: tickOuter - size * 0.196,
      beamOuter: tickOuter - size * 0.15,
      hub: size * 0.034,
      halo: rimOuter + size * 0.046,
      boxHeight,
      stageTop,
      /** Top of the projected dial, in layout-box coordinates. */
      dialTop: stageTop + centre - up,
      kaabaSize: Math.round(Math.min(42, Math.max(28, size * 0.115))),
      kaabaLift: size * KAABA_LIFT_RATIO,
      hubLift: size * HUB_LIFT_RATIO,
      cardinalBox: Math.round(size * 0.085),
      cardinalFont: Math.round(Math.min(17, Math.max(11, size * 0.047))),
      indexHeight: Math.round(size * 0.05),
      indexWidth: Math.round(size * 0.058),
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

  // ── Layer 1: the housing. Static, and never rotates. ───────────────────────
  const base = useMemo(() => {
    const { centre, rimOuter, bezelWidth, faceRadius, halo, hub } = geo;
    const bezelMid = rimOuter - bezelWidth / 2;
    return (
      <Svg width={size} height={size}>
        <Defs>
          {/* Ambient occlusion, so the dial sits *in* the page, not on it */}
          <RadialGradient id="qcHalo" cx="50%" cy="50%" r="50%">
            <Stop offset="0.72" stopColor={foreground} stopOpacity={0.36} />
            <Stop offset="0.9" stopColor={foreground} stopOpacity={0.16} />
            <Stop offset="1" stopColor={foreground} stopOpacity={0} />
          </RadialGradient>

          {/* Light raking across the raised bezel from the top */}
          <LinearGradient id="qcBezel" x1="0.32" y1="0" x2="0.68" y2="1">
            <Stop offset="0" stopColor={primaryForeground} stopOpacity={0.5} />
            <Stop offset="0.18" stopColor={accent} stopOpacity={0.7} />
            <Stop offset="0.48" stopColor={foreground} stopOpacity={0.22} />
            <Stop offset="0.78" stopColor={foreground} stopOpacity={0.55} />
            <Stop offset="1" stopColor={accent} stopOpacity={0.34} />
          </LinearGradient>

          {/* The machined outer lip */}
          <LinearGradient id="qcLip" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor={primaryForeground} stopOpacity={0.75} />
            <Stop offset="0.5" stopColor={accent} stopOpacity={0.4} />
            <Stop offset="1" stopColor={foreground} stopOpacity={0.55} />
          </LinearGradient>

          {/* The dial face, dished: brightest low and centre, falling to the rim */}
          <RadialGradient id="qcFace" cx="50%" cy="62%" r="70%">
            <Stop offset="0" stopColor={secondary} />
            <Stop offset="0.55" stopColor={primary} />
            <Stop offset="1" stopColor={foreground} />
          </RadialGradient>

          {/* Inner shadow: heaviest under the far rim, absent at the near one */}
          <RadialGradient id="qcInset" cx="50%" cy="72%" r="78%">
            <Stop offset="0.45" stopColor={foreground} stopOpacity={0} />
            <Stop offset="0.86" stopColor={foreground} stopOpacity={0.3} />
            <Stop offset="1" stopColor={foreground} stopOpacity={0.72} />
          </RadialGradient>

          {/* A whisper of glass over the top half */}
          <LinearGradient id="qcSheen" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor={primaryForeground} stopOpacity={0.13} />
            <Stop offset="0.42" stopColor={primaryForeground} stopOpacity={0.03} />
            <Stop offset="0.72" stopColor={primaryForeground} stopOpacity={0} />
          </LinearGradient>

          {/* What the raised centre cap throws onto the face */}
          <RadialGradient id="qcHubShadow" cx="50%" cy="50%" r="50%">
            <Stop offset="0.15" stopColor={foreground} stopOpacity={0.55} />
            <Stop offset="1" stopColor={foreground} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <Circle cx={centre} cy={centre} r={halo} fill="url(#qcHalo)" />

        {/* Raised bezel: a solid ring body, then the light falling across it */}
        <Circle
          cx={centre}
          cy={centre}
          r={bezelMid}
          fill="none"
          stroke={secondary}
          strokeWidth={bezelWidth}
        />
        <Circle
          cx={centre}
          cy={centre}
          r={bezelMid}
          fill="none"
          stroke="url(#qcBezel)"
          strokeWidth={bezelWidth}
        />
        <Circle
          cx={centre}
          cy={centre}
          r={rimOuter}
          fill="none"
          stroke="url(#qcLip)"
          strokeWidth={1.5}
        />

        {/* Inset face */}
        <Circle cx={centre} cy={centre} r={faceRadius} fill="url(#qcFace)" />
        <Circle cx={centre} cy={centre} r={faceRadius} fill="url(#qcInset)" />
        <Circle cx={centre} cy={centre} r={faceRadius} fill="url(#qcSheen)" />
        <Circle
          cx={centre}
          cy={centre}
          r={faceRadius}
          fill="none"
          stroke={foreground}
          strokeOpacity={0.5}
          strokeWidth={1.5}
        />
        <Circle
          cx={centre}
          cy={centre}
          r={faceRadius - 2}
          fill="none"
          stroke={accent}
          strokeOpacity={0.16}
          strokeWidth={1}
        />

        {/* Contact shadow for the centre cap that floats above all this */}
        <Circle
          cx={centre}
          cy={centre + hub * 0.55}
          r={hub * 2.2}
          fill="url(#qcHubShadow)"
        />

        {/* Facing the Qibla lights the whole rim gold */}
        {aligned && (
          <G>
            <Circle
              cx={centre}
              cy={centre}
              r={rimOuter}
              fill="none"
              stroke={accent}
              strokeOpacity={0.85}
              strokeWidth={2}
            />
            <Circle
              cx={centre}
              cy={centre}
              r={faceRadius + 1}
              fill="none"
              stroke={accent}
              strokeOpacity={0.55}
              strokeWidth={2}
            />
          </G>
        )}
      </Svg>
    );
  }, [size, geo, aligned, accent, foreground, primary, primaryForeground, secondary]);

  // ── Layer 2: the rose. Built once, then spun on the native thread. ─────────
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
          stroke={isNorth ? accent : primaryForeground}
          strokeOpacity={isNorth ? 1 : isMajor ? 0.55 : 0.24}
          strokeWidth={isNorth ? 3 : isMajor ? 2 : 1}
          strokeLinecap="round"
        />
      );
    }
    return marks;
  }, [geo, accent, primaryForeground]);

  const beam = useMemo(() => {
    if (bearing === null) return null;
    const { centre, beamOuter, hub, kaabaTrack, kaabaSize } = geo;
    const edgeA = polar(centre, beamOuter, bearing - BEAM_HALF_ANGLE);
    const edgeB = polar(centre, beamOuter, bearing + BEAM_HALF_ANGLE);
    const tip = polar(centre, beamOuter, bearing);
    const root = polar(centre, hub, bearing);
    const tail = polar(centre, beamOuter * 0.45, bearing + 180);
    const tailRoot = polar(centre, hub, bearing + 180);
    const kaaba = polar(centre, kaabaTrack, bearing);

    // Perpendicular to the needle, so its bevel stays on the same edge however
    // far the rose has turned.
    const radians = ((bearing - 90) * Math.PI) / 180;
    const nx = -Math.sin(radians);
    const ny = Math.cos(radians);
    const shift = (p: { x: number; y: number }, by: number) => ({
      x: p.x + nx * by,
      y: p.y + ny * by,
    });
    const shadowRoot = shift(root, 2);
    const shadowTip = shift(tip, 2);
    const gleamRoot = shift(root, -1.1);
    const gleamTip = shift(tip, -1.1);

    return (
      <>
        <Path
          d={`M ${centre} ${centre} L ${edgeA.x} ${edgeA.y} A ${beamOuter} ${beamOuter} 0 0 1 ${edgeB.x} ${edgeB.y} Z`}
          fill={accent}
          fillOpacity={confident ? (aligned ? 0.34 : 0.16) : 0}
        />
        <Line
          x1={tailRoot.x}
          y1={tailRoot.y}
          x2={tail.x}
          y2={tail.y}
          stroke={primaryForeground}
          strokeOpacity={0.3}
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* The needle, built as a raised bar: cast shadow, body, lit edge */}
        <Line
          x1={shadowRoot.x}
          y1={shadowRoot.y}
          x2={shadowTip.x}
          y2={shadowTip.y}
          stroke={foreground}
          strokeOpacity={0.45}
          strokeWidth={aligned ? 5 : 4}
          strokeLinecap="round"
        />
        <Line
          x1={root.x}
          y1={root.y}
          x2={tip.x}
          y2={tip.y}
          stroke={accent}
          strokeWidth={aligned ? 4 : 3}
          strokeLinecap="round"
          strokeDasharray={confident ? undefined : "5 6"}
        />
        {confident && (
          <Line
            x1={gleamRoot.x}
            y1={gleamRoot.y}
            x2={gleamTip.x}
            y2={gleamTip.y}
            stroke={primaryForeground}
            strokeOpacity={0.5}
            strokeWidth={1.1}
            strokeLinecap="round"
          />
        )}

        {/* What the floating Ka'bah throws onto the face beneath it */}
        <Circle
          cx={kaaba.x}
          cy={kaaba.y + 1.5}
          r={kaabaSize * 0.36}
          fill="url(#qcDrop)"
        />
      </>
    );
  }, [bearing, geo, accent, foreground, primaryForeground, aligned, confident]);

  const kaabaPoint =
    bearing === null ? null : polar(geo.centre, geo.kaabaTrack, bearing);

  return (
    <View style={{ width: size, height: geo.boxHeight }} pointerEvents="none">
      {/* ── The tilted stage. Everything below lives on this one plane. ── */}
      <View
        style={{
          position: "absolute",
          left: 0,
          top: geo.stageTop,
          width: size,
          height: size,
          transform: [
            { perspective: geo.perspective },
            { rotateX: `${TILT_DEG}deg` },
          ],
        }}
      >
        {base}

        {/* ── Rotating rose ── */}
        <Animated.View
          style={[StyleSheet.absoluteFill, { transform: [{ rotate: roseRotate }] }]}
        >
          <Svg width={size} height={size}>
            <Defs>
              <RadialGradient id="qcDrop" cx="50%" cy="50%" r="50%">
                <Stop offset="0.1" stopColor={foreground} stopOpacity={0.55} />
                <Stop offset="1" stopColor={foreground} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <G opacity={confident ? 1 : 0.45}>
              {ticks}
              {beam}
            </G>
          </Svg>

          {CARDINALS.map(({ label, angle }) => {
            const point = polar(geo.centre, geo.cardinal, angle);
            const isNorth = label === "N";
            return (
              <Animated.View
                key={label}
                style={[
                  styles.upright,
                  {
                    left: point.x - geo.cardinalBox / 2,
                    top: point.y - geo.cardinalBox / 2,
                    width: geo.cardinalBox,
                    height: geo.cardinalBox,
                    opacity: confident ? 1 : 0.45,
                    transform: [
                      { perspective: geo.uprightPerspective },
                      { rotate: uprightRotate },
                      { rotateX: UNTILT_DEG },
                    ],
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cardinal,
                    {
                      fontSize: isNorth ? geo.cardinalFont + 1 : geo.cardinalFont,
                      color: isNorth ? accent : primaryForeground,
                      opacity: isNorth ? 1 : 0.6,
                      textShadowColor: foreground,
                    },
                  ]}
                >
                  {label}
                </Text>
              </Animated.View>
            );
          })}

          {kaabaPoint !== null && (
            <Animated.View
              style={[
                styles.upright,
                {
                  left: kaabaPoint.x - geo.kaabaSize / 2,
                  top: kaabaPoint.y - geo.kaabaSize / 2,
                  width: geo.kaabaSize,
                  height: geo.kaabaSize,
                  opacity: confident ? 1 : 0.5,
                  transform: [
                    { perspective: geo.uprightPerspective },
                    { rotate: uprightRotate },
                    { rotateX: UNTILT_DEG },
                    // Lifts the mark straight up off the face; the shadow drawn
                    // at its unlifted position is what sells the gap.
                    { translateY: -geo.kaabaLift },
                  ],
                },
              ]}
            >
              <KaabaMark
                size={geo.kaabaSize}
                cloth={foreground}
                band={accent}
                highlight={primaryForeground}
              />
            </Animated.View>
          )}
        </Animated.View>

        {/* ── Raised centre cap: fixed, and stands proud of the face ── */}
        <View
          style={[
            styles.upright,
            {
              left: geo.centre - geo.hub * 1.4,
              top: geo.centre - geo.hub * 1.4,
              width: geo.hub * 2.8,
              height: geo.hub * 2.8,
              transform: [
                { perspective: geo.uprightPerspective },
                { rotateX: UNTILT_DEG },
                { translateY: -geo.hubLift },
              ],
            },
          ]}
        >
          <Svg width={geo.hub * 2.8} height={geo.hub * 2.8} viewBox="0 0 100 100">
            <Defs>
              <RadialGradient id="qcHub" cx="38%" cy="32%" r="70%">
                <Stop offset="0" stopColor={secondary} />
                <Stop offset="0.55" stopColor={primary} />
                <Stop offset="1" stopColor={foreground} />
              </RadialGradient>
            </Defs>
            <Circle cx={50} cy={50} r={36} fill="url(#qcHub)" stroke={accent} strokeWidth={6} />
            <Circle
              cx={50}
              cy={50}
              r={39}
              fill="none"
              stroke={primaryForeground}
              strokeOpacity={0.35}
              strokeWidth={1.5}
            />
            <Circle cx={40} cy={38} r={9} fill={primaryForeground} fillOpacity={0.22} />
          </Svg>
        </View>
      </View>

      {/* ── Fixed index: sits in screen space above the rim, undistorted, so
             where the device is actually pointing is never in doubt. ── */}
      <View
        style={[
          styles.index,
          { top: geo.dialTop - geo.indexHeight + 3, height: geo.indexHeight + 4 },
        ]}
      >
        <Svg width={size} height={geo.indexHeight + 4}>
          <Defs>
            <LinearGradient id="qcIndex" x1="0.5" y1="0" x2="0.5" y2="1">
              <Stop offset="0" stopColor={primaryForeground} stopOpacity={0.95} />
              <Stop offset="0.4" stopColor={accent} stopOpacity={1} />
              <Stop offset="1" stopColor={accent} stopOpacity={0.7} />
            </LinearGradient>
          </Defs>
          <Path
            d={`M ${geo.centre - geo.indexWidth / 2} 4 L ${geo.centre + geo.indexWidth / 2} 4 L ${geo.centre} ${geo.indexHeight + 4} Z`}
            fill={foreground}
            fillOpacity={0.35}
          />
          <Path
            d={`M ${geo.centre - geo.indexWidth / 2} 1 L ${geo.centre + geo.indexWidth / 2} 1 L ${geo.centre} ${geo.indexHeight + 1} Z`}
            fill="url(#qcIndex)"
            fillOpacity={aligned ? 1 : 0.75}
          />
          <Line
            x1={geo.centre - geo.indexWidth / 2}
            y1={1.5}
            x2={geo.centre + geo.indexWidth / 2}
            y2={1.5}
            stroke={primaryForeground}
            strokeOpacity={aligned ? 0.9 : 0.6}
            strokeWidth={1.4}
            strokeLinecap="round"
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
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  index: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
});

/**
 * Memoised: the parent re-renders up to 4x/sec from throttled sensor state,
 * but the rose only needs rebuilding when the bearing or the visual state
 * genuinely changes. Rotation itself never goes through React at all, and every
 * gradient, shadow and offset above is a constant — the 3D staging adds no
 * per-frame JavaScript whatsoever.
 */
export const QiblaCompass = memo(QiblaCompassView);
