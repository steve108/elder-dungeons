import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
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

const STOP_WORDS = new Set([
  "and",
  "or",
  "the",
  "with",
  "without",
  "bonus",
  "bonuses",
  "penalty",
  "abilities",
  "ability",
  "social",
  "no",
  "of",
  "to",
  "in",
  "on",
  "for",
  "from",
  "vs",
  "race",
  "subrace",
]);

const SUBATTRIBUTE_TABLE_MAP = {
  STRENGTH: {
    Muscle: "StrengthMuscleScoreReference",
    Stamina: "StrengthStaminaScoreReference",
  },
  CONSTITUTION: {
    Health: "ConstitutionHealthScoreReference",
    Fitness: "ConstitutionFitnessScoreReference",
  },
  DEXTERITY: {
    Aim: "DexterityAimScoreReference",
    Balance: "DexterityBalanceScoreReference",
  },
  WISDOM: {
    Intuition: "WisdomIntuitionScoreReference",
    Willpower: "WisdomWillpowerScoreReference",
  },
  INTELLIGENCE: {
    Reason: "IntelligenceReasonScoreReference",
    Knowledge: "IntelligenceKnowledgeScoreReference",
  },
  CHARISMA: {
    Appearance: "CharismaAppearanceScoreReference",
    Leadership: "CharismaLeadershipScoreReference",
  },
};

function normalizeForMatch(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeName(name) {
  return normalizeForMatch(name)
    .split(" ")
    .filter((word) => word.length >= 3 && !STOP_WORDS.has(word));
}

function htmlToPlainText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\u00a0/g, " ")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

async function fetchFandomPageTextByTitle(title) {
  const parseUrl = `https://adnd2e.fandom.com/api.php?action=parse&page=${encodeURIComponent(title)}&prop=text&formatversion=2&format=json`;

  const response = await fetch(parseUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 ElderDungeons/1.0",
      Accept: "application/json,text/plain",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const html = data?.parse?.text;
  const parsedTitle = data?.parse?.title ?? title;

  if (!html) return null;

  return {
    text: htmlToPlainText(html),
    url: `https://adnd2e.fandom.com/wiki/${encodeURIComponent(String(parsedTitle).replace(/\s+/g, "_"))}`,
  };
}

async function searchFandomTitles(query) {
  const searchUrl = `https://adnd2e.fandom.com/api.php?action=query&list=search&format=json&srlimit=5&srsearch=${encodeURIComponent(query)}`;
  const response = await fetch(searchUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 ElderDungeons/1.0",
      Accept: "application/json,text/plain",
    },
    cache: "no-store",
  });

  if (!response.ok) return [];

  const data = await response.json();
  const titles = (data?.query?.search ?? [])
    .map((item) => String(item?.title ?? "").trim())
    .filter(Boolean);

  return Array.from(new Set(titles));
}

function findBestSnippet(pageText, targetName) {
  const lines = pageText.split("\n").filter(Boolean);
  const nameNorm = normalizeForMatch(targetName);
  const tokens = tokenizeName(targetName);

  if (lines.length === 0) return null;

  let bestIndex = -1;
  let bestScore = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const lineNorm = normalizeForMatch(lines[i]);
    if (!lineNorm) continue;

    let score = 0;
    if (lineNorm.includes(nameNorm)) score += 4;
    for (const token of tokens) {
      if (lineNorm.includes(token)) score += 1;
    }

    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  if (bestIndex < 0 || bestScore < 1) return null;

  const start = Math.max(0, bestIndex - 2);
  const end = Math.min(lines.length, bestIndex + 4);
  const snippet = lines.slice(start, end).join(" ").replace(/\s+/g, " ").trim();
  return snippet.length >= 30 ? snippet : null;
}

function findLeadSnippet(pageText) {
  const lines = pageText.split("\n").filter(Boolean);
  const lead = lines.slice(0, 4).join(" ").replace(/\s+/g, " ").trim();
  return lead.length >= 30 ? lead : null;
}

function shouldOverwrite(currentFull, shortDescription, nextFull) {
  const current = String(currentFull ?? "").trim();
  const short = String(shortDescription ?? "").trim();
  if (!current) return true;
  if (current === short) return true;
  if (current === nextFull) return false;
  return current.length < nextFull.length;
}

function fallbackFullDescription(shortDescription, sourceUrl) {
  const summary = String(shortDescription ?? "").trim();
  if (!summary) return null;
  return `${summary}\n\nReference source: ${sourceUrl}`;
}

async function buildRacePageCache(raceBases) {
  const raceTexts = new Map();
  for (const race of raceBases) {
    const page = await fetchFandomPageTextByTitle(race.name);
    if (page?.text) {
      raceTexts.set(race.id, page);
      continue;
    }

    const fallbackTitle = `${race.name} (Race)`;
    const fallback = await fetchFandomPageTextByTitle(fallbackTitle);
    if (fallback?.text) {
      raceTexts.set(race.id, fallback);
    }
  }
  return raceTexts;
}

async function hydrateRaceAbilities(raceBases, raceTexts, dryRun) {
  const abilities = await prisma.$queryRawUnsafe(
    'SELECT id, race_base_id AS "raceBaseId", name, description, full_description AS "fullDescription" FROM "RaceAbility" ORDER BY race_base_id ASC, name ASC',
  );

  let updated = 0;

  for (const ability of abilities) {
    const page = raceTexts.get(ability.raceBaseId);
    let bestSnippet = page ? findBestSnippet(page.text, ability.name) : null;
    let sourceUrl = page?.url ?? null;

    if (!bestSnippet) {
      const raceName = raceBases.find((r) => r.id === ability.raceBaseId)?.name ?? "";
      const searchQueries = [`${ability.name} ${raceName}`.trim(), ability.name];

      let found = false;
      for (const query of searchQueries) {
        const titles = await searchFandomTitles(query);
        for (const title of titles.slice(0, 3)) {
          const searchedPage = await fetchFandomPageTextByTitle(title);
          if (!searchedPage?.text) continue;
          const snippet = findBestSnippet(searchedPage.text, ability.name);
          if (!snippet) continue;
          bestSnippet = snippet;
          sourceUrl = searchedPage.url;
          found = true;
          break;
        }
        if (found) break;
      }
    }

    if (!bestSnippet) {
      bestSnippet = fallbackFullDescription(ability.description, sourceUrl ?? "https://adnd2e.fandom.com");
    }

    if (!bestSnippet) continue;

    const nextFull = bestSnippet.includes("Source:") || bestSnippet.includes("Reference source:")
      ? bestSnippet
      : `${bestSnippet}\n\nSource: ${sourceUrl ?? "https://adnd2e.fandom.com"}`;

    if (!shouldOverwrite(ability.fullDescription, ability.description, nextFull)) continue;

    if (!dryRun) {
      await prisma.$executeRawUnsafe(
        'UPDATE "RaceAbility" SET full_description = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        nextFull,
        ability.id,
      );
    }

    updated += 1;
  }

  return { total: abilities.length, updated };
}

async function hydrateRaceBases(raceTexts, dryRun) {
  const raceBases = await prisma.$queryRawUnsafe(
    'SELECT id, name, description, full_description AS "fullDescription" FROM "RaceBase" ORDER BY name ASC',
  );

  let updated = 0;

  for (const race of raceBases) {
    const page = raceTexts.get(race.id);
    if (!page) continue;

    const snippet = findBestSnippet(page.text, race.name) ?? findLeadSnippet(page.text);
    const nextFull = snippet
      ? `${snippet}\n\nSource: ${page.url}`
      : fallbackFullDescription(race.description, page.url);

    if (!nextFull) continue;
    if (!shouldOverwrite(race.fullDescription, race.description, nextFull)) continue;

    if (!dryRun) {
      await prisma.$executeRawUnsafe(
        'UPDATE "RaceBase" SET full_description = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        nextFull,
        race.id,
      );
    }

    updated += 1;
  }

  return { total: raceBases.length, updated };
}

async function hydrateSubRaces(raceBases, raceTexts, dryRun) {
  const subRaces = await prisma.$queryRawUnsafe(
    'SELECT sr.id, sr.name, sr.description, sr.full_description AS "fullDescription", sr.race_base_id AS "raceBaseId", rb.name AS "raceBaseName" FROM "SubRace" sr JOIN "RaceBase" rb ON rb.id = sr.race_base_id ORDER BY rb.name ASC, sr.name ASC',
  );

  let updated = 0;

  for (const sub of subRaces) {
    const racePage = raceTexts.get(sub.raceBaseId);
    let snippet = racePage ? findBestSnippet(racePage.text, sub.name) : null;
    let sourceUrl = racePage?.url ?? null;

    if (!snippet) {
      const searchQueries = [`${sub.name} ${sub.raceBaseName}`.trim(), sub.name];
      let found = false;
      for (const query of searchQueries) {
        const titles = await searchFandomTitles(query);
        for (const title of titles.slice(0, 3)) {
          const searchedPage = await fetchFandomPageTextByTitle(title);
          if (!searchedPage?.text) continue;
          const foundSnippet = findBestSnippet(searchedPage.text, sub.name) ?? findLeadSnippet(searchedPage.text);
          if (!foundSnippet) continue;
          snippet = foundSnippet;
          sourceUrl = searchedPage.url;
          found = true;
          break;
        }
        if (found) break;
      }
    }

    const nextFull = snippet
      ? `${snippet}\n\nSource: ${sourceUrl ?? "https://adnd2e.fandom.com"}`
      : fallbackFullDescription(sub.description, sourceUrl ?? racePage?.url ?? "https://adnd2e.fandom.com");

    if (!nextFull) continue;
    if (!shouldOverwrite(sub.fullDescription, sub.description, nextFull)) continue;

    if (!dryRun) {
      await prisma.$executeRawUnsafe(
        'UPDATE "SubRace" SET full_description = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        nextFull,
        sub.id,
      );
    }

    updated += 1;
  }

  return { total: subRaces.length, updated };
}

async function hydrateAttributeDefinitions(dryRun) {
  const attributes = await prisma.$queryRawUnsafe(
    'SELECT id, name, description, full_description AS "fullDescription" FROM "AttributeDefinition" ORDER BY name ASC',
  );

  let updated = 0;

  for (const attr of attributes) {
    const subRows = await prisma.$queryRawUnsafe(
      'SELECT name FROM "SubAttributeDefinition" WHERE attribute_id = $1 ORDER BY name ASC',
      attr.id,
    );
    const subNames = subRows.map((row) => row.name).join(", ");

    const detailed = `${String(attr.description ?? "").trim()}\n\nDetailed reference: This core attribute is resolved through these POSP subattributes: ${subNames}. Mechanical progression is sourced from the subattribute score reference tables used by this project.\n\nSource: AD&D 2e Player\'s Option: Skills & Powers (POSP).`;

    if (!String(attr.description ?? "").trim()) continue;
    if (!shouldOverwrite(attr.fullDescription, attr.description, detailed)) continue;

    if (!dryRun) {
      await prisma.$executeRawUnsafe(
        'UPDATE "AttributeDefinition" SET full_description = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        detailed,
        attr.id,
      );
    }

    updated += 1;
  }

  return { total: attributes.length, updated };
}

async function hydrateSubAttributeDefinitions(dryRun) {
  const subAttrs = await prisma.$queryRawUnsafe(
    'SELECT sad.id, sad.name, sad.description, sad.full_description AS "fullDescription", ad.name AS "attributeName" FROM "SubAttributeDefinition" sad JOIN "AttributeDefinition" ad ON ad.id = sad.attribute_id ORDER BY ad.name ASC, sad.name ASC',
  );

  let updated = 0;

  for (const sub of subAttrs) {
    const tableName = SUBATTRIBUTE_TABLE_MAP[sub.attributeName]?.[sub.name];
    if (!tableName) continue;

    const rowCountResult = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS c FROM "${tableName}"`);
    const rowCount = Number(rowCountResult?.[0]?.c ?? 0);

    const detailed = `${String(sub.description ?? "").trim()}\n\nDetailed reference: Mechanical outcomes for ${sub.attributeName}/${sub.name} are defined in table ${tableName}, currently with ${rowCount} score rows, and are used to resolve modifiers and thresholds in character calculations.\n\nSource: AD&D 2e Player\'s Option: Skills & Powers (POSP).`;

    if (!String(sub.description ?? "").trim()) continue;
    if (!shouldOverwrite(sub.fullDescription, sub.description, detailed)) continue;

    if (!dryRun) {
      await prisma.$executeRawUnsafe(
        'UPDATE "SubAttributeDefinition" SET full_description = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        detailed,
        sub.id,
      );
    }

    updated += 1;
  }

  return { total: subAttrs.length, updated };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const raceBases = await prisma.$queryRawUnsafe('SELECT id, name FROM "RaceBase" ORDER BY name ASC');
  const raceTexts = await buildRacePageCache(raceBases);

  const [abilities, bases, subRaces, attributes, subAttributes] = await Promise.all([
    hydrateRaceAbilities(raceBases, raceTexts, dryRun),
    hydrateRaceBases(raceTexts, dryRun),
    hydrateSubRaces(raceBases, raceTexts, dryRun),
    hydrateAttributeDefinitions(dryRun),
    hydrateSubAttributeDefinitions(dryRun),
  ]);

  console.log(
    JSON.stringify(
      {
        dryRun,
        racePagesLoaded: raceTexts.size,
        raceAbility: abilities,
        raceBase: bases,
        subRace: subRaces,
        attributeDefinition: attributes,
        subAttributeDefinition: subAttributes,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error("Erro na hidratação de fullDescription:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
