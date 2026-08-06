import SwiftUI
import WidgetKit

// MARK: - Timeline entry

struct PrayerTimelineEntry: TimelineEntry {
    let date: Date
    let hijri: String
    let gregorian: String
    let today: PrayerDay?
    let next: PrayerSlot?
    let nextIsTomorrow: Bool
    let hasData: Bool

    static func empty(_ date: Date) -> PrayerTimelineEntry {
        PrayerTimelineEntry(
            date: date,
            hijri: "",
            gregorian: PrayerFormatters.weekday.string(from: date),
            today: nil,
            next: nil,
            nextIsTomorrow: false,
            hasData: false
        )
    }

    /// Used for the gallery placeholder / snapshot before real data exists.
    static var sample: PrayerTimelineEntry {
        let start = Calendar.current.startOfDay(for: Date())
        let times: [(name: String, hour: Int, minute: Int, iqamahHour: Int, iqamahMinute: Int)] = [
            (name: "Fajr", hour: 4, minute: 20, iqamahHour: 4, iqamahMinute: 50),
            (name: "Dhuhr", hour: 13, minute: 5, iqamahHour: 13, iqamahMinute: 30),
            (name: "Asr", hour: 17, minute: 15, iqamahHour: 17, iqamahMinute: 45),
            (name: "Maghrib", hour: 20, minute: 45, iqamahHour: 20, iqamahMinute: 50),
            (name: "Isha", hour: 22, minute: 15, iqamahHour: 22, iqamahMinute: 30),
        ]
        let slots: [PrayerSlot] = times.compactMap { sample -> PrayerSlot? in
            let name = sample.name
            guard
                let adhan = Calendar.current.date(
                    bySettingHour: sample.hour, minute: sample.minute, second: 0, of: start
                ),
                let iqamah = Calendar.current.date(
                    bySettingHour: sample.iqamahHour, minute: sample.iqamahMinute,
                    second: 0, of: start
                )
            else { return nil }
            return PrayerSlot(
                id: "sample-\(name)",
                name: name,
                adhan: adhan,
                adhanLabel: PrayerFormatters.clock.string(from: adhan),
                iqamahLabel: PrayerFormatters.clock.string(from: iqamah)
            )
        }
        let day = PrayerDay(
            start: start,
            key: "sample",
            hijri: "22 Safar 1448 AH",
            sunriseLabel: nil,
            slots: slots
        )
        return PrayerTimelineEntry(
            date: Date(),
            hijri: day.hijri,
            gregorian: PrayerFormatters.weekday.string(from: start),
            today: day,
            next: slots.first { $0.adhan > Date() } ?? slots.first,
            nextIsTomorrow: false,
            hasData: true
        )
    }
}

// MARK: - Provider

struct PrayerProvider: TimelineProvider {
    /// One network fetch produces a week of entries, so the widget keeps
    /// rendering correctly offline until the next daily refresh.
    private static let timelineDays = 7
    private static let refreshInterval: TimeInterval = 24 * 60 * 60
    private static let retryInterval: TimeInterval = 60 * 60

    func placeholder(in context: Context) -> PrayerTimelineEntry {
        .sample
    }

    func getSnapshot(in context: Context, completion: @escaping (PrayerTimelineEntry) -> Void) {
        if context.isPreview {
            completion(.sample)
            return
        }
        // Snapshots must be fast — serve whatever is already cached on disk.
        let cached = PrayerService.cachedDays()
        completion(
            cached.isEmpty
                ? .empty(Date())
                : PrayerCalendar.entry(at: Date(), days: cached)
        )
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerTimelineEntry>) -> Void) {
        Task {
            let now = Date()
            let days = await PrayerService.loadDays()

            guard !days.isEmpty else {
                // No network and no cache — retry in an hour.
                completion(
                    Timeline(
                        entries: [PrayerTimelineEntry.empty(now)],
                        policy: .after(now.addingTimeInterval(Self.retryInterval))
                    )
                )
                return
            }

            // One entry per prayer boundary for the next week. The countdown
            // itself is animated by SwiftUI, so no per-minute/per-second
            // entries are needed.
            let boundaries = PrayerCalendar.boundaries(
                from: now, days: Self.timelineDays, in: days
            )
            let entries = ([now] + boundaries).map {
                PrayerCalendar.entry(at: $0, days: days)
            }

            // Refresh roughly once a day, but never after the entries run out.
            let dailyRefresh = now.addingTimeInterval(Self.refreshInterval)
            let refreshAt: Date = {
                guard let lastBoundary = boundaries.last else {
                    // Data is stale (nothing upcoming) — try again sooner.
                    return now.addingTimeInterval(Self.retryInterval)
                }
                return min(dailyRefresh, lastBoundary)
            }()
            completion(Timeline(entries: entries, policy: .after(refreshAt)))
        }
    }
}

// MARK: - Shared pieces

struct SectionLabel: View {
    let text: String
    var size: CGFloat = 9

    var body: some View {
        Text(text.uppercased())
            .font(.system(size: size, weight: .semibold))
            .tracking(1.1)
            .foregroundStyle(Palette.gold.opacity(0.92))
            .lineLimit(1)
    }
}

struct CountdownText: View {
    let from: Date
    let to: Date
    var size: CGFloat
    var color: Color = Palette.gold

    var body: some View {
        Text(timerInterval: from...max(to, from.addingTimeInterval(1)), countsDown: true)
            .font(.system(size: size, weight: .semibold, design: .rounded))
            .monospacedDigit()
            .foregroundStyle(color)
            .lineLimit(1)
            .minimumScaleFactor(0.5)
    }
}

struct PrayerRow: View {
    let slot: PrayerSlot
    let isNext: Bool
    var showIqamah: Bool = true
    var compact: Bool = false

    var body: some View {
        HStack(spacing: 6) {
            if isNext {
                Capsule()
                    .fill(Palette.gold)
                    .frame(width: 2.5, height: compact ? 12 : 15)
            } else {
                Capsule()
                    .fill(Color.clear)
                    .frame(width: 2.5, height: compact ? 12 : 15)
            }

            Text(slot.name)
                .font(.system(size: compact ? 11 : 13, weight: isNext ? .bold : .medium))
                .foregroundStyle(isNext ? Palette.gold : Palette.cream)
                .lineLimit(1)
                .minimumScaleFactor(0.7)

            Spacer(minLength: 4)

            Text(slot.adhanLabel)
                .font(.system(size: compact ? 11 : 13, weight: isNext ? .bold : .regular))
                .monospacedDigit()
                .foregroundStyle(isNext ? Palette.gold : Palette.cream.opacity(0.92))
                .lineLimit(1)

            if showIqamah {
                Text(slot.iqamahLabel ?? "—")
                    .font(.system(size: compact ? 10 : 12, weight: .regular))
                    .monospacedDigit()
                    .foregroundStyle(
                        isNext ? Palette.gold.opacity(0.8) : Palette.creamMuted
                    )
                    .lineLimit(1)
                    .frame(width: compact ? 54 : 62, alignment: .trailing)
            }
        }
        .padding(.vertical, compact ? 1.5 : 2.5)
    }
}

struct ColumnHeader: View {
    var showIqamah: Bool
    var compact: Bool = false

    var body: some View {
        HStack(spacing: 6) {
            Color.clear.frame(width: 2.5, height: 1)
            SectionLabel(text: "Prayer", size: 8)
            Spacer(minLength: 4)
            SectionLabel(text: "Adhan", size: 8)
            if showIqamah {
                SectionLabel(text: "Iqamah", size: 8)
                    .frame(width: compact ? 54 : 62, alignment: .trailing)
            }
        }
    }
}

struct NoDataView: View {
    var compact: Bool = false

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Image(systemName: "moon.stars.fill")
                .font(.system(size: compact ? 16 : 20))
                .foregroundStyle(Palette.gold)
            Text("Grays Park Masjid")
                .font(.system(size: compact ? 12 : 15, weight: .bold, design: .serif))
                .foregroundStyle(Palette.cream)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            Text("Open the app to load prayer times.")
                .font(.system(size: compact ? 10 : 12))
                .foregroundStyle(Palette.creamMuted)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .padding(12)
    }
}

// MARK: - System families

struct SmallView: View {
    let entry: PrayerTimelineEntry

    var body: some View {
        if let next = entry.next {
            VStack(alignment: .leading, spacing: 3) {
                SectionLabel(text: entry.nextIsTomorrow ? "Tomorrow" : "Next Prayer")

                Text(next.name)
                    .font(.system(size: 23, weight: .bold, design: .serif))
                    .foregroundStyle(Palette.cream)
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)

                CountdownText(from: entry.date, to: next.adhan, size: 21)

                Spacer(minLength: 0)

                VStack(alignment: .leading, spacing: 1) {
                    HStack(spacing: 4) {
                        Text("Adhan")
                            .font(.system(size: 9, weight: .semibold))
                            .foregroundStyle(Palette.creamMuted)
                        Text(next.adhanLabel)
                            .font(.system(size: 11, weight: .semibold))
                            .monospacedDigit()
                            .foregroundStyle(Palette.cream)
                    }
                    if let iqamah = next.iqamahLabel {
                        HStack(spacing: 4) {
                            Text("Iqamah")
                                .font(.system(size: 9, weight: .semibold))
                                .foregroundStyle(Palette.creamMuted)
                            Text(iqamah)
                                .font(.system(size: 11, weight: .semibold))
                                .monospacedDigit()
                                .foregroundStyle(Palette.cream)
                        }
                    }
                }

                if !entry.hijri.isEmpty {
                    Text(entry.hijri)
                        .font(.system(size: 9))
                        .foregroundStyle(Palette.gold.opacity(0.75))
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            .padding(12)
        } else {
            NoDataView(compact: true)
        }
    }
}

struct MediumView: View {
    let entry: PrayerTimelineEntry

    var body: some View {
        if let next = entry.next, let today = entry.today {
            HStack(alignment: .top, spacing: 12) {
                VStack(alignment: .leading, spacing: 3) {
                    SectionLabel(text: entry.nextIsTomorrow ? "Tomorrow" : "Next Prayer")

                    Text(next.name)
                        .font(.system(size: 22, weight: .bold, design: .serif))
                        .foregroundStyle(Palette.cream)
                        .lineLimit(1)
                        .minimumScaleFactor(0.6)

                    CountdownText(from: entry.date, to: next.adhan, size: 19)

                    Text(next.adhanLabel)
                        .font(.system(size: 11, weight: .semibold))
                        .monospacedDigit()
                        .foregroundStyle(Palette.cream.opacity(0.85))

                    Spacer(minLength: 0)

                    if !entry.hijri.isEmpty {
                        Text(entry.hijri)
                            .font(.system(size: 9))
                            .foregroundStyle(Palette.gold.opacity(0.75))
                            .lineLimit(2)
                            .minimumScaleFactor(0.7)
                    }
                }
                .frame(width: 108, alignment: .leading)

                Rectangle()
                    .fill(Palette.gold.opacity(0.25))
                    .frame(width: 1)

                VStack(alignment: .leading, spacing: 0) {
                    ColumnHeader(showIqamah: true, compact: true)
                    Spacer(minLength: 2)
                    ForEach(today.slots) { slot in
                        PrayerRow(
                            slot: slot,
                            isNext: slot.id == next.id,
                            compact: true
                        )
                    }
                    Spacer(minLength: 0)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .padding(12)
        } else {
            NoDataView()
        }
    }
}

struct LargeView: View {
    let entry: PrayerTimelineEntry

    var body: some View {
        if let next = entry.next, let today = entry.today {
            VStack(alignment: .leading, spacing: 10) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Grays Park Masjid")
                        .font(.system(size: 17, weight: .bold, design: .serif))
                        .foregroundStyle(Palette.cream)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                    Text(entry.gregorian)
                        .font(.system(size: 11))
                        .foregroundStyle(Palette.cream.opacity(0.75))
                        .lineLimit(1)
                    if !entry.hijri.isEmpty {
                        Text(entry.hijri)
                            .font(.system(size: 11, weight: .medium))
                            .foregroundStyle(Palette.gold)
                            .lineLimit(1)
                    }
                }

                HStack(alignment: .center, spacing: 12) {
                    VStack(alignment: .leading, spacing: 2) {
                        SectionLabel(text: entry.nextIsTomorrow ? "Tomorrow" : "Next Prayer")
                        Text(next.name)
                            .font(.system(size: 24, weight: .bold, design: .serif))
                            .foregroundStyle(Palette.cream)
                            .lineLimit(1)
                            .minimumScaleFactor(0.6)
                    }
                    Spacer(minLength: 4)
                    VStack(alignment: .trailing, spacing: 2) {
                        CountdownText(from: entry.date, to: next.adhan, size: 24)
                        Text(next.adhanLabel)
                            .font(.system(size: 12, weight: .semibold))
                            .monospacedDigit()
                            .foregroundStyle(Palette.cream.opacity(0.85))
                    }
                }
                .padding(.vertical, 10)
                .padding(.horizontal, 12)
                .background(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(Color.white.opacity(0.07))
                        .overlay(
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .stroke(Palette.gold.opacity(0.28), lineWidth: 1)
                        )
                )

                VStack(alignment: .leading, spacing: 0) {
                    ColumnHeader(showIqamah: true)
                    Spacer(minLength: 4)
                    ForEach(today.slots) { slot in
                        PrayerRow(slot: slot, isNext: slot.id == next.id)
                        if slot.id != today.slots.last?.id {
                            Rectangle()
                                .fill(Palette.cream.opacity(0.08))
                                .frame(height: 0.5)
                        }
                    }
                }

                Spacer(minLength: 0)

                if let sunrise = today.sunriseLabel {
                    HStack(spacing: 4) {
                        Image(systemName: "sunrise.fill")
                            .font(.system(size: 9))
                        Text("Sunrise \(sunrise)")
                            .font(.system(size: 10))
                        Spacer(minLength: 0)
                    }
                    .foregroundStyle(Palette.creamMuted)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .padding(14)
        } else {
            NoDataView()
        }
    }
}

// MARK: - Lock screen accessories
//
// Accessory families are rendered by the system with a vibrant/tinted
// treatment, so they deliberately carry no brand background.

struct AccessoryCircularView: View {
    let entry: PrayerTimelineEntry

    var body: some View {
        ZStack {
            AccessoryWidgetBackground()
            if let next = entry.next {
                VStack(spacing: 0) {
                    Text(next.shortName)
                        .font(.system(size: 11, weight: .semibold))
                        .lineLimit(1)
                        .minimumScaleFactor(0.6)
                    Text(timerInterval: entry.date...max(next.adhan, entry.date.addingTimeInterval(1)),
                         countsDown: true)
                        .font(.system(size: 12, weight: .medium))
                        .monospacedDigit()
                        .multilineTextAlignment(.center)
                        .lineLimit(1)
                        .minimumScaleFactor(0.4)
                }
                .padding(3)
            } else {
                Image(systemName: "moon.stars.fill")
            }
        }
    }
}

struct AccessoryRectangularView: View {
    let entry: PrayerTimelineEntry

    var body: some View {
        if let next = entry.next {
            VStack(alignment: .leading, spacing: 1) {
                Text(entry.nextIsTomorrow ? "TOMORROW" : "NEXT PRAYER")
                    .font(.system(size: 10, weight: .semibold))
                    .tracking(0.6)
                    .widgetAccessoryTint()
                HStack(spacing: 4) {
                    Text(next.name)
                        .font(.system(size: 15, weight: .bold))
                        .lineLimit(1)
                    Spacer(minLength: 2)
                    Text(next.adhanLabel)
                        .font(.system(size: 12, weight: .medium))
                        .monospacedDigit()
                        .lineLimit(1)
                }
                Text(timerInterval: entry.date...max(next.adhan, entry.date.addingTimeInterval(1)),
                     countsDown: true)
                    .font(.system(size: 12, weight: .medium))
                    .monospacedDigit()
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        } else {
            VStack(alignment: .leading, spacing: 1) {
                Text("Grays Park Masjid").font(.system(size: 13, weight: .semibold))
                Text("Open the app to load times").font(.system(size: 11))
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

struct AccessoryInlineView: View {
    let entry: PrayerTimelineEntry

    var body: some View {
        if let next = entry.next {
            // Single interpolated Text — inline accessories only render one
            // text run, and `\(date, style: .timer)` keeps it live.
            Text("\(next.name) \(next.adhan, style: .timer)")
        } else {
            Text("Grays Park Masjid")
        }
    }
}

extension View {
    /// Secondary emphasis that survives the lock screen's tint rendering mode.
    /// `widgetAccentable` is iOS 16+, so no availability check is needed at the
    /// 16.2 deployment target.
    func widgetAccessoryTint() -> some View {
        widgetAccentable().opacity(0.85)
    }
}

// MARK: - Entry view

struct PrayerWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family
    var entry: PrayerTimelineEntry

    var body: some View {
        switch family {
        case .accessoryCircular:
            AccessoryCircularView(entry: entry)
        case .accessoryRectangular:
            AccessoryRectangularView(entry: entry)
        case .accessoryInline:
            AccessoryInlineView(entry: entry)
        case .systemSmall:
            SmallView(entry: entry).brandWidgetBackground()
        case .systemLarge, .systemExtraLarge:
            LargeView(entry: entry).brandWidgetBackground()
        default:
            MediumView(entry: entry).brandWidgetBackground()
        }
    }
}

// MARK: - Widget

struct PrayerTimesWidget: Widget {
    let kind = PrayerService.widgetKind

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerProvider()) { entry in
            PrayerWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Prayer Times")
        .description("Next prayer countdown and today's timetable for Grays Park Masjid.")
        .supportedFamilies([
            .systemSmall,
            .systemMedium,
            .systemLarge,
            .accessoryCircular,
            .accessoryRectangular,
            .accessoryInline,
        ])
    }
}
