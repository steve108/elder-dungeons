"use client";

import { MagicalResistance } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, MouseEvent, ReactNode, useEffect, useMemo, useState } from "react";

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
  prevSpellId?: number | null;
  nextSpellId?: number | null;
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
  savingThrowOutcome: "",
  magicalResistance: MagicalResistance.NO,
  summaryEn: "",
  summaryPtBr: "",
  descriptionOriginal: "",
  descriptionPtBr: "",
  sourceImageUrl: "",
  iconUrl: "",
  iconPrompt: "",
};

export default function SpellEditPage() {
  const params = useParams<{ id: string }>();
  const [form, setForm] = useState<SpellEditForm>(emptyForm);
  const [initialFormSnapshot, setInitialFormSnapshot] = useState<string>(JSON.stringify(emptyForm));
  const [status, setStatus] = useState("Carregando spell...");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegeneratingIcon, setIsRegeneratingIcon] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [prevSpellId, setPrevSpellId] = useState<number | null>(null);
  const [nextSpellId, setNextSpellId] = useState<number | null>(null);

  const spellId = useMemo(() => Number(params?.id ?? ""), [params]);
  const isDirty = useMemo(() => JSON.stringify(form) !== initialFormSnapshot, [form, initialFormSnapshot]);
  const isActionLocked = isSaving || isRegeneratingIcon || isGeneratingPrompt;

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

        const loadedForm = toSpellEditForm(data.item);
        setForm(loadedForm);
        setInitialFormSnapshot(JSON.stringify(loadedForm));
        setPrevSpellId(typeof data.prevSpellId === "number" ? data.prevSpellId : null);
        setNextSpellId(typeof data.nextSpellId === "number" ? data.nextSpellId : null);
        setStatus("Dados carregados.");
      } catch (error) {
        setPrevSpellId(null);
        setNextSpellId(null);
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

      setInitialFormSnapshot(JSON.stringify(form));
      setStatus("Spell atualizada com sucesso.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erro inesperado ao atualizar spell");
    } finally {
      setIsSaving(false);
    }
  }

  async function regenerateIcon() {
    const authHeader = getAdminAuthHeader();
    if (!authHeader) {
      setStatus("Sessão admin inválida. Faça login novamente.");
      return;
    }

    setIsRegeneratingIcon(true);
    setStatus("Regenerando ícone...");

    try {
      const response = await fetch("/api/spell-icon-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          name: form.name,
          spellClass: form.spellClass,
          school: form.school || null,
          sphere: form.sphere || null,
          summaryEn: form.summaryEn,
          descriptionOriginal: form.descriptionOriginal,
          iconPrompt: form.iconPrompt || null,
        }),
      });

      const data = (await response.json()) as { iconUrl?: string; iconPrompt?: string; error?: string };
      if (!response.ok || !data.iconUrl || !data.iconPrompt) {
        throw new Error(data.error ?? "Falha ao regenerar ícone");
      }

      setForm((prev) => ({
        ...prev,
        iconUrl: data.iconUrl!,
        iconPrompt: data.iconPrompt!,
      }));

      setStatus("Ícone regenerado com sucesso. Salve para persistir no registro.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erro inesperado ao regenerar ícone");
    } finally {
      setIsRegeneratingIcon(false);
    }
  }

  async function regenerateAutoPrompt() {
    const authHeader = getAdminAuthHeader();
    if (!authHeader) {
      setStatus("Sessão admin inválida. Faça login novamente.");
      return;
    }

    setIsGeneratingPrompt(true);
    setStatus("Gerando prompt automático...");

    try {
      const response = await fetch("/api/spell-icon-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          name: form.name,
          spellClass: form.spellClass,
          school: form.school || null,
          sphere: form.sphere || null,
          summaryEn: form.summaryEn,
          descriptionOriginal: form.descriptionOriginal,
        }),
      });

      const data = (await response.json()) as { iconPrompt?: string; error?: string };
      if (!response.ok || !data.iconPrompt) {
        throw new Error(data.error ?? "Falha ao gerar prompt automático");
      }

      setForm((prev) => ({
        ...prev,
        iconPrompt: data.iconPrompt!,
      }));

      setStatus("Prompt automático gerado com sucesso.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Erro inesperado ao gerar prompt automático");
    } finally {
      setIsGeneratingPrompt(false);
    }
  }

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirty || isActionLocked) return;

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty, isActionLocked]);

  if (isLoading) {
    return <p className="text-sm text-zinc-300">{status}</p>;
  }

  function confirmDiscardChanges(event: MouseEvent<HTMLAnchorElement>) {
    if (!isDirty || isActionLocked) return;

    const shouldLeave = window.confirm("Você tem alterações não salvas. Deseja sair sem salvar?");
    if (!shouldLeave) {
      event.preventDefault();
    }
  }

  return (
    <section className="grid gap-6 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-amber-300">Alterar Spell #{spellId} - {form.name || "-"}</h2>
        <div className="flex items-center gap-3">
          {prevSpellId ? (
            <Link
              href={`/admin/spells/${prevSpellId}`}
              onClick={confirmDiscardChanges}
              className="rounded-md border border-zinc-700 px-3 py-1 text-sm text-zinc-100 hover:border-amber-300 hover:text-amber-300"
            >
              Spell anterior
            </Link>
          ) : (
            <span className="rounded-md border border-zinc-800 px-3 py-1 text-sm text-zinc-500">Spell anterior</span>
          )}

          <Link
            href={`/admin/spells/${spellId}/view`}
            onClick={confirmDiscardChanges}
            className="rounded-md border border-zinc-700 px-3 py-1 text-sm text-zinc-100 hover:border-amber-300 hover:text-amber-300"
          >
            View
          </Link>
          {nextSpellId ? (
            <Link
              href={`/admin/spells/${nextSpellId}`}
              onClick={confirmDiscardChanges}
              className="rounded-md border border-zinc-700 px-3 py-1 text-sm text-zinc-100 hover:border-amber-300 hover:text-amber-300"
            >
              Próximo spell
            </Link>
          ) : (
            <span className="rounded-md border border-zinc-800 px-3 py-1 text-sm text-zinc-500">Próximo spell</span>
          )}
          <Link href="/admin/spells" onClick={confirmDiscardChanges} className="text-sm text-zinc-300 hover:text-amber-300">
            ← Voltar para listagem
          </Link>
        </div>
      </div>

      <form onSubmit={onSave} className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-3 md:col-span-1 md:self-start">
            {form.iconUrl ? (
              <Image
                src={form.iconUrl}
                alt={`Ícone da spell ${form.name}`}
                width={160}
                height={160}
                unoptimized
                className="h-40 w-40 rounded border border-zinc-700 bg-zinc-900 object-cover"
              />
            ) : (
              <div className="flex h-40 w-40 items-center justify-center rounded border border-zinc-800 bg-zinc-900 text-xs text-zinc-500">
                Sem ícone
              </div>
            )}

            {isRegeneratingIcon ? (
              <p className="inline-flex items-center gap-2 text-xs text-zinc-400">
                <span aria-hidden="true">⏳</span>
                Gerando imagem...
              </p>
            ) : null}

            {isGeneratingPrompt ? (
              <p className="inline-flex items-center gap-2 text-xs text-zinc-400">
                <span aria-hidden="true">⏳</span>
                Gerando prompt automático...
              </p>
            ) : null}

            <Field label="URL do ícone">
              <input
                value={form.iconUrl}
                onChange={(event) => updateField("iconUrl", event.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Prompt do ícone">
              <textarea
                value={form.iconPrompt}
                onChange={(event) => updateField("iconPrompt", event.target.value)}
                className="min-h-56 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-300"
              />
            </Field>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={regenerateIcon}
                disabled={isActionLocked}
                className="rounded-md bg-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100 disabled:opacity-50"
              >
                {isRegeneratingIcon ? "Regenerando ícone..." : "Regenerar Ícone"}
              </button>

              <button
                type="button"
                onClick={regenerateAutoPrompt}
                disabled={isActionLocked}
                className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-100 disabled:opacity-50"
              >
                {isGeneratingPrompt ? "Gerando prompt..." : "Prompt automático"}
              </button>

              <button
                type="submit"
                disabled={isActionLocked}
                className="rounded-md bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-50"
              >
                {isSaving ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
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

          <Field label="Resultado do Save">
            <select
              value={form.savingThrowOutcome}
              onChange={(event) =>
                updateField(
                  "savingThrowOutcome",
                  event.target.value === "NEGATES" ||
                    event.target.value === "HALF" ||
                    event.target.value === "PARTIAL" ||
                    event.target.value === "OTHER"
                    ? event.target.value
                    : "",
                )
              }
              className={inputClass}
            >
              <option value="">-</option>
              <option value="NEGATES">Negates</option>
              <option value="HALF">Half</option>
              <option value="PARTIAL">Partial</option>
              <option value="OTHER">Other</option>
            </select>
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
          disabled={isActionLocked}
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
