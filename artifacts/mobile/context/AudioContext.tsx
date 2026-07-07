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
  const soundRef = useRef<unknown>(null);
  const AudioRef = useRef<unknown>(null);

  useEffect(() => {
    if (Platform.OS === "web") return;
    let Audio: unknown;
    (async () => {
      try {
        const av = await import("expo-av");
        Audio = av.Audio;
        AudioRef.current = Audio;
        const AudioClass = Audio as { setAudioModeAsync: (opts: unknown) => Promise<void> };
        await AudioClass.setAudioModeAsync({
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
        });
      } catch {
        // expo-av may not be installed yet
      }
    })();
    return () => {
      if (soundRef.current) {
        const s = soundRef.current as { unloadAsync: () => Promise<void> };
        s.unloadAsync().catch(() => {});
      }
    };
  }, []);

  const stop = useCallback(async () => {
    try {
      if (soundRef.current) {
        const s = soundRef.current as { stopAsync: () => Promise<void>; unloadAsync: () => Promise<void> };
        await s.stopAsync();
        await s.unloadAsync();
        soundRef.current = null;
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
        // Web audio via HTML5
        const audio = new (window as Window & typeof globalThis).Audio(streamUrl);
        (audio as HTMLAudioElement).play();
        soundRef.current = audio;
        setIsPlaying(true);
      } else {
        const av = await import("expo-av");
        const Audio = av.Audio;
        const { sound } = await Audio.Sound.createAsync(
          { uri: streamUrl },
          { shouldPlay: true, isLooping: false }
        );
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate((status: unknown) => {
          const s = status as { isPlaying?: boolean; didJustFinish?: boolean; isLoaded?: boolean };
          if (s.isLoaded) {
            setIsPlaying(!!s.isPlaying);
          }
          if (s.didJustFinish) {
            soundRef.current = null;
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
