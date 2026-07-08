import fs from "node:fs";
import pg from "pg";

const { Client } = pg;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

function escapeLiteral(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "number") return String(value);
  if (value instanceof Date) return `'${value.toISOString()}'`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

function buildInsert(table: string, rows: Record<string, unknown>[], conflictKey: string): string {
  if (rows.length === 0) return `-- ${table}: no rows in source, skipped\n`;
  const columns = Object.keys(rows[0]);
  const lines = rows.map((row) => {
    const values = columns.map((c) => escapeLiteral(row[c]));
    return `  (${values.join(", ")})`;
  });
  return (
    `INSERT INTO ${table} (${columns.join(", ")})\nVALUES\n${lines.join(",\n")}\n` +
    `ON CONFLICT (${conflictKey}) DO NOTHING;\n`
  );
}

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const tables: { name: string; conflictKey: string }[] = [
  { name: "prayer_times", conflictKey: "date" },
  { name: "timetable_pdfs", conflictKey: "id" },
  { name: "prayer_calculation_settings", conflictKey: "id" },
  { name: "services", conflictKey: "id" },
  { name: "events", conflictKey: "id" },
  { name: "announcements", conflictKey: "id" },
  { name: "news_posts", conflictKey: "id" },
  { name: "courses", conflictKey: "id" },
  { name: "volunteer_opportunities", conflictKey: "id" },
  { name: "staff_members", conflictKey: "id" },
  { name: "gallery_albums", conflictKey: "id" },
  { name: "gallery_media", conflictKey: "id" },
  { name: "donation_campaigns", conflictKey: "id" },
  { name: "blog_posts", conflictKey: "id" },
  { name: "site_settings", conflictKey: "key" },
];

let sql = `-- Auto-generated data export from development DB\n-- Generated at ${new Date().toISOString()}\n-- Safe to re-run: uses ON CONFLICT DO NOTHING, will not duplicate or overwrite existing rows.\n-- Run this against your Coolify production Postgres (e.g. via psql "$DATABASE_URL" -f this-file.sql)\n\nBEGIN;\n\n`;

for (const { name, conflictKey } of tables) {
  const result = await client.query(`SELECT * FROM ${name} ORDER BY 1`);
  let rows = result.rows;
  if (name === "timetable_pdfs") {
    rows = rows.filter((r) => !/test|e2e/i.test(String(r.title ?? "")));
  }
  sql += `-- ${name} (${rows.length} rows)\n`;
  sql += buildInsert(name, rows, conflictKey);
  sql += "\n";
}

sql += "COMMIT;\n";

fs.writeFileSync("/tmp/production-content-seed.sql", sql);
console.log(`Wrote /tmp/production-content-seed.sql (${sql.length} bytes)`);

await client.end();
