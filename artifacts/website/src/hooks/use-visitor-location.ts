import { useState, useEffect } from "react";

const MASJID_LAT = 51.4762;
const MASJID_LNG = 0.3247;

/** 20 miles — the required locality radius for both IP pre-check and GPS confirmation. */
const LOCAL_RADIUS_KM = 32.187;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export type LocationStatus =
  | "idle"        // initial — IP check not yet complete
  | "detecting"   // GPS permission requested, awaiting user
  | "local"       // confirmed within 20 miles
  | "remote"      // confirmed beyond 20 miles
  | "denied"      // GPS permission denied
  | "unavailable"; // Geolocation API not present

export type VisitorLocation = {
  status: LocationStatus;
  coords: GeolocationCoordinates | null;
  /** True unless we have a confirmed remote GPS fix.
   *  Defaults true so the masjid card is the safe fallback. */
  isLocal: boolean;
};

export function useVisitorLocation(): VisitorLocation {
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [coords, setCoords] = useState<GeolocationCoordinates | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    // Abort the IP lookup after 4 s so it never meaningfully delays the page.
    const ipTimeout = setTimeout(() => controller.abort(), 4000);

    async function run() {
      // ── Stage 1: silent IP geolocation (no browser permission required) ──
      // Uses the same 20-mile threshold as GPS.
      // - IP confirms local (≤ 32 km)  → mark local, skip GPS entirely (no prompt).
      // - IP says remote or fails       → proceed to GPS for a precise reading.
      let ipConfirmedLocal = false;

      try {
        const res = await fetch("https://ipapi.co/json/", {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = (await res.json()) as {
            latitude?: unknown;
            longitude?: unknown;
          };
          const ipLat =
            typeof data.latitude === "number" ? data.latitude : null;
          const ipLng =
            typeof data.longitude === "number" ? data.longitude : null;

          if (ipLat !== null && ipLng !== null) {
            const distKm = haversineKm(MASJID_LAT, MASJID_LNG, ipLat, ipLng);
            if (distKm <= LOCAL_RADIUS_KM) {
              ipConfirmedLocal = true;
            }
          }
        }
      } catch {
        // IP lookup failed or timed out — proceed to GPS anyway.
      } finally {
        clearTimeout(ipTimeout);
      }

      if (ipConfirmedLocal) {
        // No GPS prompt needed — user is demonstrably local.
        if (!cancelled) setStatus("local");
        return;
      }

      // ── Stage 2: browser GPS (for IP-remote or IP-failed visitors) ──
      if (cancelled) return;

      if (typeof navigator === "undefined" || !navigator.geolocation) {
        setStatus("unavailable");
        return;
      }

      setStatus("detecting");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return;
          const { latitude, longitude } = pos.coords;
          const distKm = haversineKm(MASJID_LAT, MASJID_LNG, latitude, longitude);
          setCoords(pos.coords);
          setStatus(distKm <= LOCAL_RADIUS_KM ? "local" : "remote");
        },
        () => {
          if (!cancelled) setStatus("denied");
        },
        { timeout: 8000, maximumAge: 300_000 },
      );
    }

    run();

    return () => {
      cancelled = true;
      clearTimeout(ipTimeout);
      controller.abort();
    };
  }, []);

  // isLocal is true for every state except a confirmed remote GPS fix.
  // This ensures the masjid card is always the safe default.
  const isLocal = status !== "remote";

  return { status, coords, isLocal };
}
