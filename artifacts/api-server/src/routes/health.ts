import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { getTableConfig, type PgTable } from "drizzle-orm/pg-core";
import * as schema from "@workspace/db";
import { db } from "@workspace/db";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

// Readiness: only reports ok when the database is actually reachable, so the
// platform doesn't route traffic to an instance with a dead DB connection.
router.get("/readyz", async (_req, res) => {
  try {
    await db.execute(sql`select 1`);
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "unavailable" });
  }
});

function isPgTable(value: unknown): value is PgTable {
  if (!value || typeof value !== "object") return false;
  try {
    getTableConfig(value as PgTable);
    return true;
  } catch {
    return false;
  }
}

/**
 * Compares every table declared in the Drizzle schema against the columns that
 * actually exist in the database, and optionally applies the additive fixes.
 *
 * `drizzle-kit push` has silently failed to apply changes at least once, which
 * left `donation_campaigns` missing six columns and every read of that table
 * returning 500. This endpoint makes that class of drift visible instead of
 * surfacing as an opaque error.
 *
 * `?apply=1` runs ADD COLUMN IF NOT EXISTS only — never a drop or a type
 * change — so it cannot lose data. Requires the server's own JWT secret.
 */
router.get("/_diag/schema-drift", async (req, res) => {
  if (!process.env.JWT_SECRET || req.query.token !== process.env.JWT_SECRET) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const apply = req.query.apply === "1";
  const live = await db.execute(
    sql`select table_name, column_name from information_schema.columns where table_schema = 'public'`,
  );
  const liveRows =
    (live as unknown as { rows?: Array<{ table_name: string; column_name: string }> }).rows ?? [];

  const actual = new Map<string, Set<string>>();
  for (const row of liveRows) {
    if (!actual.has(row.table_name)) actual.set(row.table_name, new Set());
    actual.get(row.table_name)!.add(row.column_name);
  }

  const drift: Array<{ table: string; missing: string[]; applied?: string[] }> = [];

  for (const value of Object.values(schema)) {
    if (!isPgTable(value)) continue;
    const config = getTableConfig(value as PgTable);
    const present = actual.get(config.name);
    if (!present) {
      drift.push({ table: config.name, missing: ["<TABLE MISSING>"] });
      continue;
    }
    const missing = config.columns.filter((c) => !present.has(c.name));
    if (missing.length === 0) continue;

    const entry: { table: string; missing: string[]; applied?: string[] } = {
      table: config.name,
      missing: missing.map((c) => c.name),
    };

    if (apply) {
      entry.applied = [];
      for (const column of missing) {
        const type = column.getSQLType();
        const notNull = column.notNull ? " not null" : "";
        const def = column.hasDefault && column.default !== undefined
          ? ` default ${typeof column.default === "string" ? `'${column.default}'` : JSON.stringify(column.default)}`
          : "";
        const ddl = `alter table "${config.name}" add column if not exists "${column.name}" ${type}${def}${notNull}`;
        try {
          await db.execute(sql.raw(ddl));
          entry.applied.push(`ok: ${column.name}`);
        } catch (err) {
          entry.applied.push(`FAIL ${column.name}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }

    drift.push(entry);
  }

  res.json({ tablesChecked: actual.size, drift, applied: apply });
});

// Creates the objects that ADD COLUMN cannot: the missing email_campaigns
// table (with its enums) and the two jsonb columns whose defaults need to be
// quoted SQL literals. Every statement is IF NOT EXISTS, so re-running is safe.
router.get("/_diag/repair-remaining", async (req, res) => {
  if (!process.env.JWT_SECRET || req.query.token !== process.env.JWT_SECRET) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const statements: string[] = [
    `alter table "donation_campaigns" add column if not exists "gallery_images" jsonb not null default '[]'::jsonb`,
    `alter table "donation_campaigns" add column if not exists "preset_amounts" jsonb not null default '[10,25,50,100]'::jsonb`,
    `do $$ begin create type email_campaign_status as enum ('draft','sent'); exception when duplicate_object then null; end $$`,
    `do $$ begin create type email_campaign_recipient_type as enum ('all_members','specific'); exception when duplicate_object then null; end $$`,
    `create table if not exists "email_campaigns" (
       "id" uuid primary key default gen_random_uuid(),
       "subject" text not null,
       "banner_image_url" text,
       "body_text" text not null,
       "cta_label" text,
       "cta_url" text,
       "recipient_type" email_campaign_recipient_type not null default 'all_members',
       "recipient_emails" text[] not null default '{}',
       "status" email_campaign_status not null default 'draft',
       "sent_at" timestamp with time zone,
       "sent_count" integer not null default 0,
       "created_at" timestamp with time zone not null default now(),
       "updated_at" timestamp with time zone not null default now()
     )`,
  ];

  const results: string[] = [];
  for (const statement of statements) {
    try {
      await db.execute(sql.raw(statement));
      results.push(`ok: ${statement.slice(0, 60)}...`);
    } catch (err) {
      results.push(`FAIL: ${statement.slice(0, 60)}... -> ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  res.json({ results });
});

export default router;
