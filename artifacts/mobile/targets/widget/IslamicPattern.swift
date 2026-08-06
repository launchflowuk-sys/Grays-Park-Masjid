import SwiftUI

/// Brand palette — matches the app icon and `constants/Colors`.
enum Palette {
    /// Deep masjid green (#053317)
    static let green = Color(red: 0x05 / 255, green: 0x33 / 255, blue: 0x17 / 255)
    /// Slightly darker green used for the gradient tail (#02200E)
    static let greenDeep = Color(red: 0x02 / 255, green: 0x20 / 255, blue: 0x0E / 255)
    /// Gold accent (#D4A02C)
    static let gold = Color(red: 0xD4 / 255, green: 0xA0 / 255, blue: 0x2C / 255)
    /// Cream / off-white body text (#F7F2E6)
    static let cream = Color(red: 0xF7 / 255, green: 0xF2 / 255, blue: 0xE6 / 255)
    /// Muted cream for secondary labels
    static let creamMuted = Color(red: 0xF7 / 255, green: 0xF2 / 255, blue: 0xE6 / 255)
        .opacity(0.62)
}

/// An 8-point-star (khatim) tessellation drawn entirely with SwiftUI `Canvas`
/// — no image assets, so it scales to every widget family for free.
///
/// The lattice is two interleaved layers: the octagram `{8/3}` star polygon and
/// a smaller rotated square, offset on alternate rows so the motif tiles
/// continuously rather than sitting on an obvious grid.
struct IslamicPatternView: View {
    var color: Color = .white
    var opacity: Double = 0.08
    var cell: CGFloat = 46
    var lineWidth: CGFloat = 0.9

    var body: some View {
        Canvas { context, size in
            guard cell > 0 else { return }
            let columns = Int(ceil(size.width / cell)) + 2
            let rows = Int(ceil(size.height / cell)) + 2

            var stars = Path()
            var diamonds = Path()

            for row in 0..<rows {
                for column in 0..<columns {
                    let offset: CGFloat = row.isMultiple(of: 2) ? 0 : cell / 2
                    let center = CGPoint(
                        x: CGFloat(column) * cell + offset - cell / 2,
                        y: CGFloat(row) * cell - cell / 2
                    )
                    stars.addPath(Self.octagram(center: center, radius: cell * 0.44))
                    diamonds.addPath(
                        Self.polygon(center: center, radius: cell * 0.17, sides: 4)
                    )
                }
            }

            context.stroke(
                stars,
                with: .color(color.opacity(opacity)),
                lineWidth: lineWidth
            )
            context.stroke(
                diamonds,
                with: .color(color.opacity(opacity * 0.75)),
                lineWidth: lineWidth
            )
        }
        .allowsHitTesting(false)
    }

    /// The classic `{8/3}` star polygon — 8 vertices joined every 3rd step.
    static func octagram(center: CGPoint, radius: CGFloat) -> Path {
        var path = Path()
        let points = vertices(center: center, radius: radius, count: 8)
        var index = 0
        path.move(to: points[0])
        for _ in 0..<8 {
            index = (index + 3) % 8
            path.addLine(to: points[index])
        }
        path.closeSubpath()
        return path
    }

    static func polygon(center: CGPoint, radius: CGFloat, sides: Int) -> Path {
        var path = Path()
        let points = vertices(center: center, radius: radius, count: sides)
        guard let first = points.first else { return path }
        path.move(to: first)
        for point in points.dropFirst() {
            path.addLine(to: point)
        }
        path.closeSubpath()
        return path
    }

    private static func vertices(center: CGPoint, radius: CGFloat, count: Int) -> [CGPoint] {
        (0..<count).map { index in
            let angle = (Double(index) / Double(count)) * 2 * .pi - .pi / 2
            return CGPoint(
                x: center.x + radius * CGFloat(cos(angle)),
                y: center.y + radius * CGFloat(sin(angle))
            )
        }
    }
}

/// The fixed widget canvas: deep green gradient + the geometric lattice.
/// Widgets get a fixed background, so this is deliberately identical in light
/// and dark appearance.
struct BrandBackground: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Palette.green, Palette.greenDeep],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            IslamicPatternView(color: Palette.gold, opacity: 0.09, cell: 46)
            IslamicPatternView(color: Palette.cream, opacity: 0.05, cell: 92, lineWidth: 0.7)
        }
    }
}

extension View {
    /// `containerBackground` is iOS 17+; fall back to a plain background on 16.x
    /// so the widget still renders on the 16.2 deployment target.
    @ViewBuilder
    func brandWidgetBackground() -> some View {
        if #available(iOSApplicationExtension 17.0, iOS 17.0, *) {
            containerBackground(for: .widget) { BrandBackground() }
        } else {
            background(BrandBackground())
        }
    }
}
