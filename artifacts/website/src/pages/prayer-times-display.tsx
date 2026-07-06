import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { PrayerTimesWidget, usePrayerTimesToday, computeCurrentNext, IQAMAH_PRAYER_ORDER } from "@/components/prayer-times-widget";
import {
  getListPrayerTimesPublicQueryKey,
  useGetQuranSettingsPublic,
  useGetQuranAyah,
  getGetQuranAyahQueryKey,
} from "@workspace/api-client-react";
import { IslamicPattern, IslamicStar } from "@/components/site/islamic-pattern";

const TIMES_DURATION_MS = 45 * 1000;
const REFLECTION_DURATION_MS = 20 * 1000;

const REFLECTION_AYAHS: { surah: number; ayah: number; context: "friday" | "general" }[] = [
  { surah: 62, ayah: 9, context: "friday" },
  { surah: 2, ayah: 153, context: "general" },
  { surah: 94, ayah: 5, context: "general" },
  { surah: 13, ayah: 28, context: "general" },
  { surah: 17, ayah: 78, context: "general" },
  { surah: 20, ayah: 14, context: "general" },
  { surah: 3, ayah: 200, context: "general" },
  { surah: 65, ayah: 3, context: "general" },
  { surah: 29, ayah: 45, context: "general" },
  { surah: 55, ayah: 13, context: "general" },
];

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function useReflectionAyahRef(currentPrayerKey: string | null) {
  return useMemo(() => {
    const now = new Date();
    const isFriday = now.getDay() === 5;
    const pool = isFriday
      ? REFLECTION_AYAHS.filter((a) => a.context === "friday")
      : REFLECTION_AYAHS.filter((a) => a.context === "general");
    const list = pool.length > 0 ? pool : REFLECTION_AYAHS;
    const prayerIndex = currentPrayerKey
      ? IQAMAH_PRAYER_ORDER.findIndex((p) => p.key === currentPrayerKey)
      : 0;
    const index = (dayOfYear(now) + Math.max(0, prayerIndex)) % list.length;
    return list[index];
  }, [currentPrayerKey]);
}

function ReflectionSlide() {
  const { todayRow, tomorrowRow } = usePrayerTimesToday();
  const { data: settings } = useGetQuranSettingsPublic();
  const now = new Date();
  const current = computeCurrentNext(todayRow, tomorrowRow, now);
  const ref = useReflectionAyahRef(current?.currentKey ?? null);
  const { data: verse, isLoading } = useGetQuranAyah(
    ref.surah,
    ref.ayah,
    { translation: settings?.defaultTranslation },
    {
      query: {
        queryKey: getGetQuranAyahQueryKey(ref.surah, ref.ayah, { translation: settings?.defaultTranslation }),
      },
    },
  );

  if (isLoading || !verse) {
    return <div className="min-h-[50vh]" />;
  }

  return (
    <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto px-6" data-testid="prayer-display-reflection">
      <p className="uppercase tracking-[0.3em] text-secondary text-sm sm:text-base mb-8">
        Qur&apos;an {ref.context === "friday" ? "· Jumu'ah Reflection" : "· A Moment of Reflection"}
      </p>
      <p dir="rtl" className="font-serif text-4xl sm:text-6xl leading-[1.9] mb-8 text-primary-foreground">
        {verse.arabic}
      </p>
      <p className="text-xl sm:text-2xl leading-relaxed text-primary-foreground/85 max-w-3xl">
        &ldquo;{verse.translation}&rdquo;
      </p>
      <p className="mt-8 text-secondary text-sm sm:text-base uppercase tracking-widest">
        Surah {ref.surah}:{ref.ayah}
      </p>
    </div>
  );
}

export default function PrayerTimesDisplayPage() {
  const { todayRow } = usePrayerTimesToday();
  const queryClient = useQueryClient();
  const [slide, setSlide] = useState<"times" | "reflection">("times");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: getListPrayerTimesPublicQueryKey() });
    }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [queryClient]);

  useEffect(() => {
    const duration = slide === "times" ? TIMES_DURATION_MS : REFLECTION_DURATION_MS;
    const fadeOutTimer = setTimeout(() => setVisible(false), duration - 800);
    const switchTimer = setTimeout(() => {
      setSlide((s) => (s === "times" ? "reflection" : "times"));
      setVisible(true);
    }, duration);
    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(switchTimer);
    };
  }, [slide]);

  return (
    <div className="relative min-h-screen bg-primary text-primary-foreground flex flex-col items-center justify-center px-10 py-12 overflow-hidden">
      <IslamicPattern className="pointer-events-none absolute inset-0 w-full h-full text-primary-foreground/[0.035]" />
      <IslamicStar className="pointer-events-none absolute -bottom-10 -right-10 h-64 w-64 text-secondary/[0.08]" />
      <IslamicStar className="pointer-events-none absolute -top-10 -left-10 h-64 w-64 text-secondary/[0.08]" />

      <p className="relative uppercase tracking-[0.3em] text-secondary text-lg mb-2" data-testid="text-display-masjid-name">
        Grays Park Masjid
      </p>
      {todayRow && (
        <h1 className="relative font-serif text-3xl md:text-5xl mb-10 text-center">
          {format(parseISO(todayRow.date), "EEEE d MMMM yyyy")}
        </h1>
      )}

      <div
        className={`relative w-full max-w-5xl transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
      >
        {slide === "times" ? (
          <div
            className="[&_p]:text-primary-foreground [&_.text-muted-foreground]:text-primary-foreground/70 [&_.text-primary]:text-secondary [&_.border-card-border]:border-primary-foreground/20 [&_.border-primary]:border-secondary [&_.bg-primary\\/10]:bg-secondary/10 [&_.border-secondary]:border-secondary [&_.bg-secondary\\/10]:bg-secondary/20"
            data-testid="prayer-display-times"
          >
            <PrayerTimesWidget variant="kiosk" />
          </div>
        ) : (
          <ReflectionSlide />
        )}
      </div>
    </div>
  );
}
