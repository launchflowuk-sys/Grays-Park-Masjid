---
name: object-storage-web package setup
description: Gotchas when adding a new lib/ workspace package (like object-storage-web) for client-side file uploads
---

When adding a new `lib/*` workspace package that a web artifact imports via TS project references:

- Its `tsconfig.json` must include `"composite": true`, `"declarationMap": true`, `"emitDeclarationOnly": true` (matching sibling `lib/*` packages), or referencing artifacts fail with `TS6306: Referenced project must have setting "composite": true`.
- After adding/editing it, run `pnpm exec tsc -b .` inside the package directory to emit `dist/*.d.ts` — referencing projects fail with `TS6305: Output file has not been built from source file` until this is done.
- When adding `pnpm.overrides` for a package version already defined in the workspace catalog (e.g. react), use `"catalog:"` as the override value, not `"$react"` — `$react` only works if the root `package.json` has a direct `react` dependency to alias from, which is often not the case.

**Why:** Hit all three while wiring `@workspace/object-storage-web` (Uppy-based upload components) into a website artifact; each produced a confusing/unrelated-looking TS or install error.

**How to apply:** Whenever scaffolding a new shared `lib/` package meant to be referenced by an artifact's tsconfig, proactively set composite mode and build it once before typechecking the consumer.
