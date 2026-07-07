import { Link } from "wouter";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useListBlogPostsPublic } from "@workspace/api-client-react";
import { BLOG_CATEGORY_LABELS } from "@/lib/blog-categories";
import { Calendar, Clock, User, Star } from "lucide-react";
import { IslamicPattern, IslamicStar } from "@/components/site/islamic-pattern";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function readingTime(html: string) {
  const text = html.replace(/<[^>]+>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default function ProphetPage() {
  const { data: posts = [], isLoading } = useListBlogPostsPublic({ category: "prophet" });
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
            <IslamicStar className="h-10 w-10 text-secondary" />
          </div>
          <p className="font-arabic text-3xl text-secondary mb-4">سيد الأنبياء والمرسلين</p>
          <h1 className="font-serif text-4xl sm:text-5xl mb-4">Prophet Muhammad ﷺ</h1>
          <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto leading-relaxed">
            Explore articles about the life, character, and legacy of our beloved Prophet ﷺ — a mercy
            to all of creation.
          </p>
          <p className="text-secondary/90 text-sm mt-4 font-arabic text-xl">
            صلى الله عليه وسلم
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Star className="h-5 w-5 text-secondary fill-secondary" />
          <h2 className="font-serif text-2xl">Articles about the Prophet ﷺ</h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl bg-muted animate-pulse h-64" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <IslamicStar className="h-12 w-12 mx-auto mb-4 text-primary/20" />
            <p className="text-lg">No articles published yet — please check back soon.</p>
            <Button className="mt-6" asChild>
              <Link href="/blog">Browse all posts</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((post) => (
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
                    <IslamicStar className="h-12 w-12 text-secondary/40" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-serif text-lg leading-snug mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{post.excerpt}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
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
                      {readingTime(post.content)} min
                    </span>
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
