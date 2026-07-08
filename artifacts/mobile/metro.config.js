const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Force Babel to transpile packages that use private class fields (#x, #y etc.)
// which Hermes bytecode compiler can't handle when left untransformed.
config.resolver = {
  ...config.resolver,
  transformIgnorePatterns: [
    "node_modules/(?!(" +
      "react-native" +
      "|@react-native(-community)?" +
      "|expo(nent)?" +
      "|@expo(nent)?/.*" +
      "|@expo-google-fonts/.*" +
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
      "|@shopify/.*" +
      "|@gorhom/.*" +
    ")/)",
  ],
};

module.exports = config;
