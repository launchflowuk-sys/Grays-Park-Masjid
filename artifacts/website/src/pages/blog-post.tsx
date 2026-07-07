import { Link, useParams } from "wouter";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetBlogPostBySlug } from "@workspace/api-client-react";
import { BLOG_CATEGORY_LABELS, type BlogCategory } from "@/lib/blog-categories";
import { Calendar, Clock, User, ArrowLeft } from "lucide-react";
import { IslamicPattern } from "@/components/site/islamic-pattern";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function readingTime(html: string) {
  const text = html.replace(/<[^>]+>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, isError } = useGetBlogPostBySlug(slug);

  if (isLoading) {
    return (
      <>
      <SiteHeader />
      <main>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-4">
          <div className="h-8 bg-muted animate-pulse rounded w-2/3" />
          <div className="h-64 bg-muted animate-pulse rounded-xl" />
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-4 bg-muted animate-pulse rounded w-full" />
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
    );
  }

  if (isError || !post) {
    return (
      <>
      <SiteHeader />
      <main>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
          <h1 className="font-serif text-3xl mb-4">Article not found</h1>
          <p className="text-muted-foreground mb-6">
            This article may have been moved or is no longer available.
          </p>
          <Button asChild>
            <Link href="/blog">Back to Blog</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main>
      {post.featureImageUrl && (
        <div className="w-full max-h-[420px] overflow-hidden">
          <img
            src={post.featureImageUrl}
            alt={post.title}
            className="w-full h-full object-cover max-h-[420px]"
          />
        </div>
      )}

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2" asChild>
          <Link href="/blog">
            <ArrowLeft className="h-4 w-4 mr-1" />
            All posts
          </Link>
        </Button>

        <div className="mb-6">
          <Badge variant="secondary" className="mb-3">
            {BLOG_CATEGORY_LABELS[post.category as BlogCategory] ?? post.category}
          </Badge>
          <h1 className="font-serif text-3xl sm:text-4xl leading-tight mb-4">{post.title}</h1>
          {post.excerpt && (
            <p className="text-xl text-muted-foreground leading-relaxed mb-4">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            {post.authorName && (
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {post.authorName}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(post.publishedAt ?? post.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {readingTime(post.content)} min read
            </span>
          </div>
        </div>

        <hr className="border-border mb-8" />

        <div
          className="prose prose-lg max-w-none prose-headings:font-serif prose-a:text-primary prose-blockquote:border-primary/40 prose-blockquote:text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </main>
      <SiteFooter />
    </>
  );
}
