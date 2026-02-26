import 'dotenv/config';
import pg from 'pg';

const COSTS_PAGE = 'Traits & Disadvantages (POSP)';
const DESCRIPTIONS_PAGE = 'Traits & Disadvantages Descriptions (POSP)';
const API_URL = 'https://adnd2e.fandom.com/api.php';
const SOURCE_URL_COSTS = 'https://adnd2e.fandom.com/wiki/Traits_%26_Disadvantages_(POSP)';
const SOURCE_URL_DESCRIPTIONS = 'https://adnd2e.fandom.com/wiki/Traits_%26_Disadvantages_Descriptions_(POSP)';

const { Client } = pg;

function normalizeName(value) {
  return (value || '')
    .toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9:/,\-\s\(\)]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanCell(value) {
  return (value || '')
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/'''/g, '')
    .replace(/''/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchWikitext(page) {
  const url = `${API_URL}?action=parse&page=${encodeURIComponent(page)}&prop=wikitext&format=json&formatversion=2`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed ${page}: HTTP ${response.status}`);
  const json = await response.json();
  return json?.parse?.wikitext || '';
}

function parseRows(tableText, expectedCells) {
  const rows = [];
  const rowRegex = /\n\s*\|-\s*\n([\s\S]*?)(?=\n\s*\|-\s*\n|\n\s*\|\}|$)/g;
  const rowMatches = [...tableText.matchAll(rowRegex)];
  for (const rowMatch of rowMatches) {
    const rowBlock = rowMatch[1] || '';
    const cells = rowBlock
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('|'))
      .map((line) => line.replace(/^\|\s?/, '').trim());

    if (cells.length < expectedCells) continue;
    rows.push(cells.slice(0, expectedCells));
  }
  return rows;
}

function parseTraitCosts(wikitext) {
  const tableMatch = wikitext.match(/\|\+\s*Table 46:\s*Traits[\s\S]*?\n\s*\|\}/i);
  if (!tableMatch) return [];

  return parseRows(tableMatch[0], 2).map(([nameRaw, costRaw]) => ({
    name: cleanCell(nameRaw),
    pointCost: Number.parseInt(cleanCell(costRaw).replace(/[^0-9-]/g, ''), 10),
  })).filter((row) => row.name && !Number.isNaN(row.pointCost));
}

function parseDisadvantageCosts(wikitext) {
  const tableMatch = wikitext.match(/\|\+\s*Table 47:\s*Disadvantages[\s\S]*?\n\s*\|\}/i);
  if (!tableMatch) return [];

  return parseRows(tableMatch[0], 3).map(([nameRaw, moderateRaw, severeRaw]) => {
    const normalizeCost = (value) => {
      const cleaned = cleanCell(value).replace(/—/g, '').trim();
      if (!cleaned) return null;
      const parsed = Number.parseInt(cleaned.replace(/[^0-9-]/g, ''), 10);
      return Number.isNaN(parsed) ? null : parsed;
    };

    return {
      name: cleanCell(nameRaw),
      moderate: normalizeCost(moderateRaw),
      severe: normalizeCost(severeRaw),
    };
  }).filter((row) => row.name);
}

function parseDescriptions(wikitext) {
  const traitSection = wikitext.match(/==Trait Descriptions==([\s\S]*?)==Disadvantage Descriptions==/i);
  const disadvantageSection = wikitext.match(/==Disadvantage Descriptions==([\s\S]*)$/i);

  const parseSection = (sectionText) => {
    const map = new Map();
    const regex = /===\s*([^=]+?)\s*===\s*\n([\s\S]*?)(?=\n===\s*[^=]+?\s*===|$)/g;
    let match;
    while ((match = regex.exec(sectionText || '')) !== null) {
      const name = cleanCell(match[1]);
      const content = cleanCell((match[2] || '').replace(/\n+/g, '\n')).trim();
      if (!name || !content) continue;
      const firstParagraph = content.split(/\n\n+/)[0]?.trim() || content;
      map.set(normalizeName(name), {
        name,
        description: firstParagraph,
        fullDescription: content,
      });
    }
    return map;
  };

  return {
    traits: parseSection(traitSection?.[1] || ''),
    disadvantages: parseSection(disadvantageSection?.[1] || ''),
  };
}

const DESCRIPTION_ALIASES = new Map([
  ['doublejointed', 'double-jointed'],
  ['keen smell', 'keen olfactory sense'],
  ['keen taste', 'keen taste sense'],
  ['keen touch', 'keen touch sense'],
  ['tonguetied', 'tongue-tied'],
  ['phobia: monster (specific)', 'phobia: monster'],
  ['phobia: spiders', 'phobia: snakes'],
]);

function getDescription(map, name) {
  const key = normalizeName(name);
  if (map.has(key)) return map.get(key);
  const alias = DESCRIPTION_ALIASES.get(key);
  if (alias && map.has(normalizeName(alias))) return map.get(normalizeName(alias));
  return null;
}

async function upsertTrait(client, payload) {
  const existing = await client.query(
    `SELECT id FROM "TraitDisadvantage" WHERE name = $1`,
    [payload.name]
  );

  if (existing.rows.length === 0) {
    await client.query(
      `INSERT INTO "TraitDisadvantage" (
        name,
        kind,
        description,
        full_description,
        source_url,
        point_cost,
        point_cost_moderate,
        point_cost_severe,
        updated_at
      ) VALUES ($1,$2::"TraitDisadvantageKind",$3,$4,$5,$6,$7,$8,CURRENT_TIMESTAMP)`,
      [
        payload.name,
        payload.kind,
        payload.description,
        payload.fullDescription,
        payload.sourceUrl,
        payload.pointCost,
        payload.pointCostModerate,
        payload.pointCostSevere,
      ]
    );
    return;
  }

  await client.query(
    `UPDATE "TraitDisadvantage"
     SET kind = $2::"TraitDisadvantageKind",
         description = $3,
         full_description = $4,
         source_url = $5,
         point_cost = $6,
         point_cost_moderate = $7,
         point_cost_severe = $8,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [
      existing.rows[0].id,
      payload.kind,
      payload.description,
      payload.fullDescription,
      payload.sourceUrl,
      payload.pointCost,
      payload.pointCostModerate,
      payload.pointCostSevere,
    ]
  );
}

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    const [costWikitext, descriptionsWikitext] = await Promise.all([
      fetchWikitext(COSTS_PAGE),
      fetchWikitext(DESCRIPTIONS_PAGE),
    ]);

    const traits = parseTraitCosts(costWikitext);
    const disadvantages = parseDisadvantageCosts(costWikitext);
    const descriptions = parseDescriptions(descriptionsWikitext);

    await client.query('BEGIN');

    let traitCount = 0;
    let disadvantageCount = 0;
    let missingTraitDescriptions = 0;
    let missingDisadvantageDescriptions = 0;

    for (const row of traits) {
      const desc = getDescription(descriptions.traits, row.name);
      if (!desc) missingTraitDescriptions += 1;
      const fallback = `No detailed description entry found in ${DESCRIPTIONS_PAGE} for this item.`;

      await upsertTrait(client, {
        name: row.name,
        kind: 'TRAIT',
        description: desc?.description ?? fallback,
        fullDescription: desc?.fullDescription ?? fallback,
        sourceUrl: SOURCE_URL_DESCRIPTIONS,
        pointCost: row.pointCost,
        pointCostModerate: null,
        pointCostSevere: null,
      });

      traitCount += 1;
    }

    for (const row of disadvantages) {
      const desc = getDescription(descriptions.disadvantages, row.name);
      if (!desc) missingDisadvantageDescriptions += 1;
      const fallback = `No detailed description entry found in ${DESCRIPTIONS_PAGE} for this item.`;

      const effectivePointCost = row.moderate ?? row.severe ?? 0;

      await upsertTrait(client, {
        name: row.name,
        kind: 'DISADVANTAGE',
        description: desc?.description ?? fallback,
        fullDescription: desc?.fullDescription ?? fallback,
        sourceUrl: SOURCE_URL_DESCRIPTIONS,
        pointCost: effectivePointCost,
        pointCostModerate: row.moderate,
        pointCostSevere: row.severe,
      });

      disadvantageCount += 1;
    }

    await client.query('COMMIT');

    const totals = await client.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE kind = 'TRAIT')::int AS traits,
        COUNT(*) FILTER (WHERE kind = 'DISADVANTAGE')::int AS disadvantages,
        COUNT(*) FILTER (WHERE full_description IS NOT NULL)::int AS with_full_desc
      FROM "TraitDisadvantage"
    `);

    console.log(JSON.stringify({
      importedTraits: traitCount,
      importedDisadvantages: disadvantageCount,
      missingTraitDescriptions,
      missingDisadvantageDescriptions,
      totalsInDb: totals.rows[0],
      sourceCosts: SOURCE_URL_COSTS,
      sourceDescriptions: SOURCE_URL_DESCRIPTIONS,
    }, null, 2));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
