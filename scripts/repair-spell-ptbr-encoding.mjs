import "dotenv/config";

import OpenAI from "openai";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL não configurada");
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY não configurada");
}

const rejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "true";
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized },
});

const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const openai = new OpenAI({ apiKey });

async function translateToPtBr(descriptionOriginal) {
  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
  const response = await openai.chat.completions.create({
    model,
    temperature: 0,
    messages: [
      {
        role: "system",
        content:
          "Translate AD&D spell narrative text to Brazilian Portuguese. Preserve meaning and game terms. Return only translated plain text.",
      },
      {
        role: "user",
        content: descriptionOriginal,
      },
    ],
  });

  return response.choices[0]?.message?.content?.trim() ?? "";
}

async function main() {
  const corrupted = await prisma.spell.findMany({
    where: {
      descriptionPtBr: {
        contains: "�",
      },
    },
    select: {
      id: true,
      name: true,
      descriptionOriginal: true,
    },
    orderBy: { id: "asc" },
  });

  if (corrupted.length === 0) {
    console.log("Nenhum registro com encoding inválido encontrado.");
    return;
  }

  let updated = 0;

  for (const spell of corrupted) {
    const translated = await translateToPtBr(spell.descriptionOriginal);

    if (!translated || translated.includes("�")) {
      console.log(`Falha ao corrigir id=${spell.id} (${spell.name}).`);
      continue;
    }

    await prisma.spell.update({
      where: { id: spell.id },
      data: { descriptionPtBr: translated },
    });

    updated += 1;
    console.log(`Corrigido id=${spell.id} (${spell.name}).`);
  }

  console.log(`Correção concluída. Atualizados: ${updated}/${corrupted.length}.`);
}

main()
  .catch((error) => {
    console.error("Erro ao corrigir encoding:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
