require("dotenv/config");

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "true",
    },
  });

  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const bad = String.fromCharCode(65533);
  const rows = await prisma.spell.findMany({
    where: {
      descriptionPtBr: {
        contains: bad,
      },
    },
    select: { id: true, name: true },
    orderBy: { id: "asc" },
  });

  console.log(JSON.stringify({ corruptedRowsRemaining: rows.length, rows }, null, 2));

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
