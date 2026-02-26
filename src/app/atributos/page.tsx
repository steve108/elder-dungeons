import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getLocaleFromSearchParams, withLang } from "@/lib/i18n";
import { PublicShell } from "@/components/public-shell";
import { getUiTexts, uiText } from "@/lib/ui-text";

type AttributeCard = {
  id: number;
  name: string;
  description: string | null;
  fullDescription?: string | null;
  translations?: Array<{
    locale: string;
    name?: string | null;
    description: string | null;
    fullDescription?: string | null;
  }>;
  subAttributes: Array<{
    id: number;
    name: string;
    description: string | null;
    fullDescription?: string | null;
    translations?: Array<{
      locale: string;
      name?: string | null;
      description: string | null;
      fullDescription?: string | null;
    }>;
  }>;
};

function pickLocalizedText(
  baseName: string,
  baseDescription: string | null | undefined,
  baseFullDescription: string | null | undefined,
  translations: Array<{ locale: string; name?: string | null; description: string | null; fullDescription?: string | null }> | undefined,
  locale: "pt" | "en"
) {
  const exact = translations?.find((item) => item.locale === locale);
  const pt = translations?.find((item) => item.locale === "pt");
  const name = exact?.name ?? pt?.name ?? baseName;
  const description = exact?.description ?? pt?.description ?? baseDescription ?? null;
  const fullDescription = exact?.fullDescription ?? pt?.fullDescription ?? baseFullDescription ?? null;
  return { name, description, fullDescription };
}

export default async function AtributosPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = getLocaleFromSearchParams((await searchParams) ?? {});
  const isEn = locale === "en";
  const uiTexts = await getUiTexts(["attributes-list"], locale);

  const db = prisma as any;
  const attributes: AttributeCard[] = await db.attributeDefinition.findMany({
    orderBy: { id: "asc" },
    include: {
      subAttributes: {
        orderBy: { id: "asc" },
      },
    },
  });

  const attributeIds = attributes.map((item) => item.id);
  const subAttributeIds = attributes.flatMap((item) => item.subAttributes.map((sub) => sub.id));

  const columnCheckRows: Array<{ has_name_column: boolean }> = await db.$queryRawUnsafe(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'AttributeDefinitionTranslation'
        AND column_name = 'name'
    ) AS has_name_column
  `);
  const hasNameColumn = Boolean(columnCheckRows[0]?.has_name_column);

  const attributeTranslations: Array<{
    attribute_id: number;
    locale: string;
    name: string | null;
    description: string | null;
    full_description: string | null;
  }> =
    attributeIds.length > 0
      ? await db.$queryRawUnsafe(
          hasNameColumn
            ? 'SELECT "attribute_id", "locale", "name", "description", "full_description" FROM "AttributeDefinitionTranslation" WHERE "attribute_id" = ANY($1::int[])'
            : 'SELECT "attribute_id", "locale", NULL::text AS "name", "description", "full_description" FROM "AttributeDefinitionTranslation" WHERE "attribute_id" = ANY($1::int[])',
          attributeIds
        )
      : [];

  const subAttributeTranslations: Array<{
    sub_attribute_id: number;
    locale: string;
    name: string | null;
    description: string | null;
    full_description: string | null;
  }> =
    subAttributeIds.length > 0
      ? await db.$queryRawUnsafe(
          hasNameColumn
            ? 'SELECT "sub_attribute_id", "locale", "name", "description", "full_description" FROM "SubAttributeDefinitionTranslation" WHERE "sub_attribute_id" = ANY($1::int[])'
            : 'SELECT "sub_attribute_id", "locale", NULL::text AS "name", "description", "full_description" FROM "SubAttributeDefinitionTranslation" WHERE "sub_attribute_id" = ANY($1::int[])',
          subAttributeIds
        )
      : [];

  const attributeTranslationsById = new Map<number, Array<{ locale: string; name: string | null; description: string | null; fullDescription: string | null }>>();
  for (const row of attributeTranslations) {
    const current = attributeTranslationsById.get(row.attribute_id) ?? [];
    current.push({
      locale: row.locale,
      name: row.name,
      description: row.description,
      fullDescription: row.full_description,
    });
    attributeTranslationsById.set(row.attribute_id, current);
  }

  const subAttributeTranslationsById = new Map<number, Array<{ locale: string; name: string | null; description: string | null; fullDescription: string | null }>>();
  for (const row of subAttributeTranslations) {
    const current = subAttributeTranslationsById.get(row.sub_attribute_id) ?? [];
    current.push({
      locale: row.locale,
      name: row.name,
      description: row.description,
      fullDescription: row.full_description,
    });
    subAttributeTranslationsById.set(row.sub_attribute_id, current);
  }

  return (
    <PublicShell
      locale={locale}
      currentPath="/atributos"
      title={uiText(uiTexts, "attributes-list", "title", isEn ? "Attributes" : "Atributos")}
      description={
        uiText(
          uiTexts,
          "attributes-list",
          "description",
          isEn
            ? "Attributes represent your character's core capabilities. Each one has derived subattributes that detail practical effects in combat, resilience, skills, magic, and interactions."
            : "Os atributos representam as capacidades básicas do personagem. Cada um possui subatributos que detalham efeitos práticos em combate, resistência, perícias, magia e interações."
        )
      }
    >
      <div>
        <p className="text-xs uppercase tracking-widest text-zinc-400">{uiText(uiTexts, "attributes-list", "badge", isEn ? "Character creation" : "Criação de personagem")}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {attributes.map((attribute) => {
            const slug = attribute.name.toLowerCase();
            const localizedAttribute = pickLocalizedText(
              attribute.name,
              attribute.description,
              attribute.fullDescription,
              attributeTranslationsById.get(attribute.id),
              locale
            );
            return (
              <article key={attribute.id} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-zinc-100">{localizedAttribute.name}</h2>
                  <Link
                    href={withLang(`/atributos/${slug}`, locale)}
                    className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-100 hover:bg-zinc-800"
                  >
                    {uiText(uiTexts, "attributes-list", "openDerived", isEn ? "Open details" : "Abrir detalhes")}
                  </Link>
                </div>
                <p className="mt-3 text-sm text-zinc-400">
                  {localizedAttribute.fullDescription ||
                    localizedAttribute.description ||
                    uiText(
                      uiTexts,
                      "attributes-list",
                      "fallbackAttributeDesc",
                      isEn
                        ? "This attribute defines a core part of character performance."
                        : "Este atributo define parte central do desempenho do personagem."
                    )}
                </p>
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">{uiText(uiTexts, "attributes-list", "subattributes", isEn ? "Subattributes" : "Subatributos")}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-300">
                    {attribute.subAttributes.map((subAttribute) => {
                      const localizedSubAttribute = pickLocalizedText(
                        subAttribute.name,
                        subAttribute.description,
                        subAttribute.fullDescription,
                        subAttributeTranslationsById.get(subAttribute.id),
                        locale
                      );
                      return (
                        <li key={subAttribute.id}>
                          <span className="font-medium text-zinc-100">{localizedSubAttribute.name}</span>
                          {localizedSubAttribute.description ? <span className="text-zinc-400"> — {localizedSubAttribute.description}</span> : null}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </PublicShell>
  );
}
