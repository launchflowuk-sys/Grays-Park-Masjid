import SwiftUI
import WidgetKit

// The home/lock-screen widget and the next-prayer Live Activity both ship in
// this one extension — no second target, no extra provisioning profile.
// `PrayerLiveActivity` needs no availability guard because this target's
// IPHONEOS_DEPLOYMENT_TARGET is 16.2 (see expo-target.config.js).
@main
struct GraysParkMasjidWidgetBundle: WidgetBundle {
    var body: some Widget {
        PrayerTimesWidget()
        PrayerLiveActivity()
    }
}
