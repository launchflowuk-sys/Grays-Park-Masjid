---
name: drizzle-kit push schema sync in Docker Compose deploys
description: this project has no SQL migration files — it uses drizzle-kit push, which must be re-run against production whenever the schema changes, or every DB-touching route starts 500ing.
---

Grays Park Masjid (and any project using `lib/db` with `drizzle-kit push` instead of generated migration files) has **no migration history** — the "current schema" is just whatever the TypeScript schema files say. Deploying new code without also syncing the schema means production's actual tables silently drift from what the code expects.

**Why:** After a code change added a new column to a table (`members.status_token`), the site was redeployed to Coolify but the schema sync step was skipped. Every route touching that table (and others) started returning 500 with no obvious cause in the frontend — looked like a generic "connection error" but was actually a missing-column SQL error at the DB layer, since Express here has no global error handler and route handlers don't try/catch DB errors.

**How to apply:**
- Never assume "redeploy" alone syncs the schema unless the deploy pipeline explicitly runs `drizzle-kit push` (or `push-force`) as part of it.
- The production API server's runtime Docker image is typically a pruned `--prod`-only deploy (no pnpm, no devDependencies, no drizzle-kit) for a small image size — the schema-sync command must run somewhere with the full toolchain (a `builder`-stage image, or a full monorepo checkout), not inside the slim runtime container.
- If widespread, unrelated-looking 500s appear right after a deploy (multiple different endpoints, not just one feature), suspect schema drift before suspecting a platform/hosting issue.
- Best fix: wire schema sync as an automatic one-off Compose service (`db-push`) that other services `depends_on: condition: service_completed_successfully`, using the internal Docker network — this avoids ever needing to expose the database publicly just to run a schema command by hand.
