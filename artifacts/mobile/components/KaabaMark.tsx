import React from "react";
import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from "react-native-svg";

interface KaabaMarkProps {
  size: number;
  /** Colour of the kiswah (the black cloth). Pass a near-black palette token. */
  cloth: string;
  /** Colour of the hizam — the embroidered gold band — and the door. */
  band: string;
  /** Colour of the lit edges. Pass a cream/near-white palette token. */
  highlight?: string;
}

/**
 * The Ka'bah, drawn as a cuboid in a shallow axonometric projection.
 *
 * Geometry only — no photograph and no emoji, so it renders identically on
 * every device and stays crisp at any size. Each face carries a fixed gradient
 * and the two edges facing the light carry a pale rim, so the solid reads as a
 * lit object rather than a flat sticker. Every gradient is static: nothing here
 * animates, and the whole mark is a single SVG.
 *
 * Front face spans x 22→66, y 34→84; the depth offset is (+22, -12).
 */
export function KaabaMark({ size, cloth, band, highlight }: KaabaMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {/* Front face: catches the most light along its top edge. */}
        <LinearGradient id="kbFront" x1="0.15" y1="0" x2="0.6" y2="1">
          <Stop offset="0" stopColor={cloth} stopOpacity={0.88} />
          <Stop offset="1" stopColor={cloth} stopOpacity={1} />
        </LinearGradient>
        {/* Top face: turned toward the light, so the palest of the three. */}
        <LinearGradient id="kbTop" x1="0" y1="1" x2="0.7" y2="0">
          <Stop offset="0" stopColor={cloth} stopOpacity={0.62} />
          <Stop offset="1" stopColor={cloth} stopOpacity={0.42} />
        </LinearGradient>
        {/* Right face: turned away, so it falls off into the deepest tone. */}
        <LinearGradient id="kbSide" x1="0" y1="0" x2="1" y2="0.45">
          <Stop offset="0" stopColor={cloth} stopOpacity={0.9} />
          <Stop offset="1" stopColor={cloth} stopOpacity={0.68} />
        </LinearGradient>
        {/* Hizam: brightest where the light crosses it. */}
        <LinearGradient id="kbBand" x1="0" y1="0" x2="1" y2="0.35">
          <Stop offset="0" stopColor={band} stopOpacity={0.8} />
          <Stop offset="0.45" stopColor={band} stopOpacity={1} />
          <Stop offset="1" stopColor={band} stopOpacity={0.82} />
        </LinearGradient>
      </Defs>

      <G>
        {/* Top face */}
        <Path d="M22 34 L44 22 L88 22 L66 34 Z" fill="url(#kbTop)" />
        {/* Right face */}
        <Path d="M66 34 L88 22 L88 72 L66 84 Z" fill="url(#kbSide)" />
        {/* Front face */}
        <Rect x={22} y={34} width={44} height={50} fill="url(#kbFront)" />

        {/* Hizam — the gold band, carried across the front and side faces */}
        <Rect x={22} y={50} width={44} height={8} fill="url(#kbBand)" />
        <Path d="M66 50 L88 38 L88 46 L66 58 Z" fill={band} fillOpacity={0.72} />

        {/* Door, set into the lower front face */}
        <Rect x={46} y={60} width={13} height={20} fill={band} fillOpacity={0.9} />

        {/* Silhouette outline keeps the shape legible against dark green */}
        <Path
          d="M22 34 L44 22 L88 22 L88 72 L66 84 L22 84 Z"
          fill="none"
          stroke={band}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <Path d="M22 34 L66 34 L66 84 M66 34 L88 22" fill="none" stroke={band} strokeWidth={1.4} />

        {/* The two edges facing the light, picked out in a pale rim */}
        {highlight != null && (
          <Path
            d="M22 34 L44 22 L88 22"
            fill="none"
            stroke={highlight}
            strokeOpacity={0.55}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </G>
    </Svg>
  );
}
