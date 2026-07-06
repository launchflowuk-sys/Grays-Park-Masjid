import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { PrayerTimesWidget, usePrayerTimesToday } from "@/components/prayer-times-widget";
import { getListPrayerTimesPublicQueryKey } from "@workspace/api-client-react";

export default function PrayerTimesDisplayPage() {
  const { todayRow } = usePrayerTimesToday();
  const queryClient = useQueryClient();

  useEffect(() => {
    const id = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: getListPrayerTimesPublicQueryKey() });
    }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-primary text-primary-foreground flex flex-col items-center justify-center px-10 py-12">
      <p className="uppercase tracking-[0.3em] text-secondary text-lg mb-2">Grays Park Masjid</p>
      {todayRow && (
        <h1 className="font-serif text-3xl md:text-5xl mb-10 text-center">
          {format(parseISO(todayRow.date), "EEEE d MMMM yyyy")}
        </h1>
      )}
      <div className="w-full max-w-5xl [&_p]:text-primary-foreground [&_.text-muted-foreground]:text-primary-foreground/70 [&_.text-primary]:text-secondary [&_.border-card-border]:border-primary-foreground/20 [&_.border-primary]:border-secondary [&_.bg-primary\\/10]:bg-secondary/10 [&_.border-secondary]:border-secondary [&_.bg-secondary\\/10]:bg-secondary/20">
        <PrayerTimesWidget variant="kiosk" />
      </div>
    </div>
  );
}
