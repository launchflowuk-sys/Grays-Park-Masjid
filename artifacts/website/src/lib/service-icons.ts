import {
  BookOpen,
  Flower,
  HandHeart,
  HeartHandshake,
  Home,
  MoonStar,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Explicit map of the lucide icons used by service records (see the service
 * seeds in lib/db/src/seed.ts). Importing icons by name keeps the rest of
 * the lucide-react barrel out of the public bundle — do NOT switch back to
 * `import * as Icons from "lucide-react"`.
 *
 * If an admin sets a new icon name in the dashboard, add it here.
 */
const SERVICE_ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Flower,
  HandHeart,
  HeartHandshake,
  Home,
  MoonStar,
  Users,
};

function toPascalCase(name: string): string {
  return name
    .split(/[-_ ]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export function resolveServiceIcon(name?: string | null): LucideIcon {
  if (!name) return HandHeart;
  return SERVICE_ICONS[name] ?? SERVICE_ICONS[toPascalCase(name)] ?? HandHeart;
}
