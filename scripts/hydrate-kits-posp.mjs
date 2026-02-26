import 'dotenv/config';
import pg from 'pg';

const WIKI_API = 'https://adnd2e.fandom.com/api.php';
const KIT_CATEGORY = 'Category:Character_Kit_POSP';
const KIT_SUFFIX = ' - POSP (Character Kit)';

const { Client } = pg;

function stripTemplates(input) {
  let text = input;
  let prev = '';
  while (prev !== text) {
    prev = text;
    text = text.replace(/\{\{[^{}]*\}\}/g, '');
  }
  return text;
}

function decodeWikiLinks(input) {
  return input
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\[(https?:\/\/[^\s\]]+)\s+([^\]]+)\]/g, '$2')
    .replace(/\[(https?:\/\/[^\s\]]+)\]/g, '$1');
}

function simplifyTables(input) {
  return input.replace(/\{\|[\s\S]*?\|\}/g, (tableBlock) => {
    const lines = tableBlock
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('{|') && !line.startsWith('|-') && !line.startsWith('|}'))
      .map((line) => line.replace(/^!+\s?/, '').replace(/^\|+\s?/, '').trim())
      .filter((line) => line.length > 0);

    return lines.length ? `\n${lines.join('\n')}\n` : '';
  });
}

function cleanWikitext(wikitext) {
  let text = wikitext || '';

  text = text.replace(/\r/g, '');
  text = text.replace(/__TOC__/g, '');
  text = text.replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '');
  text = text.replace(/<ref[^/>]*\/>/gi, '');
  text = text.replace(/<!--([\s\S]*?)-->/g, '');
  text = stripTemplates(text);
  text = simplifyTables(text);
  text = decodeWikiLinks(text);
  text = text.replace(/'''/g, '');
  text = text.replace(/''/g, '');
  text = text.replace(/^==+\s*(.*?)\s*==+$/gm, '$1');
  text = text.replace(/^\[\[Category:[^\]]+\]\]\s*$/gim, '');
  text = text.replace(/^\[\[File:[^\]]+\]\]\s*$/gim, '');

  text = text
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text;
}

function normalizeLabel(label) {
  return label
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function mapLabelToField(normalizedLabel) {
  if (normalizedLabel.startsWith('social ranks') || normalizedLabel.startsWith('social ranking')) return 'socialRanking';
  if (normalizedLabel.startsWith('requirements') || normalizedLabel.startsWith('recommendations')) return 'requirements';
  if (normalizedLabel.startsWith('weapon proficiencies') || normalizedLabel.startsWith('weapon proficiency')) return 'weaponProficiencies';
  if (normalizedLabel.startsWith('recommended nonweapon proficiencies') || normalizedLabel.startsWith('nonweapon proficiencies')) return 'nonweaponProficiencies';
  if (normalizedLabel.startsWith('equipment')) return 'equipment';
  if (normalizedLabel.startsWith('recommended traits') || normalizedLabel.startsWith('traits')) return 'recommendedTraits';
  if (normalizedLabel.startsWith('benefits hindrances')) return 'benefitsAndHindrances';
  if (normalizedLabel.startsWith('benefits')) return 'benefits';
  if (normalizedLabel.startsWith('hindrances') || normalizedLabel.startsWith('hindrance')) return 'hindrances';
  if (normalizedLabel.startsWith('wealth')) return 'wealth';
  if (normalizedLabel.startsWith('races') || normalizedLabel.startsWith('race')) return 'races';
  if (normalizedLabel.startsWith('classes') || normalizedLabel.startsWith('class')) return 'classes';
  return null;
}

function splitIntroParagraphs(text) {
  return text
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function parseKitSections(cleanText) {
  const sectionRegex = /(^|\n)([^\n:]{2,80}):\s*/g;
  const matches = [];
  let match;

  while ((match = sectionRegex.exec(cleanText)) !== null) {
    const rawLabel = match[2].trim();
    const normalizedLabel = normalizeLabel(rawLabel);
    const mapped = mapLabelToField(normalizedLabel);
    if (!mapped && !['social ranks', 'requirements', 'weapon proficiencies', 'recommended nonweapon proficiencies', 'equipment', 'recommended traits', 'benefits', 'hindrances', 'wealth', 'races', 'classes'].some((x) => normalizedLabel.startsWith(x))) {
      continue;
    }

    matches.push({
      rawLabel,
      normalizedLabel,
      field: mapped,
      startIndex: match.index + match[1].length,
      contentStart: sectionRegex.lastIndex,
    });
  }

  const sections = [];
  for (let index = 0; index < matches.length; index += 1) {
    const current = matches[index];
    const next = matches[index + 1];
    const endIndex = next ? next.startIndex : cleanText.length;
    const content = cleanText.slice(current.contentStart, endIndex).trim();
    if (content) {
      sections.push({
        label: current.rawLabel,
        normalizedLabel: current.normalizedLabel,
        field: current.field,
        content,
      });
    }
  }

  const introCut = matches.length ? matches[0].startIndex : cleanText.length;
  const intro = cleanText.slice(0, introCut).trim();

  return { intro, sections };
}

function buildKitPayload(title, wikitext) {
  const name = title.endsWith(KIT_SUFFIX) ? title.slice(0, -KIT_SUFFIX.length) : title;
  const sourceUrl = `https://adnd2e.fandom.com/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;

  const cleanText = cleanWikitext(wikitext)
    .replace(/\n?\[Collapse\][\s\S]*$/i, '')
    .replace(/\n?Advanced Dungeons & Dragons 2nd Edition Wiki[\s\S]*$/i, '')
    .trim();

  const { intro, sections } = parseKitSections(cleanText);
  const introParagraphs = splitIntroParagraphs(intro);
  const description = introParagraphs.slice(0, 2).join('\n\n') || introParagraphs[0] || null;

  const payload = {
    name,
    sourceUrl,
    description,
    fullDescription: cleanText || null,
    socialRanking: null,
    requirements: null,
    weaponProficiencies: null,
    nonweaponProficiencies: null,
    equipment: null,
    recommendedTraits: null,
    benefits: null,
    benefitsAndHindrances: null,
    hindrances: null,
    wealth: null,
    races: null,
    classes: null,
    otherSections: null,
  };

  const otherSections = [];

  for (const section of sections) {
    if (section.field) {
      payload[section.field] = payload[section.field]
        ? `${payload[section.field]}\n\n${section.content}`
        : section.content;
    } else {
      otherSections.push(`${section.label}: ${section.content}`);
    }
  }

  payload.otherSections = otherSections.length ? otherSections.join('\n\n') : null;

  if (payload.benefitsAndHindrances) {
    if (!payload.benefits) payload.benefits = payload.benefitsAndHindrances;
    if (!payload.hindrances) payload.hindrances = payload.benefitsAndHindrances;
  }


  return payload;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.json();
}

async function listKitTitles() {
  const url = `${WIKI_API}?action=query&list=categorymembers&cmtitle=${encodeURIComponent(KIT_CATEGORY)}&cmlimit=500&format=json`;
  const json = await fetchJson(url);
  return (json?.query?.categorymembers || [])
    .map((item) => item.title)
    .filter((title) => title.endsWith(KIT_SUFFIX));
}

async function fetchKitWikitext(title) {
  const url = `${WIKI_API}?action=parse&page=${encodeURIComponent(title)}&prop=wikitext&format=json&formatversion=2`;
  const json = await fetchJson(url);
  const wikitext = json?.parse?.wikitext;
  if (!wikitext) {
    throw new Error(`No wikitext for ${title}`);
  }
  return wikitext;
}

async function upsertKit(client, kit) {
  const existing = await client.query(
    `SELECT id FROM "Kit" WHERE class_id IS NULL AND name = $1 ORDER BY id ASC`,
    [kit.name]
  );

  let keepId = null;
  if (existing.rows.length === 0) {
    const inserted = await client.query(
      `INSERT INTO "Kit" (
        class_id,
        name,
        description,
        full_description,
        source_url,
        social_ranking,
        requirements,
        weapon_proficiencies,
        nonweapon_proficiencies,
        equipment,
        recommended_traits,
        benefits,
        benefits_and_hindrances,
        hindrances,
        wealth,
        races,
        classes,
        other_sections,
        updated_at
      ) VALUES (
        NULL,
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15,
        $16,
        $17,
        CURRENT_TIMESTAMP
      ) RETURNING id`,
      [
        kit.name,
        kit.description,
        kit.fullDescription,
        kit.sourceUrl,
        kit.socialRanking,
        kit.requirements,
        kit.weaponProficiencies,
        kit.nonweaponProficiencies,
        kit.equipment,
        kit.recommendedTraits,
        kit.benefits,
        kit.benefitsAndHindrances,
        kit.hindrances,
        kit.wealth,
        kit.races,
        kit.classes,
        kit.otherSections,
      ]
    );
    keepId = inserted.rows[0].id;
  } else {
    keepId = existing.rows[0].id;

    await client.query(
      `UPDATE "Kit"
       SET description = $2,
           full_description = $3,
           source_url = $4,
           social_ranking = $5,
           requirements = $6,
           weapon_proficiencies = $7,
           nonweapon_proficiencies = $8,
           equipment = $9,
           recommended_traits = $10,
           benefits = $11,
             benefits_and_hindrances = $12,
             hindrances = $13,
             wealth = $14,
             races = $15,
             classes = $16,
             other_sections = $17,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [
        keepId,
        kit.description,
        kit.fullDescription,
        kit.sourceUrl,
        kit.socialRanking,
        kit.requirements,
        kit.weaponProficiencies,
        kit.nonweaponProficiencies,
        kit.equipment,
        kit.recommendedTraits,
        kit.benefits,
        kit.benefitsAndHindrances,
        kit.hindrances,
        kit.wealth,
        kit.races,
        kit.classes,
        kit.otherSections,
      ]
    );

    if (existing.rows.length > 1) {
      const duplicateIds = existing.rows.slice(1).map((row) => row.id);
      await client.query(
        `UPDATE "Character" SET kit_id = $1 WHERE kit_id = ANY($2::int[])`,
        [keepId, duplicateIds]
      );
      await client.query(
        `DELETE FROM "Kit" WHERE id = ANY($1::int[])`,
        [duplicateIds]
      );
    }
  }

  return keepId;
}

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  await client.query('BEGIN');

  try {
    const titles = await listKitTitles();

    const results = [];
    for (const title of titles) {
      const wikitext = await fetchKitWikitext(title);
      const payload = buildKitPayload(title, wikitext);
      const id = await upsertKit(client, payload);
      results.push({ id, name: payload.name });
    }

    await client.query('COMMIT');

    const verify = await client.query(
      `SELECT COUNT(*)::int AS c FROM "Kit" WHERE class_id IS NULL AND source_url LIKE 'https://adnd2e.fandom.com/wiki/%POSP%Character_Kit%'`
    );

    console.log(JSON.stringify({
      importedTitles: results.length,
      importedNames: results.map((row) => row.name).sort(),
      kitsWithSourceUrl: verify.rows[0].c,
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
