---
name: Orval zod codegen barrel collision on multi-param endpoints
description: Why lib/api-zod's index.ts breaks with TS2308 duplicate-export errors after adding an OpenAPI operation with 2+ params, and how it's fixed.
---

Orval's `zod` codegen target writes `lib/api-zod/src/index.ts` itself on every run
(it is NOT a hand-authored file, even though it lives outside `generated/`). When an
OpenAPI operation has 2+ combined path/query params (e.g. `surah` + `ayah`, or
`translation` + `reciter`), orval emits the params object in *two* places with the
same name: a `type` in `generated/types/<opId>Params.ts` and a `const` (zod schema) in
`generated/api.ts`. The barrel `index.ts` then does `export *` from both, producing
`error TS2308: Module has already exported a member named 'XParams'`.

Single-param operations (just `id`, or one scalar query param) never hit this because
orval inlines those directly instead of wrapping them in a named object.

**Why:** This is inherent to orval's zod+typescript schema output combination, not a
project bug — any future endpoint with 2+ params will retrigger it, and hand-editing
the generated `index.ts` doesn't stick because orval overwrites it every codegen run.

**How to apply:** Fixed via `lib/api-spec/fix-zod-index.mjs`, run as a postcodegen step
in `lib/api-spec/package.json`'s `codegen` script (after `orval`, before
`typecheck:libs`). It rewrites `lib/api-zod/src/index.ts` to only
`export * from "./generated/api"` (nothing in the codebase imports the `generated/types`
barrel directly, so dropping it is safe). If TS2308 reappears in this file after a
future spec change, don't hand-patch `index.ts` — check that this postcodegen script
still runs and still points at the right file.
