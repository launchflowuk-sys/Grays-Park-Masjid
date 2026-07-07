import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LifeBuoy, CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ISSUE_TYPES = [
  { value: "website_error", label: "Website Error", desc: "Something on the public site is broken" },
  { value: "dashboard_issue", label: "Dashboard Issue", desc: "Problem inside this admin panel" },
  { value: "feature_request", label: "Feature Request", desc: "Request a new feature or improvement" },
  { value: "other", label: "Other", desc: "Anything else you need help with" },
];

const URGENCY_LEVELS = [
  { value: "low", label: "Low", colour: "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200" },
  { value: "medium", label: "Medium", colour: "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200" },
  { value: "high", label: "High", colour: "bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200" },
  { value: "critical", label: "Critical", colour: "bg-red-100 text-red-800 border-red-300 hover:bg-red-200" },
];

type Status = "idle" | "sending" | "success" | "error";

export function SupportRequestModal({ open, onOpenChange }: Props) {
  const [issueType, setIssueType] = useState<string>("");
  const [urgency, setUrgency] = useState<string>("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  function reset() {
    setIssueType("");
    setUrgency("");
    setMessage("");
    setStatus("idle");
    setErrorMsg("");
  }

  function handleClose(v: boolean) {
    if (!v) reset();
    onOpenChange(v);
  }

  async function handleSubmit() {
    if (!issueType || !urgency || !message.trim()) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/support-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ issueType, urgency, message }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as any).error ?? "Failed to send.");
      }
      setStatus("success");
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  const canSubmit = !!issueType && !!urgency && message.trim().length >= 10;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif text-xl">
            <LifeBuoy className="h-5 w-5 text-primary" />
            Request Support
          </DialogTitle>
          <DialogDescription>
            A message will be sent directly to the LaunchFlow support team.
          </DialogDescription>
        </DialogHeader>

        {status === "success" ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
            <p className="font-medium text-lg">Support request sent!</p>
            <p className="text-muted-foreground text-sm">
              The team at LaunchFlow will review your request and get back to you shortly.
            </p>
            <Button onClick={() => handleClose(false)} className="mt-2">Close</Button>
          </div>
        ) : (
          <div className="space-y-5 pt-1">
            <div>
              <Label className="text-sm font-medium mb-2 block">Issue Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {ISSUE_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setIssueType(t.value)}
                    className={`text-left p-3 rounded-lg border transition-all text-sm ${
                      issueType === t.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-background hover:border-primary/40 hover:bg-muted/40"
                    }`}
                  >
                    <p className="font-medium">{t.label}</p>
                    <p className="text-muted-foreground text-xs mt-0.5 leading-snug">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Urgency Level</Label>
              <div className="flex gap-2 flex-wrap">
                {URGENCY_LEVELS.map((u) => (
                  <button
                    key={u.value}
                    type="button"
                    onClick={() => setUrgency(u.value)}
                    className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-all ${u.colour} ${
                      urgency === u.value ? "ring-2 ring-offset-1 ring-current" : "opacity-70"
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="support-message" className="text-sm font-medium mb-2 block">
                Message <span className="text-muted-foreground font-normal">(min. 10 characters)</span>
              </Label>
              <Textarea
                id="support-message"
                rows={4}
                placeholder="Please describe the issue in as much detail as possible…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="resize-none"
              />
            </div>

            {status === "error" && (
              <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" onClick={() => handleClose(false)} disabled={status === "sending"}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || status === "sending"}
                data-testid="button-send-support-request"
              >
                {status === "sending" ? "Sending…" : "Send Request"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
