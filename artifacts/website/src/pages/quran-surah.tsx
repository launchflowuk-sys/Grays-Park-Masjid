import { useEffect, useMemo, useState } from "react";
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

export default function QuranSurahPage() {
  const params = useParams<{ number: string }>();
  const surahNumber = Number(params.number);
  const { toast } = useToast();

  const { data: settings } = useGetQuranSettingsPublic();
  const { data: chapters } = useListQuranChapters();
  const { data: reciters } = useListQuranReciters();
  const { data: translations } = useListQuranTranslations();

  const [translation, setTranslation] = useState<string>("");
  const [reciter, setReciter] = useState<string>("");
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    setBookmarks(readBookmarks());
  }, []);

  useEffect(() => {
    if (settings && !translation) setTranslation(settings.defaultTranslation);
    if (settings && !reciter) setReciter(settings.defaultReciter);
  }, [settings, translation, reciter]);

  const { data: verses, isLoading: versesLoading } = useGetQuranChapterVerses(
    surahNumber,
    { translation: translation || undefined, reciter: reciter || undefined },
    {
      query: {
        enabled: !!surahNumber && !!translation && !!reciter,
        queryKey: getGetQuranChapterVersesQueryKey(surahNumber, {
          translation: translation || undefined,
          reciter: reciter || undefined,
        }),
      },
    },
  );

  const chapter = chapters?.find((c) => c.id === surahNumber);
  const { current, isPlaying, play, togglePlay } = useQuranAudio();

  useEffect(() => {
    if (!chapter) return;
    document.getElementById(`ayah-${window.location.hash.replace("#ayah-", "")}`)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [chapter, verses]);

  const queue: QuranAudioTrack[] = useMemo(() => {
    if (!verses || !chapter) return [];
    return verses
      .filter((v) => v.audioUrl)
      .map((v) => ({
        surahNumber: v.surahNumber,
        ayahNumber: v.ayahNumber,
        numberInSurah: v.numberInSurah,
        audioUrl: v.audioUrl as string,
        surahName: chapter.name_simple,
      }));
  }, [verses, chapter]);

  function toggleBookmark(ayahNumber: number) {
    const key = `${surahNumber}:${ayahNumber}`;
    const next = bookmarks.includes(key)
      ? bookmarks.filter((b) => b !== key)
      : [...bookmarks, key];
    setBookmarks(next);
    writeBookmarks(next);
    toast({ title: bookmarks.includes(key) ? "Bookmark removed" : "Ayah bookmarked" });
  }

  function shareAyah(ayahNumber: number) {
    const url = `${window.location.origin}${window.location.pathname}#ayah-${ayahNumber}`;
    if (navigator.share) {
      navigator.share({ title: `${chapter?.name_simple} ${surahNumber}:${ayahNumber}`, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: "Link copied to clipboard" });
    }
  }

  function playSurahFromStart() {
    if (queue.length === 0) return;
    play(queue[0], queue);
  }

  function playAyah(ayahNumber: number, audioUrl: string | null, numberInSurah: number) {
    if (!audioUrl || !chapter) return;
    const track: QuranAudioTrack = {
      surahNumber,
      ayahNumber,
      numberInSurah,
      audioUrl,
      surahName: chapter.name_simple,
    };
    if (current?.surahNumber === surahNumber && current?.ayahNumber === ayahNumber) {
      togglePlay();
    } else {
      play(track, queue);
    }
  }

  const prevChapter = chapters?.find((c) => c.id === surahNumber - 1);
  const nextChapter = chapters?.find((c) => c.id === surahNumber + 1);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />

      <section className="relative bg-primary overflow-hidden">
        <IslamicPattern className="pointer-events-none absolute inset-0 w-full h-full text-primary-foreground/[0.04]" />
        <div className="relative mx-auto max-w-4xl px-6 py-10 sm:py-14 text-center">
          {chapter ? (
            <>
              <p className="text-xs uppercase tracking-[0.15em] text-secondary font-semibold mb-3">
                Surah {chapter.id} &middot; {chapter.revelation_place === "makkah" ? "Meccan" : "Medinan"} &middot; {chapter.verses_count} verses
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl text-primary-foreground mb-2">
                {chapter.name_simple}
                <span className="block text-sm font-sans font-normal text-primary-foreground/70 mt-1">
                  {chapter.translated_name?.name}
                </span>
              </h1>
              <p dir="rtl" className="font-serif text-4xl text-secondary mt-4">
                {chapter.name_arabic}
              </p>
              <div className="mt-6">
                <Button
                  onClick={playSurahFromStart}
                  className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2"
                  data-testid="button-play-surah"
                >
                  {isPlaying && current?.surahNumber === surahNumber ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {isPlaying && current?.surahNumber === surahNumber ? "Playing Surah" : "Play Surah"}
                </Button>
              </div>
            </>
          ) : (
            <Skeleton className="h-24 w-full max-w-md mx-auto bg-primary-foreground/10" />
          )}
        </div>
      </section>

      <div className="sticky top-[57px] z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-4xl px-6 py-3 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <Link href="/quran" data-testid="link-all-surahs">
              <Button size="sm" variant="outline" className="gap-1.5">
                <LayoutGrid className="h-3.5 w-3.5" />
                All Surahs
              </Button>
            </Link>
            {prevChapter && (
              <Link href={`/quran/${prevChapter.id}`} data-testid="link-prev-surah">
                <Button size="sm" variant="ghost" className="gap-1 text-muted-foreground">
                  <ChevronLeft className="h-3.5 w-3.5" />
                  {prevChapter.name_simple}
                </Button>
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Select value={translation} onValueChange={setTranslation}>
              <SelectTrigger className="h-8 w-[160px] text-xs" data-testid="select-translation">
                <SelectValue placeholder="Translation" />
              </SelectTrigger>
              <SelectContent>
                {translations?.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={reciter} onValueChange={setReciter}>
              <SelectTrigger className="h-8 w-[160px] text-xs" data-testid="select-reciter">
                <SelectValue placeholder="Reciter" />
              </SelectTrigger>
              <SelectContent>
                {reciters?.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            {nextChapter ? (
              <Link href={`/quran/${nextChapter.id}`} data-testid="link-next-surah">
                <Button size="sm" variant="outline" className="gap-1">
                  {nextChapter.name_simple}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
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
              const key = `${verse.surahNumber}:${verse.ayahNumber}`;
              const isBookmarked = bookmarks.includes(key);
              const isCurrentAudio =
                current?.surahNumber === verse.surahNumber && current?.ayahNumber === verse.ayahNumber;
              return (
                <Card
                  key={verse.ayahNumber}
                  id={`ayah-${verse.ayahNumber}`}
                  className={`border-card-border scroll-mt-32 transition-colors ${
                    isCurrentAudio ? "ring-2 ring-primary/40 bg-primary/[0.03]" : ""
                  }`}
                  data-testid={`card-verse-${verse.numberInSurah}`}
                >
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-serif font-semibold">
                        {verse.numberInSurah}
                      </span>
                      <div className="flex items-center gap-1">
                        {verse.audioUrl && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => playAyah(verse.ayahNumber, verse.audioUrl, verse.numberInSurah)}
                            aria-label="Play ayah"
                            data-testid={`button-play-ayah-${verse.numberInSurah}`}
                          >
                            {isCurrentAudio && isPlaying ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Volume2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => toggleBookmark(verse.ayahNumber)}
                          aria-label="Bookmark ayah"
                          data-testid={`button-bookmark-ayah-${verse.numberInSurah}`}
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
                          onClick={() => shareAyah(verse.ayahNumber)}
                          aria-label="Share ayah"
                          data-testid={`button-share-ayah-${verse.numberInSurah}`}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p dir="rtl" className="font-serif text-2xl sm:text-3xl leading-[2.1] mb-4 text-right">
                      {verse.arabic}
                    </p>
                    <p className="text-muted-foreground leading-relaxed">{verse.translation}</p>
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
