import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

type State = "loading" | "success" | "already" | "error";

export default function UnsubscribePage() {
  const [, navigate] = useLocation();
  const [state, setState] = useState<State>("loading");

  const token = new URLSearchParams(window.location.search).get("token");

  useEffect(() => {
    if (!token) {
      setState("error");
      return;
    }
    const baseUrl = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
    fetch(`${baseUrl}/api/unsubscribe?token=${encodeURIComponent(token)}`, { method: "POST" })
      .then(async (res) => {
        if (res.ok) {
          const body = await res.json().catch(() => ({}));
          setState(body.alreadyOptedOut ? "already" : "success");
        } else {
          setState("error");
        }
      })
      .catch(() => setState("error"));
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FAF8F3" }}>
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center">
          {state === "loading" && (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto" style={{ color: "#1B3D2F" }} />
              <p className="text-muted-foreground">Updating your preferences…</p>
            </div>
          )}

          {state === "success" && (
            <div className="space-y-5">
              <div
                className="mx-auto h-16 w-16 rounded-full flex items-center justify-center"
                style={{ background: "rgba(27,61,47,0.1)" }}
              >
                <CheckCircle2 className="h-8 w-8" style={{ color: "#1B3D2F" }} />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold mb-2" style={{ color: "#1B3D2F" }}>
                  You've been unsubscribed
                </h1>
                <p className="text-muted-foreground leading-relaxed">
                  You will no longer receive campaign emails from Grays Park Masjid. If you change
                  your mind, please contact us and we'll re-add you.
                </p>
              </div>
              <div
                className="rounded-xl p-5 text-sm text-left space-y-2"
                style={{ background: "rgba(27,61,47,0.06)", border: "1px solid rgba(27,61,47,0.12)" }}
              >
                <p className="font-semibold" style={{ color: "#1B3D2F" }}>
                  Note
                </p>
                <p className="text-muted-foreground">
                  You may still receive transactional emails about your membership application or
                  responses to enquiries you've submitted.
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate("/")}>
                Return to homepage
              </Button>
            </div>
          )}

          {state === "already" && (
            <div className="space-y-5">
              <div
                className="mx-auto h-16 w-16 rounded-full flex items-center justify-center"
                style={{ background: "rgba(201,168,76,0.12)" }}
              >
                <Mail className="h-8 w-8" style={{ color: "#C9A84C" }} />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold mb-2" style={{ color: "#1B3D2F" }}>
                  Already unsubscribed
                </h1>
                <p className="text-muted-foreground">
                  Your email address is already opted out of campaign emails. No further action is
                  needed.
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate("/")}>
                Return to homepage
              </Button>
            </div>
          )}

          {state === "error" && (
            <div className="space-y-5">
              <div
                className="mx-auto h-16 w-16 rounded-full flex items-center justify-center"
                style={{ background: "rgba(220,38,38,0.08)" }}
              >
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold mb-2" style={{ color: "#1B3D2F" }}>
                  Link not recognised
                </h1>
                <p className="text-muted-foreground">
                  This unsubscribe link is invalid or has expired. If you'd like to opt out, please
                  contact us directly.
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate("/contact")}>
                Contact us
              </Button>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
