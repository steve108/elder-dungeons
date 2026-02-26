import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

const SOURCE_URLS = {
  table48: 'https://adnd2e.fandom.com/wiki/Weapon_Proficiency_and_Mastery_(POSP)',
  table50: 'https://adnd2e.fandom.com/wiki/Nonproficiency_and_Weapon_Familiarity_(POSP)',
  table51: 'https://adnd2e.fandom.com/wiki/Shield_Proficiency_(POSP)',
  table52: 'https://adnd2e.fandom.com/wiki/Fighting_Style_Specialization_(POSP)',
  table53_54: 'https://adnd2e.fandom.com/wiki/Weapon_Specialization_and_Mastery_(POSP)',
};

async function fetchWikitext(page) {
  const url = `https://adnd2e.fandom.com/api.php?action=parse&page=${encodeURIComponent(page)}&prop=wikitext&format=json&formatversion=2`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${page}: HTTP ${response.status}`);
  const json = await response.json();
  return json?.parse?.wikitext || '';
}

function cleanText(value) {
  return (value || '')
    .replace(/\{\{frac\|([^|}]+)\|([^}]+)\}\}/gi, '$1/$2')
    .replace(/\{\{[^{}]*\}\}/g, '')
    .replace(/<sup>.*?<\/sup>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/&nbsp;/g, ' ')
    .replace(/'''/g, '')
    .replace(/''/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractCellText(line) {
  let work = line.trim();
  if (!work.startsWith('|') && !work.startsWith('!')) return null;
  work = work.slice(1).trim();

  const doubleSplit = work.split(/\|\|/g).map((part) => part.trim()).filter(Boolean);
  if (doubleSplit.length > 1) return doubleSplit.map((part) => cleanText(part));

  const chunks = work.split('|').map((part) => part.trim()).filter((part) => part.length > 0);
  if (chunks.length === 0) return null;
  return [cleanText(chunks[chunks.length - 1])];
}

function parseWikiTables(wikitext) {
  const lines = wikitext.split('\n');
  const tables = [];
  let currentTable = null;
  let currentRow = null;

  const flushRow = () => {
    if (currentTable && currentRow && currentRow.length > 0) {
      currentTable.rows.push(currentRow);
    }
    currentRow = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const normalizedLine = line.replace(/^:+/, '').trim();

    if (normalizedLine.startsWith('{|')) {
      currentTable = { caption: null, headers: [], rows: [] };
      currentRow = null;
      continue;
    }

    if (!currentTable) continue;

    if (normalizedLine.startsWith('|+')) {
      currentTable.caption = cleanText(normalizedLine.replace(/^\|\+/, ''));
      continue;
    }

    if (normalizedLine.startsWith('|-')) {
      flushRow();
      currentRow = [];
      continue;
    }

    if (normalizedLine.startsWith('!')) {
      const headerCells = extractCellText(normalizedLine) || [];
      if (headerCells.length > 0) {
        if (normalizedLine.includes('!!')) {
          currentTable.headers.push(...normalizedLine.split('!!').map((part, index) => {
            if (index === 0) return cleanText(part.replace(/^!/, ''));
            return cleanText(part);
          }));
        } else {
          currentTable.headers.push(...headerCells);
        }
      }
      continue;
    }

    if (normalizedLine.startsWith('|}')) {
      flushRow();
      tables.push(currentTable);
      currentTable = null;
      currentRow = null;
      continue;
    }

    if (normalizedLine.startsWith('|')) {
      const cells = extractCellText(normalizedLine) || [];
      if (!currentRow) currentRow = [];
      currentRow.push(...cells);
    }
  }

  return tables;
}

function getTableByNumber(tables, tableNumber) {
  return tables.find((table) => {
    const caption = cleanText(table.caption || '').toLowerCase();
    return caption.includes(`table ${tableNumber}`);
  }) || null;
}

function toInt(value) {
  const clean = cleanText(value).replace(/[^0-9-]/g, '');
  if (!clean) return null;
  const parsed = Number.parseInt(clean, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseTable48(rows) {
  const items = [];
  for (const row of rows) {
    if (row.length < 2) continue;
    const className = cleanText(row[0]);
    const cost = toInt(row[1]);
    if (!className || cost == null) continue;
    items.push({ className, cost, sourceUrl: SOURCE_URLS.table48 });
  }
  return items;
}

function parseTable50(rows) {
  const items = [];
  for (const row of rows) {
    if (row.length < 3) continue;
    const className = cleanText(row[0]);
    const nonproficiencyText = cleanText(row[1]);
    const familiarityText = cleanText(row[2]);
    if (!className || !nonproficiencyText || !familiarityText) continue;
    items.push({ className, nonproficiencyText, familiarityText, sourceUrl: SOURCE_URLS.table50 });
  }
  return items;
}

function parseTable51(rows) {
  const items = [];
  let order = 1;
  for (const row of rows) {
    if (row.length < 3) continue;
    const shieldType = cleanText(row[0]);
    const acBonusText = cleanText(row[1]);
    const attackersText = cleanText(row[2]);
    if (!shieldType || !acBonusText || !attackersText) continue;
    items.push({ shieldType, acBonusText, attackersText, sourceUrl: SOURCE_URLS.table51, displayOrder: order++ });
  }
  return items;
}

function parseTable52(rows) {
  const items = [];
  let order = 1;
  for (const row of rows) {
    if (row.length < 2) continue;
    const styleName = cleanText(row[0]);
    const eligibleClasses = cleanText(row[1]);
    if (!styleName || !eligibleClasses) continue;
    items.push({ styleName, eligibleClasses, sourceUrl: SOURCE_URLS.table52, displayOrder: order++ });
  }
  return items;
}

function parseAdvancementRows(rows, kind) {
  const items = [];
  let order = 1;
  for (const row of rows) {
    if (row.length < 3) continue;
    const className = cleanText(row[0]);
    const pointCost = toInt(row[1]);
    const minimumLevel = toInt(row[2]);
    if (!className || pointCost == null || minimumLevel == null) continue;
    items.push({ kind, className, pointCost, minimumLevel, sourceUrl: SOURCE_URLS.table53_54, displayOrder: order++ });
  }
  return items;
}

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    const [
      w48,
      w50,
      w51,
      w52,
      w53_54,
    ] = await Promise.all([
      fetchWikitext('Weapon Proficiency and Mastery (POSP)'),
      fetchWikitext('Nonproficiency and Weapon Familiarity (POSP)'),
      fetchWikitext('Shield Proficiency (POSP)'),
      fetchWikitext('Fighting Style Specialization (POSP)'),
      fetchWikitext('Weapon Specialization and Mastery (POSP)'),
    ]);

    const table48 = getTableByNumber(parseWikiTables(w48), 48);
    const table50 = getTableByNumber(parseWikiTables(w50), 50);
    const table51 = getTableByNumber(parseWikiTables(w51), 51);
    const table52 = getTableByNumber(parseWikiTables(w52), 52);
    const tables53_54 = parseWikiTables(w53_54);
    const table53 = getTableByNumber(tables53_54, 53);
    const table54 = getTableByNumber(tables53_54, 54);

    if (!table48 || !table50 || !table51 || !table52 || !table53 || !table54) {
      throw new Error('Could not resolve one or more POSP weapon proficiency tables (48,50,51,52,53,54).');
    }

    const cpCosts = parseTable48(table48.rows);
    const penalties = parseTable50(table50.rows);
    const shieldEffects = parseTable51(table51.rows);
    const fightingStyles = parseTable52(table52.rows);
    const specializationCosts = parseAdvancementRows(table53.rows, 'SPECIALIZATION');
    const masteryCosts = parseAdvancementRows(table54.rows, 'MASTERY');

    await client.query('BEGIN');

    await client.query('DELETE FROM "WeaponProficiencyCpCost"');
    await client.query('DELETE FROM "WeaponNonproficiencyPenalty"');
    await client.query('DELETE FROM "WeaponShieldProficiencyEffect"');
    await client.query('DELETE FROM "WeaponFightingStyleClass"');
    await client.query('DELETE FROM "WeaponAdvancementCost"');

    for (const row of cpCosts) {
      await client.query(
        `INSERT INTO "WeaponProficiencyCpCost" (class_name, cost, source_url, updated_at)
         VALUES ($1,$2,$3,CURRENT_TIMESTAMP)`,
        [row.className, row.cost, row.sourceUrl]
      );
    }

    for (const row of penalties) {
      await client.query(
        `INSERT INTO "WeaponNonproficiencyPenalty" (class_name, nonproficiency_text, familiarity_text, source_url, updated_at)
         VALUES ($1,$2,$3,$4,CURRENT_TIMESTAMP)`,
        [row.className, row.nonproficiencyText, row.familiarityText, row.sourceUrl]
      );
    }

    for (const row of shieldEffects) {
      await client.query(
        `INSERT INTO "WeaponShieldProficiencyEffect" (shield_type, ac_bonus_text, attackers_text, source_url, display_order, updated_at)
         VALUES ($1,$2,$3,$4,$5,CURRENT_TIMESTAMP)`,
        [row.shieldType, row.acBonusText, row.attackersText, row.sourceUrl, row.displayOrder]
      );
    }

    for (const row of fightingStyles) {
      await client.query(
        `INSERT INTO "WeaponFightingStyleClass" (style_name, eligible_classes, source_url, display_order, updated_at)
         VALUES ($1,$2,$3,$4,CURRENT_TIMESTAMP)`,
        [row.styleName, row.eligibleClasses, row.sourceUrl, row.displayOrder]
      );
    }

    for (const row of [...specializationCosts, ...masteryCosts]) {
      await client.query(
        `INSERT INTO "WeaponAdvancementCost" (kind, class_name, point_cost, minimum_level, source_url, display_order, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,CURRENT_TIMESTAMP)`,
        [row.kind, row.className, row.pointCost, row.minimumLevel, row.sourceUrl, row.displayOrder]
      );
    }

    await client.query('COMMIT');

    console.log(JSON.stringify({
      imported: {
        table48CpCosts: cpCosts.length,
        table50Penalties: penalties.length,
        table51ShieldEffects: shieldEffects.length,
        table52FightingStyles: fightingStyles.length,
        table53SpecializationCosts: specializationCosts.length,
        table54MasteryCosts: masteryCosts.length,
      },
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
