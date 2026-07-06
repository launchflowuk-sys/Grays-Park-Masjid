import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export interface QuranAudioTrack {
  surahNumber: number;
  ayahNumber: number;
  numberInSurah: number;
  audioUrl: string;
  surahName?: string;
}

interface QuranAudioContextValue {
  current: QuranAudioTrack | null;
  queue: QuranAudioTrack[];
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  duration: number;
  playbackRate: number;
  autoAdvance: boolean;
  play: (track: QuranAudioTrack, queue?: QuranAudioTrack[]) => void;
  togglePlay: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setPlaybackRate: (rate: number) => void;
  setAutoAdvance: (value: boolean) => void;
  stop: () => void;
}

const QuranAudioContext = createContext<QuranAudioContextValue | null>(null);

export function QuranAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<QuranAudioTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [autoAdvance, setAutoAdvance] = useState(true);

  if (!audioRef.current && typeof Audio !== "undefined") {
    audioRef.current = new Audio();
  }

  const current = currentIndex >= 0 && currentIndex < queue.length ? queue[currentIndex] : null;

  const playIndex = useCallback(
    (index: number, list: QuranAudioTrack[]) => {
      const audio = audioRef.current;
      const track = list[index];
      if (!audio || !track) return;
      setIsLoading(true);
      audio.src = track.audioUrl;
      audio.playbackRate = playbackRate;
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
        .finally(() => setIsLoading(false));
      setCurrentIndex(index);
    },
    [playbackRate],
  );

  const play = useCallback(
    (track: QuranAudioTrack, newQueue?: QuranAudioTrack[]) => {
      const list = newQueue && newQueue.length > 0 ? newQueue : [track];
      const idx = list.findIndex(
        (t) => t.surahNumber === track.surahNumber && t.ayahNumber === track.ayahNumber,
      );
      setQueue(list);
      playIndex(idx >= 0 ? idx : 0, list);
    },
    [playIndex],
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying, current]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
    }
    setIsPlaying(false);
    setQueue([]);
    setCurrentIndex(-1);
    setProgress(0);
    setDuration(0);
  }, []);

  const next = useCallback(() => {
    if (currentIndex + 1 < queue.length) {
      playIndex(currentIndex + 1, queue);
    } else {
      setIsPlaying(false);
    }
  }, [currentIndex, queue, playIndex]);

  const prev = useCallback(() => {
    if (currentIndex > 0) {
      playIndex(currentIndex - 1, queue);
    }
  }, [currentIndex, queue, playIndex]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
    setProgress(seconds);
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (autoAdvance && currentIndex + 1 < queue.length) {
        playIndex(currentIndex + 1, queue);
      } else {
        setIsPlaying(false);
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
    };
  }, [autoAdvance, currentIndex, queue, playIndex]);

  const value = useMemo<QuranAudioContextValue>(
    () => ({
      current,
      queue,
      isPlaying,
      isLoading,
      progress,
      duration,
      playbackRate,
      autoAdvance,
      play,
      togglePlay,
      pause,
      next,
      prev,
      seek,
      setPlaybackRate,
      setAutoAdvance,
      stop,
    }),
    [
      current,
      queue,
      isPlaying,
      isLoading,
      progress,
      duration,
      playbackRate,
      autoAdvance,
      play,
      togglePlay,
      pause,
      next,
      prev,
      seek,
      setPlaybackRate,
      stop,
    ],
  );

  return <QuranAudioContext.Provider value={value}>{children}</QuranAudioContext.Provider>;
}

export function useQuranAudio() {
  const ctx = useContext(QuranAudioContext);
  if (!ctx) throw new Error("useQuranAudio must be used within a QuranAudioProvider");
  return ctx;
}
