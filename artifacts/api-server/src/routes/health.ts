import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
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



// TEMPORARY diagnostic — remove once the donation-campaigns 500 is resolved.
// Returns only the database error message (no secrets, no stack).
router.get("/_diag/donation-campaigns", async (_req, res) => {
  try {
    const cols = await db.execute(
      sql`select column_name from information_schema.columns where table_name = 'donation_campaigns' order by column_name`,
    );
    const rows = (cols as unknown as { rows?: Array<{ column_name: string }> }).rows ?? [];
    let queryError: string | null = null;
    try {
      await db.execute(sql`select * from donation_campaigns limit 1`);
    } catch (err) {
      queryError = err instanceof Error ? err.message : String(err);
    }
    res.json({ columns: rows.map((r) => r.column_name), queryError });
  } catch (err) {
    res.json({ fatal: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
