import { useState, useEffect } from "react";

const MASJID_LAT = 51.4762;
const MASJID_LNG = 0.3247;

/** Precise 20-mile radius used for final GPS confirmation. */
const LOCAL_RADIUS_KM = 32.187;

/**
 * Coarse threshold for the IP pre-check. IP geolocation is less accurate
 * than GPS, so we use a wider margin (100 km). Anyone IP-geolocated within
 * 100 km of Grays Park is assumed local and never shown a browser prompt.
 * Only visitors IP-geolocated beyond 100 km proceed to the GPS step.
 */
const IP_LOCAL_THRESHOLD_KM = 100;

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
  | "idle"       // initial — IP check not yet complete
  | "detecting"  // GPS permission requested, awaiting user
  | "local"      // confirmed within LOCAL_RADIUS_KM
  | "remote"     // confirmed beyond LOCAL_RADIUS_KM
  | "denied"     // GPS permission denied (after IP said remote)
  | "unavailable"; // geolocation API unavailable or IP lookup failed

export type VisitorLocation = {
  status: LocationStatus;
  coords: GeolocationCoordinates | null;
  /** True unless we have a confirmed remote GPS fix.
   *  Defaults to true so the masjid card is always the safe fallback. */
  isLocal: boolean;
};

export function useVisitorLocation(): VisitorLocation {
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [coords, setCoords] = useState<GeolocationCoordinates | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    // Abort the IP lookup after 4 seconds so it never blocks the page.
    const ipTimeout = setTimeout(() => controller.abort(), 4000);

    async function run() {
      // ── Stage 1: coarse IP geolocation (no user permission required) ──
      try {
        const res = await fetch("https://ipapi.co/json/", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("ip-lookup-not-ok");

        const data = (await res.json()) as { latitude?: unknown; longitude?: unknown };
        const ipLat = typeof data.latitude === "number" ? data.latitude : null;
        const ipLng = typeof data.longitude === "number" ? data.longitude : null;

        if (ipLat === null || ipLng === null) throw new Error("ip-no-coords");

        const distKm = haversineKm(MASJID_LAT, MASJID_LNG, ipLat, ipLng);

        if (distKm <= IP_LOCAL_THRESHOLD_KM) {
          // Within 100 km by IP — treat as local; no browser GPS prompt.
          if (!cancelled) setStatus("local");
          return;
        }
        // Beyond 100 km — proceed to GPS for precise confirmation.
      } catch {
        // IP lookup failed, timed out, or was aborted.
        // Stay as "unavailable" (isLocal = true) — show masjid card safely.
        if (!cancelled) setStatus("unavailable");
        return;
      } finally {
        clearTimeout(ipTimeout);
      }

      // ── Stage 2: precise browser GPS (only for likely-remote visitors) ──
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

  const isLocal = status !== "remote";

  return { status, coords, isLocal };
}
