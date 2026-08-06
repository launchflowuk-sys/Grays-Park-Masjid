import React from "react";
import {
  FlexWidget,
  TextWidget,
  type WidgetInfo,
} from "react-native-android-widget";

import { readWidgetPayload } from "@/utils/widgetData";
import {
  buildViewModel,
  EMPTY_VIEW_MODEL,
  type PrayerWidgetViewModel,
} from "@/widgets/prayerWidgetModel";

/**
 * Android home-screen widget for Grays Park Masjid prayer times.
 *
 * Android's `updatePeriodMillis` floor is 30 minutes, so a live per-second
 * countdown is impossible here — the widget renders absolute times with the
 * next prayer highlighted instead.
 */

const GREEN = "#053317" as const;
const GREEN_DEEP = "#02200E" as const;
const GOLD = "#D4A02C" as const;
const GOLD_SOFT = "#D4A02CCC" as const;
const CREAM = "#F7F2E6" as const;
const CREAM_MUTED = "#F7F2E69E" as const;
const HIGHLIGHT = "#FFFFFF14" as const;
const DIVIDER = "#F7F2E61A" as const;

/** Below this width there is no room for the full timetable. */
const COMPACT_WIDTH_DP = 200;
/** Below this height only the next-prayer summary fits. */
const COMPACT_HEIGHT_DP = 120;

interface PrayerTimesWidgetProps {
  viewModel: PrayerWidgetViewModel;
  width?: number;
  height?: number;
}

function NextPrayerBlock({ viewModel }: { viewModel: PrayerWidgetViewModel }) {
  return (
    <FlexWidget
      style={{
        width: "match_parent",
        flexDirection: "column",
        backgroundColor: HIGHLIGHT,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}
    >
      <TextWidget
        text={viewModel.nextIsTomorrow ? "TOMORROW" : "NEXT PRAYER"}
        style={{ fontSize: 9, fontWeight: "600", letterSpacing: 1, color: GOLD_SOFT }}
      />
      <FlexWidget
        style={{
          width: "match_parent",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TextWidget
          text={viewModel.nextName}
          style={{ fontSize: 20, fontWeight: "700", color: CREAM }}
        />
        <TextWidget
          text={viewModel.nextTime}
          style={{ fontSize: 18, fontWeight: "700", color: GOLD }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

function PrayerRow({
  name,
  adhan,
  iqamah,
  isNext,
  showIqamah,
}: {
  name: string;
  adhan: string;
  iqamah: string;
  isNext: boolean;
  showIqamah: boolean;
}) {
  return (
    <FlexWidget
      style={{
        width: "match_parent",
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 3,
        paddingHorizontal: 6,
        borderRadius: 6,
        ...(isNext ? { backgroundColor: HIGHLIGHT } : {}),
      }}
    >
      <FlexWidget style={{ flex: 3, flexDirection: "column" }}>
        <TextWidget
          text={name}
          style={{
            fontSize: 12,
            fontWeight: isNext ? "700" : "500",
            color: isNext ? GOLD : CREAM,
          }}
        />
      </FlexWidget>
      <FlexWidget style={{ flex: 2, flexDirection: "column" }}>
        <TextWidget
          text={adhan}
          style={{
            fontSize: 12,
            fontWeight: isNext ? "700" : "400",
            textAlign: "right",
            color: isNext ? GOLD : CREAM,
          }}
        />
      </FlexWidget>
      {showIqamah ? (
        <FlexWidget style={{ flex: 2, flexDirection: "column" }}>
          <TextWidget
            text={iqamah}
            style={{
              fontSize: 11,
              textAlign: "right",
              color: isNext ? GOLD_SOFT : CREAM_MUTED,
            }}
          />
        </FlexWidget>
      ) : null}
    </FlexWidget>
  );
}

function ColumnHeader({ showIqamah }: { showIqamah: boolean }) {
  return (
    <FlexWidget
      style={{
        width: "match_parent",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 6,
        paddingBottom: 2,
      }}
    >
      <FlexWidget style={{ flex: 3, flexDirection: "column" }}>
        <TextWidget
          text="PRAYER"
          style={{ fontSize: 8, fontWeight: "600", letterSpacing: 1, color: GOLD_SOFT }}
        />
      </FlexWidget>
      <FlexWidget style={{ flex: 2, flexDirection: "column" }}>
        <TextWidget
          text="ADHAN"
          style={{
            fontSize: 8,
            fontWeight: "600",
            letterSpacing: 1,
            textAlign: "right",
            color: GOLD_SOFT,
          }}
        />
      </FlexWidget>
      {showIqamah ? (
        <FlexWidget style={{ flex: 2, flexDirection: "column" }}>
          <TextWidget
            text="IQAMAH"
            style={{
              fontSize: 8,
              fontWeight: "600",
              letterSpacing: 1,
              textAlign: "right",
              color: GOLD_SOFT,
            }}
          />
        </FlexWidget>
      ) : null}
    </FlexWidget>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      accessibilityLabel="Grays Park Masjid prayer times"
      style={{
        height: "match_parent",
        width: "match_parent",
        flexDirection: "column",
        borderRadius: 16,
        padding: 12,
        backgroundColor: GREEN,
        backgroundGradient: {
          from: GREEN,
          to: GREEN_DEEP,
          orientation: "TL_BR",
        },
      }}
    >
      {children}
    </FlexWidget>
  );
}

export function PrayerTimesWidget({
  viewModel,
  width = 320,
  height = 160,
}: PrayerTimesWidgetProps) {
  if (!viewModel.hasData) {
    return (
      <Shell>
        <FlexWidget
          style={{
            width: "match_parent",
            height: "match_parent",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <TextWidget
            text="Grays Park Masjid"
            style={{ fontSize: 14, fontWeight: "700", color: CREAM }}
          />
          <TextWidget
            text="Open the app to load prayer times."
            style={{ fontSize: 11, color: CREAM_MUTED }}
          />
        </FlexWidget>
      </Shell>
    );
  }

  const isCompact = width < COMPACT_WIDTH_DP || height < COMPACT_HEIGHT_DP;
  const showIqamah = width >= 260;

  if (isCompact) {
    return (
      <Shell>
        <TextWidget
          text={viewModel.nextIsTomorrow ? "TOMORROW" : "NEXT PRAYER"}
          style={{ fontSize: 9, fontWeight: "600", letterSpacing: 1, color: GOLD_SOFT }}
        />
        <TextWidget
          text={viewModel.nextName}
          style={{ fontSize: 20, fontWeight: "700", color: CREAM }}
        />
        <TextWidget
          text={viewModel.nextTime}
          style={{ fontSize: 22, fontWeight: "700", color: GOLD }}
        />
        <FlexWidget style={{ flex: 1, width: "wrap_content", flexDirection: "column" }} />
        {viewModel.hijri ? (
          <TextWidget
            text={viewModel.hijri}
            maxLines={1}
            truncate="END"
            style={{ fontSize: 9, color: CREAM_MUTED }}
          />
        ) : null}
      </Shell>
    );
  }

  return (
    <Shell>
      <FlexWidget
        style={{
          width: "match_parent",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <TextWidget
          text={viewModel.masjid}
          maxLines={1}
          truncate="END"
          style={{ fontSize: 13, fontWeight: "700", color: CREAM }}
        />
        <TextWidget
          text={viewModel.hijri}
          maxLines={1}
          truncate="END"
          style={{ fontSize: 10, color: GOLD }}
        />
      </FlexWidget>

      <NextPrayerBlock viewModel={viewModel} />

      <FlexWidget
        style={{
          width: "match_parent",
          height: 1,
          marginVertical: 6,
          flexDirection: "column",
          backgroundColor: DIVIDER,
        }}
      />

      <ColumnHeader showIqamah={showIqamah} />

      {viewModel.rows.map((row, index) => (
        <PrayerRow
          key={row.name}
          name={row.name}
          adhan={row.adhan}
          iqamah={row.iqamah}
          isNext={index === viewModel.nextIndex}
          showIqamah={showIqamah}
        />
      ))}
    </Shell>
  );
}

/** Build the widget JSX for a specific widget instance from shared storage. */
export async function renderPrayerWidget(info?: WidgetInfo) {
  const payload = await readWidgetPayload();
  const viewModel = payload ? buildViewModel(payload) : EMPTY_VIEW_MODEL;
  return (
    <PrayerTimesWidget
      viewModel={viewModel}
      width={info?.width}
      height={info?.height}
    />
  );
}
