import { prisma } from "@/lib/prisma";
import type { Locale } from "@/lib/i18n";

export type UiTextMap = Map<string, string>;

export async function getUiTexts(namespaces: string[], locale: Locale): Promise<UiTextMap> {
  const db = prisma as any;
  const uniqueNamespaces = [...new Set(namespaces)];
  if (uniqueNamespaces.length === 0) return new Map();

  const rows: Array<{ namespace: string; key: string; locale: string; text: string }> = await db.$queryRawUnsafe(
    'SELECT "namespace", "key", "locale", "text" FROM "UiTextTranslation" WHERE "namespace" = ANY($1::varchar[]) AND "locale" = ANY($2::varchar[])',
    uniqueNamespaces,
    ["pt", locale]
  );

  const map: UiTextMap = new Map();

  for (const row of rows.filter((item) => item.locale === "pt")) {
    map.set(`${row.namespace}.${row.key}`, row.text);
  }

  for (const row of rows.filter((item) => item.locale === locale)) {
    map.set(`${row.namespace}.${row.key}`, row.text);
  }

  return map;
}

export function uiText(uiTexts: UiTextMap, namespace: string, key: string, fallback: string) {
  return uiTexts.get(`${namespace}.${key}`) ?? fallback;
}
