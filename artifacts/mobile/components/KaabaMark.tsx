import React from "react";
import Svg, { G, Path, Rect } from "react-native-svg";

interface KaabaMarkProps {
  size: number;
  /** Colour of the kiswah (the black cloth). Pass a near-black palette token. */
  cloth: string;
  /** Colour of the hizam — the embroidered gold band — and the door. */
  band: string;
}

/**
 * The Ka'bah, drawn as a cuboid in a shallow axonometric projection.
 *
 * Geometry only — no photograph and no emoji, so it renders identically on
 * every device and stays crisp at any size. The front face is drawn at full
 * strength with the two receding faces knocked back, which reads as light
 * falling from the upper left without needing gradients.
 *
 * Front face spans x 22→66, y 34→84; the depth offset is (+22, -12).
 */
export function KaabaMark({ size, cloth, band }: KaabaMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G>
        {/* Top face */}
        <Path d="M22 34 L44 22 L88 22 L66 34 Z" fill={cloth} fillOpacity={0.55} />
        {/* Right face */}
        <Path d="M66 34 L88 22 L88 72 L66 84 Z" fill={cloth} fillOpacity={0.78} />
        {/* Front face */}
        <Rect x={22} y={34} width={44} height={50} fill={cloth} />

        {/* Hizam — the gold band, carried across the front and side faces */}
        <Rect x={22} y={50} width={44} height={8} fill={band} />
        <Path d="M66 50 L88 38 L88 46 L66 58 Z" fill={band} fillOpacity={0.8} />

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
      </G>
    </Svg>
  );
}
