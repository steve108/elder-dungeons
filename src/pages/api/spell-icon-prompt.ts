import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError, z } from "zod";

import { assertAdminOrJwt } from "@/lib/auth";
import { generateSpellIconPrompt } from "@/lib/spell-icon";

type PromptResponse = {
  iconPrompt: string;
};

type ErrorResponse = {
  error: string;
  details?: unknown;
};

const requestSchema = z.object({
  name: z.string().trim().min(1),
  spellClass: z.enum(["arcane", "divine"]),
  school: z.string().trim().optional().nullable(),
  sphere: z.string().trim().optional().nullable(),
  summaryEn: z.string().trim().optional().nullable(),
  descriptionOriginal: z.string().trim().min(1),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse<PromptResponse | ErrorResponse>) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    assertAdminOrJwt(req.headers.authorization);

    const input = requestSchema.parse(req.body);
    const iconPrompt = await generateSpellIconPrompt(input);

    return res.status(200).json({ iconPrompt });
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

    return res.status(500).json({ error: error instanceof Error ? error.message : "Unexpected error" });
  }
}
