import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useListAnnouncementsPublic, useListNewsPublic } from "@workspace/api-client-react";
import { Pin } from "lucide-react";

export default function AnnouncementsPage() {
  const { data, isLoading } = useListAnnouncementsPublic();
  const { data: newsData, isLoading: newsLoading } = useListNewsPublic();

  const sorted = [...(data ?? [])].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const aDate = a.publishedAt ?? a.createdAt;
    const bDate = b.publishedAt ?? b.createdAt;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

  const sortedNews = [...(newsData ?? [])].sort((a, b) => {
    const aDate = a.publishedAt ?? a.createdAt;
    const bDate = b.publishedAt ?? b.createdAt;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h1 className="font-serif text-3xl md:text-4xl">News &amp; Announcements</h1>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              Stay up to date with the latest news and notices from Grays Park Masjid.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="font-serif text-2xl mb-6">Announcements</h2>
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : sorted.length === 0 ? (
            <p className="text-center text-muted-foreground mb-4">No announcements at this time.</p>
          ) : (
            <div className="space-y-5">
              {sorted.map((announcement) => (
                <Card
                  key={announcement.id}
                  className="border-card-border"
                  data-testid={`card-announcement-${announcement.id}`}
                >
                  <CardContent className="py-6">
                    {announcement.imageUrl && (
                      <img
                        src={announcement.imageUrl}
                        alt={announcement.title}
                        className="w-full h-48 object-cover rounded-md mb-4"
                        data-testid={`img-announcement-${announcement.id}`}
                      />
                    )}
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <p className="font-serif text-lg">{announcement.title}</p>
                      {announcement.pinned && (
                        <Badge variant="secondary" className="shrink-0 gap-1">
                          <Pin className="h-3 w-3" />
                          Pinned
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {announcement.body}
                    </p>
                    {announcement.publishedAt && (
                      <p className="text-xs text-muted-foreground mt-4">
                        {new Date(announcement.publishedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16 border-t border-border">
          <h2 className="font-serif text-2xl mb-6">News</h2>
          {newsLoading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : sortedNews.length === 0 ? (
            <p className="text-center text-muted-foreground">No news posts at this time.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedNews.map((post) => (
                <Card
                  key={post.id}
                  className="border-card-border overflow-hidden flex flex-col"
                  data-testid={`card-news-${post.id}`}
                >
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="h-40 w-full object-cover"
                      data-testid={`img-news-${post.id}`}
                    />
                  )}
                  <CardContent className="py-6 flex flex-col flex-1">
                    <p className="font-serif text-lg mb-2">{post.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {post.excerpt ?? post.body}
                    </p>
                    {post.publishedAt && (
                      <p className="text-xs text-muted-foreground mt-4">
                        {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
