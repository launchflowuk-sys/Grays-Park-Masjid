import type { AdminRole } from "@workspace/db";

export const ALL_ROLES: AdminRole[] = [
  "super_admin",
  "masjid_admin",
  "education_admin",
  "donation_admin",
  "content_editor",
  "read_only",
];

export const MASJID_WRITE: AdminRole[] = ["super_admin", "masjid_admin"];
export const CONTENT_WRITE: AdminRole[] = ["super_admin", "masjid_admin", "content_editor"];
export const EDUCATION_WRITE: AdminRole[] = ["super_admin", "education_admin"];
export const DONATION_WRITE: AdminRole[] = ["super_admin", "donation_admin"];
export const SUPER_ADMIN_ONLY: AdminRole[] = ["super_admin"];
