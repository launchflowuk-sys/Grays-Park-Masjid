import { useState } from "react";
import { Link, useParams } from "wouter";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetBlogPostBySlug } from "@workspace/api-client-react";
import { BLOG_CATEGORY_LABELS, type BlogCategory } from "@/lib/blog-categories";
import { Calendar, Clock, User, ArrowLeft, Share2, Check, Copy } from "lucide-react";
import { IslamicPattern } from "@/components/site/islamic-pattern";
import DOMPurify from "dompurify";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function readingTime(html: string) {
  const text = html.replace(/<[^>]+>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  function handleCopy() {
    navigator.clipboard.writeText(pageUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(title);

  const whatsappUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
        <Share2 className="h-4 w-4" />
        Share:
      </span>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
        aria-label="Share on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#25D366]" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        WhatsApp
      </a>

      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
        aria-label="Share on X (Twitter)"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.738l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        X
      </a>

      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
        aria-label="Copy link"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-green-600" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copy link
          </>
        )}
      </button>
    </div>
  );
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

        <hr className="border-border mb-6" />

        <div className="mb-8">
          <ShareButtons title={post.title} />
        </div>

        <div
          className="prose prose-lg max-w-none prose-headings:font-serif prose-a:text-primary prose-blockquote:border-primary/40 prose-blockquote:text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />

        <hr className="border-border mt-10 mb-6" />

        <ShareButtons title={post.title} />
      </article>
    </main>
      <SiteFooter />
    </>
  );
}
