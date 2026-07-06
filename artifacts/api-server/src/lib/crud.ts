import type { Request, Response, IRouter } from "express";
import { eq, type SQL } from "drizzle-orm";
import type { PgTableWithColumns } from "drizzle-orm/pg-core";
import type { ZodType } from "zod/v4";
import { db } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";
import type { AdminRole } from "@workspace/db";

type AnyTable = PgTableWithColumns<any>;

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

export function coerceDates(value: unknown): unknown {
  if (typeof value === "string" && ISO_DATE_RE.test(value)) {
    return new Date(value);
  }
  if (Array.isArray(value)) {
    return value.map(coerceDates);
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = coerceDates(val);
    }
    return out;
  }
  return value;
}

export function serialize(row: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] = value instanceof Date ? value.toISOString() : value;
  }
  return out;
}

export function registerPublicList(
  router: IRouter,
  path: string,
  table: AnyTable,
  where?: SQL,
) {
  router.get(path, async (_req: Request, res: Response) => {
    const rows = where ? await db.select().from(table).where(where) : await db.select().from(table);
    res.json(rows.map(serialize));
  });
}

export function registerPublicCreate(
  router: IRouter,
  path: string,
  table: AnyTable,
  schema: ZodType,
) {
  router.post(path, async (req: Request, res: Response) => {
    const parsed = schema.safeParse(coerceDates(req.body));

    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    const [row] = await db.insert(table).values(parsed.data as never).returning();
    res.status(201).json(serialize(row));
  });
}

export function registerAdminList(
  router: IRouter,
  path: string,
  table: AnyTable,
  allowedRoles: AdminRole[],
) {
  router.get(path, requireAuth, requireRole(...allowedRoles), async (_req: Request, res: Response) => {
    const rows = await db.select().from(table);
    res.json(rows.map(serialize));
  });
}

export function registerAdminCreate(
  router: IRouter,
  path: string,
  table: AnyTable,
  schema: ZodType,
  allowedRoles: AdminRole[],
) {
  router.post(path, requireAuth, requireRole(...allowedRoles), async (req: Request, res: Response) => {
    const parsed = schema.safeParse(coerceDates(req.body));

    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    const [row] = await db.insert(table).values(parsed.data as never).returning();
    res.status(201).json(serialize(row));
  });
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = value instanceof Date ? value.toISOString() : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(rows: Record<string, unknown>[], columns: { key: string; header: string }[]): string {
  const headerLine = columns.map((c) => csvEscape(c.header)).join(",");
  const lines = rows.map((row) => columns.map((c) => csvEscape(row[c.key])).join(","));
  return [headerLine, ...lines].join("\r\n");
}

export function registerAdminExportCsv(
  router: IRouter,
  path: string,
  table: AnyTable,
  columns: { key: string; header: string }[],
  allowedRoles: AdminRole[],
  filename: string,
) {
  router.get(`${path}/export`, requireAuth, requireRole(...allowedRoles), async (_req: Request, res: Response) => {
    const rows = await db.select().from(table);
    const csv = toCsv(rows as Record<string, unknown>[], columns);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  });
}

export function registerAdminItemRoutes(
  router: IRouter,
  path: string,
  table: AnyTable,
  idColumn: AnyTable["_"]["columns"][string],
  patchSchema: ZodType,
  allowedRoles: AdminRole[],
) {
  router.get(`${path}/:id`, requireAuth, requireRole(...allowedRoles), async (req: Request, res: Response) => {
    const [row] = await db.select().from(table).where(eq(idColumn, req.params.id)).limit(1);

    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.json(serialize(row));
  });

  router.put(`${path}/:id`, requireAuth, requireRole(...allowedRoles), async (req: Request, res: Response) => {
    const parsed = patchSchema.safeParse(coerceDates(req.body));

    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    const updateValues: Record<string, unknown> = { ...(parsed.data as object) };
    if ((table as unknown as Record<string, unknown>).updatedAt) {
      updateValues.updatedAt = new Date();
    }

    const [row] = await db
      .update(table)
      .set(updateValues as never)
      .where(eq(idColumn, req.params.id))
      .returning();

    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.json(serialize(row));
  });

  router.delete(`${path}/:id`, requireAuth, requireRole(...allowedRoles), async (req: Request, res: Response) => {
    const [row] = await db.delete(table).where(eq(idColumn, req.params.id)).returning();

    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.status(204).end();
  });
}
