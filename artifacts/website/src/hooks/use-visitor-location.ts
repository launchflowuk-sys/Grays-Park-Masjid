import { useState, useEffect } from "react";

const MASJID_LAT = 51.4762;
const MASJID_LNG = 0.3247;
const LOCAL_RADIUS_KM = 32.187; // 20 miles

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
  | "idle"
  | "detecting"
  | "local"
  | "remote"
  | "denied"
  | "unavailable";

export type VisitorLocation = {
  status: LocationStatus;
  coords: GeolocationCoordinates | null;
  /** True when the user is within 20 miles of the masjid, or when location
   *  is unknown/unavailable — so we always default to showing masjid times
   *  unless we positively know the visitor is elsewhere. */
  isLocal: boolean;
};

export function useVisitorLocation(): VisitorLocation {
  const [status, setStatus] = useState<LocationStatus>("idle");
  const [coords, setCoords] = useState<GeolocationCoordinates | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unavailable");
      return;
    }

    setStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const distKm = haversineKm(MASJID_LAT, MASJID_LNG, latitude, longitude);
        setCoords(pos.coords);
        setStatus(distKm <= LOCAL_RADIUS_KM ? "local" : "remote");
      },
      () => {
        setStatus("denied");
      },
      { timeout: 8000, maximumAge: 300_000 },
    );
  }, []);

  const isLocal =
    status === "local" ||
    status === "idle" ||
    status === "detecting" ||
    status === "denied" ||
    status === "unavailable";

  return { status, coords, isLocal };
}
