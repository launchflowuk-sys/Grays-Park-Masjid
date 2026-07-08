import { useRef, useState } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

    const QR_SIZE = 512;
    const H_PAD = 48;
    const V_PAD_TOP = 48;
    const LABEL_HEIGHT = 72;

    const out = document.createElement("canvas");
    out.width = QR_SIZE + H_PAD * 2;
    out.height = QR_SIZE + V_PAD_TOP + H_PAD + LABEL_HEIGHT;

    const ctx = out.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, out.width, out.height);

    ctx.drawImage(sourceCanvas, H_PAD, V_PAD_TOP, QR_SIZE, QR_SIZE);

    const centerX = out.width / 2;
    const labelY = V_PAD_TOP + QR_SIZE + 32;

    ctx.fillStyle = "#1B3D2F";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const maxWidth = QR_SIZE + H_PAD;

    ctx.font = "bold 26px Georgia, 'Times New Roman', serif";
    const words = displayLabel.split(" ");
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);

    lines.forEach((line, i) => {
      ctx.fillText(line, centerX, labelY + i * 32);
    });

    ctx.font = "18px Georgia, 'Times New Roman', serif";
    ctx.fillStyle = "#6b6b63";
    ctx.fillText("graysparkmasjid.org.uk", centerX, labelY + lines.length * 32 + 8);

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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
          className={cn(
            "inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-background/80 hover:bg-muted transition-colors",
            className
          )}
          aria-label="Show QR code"
          title="Share via QR code"
        >
          <QrCode className="h-4 w-4 text-muted-foreground" />
        </button>
      ) : (
        <Button
          type="button"
          variant={variant}
          onClick={() => setOpen(true)}
          className={className}
        >
          <QrCode className="h-4 w-4 mr-2" />
          Share QR
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Scan to Donate</DialogTitle>
          </DialogHeader>

          {label && (
            <p className="text-sm text-muted-foreground -mt-2 mb-1">{label}</p>
          )}

          <div className="flex justify-center py-4">
            <div className="p-4 bg-white rounded-2xl shadow-inner border border-border inline-block">
              <QRCodeSVG
                value={url}
                size={256}
                bgColor="#ffffff"
                fgColor="#1B3D2F"
                level="M"
                includeMargin={false}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Point your camera at the code above to open this page on your phone
          </p>

          <Button
            type="button"
            variant="outline"
            onClick={handleDownload}
            className="w-full mt-3 min-h-[44px]"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PNG
          </Button>

          <p className="text-xs text-muted-foreground pb-1">
            Print on flyers, collection boxes &amp; notice boards
          </p>

          {/* Hidden high-res canvas used for PNG export only */}
          <div ref={hiddenCanvasRef} className="hidden" aria-hidden="true">
            <QRCodeCanvas
              value={url}
              size={512}
              bgColor="#ffffff"
              fgColor="#1B3D2F"
              level="M"
              includeMargin={false}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
