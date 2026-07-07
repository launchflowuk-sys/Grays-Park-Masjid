import React from "react";
import Svg, { Circle, G, Line, Rect } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
  opacity?: number;
};

export function IslamicStar({ size = 40, color = "#C9A84C", opacity = 0.3 }: Props) {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s * 0.38;
  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <G opacity={opacity}>
        <Rect
          x={cx - r}
          y={cy - r}
          width={r * 2}
          height={r * 2}
          rx={2}
          stroke={color}
          strokeWidth={1.5}
          fill="none"
          transform={`rotate(45 ${cx} ${cy})`}
        />
        <Rect
          x={cx - r}
          y={cy - r}
          width={r * 2}
          height={r * 2}
          rx={2}
          stroke={color}
          strokeWidth={1.5}
          fill="none"
        />
        <Circle cx={cx} cy={cy} r={3} fill={color} />
      </G>
    </Svg>
  );
}

export function IslamicBorder({ width, height, color = "#C9A84C", opacity = 0.2 }: { width: number; height: number; color?: string; opacity?: number }) {
  const STEP = 40;
  const stars = [];
  for (let x = 0; x < width; x += STEP) {
    for (let y = 0; y < height; y += STEP) {
      stars.push(
        <G key={`${x}-${y}`} transform={`translate(${x},${y})`} opacity={opacity}>
          <Rect
            x={4} y={4} width={32} height={32}
            stroke={color} strokeWidth={1} fill="none"
            rx={1}
            transform="rotate(45 20 20)"
          />
          <Rect
            x={4} y={4} width={32} height={32}
            stroke={color} strokeWidth={1} fill="none"
          />
          <Circle cx={20} cy={20} r={2} fill={color} />
        </G>
      );
    }
  }
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute" }}>
      {stars}
    </Svg>
  );
}

export function CompassSvg({
  size = 200,
  qiblaAngle,
  compassAngle = 0,
  primaryColor = "#1B3D2F",
  accentColor = "#C9A84C",
}: {
  size?: number;
  qiblaAngle: number;
  compassAngle?: number;
  primaryColor?: string;
  accentColor?: string;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;
  const markerLen = size * 0.08;
  const needleLen = r - markerLen - 4;
  const arrowAngle = qiblaAngle - compassAngle;
  const rad = (arrowAngle - 90) * (Math.PI / 180);
  const tipX = cx + Math.cos(rad) * needleLen;
  const tipY = cy + Math.sin(rad) * needleLen;
  const baseRad1 = rad + Math.PI / 2;
  const baseRad2 = rad - Math.PI / 2;
  const baseW = size * 0.04;
  const b1x = cx + Math.cos(baseRad1) * baseW;
  const b1y = cy + Math.sin(baseRad1) * baseW;
  const b2x = cx + Math.cos(baseRad2) * baseW;
  const b2y = cy + Math.sin(baseRad2) * baseW;
  const tailRad = (arrowAngle + 90) * (Math.PI / 180);
  const tailLen = needleLen * 0.4;
  const tailX = cx + Math.cos(tailRad + Math.PI) * tailLen;
  const tailY = cy + Math.sin(tailRad + Math.PI) * tailLen;

  const cardinals = ["N", "E", "S", "W"];
  const cardinalElements = cardinals.map((label, i) => {
    const angle = (i * 90 - compassAngle - 90) * (Math.PI / 180);
    const lx = cx + Math.cos(angle) * (r + markerLen * 0.1);
    const ly = cy + Math.sin(angle) * (r + markerLen * 0.1);
    return (
      <G key={label}>
        <Line
          x1={cx + Math.cos(angle) * (r - markerLen * 0.5)}
          y1={cy + Math.sin(angle) * (r - markerLen * 0.5)}
          x2={cx + Math.cos(angle) * r}
          y2={cy + Math.sin(angle) * r}
          stroke={primaryColor}
          strokeWidth={2}
        />
      </G>
    );
  });

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={cx} cy={cy} r={r} stroke={primaryColor} strokeWidth={2} fill="none" />
      <Circle cx={cx} cy={cy} r={r + 6} stroke={accentColor} strokeWidth={1} fill="none" opacity={0.4} />
      {cardinalElements}
      <G>
        <Line
          x1={b1x} y1={b1y} x2={tipX} y2={tipY}
          stroke={accentColor} strokeWidth={2}
        />
        <Line
          x1={b2x} y1={b2y} x2={tipX} y2={tipY}
          stroke={accentColor} strokeWidth={2}
        />
        <Line
          x1={b1x} y1={b1y} x2={tailX} y2={tailY}
          stroke={accentColor} strokeWidth={1.5} opacity={0.5}
        />
        <Line
          x1={b2x} y1={b2y} x2={tailX} y2={tailY}
          stroke={accentColor} strokeWidth={1.5} opacity={0.5}
        />
      </G>
      <Circle cx={cx} cy={cy} r={5} fill={accentColor} />
    </Svg>
  );
}
