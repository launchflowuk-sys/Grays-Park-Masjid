import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

const DEFAULT_STREAM_URL =
  "https://stream.radiojar.com/8s5u5tpdtwzuv";

type AudioState = {
  isPlaying: boolean;
  isLoading: boolean;
  streamUrl: string;
};

type AudioContextType = AudioState & {
  toggle: () => Promise<void>;
  stop: () => Promise<void>;
  setStreamUrl: (url: string) => void;
};

const AudioContext = createContext<AudioContextType>({
  isPlaying: false,
  isLoading: false,
  streamUrl: DEFAULT_STREAM_URL,
  toggle: async () => {},
  stop: async () => {},
  setStreamUrl: () => {},
});

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamUrl, setStreamUrl] = useState(DEFAULT_STREAM_URL);
  const playerRef = useRef<unknown>(null);

  useEffect(() => {
    if (Platform.OS === "web") return;
    (async () => {
      try {
        const { setAudioModeAsync } = await import("expo-audio");
        await setAudioModeAsync({ staysActiveInBackground: true, playsInSilentModeIOS: true });
      } catch {}
    })();
    return () => {
      if (playerRef.current) {
        const p = playerRef.current as { remove: () => void };
        try { p.remove(); } catch {}
      }
    };
  }, []);

  const stop = useCallback(async () => {
    try {
      if (playerRef.current) {
        if (Platform.OS === "web") {
          const a = playerRef.current as HTMLAudioElement;
          a.pause();
        } else {
          const p = playerRef.current as { remove: () => void };
          p.remove();
        }
        playerRef.current = null;
      }
    } catch {}
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(async () => {
    if (isPlaying) {
      await stop();
      return;
    }
    setIsLoading(true);
    try {
      if (Platform.OS === "web") {
        const audio = new (window as Window & typeof globalThis).Audio(streamUrl);
        (audio as HTMLAudioElement).play();
        playerRef.current = audio;
        setIsPlaying(true);
      } else {
        const { createAudioPlayer } = await import("expo-audio");
        const player = createAudioPlayer({ uri: streamUrl });
        player.play();
        playerRef.current = player;
        player.addListener("playbackStatusUpdate", (status: unknown) => {
          const s = status as { playing?: boolean; didJustFinish?: boolean };
          setIsPlaying(!!s.playing);
          if (s.didJustFinish) {
            playerRef.current = null;
            setIsPlaying(false);
          }
        });
        setIsPlaying(true);
      }
    } catch {
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [isPlaying, stop, streamUrl]);

  return (
    <AudioContext.Provider value={{ isPlaying, isLoading, streamUrl, toggle, stop, setStreamUrl }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}
