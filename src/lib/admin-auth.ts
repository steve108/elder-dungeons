export const ADMIN_USERNAME = "steve";
export const ADMIN_PASSWORD = "123456";
export const ADMIN_SESSION_KEY = "elder_admin_session";
export const ADMIN_BASIC_KEY = "elder_admin_basic";

export function isValidAdminLogin(username: string, password: string): boolean {
  return username.trim().toLowerCase() === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function buildAdminBasicHeader(username: string, password: string): string {
  const raw = `${username}:${password}`;
  const encoded =
    typeof window !== "undefined" ? window.btoa(raw) : Buffer.from(raw, "utf8").toString("base64");
  return `Basic ${encoded}`;
}
