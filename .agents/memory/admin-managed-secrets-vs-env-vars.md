---
name: Third-party API credentials belong in admin-managed settings, not deployment env vars
description: When a non-technical admin needs to configure/rotate a third-party integration (e.g. payment processor) themselves, store the credential in the app's own admin settings UI/DB, not in Coolify/deployment env vars.
---

For this project, Square payment credentials (access token, application ID, location ID) were
initially packaged as Coolify/docker-compose environment variables. The user stopped that mid-task:
they want to manage/rotate these credentials themselves from the in-app admin settings screen, not
by editing deployment platform env vars.

**Why:** Non-technical admins don't have (or want) access to the deployment platform's env var
config. Also, a generic public "get setting by key" endpoint existed for site content — reusing it
naively for secrets would leak them, since `GET /settings/:key` had no auth. Any generic settings
table shared with public content needs an explicit allowlist of public-readable keys; the default
must be deny for anything not on that list.

**How to apply:** When an integration credential needs to be admin-editable rather than
ops/deployment-editable: (1) store it in the app's own settings table (e.g. `site_settings`
key/value) behind an authenticated + role-gated admin route, (2) load it lazily from the DB in the
library code instead of `process.env` at module load time, (3) explicitly allowlist which keys a
public/unauthenticated settings endpoint may return, and (4) render the field as a masked/password
input in the admin UI. Don't put such secrets in `docker-compose.yml`/Coolify env vars at all.
