const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Make packages from the monorepo root accessible to Metro.
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Force Babel to transpile packages that use private class fields (#x, #y etc.)
// which Hermes bytecode compiler rejects when left untransformed.
//
// WHY THE TWO-BRANCH REGEX:
//   In a pnpm monorepo (including EAS cloud builds) every package lives at:
//     node_modules/.pnpm/<pkg@ver>/node_modules/<pkg>/…
//   A naïve regex `node_modules/(?!(react-native|…))` first matches the outer
//   `node_modules/.pnpm/` segment — `.pnpm` is not in the allowlist — so the
//   file is treated as "ignored" and Babel never touches it.  Hermes then
//   rejects the raw private class field syntax at bundle-compile time.
//
//   Fix: add a second lookahead branch using `.*node_modules/(pkg)` that handles
//   the nested pnpm store layout.  Together the two branches cover:
//     npm:  node_modules/<pkg>/…
//     pnpm: node_modules/.pnpm/<something>/node_modules/<pkg>/…
const packagesToTransform = [
  "react-native",
  "@react-native(-community)?",
  // "expo" itself AND every "expo-*" package (expo-glass-effect, expo-audio…)
  "expo(-[^/]*)?",
  // "@expo/*" scoped packages AND "@expo-google-fonts/*" etc.
  "@expo(-[^/]*)?",
  // @tanstack/react-query + @tanstack/query-core use private class fields in v5+
  "@tanstack",
  "react-navigation",
  "@react-navigation",
  "@unimodules",
  "unimodules",
  "sentry-expo",
  "native-base",
  "react-native-svg",
  "react-native-keyboard-controller",
  "react-native-reanimated",
  "react-native-worklets",
  "react-native-screens",
  "react-native-safe-area-context",
  "react-native-gesture-handler",
  "react-native-render-html",
  "@shopify",
  "@gorhom",
  "@stardazed",
  "@ungap",
];

const pkgGroup = packagesToTransform.join("|");

config.resolver = {
  ...config.resolver,
  // Ignore (skip Babel) everything in node_modules EXCEPT the packages above.
  // Branch 1 handles direct npm layout: node_modules/<pkg>/
  // Branch 2 handles pnpm store layout: …/node_modules/.pnpm/…/node_modules/<pkg>/
  transformIgnorePatterns: [
    `node_modules/(?!(${pkgGroup})/|.+/node_modules/(${pkgGroup})/)`,
  ],
};

module.exports = config;
