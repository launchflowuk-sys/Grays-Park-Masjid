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

const PATTERN_SHAPES = [
  { top: "-5px", right: "-5px", size: "20px" },
  { bottom: "-4px", left: "-4px", size: "16px" },
  { top: "9px", right: "7px", size: "9px" },
  { bottom: "9px", left: "7px", size: "11px" },
  { top: "-2px", left: "12px", size: "7px" },
];

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

  const currentQueueIndex = queue.findIndex(
    (t) => t.surahNumber === current.surahNumber && t.ayahNumber === current.ayahNumber,
  );
  const canPrev = currentQueueIndex > 0;
  const canNext = currentQueueIndex >= 0 && currentQueueIndex + 1 < queue.length;
  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      data-testid="mini-audio-player"
    >
      <div
        className="h-[3px]"
        style={{
          background:
            "linear-gradient(90deg, #1B3D2F 0%, #C9A84C 40%, #2A5240 70%, #C9A84C 100%)",
        }}
      />
      <div
        className="h-[2px] bg-muted"
        style={{ display: "block" }}
      >
        <div
          className="h-full bg-[#1B3D2F]/30 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="bg-card/97 backdrop-blur-md shadow-[0_-8px_40px_rgba(0,0,0,0.14)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-5">

          <div className="min-w-0 flex-1 sm:flex-none sm:w-56">
            <Link
              href={`/quran/${current.surahNumber}`}
              className="block truncate text-sm font-semibold hover:opacity-80 transition-opacity"
              style={{ color: "#1B3D2F" }}
              data-testid="link-mini-player-surah"
            >
              {current.surahName ?? "Qur'an"}
            </Link>
            <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
              Ayah {current.numberInSurah}
              {duration > 0 ? ` · ${formatTime(progress)} / ${formatTime(duration)}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-full"
              onClick={prev}
              disabled={!canPrev}
              aria-label="Previous ayah"
              data-testid="button-audio-prev"
            >
              <SkipBack className="h-[18px] w-[18px]" />
            </Button>

            <button
              onClick={togglePlay}
              disabled={isLoading}
              aria-label={isPlaying ? "Pause" : "Play"}
              data-testid="button-audio-toggle"
              className="relative h-14 w-14 rounded-full overflow-hidden flex items-center justify-center shadow-lg transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3D2F] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "#1B3D2F" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#2A5240"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1B3D2F"; }}
            >
              {PATTERN_SHAPES.map((p, i) => (
                <span
                  key={i}
                  className="absolute pointer-events-none"
                  style={{
                    top: p.top,
                    right: (p as { right?: string }).right,
                    bottom: (p as { bottom?: string }).bottom,
                    left: (p as { left?: string }).left,
                    width: p.size,
                    height: p.size,
                    background: "#C9A84C",
                    opacity: 0.28,
                    transform: "rotate(45deg)",
                  }}
                />
              ))}
              {isLoading ? (
                <span className="relative z-10 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : isPlaying ? (
                <Pause className="relative z-10 h-5 w-5 text-white" />
              ) : (
                <Play className="relative z-10 h-5 w-5 text-white ml-0.5" />
              )}
            </button>

            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-full"
              onClick={next}
              disabled={!canNext}
              aria-label="Next ayah"
              data-testid="button-audio-next"
            >
              <SkipForward className="h-[18px] w-[18px]" />
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
                  className="h-9 w-9"
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
              className="h-9 w-9 hidden sm:inline-flex"
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
              className="h-9 w-9"
              onClick={stop}
              aria-label="Close player"
              data-testid="button-audio-close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="sm:hidden px-4 pb-3">
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
    </div>
  );
}
