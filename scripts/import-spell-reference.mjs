import "dotenv/config";

import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse/sync";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não configurada no ambiente.");
}

const rejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "true";
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized,
  },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function normalizeSpellName(name) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function rowKey(row) {
  return `${row.normalizedName}::${row.className}::${row.groupName}::${row.level}::${row.source}`;
}

function normalizeRow(input) {
  const className = String(input.class ?? "").trim();
  const groupName = String(input.group ?? "").trim();
  const name = String(input.name ?? "").trim();
  const source = String(input.source ?? "").trim();
  const levelMatch = String(input.lvl ?? "")
    .trim()
    .match(/\d+/);
  const level = levelMatch ? Number(levelMatch[0]) : Number.NaN;

  if (!className || !groupName || !name || !source || Number.isNaN(level)) {
    return null;
  }

  return {
    className,
    groupName,
    name,
    normalizedName: normalizeSpellName(name),
    level,
    source,
  };
}

async function syncFromCsv(csvPathArg) {
  const resolvedInput = resolve(process.cwd(), csvPathArg);
  const isCsvFile = resolvedInput.toLowerCase().endsWith(".csv");

  const csvPaths = isCsvFile
    ? [resolvedInput]
    : (await readdir(resolvedInput, { withFileTypes: true }))
        .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".csv"))
        .map((entry) => resolve(resolvedInput, entry.name))
        .sort((a, b) => a.localeCompare(b));

  if (csvPaths.length === 0) {
    throw new Error(`Nenhum CSV encontrado em: ${resolvedInput}`);
  }

  const incomingRows = [];

  for (const csvPath of csvPaths) {
    const rawCsv = await readFile(csvPath, "utf8");
    const parsed = parse(rawCsv, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    incomingRows.push(...parsed.map(normalizeRow).filter(Boolean));
  }

  const existingRows = await prisma.spellReference.findMany({
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

  const incomingMap = new Map(incomingRows.map((row) => [rowKey(row), row]));
  const existingMap = new Map(existingRows.map((row) => [rowKey(row), row]));

  const rowsToCreate = [];
  const rowsToUpdate = [];
  const idsToDelete = [];

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

  await prisma.$transaction(async (tx) => {
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

async function main() {
  const csvPathArg = process.argv[2] ?? "data";
  const result = await syncFromCsv(csvPathArg);

  console.log(
    `Sincronização concluída. Arquivos: ${result.files}. Lidos: ${result.read}. Criados: ${result.created}. Atualizados: ${result.updated}. Removidos: ${result.deleted}.`,
  );
}

main()
  .catch((error) => {
    console.error("Erro na importação:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
