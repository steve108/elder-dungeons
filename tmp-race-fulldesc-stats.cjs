const { Client } = require('pg');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL ausente');

  const rejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true';
  const client = new Client({ connectionString, ssl: { rejectUnauthorized } });

  await client.connect();
  const q = await client.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE description IS NOT NULL AND full_description IS NOT NULL AND btrim(description) = btrim(full_description))::int AS equal_count,
      COUNT(*) FILTER (WHERE full_description IS NOT NULL AND full_description LIKE '%Source: https://adnd2e.fandom.com/%')::int AS sourced_count,
      COUNT(*) FILTER (WHERE full_description IS NULL)::int AS null_full
    FROM "RaceAbility"
  `);

  console.log(JSON.stringify(q.rows[0], null, 2));
  await client.end();
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
