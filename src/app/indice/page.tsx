import Link from "next/link";
import { getLocaleFromSearchParams, withLang } from "@/lib/i18n";
import { PublicShell } from "@/components/public-shell";
import { getUiTexts, uiText } from "@/lib/ui-text";

export default async function IndicePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = getLocaleFromSearchParams((await searchParams) ?? {});
  const isEn = locale === "en";
  const uiTexts = await getUiTexts(["index"], locale);
  const sectionsMeta = [
    { key: "attributes", href: "/atributos" },
    { key: "race", href: "/racas" },
    { key: "class" },
    { key: "kit" },
    { key: "traits" },
    { key: "nwp" },
    { key: "wp" },
    { key: "equips" },
    { key: "spells" },
  ];

  const sections = [
    ...sectionsMeta.map((section) => ({
      title: uiText(uiTexts, "index", `section.${section.key}.title`, section.key),
      status: uiText(uiTexts, "index", `section.${section.key}.status`, isEn ? "Ready" : "Pronto"),
      note: uiText(uiTexts, "index", `section.${section.key}.note`, ""),
      href: section.href,
    })),
  ];

  return (
    <PublicShell
      locale={locale}
      currentPath="/indice"
      title={uiText(uiTexts, "index", "title", isEn ? "Index" : "Índice")}
      description={uiText(
        uiTexts,
        "index",
        "description",
        isEn
          ? "Choose a topic to understand rules and options for character creation and progression."
          : "Escolha um tema para entender as regras e opções disponíveis na criação e evolução do personagem."
      )}
    >
      <div>
        <p className="text-xs uppercase tracking-widest text-zinc-400">{uiText(uiTexts, "index", "badge", isEn ? "Public navigation" : "Navegação pública")}</p>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {sections.map((section) => (
            <article key={section.title} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold text-zinc-100">{section.title}</h2>
                <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-300">{section.status}</span>
              </div>
              <p className="mt-2 text-sm text-zinc-400">{section.note}</p>
              {section.href ? (
                <Link
                  href={withLang(section.href, locale)}
                  className="mt-3 inline-flex rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-100 hover:bg-zinc-800"
                >
                  {uiText(uiTexts, "index", "viewDetails", isEn ? "View details" : "Ver detalhes")}
                </Link>
              ) : null}
            </article>
          ))}
        </div>

        <div className="mt-8 border-t border-zinc-800 pt-6">
          <p className="text-sm text-zinc-400">{uiText(uiTexts, "index", "soon", isEn ? "Soon: full detail pages for each topic, with dedicated navigation." : "Em breve: páginas de detalhe completas para cada tópico, com navegação dedicada.")}</p>
        </div>
      </div>
    </PublicShell>
  );
}
