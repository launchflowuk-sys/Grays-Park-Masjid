import { Link } from "wouter";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { useListBlogPostsPublic } from "@workspace/api-client-react";
import { Calendar, Clock, User, BookOpen } from "lucide-react";
import { IslamicPattern, IslamicStar } from "@/components/site/islamic-pattern";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function readingTime(html: string) {
  const text = html.replace(/<[^>]+>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default function StoriesPage() {
  const { data: posts = [], isLoading } = useListBlogPostsPublic({ category: "stories" });
  const sorted = [...posts].sort(
    (a, b) =>
      new Date(b.publishedAt ?? b.createdAt).getTime() -
      new Date(a.publishedAt ?? a.createdAt).getTime(),
  );

  return (
    <>
      <SiteHeader />
      <main>
      <section className="relative bg-primary text-primary-foreground py-20 overflow-hidden">
        <IslamicPattern className="absolute inset-0 opacity-5 w-full h-full" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-10 w-10 text-secondary" strokeWidth={1.5} />
          </div>
          <p className="font-arabic text-3xl text-secondary mb-4">قصص إسلامية</p>
          <h1 className="font-serif text-4xl sm:text-5xl mb-4">Islamic Stories</h1>
          <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto leading-relaxed">
            Inspiring stories from Islamic history — for children, families, and everyone seeking
            wisdom and moral guidance.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="h-5 w-5 text-primary" strokeWidth={1.75} />
          <h2 className="font-serif text-2xl">Stories for All Ages</h2>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl bg-muted animate-pulse h-32" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary/20" strokeWidth={1.5} />
            <p className="text-lg">No stories published yet — check back soon.</p>
            <Button className="mt-6" asChild>
              <Link href="/blog">Browse all posts</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {sorted.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row">
                  {post.featureImageUrl ? (
                    <div className="sm:w-48 aspect-video sm:aspect-auto overflow-hidden shrink-0">
                      <img
                        src={post.featureImageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="sm:w-48 bg-primary/5 flex items-center justify-center p-6 shrink-0">
                      <IslamicStar className="h-10 w-10 text-primary/20" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-xl leading-snug mb-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-muted-foreground text-sm line-clamp-2">{post.excerpt}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3 flex-wrap">
                      {post.authorName && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {post.authorName}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.publishedAt ?? post.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {readingTime(post.content)} min read
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
      <SiteFooter />
    </>
  );
}
