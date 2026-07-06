# Grays Park Masjid

A public website and admin CMS for Grays Park Masjid: membership applications, donations, prayer times, announcements, events, and gallery management.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/website run dev` — run the public website + admin dashboard
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5, JWT auth (bcrypt password hashing, RBAC for admin users)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec) — contract-first, `openapi.yaml` is the source of truth
- Frontend: Vite + React + Tailwind (public site + admin dashboard)
- Email: Nodemailer (branded transactional emails — membership status, password resets, staff alerts)
- Payments: Square (one-time + recurring donations)
- Build: esbuild (CJS bundle) for the API server

## Where things live

- `artifacts/api-server` — Express backend (routes, auth, business logic)
- `artifacts/website` — public site + admin dashboard (Vite/React)
- `artifacts/mockup-sandbox` — isolated UI component preview environment
- `lib/db/src/schema/` — Drizzle schema (source of truth for DB tables: admin-users, members, donations, prayer, events, announcements, gallery, volunteers, staff, settings, notifications)
- `lib/api-spec` — OpenAPI spec + Orval config
- `lib/api-client-react` — generated React Query hooks
- `lib/api-zod` — shared Zod schemas (frontend + backend)
- `Dockerfile.api-server`, `Dockerfile.website`, `docker-compose.yml`, `deploy/nginx.conf.template` — production packaging for self-hosted deployment (e.g. Coolify)

## Architecture decisions

- Contract-first API: `openapi.yaml` generates both the Zod validation schemas and the frontend's typed API client, keeping frontend/backend in sync.
- Membership applications use unique tokens for public status lookup, avoiding the need for applicant accounts.
- `pnpm-workspace.yaml` sets `minimumReleaseAge` as a supply-chain security guard.
- Root `package.json` pins `packageManager: pnpm@10.26.1` so Docker builds (via corepack) use the same pnpm version as development — a version mismatch here breaks `--frozen-lockfile` installs.

## Product

- Public site: masjid info, prayer times, announcements, events, gallery, donations (Square), membership application form, membership status lookup by token.
- Admin dashboard: membership approval workflow (pending/approved/denied), content management (prayer times, announcements, events, gallery, news), staff/volunteer management, donation records, notification settings.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- If Docker builds fail with `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH`, check that root `package.json`'s `packageManager` field matches the pnpm version used to generate `pnpm-lock.yaml`.

## Deployment (Coolify)

This repo ships with everything needed for a Coolify (or any Docker-Compose-based host) deployment:

- `Dockerfile.api-server` — multi-stage build, runs the API server on port 8080 internally (healthcheck at `/api/healthz`). It is **not** exposed to the internet directly — only reachable inside the Docker Compose network.
- `Dockerfile.website` — builds the Vite app and serves it via nginx on port 80. The frontend calls same-origin relative `/api/...` paths (that's how it works in Replit dev too, via the platform's own gateway), so nginx itself proxies `/api/` to the `api-server` container over the internal Docker network (see `deploy/nginx.conf.template`). This means only **one** public domain is needed for the whole app.
- `docker-compose.yml` — api-server + website, plus a `db-push` one-off service. Postgres is **not** bundled — bring your own database (a separate Coolify Postgres resource, or any managed Postgres) and point `DATABASE_URL` at it. Neither service binds a fixed host port (they use `expose`, not `ports`) — Coolify's own proxy routes to the website by domain, and api-server is reached only via nginx's internal proxy. Do not add hardcoded `ports:` mappings back in; on a shared Coolify host that causes "port is already allocated" deploy failures when another app on the server holds the same host port.
- `db-push` service — runs `drizzle-kit push --force` against `DATABASE_URL` on every deploy, using the same internal Docker network the app already uses (no need to make Postgres publicly reachable). `api-server` has a `depends_on: condition: service_completed_successfully` on it, so the API only starts once the schema is in sync. This means whenever the code's database schema changes (new columns/tables), just redeploying the stack keeps production's schema up to date automatically — no manual `pnpm --filter @workspace/db run push` step required. (Do not try to run that command by hand inside the `api-server` container itself — its runtime image is a pruned `--prod`-only deploy with no pnpm/devDependencies/drizzle-kit; only the `builder` stage, which `db-push` uses via `target: builder`, has the full toolchain.)

### Steps

1. Push this repo to GitHub (done — `launchflowuk-sys/Grays-Park-Masjid`).
2. In Coolify, create your Postgres database first (as its own resource, separate from this app's compose stack), and note its internal connection string.
3. Create a new resource from the Git repository, choose "Docker Compose" as the build pack, and point it at `docker-compose.yml`.
4. In the resource's Configuration, set a Domain on the **website** service only (under its individual settings) — that's the single public entry point for both the site and the API (proxied through nginx). The api-server service does not need a domain.
5. Set the required environment variables in Coolify (do not commit real secrets):
   - `DATABASE_URL` (required — connection string for the Postgres database you created in step 2)
   - `JWT_SECRET` (required — a long random string)
   - `APP_BASE_URL` (public URL of the deployed website)
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`
   - Optionally override `LOG_LEVEL`.
   - File uploads (gallery photos, prayer timetable PDFs) are **not** stored on Replit or any cloud service — they are written directly to disk on the api-server container at `LOCAL_STORAGE_DIR` (default `./data/uploads`), which `docker-compose.yml` mounts to the named volume `uploads-data` so files persist across redeploys. No extra env vars or third-party account are required; this is fully automatic outside of the Replit environment. Optionally override `LOCAL_STORAGE_DIR` if you want a different path.
   - Do **not** set Square credentials here — see below.
6. Deploy. Coolify will build the images and run them: `db-push` first (syncs the schema/tables into the production database — safe and automatic on every deploy, including redeploys after future schema changes), then `api-server` and `website` once it finishes successfully.
7. After the very first deploy, the production Postgres database has the schema but no data yet. Run this one seed job once against the production `DATABASE_URL` (from a machine with the full monorepo + pnpm — e.g. this Replit workspace — not from inside the slim `api-server` container, which lacks pnpm/devDependencies):
   - `pnpm --filter @workspace/db run seed` — creates the initial admin login and default content (prayer times, sample pages, etc.). Optionally set `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` first to control the admin credentials it creates; otherwise it uses the defaults in `lib/db/src/seed.ts` — log in and change the password immediately after.
8. Log in to `/admin/settings` and enter the Square Access Token, Application ID, and Location ID under "Payment Integration (Square)". These are stored in the database (not env vars) and are only ever readable by authenticated admins — the public site never exposes them.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
