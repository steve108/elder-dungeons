import { createHash } from "node:crypto";
import { z } from "zod";

import { normalizeSpellName } from "@/lib/spell-reference";

export const spellClassSchema = z.enum(["arcane", "divine"]);
export type SpellClass = z.infer<typeof spellClassSchema>;

export const savingThrowOutcomeSchema = z.enum(["NEGATES", "HALF", "PARTIAL", "OTHER"]);
export type SavingThrowOutcome = z.infer<typeof savingThrowOutcomeSchema>;

export const magicalResistanceSchema = z.enum(["YES", "NO"]);
export type MagicalResistance = z.infer<typeof magicalResistanceSchema>;

export const spellPayloadSchema = z.object({
  name: z.string().trim().min(1),
  level: z.number().int().min(0).max(9),
  spellClass: spellClassSchema,
  school: z.string().trim().optional().nullable(),
  sphere: z.string().trim().optional().nullable(),
  source: z.string().trim().optional().nullable(),
  rangeText: z.string().trim().min(1),
  target: z.string().trim().optional().nullable(),
  durationText: z.string().trim().min(1),
  castingTime: z.string().trim().min(1),
  components: z.string().trim().min(1),
  componentDesc: z.string().trim().optional().nullable(),
  componentCost: z.string().trim().optional().nullable(),
  componentConsumed: z.boolean().default(false),
  canBeDispelled: z.boolean().default(false),
  dispelHow: z.string().trim().optional().nullable(),
  combat: z.boolean().default(false),
  utility: z.boolean().default(false),
  savingThrow: z.string().trim().min(1),
  savingThrowOutcome: savingThrowOutcomeSchema.optional().nullable(),
  magicalResistance: magicalResistanceSchema,
  summaryEn: z.string().trim().min(1),
  summaryPtBr: z
    .string()
    .trim()
    .min(1)
    .refine((value) => !value.includes("�"), {
      message: "summaryPtBr contains invalid character encoding",
    }),
  descriptionOriginal: z.string().min(1),
  descriptionPtBr: z
    .string()
    .trim()
    .min(1)
    .refine((value) => !value || !value.includes("�"), {
      message: "descriptionPtBr contains invalid character encoding",
    }),
  sourceImageUrl: z.string().url().optional().nullable(),
  iconUrl: z.string().url().optional().nullable(),
  iconPrompt: z.string().trim().min(1).optional().nullable(),
});

export type SpellPayload = z.infer<typeof spellPayloadSchema>;

const directCreatureRegex =
  /\b(target|targets|creature|creatures|enemy|enemies|ally|allies|humanoid|being|person|persons|monster|victim)\b/i;

const summonOrCreationRegex =
  /\b(summon|summons|summoned|conjure|conjures|conjured|calls? forth|mount|steed|horse|phantom steed|create|creates|created)\b/i;

export function inferMagicalResistance(params: {
  name: string;
  descriptionOriginal: string;
  target?: string | null;
  savingThrow?: string | null;
}): MagicalResistance {
  const text = [params.name, params.descriptionOriginal, params.target ?? "", params.savingThrow ?? ""].join("\n");

  const hasDirectCreatureTarget = directCreatureRegex.test(text);
  const isSummonOrCreation = summonOrCreationRegex.test(text);

  if (!hasDirectCreatureTarget) {
    return "NO";
  }

  if (isSummonOrCreation && !(params.target ?? "").trim()) {
    return "NO";
  }

  return "YES";
}

export function buildSpellDedupeKey(payload: SpellPayload): string {
  const key = [normalizeSpellName(payload.name), payload.spellClass].join("|");

  return createHash("sha256").update(key, "utf8").digest("hex");
}
