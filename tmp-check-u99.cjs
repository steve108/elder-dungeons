const { Client } = require('pg');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL ausente');
  const rejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true';

  const client = new Client({ connectionString, ssl: { rejectUnauthorized } });
  await client.connect();

  const result = await client.query(`
    SELECT
      name,
      max_level_bard,
      max_level_fighter,
      max_level_paladin,
      max_level_ranger,
      max_level_thief,
      max_level_wizard,
      max_level_illusionist,
      max_level_cleric,
      max_level_druid
    FROM "RaceBase"
    WHERE name IN ('Human','Half-Elf')
    ORDER BY name ASC
  `);

  console.log(JSON.stringify(result.rows, null, 2));
  await client.end();
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
