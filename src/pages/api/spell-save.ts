import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";

import { assertAdminOrJwt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildSpellDedupeKey, spellPayloadSchema } from "@/lib/spell";

type SaveResponse = { id: number };
type ErrorResponse = { error: string; details?: unknown };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SaveResponse | ErrorResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    assertAdminOrJwt(req.headers.authorization);

    const payload = spellPayloadSchema.parse(req.body);
    const dedupeKey = buildSpellDedupeKey(payload);

    const created = await prisma.spell.upsert({
      where: { dedupeKey },
      update: {
        spellClass: payload.spellClass,
        componentDesc: payload.componentDesc ?? null,
        componentCost: payload.componentCost ?? null,
        componentConsumed: payload.componentConsumed ?? false,
        canBeDispelled: payload.canBeDispelled ?? false,
        dispelHow: payload.canBeDispelled ? (payload.dispelHow?.trim() || null) : null,
        combat: payload.combat ?? false,
        utility: payload.utility ?? true,
        summaryEn: payload.summaryEn,
        summaryPtBr: payload.summaryPtBr,
        descriptionOriginal: payload.descriptionOriginal,
        descriptionPtBr: payload.descriptionPtBr ?? null,
        sourceImageUrl: payload.sourceImageUrl ?? null,
      },
      create: {
        ...payload,
        dedupeKey,
        school: payload.school ?? null,
        sphere: payload.sphere ?? null,
        source: payload.source ?? null,
        target: payload.target ?? null,
        componentDesc: payload.componentDesc ?? null,
        componentCost: payload.componentCost ?? null,
        componentConsumed: payload.componentConsumed ?? false,
        canBeDispelled: payload.canBeDispelled ?? false,
        dispelHow: payload.canBeDispelled ? (payload.dispelHow?.trim() || null) : null,
        combat: payload.combat ?? false,
        utility: payload.utility ?? true,
        summaryEn: payload.summaryEn,
        summaryPtBr: payload.summaryPtBr,
        descriptionPtBr: payload.descriptionPtBr ?? null,
        sourceImageUrl: payload.sourceImageUrl ?? null,
      },
      select: { id: true },
    });

    return res.status(201).json(created);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Invalid payload",
        details: error.flatten(),
      });
    }

    if (error instanceof Error && error.message === "MISSING_AUTH") {
      return res.status(401).json({ error: "Missing authorization" });
    }

    if (error instanceof Error && error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }

    const message = error instanceof Error ? error.message : "Unexpected error";
    return res.status(500).json({ error: message });
  }
}
