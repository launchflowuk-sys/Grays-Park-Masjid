---
name: pnpm Metro transformIgnorePatterns
description: Why the standard Metro transform-ignore regex breaks in pnpm monorepos and how to fix it for EAS builds
---

## The rule

In a pnpm monorepo EAS build, use a two-branch regex for `transformIgnorePatterns`:

```js
const pkgGroup = ["react-native", "@tanstack", "expo(-[^/]*)?", ...].join("|");

config.resolver.transformIgnorePatterns = [
  `node_modules/(?!(${pkgGroup})/|.+/node_modules/(${pkgGroup})/)`,
];
```

**Why:** pnpm stores every package at `node_modules/.pnpm/<pkg@ver>/node_modules/<pkg>/…`.
The naïve pattern `node_modules/(?!(react-native|…))` tests the FIRST `node_modules/`
occurrence, which is followed by `.pnpm/`. Since `.pnpm` is not in the allowlist the
negative lookahead succeeds, the pattern matches, and Metro skips Babel for the file.
All pnpm-stored transitive deps (e.g. `@tanstack/query-core`) arrive at Hermes as raw
ES2022+ private-field syntax → build fails with "private properties are not supported".

**How to apply:** Always use the two-branch form:
- Branch 1 `(${pkgGroup})/` — handles direct npm/symlink layout
- Branch 2 `.+/node_modules/(${pkgGroup})/` — handles pnpm virtual store layout

Also add `watchFolders: [workspaceRoot]` and `nodeModulesPaths` so Metro can find
packages from sibling workspace packages too.

## Packages known to use private class fields (must be in the transform list)

- `@tanstack/query-core` v5+ — all core classes use `#field` syntax
- `@tanstack/react-query` v5+
- `@stardazed/streams-text-encoding` — already in legacy list
- `@ungap/structured-clone` — already in legacy list
