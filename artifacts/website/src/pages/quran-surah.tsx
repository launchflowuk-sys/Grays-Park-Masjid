import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "wouter";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { IslamicPattern } from "@/components/site/islamic-pattern";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useListQuranChapters,
  useGetQuranChapterVerses,
  getGetQuranChapterVersesQueryKey,
  useListQuranReciters,
  useListQuranTranslations,
  useGetQuranSettingsPublic,
} from "@workspace/api-client-react";
import { useQuranAudio, type QuranAudioTrack } from "@/lib/quran-audio-player";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Share2,
  Bookmark,
  BookmarkCheck,
  Volume2,
  LayoutGrid,
  BookOpen,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

const BOOKMARKS_KEY = "gpm-quran-bookmarks";

function readBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeBookmarks(bookmarks: string[]) {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

interface TafsirEntry {
  tafsirId: number;
  tafsirName: string;
  verseKey: string;
  text: string;
}

interface TafsirDef {
  id: number;
  name: string;
  author: string;
  language: string;
}

// ── Per-ayah tafsir panel ──────────────────────────────────────────────────────
function TafsirPanel({
  surahNumber,
  ayahNumber,
  tafsirId,
  onClose,
}: {
  surahNumber: number;
  ayahNumber: number;
  tafsirId: number;
  onClose: () => void;
}) {
  const [data, setData] = useState<TafsirEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setData(null);
    setExpanded(false);
    const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
    fetch(`${base}/api/quran/tafsir/${surahNumber}/${ayahNumber}?tafsir=${tafsirId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("not found");
        return res.json() as Promise<TafsirEntry>;
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [surahNumber, ayahNumber, tafsirId]);

  const PREVIEW_CHARS = 420;
  const isLong = (data?.text.length ?? 0) > PREVIEW_CHARS;
  const displayText =
    data && isLong && !expanded
      ? data.text.slice(0, PREVIEW_CHARS).trimEnd() + "…"
      : data?.text ?? "";

  return (
    <div
      className="mt-3 rounded-xl border border-[#C9A84C]/30 bg-[#1B3D2F]/[0.04] overflow-hidden"
      data-testid={`tafsir-panel-${ayahNumber}`}
    >
      {/* header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#C9A84C]/20 bg-[#1B3D2F]/[0.05]">
        <span className="text-[11px] font-semibold tracking-widest uppercase text-[#1B3D2F]/60">
          {data?.tafsirName ?? "Tafsir"}
        </span>
        <button
          onClick={onClose}
          className="rounded p-0.5 text-[#1B3D2F]/40 hover:text-[#1B3D2F] transition-colors"
          aria-label="Close tafsir"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="px-4 py-3 text-sm leading-relaxed text-[#1B3D2F]/85">
        {loading && (
          <div className="flex items-center gap-2 py-2 text-muted-foreground text-xs">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading tafsir…
          </div>
        )}
        {error && (
          <p className="text-xs text-muted-foreground py-1">
            Could not load tafsir for this verse. Please try again.
          </p>
        )}
        {data && (
          <>
            <p className="whitespace-pre-line">{displayText}</p>
            {isLong && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="mt-2 flex items-center gap-1 text-xs font-medium text-[#1B3D2F]/60 hover:text-[#1B3D2F] transition-colors"
              >
                {expanded ? (
                  <><ChevronUp className="h-3 w-3" /> Show less</>
                ) : (
                  <><ChevronDown className="h-3 w-3" /> Read full tafsir</>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function QuranSurahPage() {
  const params = useParams<{ number: string }>();
  const surahNumber = Number(params.number);
  const { toast } = useToast();

  const { data: settings } = useGetQuranSettingsPublic();
  const { data: chapters } = useListQuranChapters();
  const { data: reciters } = useListQuranReciters();
  const { data: translations } = useListQuranTranslations();

  const [translation, setTranslation] = useState<string>("en.sahih");
  const [reciter, setReciter] = useState<string>("ar.alafasy");
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  // Tafsir state
  const [tafsirList, setTafsirList] = useState<TafsirDef[]>([]);
  const [selectedTafsir, setSelectedTafsir] = useState<number>(169); // Ibn Kathir default
  const [openTafsirAyah, setOpenTafsirAyah] = useState<number | null>(null);

  useEffect(() => {
    setBookmarks(readBookmarks());
  }, []);

  const settingsAppliedRef = useRef(false);
  useEffect(() => {
    if (settings && !settingsAppliedRef.current) {
      settingsAppliedRef.current = true;
      setTranslation(settings.defaultTranslation);
      setReciter(settings.defaultReciter);
    }
  }, [settings]);

  // Fetch tafsir list once
  useEffect(() => {
    const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
    fetch(`${base}/api/quran/tafsirs`)
      .then((r) => r.json())
      .then((list: TafsirDef[]) => setTafsirList(list))
      .catch(() => {});
  }, []);

  const { data: verses, isLoading: versesLoading } = useGetQuranChapterVerses(
    surahNumber,
    { translation: translation || undefined, reciter: reciter || undefined },
    {
      query: {
        enabled: surahNumber >= 1 && surahNumber <= 114 && !!translation && !!reciter,
        queryKey: getGetQuranChapterVersesQueryKey(surahNumber, {
          translation: translation || undefined,
          reciter: reciter || undefined,
        }),
      },
    },
  );

  const chapter = useMemo(
    () => chapters?.find((c) => c.id === surahNumber),
    [chapters, surahNumber],
  );

  const prevChapter = useMemo(
    () => (chapters && surahNumber > 1 ? chapters.find((c) => c.id === surahNumber - 1) : null),
    [chapters, surahNumber],
  );
  const nextChapter = useMemo(
    () => (chapters && surahNumber < 114 ? chapters.find((c) => c.id === surahNumber + 1) : null),
    [chapters, surahNumber],
  );

  const { current, isPlaying, playTrack, togglePlay } = useQuranAudio();

  function playAyah(ayahNumber: number, audioUrl: string | null) {
    if (!audioUrl) return;
    const track: QuranAudioTrack = {
      surahNumber,
      ayahNumber,
      audioUrl,
      surahName: chapter?.name_simple ?? `Surah ${surahNumber}`,
    };
    if (current?.surahNumber === surahNumber && current?.ayahNumber === ayahNumber) {
      togglePlay();
    } else {
      playTrack(track);
    }
  }

  function toggleBookmark(ayahNumber: number) {
    const key = `${surahNumber}:${ayahNumber}`;
    setBookmarks((prev) => {
      const next = prev.includes(key) ? prev.filter((b) => b !== key) : [...prev, key];
      writeBookmarks(next);
      return next;
    });
  }

  function shareAyah(ayahNumber: number) {
    const url = `${window.location.origin}${window.location.pathname}#ayah-${ayahNumber}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast({ title: "Link copied", description: `Ayah ${surahNumber}:${ayahNumber}` }))
      .catch(() => {});
  }

  function toggleTafsir(ayahNumber: number) {
    setOpenTafsirAyah((prev) => (prev === ayahNumber ? null : ayahNumber));
  }

  if (!chapter && chapters) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Surah not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAF8F3" }}>
      <SiteHeader />

      {/* ── Hero ── */}
      <section className="relative bg-primary text-primary-foreground pt-12 pb-10 overflow-hidden">
        <IslamicPattern className="pointer-events-none absolute inset-0 opacity-[0.05] w-full h-full" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {chapter ? (
            <>
              <p className="font-arabic text-4xl sm:text-5xl mb-2 leading-relaxed text-secondary">
                {chapter.name_arabic}
              </p>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-1">
                {chapter.name_simple}
              </h1>
              <p className="text-primary-foreground/60 text-sm">
                {chapter.translated_name?.name} · {chapter.verses_count} verses ·{" "}
                {chapter.revelation_place === "makkah" ? "Meccan" : "Medinan"}
              </p>
            </>
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-10 w-32 mx-auto bg-primary-foreground/10" />
              <Skeleton className="h-6 w-48 mx-auto bg-primary-foreground/10" />
            </div>
          )}
        </div>
      </section>

      {/* ── Filter bar ── */}
      <div className="sticky top-[57px] z-30 bg-[#FAF8F3] border-b border-[#C9A84C]/30">
        <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-2 flex flex-wrap items-center gap-2 justify-between">

          {/* Left: index + prev */}
          <div className="flex items-center gap-1.5">
            <Link href="/quran" data-testid="link-all-surahs">
              <span className="inline-flex items-center gap-1.5 rounded-sm bg-[#1B3D2F] px-3 py-1.5 text-[11px] font-semibold tracking-wide uppercase text-[#C9A84C] hover:bg-[#1B3D2F]/85 transition-colors cursor-pointer select-none">
                <LayoutGrid className="h-3 w-3" />
                All Surahs
              </span>
            </Link>
            {prevChapter && (
              <>
                <span className="w-px h-4 bg-[#1B3D2F]/15 mx-0.5" />
                <Link href={`/quran/${prevChapter.id}`} data-testid="link-prev-surah">
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#1B3D2F]/60 hover:text-[#1B3D2F] transition-colors cursor-pointer select-none">
                    <ChevronLeft className="h-3.5 w-3.5 text-[#C9A84C]" />
                    {prevChapter.name_simple}
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Centre: selects */}
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={translation} onValueChange={setTranslation}>
              <SelectTrigger
                className="h-8 w-[140px] text-[11px] bg-white border-[#C9A84C]/40 text-[#1B3D2F] rounded-sm focus:ring-1 focus:ring-[#C9A84C]/60 focus:border-[#C9A84C]"
                data-testid="select-translation"
              >
                <SelectValue placeholder="Translation" />
              </SelectTrigger>
              <SelectContent>
                {translations?.map((t) => (
                  <SelectItem key={t.id} value={t.id} className="text-xs">
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-[#C9A84C]/60 text-xs select-none">◆</span>

            <Select value={reciter} onValueChange={setReciter}>
              <SelectTrigger
                className="h-8 w-[140px] text-[11px] bg-white border-[#C9A84C]/40 text-[#1B3D2F] rounded-sm focus:ring-1 focus:ring-[#C9A84C]/60 focus:border-[#C9A84C]"
                data-testid="select-reciter"
              >
                <SelectValue placeholder="Reciter" />
              </SelectTrigger>
              <SelectContent>
                {reciters?.map((r) => (
                  <SelectItem key={r.id} value={r.id} className="text-xs">
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {tafsirList.length > 0 && (
              <>
                <span className="text-[#C9A84C]/60 text-xs select-none">◆</span>
                <Select
                  value={String(selectedTafsir)}
                  onValueChange={(v) => {
                    setSelectedTafsir(Number(v));
                    setOpenTafsirAyah(null);
                  }}
                >
                  <SelectTrigger
                    className="h-8 w-[150px] text-[11px] bg-white border-[#C9A84C]/40 text-[#1B3D2F] rounded-sm focus:ring-1 focus:ring-[#C9A84C]/60 focus:border-[#C9A84C]"
                    data-testid="select-tafsir"
                  >
                    <BookOpen className="h-3 w-3 mr-1 text-[#C9A84C]" />
                    <SelectValue placeholder="Tafsir" />
                  </SelectTrigger>
                  <SelectContent>
                    {tafsirList.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)} className="text-xs">
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>

          {/* Right: next */}
          <div>
            {nextChapter ? (
              <Link href={`/quran/${nextChapter.id}`} data-testid="link-next-surah">
                <span className="inline-flex items-center gap-1 text-[11px] text-[#1B3D2F]/60 hover:text-[#1B3D2F] transition-colors cursor-pointer select-none">
                  {nextChapter.name_simple}
                  <ChevronRight className="h-3.5 w-3.5 text-[#C9A84C]" />
                </span>
              </Link>
            ) : (
              <span />
            )}
          </div>

        </div>
      </div>

      <main className="flex-1 mx-auto max-w-4xl px-6 py-10 w-full pb-28">
        {versesLoading || !verses ? (
          <div className="space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-4" data-testid="list-verses">
            {verses.map((verse) => {
              const key = verse.verse_key;
              const isBookmarked = bookmarks.includes(key);
              const isCurrentAudio =
                current?.surahNumber === surahNumber && current?.ayahNumber === verse.verse_number;
              const isTafsirOpen = openTafsirAyah === verse.verse_number;

              return (
                <Card
                  key={verse.verse_key}
                  id={`ayah-${verse.verse_number}`}
                  className={`border-card-border scroll-mt-32 transition-colors ${
                    isCurrentAudio ? "ring-2 ring-primary/40 bg-primary/[0.03]" : ""
                  }`}
                  data-testid={`card-verse-${verse.verse_number}`}
                >
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-serif font-semibold">
                        {verse.verse_number}
                      </span>
                      <div className="flex items-center gap-1">
                        {verse.audio?.url && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => playAyah(verse.verse_number, verse.audio?.url ?? null)}
                            aria-label="Play ayah"
                            data-testid={`button-play-ayah-${verse.verse_number}`}
                          >
                            {isCurrentAudio && isPlaying ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        {/* Tafsir / reflection button */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className={`h-8 w-8 ${isTafsirOpen ? "bg-primary/10 text-primary" : ""}`}
                          onClick={() => toggleTafsir(verse.verse_number)}
                          aria-label={isTafsirOpen ? "Close tafsir" : "Show tafsir / reflection"}
                          data-testid={`button-tafsir-ayah-${verse.verse_number}`}
                          title="Show tafsir / reflection"
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => toggleBookmark(verse.verse_number)}
                          aria-label="Bookmark ayah"
                          data-testid={`button-bookmark-ayah-${verse.verse_number}`}
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="h-4 w-4 text-primary" />
                          ) : (
                            <Bookmark className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => shareAyah(verse.verse_number)}
                          aria-label="Share ayah"
                          data-testid={`button-share-ayah-${verse.verse_number}`}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p dir="rtl" className="font-serif text-2xl sm:text-3xl leading-[2.1] mb-4 text-right">
                      {verse.text_uthmani}
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {verse.translations?.[0]?.text ?? ""}
                    </p>

                    {/* Inline tafsir panel */}
                    {isTafsirOpen && (
                      <TafsirPanel
                        surahNumber={surahNumber}
                        ayahNumber={verse.verse_number}
                        tafsirId={selectedTafsir}
                        onClose={() => setOpenTafsirAyah(null)}
                      />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
