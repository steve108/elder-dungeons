import { parse } from "csv-parse/sync";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { extractBearerToken, verifyJwtToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeSpellName } from "@/lib/spell-reference";

const rowSchema = z.object({
  class: z.string().trim().min(1),
  group: z.string().trim().min(1),
  name: z.string().trim().min(1),
  lvl: z.coerce.number().int().min(0).max(9),
  source: z.string().trim().min(1),
});

const payloadSchema = z.object({
  csv: z.string().min(1),
});

type ImportResponse = { imported: number };
type ErrorResponse = { error: string; details?: unknown };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ImportResponse | ErrorResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: "Missing Bearer token" });
    }

    verifyJwtToken(token);

    const { csv } = payloadSchema.parse(req.body);

    const parsedRows = parse(csv, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as unknown[];

    const rows = parsedRows.map((row) => rowSchema.parse(row));

    if (rows.length === 0) {
      return res.status(400).json({ error: "CSV has no rows" });
    }

    const result = await prisma.spellReference.createMany({
      data: rows.map((row) => ({
        className: row.class,
        groupName: row.group,
        name: row.name,
        normalizedName: normalizeSpellName(row.name),
        level: row.lvl,
        source: row.source,
      })),
      skipDuplicates: true,
    });

    return res.status(201).json({ imported: result.count });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid payload or CSV format",
        details: error.flatten(),
      });
    }

    if (error instanceof Error && error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }

    const message = error instanceof Error ? error.message : "Unexpected error";
    return res.status(500).json({ error: message });
  }
}
