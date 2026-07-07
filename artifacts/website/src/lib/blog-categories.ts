export const BLOG_CATEGORIES = [
  "islamic_history",
  "stories",
  "prophet",
  "community",
  "reflections",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const BLOG_CATEGORY_LABELS: Record<BlogCategory, string> = {
  islamic_history: "Islamic History",
  stories: "Stories for All Ages",
  prophet: "Prophet Muhammad ﷺ",
  community: "Community News",
  reflections: "Reflections",
};
