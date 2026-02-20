import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { assertAdminOrJwt } from "@/lib/auth";
import { parseSpellFromOpenAI } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { buildSpellDedupeKey, spellPayloadSchema, type SpellClass } from "@/lib/spell";
import { normalizeSpellName } from "@/lib/spell-reference";

type HydrateItemResult = {
  normalizedName: string;
  name: string;
  spellClass: SpellClass;
  level: number;
  status: "saved" | "not-found" | "skipped";
  reason?: string;
  spellId?: number;
  matchedUrl?: string;
};

type MissingSpellRow = {
  id: number;
  normalizedName: string;
  spellName: string;
  spellClass: SpellClass;
  referenceSource: string | null;
  reason: string;
  lastUrl: string | null;
  attemptCount: number;
  updatedAt: string;
};

type ApiResponse = {
  processed?: HydrateItemResult[];
  missing?: MissingSpellRow[];
  error?: string;
};

type CandidateReference = {
  normalizedName: string;
  name: string;
  spellClass: SpellClass;
  level: number;
  referenceSource: string;
};

type WebSpellText = {
  text: string;
  url: string;
};

const hydrateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  spellClass: z.enum(["arcane", "divine"]).optional(),
  limit: z.number().int().min(1).max(10).default(1),
  retryMissing: z.boolean().default(false),
  retryOnlyMissing: z.boolean().default(false),
  retryOrder: z.enum(["oldest", "newest"]).default("oldest"),
});

function splitCsvLikeList(value?: string | null): string[] {
  if (!value) return [];

  return value
    .split(/[,/;|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function mergeUniqueValues(...lists: string[][]): string[] {
  const set = new Set<string>();
  for (const list of lists) {
    for (const item of list) {
      set.add(item);
    }
  }

  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function classifyReferenceClass(className: string): SpellClass | null {
  const normalized = className.trim().toLowerCase();

  if (normalized.includes("wizard") || normalized.includes("mage")) {
    return "arcane";
  }

  if (normalized.includes("priest") || normalized.includes("druid")) {
    return "divine";
  }

  return null;
}

function htmlToPlainText(value: string): string {
  return value
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\s*\/\s*(p|div|section|article|h1|h2|h3|h4|h5|h6|li|tr|table)\s*>/gi, "\n")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanupFandomNoise(text: string): string {
  return text
    .replace(/^\s*ADVERTISEMENT\s*$/gim, "")
    .replace(/^\s*SIGN IN TO EDIT\s*$/gim, "")
    .replace(/^\s*For other[^\n]*see[^\n]*\.?\s*$/gim, "")
    .replace(/^\s*Switch to Light Theme\s*$/gim, "")
    .replace(/^\s*We Care About Your Privacy[\s\S]*$/gim, "")
    .trim();
}

function splitKnownSpellSections(text: string): string {
  return text
    .replace(/\b(Spell Level|Class|School|Sphere|Details|Range|Duration|AOE|Casting Time|Save|Requirements|Source)\b/gi, "\n$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractNarrativeBody(text: string): string {
  const lines = text.split(/\r?\n/);
  const metadataLikeLine =
    /^(For other .* see .*|Spell Level\b|Class\b|School\b|Sphere\b|Details\b|Range\b|Duration\b|AOE\b|Casting Time\b|Save\b|Requirements\b|Source\b|.*\(\s*[SMV, ]+\s*\))$/i;

  let startIndex = 0;
  while (startIndex < lines.length) {
    const line = lines[startIndex].trim();
    if (!line) {
      startIndex += 1;
      continue;
    }

    if (metadataLikeLine.test(line)) {
      startIndex += 1;
      continue;
    }

    break;
  }

  const body = lines.slice(startIndex).join("\n").trim();
  return body.length > 0 ? body : text;
}

function extractCanonicalSpellText(text: string, spellName: string): string {
  const cleaned = splitKnownSpellSections(cleanupFandomNoise(text));
  const lower = cleaned.toLowerCase();
  const lowerName = spellName.toLowerCase();

  const detailsIndex = lower.indexOf("details");
  const spellLevelIndex = lower.indexOf("spell level");
  const nameIndex = lower.indexOf(lowerName);

  const startCandidates = [detailsIndex, spellLevelIndex, nameIndex].filter((value) => value >= 0);
  const start = startCandidates.length > 0 ? Math.max(0, Math.min(...startCandidates) - 160) : 0;

  const endMarkers = [
    "recent images",
    "fandom homepage",
    "additional links",
    "categories community content",
    "advanced dungeons & dragons 2nd edition wiki is a fandom",
  ];

  let end = cleaned.length;
  for (const marker of endMarkers) {
    const idx = lower.indexOf(marker, start + 200);
    if (idx >= 0) {
      end = Math.min(end, idx);
    }
  }

  const window = cleaned.slice(start, Math.min(end, start + 12000)).trim();
  if (window.length === 0) {
    return buildSpellSnippet(cleaned, spellName);
  }

  return extractNarrativeBody(window);
}

function isLikelyAdnd2e(text: string): boolean {
  const markers = [
    /ad\s*&\s*d/i,
    /2nd\s+edition/i,
    /\b2e\b/i,
    /player'?s handbook/i,
    /spells\s*&\s*magic/i,
    /tome\s+of\s+magic/i,
  ];

  return markers.some((regex) => regex.test(text));
}


function buildSpellSnippet(text: string, spellName: string): string {
  const normalizedText = text.replace(/\s+/g, " ").trim();
  const lowerText = normalizedText.toLowerCase();
  const lowerName = spellName.toLowerCase();
  const index = lowerText.indexOf(lowerName);

  if (index === -1) {
    return normalizedText.slice(0, 6000);
  }

  const start = Math.max(0, index - 1000);
  const end = Math.min(normalizedText.length, index + 5000);
  return normalizedText.slice(start, end);
}

function countSpellMetadataMarkers(text: string): number {
  const markers = [
    /\brange\b\s*:?/i,
    /\bduration\b\s*:?/i,
    /\bcasting\s*time\b\s*:?/i,
    /\bcomponents\b\s*:?/i,
    /\bsaving\s*throw\b\s*:?/i,
  ];

  return markers.reduce((count, regex) => count + (regex.test(text) ? 1 : 0), 0);
}

function normalizeWikiTitle(title: string): string {
  return title
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeForMatch(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getClassWikiTag(spellClass: SpellClass): string {
  return spellClass === "divine" ? "Priest_Spell" : "Wizard_Spell";
}

function getExpectedSourceMarkers(referenceSource: string): string[] {
  const normalized = referenceSource.trim().toUpperCase();

  if (normalized === "PHB") {
    return ["player's handbook", "players handbook"];
  }

  if (normalized === "TOM") {
    return ["tome of magic"];
  }

  if (normalized === "CWH") {
    return ["complete wizard's handbook", "complete wizards handbook"];
  }

  return [];
}

function isStrict2eSpellPage(params: {
  plainText: string;
  spellName: string;
  spellClass: SpellClass;
  expectedLevel: number;
  referenceSource: string;
}): boolean {
  const plain = params.plainText;
  const normalizedPlain = normalizeForMatch(plain);
  const normalizedSpellName = normalizeForMatch(params.spellName);

  if (!normalizedPlain.includes(normalizedSpellName)) {
    return false;
  }

  if (countSpellMetadataMarkers(plain) < 3) {
    return false;
  }

  if (!isLikelyAdnd2e(plain)) {
    return false;
  }

  const classRegex =
    params.spellClass === "divine" ? /\bpriest\s+spell\b|\bclass\s*[:]?\s*priest\b/i : /\bwizard\s+spell\b|\bclass\s*[:]?\s*wizard\b/i;
  if (!classRegex.test(plain)) {
    return false;
  }

  const ordinalLevelRegex = new RegExp(`\\b${params.expectedLevel}(st|nd|rd|th)?\\s+level\\b`, "i");
  const fieldLevelRegex = new RegExp(`\\bspell\\s*level\\b[\\s:]*${params.expectedLevel}\\b`, "i");
  if (!ordinalLevelRegex.test(plain) && !fieldLevelRegex.test(plain)) {
    return false;
  }

  const sourceMarkers = getExpectedSourceMarkers(params.referenceSource);
  if (sourceMarkers.length > 0) {
    const lowered = plain.toLowerCase();
    if (!sourceMarkers.some((marker) => lowered.includes(marker))) {
      return false;
    }
  }

  return true;
}

function extractFandomWikiUrlsFromSearchHtml(html: string): string[] {
  const urls: string[] = [];

  for (const match of html.matchAll(/href="(https:\/\/adnd2e\.fandom\.com\/wiki\/[^"]+)"/gi)) {
    urls.push(match[1]);
  }

  for (const match of html.matchAll(/href="(\/wiki\/[^"]+)"/gi)) {
    urls.push(`https://adnd2e.fandom.com${match[1]}`);
  }

  return Array.from(
    new Set(
      urls
        .map((url) => url.split("#")[0])
        .filter((url) => !url.includes("Category:") && !url.includes("Special:")),
    ),
  ).slice(0, 10);
}

function extractFandomSpellUrlsFromCategoryHtml(html: string): string[] {
  const urls: string[] = [];

  for (const match of html.matchAll(/href="(https:\/\/adnd2e\.fandom\.com\/wiki\/[^"]+)"/gi)) {
    urls.push(match[1]);
  }

  for (const match of html.matchAll(/href="(\/wiki\/[^"]+)"/gi)) {
    urls.push(`https://adnd2e.fandom.com${match[1]}`);
  }

  return Array.from(
    new Set(
      urls
        .map((url) => url.split("#")[0])
        .filter(
          (url) =>
            !url.includes("Category:") &&
            !url.includes("Special:") &&
            !url.includes("File:") &&
            !url.includes("Template:"),
        ),
    ),
  );
}

function extractWikiTitleFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const index = parsed.pathname.toLowerCase().indexOf("/wiki/");
    if (index === -1) return null;
    const rawTitle = parsed.pathname.slice(index + "/wiki/".length);
    if (!rawTitle) return null;
    return normalizeWikiTitle(decodeURIComponent(rawTitle));
  } catch {
    return null;
  }
}

async function fetchFandomPageTextByTitle(title: string): Promise<{ text: string; url: string } | null> {
  const parseUrl =
    `https://adnd2e.fandom.com/api.php?action=parse&page=${encodeURIComponent(title)}&prop=text&formatversion=2&format=json`;

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

  const data = (await response.json()) as {
    parse?: {
      text?: string;
      title?: string;
    };
  };

  const html = data.parse?.text;
  const parsedTitle = data.parse?.title ?? title;
  if (!html) {
    return null;
  }

  return {
    text: htmlToPlainText(html),
    url: `https://adnd2e.fandom.com/wiki/${encodeURIComponent(parsedTitle.replace(/\s+/g, "_"))}`,
  };
}

async function searchSpellTextOnAdnd2eFandom(candidate: CandidateReference): Promise<WebSpellText | null> {
  const classTag = getClassWikiTag(candidate.spellClass);
  const candidateTitles = new Set<string>([
    normalizeWikiTitle(candidate.name),
    normalizeWikiTitle(`${candidate.name} (${classTag.replace(/_/g, " ")})`),
  ]);

  const searchUrl =
    `https://adnd2e.fandom.com/api.php?action=query&list=search&format=json&srlimit=6&srsearch=${encodeURIComponent(
      `${candidate.name} ${classTag}`,
    )}`;

  const searchResponse = await fetch(searchUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 ElderDungeons/1.0",
      Accept: "application/json,text/plain",
    },
    cache: "no-store",
  });

  if (!searchResponse.ok) {
    return null;
  }

  const searchData = (await searchResponse.json()) as {
    query?: {
      search?: Array<{ title?: string }>;
    };
  };

  const titles = Array.from(
    new Set(
      (searchData.query?.search ?? [])
        .map((item) => normalizeWikiTitle(item.title ?? ""))
        .filter((title) => title.length > 0),
    ),
  );

  titles.forEach((title) => candidateTitles.add(normalizeWikiTitle(title)));

  const htmlSearchUrl = `https://adnd2e.fandom.com/wiki/Special:Search?query=${encodeURIComponent(candidate.name)}`;
  const htmlSearchResponse = await fetch(htmlSearchUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 ElderDungeons/1.0",
      Accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  });

  if (htmlSearchResponse.ok) {
    const htmlSearch = await htmlSearchResponse.text();
    const searchUrls = extractFandomWikiUrlsFromSearchHtml(htmlSearch);
    for (const url of searchUrls) {
      const title = extractWikiTitleFromUrl(url);
      if (title) candidateTitles.add(title);
    }
  }

  const categoryResponse = await fetch("https://adnd2e.fandom.com/wiki/Category:Spells", {
    headers: {
      "User-Agent": "Mozilla/5.0 ElderDungeons/1.0",
      Accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  });

  if (categoryResponse.ok) {
    const categoryHtml = await categoryResponse.text();
    const categoryUrls = extractFandomSpellUrlsFromCategoryHtml(categoryHtml);
    const normalizedNeedle = normalizeForMatch(candidate.name);
    const prioritizedCategoryUrls = categoryUrls
      .filter((url) => normalizeForMatch(url).includes(normalizedNeedle))
      .slice(0, 8);
    for (const url of prioritizedCategoryUrls) {
      const title = extractWikiTitleFromUrl(url);
      if (title) candidateTitles.add(title);
    }
  }

  const orderedTitles = Array.from(candidateTitles);

  for (const title of orderedTitles) {
    try {
      const pageData = await fetchFandomPageTextByTitle(title);
      if (!pageData) {
        continue;
      }

      const plain = pageData.text;
      if (!plain || plain.length < 500) {
        continue;
      }

      if (
        !isStrict2eSpellPage({
          plainText: plain,
          spellName: candidate.name,
          spellClass: candidate.spellClass,
          expectedLevel: candidate.level,
          referenceSource: candidate.referenceSource,
        })
      ) {
        continue;
      }

      return {
        text: extractCanonicalSpellText(plain, candidate.name),
        url: pageData.url,
      };
    } catch {
      // try next fandom page
    }
  }

  return null;
}

async function searchSpellTextStrict(candidate: CandidateReference): Promise<WebSpellText | null> {
  try {
    const fandomResult = await searchSpellTextOnAdnd2eFandom(candidate);
    if (fandomResult) {
      return fandomResult;
    }
  } catch {
    // strict mode: no fallback to non-fandom sources
  }

  return null;
}

async function upsertMissingSpell(params: {
  normalizedName: string;
  spellName: string;
  spellClass: SpellClass;
  referenceSource: string;
  reason: string;
  lastUrl?: string;
}): Promise<void> {
  await prisma.$executeRaw`
    INSERT INTO "SpellReferenceMissing" (
      "normalized_name",
      "spell_name",
      "spell_class",
      "reference_source",
      "reason",
      "last_url",
      "attempt_count",
      "created_at",
      "updated_at"
    )
    VALUES (
      ${params.normalizedName},
      ${params.spellName},
      ${params.spellClass},
      ${params.referenceSource},
      ${params.reason},
      ${params.lastUrl ?? null},
      1,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    ON CONFLICT ("normalized_name", "spell_class")
    DO UPDATE SET
      "spell_name" = EXCLUDED."spell_name",
      "reference_source" = EXCLUDED."reference_source",
      "reason" = EXCLUDED."reason",
      "last_url" = EXCLUDED."last_url",
      "attempt_count" = "SpellReferenceMissing"."attempt_count" + 1,
      "updated_at" = CURRENT_TIMESTAMP
  `;
}

async function listMissingSpells(limit = 100): Promise<MissingSpellRow[]> {
  const rows = await prisma.$queryRaw<Array<{
    id: number;
    normalized_name: string;
    spell_name: string;
    spell_class: string;
    reference_source: string | null;
    reason: string;
    last_url: string | null;
    attempt_count: number;
    updated_at: Date;
  }>>`
    SELECT
      "id",
      "normalized_name",
      "spell_name",
      "spell_class",
      "reference_source",
      "reason",
      "last_url",
      "attempt_count",
      "updated_at"
    FROM "SpellReferenceMissing"
    ORDER BY "updated_at" DESC
    LIMIT ${limit}
  `;

  return rows.map((row) => ({
    id: row.id,
    normalizedName: row.normalized_name,
    spellName: row.spell_name,
    spellClass: row.spell_class === "divine" ? "divine" : "arcane",
    referenceSource: row.reference_source,
    reason: row.reason,
    lastUrl: row.last_url,
    attemptCount: row.attempt_count,
    updatedAt: row.updated_at.toISOString(),
  }));
}

async function clearMissingSpell(params: {
  normalizedName: string;
  spellClass: SpellClass;
}): Promise<void> {
  await prisma.$executeRaw`
    DELETE FROM "SpellReferenceMissing"
    WHERE "normalized_name" = ${params.normalizedName}
      AND "spell_class" = ${params.spellClass}
  `;
}

async function getCandidateSpells(params: {
  name?: string;
  spellClass?: SpellClass;
  limit: number;
  retryMissing: boolean;
  retryOnlyMissing: boolean;
  retryOrder: "oldest" | "newest";
}): Promise<CandidateReference[]> {
  const whereName = params.name ? normalizeSpellName(params.name) : null;

  const referenceRows = await prisma.spellReference.findMany({
    where: whereName ? { normalizedName: whereName } : undefined,
    orderBy: [
      { normalizedName: "asc" },
      { className: "asc" },
      { level: "asc" },
      { source: "asc" },
    ],
  });

  const grouped = new Map<string, CandidateReference>();

  for (const row of referenceRows) {
    const spellClass = classifyReferenceClass(row.className);
    if (!spellClass) continue;
    if (params.spellClass && params.spellClass !== spellClass) continue;

    const key = `${row.normalizedName}::${spellClass}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        normalizedName: row.normalizedName,
        name: row.name,
        spellClass,
        level: row.level,
        referenceSource: row.source,
      });
    }
  }

  const existingSpells = await prisma.spell.findMany({
    select: {
      name: true,
      spellClass: true,
    },
  });

  const existingKeys = new Set(
    existingSpells.map((item) => `${normalizeSpellName(item.name)}::${item.spellClass === "divine" ? "divine" : "arcane"}`),
  );

  const missingRows = await prisma.$queryRaw<Array<{
    normalized_name: string;
    spell_class: string;
    updated_at: Date;
  }>>`
    SELECT "normalized_name", "spell_class"
    , "updated_at"
    FROM "SpellReferenceMissing"
  `;

  const missingKeys = new Set(
    missingRows.map((item) => `${item.normalized_name}::${item.spell_class === "divine" ? "divine" : "arcane"}`),
  );

  const candidates: CandidateReference[] = [];

  const missingOrderedKeys = missingRows
    .slice()
    .sort((a, b) => {
      const diff = a.updated_at.getTime() - b.updated_at.getTime();
      return params.retryOrder === "oldest" ? diff : -diff;
    })
    .map((item) => `${item.normalized_name}::${item.spell_class === "divine" ? "divine" : "arcane"}`);

  if (params.retryMissing && params.retryOnlyMissing) {
    for (const key of missingOrderedKeys) {
      const row = grouped.get(key);
      if (!row || existingKeys.has(key)) {
        continue;
      }

      candidates.push(row);
      if (candidates.length >= params.limit) {
        return candidates;
      }
    }

    return candidates;
  }

  if (params.retryMissing) {
    for (const key of missingOrderedKeys) {
      const row = grouped.get(key);
      if (!row || existingKeys.has(key) || !missingKeys.has(key)) {
        continue;
      }

      candidates.push(row);
      if (candidates.length >= params.limit) {
        return candidates;
      }
    }
  }

  for (const [key, row] of grouped.entries()) {
    if (existingKeys.has(key) || (!params.retryMissing && missingKeys.has(key))) {
      continue;
    }

    candidates.push(row);
    if (candidates.length >= params.limit) {
      break;
    }
  }

  return candidates;
}

async function processOneCandidate(candidate: CandidateReference): Promise<HydrateItemResult> {
  const webData = await searchSpellTextStrict(candidate);

  if (!webData) {
    const reason = "SPELL_NOT_FOUND_IN_ADND2E_WEB_SOURCES";
    await upsertMissingSpell({
      normalizedName: candidate.normalizedName,
      spellName: candidate.name,
      spellClass: candidate.spellClass,
      referenceSource: candidate.referenceSource,
      reason,
    });

    return {
      normalizedName: candidate.normalizedName,
      name: candidate.name,
      spellClass: candidate.spellClass,
      level: candidate.level,
      status: "not-found",
      reason,
    };
  }

  try {
    const parsed = await parseSpellFromOpenAI({
      text: [
        `EXPECTED_NAME: ${candidate.name}`,
        `EXPECTED_CLASS: ${candidate.spellClass}`,
        `EXPECTED_LEVEL: ${candidate.level}`,
        `EXPECTED_SOURCE: ${candidate.referenceSource}`,
        "",
        webData.text,
      ].join("\n"),
    });

    const normalizedParsedName = normalizeSpellName(parsed.name);
    if (normalizedParsedName !== candidate.normalizedName) {
      throw new Error(`Nome divergente no parse (${parsed.name}).`);
    }

    const schoolValues = mergeUniqueValues(splitCsvLikeList(parsed.school));
    const sphereValues = mergeUniqueValues(splitCsvLikeList(parsed.sphere));

    let resolvedSchool = schoolValues;
    let resolvedSphere = sphereValues;

    if (candidate.spellClass === "arcane") {
      resolvedSchool = mergeUniqueValues(schoolValues, sphereValues);
      resolvedSphere = [];
    }

    if (candidate.spellClass === "divine" && resolvedSphere.length === 0) {
      throw new Error("Magia divina sem esfera identificada.");
    }

    const payload = spellPayloadSchema.parse({
      ...parsed,
      name: candidate.name,
      level: candidate.level,
      spellClass: candidate.spellClass,
      school: resolvedSchool.length > 0 ? resolvedSchool.join(", ") : null,
      sphere: resolvedSphere.length > 0 ? resolvedSphere.join(", ") : null,
      source: parsed.source ?? candidate.referenceSource,
      sourceImageUrl: null,
    });

    const dedupeKey = buildSpellDedupeKey(payload);

    const existingByClass = await prisma.spell.findMany({
      where: {
        spellClass: payload.spellClass,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    });

    const existingByIdentity =
      existingByClass.find((row) => normalizeSpellName(row.name) === candidate.normalizedName) ?? null;

    const updateData = {
      dedupeKey,
      name: payload.name,
      spellClass: payload.spellClass,
      level: payload.level,
      school: payload.school,
      sphere: payload.sphere,
      source: payload.source,
      rangeText: payload.rangeText,
      target: payload.target,
      durationText: payload.durationText,
      castingTime: payload.castingTime,
      components: payload.components,
      componentDesc: payload.componentDesc,
      componentCost: payload.componentCost,
      componentConsumed: payload.componentConsumed,
      canBeDispelled: payload.canBeDispelled,
      dispelHow: payload.dispelHow,
      combat: payload.combat,
      utility: payload.utility,
      savingThrow: payload.savingThrow,
      savingThrowOutcome: payload.savingThrowOutcome,
      magicalResistance: payload.magicalResistance,
      summaryEn: payload.summaryEn,
      summaryPtBr: payload.summaryPtBr,
      descriptionOriginal: payload.descriptionOriginal,
      descriptionPtBr: payload.descriptionPtBr,
      sourceImageUrl: payload.sourceImageUrl,
    };

    const upsertUpdateData = {
      spellClass: payload.spellClass,
      level: payload.level,
      school: payload.school,
      sphere: payload.sphere,
      source: payload.source,
      rangeText: payload.rangeText,
      target: payload.target,
      durationText: payload.durationText,
      castingTime: payload.castingTime,
      components: payload.components,
      componentDesc: payload.componentDesc,
      componentCost: payload.componentCost,
      componentConsumed: payload.componentConsumed,
      canBeDispelled: payload.canBeDispelled,
      dispelHow: payload.dispelHow,
      combat: payload.combat,
      utility: payload.utility,
      savingThrow: payload.savingThrow,
      savingThrowOutcome: payload.savingThrowOutcome,
      magicalResistance: payload.magicalResistance,
      summaryEn: payload.summaryEn,
      summaryPtBr: payload.summaryPtBr,
      descriptionOriginal: payload.descriptionOriginal,
      descriptionPtBr: payload.descriptionPtBr,
      sourceImageUrl: payload.sourceImageUrl,
    };

    const saveAction = existingByIdentity
      ? prisma.spell.update({
          where: { id: existingByIdentity.id },
          data: updateData,
          select: { id: true },
        })
      : prisma.spell.upsert({
          where: { dedupeKey },
          update: upsertUpdateData,
          create: {
            ...payload,
            dedupeKey,
          },
          select: { id: true },
        });

    const saved = await saveAction;

    await clearMissingSpell({
      normalizedName: candidate.normalizedName,
      spellClass: candidate.spellClass,
    });

    return {
      normalizedName: candidate.normalizedName,
      name: candidate.name,
      spellClass: candidate.spellClass,
      level: candidate.level,
      status: "saved",
      spellId: saved.id,
      matchedUrl: webData.url,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "PARSE_OR_SAVE_FAILED";

    await upsertMissingSpell({
      normalizedName: candidate.normalizedName,
      spellName: candidate.name,
      spellClass: candidate.spellClass,
      referenceSource: candidate.referenceSource,
      reason,
      lastUrl: webData.url,
    });

    return {
      normalizedName: candidate.normalizedName,
      name: candidate.name,
      spellClass: candidate.spellClass,
      level: candidate.level,
      status: "not-found",
      reason,
      matchedUrl: webData.url,
    };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    assertAdminOrJwt(req.headers.authorization);

    if (req.method === "GET") {
      const missing = await listMissingSpells(100);
      return res.status(200).json({ missing });
    }

    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const parsedBody = hydrateSchema.parse(req.body ?? {});
    const candidates = await getCandidateSpells({
      name: parsedBody.name,
      spellClass: parsedBody.spellClass,
      limit: parsedBody.limit,
      retryMissing: parsedBody.retryMissing,
      retryOnlyMissing: parsedBody.retryOnlyMissing,
      retryOrder: parsedBody.retryOrder,
    });

    if (candidates.length === 0) {
      return res.status(200).json({
        processed: [],
        error: "Nenhum candidate pendente para processar com os filtros informados.",
      });
    }

    const processed: HydrateItemResult[] = [];

    for (const candidate of candidates) {
      processed.push(await processOneCandidate(candidate));
    }

    const missing = await listMissingSpells(100);
    return res.status(200).json({ processed, missing });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Parâmetros inválidos para hidratação de spell." });
    }

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
