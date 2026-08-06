// Custom entry point.
//
// `expo-router/entry` still registers the app exactly as before — we only wrap
// it so the Android widget's headless task handler can be registered on the
// same JS bundle. Keep `"main": "index.js"` in package.json in sync with this.
import "expo-router/entry";

import { Platform } from "react-native";

// Android-only: the widget library has no iOS/web implementation, so keep it
// out of those bundles entirely.
if (Platform.OS === "android") {
  const { registerWidgetTaskHandler } = require("react-native-android-widget");
  const { widgetTaskHandler } = require("./widgets/widget-task-handler");

  registerWidgetTaskHandler(widgetTaskHandler);
}
