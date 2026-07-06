import { Link } from "wouter";
import { useQuranAudio } from "@/lib/quran-audio-player";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Play, Pause, SkipBack, SkipForward, X, Gauge, Repeat } from "lucide-react";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const RATES = [0.75, 1, 1.25, 1.5, 2];

export function MiniAudioPlayer() {
  const {
    current,
    isPlaying,
    isLoading,
    progress,
    duration,
    playbackRate,
    autoAdvance,
    togglePlay,
    next,
    prev,
    seek,
    setPlaybackRate,
    setAutoAdvance,
    stop,
    queue,
  } = useQuranAudio();

  if (!current) return null;

  const canPrev = queue.findIndex(
    (t) => t.surahNumber === current.surahNumber && t.ayahNumber === current.ayahNumber,
  ) > 0;
  const currentQueueIndex = queue.findIndex(
    (t) => t.surahNumber === current.surahNumber && t.ayahNumber === current.ayahNumber,
  );
  const canNext = currentQueueIndex >= 0 && currentQueueIndex + 1 < queue.length;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      data-testid="mini-audio-player"
    >
      <div className="mx-auto max-w-6xl px-3 sm:px-6 py-2.5 flex items-center gap-3">
        <div className="min-w-0 flex-1 sm:flex-none sm:w-48">
          <Link
            href={`/quran/${current.surahNumber}`}
            className="block truncate text-sm font-medium hover:text-primary transition-colors"
            data-testid="link-mini-player-surah"
          >
            {current.surahName ? `${current.surahName} · ` : ""}Ayah {current.numberInSurah}
          </Link>
          <p className="text-xs text-muted-foreground tabular-nums">
            {formatTime(progress)} / {formatTime(duration)}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={prev}
            disabled={!canPrev}
            aria-label="Previous ayah"
            data-testid="button-audio-prev"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={togglePlay}
            disabled={isLoading}
            aria-label={isPlaying ? "Pause" : "Play"}
            data-testid="button-audio-toggle"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={next}
            disabled={!canNext}
            aria-label="Next ayah"
            data-testid="button-audio-next"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <div className="hidden sm:flex flex-1 items-center gap-2">
          <Slider
            value={[progress]}
            max={duration || 1}
            step={0.1}
            onValueChange={([v]) => seek(v)}
            className="flex-1"
            data-testid="slider-audio-progress"
            aria-label="Seek"
          />
        </div>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                aria-label="Playback speed"
                data-testid="button-audio-speed"
              >
                <Gauge className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {RATES.map((rate) => (
                <DropdownMenuItem
                  key={rate}
                  onClick={() => setPlaybackRate(rate)}
                  className={playbackRate === rate ? "font-semibold text-primary" : ""}
                  data-testid={`option-audio-speed-${rate}`}
                >
                  {rate}x
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="icon"
            variant={autoAdvance ? "secondary" : "ghost"}
            className="h-8 w-8 hidden sm:inline-flex"
            onClick={() => setAutoAdvance(!autoAdvance)}
            aria-label="Auto-advance to next ayah"
            title="Auto-advance"
            data-testid="button-audio-autoadvance"
          >
            <Repeat className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={stop}
            aria-label="Close player"
            data-testid="button-audio-close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="sm:hidden px-3 pb-2">
        <Slider
          value={[progress]}
          max={duration || 1}
          step={0.1}
          onValueChange={([v]) => seek(v)}
          data-testid="slider-audio-progress-mobile"
          aria-label="Seek"
        />
      </div>
    </div>
  );
}
