"use client";

import { MagicalResistance } from "@prisma/client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

import { getAdminAuthHeader } from "@/lib/admin-client";
import { toSpellEditForm, validateSpellEditForm, type SpellEditForm } from "@/lib/spell-ui";

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
    magicalResistance: MagicalResistance;
    summaryEn: string;
    summaryPtBr: string;
    descriptionOriginal: string;
    descriptionPtBr: string | null;
    sourceImageUrl: string | null;
  };
  error?: string;
};

type UpdateResponse = {
  id?: number;
  updated?: boolean;
  error?: string;
};

const emptyForm: SpellEditForm = {
  id: 0,
  name: "",
  level: 0,
  spellClass: "arcane",
  school: "",
  sphere: "",
  source: "",
  rangeText: "",
  target: "",
  durationText: "",
  castingTime: "",
  components: "",
  componentDesc: "",
  componentCost: "",
  componentConsumed: false,
  canBeDispelled: false,
  dispelHow: "",
  combat: false,
  utility: true,
  savingThrow: "",
  magicalResistance: MagicalResistance.NO,
  summaryEn: "",
  summaryPtBr: "",
  descriptionOriginal: "",
  descriptionPtBr: "",
  sourceImageUrl: "",
};

export default function SpellEditPage() {
  const params = useParams<{ id: string }>();
  const [form, setForm] = useState<SpellEditForm>(emptyForm);
  const [status, setStatus] = useState("Carregando spell...");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

        setForm(toSpellEditForm(data.item));
        setStatus("Dados carregados.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Erro inesperado ao carregar spell");
      } finally {
        setIsLoading(false);
      }
    }

    void loadSpell();
  }, [spellId]);

  function updateField<K extends keyof SpellEditForm>(key: K, value: SpellEditForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();

    const errors = validateSpellEditForm(form);
    if (errors.length > 0) {
      setStatus(errors.join(" "));
      return;
    }

    const authHeader = getAdminAuthHeader();
    if (!authHeader) {
      setStatus("Sessão admin inválida. Faça login novamente.");
      return;
    }

    setIsSaving(true);
    setStatus("Salvando alterações...");

    try {
      const response = await fetch(`/api/spells/${spellId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as UpdateResponse;
      if (!response.ok || !data.updated) {
        throw new Error(data.error ?? "Falha ao atualizar spell");
      }

      setStatus("Spell atualizada com sucesso.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erro inesperado ao atualizar spell");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-zinc-300">{status}</p>;
  }

  return (
    <section className="grid gap-6 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-amber-300">Alterar Spell #{spellId}</h2>
        <Link href="/admin/spells" className="text-sm text-zinc-300 hover:text-amber-300">
          ← Voltar para listagem
        </Link>
      </div>

      <form onSubmit={onSave} className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Nome">
            <input value={form.name} onChange={(event) => updateField("name", event.target.value)} className={inputClass} />
          </Field>

          <Field label="Nível">
            <input
              type="number"
              min={0}
              max={9}
              value={form.level}
              onChange={(event) => updateField("level", Number(event.target.value))}
              className={inputClass}
            />
          </Field>

          <Field label="Class">
            <select
              value={form.spellClass}
              onChange={(event) =>
                updateField("spellClass", event.target.value === "divine" ? "divine" : "arcane")
              }
              className={inputClass}
            >
              <option value="arcane">arcane</option>
              <option value="divine">divine</option>
            </select>
          </Field>

          <Field label="Escola">
            <input value={form.school} onChange={(event) => updateField("school", event.target.value)} className={inputClass} />
          </Field>

          <Field label="Esfera">
            <input value={form.sphere} onChange={(event) => updateField("sphere", event.target.value)} className={inputClass} />
          </Field>

          <Field label="Fonte">
            <input value={form.source} onChange={(event) => updateField("source", event.target.value)} className={inputClass} />
          </Field>

          <Field label="Range">
            <input value={form.rangeText} onChange={(event) => updateField("rangeText", event.target.value)} className={inputClass} />
          </Field>

          <Field label="Target/AoE">
            <input value={form.target} onChange={(event) => updateField("target", event.target.value)} className={inputClass} />
          </Field>

          <Field label="Duração">
            <input value={form.durationText} onChange={(event) => updateField("durationText", event.target.value)} className={inputClass} />
          </Field>

          <Field label="Casting Time">
            <input value={form.castingTime} onChange={(event) => updateField("castingTime", event.target.value)} className={inputClass} />
          </Field>

          <Field label="Componentes">
            <input value={form.components} onChange={(event) => updateField("components", event.target.value)} className={inputClass} />
          </Field>

          <Field label="Descrição de componente">
            <input
              value={form.componentDesc}
              onChange={(event) => updateField("componentDesc", event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Custo de componente">
            <input
              value={form.componentCost}
              onChange={(event) => updateField("componentCost", event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Saving Throw">
            <input
              value={form.savingThrow}
              onChange={(event) => updateField("savingThrow", event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Magic Resistance">
            <select
              value={form.magicalResistance}
              onChange={(event) =>
                updateField(
                  "magicalResistance",
                  event.target.value === MagicalResistance.YES ? MagicalResistance.YES : MagicalResistance.NO,
                )
              }
              className={inputClass}
            >
              <option value={MagicalResistance.NO}>NO</option>
              <option value={MagicalResistance.YES}>YES</option>
            </select>
          </Field>

          <Field label="Componente consumido">
            <label className="flex h-10 items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
              <input
                type="checkbox"
                checked={form.componentConsumed}
                onChange={(event) => updateField("componentConsumed", event.target.checked)}
              />
              Consumido
            </label>
          </Field>

          <Field label="Pode ser dispersada">
            <label className="flex h-10 items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
              <input
                type="checkbox"
                checked={form.canBeDispelled}
                onChange={(event) => {
                  const checked = event.target.checked;
                  updateField("canBeDispelled", checked);
                  if (!checked) {
                    updateField("dispelHow", "");
                  }
                }}
              />
              Dispersável após conjuração
            </label>
          </Field>

          <Field label="Como dispersar">
            <input
              value={form.dispelHow}
              onChange={(event) => updateField("dispelHow", event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Combat">
            <label className="flex h-10 items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
              <input
                type="checkbox"
                checked={form.combat}
                onChange={(event) => updateField("combat", event.target.checked)}
              />
              Apto para combate
            </label>
          </Field>

          <Field label="Utility">
            <label className="flex h-10 items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
              <input
                type="checkbox"
                checked={form.utility}
                onChange={(event) => updateField("utility", event.target.checked)}
              />
              Apto para utilidade
            </label>
          </Field>

          <Field label="URL da imagem">
            <input
              value={form.sourceImageUrl}
              onChange={(event) => updateField("sourceImageUrl", event.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Resumo EN">
          <textarea
            value={form.summaryEn}
            onChange={(event) => updateField("summaryEn", event.target.value)}
            className={textareaClass}
          />
        </Field>

        <Field label="Resumo PT-BR">
          <textarea
            value={form.summaryPtBr}
            onChange={(event) => updateField("summaryPtBr", event.target.value)}
            className={textareaClass}
          />
        </Field>

        <Field label="Descrição Original">
          <textarea
            value={form.descriptionOriginal}
            onChange={(event) => updateField("descriptionOriginal", event.target.value)}
            className={textareaClass}
          />
        </Field>

        <Field label="Descrição PT-BR">
          <textarea
            value={form.descriptionPtBr}
            onChange={(event) => updateField("descriptionPtBr", event.target.value)}
            className={textareaClass}
          />
        </Field>

        <button
          type="submit"
          disabled={isSaving}
          className="w-fit rounded-md bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-50"
        >
          {isSaving ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>

      <p className="text-sm text-zinc-300">{status}</p>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-sm text-zinc-200">
      {label}
      {children}
    </label>
  );
}

const inputClass =
  "h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-300";

const textareaClass =
  "min-h-36 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-300";
