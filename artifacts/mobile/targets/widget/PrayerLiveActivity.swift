import ActivityKit
import SwiftUI
import WidgetKit

// Next-prayer Live Activity — Lock Screen banner + Dynamic Island.
//
// This lives inside the EXISTING widget target (same bundle id, same
// provisioning profile); no second extension is involved. Every countdown is a
// SwiftUI `Text(timerInterval:countsDown:)`, so iOS animates it on its own —
// there are no push updates, timers or background tasks anywhere in here.

// MARK: - Shared pieces

/// Deep green gradient + the geometric lattice, used behind the lock-screen
/// banner. Applied via `.background(…)` so it never drives layout.
struct ActivityBrandBackground: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Palette.green, Palette.greenDeep],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            IslamicPatternView(color: Palette.gold, opacity: 0.08, cell: 44)
            IslamicPatternView(color: Palette.cream, opacity: 0.04, cell: 88, lineWidth: 0.7)
        }
    }
}

/// "ADHAN · 8:05 PM" style pairing used on the banner and the expanded island.
struct PrayerTimeChip: View {
    let label: String
    let value: String
    var size: CGFloat = 12

    var body: some View {
        HStack(spacing: 4) {
            Text(label.uppercased())
                .font(.system(size: size - 3, weight: .semibold))
                .tracking(0.8)
                .foregroundStyle(Palette.creamMuted)
            Text(value)
                .font(.system(size: size, weight: .semibold))
                .monospacedDigit()
                .foregroundStyle(Palette.cream)
        }
        .lineLimit(1)
        .minimumScaleFactor(0.7)
    }
}

/// Adhan (and iqamah, when the masjid publishes one) on a single line.
struct PrayerTimesRow: View {
    let adhan: String
    let iqamah: String?
    var size: CGFloat = 12

    var body: some View {
        HStack(spacing: 8) {
            PrayerTimeChip(label: "Adhan", value: adhan, size: size)
            if let iqamah = iqamah {
                Rectangle()
                    .fill(Palette.gold.opacity(0.32))
                    .frame(width: 1, height: size)
                PrayerTimeChip(label: "Iqamah", value: iqamah, size: size)
            }
        }
    }
}

// MARK: - Lock screen / banner

struct PrayerActivityLockScreenView: View {
    let attributes: PrayerActivityAttributes
    let state: PrayerActivityAttributes.ContentState

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .firstTextBaseline, spacing: 8) {
                SectionLabel(text: "Next Prayer", size: 10)
                Spacer(minLength: 4)
                Text("Grays Park Masjid")
                    .font(.system(size: 10, weight: .semibold, design: .serif))
                    .foregroundStyle(Palette.creamMuted)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }

            HStack(alignment: .center, spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(attributes.prayer)
                        .font(.system(size: 26, weight: .bold, design: .serif))
                        .foregroundStyle(Palette.cream)
                        .lineLimit(1)
                        .minimumScaleFactor(0.6)
                    PrayerTimesRow(adhan: attributes.adhan, iqamah: attributes.iqamah)
                }

                Spacer(minLength: 6)

                CountdownText(from: state.startedAt, to: state.endsAt, size: 28)
                    .frame(maxWidth: 130, alignment: .trailing)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(ActivityBrandBackground())
    }
}

// MARK: - Dynamic Island

struct PrayerIslandLeadingView: View {
    let prayer: String

    var body: some View {
        VStack(alignment: .leading, spacing: 1) {
            SectionLabel(text: "Next", size: 9)
            Text(prayer)
                .font(.system(size: 17, weight: .bold, design: .serif))
                .foregroundStyle(Palette.cream)
                .lineLimit(1)
                .minimumScaleFactor(0.6)
        }
        .padding(.leading, 2)
    }
}

struct PrayerIslandTrailingView: View {
    let state: PrayerActivityAttributes.ContentState

    var body: some View {
        VStack(alignment: .trailing, spacing: 1) {
            SectionLabel(text: "In", size: 9)
            CountdownText(from: state.startedAt, to: state.endsAt, size: 17)
        }
        .frame(maxWidth: 96, alignment: .trailing)
        .padding(.trailing, 2)
    }
}

struct PrayerIslandBottomView: View {
    let attributes: PrayerActivityAttributes

    var body: some View {
        HStack(spacing: 8) {
            PrayerTimesRow(adhan: attributes.adhan, iqamah: attributes.iqamah, size: 13)
            Spacer(minLength: 0)
            Image(systemName: "moon.stars.fill")
                .font(.system(size: 11))
                .foregroundStyle(Palette.gold.opacity(0.8))
        }
        .padding(.top, 2)
    }
}

struct PrayerIslandCompactTrailingView: View {
    let state: PrayerActivityAttributes.ContentState

    var body: some View {
        CountdownText(from: state.startedAt, to: state.endsAt, size: 13)
            .frame(width: 52, alignment: .trailing)
    }
}

// MARK: - Widget

struct PrayerLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: PrayerActivityAttributes.self) { context in
            PrayerActivityLockScreenView(
                attributes: context.attributes,
                state: context.state
            )
            .activityBackgroundTint(Palette.green)
            .activitySystemActionForegroundColor(Palette.gold)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    PrayerIslandLeadingView(prayer: context.attributes.prayer)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    PrayerIslandTrailingView(state: context.state)
                }
                DynamicIslandExpandedRegion(.center) {
                    SectionLabel(text: "Grays Park Masjid", size: 9)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    PrayerIslandBottomView(attributes: context.attributes)
                }
            } compactLeading: {
                Image(systemName: "moon.stars.fill")
                    .font(.system(size: 12))
                    .foregroundStyle(Palette.gold)
            } compactTrailing: {
                PrayerIslandCompactTrailingView(state: context.state)
            } minimal: {
                Image(systemName: "moon.stars.fill")
                    .font(.system(size: 12))
                    .foregroundStyle(Palette.gold)
            }
            .keylineTint(Palette.gold)
        }
    }
}
