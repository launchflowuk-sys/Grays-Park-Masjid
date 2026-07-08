import { useMemo, useState } from "react";
import { Link } from "wouter";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { IslamicPatternBg } from "@/components/site/islamic-pattern";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useListQuranChapters,
  useGetQuranSettingsPublic,
  useGetFeaturedAyahPublic,
  useGetQuranAyah,
  getGetQuranAyahQueryKey,
  useSearchQuran,
  getSearchQuranQueryKey,
} from "@workspace/api-client-react";
import { BookOpen, Search, Sparkles } from "lucide-react";
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
    return <Skeleton className="h-44 w-full rounded-2xl" />;
  }
  if (!featured || !verse) return null;

  const chapter = chapters?.find((c) => c.id === featured.surahNumber);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#1B3D2F]">
      <IslamicPatternBg opacity={0.06} color="white" />
      <div className="relative px-7 py-8 sm:px-10 sm:py-10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-3.5 w-3.5 text-[#C9A84C]" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#C9A84C]">
            Ayah of the Day
          </span>
        </div>
        <p dir="rtl" className="font-serif text-2xl sm:text-3xl leading-loose text-[#FAF8F3] mb-4">
          {verse.text_uthmani}
        </p>
        <p className="text-[#FAF8F3]/75 leading-relaxed mb-5 max-w-2xl">
          {verse.translations?.[0]?.text ?? ""}
        </p>
        {featured.reflectionTitle && (
          <p className="text-sm text-[#C9A84C] font-medium mb-1">{featured.reflectionTitle}</p>
        )}
        {featured.reflectionText && (
          <p className="text-sm text-[#FAF8F3]/60 leading-relaxed mb-5">{featured.reflectionText}</p>
        )}
        <Link
          href={`/quran/${featured.surahNumber}#ayah-${featured.ayahNumber}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C9A84C] hover:text-[#C9A84C]/80 transition-colors"
          data-testid="link-featured-ayah"
        >
          {chapter?.name_simple ?? "Surah"} {featured.surahNumber}:{featured.ayahNumber}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
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
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-14">
        No verses found for &ldquo;{query}&rdquo;.
      </p>
    );
  }

  return (
    <div className="space-y-3" data-testid="list-search-results">
      {data.map((result) => (
        <Link
          key={`${result.surahNumber}-${result.ayahNumber}`}
          href={`/quran/${result.surahNumber}#ayah-${result.ayahNumber}`}
          data-testid={`link-search-result-${result.surahNumber}-${result.ayahNumber}`}
        >
          <div className="group rounded-xl border border-[#1B3D2F]/10 bg-white/70 hover:border-[#1B3D2F]/25 hover:bg-white transition-all duration-150 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#1B3D2F]/60">
                {result.surahName} · {result.surahNumber}:{result.ayahNumber}
              </span>
            </div>
            <p dir="rtl" className="font-serif text-xl text-[#1B3D2F] mb-2 leading-loose">
              {result.arabic}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">{result.translation}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function SurahCard({ chapter }: { chapter: { id: number; name_simple: string; translated_name?: { name: string } | null; verses_count: number; revelation_place: string; name_arabic: string } }) {
  const isMeccan = chapter.revelation_place === "makkah";

  return (
    <Link href={`/quran/${chapter.id}`} data-testid={`link-chapter-${chapter.id}`}>
      <div className="group relative h-full rounded-xl border border-[#1B3D2F]/10 bg-white/70 hover:bg-white hover:border-[#1B3D2F]/20 hover:shadow-md transition-all duration-200 overflow-hidden">

        {/* Coloured top accent line */}
        <div
          className="h-[3px] w-full"
          style={{ background: isMeccan ? "#1B3D2F" : "#C9A84C" }}
        />

        <div className="p-5 flex items-start gap-4">

          {/* Number medallion */}
          <div className="shrink-0 relative flex flex-col items-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-serif font-bold text-base shadow-sm ring-2 ring-offset-1 transition-transform group-hover:scale-105"
              style={
                isMeccan
                  ? {
                      background: "#1B3D2F",
                      color: "#FAF8F3",
                      ringColor: "#1B3D2F20",
                    }
                  : {
                      background: "#C9A84C",
                      color: "#1B3D2F",
                      ringColor: "#C9A84C30",
                    }
              }
            >
              {chapter.id}
            </div>
            <span
              className="mt-2 text-[9px] font-semibold uppercase tracking-widest"
              style={{ color: isMeccan ? "#1B3D2F" : "#9A7120" }}
            >
              {isMeccan ? "Meccan" : "Medinan"}
            </span>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="font-serif text-[1.05rem] text-[#1B3D2F] leading-snug">
              {chapter.name_simple}
            </p>
            <p className="text-xs text-[#1B3D2F]/50 mt-1">
              {chapter.translated_name?.name}
            </p>
            <p className="text-xs text-[#1B3D2F]/40 mt-0.5">
              {chapter.verses_count} verses
            </p>
          </div>

          {/* Arabic name */}
          <div className="shrink-0 pt-1">
            <p
              dir="rtl"
              className="font-serif text-2xl leading-none"
              style={{ color: isMeccan ? "#1B3D2F" : "#C9A84C" }}
            >
              {chapter.name_arabic}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SurahSkeleton() {
  return (
    <div className="rounded-xl border border-[#1B3D2F]/8 bg-white/50 overflow-hidden">
      <div className="h-[3px] bg-[#1B3D2F]/10" />
      <div className="p-5 flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-full shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
        <Skeleton className="h-7 w-14 rounded shrink-0" />
      </div>
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
    <div className="min-h-screen flex flex-col bg-[#FAF8F3] text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="relative bg-[#1B3D2F] overflow-hidden">
        <IslamicPatternBg opacity={0.05} color="white" />
        <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] text-[#C9A84C] font-semibold mb-6">
            <BookOpen className="h-3 w-3" />
            The Noble Qur&apos;an
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#FAF8F3] mb-4 leading-tight">
            Read, Listen &amp; Reflect
          </h1>
          <p className="text-[#FAF8F3]/65 max-w-lg mx-auto mb-10 text-[0.95rem]">
            Explore all 114 surahs with Arabic text, translation and recitation
            by renowned reciters.
          </p>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1B3D2F]/40" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keyword — mercy, patience, forgiveness…"
              className="pl-11 h-12 rounded-full bg-[#FAF8F3] text-[#1B3D2F] border-0 shadow-lg placeholder:text-[#1B3D2F]/40 focus-visible:ring-[#C9A84C]/50"
              data-testid="input-quran-search"
            />
          </div>
        </div>
      </section>

      {/* Legend */}
      <div className="border-b border-[#1B3D2F]/8 bg-white/60">
        <div className="mx-auto max-w-6xl px-6 py-3 flex items-center gap-6 text-xs text-[#1B3D2F]/60">
          <span className="font-medium text-[#1B3D2F]/40 uppercase tracking-widest text-[10px]">Colour key</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-[#1B3D2F]" />
            Meccan Surahs
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-[#C9A84C]" />
            Medinan Surahs
          </span>
        </div>
      </div>

      {/* Main content — cream with subtle pattern */}
      <main className="flex-1 relative">
        <IslamicPatternBg opacity={0.025} color="#1B3D2F" />
        <div className="relative mx-auto max-w-6xl px-6 py-10 sm:py-14 w-full">

          {debouncedSearch.length >= 2 ? (
            <div>
              <h2 className="font-serif text-2xl mb-6 text-[#1B3D2F]">
                Results for &ldquo;{debouncedSearch}&rdquo;
              </h2>
              <SearchResults
                query={debouncedSearch}
                translation={settings?.defaultTranslation ?? "en.sahih"}
              />
            </div>
          ) : (
            <>
              <div className="mb-12">
                <FeaturedAyahBanner />
              </div>

              {/* Section header + filters */}
              <div className="flex items-center justify-between mb-7 gap-4 flex-wrap">
                <div>
                  <h2 className="font-serif text-2xl text-[#1B3D2F]">All Surahs</h2>
                  <p className="text-xs text-[#1B3D2F]/45 mt-0.5">
                    {chaptersLoading ? "Loading…" : `${filteredChapters.length} surahs`}
                  </p>
                </div>
                <div className="flex gap-2">
                  {(["all", "makkah", "madinah"] as const).map((key) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 border"
                      style={
                        filter === key
                          ? {
                              background: key === "madinah" ? "#C9A84C" : "#1B3D2F",
                              color: key === "madinah" ? "#1B3D2F" : "#FAF8F3",
                              borderColor: key === "madinah" ? "#C9A84C" : "#1B3D2F",
                            }
                          : {
                              background: "transparent",
                              color: "#1B3D2F",
                              borderColor: "#1B3D2F20",
                            }
                      }
                      data-testid={`button-filter-${key.toLowerCase()}`}
                    >
                      {key === "all" ? "All" : key === "makkah" ? "Meccan" : "Medinan"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Surah grid */}
              {chaptersLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <SurahSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  data-testid="grid-chapters"
                >
                  {filteredChapters.map((chapter) => (
                    <SurahCard key={chapter.id} chapter={chapter} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
