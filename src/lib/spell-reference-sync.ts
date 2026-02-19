import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import type { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse/sync";
import { z } from "zod";

import { normalizeSpellName } from "@/lib/spell-reference";

const csvRowSchema = z.object({
  class: z.string().trim().min(1),
  group: z.string().trim().min(1),
  name: z.string().trim().min(1),
  lvl: z.preprocess((value) => {
    const raw = String(value ?? "").trim();
    const match = raw.match(/\d+/);
    return match ? Number(match[0]) : Number.NaN;
  }, z.number().int().min(0).max(9)),
  source: z.string().trim().min(1),
});

type CsvRow = z.infer<typeof csvRowSchema>;

type NormalizedRow = {
  className: string;
  groupName: string;
  name: string;
  normalizedName: string;
  level: number;
  source: string;
};

type SyncResult = {
  files: number;
  read: number;
  created: number;
  updated: number;
  deleted: number;
};

function rowKey(row: Pick<NormalizedRow, "normalizedName" | "className" | "groupName" | "level" | "source">): string {
  return `${row.normalizedName}::${row.className}::${row.groupName}::${row.level}::${row.source}`;
}

function normalizeRow(row: CsvRow): NormalizedRow {
  return {
    className: row.class,
    groupName: row.group,
    name: row.name,
    normalizedName: normalizeSpellName(row.name),
    level: row.lvl,
    source: row.source,
  };
}

async function listCsvFiles(csvDirPath: string): Promise<string[]> {
  const entries = await readdir(csvDirPath, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".csv"))
    .map((entry) => resolve(csvDirPath, entry.name))
    .sort((a, b) => a.localeCompare(b));
}

async function loadRowsFromCsvFile(filePath: string): Promise<NormalizedRow[]> {
  const rawCsv = await readFile(filePath, "utf8");

  const parsed = parse(rawCsv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as unknown[];

  return parsed.map((row) => normalizeRow(csvRowSchema.parse(row)));
}

export async function syncSpellReferenceTableFromCsv(params: {
  prisma: PrismaClient;
  csvPath?: string;
  csvDir?: string;
}): Promise<SyncResult> {
  const csvPaths = params.csvPath
    ? [resolve(process.cwd(), params.csvPath)]
    : await listCsvFiles(resolve(process.cwd(), params.csvDir ?? "data"));

  if (csvPaths.length === 0) {
    throw new Error("No CSV files found for spell reference sync");
  }

  const incomingRows: NormalizedRow[] = [];
  for (const filePath of csvPaths) {
    const fileRows = await loadRowsFromCsvFile(filePath);
    incomingRows.push(...fileRows);
  }

  const existingRows = await params.prisma.spellReference.findMany({
    select: {
      id: true,
      className: true,
      groupName: true,
      name: true,
      normalizedName: true,
      level: true,
      source: true,
    },
  });

  const incomingMap = new Map<string, NormalizedRow>();
  for (const row of incomingRows) {
    incomingMap.set(rowKey(row), row);
  }

  const existingMap = new Map<string, (typeof existingRows)[number]>();
  for (const row of existingRows) {
    existingMap.set(rowKey(row), row);
  }

  const rowsToCreate: NormalizedRow[] = [];
  const rowsToUpdate: Array<{ id: number; name: string }> = [];
  const idsToDelete: number[] = [];

  for (const [key, incoming] of incomingMap.entries()) {
    const existing = existingMap.get(key);
    if (!existing) {
      rowsToCreate.push(incoming);
      continue;
    }

    if (existing.name !== incoming.name) {
      rowsToUpdate.push({ id: existing.id, name: incoming.name });
    }
  }

  for (const [key, existing] of existingMap.entries()) {
    if (!incomingMap.has(key)) {
      idsToDelete.push(existing.id);
    }
  }

  await params.prisma.$transaction(async (tx) => {
    if (idsToDelete.length > 0) {
      await tx.spellReference.deleteMany({
        where: { id: { in: idsToDelete } },
      });
    }

    for (const row of rowsToUpdate) {
      await tx.spellReference.update({
        where: { id: row.id },
        data: { name: row.name },
      });
    }

    if (rowsToCreate.length > 0) {
      await tx.spellReference.createMany({
        data: rowsToCreate,
        skipDuplicates: true,
      });
    }
  });

  return {
    files: csvPaths.length,
    read: incomingRows.length,
    created: rowsToCreate.length,
    updated: rowsToUpdate.length,
    deleted: idsToDelete.length,
  };
}
