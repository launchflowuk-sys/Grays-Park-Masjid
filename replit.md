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
- `docker-compose.yml` — postgres + api-server + website, wired together with a healthchecked Postgres dependency

### Steps

1. Push this repo to GitHub (done — `launchflowuk-sys/Grays-Park-Masjid`).
2. In Coolify, create a new resource from the Git repository, choose "Docker Compose" as the build pack, and point it at `docker-compose.yml`.
3. Set the required environment variables in Coolify (do not commit real secrets):
   - `JWT_SECRET` (required — a long random string)
   - `APP_BASE_URL` (public URL of the deployed app)
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`
   - `DEFAULT_OBJECT_STORAGE_BUCKET_ID`, `PRIVATE_OBJECT_DIR`, `PUBLIC_OBJECT_SEARCH_PATHS` (if object storage/gallery uploads are used)
   - Optionally override `POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_DB` for the bundled Postgres service, and `LOG_LEVEL`.
   - Do **not** set Square credentials here — see below.
4. Deploy. Coolify will build both Docker images and start all three services; the api-server waits for Postgres to report healthy before starting.
5. After first deploy, run the DB schema push against the production `DATABASE_URL` (`pnpm --filter @workspace/db run push`) or apply it as a one-off job, since the compose stack does not auto-migrate on boot.
6. Log in to `/admin/settings` and enter the Square Access Token, Application ID, and Location ID under "Payment Integration (Square)". These are stored in the database (not env vars) and are only ever readable by authenticated admins — the public site never exposes them.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
