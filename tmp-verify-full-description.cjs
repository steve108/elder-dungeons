const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const checks = [
      ['RaceBase', 'SELECT COUNT(*)::int AS c FROM "RaceBase" WHERE "description" IS NOT NULL AND "full_description" IS NULL'],
      ['SubRace', 'SELECT COUNT(*)::int AS c FROM "SubRace" WHERE "description" IS NOT NULL AND "full_description" IS NULL'],
      ['RaceAbility', 'SELECT COUNT(*)::int AS c FROM "RaceAbility" WHERE "description" IS NOT NULL AND "full_description" IS NULL'],
      ['AttributeDefinition', 'SELECT COUNT(*)::int AS c FROM "AttributeDefinition" WHERE "description" IS NOT NULL AND "full_description" IS NULL'],
      ['SubAttributeDefinition', 'SELECT COUNT(*)::int AS c FROM "SubAttributeDefinition" WHERE "description" IS NOT NULL AND "full_description" IS NULL']
    ];

    for (const [label, query] of checks) {
      const rows = await prisma.$queryRawUnsafe(query);
      const count = rows[0]?.c ?? 0;
      if (count > 0) {
        throw new Error(`${label}: ${count} rows missing full_description backfill`);
      }
    }

    console.log('OK: full_description backfill verified for core reference tables.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
