/**
 * Grays Park Masjid — iOS Prayer Times widget target.
 *
 * Generated into the Xcode project by `@bacons/apple-targets` on
 * `npx expo prebuild -p ios`. Do NOT hand-edit the generated ios/ output —
 * change this file (and the Swift sources next to it) instead.
 *
 * NOTE: this target deliberately declares NO entitlements. It has no App Group
 * and no shared UserDefaults — the widget fetches prayer times straight from
 * the public API (see PrayerData.swift) and caches them in its own sandbox.
 * Keeping the entitlements block absent avoids provisioning-profile mismatches.
 *
 * @type {import('@bacons/apple-targets/app.plugin').Config}
 */
module.exports = {
  type: "widget",

  // Product / target name. Bundle id is derived from the main app id
  // (`com.grayspark.app`) because it is prefixed with a dot.
  name: "widget",
  displayName: "Prayer Times",
  bundleIdentifier: ".widget",

  // 16.2 (not 16.0) so Live Activities / ActivityKit can be added later
  // without regenerating the target.
  deploymentTarget: "16.2",

  frameworks: ["SwiftUI", "WidgetKit"],

  // Widget gallery icon.
  icon: "../../assets/images/icon.png",

  // Generated into the target's Assets.xcassets. `$accent` and
  // `$widgetBackground` are special names honoured by apple-targets.
  colors: {
    $accent: { light: "#D4A02C", dark: "#D4A02C" },
    $widgetBackground: { light: "#053317", dark: "#053317" },
  },
};
