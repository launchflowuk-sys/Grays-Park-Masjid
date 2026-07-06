---
name: Square sandbox credential mismatch debugging
description: How to diagnose Square "not authorized to take payments" errors and mis-set SQUARE_* secrets when switching production/sandbox credentials.
---

Square payment creation can fail with `"Not authorized to take payments with location_id=..."` even
though `SQUARE_ACCESS_TOKEN`/`SQUARE_APPLICATION_ID`/`SQUARE_LOCATION_ID` are all set — this happens
when the access token's merchant/location isn't activated for payments, or when production and
sandbox values get cross-mixed across the three secrets.

**Why:** Square application IDs are the only one of the three that visibly encode environment
(`sandbox-sq0idb-...` vs a production `sq0idp-...`), so a quick sanity check on `applicationId` alone
can reveal a swapped/stale secret before wasting time on Square API errors. Also, `requestEnvVar`
prompts can silently fail to update one of several requested keys if the user's paste only landed in
some fields — re-querying `viewEnvVars`/hitting a debug endpoint that echoes back the resolved config
after each attempt is the fastest way to confirm which key actually changed.

**How to apply:** After requesting/rotating Square secrets, restart the dependent workflow(s) and hit
an endpoint that echoes back the resolved `applicationId`/`locationId`/derived `environment` (don't
print `accessToken`, since real access tokens are secret) to confirm the values actually landed before
retrying a real payment call. If only some values updated, re-request just the stale key by name rather
than re-requesting all three again.
