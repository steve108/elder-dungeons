import 'dotenv/config';
import pg from 'pg';

const GROUPS_PAGE = 'Nonweapon_Proficiency_Groups_(POSP)';
const DESCRIPTIONS_PAGE = 'Proficiency_Descriptions_(POSP)';
const API_URL = 'https://adnd2e.fandom.com/api.php';
const SOURCE_URL_GROUPS = 'https://adnd2e.fandom.com/wiki/Nonweapon_Proficiency_Groups_(POSP)';
const SOURCE_URL_DESCRIPTIONS = 'https://adnd2e.fandom.com/wiki/Proficiency_Descriptions_(POSP)';

const { Client } = pg;

const GROUP_ORDER = ['GENERAL', 'PRIEST', 'ROGUE', 'WARRIOR', 'WIZARD'];

function normalizeName(value) {
  return (value || '')
    .toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9:/,\-\s]/g, '')
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
    .replace(/\(Proficiency\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractWikitablesByGroup(wikitext) {
  const sectionMatch = wikitext.match(/==Table 45: Nonweapon Proficiency Groups==([\s\S]*?)\*Cost in character points/i);
  const sectionText = sectionMatch ? sectionMatch[1] : wikitext;
  const regex = /===\s*([A-Z]+)\s*===\s*\n\{\|[\s\S]*?\|\}/g;
  const blocks = [];
  let match;
  while ((match = regex.exec(sectionText)) !== null) {
    blocks.push({ group: match[1].trim(), table: match[0] });
  }
  return blocks;
}

function parseTableRows(tableText) {
  const rows = [];
  const rowRegex = /\n\s*\|-\s*\n([\s\S]*?)(?=\n\s*\|-\s*\n|\n\s*\|\}|$)/g;
  const rowMatches = [...tableText.matchAll(rowRegex)];

  for (const rowMatch of rowMatches) {
    const rowBlock = rowMatch[1] || '';
    const cellLines = rowBlock
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('|'))
      .map((line) => line.replace(/^\|\s?/, '').trim());

    if (cellLines.length < 4) continue;

    const [nameRaw, costRaw, ratingRaw, abilityRaw] = cellLines;
    const name = cleanCell(nameRaw)
      .replace(/\s*\(Proficiency\)\s*/gi, '')
      .replace(/\s+\(specific\)/gi, ' (specific)')
      .trim();

    const cost = Number.parseInt(cleanCell(costRaw).replace(/\s*CP\s*/i, ''), 10);
    const initialRating = cleanCell(ratingRaw);
    const ability = cleanCell(abilityRaw).replace(/\s*\/\s*/g, '/').replace(/\s+,\s+/g, ', ');

    if (!name || Number.isNaN(cost)) continue;

    rows.push({ name, cost, initialRating, ability });
  }
  return rows;
}

function parseDescriptions(wikitext) {
  const entries = new Map();
  const regex = /==\s*([^=]+?)\s*==\s*\n([\s\S]*?)(?=\n==\s*[^=]+?\s*==|$)/g;
  let match;

  while ((match = regex.exec(wikitext)) !== null) {
    const title = cleanCell(match[1]);
    if (!title || /Table\s+\d+/i.test(title)) continue;

    const content = (match[2] || '')
      .replace(/\{\{[^{}]*\}\}/g, '')
      .replace(/\[\[Category:[^\]]+\]\]/gi, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!content) continue;

    const plain = cleanCell(content.replace(/\n/g, ' '));
    const paragraph = content
      .split(/\n\n+/)
      .map((part) => cleanCell(part))
      .find((part) => part.length > 0) || plain;

    entries.set(normalizeName(title), {
      heading: title,
      fullDescription: cleanCell(content.replace(/\n+/g, '\n')).replace(/\n\s+/g, '\n').trim(),
      description: paragraph,
    });
  }

  return entries;
}

const DESCRIPTION_ALIASES = new Map([
  ['gem cutting', 'gem-cutting'],
  ['leatherworking', 'leather working'],
  ['riding, airborne', 'riding, airborne and riding, land'],
  ['riding, land-based', 'riding, airborne and riding, land'],
]);

function getDescriptionByName(map, proficiencyName) {
  const key = normalizeName(proficiencyName);
  if (map.has(key)) return map.get(key);

  const alias = DESCRIPTION_ALIASES.get(key);
  if (alias && map.has(normalizeName(alias))) return map.get(normalizeName(alias));

  return null;
}

function toClassGroup(group) {
  const normalized = group.toUpperCase();
  if (!GROUP_ORDER.includes(normalized)) throw new Error(`Unknown group ${group}`);
  return normalized;
}

async function fetchWikitext(page) {
  const url = `${API_URL}?action=parse&page=${encodeURIComponent(page)}&prop=wikitext&format=json&formatversion=2`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed ${page}: HTTP ${response.status}`);
  const json = await response.json();
  return json?.parse?.wikitext || '';
}

async function upsertProficiency(client, data) {
  const existing = await client.query(
    `SELECT id FROM "NonWeaponProficiency" WHERE name = $1`,
    [data.name]
  );

  if (existing.rows.length === 0) {
    const inserted = await client.query(
      `INSERT INTO "NonWeaponProficiency" (
         name,
         description,
         full_description,
         source_url,
         point_cost,
         initial_rating,
         ability_text,
         updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,CURRENT_TIMESTAMP)
       RETURNING id`,
      [
        data.name,
        data.description,
        data.fullDescription,
        data.sourceUrl,
        data.pointCost,
        data.initialRating,
        data.abilityText,
      ]
    );
    return inserted.rows[0].id;
  }

  const id = existing.rows[0].id;
  await client.query(
    `UPDATE "NonWeaponProficiency"
     SET description = $2,
         full_description = $3,
         source_url = $4,
         point_cost = $5,
         initial_rating = $6,
         ability_text = $7,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [
      id,
      data.description,
      data.fullDescription,
      data.sourceUrl,
      data.pointCost,
      data.initialRating,
      data.abilityText,
    ]
  );

  return id;
}

async function upsertRate(client, proficiencyId, rate) {
  await client.query(
      `INSERT INTO "NonWeaponProficiencyRate" (
       proficiency_id,
       class_group,
       point_cost,
       initial_rating,
       ability_text,
       updated_at
     ) VALUES ($1,$2::"ProficiencyClassGroup",$3,$4,$5,CURRENT_TIMESTAMP)
     ON CONFLICT (proficiency_id, class_group)
     DO UPDATE SET
       point_cost = EXCLUDED.point_cost,
       initial_rating = EXCLUDED.initial_rating,
       ability_text = EXCLUDED.ability_text,
       updated_at = CURRENT_TIMESTAMP`,
    [proficiencyId, rate.classGroup, rate.pointCost, rate.initialRating, rate.abilityText]
  );
}

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    const [groupsWikitext, descWikitext] = await Promise.all([
      fetchWikitext(GROUPS_PAGE),
      fetchWikitext(DESCRIPTIONS_PAGE),
    ]);

    const groupBlocks = extractWikitablesByGroup(groupsWikitext);
    const descriptions = parseDescriptions(descWikitext);

    const ratesByName = new Map();

    for (const block of groupBlocks) {
      const classGroup = toClassGroup(block.group);
      const rows = parseTableRows(block.table);
      for (const row of rows) {
        const key = normalizeName(row.name);
        if (!ratesByName.has(key)) {
          ratesByName.set(key, {
            canonicalName: row.name,
            rates: [],
          });
        }
        ratesByName.get(key).rates.push({
          classGroup,
          pointCost: row.cost,
          initialRating: row.initialRating,
          abilityText: row.ability,
        });
      }
    }

    await client.query('BEGIN');

    let proficiencyCount = 0;
    let rateCount = 0;
    let missingDescriptionCount = 0;

    for (const entry of ratesByName.values()) {
      const orderedRates = entry.rates.sort((a, b) => GROUP_ORDER.indexOf(a.classGroup) - GROUP_ORDER.indexOf(b.classGroup));
      const defaultRate = orderedRates.find((rate) => rate.classGroup === 'GENERAL') || orderedRates[0];
      const descriptionData = getDescriptionByName(descriptions, entry.canonicalName);

      if (!descriptionData) missingDescriptionCount += 1;

      const proficiencyId = await upsertProficiency(client, {
        name: entry.canonicalName,
        description: descriptionData?.description ?? null,
        fullDescription: descriptionData?.fullDescription ?? null,
        sourceUrl: SOURCE_URL_DESCRIPTIONS,
        pointCost: defaultRate?.pointCost ?? null,
        initialRating: defaultRate?.initialRating ?? null,
        abilityText: defaultRate?.abilityText ?? null,
      });

      proficiencyCount += 1;

      for (const rate of orderedRates) {
        await upsertRate(client, proficiencyId, rate);
        rateCount += 1;
      }
    }

    await client.query('COMMIT');

    const dbCounts = await client.query(`
      SELECT
         (SELECT COUNT(*)::int FROM "NonWeaponProficiency") AS prof_total,
         (SELECT COUNT(*)::int FROM "NonWeaponProficiencyRate") AS rate_total,
         (SELECT COUNT(*)::int FROM "NonWeaponProficiency" WHERE full_description IS NOT NULL) AS with_full_desc
    `);

    console.log(JSON.stringify({
      importedProficiencies: proficiencyCount,
      importedRates: rateCount,
      missingDescriptionCount,
      totalsInDb: dbCounts.rows[0],
      sourceGroups: SOURCE_URL_GROUPS,
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
