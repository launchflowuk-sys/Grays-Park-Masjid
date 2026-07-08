import { useRef, useState, useCallback } from "react";
import { useUpload } from "@workspace/object-storage-web";
import { Button } from "@/components/ui/button";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  aspectHint?: string;
  disabled?: boolean;
  className?: string;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export function ImageUpload({ value, onChange, aspectHint, disabled, className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { uploadFile, isUploading, progress, error: uploadError } = useUpload({
    onSuccess: (res) => {
      // objectPath may start with "/objects/..." — strip any leading slashes before
      // joining so we never produce a double-slash URL like /api/storage/objects//objects/…
      const cleanPath = res.objectPath.replace(/^\/+/, "");
      onChange(`/api/storage/objects/${cleanPath}`);
    },
  });

  const handleFile = useCallback(
    async (file: File) => {
      setValidationError(null);
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setValidationError("Only JPG, PNG, or WebP files are accepted.");
        return;
      }
      if (file.size > MAX_SIZE) {
        setValidationError("File must be 5 MB or smaller.");
        return;
      }
      await uploadFile(file);
    },
    [uploadFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const displayError = validationError ?? (uploadError?.message ?? null);
  const isDisabled = disabled || isUploading;

  return (
    <div className={cn("space-y-2", className)}>
      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img src={value} alt="Uploaded image" className="w-full aspect-video object-cover" />
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="absolute top-2 right-2 h-7 w-7"
            onClick={() => onChange("")}
            disabled={isDisabled}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload image"
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors cursor-pointer",
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40",
            isDisabled && "pointer-events-none opacity-60",
          )}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
          <div>
            <p className="text-sm font-medium">
              {isUploading ? "Uploading…" : "Drop image here or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG or WebP · max 5 MB</p>
            {aspectHint && (
              <p className="text-xs text-muted-foreground/70 mt-1">{aspectHint}</p>
            )}
          </div>
        </div>
      )}

      {isUploading && (
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {value && !isUploading && (
        <label className="block">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={isDisabled}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full pointer-events-none"
            disabled={isDisabled}
            asChild
          >
            <span>
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Replace image
            </span>
          </Button>
        </label>
      )}

      {!value && (
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={isDisabled}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      )}

      {displayError && (
        <p className="text-xs text-destructive">{displayError}</p>
      )}
    </div>
  );
}
