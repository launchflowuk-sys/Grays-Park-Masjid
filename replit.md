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

- `Dockerfile.api-server` — multi-stage build, runs the API server on port 8080 (healthcheck at `/api/healthz`)
- `Dockerfile.website` — builds the Vite app and serves it via nginx on port 80
- `docker-compose.yml` — api-server + website only. Postgres is **not** bundled — bring your own database (a separate Coolify Postgres resource, or any managed Postgres) and point `DATABASE_URL` at it.

### Steps

1. Push this repo to GitHub (done — `launchflowuk-sys/Grays-Park-Masjid`).
2. In Coolify, create your Postgres database first (as its own resource, separate from this app's compose stack), and note its internal connection string.
3. Create a new resource from the Git repository, choose "Docker Compose" as the build pack, and point it at `docker-compose.yml`.
4. Set the required environment variables in Coolify (do not commit real secrets):
   - `DATABASE_URL` (required — connection string for the Postgres database you created in step 2)
   - `JWT_SECRET` (required — a long random string)
   - `APP_BASE_URL` (public URL of the deployed app)
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`
   - Optionally override `LOG_LEVEL`.
   - File uploads (gallery photos, prayer timetable PDFs) are **not** stored on Replit or any cloud service — they are written directly to disk on the api-server container at `LOCAL_STORAGE_DIR` (default `./data/uploads`), which `docker-compose.yml` mounts to the named volume `uploads-data` so files persist across redeploys. No extra env vars or third-party account are required; this is fully automatic outside of the Replit environment. Optionally override `LOCAL_STORAGE_DIR` if you want a different path.
   - Do **not** set Square credentials here — see below.
5. Deploy. Coolify will build both Docker images and start the api-server and website services.
6. After first deploy, the production Postgres database starts empty. Run these two one-off jobs against the production `DATABASE_URL` (the compose stack does not auto-migrate or seed on boot):
   - `pnpm --filter @workspace/db run push` — creates the schema/tables
   - `pnpm --filter @workspace/db run seed` — creates the initial admin login and default content (prayer times, sample pages, etc.). Optionally set `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` first to control the admin credentials it creates; otherwise it uses the defaults in `lib/db/src/seed.ts` — log in and change the password immediately after.
7. Log in to `/admin/settings` and enter the Square Access Token, Application ID, and Location ID under "Payment Integration (Square)". These are stored in the database (not env vars) and are only ever readable by authenticated admins — the public site never exposes them.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
