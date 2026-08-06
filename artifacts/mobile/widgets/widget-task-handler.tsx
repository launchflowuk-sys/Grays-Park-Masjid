import type { WidgetTaskHandlerProps } from "react-native-android-widget";

import { renderPrayerWidget } from "@/widgets/PrayerTimesWidget";

/**
 * Headless task invoked by Android whenever a widget is added, resized,
 * clicked, or hits its `updatePeriodMillis` tick. It renders from the payload
 * the app last wrote to AsyncStorage (see `utils/widgetData.ts`).
 */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetInfo, widgetAction, renderWidget } = props;

  if (widgetInfo.widgetName !== "PrayerTimes") return;

  switch (widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED":
    case "WIDGET_CLICK":
      renderWidget(await renderPrayerWidget(widgetInfo));
      break;
    case "WIDGET_DELETED":
    default:
      break;
  }
}
