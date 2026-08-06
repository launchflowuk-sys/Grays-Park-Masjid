import Foundation

// MARK: - API contract
//
// The widget talks to the public, unauthenticated masjid API directly — there
// is no App Group and no shared UserDefaults involved.
//
//   GET https://graysparkmasjid.org.uk/api/prayer-times
//
// Returns a bare JSON array of rows (extra fields are ignored by Codable):
//
//   [{
//     "id":             "18c29dab-…",
//     "date":           "2026-07-15",   // local calendar date, yyyy-MM-dd
//     "fajrAdhan":      "05:10",        // all times "HH:mm", 24h
//     "fajrIqamah":     "05:30",
//     "dhuhrAdhan":     "13:00",
//     "dhuhrIqamah":    "13:20",
//     "asrAdhan":       "16:45",
//     "asrIqamah":      "17:00",
//     "maghribAdhan":   "20:05",
//     "maghribIqamah":  "20:10",
//     "ishaAdhan":      "21:30",
//     "ishaIqamah":     "21:45",
//     "jummahKhutbah":  "13:15",        // nullable
//     "jummahIqamah":   "13:30",        // nullable
//     "sunrise":        "06:40"         // nullable
//   }, …]

struct PrayerTimeDTO: Codable {
    let date: String
    let fajrAdhan: String
    let fajrIqamah: String?
    let dhuhrAdhan: String
    let dhuhrIqamah: String?
    let asrAdhan: String
    let asrIqamah: String?
    let maghribAdhan: String
    let maghribIqamah: String?
    let ishaAdhan: String
    let ishaIqamah: String?
    let sunrise: String?
}

// MARK: - Resolved models

struct PrayerSlot: Identifiable, Hashable {
    let id: String
    let name: String
    /// Absolute local instant of the adhan.
    let adhan: Date
    let adhanLabel: String
    let iqamahLabel: String?

    /// Short form for the tiny lock-screen circular accessory.
    var shortName: String {
        name == "Maghrib" ? "Mghrb" : name
    }
}

struct PrayerDay {
    /// Midnight (local) of this day.
    let start: Date
    let key: String
    let hijri: String
    let sunriseLabel: String?
    let slots: [PrayerSlot]
}

// MARK: - Hijri (computed natively in Swift)

/// Tabular Hijri (Islamic civil) calendar — a line-for-line port of
/// `utils/hijri.ts` so the app and the widget can never disagree by a day.
///
/// Deliberately NOT `Calendar(identifier: .islamicUmmAlQura)`: Umm al-Qura is
/// an observation-corrected calendar and drifts ±1 day from the arithmetic
/// 30-year cycle the JS side uses. Pure integer arithmetic only — no Foundation
/// calendar is involved.
enum HijriCalendar {
    /// Mirrors `HIJRI_DAY_OFFSET` in `utils/hijri.ts`. Keep the two in sync.
    static let dayOffset = 0

    /// Mirrors `HIJRI_MONTHS` in `utils/hijri.ts`.
    static let months = [
        "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
        "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
        "Ramadan", "Shawwal", "Dhul-Qa'dah", "Dhul-Hijjah",
    ]

    /// Julian Day Number of 1 Muharram 1 AH (civil epoch, 16 July 622 CE).
    private static let islamicEpochJDN = 1948440
    private static let daysPer30YearCycle = 10631

    /// Julian Day Number of 1970-01-01, the Unix epoch.
    ///
    /// `gregorianToJdn(1970, 1, 1)` in `utils/hijri.ts` evaluates to exactly
    /// this, so `unixEpochJDN + <whole local days since 1970>` is identical to
    /// running that function on `getFullYear()/getMonth()+1/getDate()` — and it
    /// avoids needing a Gregorian calendar to split the date apart.
    private static let unixEpochJDN = 2440588

    private static let secondsPerDay = 86400.0

    /// `Math.floor(a / b)` — floors toward negative infinity, unlike Swift's
    /// `/` which truncates toward zero. The JS algorithm relies on floor
    /// semantics, so every division below goes through here.
    private static func floorDiv(_ a: Int, _ b: Int) -> Int {
        let quotient = a / b
        if (a % b != 0) && ((a < 0) != (b < 0)) {
            return quotient - 1
        }
        return quotient
    }

    struct HijriDate {
        let day: Int
        /// 1-based month (1 = Muharram … 9 = Ramadan … 12 = Dhul-Hijjah)
        let month: Int
        let monthName: String
        let year: Int
    }

    /// The device-local civil day of `date`, expressed as a Julian Day Number.
    private static func localJDN(for date: Date) -> Int {
        let offset = Double(TimeZone.current.secondsFromGMT(for: date))
        let localSeconds = date.timeIntervalSince1970 + offset
        let days = Int(floor(localSeconds / secondsPerDay))
        return days + unixEpochJDN
    }

    /// Convert a local Gregorian date to its tabular Hijri equivalent.
    static func hijriDate(for date: Date) -> HijriDate {
        let jdn = localJDN(for: date) + dayOffset

        var l = jdn - islamicEpochJDN + 10632
        let n = floorDiv(l - 1, daysPer30YearCycle)
        l = l - daysPer30YearCycle * n + 354
        let j =
            floorDiv(10985 - l, 5316) * floorDiv(50 * l, 17719)
            + floorDiv(l, 5670) * floorDiv(43 * l, 15238)
        l =
            l
            - floorDiv(30 - j, 15) * floorDiv(17719 * j, 50)
            - floorDiv(j, 16) * floorDiv(15238 * j, 43)
            + 29
        let month = floorDiv(24 * l, 709)
        let day = l - floorDiv(709 * month, 24)
        let year = 30 * n + j - 30

        let name = (1...12).contains(month) ? months[month - 1] : ""
        return HijriDate(day: day, month: month, monthName: name, year: year)
    }

    /// e.g. "22 Safar 1448 AH" — byte-identical to `formatHijriDate()` in JS.
    static func string(for date: Date) -> String {
        let hijri = hijriDate(for: date)
        guard !hijri.monthName.isEmpty else { return "" }
        return "\(hijri.day) \(hijri.monthName) \(hijri.year) AH"
    }
}

// MARK: - Networking + on-disk cache

enum PrayerService {
    static let endpoint = URL(string: "https://graysparkmasjid.org.uk/api/prayer-times")!
    /// Must match `StaticConfiguration(kind:)` and stays stable across releases.
    static let widgetKind = "PrayerTimesWidget"

    private static let requestTimeout: TimeInterval = 15
    /// Days of history/future kept in the widget's own cache file.
    private static let cachePastDays = 1
    private static let cacheFutureDays = 60

    /// Fresh data when the network allows it, otherwise the last good cache.
    /// Returns an empty array only when neither is available.
    static func loadDays() async -> [PrayerDay] {
        if let rows = await fetchRows() {
            let trimmed = trim(rows)
            writeCache(trimmed)
            return resolveDays(trimmed)
        }
        if let cached = readCache() {
            return resolveDays(cached)
        }
        return []
    }

    /// Cache-only load, for the synchronous placeholder/snapshot paths.
    static func cachedDays() -> [PrayerDay] {
        guard let cached = readCache() else { return [] }
        return resolveDays(cached)
    }

    // MARK: Network

    private static func fetchRows() async -> [PrayerTimeDTO]? {
        var request = URLRequest(url: endpoint)
        request.timeoutInterval = requestTimeout
        request.cachePolicy = .reloadIgnoringLocalCacheData
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard
                let http = response as? HTTPURLResponse,
                (200..<300).contains(http.statusCode)
            else { return nil }
            let rows = try JSONDecoder().decode([PrayerTimeDTO].self, from: data)
            return rows.isEmpty ? nil : rows
        } catch {
            return nil
        }
    }

    // MARK: Cache (widget's own sandboxed container — no App Group)

    private static var cacheURL: URL? {
        guard
            let directory = FileManager.default.urls(
                for: .cachesDirectory, in: .userDomainMask
            ).first
        else { return nil }
        return directory.appendingPathComponent("gpm-prayer-times.json")
    }

    private static func writeCache(_ rows: [PrayerTimeDTO]) {
        guard let cacheURL, let data = try? JSONEncoder().encode(rows) else { return }
        try? data.write(to: cacheURL, options: .atomic)
    }

    private static func readCache() -> [PrayerTimeDTO]? {
        guard
            let cacheURL,
            let data = try? Data(contentsOf: cacheURL),
            let rows = try? JSONDecoder().decode([PrayerTimeDTO].self, from: data),
            !rows.isEmpty
        else { return nil }
        return rows
    }

    private static func trim(_ rows: [PrayerTimeDTO]) -> [PrayerTimeDTO] {
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        guard
            let lower = calendar.date(byAdding: .day, value: -cachePastDays, to: today),
            let upper = calendar.date(byAdding: .day, value: cacheFutureDays, to: today)
        else { return rows }

        return rows
            .filter { row in
                guard let day = PrayerFormatters.day.date(from: row.date) else { return false }
                return day >= lower && day <= upper
            }
            .sorted { $0.date < $1.date }
    }

    // MARK: Resolving

    private static func resolveDays(_ rows: [PrayerTimeDTO]) -> [PrayerDay] {
        rows
            .compactMap(resolveDay)
            .sorted { $0.start < $1.start }
    }

    private static func resolveDay(_ row: PrayerTimeDTO) -> PrayerDay? {
        guard let start = PrayerFormatters.day.date(from: row.date) else { return nil }

        let definitions: [(name: String, adhan: String, iqamah: String?)] = [
            (name: "Fajr", adhan: row.fajrAdhan, iqamah: row.fajrIqamah),
            (name: "Dhuhr", adhan: row.dhuhrAdhan, iqamah: row.dhuhrIqamah),
            (name: "Asr", adhan: row.asrAdhan, iqamah: row.asrIqamah),
            (name: "Maghrib", adhan: row.maghribAdhan, iqamah: row.maghribIqamah),
            (name: "Isha", adhan: row.ishaAdhan, iqamah: row.ishaIqamah),
        ]

        let slots: [PrayerSlot] = definitions.compactMap { definition -> PrayerSlot? in
            let name = definition.name
            let iqamah = definition.iqamah
            guard let instant = combine(day: start, time: definition.adhan) else { return nil }
            return PrayerSlot(
                id: "\(row.date)-\(name)",
                name: name,
                adhan: instant,
                adhanLabel: PrayerFormatters.clock.string(from: instant),
                iqamahLabel: iqamah.flatMap { label(day: start, time: $0) }
            )
        }

        guard !slots.isEmpty else { return nil }

        return PrayerDay(
            start: start,
            key: row.date,
            hijri: HijriCalendar.string(for: start),
            sunriseLabel: row.sunrise.flatMap { label(day: start, time: $0) },
            slots: slots.sorted { $0.adhan < $1.adhan }
        )
    }

    /// "HH:mm" (24h) applied to the given day, in the device's calendar.
    private static func combine(day: Date, time: String) -> Date? {
        let parts = time.split(separator: ":")
        guard
            parts.count >= 2,
            let hour = Int(parts[0]),
            let minute = Int(parts[1])
        else { return nil }
        return Calendar.current.date(
            bySettingHour: hour, minute: minute, second: 0, of: day
        )
    }

    private static func label(day: Date, time: String) -> String? {
        guard let date = combine(day: day, time: time) else { return nil }
        return PrayerFormatters.clock.string(from: date)
    }
}

// MARK: - Formatters

enum PrayerFormatters {
    static let day: DateFormatter = {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.calendar = Calendar(identifier: .gregorian)
        formatter.timeZone = .current
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter
    }()

    /// Respects the user's 12h / 24h preference.
    static let clock: DateFormatter = {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        formatter.dateStyle = .none
        return formatter
    }()

    static let weekday: DateFormatter = {
        let formatter = DateFormatter()
        formatter.setLocalizedDateFormatFromTemplate("EEEE d MMMM")
        return formatter
    }()
}

// MARK: - Queries + entry building

enum PrayerCalendar {
    static func day(containing date: Date, in days: [PrayerDay]) -> PrayerDay? {
        let key = PrayerFormatters.day.string(from: date)
        return days.first { $0.key == key } ?? days.first { $0.start >= date }
    }

    static func next(after date: Date, in days: [PrayerDay]) -> PrayerSlot? {
        for day in days {
            for slot in day.slots where slot.adhan > date {
                return slot
            }
        }
        return nil
    }

    /// Every prayer instant strictly after `date` and within `days` days.
    /// These become the TimelineProvider's entry boundaries — the live
    /// countdown is rendered by SwiftUI itself, so no per-second entries.
    static func boundaries(from date: Date, days: Int, in calendarDays: [PrayerDay]) -> [Date] {
        let limit = date.addingTimeInterval(TimeInterval(days) * 24 * 3600)
        return calendarDays
            .flatMap(\.slots)
            .map(\.adhan)
            .filter { $0 > date && $0 <= limit }
            .sorted()
    }

    static func entry(at date: Date, days: [PrayerDay]) -> PrayerTimelineEntry {
        let today = day(containing: date, in: days)
        let next = next(after: date, in: days)
        let isTomorrow: Bool = {
            guard let next, let today else { return false }
            return !Calendar.current.isDate(next.adhan, inSameDayAs: today.start)
        }()

        return PrayerTimelineEntry(
            date: date,
            hijri: today?.hijri ?? HijriCalendar.string(for: date),
            gregorian: PrayerFormatters.weekday.string(from: today?.start ?? date),
            today: today,
            next: next,
            nextIsTomorrow: isTomorrow,
            hasData: today != nil
        )
    }
}
