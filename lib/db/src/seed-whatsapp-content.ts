/**
 * Seed script: real WhatsApp announcements & events for Grays Park Masjid.
 * Run with: pnpm --filter @workspace/db tsx src/seed-whatsapp-content.ts
 *
 * Uploads generated PNG images to object storage (Replit GCS sidecar),
 * then inserts announcement and event records into the database.
 */

import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { announcementsTable } from "./schema/announcements.ts";
import { eventsTable } from "./schema/events.ts";

const { Pool } = pg;

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
const IS_REPLIT = Boolean(process.env.REPL_ID || process.env.REPLIT_DEV_DOMAIN);

// ── object storage helpers ────────────────────────────────────────────────────

function parseObjectPath(p: string) {
  if (!p.startsWith("/")) p = `/${p}`;
  const parts = p.split("/");
  return { bucketName: parts[1], objectName: parts.slice(2).join("/") };
}

async function signPutUrl(bucketName: string, objectName: string): Promise<string> {
  const res = await fetch(`${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bucket_name: bucketName,
      object_name: objectName,
      method: "PUT",
      expires_at: new Date(Date.now() + 900_000).toISOString(),
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Sidecar sign error ${res.status}: ${await res.text()}`);
  const { signed_url } = (await res.json()) as { signed_url: string };
  return signed_url;
}

async function uploadImage(localFilePath: string): Promise<string> {
  const privateObjectDir = process.env.PRIVATE_OBJECT_DIR;
  if (!privateObjectDir) throw new Error("PRIVATE_OBJECT_DIR not set");

  const objectId = randomUUID();
  const fullPath = `${privateObjectDir}/uploads/${objectId}`;
  const { bucketName, objectName } = parseObjectPath(fullPath);

  const imageBytes = fs.readFileSync(localFilePath);
  const signedUrl = await signPutUrl(bucketName, objectName);

  const putRes = await fetch(signedUrl, {
    method: "PUT",
    body: imageBytes,
    headers: { "Content-Type": "image/png" },
    signal: AbortSignal.timeout(60_000),
  });
  if (!putRes.ok) throw new Error(`GCS upload error ${putRes.status}`);

  return `/api/storage/objects/uploads/${objectId}`;
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  const projectRoot = path.resolve(import.meta.dirname, "../../../");
  const imgDir = path.join(projectRoot, "attached_assets/generated_images");

  console.log("Uploading images…");

  let condolenceUrl: string | null = null;
  let hajjUrl: string | null = null;
  let jumuahUrl: string | null = null;
  let loveForAllahUrl: string | null = null;
  let srebrenicaUrl: string | null = null;

  if (IS_REPLIT) {
    console.log("Replit environment detected — uploading to GCS via sidecar");
    condolenceUrl  = await uploadImage(path.join(imgDir, "condolence_inna_lillahi.png"));
    console.log("  condolence:", condolenceUrl);
    hajjUrl        = await uploadImage(path.join(imgDir, "hajj_2027.png"));
    console.log("  hajj:", hajjUrl);
    jumuahUrl      = await uploadImage(path.join(imgDir, "jumuah_friday_prayer.png"));
    console.log("  jumuah:", jumuahUrl);
    loveForAllahUrl = await uploadImage(path.join(imgDir, "love_for_allah_event.png"));
    console.log("  love_for_allah:", loveForAllahUrl);
    srebrenicaUrl  = await uploadImage(path.join(imgDir, "srebrenica_memorial.png"));
    console.log("  srebrenica:", srebrenicaUrl);
  } else {
    console.log("Non-Replit environment — skipping GCS upload, imageUrl will be null");
  }

  // ── Announcements ───────────────────────────────────────────────────────────
  console.log("\nInserting announcements…");

  const announcements = [
    {
      title: "Inna Lillahi wa Inna Ilayhi Raji'un — Condolences",
      body: "Assalamu alaykum wa rahmatullahi wa barakatuh. Our brother Rahimul Islam's father has passed away. Please keep him and his family in your du'as. May Allah forgive the deceased, have mercy upon him, grant him Jannatul-Firdaws, and give his family patience, strength, and comfort during this difficult time. Ameen.",
      imageUrl: condolenceUrl,
      published: true,
      pinned: false,
      publishedAt: new Date("2026-06-01T12:00:00Z"),
    },
    {
      title: "Hajj 2027 — Register Your Interest Now",
      body: "Alhamdulillah after the success of our Hajj 2026 programme, we are inundated with enquiries for Hajj 2027. If you or someone you know is interested in performing Hajj 2027, we are happy to offer advice, guidance and assistance. Please complete our Register Your Interest form at: https://tinyurl.com/Arif-ABGHajj27 — Whether you choose the NUSUK route or Dual National Route, our team is happy to assist. Please note the advice and guidance provided is non-commercial.",
      imageUrl: hajjUrl,
      published: true,
      pinned: false,
      publishedAt: new Date("2026-06-15T10:00:00Z"),
    },
    {
      title: "Jumu'ah Salah Times — Friday 3rd July 2026",
      body: "Assalamu alaykum wa rahmatullahi wa barakatuh! There will be TWO Jumu'ah Salah at Grays Park Masjid this Friday. 1st Jama'ah: 1:30 PM | 2nd Jama'ah: 2:15 PM. Jazakumullahu khayran.",
      imageUrl: jumuahUrl,
      published: true,
      pinned: false,
      publishedAt: new Date("2026-07-01T09:00:00Z"),
    },
  ];

  for (const ann of announcements) {
    const [row] = await db.insert(announcementsTable).values(ann).returning({ id: announcementsTable.id, title: announcementsTable.title });
    console.log("  ✓ Announcement:", row.title, `(${row.id})`);
  }

  // ── Events ──────────────────────────────────────────────────────────────────
  console.log("\nInserting events…");

  const events = [
    {
      title: "Love for Allah — The Greatest Reward and the Path to Jannah",
      description:
        "Join us for an unmissable talk by renowned scholar Mufti Shah Muhammad Ibrahim. Founder and director of multiple Madrasahs and Islamic learning centres, actively involved in extensive dawah and community work across the UK and internationally.\n\nPlease arrive early and be seated before 12:30 PM as the talk begins promptly. His advice and reminders are highly beneficial for individuals, families, and the wider community.\n\nMay Allah accept our efforts and grant us beneficial knowledge. Aameen.",
      location: "Parkway Centre, Park Road, Grays, Essex, RM17 6RB",
      imageUrl: loveForAllahUrl,
      startsAt: new Date("2026-06-19T12:30:00+01:00"),
      endsAt: null,
      published: true,
    },
    {
      title: "Srebrenica Memorial Service — We Remember",
      description:
        "In July 1995, around 8,000 Bosnian Muslims were killed — the single largest mass murder in Europe since World War 2. Please join us in Remembrance on Friday 10th July at Grays Town Park.\n\nWe stand with all victims of injustice and genocide. Lest we forget.",
      location: "Grays Town Park (Entrance from Park Road), Grays, RM17 6RB",
      imageUrl: srebrenicaUrl,
      startsAt: new Date("2026-07-10T10:55:00+01:00"),
      endsAt: null,
      published: true,
    },
  ];

  for (const ev of events) {
    const [row] = await db.insert(eventsTable).values(ev).returning({ id: eventsTable.id, title: eventsTable.title });
    console.log("  ✓ Event:", row.title, `(${row.id})`);
  }

  await pool.end();
  console.log("\nDone! All content inserted.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
