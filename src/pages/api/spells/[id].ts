import type { NextApiRequest, NextApiResponse } from "next";
import { MagicalResistance } from "@prisma/client";

import { assertAdminOrJwt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type SpellDetails = {
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

type ResponseBody =
  | { item: SpellDetails; prevSpellId: number | null; nextSpellId: number | null }
  | { id: number; updated: true }
  | { error: string };

function normalizeText(value: unknown, fallback: string | null = null): string | null {
  if (typeof value !== "string") return fallback;
  return value.trim();
}

function normalizeRequiredText(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function normalizeNullableText(value: unknown, fallback: string | null = null): string | null {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeSpellClass(value: unknown, fallback: "arcane" | "divine" = "arcane"): "arcane" | "divine" {
  return value === "divine" ? "divine" : value === "arcane" ? "arcane" : fallback;
}

function normalizeSavingThrowOutcome(
  value: unknown,
): "NEGATES" | "HALF" | "PARTIAL" | "OTHER" | null {
  if (value === "NEGATES" || value === "HALF" || value === "PARTIAL" || value === "OTHER") {
    return value;
  }

  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseBody>) {
  const idParam = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const id = Number(idParam);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid spell id" });
  }

  if (req.method !== "GET" && req.method !== "PUT") {
    res.setHeader("Allow", "GET, PUT");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    assertAdminOrJwt(req.headers.authorization);

    if (req.method === "GET") {
      const item = await prisma.spell.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          level: true,
          spellClass: true,
          school: true,
          sphere: true,
          source: true,
          rangeText: true,
          target: true,
          durationText: true,
          castingTime: true,
          components: true,
          componentDesc: true,
          componentCost: true,
          componentConsumed: true,
          canBeDispelled: true,
          dispelHow: true,
          combat: true,
          utility: true,
          savingThrow: true,
          savingThrowOutcome: true,
          magicalResistance: true,
          summaryEn: true,
          summaryPtBr: true,
          descriptionOriginal: true,
          descriptionPtBr: true,
          sourceImageUrl: true,
          iconUrl: true,
          iconPrompt: true,
        },
      });

      if (!item) {
        return res.status(404).json({ error: "Spell not found" });
      }

      const [previousSpell, nextSpell] = await Promise.all([
        prisma.spell.findFirst({
          where: { id: { lt: id } },
          orderBy: { id: "desc" },
          select: { id: true },
        }),
        prisma.spell.findFirst({
          where: { id: { gt: id } },
          orderBy: { id: "asc" },
          select: { id: true },
        }),
      ]);

      return res.status(200).json({
        item: {
          ...item,
          spellClass: normalizeSpellClass(item.spellClass),
          savingThrowOutcome: normalizeSavingThrowOutcome(item.savingThrowOutcome),
        },
        prevSpellId: previousSpell?.id ?? null,
        nextSpellId: nextSpell?.id ?? null,
      });
    }

    const body = (req.body ?? {}) as Record<string, unknown>;
    const current = await prisma.spell.findUnique({
      where: { id },
      select: {
        dedupeKey: true,
        name: true,
        level: true,
        spellClass: true,
        school: true,
        sphere: true,
        source: true,
        rangeText: true,
        target: true,
        durationText: true,
        castingTime: true,
        components: true,
        componentDesc: true,
        componentCost: true,
        componentConsumed: true,
        canBeDispelled: true,
        dispelHow: true,
        combat: true,
        utility: true,
        savingThrow: true,
        savingThrowOutcome: true,
        magicalResistance: true,
        summaryEn: true,
        summaryPtBr: true,
        descriptionOriginal: true,
        descriptionPtBr: true,
        sourceImageUrl: true,
        iconUrl: true,
        iconPrompt: true,
      },
    });

    if (!current) {
      return res.status(404).json({ error: "Spell not found" });
    }

    const updated = await prisma.spell.update({
      where: { id },
      data: {
        name: normalizeRequiredText(body.name, current.name),
        level:
          typeof body.level === "number" && Number.isInteger(body.level)
            ? body.level
            : current.level,
        spellClass: normalizeSpellClass(body.spellClass, normalizeSpellClass(current.spellClass)),
        school: normalizeText(body.school, current.school),
        sphere: normalizeText(body.sphere, current.sphere),
        source: normalizeText(body.source, current.source),
        rangeText: normalizeRequiredText(body.rangeText, current.rangeText),
        target: normalizeText(body.target, current.target),
        durationText: normalizeRequiredText(body.durationText, current.durationText),
        castingTime: normalizeRequiredText(body.castingTime, current.castingTime),
        components: normalizeRequiredText(body.components, current.components),
        componentDesc: normalizeText(body.componentDesc, current.componentDesc),
        componentCost: normalizeText(body.componentCost, current.componentCost),
        componentConsumed:
          typeof body.componentConsumed === "boolean"
            ? body.componentConsumed
            : current.componentConsumed,
        canBeDispelled:
          typeof body.canBeDispelled === "boolean"
            ? body.canBeDispelled
            : current.canBeDispelled,
        dispelHow:
          typeof body.canBeDispelled === "boolean"
            ? body.canBeDispelled
              ? normalizeNullableText(body.dispelHow, current.dispelHow)
              : null
            : current.canBeDispelled
              ? normalizeNullableText(body.dispelHow, current.dispelHow)
              : null,
        combat: typeof body.combat === "boolean" ? body.combat : current.combat,
        utility: typeof body.utility === "boolean" ? body.utility : current.utility,
        savingThrow: normalizeRequiredText(body.savingThrow, current.savingThrow),
        savingThrowOutcome:
          body.savingThrowOutcome === "NEGATES" ||
          body.savingThrowOutcome === "HALF" ||
          body.savingThrowOutcome === "PARTIAL" ||
          body.savingThrowOutcome === "OTHER"
            ? body.savingThrowOutcome
            : body.savingThrowOutcome === ""
              ? null
              : normalizeSavingThrowOutcome(current.savingThrowOutcome),
        magicalResistance:
          body.magicalResistance === MagicalResistance.YES || body.magicalResistance === MagicalResistance.NO
            ? body.magicalResistance
            : current.magicalResistance,
        summaryEn: normalizeRequiredText(body.summaryEn, current.summaryEn),
        summaryPtBr: normalizeRequiredText(body.summaryPtBr, current.summaryPtBr),
        descriptionOriginal: normalizeRequiredText(
          body.descriptionOriginal,
          current.descriptionOriginal,
        ),
        descriptionPtBr: normalizeText(body.descriptionPtBr, current.descriptionPtBr),
        sourceImageUrl: normalizeText(body.sourceImageUrl, current.sourceImageUrl),
        iconUrl: normalizeText(body.iconUrl, current.iconUrl),
        iconPrompt: normalizeText(body.iconPrompt, current.iconPrompt),
      },
      select: { id: true },
    });

    return res.status(200).json({ id: updated.id, updated: true });
  } catch (error) {
    if (error instanceof Error && error.message === "MISSING_AUTH") {
      return res.status(401).json({ error: "Missing authorization" });
    }

    if (error instanceof Error && error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return res.status(409).json({ error: "Spell já existe com os mesmos dados principais" });
    }

    const message = error instanceof Error ? error.message : "Unexpected error";
    return res.status(500).json({ error: message });
  }
}
