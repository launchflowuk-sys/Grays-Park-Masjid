const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Force Babel to transpile packages that use private class fields (#x, #y etc.)
// which Hermes bytecode compiler rejects when left untransformed.
//
// IMPORTANT: "expo(nent)?" only matches "expo" or "exponent" as whole names.
// It does NOT match "expo-glass-effect", "expo-audio", "expo-blur", etc.
// Use "expo(-[^/]*)?" to capture every "expo-*" package.
config.resolver = {
  ...config.resolver,
  transformIgnorePatterns: [
    "node_modules/(?!(" +
      "react-native" +
      "|@react-native(-community)?" +
      // "expo" itself AND every "expo-*" package (expo-glass-effect, expo-audio, etc.)
      "|expo(-[^/]*)?" +
      // "@expo/*" scoped packages AND "@expo-google-fonts/*" etc.
      "|@expo(-[^/]*)?/.*" +
      "|react-navigation" +
      "|@react-navigation/.*" +
      "|@unimodules/.*" +
      "|unimodules" +
      "|sentry-expo" +
      "|native-base" +
      "|react-native-svg" +
      "|react-native-keyboard-controller" +
      "|react-native-reanimated" +
      "|react-native-worklets" +
      "|react-native-screens" +
      "|react-native-safe-area-context" +
      "|react-native-gesture-handler" +
      "|react-native-render-html" +
      "|@shopify/.*" +
      "|@gorhom/.*" +
      "|@stardazed/.*" +
      "|@ungap/.*" +
    ")/)",
  ],
};

module.exports = config;
