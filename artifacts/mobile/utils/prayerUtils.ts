export type PrayerEntry = {
  name: string;
  label: string;
  adhan: string;
  iqamah?: string;
  isFajr?: boolean;
};

export function formatTime12(time: string): string {
  if (!time) return "—";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function getPrayerEntries(pt: {
  fajrAdhan: string;
  fajrIqamah: string;
  sunrise: string;
  dhuhrAdhan: string;
  dhuhrIqamah: string;
  asrAdhan: string;
  asrIqamah: string;
  maghribAdhan: string;
  maghribIqamah: string;
  ishaAdhan: string;
  ishaIqamah: string;
}): PrayerEntry[] {
  return [
    { name: "Fajr", label: "الفجر", adhan: pt.fajrAdhan, iqamah: pt.fajrIqamah, isFajr: true },
    { name: "Sunrise", label: "الشروق", adhan: pt.sunrise },
    { name: "Dhuhr", label: "الظهر", adhan: pt.dhuhrAdhan, iqamah: pt.dhuhrIqamah },
    { name: "Asr", label: "العصر", adhan: pt.asrAdhan, iqamah: pt.asrIqamah },
    { name: "Maghrib", label: "المغرب", adhan: pt.maghribAdhan, iqamah: pt.maghribIqamah },
    { name: "Isha", label: "العشاء", adhan: pt.ishaAdhan, iqamah: pt.ishaIqamah },
  ];
}

export function findNextPrayer(prayers: PrayerEntry[]): { prayer: PrayerEntry; index: number } | null {
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i < prayers.length; i++) {
    const pMins = timeToMinutes(prayers[i].adhan);
    if (pMins > nowMins) {
      return { prayer: prayers[i], index: i };
    }
  }
  return null;
}

export function getCountdownToTime(timeStr: string): string {
  const now = new Date();
  const [h, m] = timeStr.split(":").map(Number);
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return "—";
  const totalSecs = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

export function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
