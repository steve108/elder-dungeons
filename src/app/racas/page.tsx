import { prisma } from "@/lib/prisma";
import { getLocaleFromSearchParams, withLang } from "@/lib/i18n";
import { PublicShell } from "@/components/public-shell";
import Link from "next/link";

function toSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type RaceRow = {
  id: number;
  name: string;
};

export default async function RacasPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = getLocaleFromSearchParams((await searchParams) ?? {});
  const isEn = locale === "en";

  const db = prisma as any;
  const races: RaceRow[] = await db.raceBase.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      name: true,
    },
  });

  return (
    <PublicShell
      locale={locale}
      currentPath="/racas"
      title={isEn ? "Races" : "Raças"}
      description={
        isEn
          ? "Races define natural aptitudes, progression limits, and social identity before class choices. This section is the foundation of character ancestry and long-term build direction."
          : "As raças definem aptidões naturais, limites de progressão e identidade social antes da escolha de classe. Esta seção é a base da ancestralidade do personagem e da direção de evolução no longo prazo."
      }
    >
      <div>
        <p className="text-xs uppercase tracking-widest text-[var(--gold-primary)]">{isEn ? "Race Overview" : "Visão Geral de Raças"}</p>

        <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-3">
            <p className="text-sm text-[var(--white-secondary)]">
              {isEn
                ? "A race is more than visual flavor: it impacts attribute adjustments, available talents, class ceilings, and special resistances that shape your role in the party."
                : "Raça não é apenas aparência: ela impacta ajustes de atributo, talentos disponíveis, limites de classe e resistências especiais que moldam seu papel no grupo."}
            </p>
            <p className="text-sm text-[var(--white-muted)]">
              {isEn
                ? "Use the race pages to compare base profile, subrace variation, and point-cost structure before finalizing class and kit."
                : "Use as páginas de raça para comparar perfil base, variações de subraça e estrutura de custos antes de fechar classe e kit."}
            </p>
            <img
              src="/images/races/hero-3x2.svg"
              alt={isEn ? "Race introduction image 3:2" : "Imagem introdutória de raça 3:2"}
              className="aspect-[3/2] w-full rounded-xl border border-[var(--graphite)] object-cover"
            />
          </div>

          <img
            src="/images/races/hero-2x3.svg"
            alt={isEn ? "Race introduction image 2:3" : "Imagem introdutória de raça 2:3"}
            className="aspect-[2/3] w-full rounded-xl border border-[var(--graphite)] object-cover"
          />
        </div>

        <div className="mt-6 rounded-xl border border-[var(--gold-dark)] bg-[var(--warning-bg)] p-4">
          <p className="text-sm text-[var(--white-primary)]">
            {isEn
                ? "We are refining the model race by race. Elf, Dwarf, Gnome, Halfling, Half-Elf, Half-Orc, Half-Ogre, and Human are wired to validate structure, copy quality, and table layout before expanding to the remaining ancestries."
                : "Estamos refinando o modelo raça por raça. Elfo, Anão, Gnomo, Halfling, Meio-elfo, Meio-orc, Meio-ogro e Humano estão prontos para validar estrutura, qualidade de texto e layout de tabelas antes de expandir para as demais ancestralidades."}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {races
              .filter((race) => {
                const slug = toSlug(race.name);
                return (
                  slug === "elf" ||
                  slug === "dwarf" ||
                  slug === "gnome" ||
                  slug === "halfling" ||
                  slug === "half-elf" ||
                  slug === "half-orc" ||
                  slug === "half-ogre" ||
                  slug === "human"
                );
              })
              .map((race) => (
                <Link
                  key={race.id}
                  href={withLang(`/racas/${toSlug(race.name)}`, locale)}
                  className="rounded-md border border-[var(--gold-primary)] bg-[var(--hover-gold-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--gold-bright)] hover:border-[var(--hover-gold-border)]"
                >
                  {race.name}
                </Link>
              ))}
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
