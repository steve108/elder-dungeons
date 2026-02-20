"use client";

import { MagicalResistance } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getAdminAuthHeader } from "@/lib/admin-client";

type SpellApiResponse = {
  item?: {
    id: number;
    name: string;
    level: number;
    spellClass: "arcane" | "divine";
    school: string | null;
    sphere: string | null;
    source: string | null;
    rangeText: string;
    target: string | null;
    durationText: string;
    castingTime: string;
    components: string;
    componentDesc: string | null;
    componentCost: string | null;
    componentConsumed: boolean;
    canBeDispelled: boolean;
    dispelHow: string | null;
    combat: boolean;
    utility: boolean;
    savingThrow: string;
    savingThrowOutcome: "NEGATES" | "HALF" | "PARTIAL" | "OTHER" | null;
    magicalResistance: MagicalResistance;
    summaryEn: string;
    summaryPtBr: string;
    descriptionOriginal: string;
    descriptionPtBr: string | null;
    sourceImageUrl: string | null;
    iconUrl: string | null;
    iconPrompt: string | null;
  };
  error?: string;
};

function paragraphize(value: string): string {
  return value
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n\n");
}

export default function SpellViewPage() {
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<SpellApiResponse["item"]>();
  const [status, setStatus] = useState("Carregando spell...");
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState<"pt" | "en">("pt");

  const spellId = useMemo(() => Number(params?.id ?? ""), [params]);

  useEffect(() => {
    async function loadSpell() {
      if (!Number.isInteger(spellId) || spellId <= 0) {
        setStatus("ID inválido.");
        setIsLoading(false);
        return;
      }

      const authHeader = getAdminAuthHeader();
      if (!authHeader) {
        setStatus("Sessão admin inválida. Faça login novamente.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch(`/api/spells/${spellId}`, {
          headers: { Authorization: authHeader },
        });

        const data = (await response.json()) as SpellApiResponse;
        if (!response.ok || !data.item) {
          throw new Error(data.error ?? "Falha ao carregar spell");
        }

        setItem(data.item);
        setStatus("Spell carregada.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Erro inesperado ao carregar spell");
      } finally {
        setIsLoading(false);
      }
    }

    void loadSpell();
  }, [spellId]);

  if (isLoading) {
    return <p className="text-sm text-zinc-300">{status}</p>;
  }

  if (!item) {
    return (
      <section className="grid gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
        <p className="text-sm text-zinc-300">{status}</p>
        <Link href="/admin/spells" className="text-sm text-zinc-300 hover:text-amber-300">
          ← Voltar para listagem
        </Link>
      </section>
    );
  }

  const displaySummary = language === "pt" ? item.summaryPtBr : item.summaryEn;
  const displayDescription = language === "pt" ? (item.descriptionPtBr?.trim() || item.descriptionOriginal) : item.descriptionOriginal;

  return (
    <section className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-amber-300">Visualização da Spell</h2>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/spells/${item.id}`}
            className="rounded-md border border-zinc-700 px-3 py-1 text-sm text-zinc-100 hover:border-amber-300 hover:text-amber-300"
          >
            Editar
          </Link>
          <Link href="/admin/spells" className="text-sm text-zinc-300 hover:text-amber-300">
            ← Voltar para listagem
          </Link>
        </div>
      </div>

      <article className="rounded-2xl border border-amber-300/40 bg-zinc-950 p-1 shadow-sm">
        <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-4 md:p-6">
          <header className="mb-4 border-b border-zinc-700 pb-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold tracking-wide text-zinc-100">{item.name}</h3>
                <p className="mt-1 text-sm text-zinc-400">
                  {item.spellClass === "divine" ? "Divine" : "Arcane"} · Nível {item.level}
                </p>
              </div>
              <div className="inline-flex rounded-md border border-zinc-700 bg-zinc-900 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setLanguage("pt")}
                  className={[
                    "rounded px-3 py-1 transition",
                    language === "pt" ? "bg-zinc-700 text-zinc-100" : "text-zinc-300 hover:text-zinc-100",
                  ].join(" ")}
                >
                  Português
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={[
                    "rounded px-3 py-1 transition",
                    language === "en" ? "bg-zinc-700 text-zinc-100" : "text-zinc-300 hover:text-zinc-100",
                  ].join(" ")}
                >
                  English
                </button>
              </div>
            </div>
          </header>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-3 text-sm text-zinc-200 md:col-span-2">
              <p><span className="text-zinc-400">Escola:</span> {item.school ?? "-"}</p>
              <p><span className="text-zinc-400">Esfera:</span> {item.sphere ?? "-"}</p>
              <p><span className="text-zinc-400">Fonte:</span> {item.source ?? "-"}</p>
              <p><span className="text-zinc-400">Range:</span> {item.rangeText}</p>
              <p><span className="text-zinc-400">Target/AoE:</span> {item.target ?? "-"}</p>
              <p><span className="text-zinc-400">Duração:</span> {item.durationText}</p>
              <p><span className="text-zinc-400">Casting Time:</span> {item.castingTime}</p>
              <p><span className="text-zinc-400">Componentes:</span> {item.components}</p>
              <p><span className="text-zinc-400">Componente material:</span> {item.componentDesc ?? "-"}</p>
              <p><span className="text-zinc-400">Custo material:</span> {item.componentCost ?? "-"}</p>
              <p><span className="text-zinc-400">Componente consumido:</span> {item.componentConsumed ? "Sim" : "Não"}</p>
              <p><span className="text-zinc-400">Saving Throw:</span> {item.savingThrow}</p>
              <p><span className="text-zinc-400">Resultado do Save:</span> {item.savingThrowOutcome ?? "-"}</p>
              <p><span className="text-zinc-400">Magic Resistance:</span> {item.magicalResistance}</p>
              <p><span className="text-zinc-400">Pode ser dispersada:</span> {item.canBeDispelled ? "Sim" : "Não"}</p>
              <p><span className="text-zinc-400">Como dispersar:</span> {item.dispelHow ?? "-"}</p>
              <p><span className="text-zinc-400">Uso em combate:</span> {item.combat ? "Sim" : "Não"}</p>
              <p><span className="text-zinc-400">Uso utilitário:</span> {item.utility ? "Sim" : "Não"}</p>
            </div>

            <div className="md:col-span-1 md:justify-self-end">
              {item.iconUrl ? (
                <Image
                  src={item.iconUrl}
                  alt={`Ícone da spell ${item.name}`}
                  width={160}
                  height={160}
                  unoptimized
                  className="h-40 w-40 rounded border border-zinc-700 bg-zinc-900 object-cover"
                />
              ) : null}
            </div>
          </div>

          <section className="mt-5 rounded-lg border border-zinc-700 bg-zinc-900/60 p-4">
            <h4 className="mb-2 text-sm font-semibold text-amber-300">Descrição</h4>
            <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-100">{paragraphize(displayDescription)}</p>
          </section>

          <section className="mt-4 rounded-lg border border-zinc-700 bg-zinc-900/40 p-4">
            <h4 className="mb-2 text-sm font-semibold text-amber-300">
              {language === "pt" ? "Resumo" : "Summary"}
            </h4>
            <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-200">{paragraphize(displaySummary)}</p>
          </section>
        </div>
      </article>

      <p className="text-sm text-zinc-300">{status}</p>
    </section>
  );
}
