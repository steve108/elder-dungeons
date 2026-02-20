import { MagicalResistance } from "@prisma/client";
import type { SavingThrowOutcome, SpellClass } from "@/lib/spell";

export type SpellEditForm = {
  id: number;
  name: string;
  level: number;
  spellClass: SpellClass;
  school: string;
  sphere: string;
  source: string;
  rangeText: string;
  target: string;
  durationText: string;
  castingTime: string;
  components: string;
  componentDesc: string;
  componentCost: string;
  componentConsumed: boolean;
  canBeDispelled: boolean;
  dispelHow: string;
  combat: boolean;
  utility: boolean;
  savingThrow: string;
  savingThrowOutcome: SavingThrowOutcome | "";
  magicalResistance: MagicalResistance;
  summaryEn: string;
  summaryPtBr: string;
  descriptionOriginal: string;
  descriptionPtBr: string;
  sourceImageUrl: string;
  iconUrl: string;
  iconPrompt: string;
};

export type SpellListItem = {
  id: number;
  name: string;
  level: number;
  spellClass: SpellClass;
  school: string | null;
  sphere: string | null;
  source: string | null;
  updatedAt: string;
};

export function toSpellEditForm(input: {
  id: number;
  name: string;
  level: number;
  spellClass: SpellClass;
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
  savingThrowOutcome: SavingThrowOutcome | null;
  magicalResistance: MagicalResistance;
  summaryEn: string;
  summaryPtBr: string;
  descriptionOriginal: string;
  descriptionPtBr: string | null;
  sourceImageUrl: string | null;
  iconUrl: string | null;
  iconPrompt: string | null;
}): SpellEditForm {
  return {
    id: input.id,
    name: input.name,
    level: input.level,
    spellClass: input.spellClass,
    school: input.school ?? "",
    sphere: input.sphere ?? "",
    source: input.source ?? "",
    rangeText: input.rangeText,
    target: input.target ?? "",
    durationText: input.durationText,
    castingTime: input.castingTime,
    components: input.components,
    componentDesc: input.componentDesc ?? "",
    componentCost: input.componentCost ?? "",
    componentConsumed: input.componentConsumed,
    canBeDispelled: input.canBeDispelled,
    dispelHow: input.dispelHow ?? "",
    combat: input.combat,
    utility: input.utility,
    savingThrow: input.savingThrow,
    savingThrowOutcome: input.savingThrowOutcome ?? "",
    magicalResistance: input.magicalResistance,
    summaryEn: input.summaryEn,
    summaryPtBr: input.summaryPtBr,
    descriptionOriginal: input.descriptionOriginal,
    descriptionPtBr: input.descriptionPtBr ?? "",
    sourceImageUrl: input.sourceImageUrl ?? "",
    iconUrl: input.iconUrl ?? "",
    iconPrompt: input.iconPrompt ?? "",
  };
}

export function validateSpellEditForm(input: SpellEditForm): string[] {
  const errors: string[] = [];

  const required: Array<{ label: string; value: string }> = [
    { label: "Nome", value: input.name },
    { label: "Class", value: input.spellClass },
    { label: "Range", value: input.rangeText },
    { label: "Duração", value: input.durationText },
    { label: "Casting Time", value: input.castingTime },
    { label: "Componentes", value: input.components },
    { label: "Saving Throw", value: input.savingThrow },
    { label: "Resumo EN", value: input.summaryEn },
    { label: "Resumo PT-BR", value: input.summaryPtBr },
    { label: "Descrição Original", value: input.descriptionOriginal },
    { label: "Descrição PT-BR", value: input.descriptionPtBr },
  ];

  for (const field of required) {
    if (!field.value.trim()) {
      errors.push(`${field.label} é obrigatório.`);
    }
  }

  if (!Number.isInteger(input.level) || input.level < 0 || input.level > 9) {
    errors.push("Nível deve ser um inteiro entre 0 e 9.");
  }

  if (input.canBeDispelled && !input.dispelHow.trim()) {
    errors.push("Informe como a spell pode ser dispersada.");
  }

  const maxLengths: Array<{ label: string; value: string; max: number }> = [
    { label: "Nome", value: input.name, max: 120 },
    { label: "Escola", value: input.school, max: 120 },
    { label: "Esfera", value: input.sphere, max: 120 },
    { label: "Fonte", value: input.source, max: 60 },
    { label: "Range", value: input.rangeText, max: 120 },
    { label: "Alvo", value: input.target, max: 160 },
    { label: "Duração", value: input.durationText, max: 120 },
    { label: "Casting Time", value: input.castingTime, max: 80 },
    { label: "Componentes", value: input.components, max: 80 },
    { label: "Como dispersar", value: input.dispelHow, max: 500 },
    { label: "Saving Throw", value: input.savingThrow, max: 120 },
    { label: "Resumo EN", value: input.summaryEn, max: 500 },
    { label: "Resumo PT-BR", value: input.summaryPtBr, max: 500 },
    { label: "URL da imagem", value: input.sourceImageUrl, max: 500 },
  ];

  for (const field of maxLengths) {
    if (field.value.length > field.max) {
      errors.push(`${field.label} excede ${field.max} caracteres.`);
    }
  }

  return errors;
}
