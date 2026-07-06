import { useAuth } from "./auth-context";

export type AdminRole =
  | "super_admin"
  | "masjid_admin"
  | "education_admin"
  | "donation_admin"
  | "content_editor"
  | "read_only";

export const MASJID_WRITE: AdminRole[] = ["super_admin", "masjid_admin"];
export const CONTENT_WRITE: AdminRole[] = ["super_admin", "masjid_admin", "content_editor"];
export const EDUCATION_WRITE: AdminRole[] = ["super_admin", "education_admin"];
export const DONATION_WRITE: AdminRole[] = ["super_admin", "donation_admin"];
export const SUPER_ADMIN_ONLY: AdminRole[] = ["super_admin"];

/**
 * Returns whether the currently logged-in admin has one of the given roles.
 * Mirrors the write-role checks enforced server-side in artifacts/api-server/src/lib/roles.ts —
 * keep these lists in sync with the backend.
 */
export function useCanWrite(allowedRoles: AdminRole[]): boolean {
  const { admin } = useAuth();
  if (!admin) return false;
  return allowedRoles.includes(admin.role as AdminRole);
}
