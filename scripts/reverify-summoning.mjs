import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const AUTH_USER = "steve";
const AUTH_PASS = "123456";
const API_URL = "http://localhost:3000/api/spell-reference-hydrate";

function normalizeSpellName(name) {
  return (name ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function classifyReferenceClass(className) {
  const normalized = (className ?? "").trim().toLowerCase();
  if (normalized.includes("wizard") || normalized.includes("mage")) return "arcane";
  if (normalized.includes("priest") || normalized.includes("druid")) return "divine";
  return null;
}

async function callHydrate(name, spellClass) {
  const token = Buffer.from(`${AUTH_USER}:${AUTH_PASS}`, "utf8").toString("base64");
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${token}`,
    },
    body: JSON.stringify({
      name,
      spellClass,
      limit: 1,
      retryMissing: true,
    }),
  });

  const text = await response.text();
  let data = {};
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: `Invalid JSON response: ${text.slice(0, 200)}` };
  }

  return { ok: response.ok, data };
}

async function run() {
  const refs = await prisma.spellReference.findMany({
    where: {
      OR: [
        { normalizedName: { contains: "summon", mode: "insensitive" } },
        { normalizedName: { contains: "summoning", mode: "insensitive" } },
      ],
    },
    orderBy: [{ normalizedName: "asc" }, { className: "asc" }, { level: "asc" }, { source: "asc" }],
  });

  const grouped = new Map();
  for (const row of refs) {
    const spellClass = classifyReferenceClass(row.className);
    if (!spellClass) continue;

    const key = `${row.normalizedName}::${spellClass}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        normalizedName: row.normalizedName,
        name: row.name,
        spellClass,
      });
    }
  }

  const candidates = [...grouped.values()];
  console.log(`SUMMONING_CANDIDATES=${candidates.length}`);

  const spells = await prisma.spell.findMany({
    select: { id: true, name: true, spellClass: true },
  });

  let saved = 0;
  let notFound = 0;
  let errors = 0;

  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i];

    const idsToDelete = spells
      .filter(
        (item) =>
          item.spellClass === candidate.spellClass &&
          normalizeSpellName(item.name) === candidate.normalizedName,
      )
      .map((item) => item.id);

    if (idsToDelete.length > 0) {
      await prisma.spell.deleteMany({ where: { id: { in: idsToDelete } } });
    }

    await prisma.spellReferenceMissing.deleteMany({
      where: {
        normalizedName: candidate.normalizedName,
        spellClass: candidate.spellClass,
      },
    });

    try {
      const result = await callHydrate(candidate.name, candidate.spellClass);
      const processed = Array.isArray(result.data?.processed) ? result.data.processed : [];
      const first = processed[0] ?? null;

      if (first?.status === "saved") {
        saved += 1;
      } else if (first?.status === "not-found") {
        notFound += 1;
      } else {
        errors += 1;
      }

      console.log(
        `[${String(i + 1).padStart(3, "0")}/${String(candidates.length).padStart(3, "0")}] ${candidate.name} (${candidate.spellClass}) -> ${first?.status ?? "error"}`,
      );
    } catch (error) {
      errors += 1;
      console.log(
        `[${String(i + 1).padStart(3, "0")}/${String(candidates.length).padStart(3, "0")}] ${candidate.name} (${candidate.spellClass}) -> error: ${error instanceof Error ? error.message : "unknown"}`,
      );
    }
  }

  console.log(`RESULT saved=${saved} notFound=${notFound} errors=${errors}`);
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
