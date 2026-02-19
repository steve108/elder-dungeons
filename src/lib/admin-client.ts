import { ADMIN_BASIC_KEY } from "@/lib/admin-auth";

export function getAdminAuthHeader(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ADMIN_BASIC_KEY);
}
