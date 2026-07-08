import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode } from "lucide-react";
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

export function ShareQRButton({ path, label, variant = "outline", className }: ShareQRButtonProps) {
  const [open, setOpen] = useState(false);

  const url = `${window.location.origin}${path}`;

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
          <p className="text-xs text-muted-foreground pb-2">
            Point your camera at the code above to open this page on your phone
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
