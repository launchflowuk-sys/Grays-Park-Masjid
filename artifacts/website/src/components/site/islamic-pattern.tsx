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
