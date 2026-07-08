import cron from "node-cron";
import { eq, and, gte, lte } from "drizzle-orm";
import { db, prayerTimesTable, eventsTable, siteSettingsTable } from "@workspace/db";
import { broadcastPush } from "./push";
import { logger } from "./logger";

const LONDON_TZ = "Europe/London";

function getUKDateTime(): { dateStr: string; hhmm: string; isFriday: boolean } {
  const now = new Date();

  const dateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: LONDON_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const hhmm = new Intl.DateTimeFormat("en-GB", {
    timeZone: LONDON_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);

  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: LONDON_TZ,
    weekday: "short",
  }).format(now);

  return { dateStr, hhmm, isFriday: weekday === "Fri" };
}

async function getSetting(key: string): Promise<string | null> {
  try {
    const [row] = await db
      .select()
      .from(siteSettingsTable)
      .where(eq(siteSettingsTable.key, key))
      .limit(1);
    return row?.value ?? null;
  } catch {
    return null;
  }
}

async function isRamadan(dateStr: string): Promise<boolean> {
  const start = await getSetting("ramadan_start_date");
  const end = await getSetting("ramadan_end_date");
  if (!start || !end) return false;
  return dateStr >= start && dateStr <= end;
}

async function runPrayerTimeCheck(): Promise<void> {
  const { dateStr, hhmm, isFriday } = getUKDateTime();

  const [today] = await db
    .select()
    .from(prayerTimesTable)
    .where(eq(prayerTimesTable.date, dateStr))
    .limit(1);

  if (!today) return;

  const ramadan = await isRamadan(dateStr);

  const checks: Array<{ time: string | null; name: string; body: string }> = [
    {
      time: today.fajrAdhan,
      name: "Fajr",
      body: ramadan
        ? "It is time for Fajr. Suhoor has ended — may Allah accept your fast."
        : "It is time for Fajr prayer. Allahu Akbar.",
    },
    {
      time: !isFriday ? today.dhuhrAdhan : null,
      name: "Dhuhr",
      body: "It is time for Dhuhr prayer. Allahu Akbar.",
    },
    {
      time: today.asrAdhan,
      name: "Asr",
      body: "It is time for Asr prayer. Allahu Akbar.",
    },
    {
      time: today.maghribAdhan,
      name: "Maghrib",
      body: ramadan
        ? "It is time for Maghrib. Iftar time — may Allah accept your fast."
        : "It is time for Maghrib prayer. Allahu Akbar.",
    },
    {
      time: today.ishaAdhan,
      name: "Isha",
      body: "It is time for Isha prayer. Allahu Akbar.",
    },
    ...(isFriday && today.jummahIqamah
      ? [
          {
            time: today.jummahIqamah,
            name: "Jumu'ah",
            body: "Jumu'ah Iqamah is starting. Please make your way to the masjid.",
          },
        ]
      : []),
  ];

  for (const check of checks) {
    if (!check.time) continue;
    if (check.time.slice(0, 5) === hhmm.slice(0, 5)) {
      logger.info(`[scheduler] Firing ${check.name} notification`);
      await broadcastPush(
        `${check.name} — Grays Park Masjid`,
        check.body,
        "announcements",
      );
    }
  }
}

async function runEventReminders(): Promise<void> {
  const now = new Date();
  const in23h = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const upcoming = await db
    .select()
    .from(eventsTable)
    .where(
      and(
        eq(eventsTable.published, true),
        gte(eventsTable.startsAt, in23h),
        lte(eventsTable.startsAt, in25h),
      ),
    );

  for (const event of upcoming) {
    const timeStr = new Intl.DateTimeFormat("en-GB", {
      timeZone: LONDON_TZ,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(event.startsAt);

    const locationPart = event.location ? ` at ${event.location}` : "";
    logger.info(`[scheduler] Sending 24h reminder for: ${event.title}`);
    await broadcastPush(
      `Tomorrow: ${event.title}`,
      `${event.title} is taking place tomorrow at ${timeStr}${locationPart}. Don't miss it.`,
      "events",
      event.id,
    );
  }
}

export function startScheduler(): void {
  cron.schedule(
    "* * * * *",
    async () => {
      try {
        await runPrayerTimeCheck();
      } catch (err) {
        logger.error({ err }, "[scheduler] Prayer time check failed");
      }
    },
    { timezone: LONDON_TZ },
  );

  cron.schedule(
    "0 * * * *",
    async () => {
      try {
        await runEventReminders();
      } catch (err) {
        logger.error({ err }, "[scheduler] Event reminder check failed");
      }
    },
    { timezone: LONDON_TZ },
  );

  logger.info("[scheduler] Started: prayer times (every minute) + event reminders (every hour)");
}
