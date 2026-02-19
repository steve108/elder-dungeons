import type { SpellPayload } from "@/lib/spell";

type SpellPreviewProps = {
  value: SpellPayload;
};

function paragraphize(value: string): string {
  return value
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n\n");
}

export function SpellPreview({ value }: SpellPreviewProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <h3 className="mb-3 text-base font-semibold text-zinc-100">Conferência da Spell</h3>
      <div className="grid gap-1 text-sm text-zinc-200 md:grid-cols-2">
        <p><span className="text-zinc-400">Nome:</span> {value.name}</p>
        <p><span className="text-zinc-400">Nível:</span> {value.level}</p>
        <p><span className="text-zinc-400">Class:</span> {value.spellClass}</p>
        <p><span className="text-zinc-400">Escola:</span> {value.school ?? "-"}</p>
        <p><span className="text-zinc-400">Esfera:</span> {value.sphere ?? "-"}</p>
        <p><span className="text-zinc-400">Fonte:</span> {value.source ?? "-"}</p>
        <p><span className="text-zinc-400">Range:</span> {value.rangeText}</p>
        <p><span className="text-zinc-400">Target/AoE:</span> {value.target ?? "-"}</p>
        <p><span className="text-zinc-400">Duração:</span> {value.durationText}</p>
        <p><span className="text-zinc-400">Casting Time:</span> {value.castingTime}</p>
        <p><span className="text-zinc-400">Componentes:</span> {value.components}</p>
        <p><span className="text-zinc-400">Componente material:</span> {value.componentDesc ?? "-"}</p>
        <p><span className="text-zinc-400">Custo:</span> {value.componentCost ?? "-"}</p>
        <p><span className="text-zinc-400">Consumido:</span> {value.componentConsumed ? "Sim" : "Não"}</p>
        <p><span className="text-zinc-400">Pode ser dispersada:</span> {value.canBeDispelled ? "Sim" : "Não"}</p>
        <p><span className="text-zinc-400">Como dispersar:</span> {value.dispelHow ?? "-"}</p>
        <p><span className="text-zinc-400">Combat:</span> {value.combat ? "Sim" : "Não"}</p>
        <p><span className="text-zinc-400">Utility:</span> {value.utility ? "Sim" : "Não"}</p>
        <p><span className="text-zinc-400">Saving Throw:</span> {value.savingThrow}</p>
        <p><span className="text-zinc-400">Magic Resistance:</span> {value.magicalResistance}</p>
      </div>

      <div className="mt-4 grid gap-4">
        <section>
          <h4 className="mb-1 text-sm font-semibold text-amber-300">Resumo (EN)</h4>
          <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-200">{paragraphize(value.summaryEn)}</p>
        </section>

        <section>
          <h4 className="mb-1 text-sm font-semibold text-amber-300">Resumo (PT-BR)</h4>
          <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-200">{paragraphize(value.summaryPtBr)}</p>
        </section>

        <section>
          <h4 className="mb-1 text-sm font-semibold text-amber-300">Descrição Original</h4>
          <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-300">{paragraphize(value.descriptionOriginal)}</p>
        </section>

        <section>
          <h4 className="mb-1 text-sm font-semibold text-amber-300">Descrição PT-BR</h4>
          <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-300">{paragraphize(value.descriptionPtBr)}</p>
        </section>
      </div>
    </div>
  );
}
