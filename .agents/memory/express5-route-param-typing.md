---
name: Express 5 route-param typing quirk
description: Why a literal `/admin/thing/:id` route path can produce a TS overload error on drizzle `eq()` while a dynamic `${path}/:id` template does not.
---

Express 5's `RouteParameters<Path>` type infers param types from the **literal string type** of the route path. When the route path is written as a literal string constant (e.g. `router.get("/admin/prayer-times/:id", ...)`), `req.params.id` is typed as `string | string[]` in some overload resolutions, which then fails to satisfy `eq(column, value)` in drizzle (expects a plain `string`).

A dynamic path built from a template literal at runtime (e.g. `` `${basePath}/:id` ``, as used in generic CRUD helpers) loses that literal-type inference and falls back to Express's plain `ParamsDictionary`, where `req.params.id` is `string` — no type error.

**Why:** Discovered while adding custom (non-generic-CRUD) route handlers for prayer-time admin endpoints; the generic `crud.ts` helper never hit this because its paths are always template-built.

**How to apply:** If a custom Express route handler with a literal path string gets a confusing `eq()`/param type-mismatch error, extract the param first: `const id: string = req.params.id as string;` then use `id` — don't fight the inferred union type inline.
