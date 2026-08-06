import { useEffect } from "react";

const SITE_NAME = "Grays Park Masjid";
const BASE_URL = "https://graysparkmasjid.org.uk";
const DEFAULT_OG_IMAGE = `${BASE_URL}/opengraph.jpg`;

interface PageMeta {
  title: string;
  description: string;
  /** Path (e.g. "/prayer-times") used for the canonical URL and og:url. Defaults to the current pathname. */
  canonicalPath?: string;
  /** Absolute or site-relative image URL for og:image / twitter:image. Defaults to /opengraph.jpg. */
  ogImage?: string;
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function toAbsoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${BASE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/**
 * Sets per-page document title, meta description, canonical link and
 * Open Graph / Twitter card tags. Values persist until the next page
 * that calls this hook overwrites them.
 */
export function usePageMeta({ title, description, canonicalPath, ogImage }: PageMeta) {
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const canonicalUrl = toAbsoluteUrl(canonicalPath ?? window.location.pathname);
    const imageUrl = ogImage ? toAbsoluteUrl(ogImage) : DEFAULT_OG_IMAGE;

    document.title = fullTitle;
    upsertMeta("name", "description", description);
    upsertCanonical(canonicalUrl);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("property", "og:image", imageUrl);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", imageUrl);
  }, [title, description, canonicalPath, ogImage]);
}
