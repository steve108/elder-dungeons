import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";

import { parseSpellFromOpenAI } from "@/lib/openai";

type ErrorResponse = { error: string; details?: unknown };

function getOpenAIErrorContext(error: unknown): { status?: number; code?: string; message?: string } {
  if (!(error instanceof Error)) {
    return {};
  }

  const maybe = error as Error & {
    status?: number;
    code?: string;
    type?: string;
    error?: { code?: string; type?: string; message?: string };
  };

  return {
    status: maybe.status,
    code: maybe.code ?? maybe.error?.code ?? maybe.type ?? maybe.error?.type,
    message: maybe.message,
  };
}

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

    const context = getOpenAIErrorContext(error);
    const isProd = process.env.NODE_ENV === "production";

    if (context.message?.includes("OPENAI_API_KEY is not configured")) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured on the server.",
      });
    }

    if (context.status === 401 || context.code === "invalid_api_key") {
      return res.status(502).json({
        error: "OpenAI authentication failed. Check OPENAI_API_KEY.",
        details: isProd ? undefined : context,
      });
    }

    if (context.status === 429 || context.code === "insufficient_quota") {
      return res.status(503).json({
        error: "OpenAI quota/rate limit reached. Please try again later.",
        details: isProd ? undefined : context,
      });
    }

    return res.status(503).json({
      error: "OpenAI service is currently unavailable. Please try again later.",
      details: isProd ? undefined : context,
    });
  }
}
