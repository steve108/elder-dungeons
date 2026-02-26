export type Locale = "pt" | "en";

export function getLocaleFromSearchParams(
  searchParams?: Record<string, string | string[] | undefined> | null
): Locale {
  const raw = searchParams?.lang;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "en" ? "en" : "pt";
}

export function withLang(path: string, locale: Locale): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}lang=${locale}`;
}
