---
name: Orval-generated query hooks need explicit queryKey when using `enabled`
description: TS2741 "Property 'queryKey' is missing" from orval-generated React Query hooks that take path params, when overriding `query.enabled`.
---

When an orval-generated hook's query options type is parameterized on a specific `queryKey` tuple (common for endpoints with path params, e.g. `getQuranAyahQueryKey(surah, ayah, params)`), passing only `{ query: { enabled: ... } }` fails TypeScript with "Property 'queryKey' is missing in type '{ enabled: boolean }'".

**Why:** these hooks' generated `UseQueryOptions<..., queryKey>` generic is inferred from the literal key builder, not left generic, so a partial `query` override loses the required `queryKey` field.

**How to apply:** when overriding `enabled` on one of these hooks, also pass `queryKey: getXQueryKey(...sameArgs)` explicitly, mirroring the args passed to the hook itself. Existing examples of this pattern in the codebase: `membership-status.tsx`, `quran.tsx`, `quran-surah.tsx`, `home.tsx`.
