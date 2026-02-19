import type { NextApiRequest, NextApiResponse } from "next";

import { extractBearerToken, verifyJwtToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncSpellReferenceTableFromCsv } from "@/lib/spell-reference-sync";

type SyncResponse = {
  files: number;
  read: number;
  created: number;
  updated: number;
  deleted: number;
};

type ErrorResponse = { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SyncResponse | ErrorResponse>,
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

    const result = await syncSpellReferenceTableFromCsv({
      prisma,
      csvDir: "data",
    });

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error && error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }

    const message = error instanceof Error ? error.message : "Unexpected error";
    return res.status(500).json({ error: message });
  }
}
