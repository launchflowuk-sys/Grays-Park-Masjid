import { useState, useEffect } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useListBlogPostsPublic } from "@workspace/api-client-react";
import { BLOG_CATEGORIES, BLOG_CATEGORY_LABELS, type BlogCategory } from "@/lib/blog-categories";
import { Calendar, Clock, User, Search, X, Link2, Check, Star } from "lucide-react";
import { IslamicPattern } from "@/components/site/islamic-pattern";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function readingTime(html: string) {
  const text = html.replace(/<[^>]+>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default function BlogPage() {
  const searchString = useSearch();
  const [, navigate] = useLocation();

  const params = new URLSearchParams(searchString);
  const urlQuery = params.get("q") ?? "";
  const urlCategory = params.get("category") ?? null;

  const [inputValue, setInputValue] = useState(urlQuery);
  const [copied, setCopied] = useState(false);

  const { data: posts = [], isLoading } = useListBlogPostsPublic(
    urlCategory ? { category: urlCategory } : {},
  );

  useEffect(() => {
    setInputValue(urlQuery);
  }, [urlQuery]);

  function updateUrl(nextQuery: string, nextCategory: string | null) {
    const p = new URLSearchParams();
    if (nextQuery) p.set("q", nextQuery);
    if (nextCategory) p.set("category", nextCategory);
    const qs = p.toString();
    navigate(qs ? `/blog?${qs}` : "/blog");
  }

  function handleSearchChange(value: string) {
    setInputValue(value);
    updateUrl(value, urlCategory);
  }

  function handleCategoryChange(cat: string | null) {
    updateUrl(inputValue, cat);
  }

  const isFiltered = !!(urlQuery || urlCategory);

  function handleShareView() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const sorted = [...posts].sort(
    (a, b) =>
      new Date(b.publishedAt ?? b.createdAt).getTime() -
      new Date(a.publishedAt ?? a.createdAt).getTime(),
  );

  const filtered = urlQuery.trim()
    ? sorted.filter((p) => {
        const q = urlQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          (p.excerpt ?? "").toLowerCase().includes(q)
        );
      })
    : sorted;

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <>
      <SiteHeader />
      <main>
      <section className="relative bg-primary text-primary-foreground py-16 overflow-hidden">
        <IslamicPattern className="absolute inset-0 opacity-5 w-full h-full" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-arabic text-2xl text-secondary mb-3">المدوّنة الإسلامية</p>
          <h1 className="font-serif text-4xl sm:text-5xl mb-4">Blog & Islamic Content</h1>
          <p className="text-primary-foreground/75 text-lg max-w-xl mx-auto">
            Reflections, stories, history, and wisdom from Grays Park Masjid.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search articles…"
            value={inputValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-9"
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={urlCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange(null)}
          >
            All
          </Button>
          {BLOG_CATEGORIES.map((cat) => {
            const isProphet = cat === "prophet";
            if (isProphet) {
              const isActive = urlCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`relative inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold overflow-hidden transition-all border ${
                    isActive
                      ? "bg-primary text-secondary border-secondary/50 shadow-lg shadow-primary/40 ring-1 ring-secondary/40 scale-[1.02]"
                      : "bg-primary/90 text-secondary border-secondary/30 shadow-md shadow-primary/20 hover:bg-primary hover:border-secondary/50"
                  }`}
                >
                  <IslamicPattern className="pointer-events-none absolute inset-0 h-full w-full text-white/[0.08]" />
                  <Star className="h-3 w-3 shrink-0 relative" />
                  <span className="relative">{BLOG_CATEGORY_LABELS[cat]}</span>
                </button>
              );
            }
            return (
              <Button
                key={cat}
                variant={urlCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(cat)}
              >
                {BLOG_CATEGORY_LABELS[cat]}
              </Button>
            );
          })}
          {isFiltered && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareView}
              className="ml-auto gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Link2 className="h-3.5 w-3.5" />
                  Share this view
                </>
              )}
            </Button>
          )}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl bg-muted animate-pulse h-64" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            {urlQuery ? (
              <>
                <p className="text-lg mb-2">No articles match "{urlQuery}".</p>
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="text-primary hover:underline text-sm"
                >
                  Clear search
                </button>
              </>
            ) : (
              <p className="text-lg">No posts yet — check back soon.</p>
            )}
          </div>
        ) : (
          <>
            {featured && (
              <Link href={`/blog/${featured.slug}`} className="block mb-10 group">
                <div className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow">
                  {featured.featureImageUrl ? (
                    <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
                      <img
                        src={featured.featureImageUrl}
                        alt={featured.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="bg-primary/10 flex items-center justify-center min-h-48">
                      <IslamicPattern className="h-24 w-24 text-primary/20" />
                    </div>
                  )}
                  <div className="p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                      <Badge variant="secondary" className="mb-3">
                        {BLOG_CATEGORY_LABELS[featured.category as BlogCategory] ?? featured.category}
                      </Badge>
                      <h2 className="font-serif text-2xl sm:text-3xl mb-3 group-hover:text-primary transition-colors leading-snug">
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="text-muted-foreground leading-relaxed">{featured.excerpt}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4 flex-wrap">
                      {featured.authorName && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {featured.authorName}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(featured.publishedAt ?? featured.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {readingTime(featured.content)} min read
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group block rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {post.featureImageUrl ? (
                      <div className="aspect-[16/9] overflow-hidden">
                        <img
                          src={post.featureImageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] bg-primary/5 flex items-center justify-center">
                        <IslamicPattern className="h-12 w-12 text-primary/20" />
                      </div>
                    )}
                    <div className="p-4">
                      <Badge variant="outline" className="mb-2 text-xs">
                        {BLOG_CATEGORY_LABELS[post.category as BlogCategory] ?? post.category}
                      </Badge>
                      <h3 className="font-serif text-lg leading-snug mb-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-muted-foreground text-sm line-clamp-2">{post.excerpt}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(post.publishedAt ?? post.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {readingTime(post.content)} min
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
      <SiteFooter />
    </>
  );
}
