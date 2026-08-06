import ActivityKit
import Foundation

// ⚠️ KEEP IN SYNC — byte-identical twin at
//    targets/widget/PrayerActivityAttributes.swift
//
// The app (this pod) and the widget extension are separate Swift modules, so
// the type cannot literally be shared: Apple's own "add the file to both
// targets" recipe also produces two distinct module-qualified types.
// ActivityKit pairs them by the unqualified type name plus the Codable shape
// of `ContentState`, so both copies must stay identical.

/// Static, immutable description of the prayer a Live Activity is counting
/// down to. Changing any of these means ending the activity and requesting a
/// new one — ActivityKit attributes cannot be mutated in place.
@available(iOS 16.2, *)
struct PrayerActivityAttributes: ActivityAttributes {
    /// The part iOS re-renders while the activity is on screen.
    struct ContentState: Codable, Hashable {
        /// Start of the countdown range — when the activity was created or
        /// last refreshed.
        var startedAt: Date
        /// The adhan instant the countdown runs down to.
        var endsAt: Date
    }

    /// e.g. "Maghrib"
    var prayer: String
    /// Pre-formatted adhan clock time, e.g. "8:05 PM".
    var adhan: String
    /// Pre-formatted iqamah clock time, or nil when none is published.
    var iqamah: String?
}
