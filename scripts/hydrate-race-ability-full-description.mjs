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
]);

function normalizeForMatch(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeAbilityName(name) {
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

  if (!html) {
    return null;
  }

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

function findBestSnippet(pageText, abilityName) {
  const lines = pageText.split("\n").filter(Boolean);
  const abilityNorm = normalizeForMatch(abilityName);
  const tokens = tokenizeAbilityName(abilityName);

  if (tokens.length === 0 || lines.length === 0) {
    return null;
  }

  let bestIndex = -1;
  let bestScore = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const lineNorm = normalizeForMatch(lines[i]);
    if (!lineNorm) continue;

    let score = 0;

    if (lineNorm.includes(abilityNorm)) {
      score += 4;
    }

    for (const token of tokens) {
      if (lineNorm.includes(token)) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  if (bestIndex < 0 || bestScore < 1) {
    return null;
  }

  const start = Math.max(0, bestIndex - 2);
  const end = Math.min(lines.length, bestIndex + 4);
  const snippet = lines.slice(start, end).join(" ").replace(/\s+/g, " ").trim();

  return snippet.length >= 30 ? snippet : null;
}

function fallbackFullDescription(shortDescription, sourceUrl) {
  const summary = String(shortDescription ?? "").trim();
  if (!summary) return null;
  return `${summary}\n\nReference source: ${sourceUrl}`;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const raceBases = await prisma.$queryRawUnsafe(
    'SELECT id, name FROM "RaceBase" ORDER BY name ASC',
  );

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

  const abilities = await prisma.$queryRawUnsafe(
    'SELECT id, race_base_id AS "raceBaseId", name, description, full_description AS "fullDescription" FROM "RaceAbility" ORDER BY race_base_id ASC, name ASC',
  );

  let updated = 0;
  let skippedNoPage = 0;
  let skippedNoMatch = 0;

  for (const ability of abilities) {
    const page = raceTexts.get(ability.raceBaseId);
    let bestSnippet = null;
    let sourceUrl = null;

    if (page) {
      bestSnippet = findBestSnippet(page.text, ability.name);
      if (bestSnippet) {
        sourceUrl = page.url;
      }
    }

    if (!bestSnippet) {
      const raceName = raceBases.find((r) => r.id === ability.raceBaseId)?.name ?? "";
      const searchQueries = [
        `${ability.name} ${raceName}`.trim(),
        ability.name,
      ];

      let found = false;
      for (const query of searchQueries) {
        const titles = await searchFandomTitles(query);
        for (const title of titles.slice(0, 3)) {
          const searchedPage = await fetchFandomPageTextByTitle(title);
          if (!searchedPage?.text) continue;

          const searchedSnippet = findBestSnippet(searchedPage.text, ability.name);
          if (!searchedSnippet) continue;

          bestSnippet = searchedSnippet;
          sourceUrl = searchedPage.url;
          found = true;
          break;
        }
        if (found) break;
      }
    }

    if (!bestSnippet) {
      if (!page) {
        skippedNoPage += 1;
      } else {
        const fallback = fallbackFullDescription(ability.description, page.url);
        if (fallback) {
          bestSnippet = fallback;
          sourceUrl = page.url;
        } else {
          skippedNoMatch += 1;
        }
      }
      if (!bestSnippet) continue;
    }

    const currentFull = ability.fullDescription?.trim() ?? "";
    const currentShort = ability.description?.trim() ?? "";
    const nextFull = bestSnippet.includes("Source:") || bestSnippet.includes("Reference source:")
      ? bestSnippet
      : `${bestSnippet}\n\nSource: ${sourceUrl ?? page?.url ?? "https://adnd2e.fandom.com"}`;

    if (currentFull === nextFull) {
      continue;
    }

    if (currentFull && currentFull !== currentShort && currentFull.length >= nextFull.length) {
      continue;
    }

    if (!dryRun) {
      await prisma.$executeRawUnsafe(
        'UPDATE "RaceAbility" SET full_description = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        nextFull,
        ability.id,
      );
    }

    updated += 1;
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        racePagesLoaded: raceTexts.size,
        abilitiesTotal: abilities.length,
        updated,
        skippedNoPage,
        skippedNoMatch,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error("Erro na hidratação de fullDescription racial:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
