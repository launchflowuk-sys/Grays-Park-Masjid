import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Badge } from "@/components/ui/badge";
import { useListAnnouncementsPublic, useListNewsPublic } from "@workspace/api-client-react";
import { Pin } from "lucide-react";
import { IslamicPattern, IslamicStar } from "@/components/site/islamic-pattern";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function AnnouncementsPage() {
  const { data, isLoading } = useListAnnouncementsPublic();
  const { data: newsData, isLoading: newsLoading } = useListNewsPublic();

  const sorted = [...(data ?? [])].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime();
  });
  const sortedNews = [...(newsData ?? [])].sort((a, b) =>
    new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative bg-primary text-primary-foreground overflow-hidden">
          <IslamicPattern className="absolute inset-0 w-full h-full text-white/5 [background-size:60px_60px]" />
          <IslamicStar className="absolute -top-10 -right-10 w-56 h-56 text-white/5" />
          <IslamicStar className="absolute -bottom-10 -left-10 w-48 h-48 text-white/5" />
          <div className="relative mx-auto max-w-4xl px-6 py-16 md:py-20 text-center">
            <h1 className="font-serif text-4xl md:text-5xl">News &amp; Announcements</h1>
            <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto text-lg leading-relaxed">
              Stay up to date with the latest notices and news from Grays Park Masjid.
            </p>
          </div>
        </section>

        {/* Announcements */}
        <section className="mx-auto max-w-4xl px-6 py-14 md:py-16">
          <div className="flex items-center gap-3 mb-8">
            <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
            <h2 className="font-serif text-3xl">Announcements</h2>
          </div>
          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : sorted.length === 0 ? (
            <p className="text-muted-foreground mb-4">No announcements at this time.</p>
          ) : (
            <div className="space-y-4">
              {sorted.map((announcement) => (
                <div
                  key={announcement.id}
                  data-testid={`card-announcement-${announcement.id}`}
                  className={`relative overflow-hidden rounded-2xl border bg-card p-6 ${announcement.pinned ? "border-secondary/40 bg-secondary/5" : "border-card-border"}`}
                >
                  <IslamicPattern className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 text-primary/[0.05]" />
                  {announcement.imageUrl && (
                    <img src={announcement.imageUrl} alt={announcement.title} className="w-full h-48 object-cover rounded-lg mb-4" data-testid={`img-announcement-${announcement.id}`} />
                  )}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <p className="font-serif text-lg leading-snug">{announcement.title}</p>
                    {announcement.pinned && (
                      <Badge variant="secondary" className="shrink-0 gap-1 text-xs">
                        <Pin className="h-3 w-3" />Pinned
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{announcement.body}</p>
                  {announcement.publishedAt && (
                    <p className="text-xs text-muted-foreground/60 mt-4">{formatDate(announcement.publishedAt)}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* News */}
        <section className="relative overflow-hidden border-t border-primary/10">
          <div className="absolute inset-0 bg-primary/5" />
          <IslamicPattern className="absolute inset-0 w-full h-full text-primary/[0.03] [background-size:60px_60px]" />
          <div className="relative mx-auto max-w-6xl px-6 py-14 md:py-16">
            <div className="flex items-center gap-3 mb-8">
              <IslamicStar className="h-5 w-5 text-secondary shrink-0" />
              <h2 className="font-serif text-3xl">News</h2>
            </div>
            {newsLoading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : sortedNews.length === 0 ? (
              <p className="text-muted-foreground">No news posts at this time.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedNews.map((post) => (
                  <div
                    key={post.id}
                    data-testid={`card-news-${post.id}`}
                    className="group relative overflow-hidden rounded-2xl border border-card-border bg-card hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col"
                  >
                    {post.imageUrl ? (
                      <div className="h-40 overflow-hidden">
                        <img src={post.imageUrl} alt={post.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" data-testid={`img-news-${post.id}`} />
                      </div>
                    ) : (
                      <div className="h-1.5 bg-gradient-to-r from-secondary to-secondary/40" />
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      <p className="font-serif text-lg mb-2 leading-snug">{post.title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{post.excerpt ?? post.body}</p>
                      {post.publishedAt && (
                        <p className="text-xs text-muted-foreground/60 mt-4">{formatDate(post.publishedAt)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
