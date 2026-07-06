import fs from "node:fs";
import pg from "pg";

const { Client } = pg;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sqlPath = process.argv[2] ?? "/home/runner/workspace/.local/exports/production-content-seed.sql";
const sql = fs.readFileSync(sqlPath, "utf8");

const redacted = process.env.DATABASE_URL.replace(/:\/\/([^:]+):[^@]+@/, "://$1:***@");
console.log(`Connecting to ${redacted}`);

const client = new Client({ connectionString: process.env.DATABASE_URL });

try {
  await client.connect();
  console.log("Connected. Applying seed SQL...");
  await client.query(sql);
  console.log("Seed SQL applied successfully.");

  const tables = [
    "prayer_times", "timetable_pdfs", "prayer_calculation_settings", "services",
    "events", "announcements", "news_posts", "courses", "volunteer_opportunities",
    "staff_members", "gallery_albums", "gallery_media", "donation_campaigns", "site_settings",
  ];
  for (const t of tables) {
    const r = await client.query(`SELECT COUNT(*) FROM ${t}`);
    console.log(`  ${t}: ${r.rows[0].count} rows`);
  }
  await client.end();
  process.exit(0);
} catch (err) {
  console.error("FAILED applying seed SQL");
  console.error(err);
  await client.end().catch(() => {});
  process.exit(1);
}
