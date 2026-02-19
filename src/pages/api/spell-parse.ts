import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";

import { parseSpellFromOpenAI } from "@/lib/openai";

type ErrorResponse = { error: string; details?: unknown };

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "12mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ spell: unknown } | ErrorResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const spell = await parseSpellFromOpenAI(req.body);
    return res.status(200).json({ spell });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Invalid payload (entrada ou resposta de parse fora do formato esperado)",
        details: error.flatten(),
      });
    }

    return res.status(503).json({
      error: "OpenAI service is currently unavailable. Please try again later.",
    });
  }
}
