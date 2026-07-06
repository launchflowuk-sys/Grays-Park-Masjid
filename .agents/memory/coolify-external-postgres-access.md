---
name: Coolify external Postgres access from the agent workspace
description: What to do when a self-hosted Coolify Postgres needs data written from the Replit workspace but connection strings won't authenticate externally.
---

Externally-exposed Coolify Postgres connection strings (public IP or internal Docker service hostname) may fail from the agent's workspace even with a verified-correct password — internal hostnames aren't resolvable outside Coolify's Docker network, and public-IP/port exposures can reject the same credentials that work internally (proxying/auth differences).

**Why:** Spent multiple round-trips retrying an identical connection string against a masjid site's Coolify DB; password was reconfirmed correct by the user but `28P01 password authentication failed` persisted externally.

**How to apply:** Don't loop retrying the same external connection string. Instead, generate a self-contained SQL/heredoc command (`psql -U <user> -d <db> <<'EOF' ... EOF`) that the user pastes into Coolify's own container terminal for that resource — this runs locally inside the container and sidesteps external network/auth issues entirely. Works well for one-off data loads (e.g. seeding production content from dev).
