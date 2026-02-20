import type { NextApiRequest, NextApiResponse } from "next";

import { assertAdminOrJwt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type SpellListItem = {
  id: number;
  name: string;
  level: number;
  spellClass: "arcane" | "divine";
  school: string | null;
  sphere: string | null;
  source: string | null;
  updatedAt: string;
};

type ListResponse = {
  items: SpellListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type ErrorResponse = {
  error: string;
};

function queryString(value: string | string[] | undefined): string {
  if (!value) return "";
  return Array.isArray(value) ? value[0] ?? "" : value;
}

function queryNumber(value: string | string[] | undefined): number | null {
  const raw = queryString(value).trim();
  if (!raw) return null;

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 9) {
    return null;
  }

  return parsed;
}

function queryPage(value: string | string[] | undefined): number {
  const raw = queryString(value).trim();
  if (!raw) return 1;

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function querySpellClass(value: string | string[] | undefined): "arcane" | "divine" | null {
  const raw = queryString(value).trim().toLowerCase();
  if (!raw) return null;
  if (raw === "arcane") return "arcane";
  if (raw === "divine") return "divine";
  return null;
}

function normalizeSpellClass(value: unknown): "arcane" | "divine" {
  return value === "divine" ? "divine" : "arcane";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ListResponse | ErrorResponse>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    assertAdminOrJwt(req.headers.authorization);

    const pageSize = 50;
    const name = queryString(req.query.name).trim();
    const spellClass = querySpellClass(req.query.spellClass);
    const group = queryString(req.query.group).trim();
    const level = queryNumber(req.query.level);
    const page = queryPage(req.query.page);

    const where = {
      ...(name
        ? {
            name: {
              contains: name,
              mode: "insensitive" as const,
            },
          }
        : {}),
      ...(level !== null ? { level } : {}),
      ...(spellClass ? { spellClass } : {}),
      ...(group
        ? {
            OR: [
              {
                school: {
                  contains: group,
                  mode: "insensitive" as const,
                },
              },
              {
                sphere: {
                  contains: group,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    };

    const total = await prisma.spell.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * pageSize;

    const items = await prisma.spell.findMany({
      where,
      orderBy: [{ level: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        level: true,
        spellClass: true,
        school: true,
        sphere: true,
        source: true,
        updatedAt: true,
      },
      skip,
      take: pageSize,
    });

    return res.status(200).json({
      items: items.map((item) => ({
        ...item,
        spellClass: normalizeSpellClass(item.spellClass),
        updatedAt: item.updatedAt.toISOString(),
      })),
      page: safePage,
      pageSize,
      total,
      totalPages,
    });
  } catch (error) {
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
