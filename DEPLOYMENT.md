# Deploying to Coolify (or any Docker host)

This project ships as three deployable pieces:

- **`postgres`** — the application database.
- **`api-server`** (`Dockerfile.api-server`) — Express API, listens on `PORT` (default `8080`), all routes under `/api`.
- **`website`** (`Dockerfile.website`) — the React SPA, built with Vite and served as static files via nginx (default port `80`).

A `docker-compose.yml` at the repo root wires all three together for local testing (`docker compose up --build`) or as a reference for a Coolify "Docker Compose" resource.

## 1. Environment variables

Copy `.env.example` and fill in real values. See that file for the full list and descriptions. At minimum you must set:

- `DATABASE_URL` — Postgres connection string.
- `JWT_SECRET` — long random string (`openssl rand -hex 32`), used to sign auth tokens.
- `APP_BASE_URL` — the public URL of the deployed site (used in emails).
- `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` — for outgoing email (password resets, enquiry notifications).

**Object storage caveat:** file uploads (timetable PDFs, gallery photos, staff photos) currently authenticate to Google Cloud Storage through Replit's built-in sidecar, which only exists inside the Replit environment. This will **not** work on Coolify or any other host as-is. Before relying on uploads in a non-Replit deployment, update `artifacts/api-server/src/lib/objectStorage.ts` to use a real GCS service-account key or migrate to another S3-compatible provider, and set the corresponding credentials/bucket env vars.

## 2. Deploying on Coolify

### Option A — Docker Compose resource (recommended, single Coolify app)

1. Create a new **Docker Compose** resource in Coolify pointing at this repo.
2. Point it at `docker-compose.yml`.
3. In Coolify's environment variables UI, set `JWT_SECRET`, `APP_BASE_URL`, SMTP vars, and object storage vars (see above) — these are read by the `api-server` service via compose interpolation.
4. Expose the `website` service (port 80) as the public domain, and optionally expose `api-server` (port 8080) under a `/api` path or subdomain if you want it reachable directly (the website already proxies API calls to whatever `APP_BASE_URL`/base path is configured in the frontend — confirm your reverse proxy routes `/api/*` to the `api-server` container).
5. Deploy. Coolify will build both Dockerfiles and start Postgres with a persistent volume.

### Option B — Separate Coolify applications

Create three Coolify resources instead of one compose stack:

1. **Database**: use Coolify's managed Postgres, or point `DATABASE_URL` at an external Postgres instance.
2. **API server**: new "Dockerfile" application using `Dockerfile.api-server`, build context = repo root. Set the env vars listed above plus `PORT=8080`. Expose it on a domain/path (e.g. `api.yourdomain.com` or `yourdomain.com/api`, matching what the website expects).
3. **Website**: new "Dockerfile" application using `Dockerfile.website`, build context = repo root. If hosting under a sub-path instead of the domain root, pass `--build-arg BASE_PATH=/your-path` in Coolify's build settings. Expose it on your primary domain.

## 3. First-deploy database setup

The project uses `drizzle-kit push` (schema push) rather than versioned migrations. After the database is reachable, run once (from a machine/container with `DATABASE_URL` set and the repo installed):

```bash
pnpm install --frozen-lockfile
pnpm --filter @workspace/db run push       # creates tables from the current schema
pnpm --filter @workspace/db run seed       # optional: inserts realistic starter content + admin user
```

The seed script is idempotent — it skips any table that already has rows, so it's safe to re-run.

The default seeded admin login is `admin@graysparkmasjid.org.uk` (see `lib/db/src/seed.ts` for the password) — **change this password immediately after first login in production.**

## 4. Health checks

The API server exposes `GET /api/healthz` for liveness/readiness checks (used by Replit's own deployment and referenced in `docker-compose.yml`). Configure Coolify's health check to hit this path on the `api-server` service.

## 5. Local verification

```bash
cp .env.example .env   # fill in JWT_SECRET at minimum
docker compose up --build
```

Website: http://localhost:8081 · API: http://localhost:8080/api/healthz
