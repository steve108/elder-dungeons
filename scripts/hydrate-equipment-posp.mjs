import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

const SOURCE_URLS = {
  settings: 'https://adnd2e.fandom.com/wiki/Equipment_Tables:_Settings_(POSP)',
  weapons: 'https://adnd2e.fandom.com/wiki/POSP_Table_64',
  missile: 'https://adnd2e.fandom.com/wiki/POSP_Table_65',
  armor: 'https://adnd2e.fandom.com/wiki/POSP_Table_66',
  misc: 'https://adnd2e.fandom.com/wiki/POSP_Table_67',
  trade: 'https://adnd2e.fandom.com/wiki/POSP_Table_68',
  demihuman: 'https://adnd2e.fandom.com/wiki/Demihuman_Equipment_(POSP)',
  commonMagic: 'https://adnd2e.fandom.com/wiki/POSP_Table_73',
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
    .replace(/\{\{[^{}]*\}\}/g, '')
    .replace(/<sup>.*?<\/sup>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/{{br}}/gi, ' ')
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

    if (line.startsWith('{|')) {
      currentTable = { caption: null, headers: [], rows: [] };
      currentRow = null;
      continue;
    }

    if (!currentTable) continue;

    if (line.startsWith('|+')) {
      currentTable.caption = cleanText(line.replace(/^\|\+/, ''));
      continue;
    }

    if (line.startsWith('|-')) {
      flushRow();
      currentRow = [];
      continue;
    }

    if (line.startsWith('!')) {
      const headerCells = extractCellText(line) || [];
      if (headerCells.length > 0) {
        if (line.includes('!!')) {
          currentTable.headers.push(...line.split('!!').map((part, index) => {
            if (index === 0) return cleanText(part.replace(/^!/, ''));
            return cleanText(part);
          }));
        } else {
          currentTable.headers.push(...headerCells);
        }
      }
      continue;
    }

    if (line.startsWith('|}')) {
      flushRow();
      tables.push(currentTable);
      currentTable = null;
      currentRow = null;
      continue;
    }

    if (line.startsWith('|')) {
      const cells = extractCellText(line) || [];
      if (!currentRow) currentRow = [];
      currentRow.push(...cells);
    }
  }

  return tables;
}

function parseSettingsItems(wikitext) {
  const results = [];
  const sectionRegex = /==Table\s+(\d+):\s*([^=]+)==([\s\S]*?)(?=\n==Table\s+\d+:|$)/g;
  let sectionMatch;

  while ((sectionMatch = sectionRegex.exec(wikitext)) !== null) {
    const tableNumber = Number.parseInt(sectionMatch[1], 10);
    const settingName = cleanText(sectionMatch[2]);
    const body = sectionMatch[3] || '';

    const categoryRegex = /'''([^']+):'''\s*\n([\s\S]*?)(?=\n'''[^']+'''\s*:?|$)/g;
    let categoryMatch;
    while ((categoryMatch = categoryRegex.exec(body)) !== null) {
      const category = cleanText(categoryMatch[1]).replace(/:$/, '');
      const rawItems = (categoryMatch[2] || '').replace(/\n/g, ' ').trim();
      if (!rawItems) continue;

      const items = rawItems.split(';').map((part) => part.trim()).filter(Boolean);
      for (const rawItem of items) {
        const isLimited = /''[^']+''/.test(rawItem);
        const itemName = cleanText(rawItem.replace(/''/g, ''));
        if (!itemName) continue;

        results.push({
          tableNumber,
          settingName,
          category,
          itemName,
          isLimited,
          sourceUrl: SOURCE_URLS.settings,
        });
      }
    }
  }

  return results;
}

function parseWeapons(rows) {
  const items = [];
  let order = 1;
  for (const row of rows) {
    if (row.length < 8) continue;
    const [itemName, costText, weightText, sizeText, typeText, factorText, damageSmMed, damageLarge] = row;
    if (!itemName) continue;
    items.push({ itemName, costText, weightText, sizeText, typeText, factorText, damageSmMed, damageLarge, notes: null, sourceUrl: SOURCE_URLS.weapons, displayOrder: order++ });
  }
  return items;
}

function parseMissileRanges(rows) {
  const items = [];
  let category = null;
  let order = 1;

  for (const row of rows) {
    if (row.length < 5) continue;
    const [itemRaw, rof, shortRange, mediumRange, longRange] = row;
    const itemName = cleanText(itemRaw);
    if (!itemName) continue;

    if (itemName.endsWith(':') || itemName.startsWith('*')) {
      category = itemName.replace(/^\*+/, '').replace(/:$/, '').trim();
      continue;
    }

    if (/^—/.test(itemName) && !category) category = 'Uncategorized';

    items.push({
      category,
      itemName,
      rateOfFire: rof || null,
      shortRange: shortRange || null,
      mediumRange: mediumRange || null,
      longRange: longRange || null,
      notes: null,
      sourceUrl: SOURCE_URLS.missile,
      displayOrder: order++,
    });
  }

  return items;
}

function parseArmor(rows) {
  const armor = [];
  let order = 1;

  for (const row of rows) {
    if (row.length < 5) continue;
    const [itemName, costText, weightText, acText, bulkPoints] = row;
    if (!itemName || !costText) continue;
    armor.push({ itemName, costText, weightText, acText, bulkPoints, sourceUrl: SOURCE_URLS.armor, displayOrder: order++ });
  }

  return armor;
}

function parseShields(rows) {
  const shields = [];
  let order = 1;

  for (const row of rows) {
    if (row.length < 5) continue;
    const [itemName, costText, weightText, numFoesText, bulkPoints] = row;
    if (!itemName || !costText) continue;
    shields.push({ itemName, costText, weightText, numFoesText, bulkPoints, sourceUrl: SOURCE_URLS.armor, displayOrder: order++ });
  }

  return shields;
}

function parseSimpleEquipment(rows, sourceUrl) {
  const items = [];
  let order = 1;
  for (const row of rows) {
    if (row.length < 5) continue;
    const [itemName, costText, weightText, bulkPoints, initialAvail] = row;
    if (!itemName) continue;
    items.push({ itemName, costText: costText || null, weightText: weightText || null, bulkPoints: bulkPoints || null, initialAvail: initialAvail || null, sourceUrl, displayOrder: order++ });
  }
  return items;
}

function parseDemihuman(tables) {
  const items = [];
  let order = 1;

  for (const table of tables) {
    const caption = cleanText(table.caption || '');
    const match = caption.match(/Table\s+(\d+):\s*([^*]+)/i);
    if (!match) continue;
    const demihumanType = cleanText(match[2]);

    for (const row of table.rows) {
      if (row.length < 4) continue;
      const [itemName, costText, weightText, bulkPoints] = row;
      if (!itemName) continue;

      items.push({
        demihumanType,
        itemName,
        costText: costText || null,
        weightText: weightText || null,
        bulkPoints: bulkPoints || null,
        sourceUrl: SOURCE_URLS.demihuman,
        displayOrder: order++,
      });
    }
  }

  return items;
}

function parseCommonMagic(rows) {
  const items = [];
  let order = 1;

  for (const row of rows) {
    if (row.length < 7) continue;
    const [itemName, occurrenceLow, occurrenceMedium, occurrenceHigh, costText, weightText, bulkPoints] = row;
    if (!itemName || itemName.toLowerCase() === 'item') continue;
    items.push({ itemName, occurrenceLow, occurrenceMedium, occurrenceHigh, costText, weightText, bulkPoints, sourceUrl: SOURCE_URLS.commonMagic, displayOrder: order++ });
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
      settingsWikitext,
      weaponsWikitext,
      missileWikitext,
      armorWikitext,
      miscWikitext,
      tradeWikitext,
      demihumanWikitext,
      commonMagicWikitext,
    ] = await Promise.all([
      fetchWikitext('Equipment Tables: Settings (POSP)'),
      fetchWikitext('POSP Table 64'),
      fetchWikitext('POSP Table 65'),
      fetchWikitext('POSP Table 66'),
      fetchWikitext('POSP Table 67'),
      fetchWikitext('POSP Table 68'),
      fetchWikitext('Demihuman Equipment (POSP)'),
      fetchWikitext('POSP Table 73'),
    ]);

    const settingsItems = parseSettingsItems(settingsWikitext);
    const weaponsTable = parseWikiTables(weaponsWikitext)[0] || { rows: [] };
    const missileTable = parseWikiTables(missileWikitext)[0] || { rows: [] };
    const armorTables = parseWikiTables(armorWikitext);
    const armorTable = armorTables[0] || { rows: [] };
    const shieldTable = armorTables[1] || { rows: [] };
    const miscTable = parseWikiTables(miscWikitext)[0] || { rows: [] };
    const tradeTable = parseWikiTables(tradeWikitext)[0] || { rows: [] };
    const demihumanTables = parseWikiTables(demihumanWikitext);
    const commonMagicTable = parseWikiTables(commonMagicWikitext)[0] || { rows: [] };

    const weapons = parseWeapons(weaponsTable.rows);
    const missileRanges = parseMissileRanges(missileTable.rows);
    const armor = parseArmor(armorTable.rows);
    const shields = parseShields(shieldTable.rows);
    const miscItems = parseSimpleEquipment(miscTable.rows, SOURCE_URLS.misc);
    const tradeGoods = parseSimpleEquipment(tradeTable.rows, SOURCE_URLS.trade);
    const demihumanItems = parseDemihuman(demihumanTables);
    const commonMagicItems = parseCommonMagic(commonMagicTable.rows);

    await client.query('BEGIN');

    await client.query('DELETE FROM "EquipmentSettingItem"');
    await client.query('DELETE FROM "EquipmentWeapon"');
    await client.query('DELETE FROM "EquipmentMissileRange"');
    await client.query('DELETE FROM "EquipmentArmor"');
    await client.query('DELETE FROM "EquipmentShield"');
    await client.query('DELETE FROM "EquipmentMiscItem"');
    await client.query('DELETE FROM "EquipmentTradeGood"');
    await client.query('DELETE FROM "EquipmentDemihumanItem"');
    await client.query('DELETE FROM "EquipmentCommonMagicItem"');

    for (const row of settingsItems) {
      await client.query(
        `INSERT INTO "EquipmentSettingItem" (table_number, setting_name, category, item_name, is_limited, source_url, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,CURRENT_TIMESTAMP)`,
        [row.tableNumber, row.settingName, row.category, row.itemName, row.isLimited, row.sourceUrl]
      );
    }

    for (const row of weapons) {
      await client.query(
        `INSERT INTO "EquipmentWeapon" (item_name, cost_text, weight_text, size_text, type_text, factor_text, damage_sm_med, damage_large, notes, source_url, display_order, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,CURRENT_TIMESTAMP)`,
        [row.itemName, row.costText, row.weightText, row.sizeText, row.typeText, row.factorText, row.damageSmMed, row.damageLarge, row.notes, row.sourceUrl, row.displayOrder]
      );
    }

    for (const row of missileRanges) {
      await client.query(
        `INSERT INTO "EquipmentMissileRange" (category, item_name, rate_of_fire, short_range, medium_range, long_range, notes, source_url, display_order, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,CURRENT_TIMESTAMP)`,
        [row.category, row.itemName, row.rateOfFire, row.shortRange, row.mediumRange, row.longRange, row.notes, row.sourceUrl, row.displayOrder]
      );
    }

    for (const row of armor) {
      await client.query(
        `INSERT INTO "EquipmentArmor" (item_name, cost_text, weight_text, ac_text, bulk_points, source_url, display_order, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,CURRENT_TIMESTAMP)`,
        [row.itemName, row.costText, row.weightText, row.acText, row.bulkPoints, row.sourceUrl, row.displayOrder]
      );
    }

    for (const row of shields) {
      await client.query(
        `INSERT INTO "EquipmentShield" (item_name, cost_text, weight_text, num_foes_text, bulk_points, source_url, display_order, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,CURRENT_TIMESTAMP)`,
        [row.itemName, row.costText, row.weightText, row.numFoesText, row.bulkPoints, row.sourceUrl, row.displayOrder]
      );
    }

    for (const row of miscItems) {
      await client.query(
        `INSERT INTO "EquipmentMiscItem" (item_name, cost_text, weight_text, bulk_points, initial_avail, source_url, display_order, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,CURRENT_TIMESTAMP)`,
        [row.itemName, row.costText, row.weightText, row.bulkPoints, row.initialAvail, row.sourceUrl, row.displayOrder]
      );
    }

    for (const row of tradeGoods) {
      await client.query(
        `INSERT INTO "EquipmentTradeGood" (item_name, cost_text, weight_text, bulk_points, initial_avail, source_url, display_order, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,CURRENT_TIMESTAMP)`,
        [row.itemName, row.costText, row.weightText, row.bulkPoints, row.initialAvail, row.sourceUrl, row.displayOrder]
      );
    }

    for (const row of demihumanItems) {
      await client.query(
        `INSERT INTO "EquipmentDemihumanItem" (demihuman_type, item_name, cost_text, weight_text, bulk_points, source_url, display_order, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,CURRENT_TIMESTAMP)`,
        [row.demihumanType, row.itemName, row.costText, row.weightText, row.bulkPoints, row.sourceUrl, row.displayOrder]
      );
    }

    for (const row of commonMagicItems) {
      await client.query(
        `INSERT INTO "EquipmentCommonMagicItem" (item_name, occurrence_low, occurrence_medium, occurrence_high, cost_text, weight_text, bulk_points, source_url, display_order, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,CURRENT_TIMESTAMP)`,
        [row.itemName, row.occurrenceLow, row.occurrenceMedium, row.occurrenceHigh, row.costText, row.weightText, row.bulkPoints, row.sourceUrl, row.displayOrder]
      );
    }

    await client.query('COMMIT');

    console.log(JSON.stringify({
      imported: {
        settingsItems: settingsItems.length,
        weapons: weapons.length,
        missileRanges: missileRanges.length,
        armor: armor.length,
        shields: shields.length,
        miscItems: miscItems.length,
        tradeGoods: tradeGoods.length,
        demihumanItems: demihumanItems.length,
        commonMagicItems: commonMagicItems.length,
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
