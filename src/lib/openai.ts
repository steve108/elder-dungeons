import OpenAI from "openai";
import { z } from "zod";

import { findSpellReferenceByName } from "@/lib/spell-reference";
import { inferMagicalResistance, spellPayloadSchema, type SpellClass, type SpellPayload } from "@/lib/spell";

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
12) Do not invent unknown values. Use best effort with AD&D 2e conventions.

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

const metadataLineRegex =
  /^(Range|Duration|Area of Effect|Components|Casting Time|Saving Throw|Target|Targets|School|Sphere|Level|Source|Class|Group)\s*:/i;

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

    if (/^\(.*\)$/.test(trimmed) || metadataLineRegex.test(trimmed)) {
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

export async function parseSpellFromOpenAI(rawInput: unknown): Promise<SpellPayload> {
  const input = requestSchema.parse(rawInput);
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

  const schoolValues = mergeUniqueValues(splitCsvLikeList(parsed.school ?? null), reference?.schools ?? []);
  const sphereValues = mergeUniqueValues(splitCsvLikeList(parsed.sphere ?? null), reference?.spheres ?? []);
  const sourceValues = mergeUniqueValues(splitCsvLikeList(parsed.source ?? null), reference?.sources ?? []);
  const spellClass = inferSpellClass({
    parsedSpellClass: parsed.spellClass,
    parsedSchool: parsed.school,
    parsedSphere: parsed.sphere,
    mergedSchools: schoolValues,
    mergedSpheres: sphereValues,
    referenceClassNames: reference?.classNames,
  });

  const fallbackLevel = reference?.levels.length ? reference.levels[0] : undefined;
  const resolvedLevel =
    parsed.level === undefined
      ? fallbackLevel
      : reference?.levels?.length && !reference.levels.includes(parsed.level)
        ? fallbackLevel
        : parsed.level;

  return spellPayloadSchema.parse({
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
    magicalResistance,
    summaryEn: localization.summaryEn,
    summaryPtBr: localization.summaryPtBr,
    descriptionOriginal,
    descriptionPtBr: localization.descriptionPtBr,
    sourceImageUrl: input.sourceImageUrl ?? null,
  });
}
