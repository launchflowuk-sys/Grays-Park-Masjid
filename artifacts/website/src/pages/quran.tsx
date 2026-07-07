import { useMemo, useState } from "react";
import { Link } from "wouter";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { IslamicPattern } from "@/components/site/islamic-pattern";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  useListQuranChapters,
  useGetQuranSettingsPublic,
  useGetFeaturedAyahPublic,
  useGetQuranAyah,
  getGetQuranAyahQueryKey,
  useSearchQuran,
  getSearchQuranQueryKey,
} from "@workspace/api-client-react";
import { BookOpen, Search, MapPin, Sparkles } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

function FeaturedAyahBanner() {
  const { data: settings } = useGetQuranSettingsPublic();
  const { data: featured, isLoading } = useGetFeaturedAyahPublic();
  const { data: chapters } = useListQuranChapters();
  const { data: verse, isLoading: verseLoading } = useGetQuranAyah(
    featured?.surahNumber ?? 0,
    featured?.ayahNumber ?? 0,
    { translation: settings?.defaultTranslation },
    {
      query: {
        enabled: !!featured,
        queryKey: getGetQuranAyahQueryKey(featured?.surahNumber ?? 0, featured?.ayahNumber ?? 0, {
          translation: settings?.defaultTranslation,
        }),
      },
    },
  );

  if (isLoading || (featured && verseLoading)) {
    return <Skeleton className="h-40 w-full rounded-xl" />;
  }
  if (!featured || !verse) return null;

  const chapter = chapters?.find((c) => c.id === featured.surahNumber);

  return (
    <Card className="relative overflow-hidden border-card-border bg-primary text-primary-foreground">
      <IslamicPattern className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 text-primary-foreground/[0.06]" />
      <CardContent className="relative p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-3 text-secondary">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs uppercase tracking-[0.15em] font-semibold">Ayah of the Day</span>
        </div>
        <p dir="rtl" className="font-serif text-2xl sm:text-3xl leading-relaxed mb-3">
          {verse.text_uthmani}
        </p>
        <p className="text-primary-foreground/85 leading-relaxed mb-4">{verse.translations?.[0]?.text ?? ""}</p>
        {featured.reflectionTitle && (
          <p className="text-sm text-secondary font-medium mb-1">{featured.reflectionTitle}</p>
        )}
        {featured.reflectionText && (
          <p className="text-sm text-primary-foreground/70 leading-relaxed mb-4">{featured.reflectionText}</p>
        )}
        <Link
          href={`/quran/${featured.surahNumber}#ayah-${featured.ayahNumber}`}
          className="inline-flex text-sm font-semibold text-secondary hover:underline"
          data-testid="link-featured-ayah"
        >
          {chapter?.name_simple ?? "Surah"} {featured.surahNumber}:{featured.ayahNumber} &rarr;
        </Link>
      </CardContent>
    </Card>
  );
}

function SearchResults({ query, translation }: { query: string; translation: string }) {
  const { data, isLoading } = useSearchQuran(
    { q: query, translation },
    {
      query: {
        enabled: query.length >= 2,
        queryKey: getSearchQuranQueryKey({ q: query, translation }),
      },
    },
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <p className="text-muted-foreground text-center py-10">No verses found for &ldquo;{query}&rdquo;.</p>;
  }

  return (
    <div className="space-y-3" data-testid="list-search-results">
      {data.map((result) => (
        <Link
          key={`${result.surahNumber}-${result.ayahNumber}`}
          href={`/quran/${result.surahNumber}#ayah-${result.ayahNumber}`}
          data-testid={`link-search-result-${result.surahNumber}-${result.ayahNumber}`}
        >
          <Card className="border-card-border hover-elevate transition-colors">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="text-xs">
                  {result.surahName} {result.surahNumber}:{result.ayahNumber}
                </Badge>
              </div>
              <p dir="rtl" className="font-serif text-lg mb-2 leading-relaxed">
                {result.arabic}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">{result.translation}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default function QuranPage() {
  const { data: settings } = useGetQuranSettingsPublic();
  const { data: chapters, isLoading: chaptersLoading } = useListQuranChapters();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [filter, setFilter] = useState<"all" | "makkah" | "madinah">("all");

  const filteredChapters = useMemo(() => {
    if (!chapters) return [];
    if (filter === "all") return chapters;
    return chapters.filter((c) => c.revelation_place === filter);
  }, [chapters, filter]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />

      <section className="relative bg-primary overflow-hidden">
        <IslamicPattern className="pointer-events-none absolute inset-0 w-full h-full text-primary-foreground/[0.04]" />
        <div className="relative mx-auto max-w-6xl px-6 py-14 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-black/30 px-4 py-1.5 text-xs uppercase tracking-[0.15em] text-secondary font-semibold mb-5">
            <BookOpen className="h-3.5 w-3.5" />
            The Noble Qur&apos;an
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-primary-foreground mb-4">
            Read, Listen &amp; Reflect
          </h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Explore all 114 surahs with Arabic text, translation, and recitation by renowned
            reciters.
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search the Qur'an (e.g. mercy, patience, forgiveness)..."
              className="pl-11 h-12 rounded-full bg-background text-foreground border-0 shadow-lg"
              data-testid="input-quran-search"
            />
          </div>
        </div>
      </section>

      <main className="flex-1 mx-auto max-w-6xl px-6 py-10 sm:py-14 w-full">
        {debouncedSearch.length >= 2 ? (
          <div>
            <h2 className="font-serif text-2xl mb-6">
              Results for &ldquo;{debouncedSearch}&rdquo;
            </h2>
            <SearchResults query={debouncedSearch} translation={settings?.defaultTranslation ?? "en.sahih"} />
          </div>
        ) : (
          <>
            <div className="mb-10">
              <FeaturedAyahBanner />
            </div>

            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <h2 className="font-serif text-2xl">All Surahs</h2>
              <div className="flex gap-2">
                {(["all", "makkah", "madinah"] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      filter === key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                    }`}
                    data-testid={`button-filter-${key.toLowerCase()}`}
                  >
                    {key === "all" ? "All" : key === "makkah" ? "Meccan" : "Medinan"}
                  </button>
                ))}
              </div>
            </div>

            {chaptersLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                data-testid="grid-chapters"
              >
                {filteredChapters.map((chapter) => (
                  <Link key={chapter.id} href={`/quran/${chapter.id}`} data-testid={`link-chapter-${chapter.id}`}>
                    <Card className="border-card-border hover-elevate transition-colors h-full">
                      <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-t-full rounded-b-md bg-primary/10 text-primary font-serif font-semibold">
                          {chapter.id}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-base truncate">{chapter.name_simple}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {chapter.translated_name?.name} &middot; {chapter.verses_count} verses
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <p dir="rtl" className="font-serif text-lg text-primary">{chapter.name_arabic}</p>
                          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                            <MapPin className="h-2.5 w-2.5" />
                            {chapter.revelation_place === "makkah" ? "Meccan" : "Medinan"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
