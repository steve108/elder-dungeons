import Link from "next/link";
import { getLocaleFromSearchParams, withLang } from "@/lib/i18n";
import { PublicShell } from "@/components/public-shell";
import { getUiTexts, uiText } from "@/lib/ui-text";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = getLocaleFromSearchParams((await searchParams) ?? {});
  const isEn = locale === "en";
  const uiTexts = await getUiTexts(["home"], locale);

  const copy = {
    badge: uiText(uiTexts, "home", "badge", "Player's Option · Skills & Powers"),
    title: uiText(uiTexts, "home", "title", "Elder Dungeons"),
    intro: uiText(
      uiTexts,
      "home",
      "intro",
      isEn
        ? "A public rules encyclopedia for Elder Dungeons, designed to help players understand character creation and progression in a practical, easy-to-read format."
        : "Uma enciclopédia pública de regras do Elder Dungeons, feita para ajudar jogadores a entender criação e evolução de personagem de forma prática e clara."
    ),
    sectionTitle: uiText(uiTexts, "home", "sectionTitle", isEn ? "What you find here" : "O que você encontra aqui"),
    sectionText: uiText(
      uiTexts,
      "home",
      "sectionText",
      isEn
        ? "The site organizes game rules by topic: attributes and derived values, races, classes, kits, proficiencies, equipment, and spells. Each page explains mechanical impact clearly, so you can make better decisions while building your character."
        : "O site organiza as regras por tema: atributos e detalhes, raças, classes, kits, proficiências, equipamentos e magias. Cada página explica o impacto mecânico de forma direta para apoiar decisões durante a criação do personagem."
    ),
    useTitle: uiText(uiTexts, "home", "useTitle", isEn ? "How to use" : "Como usar"),
    useText: uiText(
      uiTexts,
      "home",
      "useText",
      isEn
        ? "Use the left menu to navigate by subject and switch language in the header selection box any time."
        : "Use o menu lateral esquerdo para navegar por assunto e altere o idioma no seletor do cabeçalho quando quiser."
    ),
    cta: uiText(uiTexts, "home", "cta", isEn ? "Start with Attributes" : "Começar por Atributos"),
  };

  return (
    <PublicShell locale={locale} currentPath="/" title={copy.title} description={copy.intro}>
      <div>
        <p className="text-xs uppercase tracking-widest text-zinc-400">{copy.badge}</p>

        <div className="mt-6 grid gap-3 text-sm text-zinc-300 md:grid-cols-2">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="font-semibold text-zinc-100">{copy.sectionTitle}</p>
            <p className="mt-1 text-zinc-400">{copy.sectionText}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="font-semibold text-zinc-100">{copy.useTitle}</p>
            <p className="mt-1 text-zinc-400">{copy.useText}</p>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href={withLang("/atributos", locale)}
            className="rounded-md bg-amber-300 px-5 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-200"
          >
            {copy.cta}
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}
