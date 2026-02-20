import OpenAI from "openai";
import { z } from "zod";

import { findSpellReferenceByName } from "@/lib/spell-reference";
import { generateAndUploadSpellIcon } from "@/lib/spell-icon";
import {
  inferMagicalResistance,
  spellPayloadSchema,
  type SavingThrowOutcome,
  type SpellClass,
  type SpellPayload,
} from "@/lib/spell";

const openAiParseResponseSchema = spellPayloadSchema.omit({ sourceImageUrl: true, spellClass: true }).extend({
  level: z.number().int().min(0).max(9).optional(),
  spellClass: z.enum(["arcane", "divine"]).optional(),
  school: z.string().trim().optional().nullable(),
  sphere: z.string().trim().optional().nullable(),
  source: z.string().trim().optional().nullable(),
  descriptionOriginal: z.string().min(1),
  target: z.string().trim().optional().nullable(),
  descriptionPtBr: z.string().trim().optional().nullable(),
  summaryEn: z.string().trim().optional(),
  summaryPtBr: z.string().trim().optional(),
  combat: z.boolean().optional(),
  utility: z.boolean().optional(),
  componentDesc: z.string().trim().optional().nullable(),
  componentCost: z.string().trim().optional().nullable(),
  componentConsumed: z.boolean().optional(),
  canBeDispelled: z.boolean().optional(),
  dispelHow: z.string().trim().optional().nullable(),
  savingThrowOutcome: z.enum(["NEGATES", "HALF", "PARTIAL", "OTHER"]).optional().nullable(),
  magicalResistance: z.enum(["YES", "NO"]).optional(),
});

export const SPELL_PARSE_PROMPT = `You are an AD&D 2nd Edition spell parser.
Extract structured spell data from the user content and respond with valid JSON only.

Rules:
1) descriptionOriginal must contain only the narrative spell description body.
   Exclude title/name line, school/sphere line, and stat block lines such as Range/Duration/Components/Casting Time/Saving Throw.
  Keep the narrative body exactly as written and preserve/insert sensible paragraph line breaks for fluent reading.
2) If content is image-only, transcribe the original spell text and use only its narrative body in descriptionOriginal.
3) descriptionPtBr must be a complete Brazilian Portuguese translation of descriptionOriginal with fluent paragraph breaks.
4) Create short summaries:
  - summaryEn: 1-3 concise sentences in English.
  - summaryPtBr: 1-3 concise sentences in Brazilian Portuguese.
5) Classify usage intent:
  - combat=true when spell is typically useful in combat situations.
  - utility=true when spell is typically useful outside combat.
  - both can be true.
6) spellClass must be:
  - "arcane" for wizard spells
  - "divine" for priest spells
If uncertain, use best effort from school/sphere context.
7) magicalResistance:
   - YES: spell directly affects creatures/targets.
   - NO: environmental, area-only, object-only, or indirect effects.
  - Do NOT use mentions of "caster" alone as evidence for YES.
  - Summoning/creation spells (e.g., Mount-like effects) are usually NO unless the spell directly targets/forces effects on another creature.
8) source must be one of known books when possible (Player's Handbook, Spells & Magic, Tome of Magic, Complete Wizard's Handbook, Complete Priest's Handbook, or another explicit source in text). If unknown, return null.
9) target should be extracted from explicit Target/Targets/Area of Effect line when present.
10) Component details:
   - Parse components from abbreviations like V,S,M.
  - componentDesc: describe material component. If not explicit, infer plausible affected material/context when strongly implied by spell effect (e.g. fires, torches, braziers for Affect Normal Fires).
   - componentCost: include explicit monetary/value cost when present.
   - componentConsumed: true only if text explicitly says material is consumed/destroyed; otherwise false.
11) Dispel behavior after spell is active:
  - canBeDispelled=true when the spell effect can be ended/suppressed by Dispel Magic (or equivalent) after successful casting.
  - dispelHow: short explanation of how dispel works for this spell effect.
  - Ignore dispel/counterspell interactions during casting time or before the effect exists.
  - If unclear, prefer conservative output: canBeDispelled=false and dispelHow=null.
12) Saving Throw must follow AD&D 2e categories only. Never use ability-save terms from other editions (e.g., Constitution save).
  Allowed categories:
  - Paralyzation, Poison, or Death Magic
  - Rod, Staff, or Wand
  - Petrification or Polymorph
  - Breath Weapon
  - Spell
  Priority order when more than one could apply:
  1. If effect includes paralysis/poison/death magic, use "Paralyzation, Poison, or Death Magic".
  2. Else if it is specifically resisted as rod/staff/wand effect, use "Rod, Staff, or Wand".
  3. Else if effect includes petrification/polymorph/transformation, use "Petrification or Polymorph".
  4. Else if it is breath-weapon-type effect, use "Breath Weapon".
  5. Otherwise use "Spell" (e.g., Fireball-like spell effects).
  Also analyze save outcome words such as "Neg.", "1/2", "half", "partial":
  - These indicate outcome resolution (negates / half damage / partial effect),
  - But category must still be one of the AD&D 2e categories above.
13) Do not invent unknown values. Use best effort with AD&D 2e conventions.

Return this JSON shape:
{
  "name": "string",
  "level": 0,
  "spellClass": "arcane | divine",
  "school": "string | null",
  "sphere": "string | null",
  "source": "string | null",
  "rangeText": "string",
  "target": "string | null",
  "durationText": "string",
  "castingTime": "string",
  "components": "string",
  "componentDesc": "string | null",
  "componentCost": "string | null",
  "componentConsumed": false,
  "canBeDispelled": false,
  "dispelHow": "string | null",
  "combat": false,
  "utility": true,
  "savingThrow": "string",
  "savingThrowOutcome": "NEGATES | HALF | PARTIAL | OTHER | null",
  "magicalResistance": "YES | NO",
  "summaryEn": "string",
  "summaryPtBr": "string",
  "descriptionOriginal": "string",
  "descriptionPtBr": "string"
}`;

function normalizeFlexibleText(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toTitleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function removeCorruptedChar(value: string): string {
  return value.replace(/�/g, "");
}

const nonSpellInterpretationSchema = z.object({
  nomeMagia: z.string().trim().min(1),
  escolaMagia: z.string().trim().min(1),
  nivel: z.union([z.number().int().min(0).max(9), z.string().trim().min(1)]),
  componentes: z.union([z.string().trim().min(1), z.array(z.string().trim().min(1)).min(1)]),
  tempoConjuracao: z.string().trim().min(1),
  alcance: z.string().trim().min(1),
  duracao: z.string().trim().min(1),
  descricaoEfeito: z.string().trim().min(1),
  efeitoColateralComico: z.string().trim().min(1),
  falhaCritica: z.string().trim().min(1),
  notaArquimago: z.string().trim().min(1),
});

function normalizeLevel(value: string | number): number {
  if (typeof value === "number") {
    return Math.max(0, Math.min(9, value));
  }

  const match = value.match(/[0-9]/);
  if (!match) return 1;

  const parsed = Number(match[0]);
  if (!Number.isInteger(parsed)) return 1;
  return Math.max(0, Math.min(9, parsed));
}

async function buildCreativeFallbackSpellFromPrompt(
  client: OpenAI,
  model: string,
  text: string,
  sourceImageUrl?: string | null,
): Promise<SpellPayload> {
  const cleaned = removeCorruptedChar(text).replace(/\s+/g, " ").trim();

  const completion = await createCompletionWithRetry(client, {
    model,
    response_format: { type: "json_object" },
    temperature: 0.9,
    messages: [
      {
        role: "system",
        content: `Você é um arquimago excêntrico que interpreta QUALQUER texto como se fosse uma magia de RPG.

Regras:
1) Sempre converta o texto em magia, mesmo que seja receita, lista, bula, recado, desabafo ou nonsense.
2) Tom irônico, sarcástico e divertido, como um mago veterano cansado de aprendizes.
3) Gere JSON válido com EXATAMENTE estes campos:
   nomeMagia, escolaMagia, nivel, componentes, tempoConjuracao, alcance, duracao, descricaoEfeito, efeitoColateralComico, falhaCritica, notaArquimago
4) Se o texto for absurdo, a magia deve funcionar de maneira inesperada e ridícula.
5) Nunca diga que o texto não é magia.
6) Interprete o conteúdo de verdade: extraia temas, intenções e pistas do que foi enviado, sem só copiar o texto.`,
      },
      {
        role: "user",
        content: `Texto a interpretar como magia:\n${cleaned}`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned empty non-spell interpretation content");
  }

  const interpreted = nonSpellInterpretationSchema.parse(JSON.parse(content));
  const components =
    typeof interpreted.componentes === "string" ? interpreted.componentes : interpreted.componentes.join(", ");
  const level = normalizeLevel(interpreted.nivel);

  return spellPayloadSchema.parse({
    name: removeCorruptedChar(interpreted.nomeMagia),
    level,
    spellClass: "arcane",
    school: removeCorruptedChar(interpreted.escolaMagia),
    sphere: null,
    source: "Recovered Field Notes",
    rangeText: removeCorruptedChar(interpreted.alcance),
    target: "Conjurador e criaturas no raio narrativo",
    durationText: removeCorruptedChar(interpreted.duracao),
    castingTime: removeCorruptedChar(interpreted.tempoConjuracao),
    components: removeCorruptedChar(components),
    componentDesc: removeCorruptedChar(components),
    componentCost: null,
    componentConsumed: false,
    canBeDispelled: true,
    dispelHow: "Dispel Magic, autoconsciência súbita ou intervenção de um arquimago mais sóbrio",
    combat: /dano|explos|combate|ataca|hostil|inimig|destr/i.test(interpreted.descricaoEfeito),
    utility: true,
    savingThrow: "Spell",
    savingThrowOutcome: "OTHER",
    magicalResistance: "YES",
    summaryEn: removeCorruptedChar(
      "A creative spell interpretation extracted from unconventional text with plausible magical consequences.",
    ),
    summaryPtBr: removeCorruptedChar(
      "Interpretação criativa de um texto não convencional, convertida em magia com consequências plausíveis.",
    ),
    descriptionOriginal: removeCorruptedChar(
      [
        interpreted.descricaoEfeito,
        `Comedic Side Effect: ${interpreted.efeitoColateralComico}`,
        `Possible Critical Failure: ${interpreted.falhaCritica}`,
        `Archmage Note: ${interpreted.notaArquimago}`,
      ].join("\n\n"),
    ),
    descriptionPtBr: removeCorruptedChar(
      [
        interpreted.descricaoEfeito,
        `Efeito Colateral Cômico: ${interpreted.efeitoColateralComico}`,
        `Possível Falha Crítica: ${interpreted.falhaCritica}`,
        `Nota do Arquimago: ${interpreted.notaArquimago}`,
      ].join("\n\n"),
    ),
    sourceImageUrl: sourceImageUrl ?? null,
    iconUrl: null,
    iconPrompt: `Arcane emblem for ${interpreted.nomeMagia}, styled as ${interpreted.escolaMagia}, whimsical and mystical`,
  });
}

function looksLikeNonSpellText(text: string): boolean {
  const normalized = text.replace(/\s+/g, " ").trim().toLowerCase();
  if (!normalized) return false;

  const words = normalized.split(" ").filter(Boolean);
  if (words.length < 4) return false;

  const hardSpellHints = [
    "range:",
    "duration:",
    "components:",
    "casting time:",
    "saving throw:",
    "target:",
    "school:",
    "sphere:",
    "level:",
  ];

  if (hardSpellHints.some((hint) => normalized.includes(hint))) {
    return false;
  }

  const softSpellHints = [
    "spell",
    "magic",
    "wizard",
    "priest",
    "caster",
    "summon",
    "damage",
    "arcane",
    "divine",
    "magia",
    "conjur",
    "dano",
    "mago",
    "clér",
  ];

  const softHintCount = softSpellHints.filter((hint) => normalized.includes(hint)).length;

  const casualHints = [
    "oi",
    "olá",
    "bom dia",
    "boa tarde",
    "boa noite",
    "kkkk",
    "haha",
    "teste",
    "reunião",
    "whatsapp",
    "trabalho",
  ];

  const casualHintCount = casualHints.filter((hint) => normalized.includes(hint)).length;

  if (casualHintCount > 0 && softHintCount === 0) {
    return true;
  }

  return softHintCount === 0 && words.length >= 7;
}

function buildHumorousFallbackSpell(text: string, sourceImageUrl?: string | null): SpellPayload {
  const cleaned = removeCorruptedChar(text).replace(/\s+/g, " ").trim();
  const snippet = cleaned.split(" ").slice(0, 4).join(" ");
  const titledSnippet = toTitleCase(snippet || "Sinal Inesperado");
  const probableEffects = [
    "Versão mansa: reorganiza o caos em intenção funcional por alguns minutos.",
    "Versão instável: dá sentido narrativo improvável ao texto, com excesso de convicção arcana.",
    "Versão épica: cria uma solução brilhante, mas cobra o preço em constrangimento social ritualístico.",
  ];

  return spellPayloadSchema.parse({
    name: `Interpretação de ${titledSnippet}`,
    level: 1,
    spellClass: "arcane",
    school: "Wild Semiotics",
    sphere: null,
    source: "Recovered Field Notes",
    rangeText: "Linha de visão (ou alcance da conversa)",
    target: "Conjurador e testemunhas do evento",
    durationText: "1d4 risadas ou até a realidade se recompor",
    castingTime: "1 ação improvisada",
    components: "V, S, M",
    componentDesc: "Uma frase fora de contexto e confiança excessiva",
    componentCost: null,
    componentConsumed: false,
    canBeDispelled: true,
    dispelHow: "Dispel Magic, silêncio constrangedor ou mudança de assunto",
    combat: false,
    utility: true,
    savingThrow: "Spell",
    savingThrowOutcome: "OTHER",
    magicalResistance: "YES",
    summaryEn: removeCorruptedChar("Interprets unusual text as an emergent spell pattern with plausible outcomes."),
    summaryPtBr: removeCorruptedChar("Interpreta texto incomum como padrão mágico emergente com efeitos plausíveis."),
    descriptionOriginal: removeCorruptedChar([
      "Field interpretation from an unstructured incantation fragment:",
      `\"${cleaned.slice(0, 240)}${cleaned.length > 240 ? "..." : ""}\"`,
      "Probable effect branches:",
      ...probableEffects,
    ].join("\n\n")),
    descriptionPtBr: removeCorruptedChar([
      "Interpretação de campo a partir de um fragmento de encantamento não estruturado:",
      `\"${cleaned.slice(0, 240)}${cleaned.length > 240 ? "..." : ""}\"`,
      "Prováveis versões do efeito:",
      ...probableEffects,
    ].join("\n\n")),
    sourceImageUrl: sourceImageUrl ?? null,
    iconUrl: null,
    iconPrompt: "Comedic arcane glyph made of floating chat bubbles and chaotic sparkles",
  });
}

const requestSchema = z
  .object({
    text: z.preprocess((value) => normalizeFlexibleText(value), z.string().optional()),
    imageDataUrl: z.preprocess((value) => normalizeOptionalString(value), z.string().optional()),
    sourceImageUrl: z.preprocess(
      (value) => {
        if (value == null) return null;
        if (typeof value !== "string") return undefined;
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
      },
      z.string().url().optional().nullable(),
    ),
  })
  .refine((value) => Boolean(value.text?.trim() || value.imageDataUrl), {
    message: "Provide spell text or an image.",
    path: ["text"],
  });

export type SpellParseRequest = z.infer<typeof requestSchema>;

const canonicalSavingThrows2e = [
  "Paralyzation, Poison, or Death Magic",
  "Rod, Staff, or Wand",
  "Petrification or Polymorph",
  "Breath Weapon",
  "Spell",
] as const;

const metadataLineRegex =
  /^(Range|Duration|Area of Effect|Components|Casting Time|Saving Throw|Target|Targets|School|Sphere|Level|Source|Class|Group)\s*:/i;

const metadataLineLooseRegex =
  /^(Spell Level|Class|School|Sphere|Details|Range|Duration|AOE|Casting Time|Save|Requirements|Source)\b/i;

const nonNarrativeLineRegex =
  /^(For other .* see .*|[A-Za-z0-9'\-\s]+\(\s*[SMV, ]+\s*\))$/i;

function extractDescriptionBody(rawText: string): string {
  const lines = rawText.split(/\r?\n/);

  let index = 0;
  while (index < lines.length && lines[index].trim().length === 0) {
    index += 1;
  }

  if (index < lines.length) {
    index += 1;
  }

  while (index < lines.length) {
    const trimmed = lines[index].trim();

    if (trimmed.length === 0) {
      index += 1;
      continue;
    }

    if (
      /^\(.*\)$/.test(trimmed) ||
      metadataLineRegex.test(trimmed) ||
      metadataLineLooseRegex.test(trimmed) ||
      nonNarrativeLineRegex.test(trimmed)
    ) {
      index += 1;
      continue;
    }

    break;
  }

  const body = lines.slice(index).join("\n").trim();
  return body.length > 0 ? body : rawText.trim();
}

function splitCsvLikeList(value?: string | null): string[] {
  if (!value) return [];

  return value
    .split(/[,/;|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitGroupList(value?: string | null): string[] {
  if (!value) return [];

  return value
    .split(/[,;|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeGroupToken(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9/\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCaseWords(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function canonicalizeGroupName(value: string): string {
  const token = normalizeGroupToken(value);

  if (["invocation", "evocation", "invocation/evocation", "evocation/invocation"].includes(token)) {
    return "Invocation/Evocation";
  }

  if (["conjuration", "summoning", "conjuration/summoning", "summoning/conjuration"].includes(token)) {
    return "Conjuration/Summoning";
  }

  if (["illusion", "phantasm", "illusion/phantasm", "phantasm/illusion"].includes(token)) {
    return "Illusion/Phantasm";
  }

  if (["enchantment", "charm", "enchantment/charm", "charm/enchantment"].includes(token)) {
    return "Enchantment/Charm";
  }

  if (token.includes("/")) {
    return token
      .split("/")
      .map((part) => titleCaseWords(part))
      .join("/");
  }

  return titleCaseWords(token);
}

function normalizeGroupValues(values: string[]): string[] {
  const set = new Set<string>();

  for (const value of values) {
    const canonical = canonicalizeGroupName(value);
    if (canonical) {
      set.add(canonical);
    }
  }

  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function mergeUniqueValues(...lists: string[][]): string[] {
  const set = new Set<string>();
  for (const list of lists) {
    for (const item of list) {
      set.add(item);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function inferSpellClass(params: {
  parsedSpellClass?: SpellClass;
  parsedSchool?: string | null;
  parsedSphere?: string | null;
  mergedSchools: string[];
  mergedSpheres: string[];
  referenceClassNames?: string[];
}): SpellClass {
  if (params.parsedSpellClass) {
    return params.parsedSpellClass;
  }

  const hasSchool = Boolean(params.parsedSchool?.trim());
  const hasSphere = Boolean(params.parsedSphere?.trim());

  if (hasSchool && !hasSphere) return "arcane";
  if (hasSphere && !hasSchool) return "divine";

  const normalizedClasses = (params.referenceClassNames ?? []).map((value) => value.toLowerCase());
  const hasWizard = normalizedClasses.includes("wizard");
  const hasPriest = normalizedClasses.includes("priest");

  if (hasWizard && !hasPriest) return "arcane";
  if (hasPriest && !hasWizard) return "divine";

  if (params.mergedSchools.length > 0 && params.mergedSpheres.length === 0) return "arcane";
  if (params.mergedSpheres.length > 0 && params.mergedSchools.length === 0) return "divine";

  return hasPriest ? "divine" : "arcane";
}

function inferSavingThrow2e(params: {
  parsedSavingThrow?: string;
  name: string;
  descriptionOriginal: string;
  target?: string | null;
}): { category: string; outcome: SavingThrowOutcome | null } {
  const raw = (params.parsedSavingThrow ?? "").trim();
  const rawLower = raw.toLowerCase();

  if (/^none$|^no\s+save$/i.test(rawLower)) {
    return { category: "None", outcome: null };
  }

  const context = [params.name, params.target ?? "", params.descriptionOriginal, raw].join("\n").toLowerCase();
  const saveOutcome: SavingThrowOutcome =
    /\bneg\.?\b|negates?|no\s+effect\s+on\s+save|if\s+save\s+is\s+made.*no\s+effect/.test(context)
      ? "NEGATES"
      : /1\s*\/\s*2|half\s+damage|half\s+effect/.test(context)
        ? "HALF"
        : /partial|reduced\s+effect|lesser\s+effect/.test(context)
          ? "PARTIAL"
          : "OTHER";

  for (const category of canonicalSavingThrows2e) {
    if (rawLower === category.toLowerCase()) {
      return { category, outcome: saveOutcome };
    }
  }

  if (/paraly|paralys|poison|death\s*magic|save\s+vs\s+death|slay|slain|instantly\s+die|instant\s+death/.test(context)) {
    return { category: "Paralyzation, Poison, or Death Magic", outcome: saveOutcome };
  }

  if (/\brod\b|\bstaff\b|\bwand\b/.test(context)) {
    return { category: "Rod, Staff, or Wand", outcome: saveOutcome };
  }

  if (/petrif|polymorph|to\s+stone|stone\s+to\s+flesh|transform(?:ed|ation)?/.test(context)) {
    return { category: "Petrification or Polymorph", outcome: saveOutcome };
  }

  if (/breath\s*weapon|dragon\s*breath|breath\s+attack/.test(context)) {
    return { category: "Breath Weapon", outcome: saveOutcome };
  }

  return { category: "Spell", outcome: saveOutcome };
}

function isRetryableOpenAIError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const maybeStatus = (error as Error & { status?: number }).status;
  return maybeStatus === 429 || maybeStatus === 500 || maybeStatus === 502 || maybeStatus === 503 || maybeStatus === 504;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function createCompletionWithRetry(
  client: OpenAI,
  payload: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
): Promise<OpenAI.Chat.Completions.ChatCompletion> {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await client.chat.completions.create(payload);
    } catch (error) {
      if (!isRetryableOpenAIError(error) || attempt === maxAttempts) {
        throw error;
      }

      await sleep(400 * attempt);
    }
  }

  throw new Error("OpenAI completion failed after retries");
}

type LocalizationResult = {
  descriptionPtBr: string;
  summaryEn: string;
  summaryPtBr: string;
};

const localizationSchema = z.object({
  descriptionPtBr: z.string().trim().min(1),
  summaryEn: z.string().trim().min(1),
  summaryPtBr: z.string().trim().min(1),
});

async function ensureLocalizedFields(
  client: OpenAI,
  model: string,
  base: {
    name: string;
    descriptionOriginal: string;
    descriptionPtBr?: string | null;
    summaryEn?: string;
    summaryPtBr?: string;
  },
): Promise<LocalizationResult> {
  const hasPtBr = Boolean(base.descriptionPtBr?.trim());
  const hasSummaryEn = Boolean(base.summaryEn?.trim());
  const hasSummaryPtBr = Boolean(base.summaryPtBr?.trim());

  if (hasPtBr && hasSummaryEn && hasSummaryPtBr) {
    return {
      descriptionPtBr: base.descriptionPtBr!.trim(),
      summaryEn: base.summaryEn!.trim(),
      summaryPtBr: base.summaryPtBr!.trim(),
    };
  }

  const completion = await createCompletionWithRetry(client, {
    model,
    response_format: { type: "json_object" },
    temperature: 0,
    messages: [
      {
        role: "system",
        content:
          "You complete missing spell localization fields. Return valid JSON only with descriptionPtBr, summaryEn, summaryPtBr. descriptionPtBr must be complete Brazilian Portuguese with readable paragraph breaks.",
      },
      {
        role: "user",
        content: `SPELL_NAME: ${base.name}\nDESCRIPTION_ORIGINAL:\n${base.descriptionOriginal}`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned empty localization content");
  }

  return localizationSchema.parse(JSON.parse(content));
}

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return new OpenAI({ apiKey });
}

function normalizeSpellNameForComparison(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isZeroLevelExceptionSpell(spellName: string): boolean {
  const normalized = normalizeSpellNameForComparison(spellName);
  return normalized === "cantrip" || normalized === "orison";
}

function pickMostFrequentLevel(text: string): number | undefined {
  const counts = new Map<number, number>();
  const levelRegexes = [
    /\blevel\s*[:\-]?\s*([0-9])\b/gi,
    /\b([0-9])\s*(?:st|nd|rd|th)?\s*[- ]?level\b/gi,
  ];

  for (const regex of levelRegexes) {
    for (const match of text.matchAll(regex)) {
      const value = Number(match[1]);
      if (!Number.isInteger(value) || value < 0 || value > 9) continue;
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  const ranked = Array.from(counts.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0] - b[0];
  });

  if (ranked.length === 0) return undefined;
  if (ranked.length > 1 && ranked[0][1] === ranked[1][1]) return undefined;
  return ranked[0][0];
}

function htmlToPlainText(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchLevelFromDuckDuckGoLite(spellName: string): Promise<number | undefined> {
  const query = encodeURIComponent(`AD&D 2e ${spellName} spell level`);
  const url = `https://lite.duckduckgo.com/lite/?q=${query}`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 ElderDungeons/1.0",
      Accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return undefined;
  }

  const html = await response.text();
  return pickMostFrequentLevel(htmlToPlainText(html));
}

async function fetchLevelFromDuckDuckGoInstant(spellName: string): Promise<number | undefined> {
  const query = encodeURIComponent(`AD&D 2e ${spellName} spell level`);
  const url = `https://api.duckduckgo.com/?q=${query}&format=json&no_html=1&skip_disambig=1`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 ElderDungeons/1.0",
      Accept: "application/json,text/plain",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return undefined;
  }

  const data = (await response.json()) as {
    AbstractText?: string;
    Answer?: string;
    Definition?: string;
    RelatedTopics?: Array<{ Text?: string } | { Topics?: Array<{ Text?: string }> }>;
  };

  const relatedTexts: string[] = [];
  for (const topic of data.RelatedTopics ?? []) {
    if ("Text" in topic && topic.Text) {
      relatedTexts.push(topic.Text);
      continue;
    }

    if ("Topics" in topic && Array.isArray(topic.Topics)) {
      for (const nested of topic.Topics) {
        if (nested.Text) {
          relatedTexts.push(nested.Text);
        }
      }
    }
  }

  const text = [data.AbstractText ?? "", data.Answer ?? "", data.Definition ?? "", ...relatedTexts]
    .join(" ")
    .trim();

  if (!text) return undefined;
  return pickMostFrequentLevel(text);
}

async function resolveSpellLevelFromWeb(spellName: string): Promise<number | undefined> {
  try {
    const instantLevel = await fetchLevelFromDuckDuckGoInstant(spellName);
    if (instantLevel !== undefined) return instantLevel;
  } catch {
    // ignore lookup errors and continue with other providers
  }

  try {
    return await fetchLevelFromDuckDuckGoLite(spellName);
  } catch {
    return undefined;
  }
}

export async function parseSpellFromOpenAI(rawInput: unknown): Promise<SpellPayload> {
  const input = requestSchema.parse(rawInput);

  try {
    const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
    const client = getOpenAIClient();

    const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [];

    if (input.text?.trim()) {
      userContent.push({
        type: "text",
        text: `SPELL_TEXT:\n${input.text}`,
      });
    }

    if (input.imageDataUrl) {
      userContent.push({
        type: "image_url",
        image_url: { url: input.imageDataUrl },
      });
    }

    const completion = await createCompletionWithRetry(client, {
      model,
      response_format: { type: "json_object" },
      temperature: 0,
      messages: [
        { role: "system", content: SPELL_PARSE_PROMPT },
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned empty content");
    }

    const parsed = openAiParseResponseSchema.parse(JSON.parse(content));
    const reference = await findSpellReferenceByName(parsed.name);

    const descriptionOriginal = parsed.descriptionOriginal?.trim()
      ? parsed.descriptionOriginal
      : input.text?.trim()
        ? extractDescriptionBody(input.text)
        : "";

    const localization = await ensureLocalizedFields(client, model, {
      name: parsed.name,
      descriptionOriginal,
      descriptionPtBr: parsed.descriptionPtBr,
      summaryEn: parsed.summaryEn,
      summaryPtBr: parsed.summaryPtBr,
    });

    const magicalResistance =
      parsed.magicalResistance ??
      inferMagicalResistance({
        name: parsed.name,
        descriptionOriginal,
        target: parsed.target ?? null,
        savingThrow: parsed.savingThrow ?? null,
      });

  const parsedSchools = normalizeGroupValues(splitGroupList(parsed.school ?? null));
  const parsedSpheres = normalizeGroupValues(splitGroupList(parsed.sphere ?? null));
  const referenceSchools = normalizeGroupValues(reference?.schools ?? []);
  const referenceSpheres = normalizeGroupValues(reference?.spheres ?? []);

    let schoolValues = referenceSchools.length > 0 ? referenceSchools : parsedSchools;
    let sphereValues = referenceSpheres.length > 0 ? referenceSpheres : parsedSpheres;
    const sourceValues = mergeUniqueValues(splitCsvLikeList(parsed.source ?? null), reference?.sources ?? []);
    const spellClass = inferSpellClass({
      parsedSpellClass: parsed.spellClass,
      parsedSchool: parsed.school,
      parsedSphere: parsed.sphere,
      mergedSchools: schoolValues,
      mergedSpheres: sphereValues,
      referenceClassNames: reference?.classNames,
    });

    if (spellClass === "arcane") {
      if (schoolValues.length === 0 && sphereValues.length > 0) {
        schoolValues = sphereValues;
      }
      sphereValues = [];
    }

    if (spellClass === "divine" && sphereValues.length === 0 && schoolValues.length > 0) {
      sphereValues = schoolValues;
    }

    if (spellClass === "divine" && sphereValues.length === 0) {
      throw new Error(
        `Não foi possível determinar a esfera da magia divina "${parsed.name}". Pelo menos uma esfera é obrigatória.`,
      );
    }

    const fallbackLevel = reference?.levels.length ? reference.levels[0] : undefined;
    let resolvedLevel =
      parsed.level === undefined
        ? fallbackLevel
        : reference?.levels?.length && !reference.levels.includes(parsed.level)
          ? fallbackLevel
          : parsed.level;

    const isZeroLevelAllowed = isZeroLevelExceptionSpell(parsed.name);
    const hasReferenceLevel = reference?.levels.length ? true : false;

    if (resolvedLevel === undefined || (resolvedLevel === 0 && !isZeroLevelAllowed)) {
      const webLevel = await resolveSpellLevelFromWeb(parsed.name);
      if (webLevel !== undefined) {
        resolvedLevel = webLevel;
      }
    }

    if (resolvedLevel === undefined) {
      throw new Error(`Não foi possível determinar o nível da magia "${parsed.name}" na referência local nem na web.`);
    }

    if (resolvedLevel === 0 && !isZeroLevelAllowed) {
      const sourceHint = hasReferenceLevel ? "referência local" : "parse";
      throw new Error(
        `A magia "${parsed.name}" foi classificada como nível 0 por ${sourceHint}, mas apenas Cantrip e Orison podem ser nível 0.`,
      );
    }

    const inferredSavingThrow = inferSavingThrow2e({
      parsedSavingThrow: parsed.savingThrow,
      name: parsed.name,
      descriptionOriginal,
      target: parsed.target ?? null,
    });

    const payload = spellPayloadSchema.parse({
      ...parsed,
      level: resolvedLevel,
      spellClass,
      school: schoolValues.length > 0 ? schoolValues.join(", ") : null,
      sphere: sphereValues.length > 0 ? sphereValues.join(", ") : null,
      source: sourceValues.length > 0 ? sourceValues.join(", ") : null,
      target: parsed.target ?? null,
      componentConsumed: parsed.componentConsumed ?? false,
      canBeDispelled: parsed.canBeDispelled ?? false,
      dispelHow: parsed.canBeDispelled ? (parsed.dispelHow?.trim() || null) : null,
      combat: parsed.combat ?? false,
      utility: parsed.utility ?? true,
      savingThrow: inferredSavingThrow.category,
      savingThrowOutcome: parsed.savingThrowOutcome ?? inferredSavingThrow.outcome,
      magicalResistance,
      summaryEn: localization.summaryEn,
      summaryPtBr: localization.summaryPtBr,
      descriptionOriginal,
      descriptionPtBr: localization.descriptionPtBr,
      sourceImageUrl: input.sourceImageUrl ?? null,
      iconUrl: null,
      iconPrompt: null,
    });

    try {
      const icon = await generateAndUploadSpellIcon(payload);

      return {
        ...payload,
        iconUrl: icon.iconUrl,
        iconPrompt: icon.iconPrompt,
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : "unknown error";
      console.error("[spell-icon] generate/upload failed during parse:", reason);

      return payload;
    }
  } catch (error) {
    if (input.text && !input.imageDataUrl && looksLikeNonSpellText(input.text)) {
      try {
        const creativeModel = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
        const creativeClient = getOpenAIClient();
        return await buildCreativeFallbackSpellFromPrompt(
          creativeClient,
          creativeModel,
          input.text,
          input.sourceImageUrl ?? null,
        );
      } catch {
        return buildHumorousFallbackSpell(input.text, input.sourceImageUrl ?? null);
      }
    }

    throw error;
  }
}
