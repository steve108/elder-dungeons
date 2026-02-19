import type { NextApiRequest, NextApiResponse } from "next";

import { prisma } from "@/lib/prisma";

type CheckStatus = "ok" | "error";

type HealthResponse = {
  status: "ok" | "degraded";
  timestamp: string;
  checks: {
    database: CheckStatus;
    spellClassField: CheckStatus;
  };
  details?: {
    database?: string;
    spellClassField?: string;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse | { error: string }>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const checks: HealthResponse["checks"] = {
    database: "ok",
    spellClassField: "ok",
  };

  const details: NonNullable<HealthResponse["details"]> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    checks.database = "error";
    details.database = error instanceof Error ? error.message : "Unknown database error";
  }

  try {
    await prisma.spell.findFirst({
      select: {
        id: true,
        spellClass: true,
      },
    });
  } catch (error) {
    checks.spellClassField = "error";
    details.spellClassField =
      error instanceof Error ? error.message : "Unknown spellClass runtime error";
  }

  const status: HealthResponse["status"] =
    checks.database === "ok" && checks.spellClassField === "ok" ? "ok" : "degraded";

  const payload: HealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    checks,
    ...(Object.keys(details).length > 0 ? { details } : {}),
  };

  return res.status(status === "ok" ? 200 : 503).json(payload);
}
