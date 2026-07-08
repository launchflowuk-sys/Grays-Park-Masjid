import { useRef, useState } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ShareQRButtonProps {
  path: string;
  label?: string;
  variant?: "default" | "outline" | "ghost" | "icon";
  className?: string;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ShareQRButton({ path, label, variant = "outline", className }: ShareQRButtonProps) {
  const [open, setOpen] = useState(false);
  const hiddenCanvasRef = useRef<HTMLDivElement>(null);

  const url = `${window.location.origin}${path}`;
  const displayLabel = label ?? "Grays Park Masjid — Donate";
  const filename = `${slugify(label ?? "grays-park-masjid-donate")}-qr.png`;

  function handleDownload() {
    const sourceCanvas = hiddenCanvasRef.current?.querySelector("canvas");
    if (!sourceCanvas) return;

    const W = 680;
    const QR = 400;
    const qrX = (W - QR) / 2;

    // Layout heights
    const TOP_BAND = 60;
    const DECO_TOP = 32;
    const QR_MARGIN_TOP = 32;
    const QR_PAD = 24;
    const QR_BOX = QR + QR_PAD * 2;
    const QR_BOX_Y = TOP_BAND + DECO_TOP + QR_MARGIN_TOP;
    const QR_Y = QR_BOX_Y + QR_PAD;
    const TEXT_GAP = 32;
    const LINE_H = 52;
    const DOMAIN_H = 34;
    const DECO_BOT = 28;
    const BOTTOM_BAND = 48;

    const H = QR_BOX_Y + QR_BOX + TEXT_GAP + LINE_H + 10 + DOMAIN_H + DECO_BOT + BOTTOM_BAND;

    const out = document.createElement("canvas");
    out.width = W;
    out.height = H;

    const ctx = out.getContext("2d");
    if (!ctx) return;

    const GREEN = "#1B3D2F";
    const GREEN_DARK = "#132C21";
    const GOLD = "#C9A84C";
    const WHITE = "#FFFFFF";
    const CREAM = "#FAF8F3";

    // === Background gradient ===
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#1F4A38");
    grad.addColorStop(0.5, GREEN);
    grad.addColorStop(1, GREEN_DARK);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // === Top gold stripe ===
    ctx.fillStyle = GOLD;
    ctx.fillRect(0, 0, W, 5);

    // === Corner marks (futuristic bracket corners) ===
    function cornerBracket(x: number, y: number, flip: [number, number]) {
      const S = 28;
      const T = 3;
      ctx.fillStyle = GOLD;
      ctx.globalAlpha = 0.7;
      // horizontal arm
      ctx.fillRect(x, y, flip[0] * S, T);
      // vertical arm
      ctx.fillRect(flip[0] > 0 ? x : x - T, y, T, flip[1] * S);
      ctx.globalAlpha = 1;
    }
    const M = 22;
    cornerBracket(M, TOP_BAND + DECO_TOP, [1, 1]);
    cornerBracket(W - M, TOP_BAND + DECO_TOP, [-1, 1]);
    cornerBracket(M, H - BOTTOM_BAND - DECO_BOT, [1, -1]);
    cornerBracket(W - M, H - BOTTOM_BAND - DECO_BOT, [-1, -1]);

    // === Subtle dot grid pattern (top-right area) ===
    ctx.fillStyle = GOLD;
    ctx.globalAlpha = 0.08;
    for (let col = 0; col < 5; col++) {
      for (let row = 0; row < 5; row++) {
        ctx.beginPath();
        ctx.arc(W - 40 - col * 14, 80 + row * 14, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // === "SCAN TO DONATE" badge at top ===
    ctx.font = "bold 11px -apple-system, system-ui, sans-serif";
    ctx.letterSpacing = "0.15em";
    ctx.fillStyle = GOLD;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Gold pill background
    const badgeText = "SCAN TO DONATE";
    const badgeW = ctx.measureText(badgeText).width + 32;
    const badgeH = 24;
    const badgeX = W / 2 - badgeW / 2;
    const badgeY = TOP_BAND / 2 - badgeH / 2;
    ctx.fillStyle = GOLD;
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 12);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.font = "bold 11px -apple-system, system-ui, sans-serif";
    ctx.fillStyle = GOLD;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(badgeText, W / 2, TOP_BAND / 2);

    // === QR white box with rounded corners ===
    const boxX = (W - QR_BOX) / 2;
    ctx.fillStyle = WHITE;
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 6;
    ctx.beginPath();
    ctx.roundRect(boxX, QR_BOX_Y, QR_BOX, QR_BOX, 20);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Gold corner accents on QR box
    function qrCorner(cx: number, cy: number, dx: number, dy: number) {
      const CS = 16;
      const CT = 3;
      ctx.fillStyle = GOLD;
      ctx.globalAlpha = 0.6;
      ctx.fillRect(cx, cy, dx * CS, CT);
      ctx.fillRect(dx > 0 ? cx : cx - CT, cy, CT, dy * CS);
      ctx.globalAlpha = 1;
    }
    const bL = boxX + 8, bR = boxX + QR_BOX - 8;
    const bT = QR_BOX_Y + 8, bB = QR_BOX_Y + QR_BOX - 8;
    qrCorner(bL, bT, 1, 1);
    qrCorner(bR, bT, -1, 1);
    qrCorner(bL, bB, 1, -1);
    qrCorner(bR, bB, -1, -1);

    // === Draw QR code ===
    ctx.drawImage(sourceCanvas, qrX, QR_Y, QR, QR);

    // === Title text (bold, centered, word-wrapped) ===
    const titleY = QR_BOX_Y + QR_BOX + TEXT_GAP;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = WHITE;
    ctx.font = `bold 30px Georgia, 'Times New Roman', serif`;

    const maxW = W - 80;
    const words = displayLabel.split(" ");
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (ctx.measureText(test).width > maxW && cur) {
        lines.push(cur);
        cur = w;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
    lines.forEach((line, i) => ctx.fillText(line, W / 2, titleY + i * 38));

    // === Gold divider line ===
    const divY = titleY + lines.length * 38 + 12;
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 60, divY);
    ctx.lineTo(W / 2 + 60, divY);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // === Domain ===
    ctx.font = `500 15px -apple-system, system-ui, sans-serif`;
    ctx.fillStyle = GOLD;
    ctx.textBaseline = "top";
    ctx.fillText("graysparkmasjid.org.uk", W / 2, divY + 10);

    // === Bottom gold stripe ===
    ctx.fillStyle = GOLD;
    ctx.fillRect(0, H - 5, W, 5);

    // export
    const dataUrl = out.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
          className={cn(
            "inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-background/80 hover:bg-muted transition-colors",
            className,
          )}
          aria-label="Show QR code"
          title="Share via QR code"
        >
          <QrCode className="h-4 w-4 text-muted-foreground" />
        </button>
      ) : (
        <Button type="button" variant={variant} onClick={() => setOpen(true)} className={className}>
          <QrCode className="h-4 w-4 mr-2" />
          Share QR
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        {/* Fully custom content — no default white background */}
        <DialogContent
          className="p-0 border-0 shadow-2xl overflow-hidden max-w-[340px] rounded-2xl"
          style={{ background: "transparent" }}
        >
          {/* Card */}
          <div
            className="relative flex flex-col items-center px-6 pt-5 pb-5 rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(160deg, #1F4A38 0%, #1B3D2F 55%, #132C21 100%)",
            }}
          >
            {/* Top gold stripe */}
            <div className="absolute top-0 left-0 right-0 h-[4px]" style={{ background: "#C9A84C" }} />

            {/* Corner bracket marks */}
            {[
              "top-[14px] left-[14px]",
              "top-[14px] right-[14px] rotate-90",
              "bottom-[14px] left-[14px] -rotate-90",
              "bottom-[14px] right-[14px] rotate-180",
            ].map((pos, i) => (
              <svg
                key={i}
                className={`absolute ${pos} opacity-50`}
                width="20" height="20" viewBox="0 0 20 20" fill="none"
              >
                <path d="M2 18V2H18" stroke="#C9A84C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ))}

            {/* Badge */}
            <div
              className="mb-3 px-4 py-1 rounded-full text-[10px] font-bold tracking-[0.18em] uppercase"
              style={{ background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.35)", color: "#C9A84C" }}
            >
              Scan to Donate
            </div>

            {/* Campaign label */}
            {label && (
              <p
                className="text-center text-sm font-bold mb-3 leading-snug px-2"
                style={{
                  color: "#FAF8F3",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  textShadow: "0 1px 4px rgba(0,0,0,0.3)",
                }}
              >
                {label}
              </p>
            )}

            {/* QR white card */}
            <div
              className="relative rounded-xl p-4 mb-4"
              style={{
                background: "#FFFFFF",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,168,76,0.25)",
              }}
            >
              {/* Gold corner accents on inner box */}
              {[
                "top-1.5 left-1.5",
                "top-1.5 right-1.5 rotate-90",
                "bottom-1.5 left-1.5 -rotate-90",
                "bottom-1.5 right-1.5 rotate-180",
              ].map((pos, i) => (
                <svg
                  key={i}
                  className={`absolute ${pos} opacity-60`}
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                >
                  <path d="M1 11V1H11" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ))}
              <QRCodeSVG
                value={url}
                size={220}
                bgColor="#FFFFFF"
                fgColor="#1B3D2F"
                level="M"
                includeMargin={false}
              />
            </div>

            {/* Title / domain */}
            <p
              className="text-center font-bold text-base leading-tight mb-0.5 px-2"
              style={{
                color: "#FAF8F3",
                fontFamily: "Georgia, 'Times New Roman', serif",
                textShadow: "0 1px 6px rgba(0,0,0,0.4)",
              }}
            >
              Grays Park Masjid
            </p>

            {/* Gold rule */}
            <div className="flex items-center gap-2 my-1.5 w-full px-8">
              <div className="flex-1 h-px" style={{ background: "rgba(201,168,76,0.35)" }} />
              <div className="h-1 w-1 rounded-full" style={{ background: "#C9A84C", opacity: 0.6 }} />
              <div className="flex-1 h-px" style={{ background: "rgba(201,168,76,0.35)" }} />
            </div>

            <p className="text-[11px] tracking-widest font-medium uppercase mb-3" style={{ color: "#C9A84C", opacity: 0.9 }}>
              graysparkmasjid.org.uk
            </p>

            <p className="text-[11px] text-center mb-3" style={{ color: "rgba(250,248,243,0.5)" }}>
              Point your camera at the code to donate
            </p>

            {/* Download button */}
            <button
              type="button"
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-all active:scale-95"
              style={{
                background: "linear-gradient(135deg, #C9A84C 0%, #e0c068 50%, #C9A84C 100%)",
                color: "#1B3D2F",
                boxShadow: "0 4px 14px rgba(201,168,76,0.35)",
                minHeight: "44px",
              }}
            >
              <Download className="h-4 w-4" />
              Download PNG for Print
            </button>

            <p className="text-[10px] mt-2 text-center" style={{ color: "rgba(250,248,243,0.4)" }}>
              Flyers · Collection boxes · Notice boards
            </p>

            {/* Bottom stripe */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: "#C9A84C" }} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden high-res QR canvas for export */}
      <div ref={hiddenCanvasRef} className="hidden" aria-hidden="true">
        <QRCodeCanvas
          value={url}
          size={400}
          bgColor="#FFFFFF"
          fgColor="#1B3D2F"
          level="M"
          includeMargin={false}
        />
      </div>
    </>
  );
}
