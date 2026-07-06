---
name: Public settings endpoint uses an allowlist
description: New site_settings keys must be added to PUBLIC_SETTING_KEYS in the API server before the public GET /settings/:key endpoint will serve them.
---

The public settings endpoint (`GET /settings/:key`) checks each key against an explicit `PUBLIC_SETTING_KEYS` allowlist before querying the DB — anything not listed returns 404 even if a row exists, and anything listed but with no DB row also returns 404.

**Why:** Prevents accidentally exposing admin-only settings (e.g. payment provider credentials) through the public endpoint just because a row exists in `site_settings`.

**How to apply:** When adding a new public-facing setting (e.g. social links, opening hours) to `KNOWN_SETTINGS` in the admin UI, also add its key to `PUBLIC_SETTING_KEYS` in the settings route file, and design frontend consumers to treat a 404 as "not configured yet" (hide the element) rather than an error.
