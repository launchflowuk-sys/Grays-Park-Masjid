import { useId } from "react";

export function IslamicPattern({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="gpm-star-tile" width="40" height="40" patternUnits="userSpaceOnUse">
          <g stroke="currentColor" strokeWidth="1" fill="none">
            <rect x="6" y="6" width="28" height="28" transform="rotate(45 20 20)" />
            <rect x="6" y="6" width="28" height="28" />
            <circle cx="20" cy="20" r="3" />
          </g>
        </pattern>
      </defs>
      <rect width="80" height="80" fill="url(#gpm-star-tile)" />
    </svg>
  );
}

export function IslamicStar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.25">
        <rect x="7" y="7" width="26" height="26" transform="rotate(45 20 20)" />
        <rect x="7" y="7" width="26" height="26" />
      </g>
      <circle cx="20" cy="20" r="2.5" fill="currentColor" />
    </svg>
  );
}

/**
 * Full-bleed tiling 8-pointed Islamic star pattern background.
 *
 * Absolutely fills its nearest `relative` ancestor. Place as the first child
 * of any dark-green (`bg-primary`) section — identical geometry to the mobile
 * app's IslamicPatternBg, ported to plain SVG/CSS.
 *
 * Uses an inline <defs>/<pattern> so it tiles cleanly at any viewport width
 * with zero network requests.
 */
export function IslamicPatternBg({
  opacity = 0.07,
  color = "white",
  className,
}: {
  opacity?: number;
  color?: string;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const patternId = `isp-${uid}`;

  const STAR =
    "M40,22L42.68,33.53L52.73,27.27L46.47,37.32L58,40" +
    "L46.47,42.68L52.73,52.73L42.68,46.47L40,58" +
    "L37.32,46.47L27.27,52.73L33.53,42.68L22,40" +
    "L33.53,37.32L27.27,27.27L37.32,33.53Z";

  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className ?? ""}`}
      style={{ opacity }}
    >
      <defs>
        <pattern
          id={patternId}
          x="0"
          y="0"
          width="80"
          height="80"
          patternUnits="userSpaceOnUse"
        >
          <path d={STAR} fill="none" stroke={color} strokeWidth="0.9" />

          <path d="M36,22 Q40,14.5 44,22" fill="none" stroke={color} strokeWidth="0.75" />
          <path d="M36,58 Q40,65.5 44,58" fill="none" stroke={color} strokeWidth="0.75" />
          <path d="M22,36 Q14.5,40 22,44" fill="none" stroke={color} strokeWidth="0.75" />
          <path d="M58,36 Q65.5,40 58,44" fill="none" stroke={color} strokeWidth="0.75" />

          <path d="M40,-7L47,0L40,7L33,0Z" fill="none" stroke={color} strokeWidth="0.6" />
          <path d="M73,40L80,47L87,40L80,33Z" fill="none" stroke={color} strokeWidth="0.6" />
          <path d="M40,73L47,80L40,87L33,80Z" fill="none" stroke={color} strokeWidth="0.6" />
          <path d="M-7,40L0,47L7,40L0,33Z" fill="none" stroke={color} strokeWidth="0.6" />

          <line x1="40" y1="22" x2="40" y2="7" stroke={color} strokeWidth="0.45" />
          <line x1="58" y1="40" x2="73" y2="40" stroke={color} strokeWidth="0.45" />
          <line x1="40" y1="58" x2="40" y2="73" stroke={color} strokeWidth="0.45" />
          <line x1="22" y1="40" x2="7" y2="40" stroke={color} strokeWidth="0.45" />

          <circle cx="40" cy="40" r="2" fill="none" stroke={color} strokeWidth="0.55" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

export function ArchIconBadge({
  icon: Icon,
  size = "md",
  className,
}: {
  icon: import("lucide-react").LucideIcon;
  size?: "sm" | "md";
  className?: string;
}) {
  const dims = size === "sm" ? "w-11 h-[3.25rem]" : "w-14 h-[4.25rem]";
  const iconSize = size === "sm" ? "h-[1.1rem] w-[1.1rem]" : "h-6 w-6";
  return (
    <div
      className={`relative shrink-0 ${dims} rounded-t-full rounded-b-md bg-gradient-to-b from-primary to-primary/85 flex items-end justify-center pb-2 shadow-sm ${className ?? ""}`}
    >
      <span className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-secondary/80" />
      <Icon className={`${iconSize} text-primary-foreground`} strokeWidth={1.75} />
    </div>
  );
}
