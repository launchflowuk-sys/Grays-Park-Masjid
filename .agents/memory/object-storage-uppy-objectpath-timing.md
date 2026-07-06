---
name: Uppy upload completion must not rely on PUT response body for metadata
description: Signed-URL/direct-PUT uploads (S3/GCS-style) often return an empty body on success, so client code cannot read server-issued metadata (like objectPath) from the upload response.
---

When a client gets a pre-signed/direct upload URL from your API and then PUTs the file straight to storage (S3, GCS, or a custom local-disk equivalent), the PUT response body is often empty or provider-specific — it is NOT a reliable place to read metadata your own backend generated (e.g. `objectPath`).

**Why:** A `TimetablePdfDialog`-style upload flow tried to read `objectPath` out of `result.successful[0].response.body` in Uppy's `onComplete`. The backend actually returned `objectPath` in the JSON body of the *initial* `POST /uploads/request-url` call, but that value was discarded. Since GCS returns an empty body on a successful signed PUT, `objectPath` was always `undefined` and the upload silently never "attached" client-side, even though the file itself uploaded fine and the request-url endpoint worked correctly. This bug was long-standing and unrelated to swapping storage backends (Replit GCS vs. local disk) — it existed before the swap and was only caught by an end-to-end UI test, not by curl/unit tests of the backend.

**How to apply:** When wiring up Uppy (or similar) with a two-step signed-upload pattern, capture any server-issued identifiers (objectPath, object id, etc.) from the *first* request (the one that hands back the upload URL) — e.g. in a `Map`/ref keyed by Uppy's `file.id` — and read them back in `onComplete` instead of trusting the PUT response body. Only rely on the PUT response body if you control that endpoint yourself and explicitly return the JSON you need (as is safe to do for a custom local-disk storage driver, but not for third-party signed URLs like S3/GCS).
