import ActivityKit
import ExpoModulesCore
import Foundation

/// Payload handed over from JS. Times arrive pre-formatted for display so the
/// widget extension never has to agree with JS about clock formatting.
struct PrayerActivityOptions: Record {
    @Field var prayer: String = ""
    @Field var adhan: String = ""
    @Field var iqamah: String? = nil
    /// Adhan instant, epoch milliseconds (`Date.getTime()`).
    @Field var endsAt: Double = 0
}

/// All ActivityKit access lives behind this type so every entry point can be
/// gated on a single `if #available(iOS 16.2, *)` check.
@available(iOS 16.2, *)
enum PrayerActivityController {
    /// How long past the adhan iOS may keep the activity on screen before
    /// treating its content as stale.
    private static let staleGrace: TimeInterval = 15 * 60

    static func areActivitiesEnabled() -> Bool {
        return ActivityAuthorizationInfo().areActivitiesEnabled
    }

    static func start(
        prayer: String,
        adhan: String,
        iqamah: String?,
        endsAt: Double
    ) async -> Bool {
        guard areActivitiesEnabled() else { return false }

        // Only ever one prayer countdown on screen at a time.
        await endAll()

        let attributes = PrayerActivityAttributes(
            prayer: prayer,
            adhan: adhan,
            iqamah: normalisedIqamah(iqamah)
        )
        let state = makeContentState(endsAt: endsAt)

        do {
            _ = try Activity<PrayerActivityAttributes>.request(
                attributes: attributes,
                content: makeContent(state),
                pushType: nil
            )
            return true
        } catch {
            return false
        }
    }

    static func update(
        prayer: String,
        adhan: String,
        iqamah: String?,
        endsAt: Double
    ) async -> Bool {
        let normalised = normalisedIqamah(iqamah)

        guard let activity = Activity<PrayerActivityAttributes>.activities.first else {
            return await start(prayer: prayer, adhan: adhan, iqamah: iqamah, endsAt: endsAt)
        }

        // Attributes are immutable once requested, so a different prayer (or
        // corrected times) means a brand-new activity rather than an update.
        if activity.attributes.prayer != prayer
            || activity.attributes.adhan != adhan
            || activity.attributes.iqamah != normalised {
            return await start(prayer: prayer, adhan: adhan, iqamah: iqamah, endsAt: endsAt)
        }

        await activity.update(makeContent(makeContentState(endsAt: endsAt)))
        return true
    }

    static func endAll() async {
        for activity in Activity<PrayerActivityAttributes>.activities {
            await activity.end(nil, dismissalPolicy: .immediate)
        }
    }

    // MARK: - Helpers

    private static func makeContent(
        _ state: PrayerActivityAttributes.ContentState
    ) -> ActivityContent<PrayerActivityAttributes.ContentState> {
        return ActivityContent(
            state: state,
            staleDate: state.endsAt.addingTimeInterval(staleGrace)
        )
    }

    private static func makeContentState(endsAt: Double) -> PrayerActivityAttributes.ContentState {
        let now = Date()
        let target = Date(timeIntervalSince1970: endsAt / 1000)
        // SwiftUI's timer text needs a forward range; never hand it an
        // inverted one if the clock has already rolled past the adhan.
        let safeTarget = target > now ? target : now.addingTimeInterval(1)
        return PrayerActivityAttributes.ContentState(startedAt: now, endsAt: safeTarget)
    }

    private static func normalisedIqamah(_ value: String?) -> String? {
        guard let value = value, !value.isEmpty else { return nil }
        return value
    }
}

/// Bridge for the next-prayer Live Activity.
///
/// Every function is a no-op returning `false` below iOS 16.2, so the JS side
/// can call it without version checks of its own.
public class LiveActivityModule: Module {
    public func definition() -> ModuleDefinition {
        Name("LiveActivity")

        Function("areActivitiesEnabled") { () -> Bool in
            guard #available(iOS 16.2, *) else { return false }
            return PrayerActivityController.areActivitiesEnabled()
        }

        AsyncFunction("startPrayerActivity") { (options: PrayerActivityOptions, promise: Promise) in
            guard #available(iOS 16.2, *) else {
                promise.resolve(false)
                return
            }
            // Read the record up front so only plain values cross into the task.
            let prayer = options.prayer
            let adhan = options.adhan
            let iqamah = options.iqamah
            let endsAt = options.endsAt

            Task { @MainActor in
                let started = await PrayerActivityController.start(
                    prayer: prayer, adhan: adhan, iqamah: iqamah, endsAt: endsAt
                )
                promise.resolve(started)
            }
        }

        AsyncFunction("updatePrayerActivity") { (options: PrayerActivityOptions, promise: Promise) in
            guard #available(iOS 16.2, *) else {
                promise.resolve(false)
                return
            }
            let prayer = options.prayer
            let adhan = options.adhan
            let iqamah = options.iqamah
            let endsAt = options.endsAt

            Task { @MainActor in
                let updated = await PrayerActivityController.update(
                    prayer: prayer, adhan: adhan, iqamah: iqamah, endsAt: endsAt
                )
                promise.resolve(updated)
            }
        }

        AsyncFunction("endPrayerActivity") { (promise: Promise) in
            guard #available(iOS 16.2, *) else {
                promise.resolve(false)
                return
            }
            Task { @MainActor in
                await PrayerActivityController.endAll()
                promise.resolve(true)
            }
        }
    }
}
