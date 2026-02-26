import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

const SOURCE_URL = 'https://adnd2e.fandom.com/wiki/Weapon_Groups_(POSP)';

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
    .replace(/<[^>]+>/g, '')
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/'''/g, '')
    .replace(/''/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitWeapons(raw) {
  return (raw || '')
    .split(/[,;]\s*/)
    .map((part) => cleanText(part).replace(/[.:]$/, '').trim())
    .filter(Boolean);
}

function parseTable49(wikitext) {
  const marker = '==Table 49: Weapon Groups==';
  const startIndex = wikitext.indexOf(marker);
  if (startIndex < 0) throw new Error('Table 49 section not found in Weapon Groups (POSP).');

  const section = wikitext.slice(startIndex + marker.length);
  const lines = section.split('\n');

  const broadGroups = [];
  const tightGroups = [];
  const weapons = [];

  let broadOrder = 1;
  let tightOrder = 1;
  let weaponOrder = 1;

  let currentBroadName = null;
  let currentTightName = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('{{Navbox')) break;
    if (line.startsWith('If a weapon does not appear')) break;
    if (line.startsWith('In the listing below')) continue;
    if (line.startsWith('As noted in previous chapters')) continue;

    const broadMatch = line.match(/^'{3,5}([^']+?)'{3,5}$/);
    if (broadMatch) {
      const broadName = cleanText(broadMatch[1]);
      if (!broadName) continue;
      broadGroups.push({
        name: broadName,
        kind: 'BROAD',
        parentName: null,
        displayOrder: broadOrder++,
      });
      currentBroadName = broadName;
      currentTightName = null;
      continue;
    }

    const tightMatch = line.match(/^''([^:]+):''\s*(.+)$/);
    if (tightMatch && currentBroadName) {
      const tightName = cleanText(tightMatch[1]);
      const weaponText = tightMatch[2] || '';
      tightGroups.push({
        name: tightName,
        kind: 'TIGHT',
        parentName: currentBroadName,
        displayOrder: tightOrder++,
      });
      currentTightName = tightName;

      for (const weaponName of splitWeapons(weaponText)) {
        weapons.push({
          groupName: tightName,
          parentBroadName: currentBroadName,
          weaponName,
          displayOrder: weaponOrder++,
        });
      }
      continue;
    }

    if (currentBroadName) {
      for (const weaponName of splitWeapons(line)) {
        weapons.push({
          groupName: currentTightName || currentBroadName,
          parentBroadName: currentBroadName,
          weaponName,
          displayOrder: weaponOrder++,
        });
      }
    }
  }

  return { broadGroups, tightGroups, weapons };
}

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    const wikitext = await fetchWikitext('Weapon Groups (POSP)');
    const { broadGroups, tightGroups, weapons } = parseTable49(wikitext);

    await client.query('BEGIN');

    await client.query('DELETE FROM "WeaponGroupWeapon"');
    await client.query('DELETE FROM "WeaponGroup"');

    const broadIdByName = new Map();
    for (const broad of broadGroups) {
      const result = await client.query(
        `INSERT INTO "WeaponGroup" (name, kind, parent_group_id, source_url, display_order, updated_at)
         VALUES ($1,$2,NULL,$3,$4,CURRENT_TIMESTAMP)
         RETURNING id`,
        [broad.name, broad.kind, SOURCE_URL, broad.displayOrder]
      );
      broadIdByName.set(broad.name, result.rows[0].id);
    }

    const tightIdByKey = new Map();
    for (const tight of tightGroups) {
      const parentId = broadIdByName.get(tight.parentName);
      if (!parentId) continue;
      const result = await client.query(
        `INSERT INTO "WeaponGroup" (name, kind, parent_group_id, source_url, display_order, updated_at)
         VALUES ($1,$2,$3,$4,$5,CURRENT_TIMESTAMP)
         RETURNING id`,
        [tight.name, tight.kind, parentId, SOURCE_URL, tight.displayOrder]
      );
      const key = `${tight.parentName}::${tight.name}`;
      tightIdByKey.set(key, result.rows[0].id);
    }

    for (const row of weapons) {
      const tightKey = `${row.parentBroadName}::${row.groupName}`;
      const groupId = tightIdByKey.get(tightKey) || broadIdByName.get(row.groupName);
      if (!groupId) continue;

      await client.query(
        `INSERT INTO "WeaponGroupWeapon" (group_id, weapon_name, source_url, display_order, updated_at)
         VALUES ($1,$2,$3,$4,CURRENT_TIMESTAMP)
         ON CONFLICT (group_id, weapon_name) DO NOTHING`,
        [groupId, row.weaponName, SOURCE_URL, row.displayOrder]
      );
    }

    await client.query('COMMIT');

    const groupCount = await client.query('SELECT COUNT(*)::int AS c FROM "WeaponGroup"');
    const weaponCount = await client.query('SELECT COUNT(*)::int AS c FROM "WeaponGroupWeapon"');

    console.log(JSON.stringify({
      imported: {
        broadGroups: broadGroups.length,
        tightGroups: tightGroups.length,
        groupRows: groupCount.rows[0].c,
        weaponRows: weaponCount.rows[0].c,
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
