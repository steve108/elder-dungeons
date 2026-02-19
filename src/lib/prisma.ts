import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  (() => {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not configured");
    }

    const rejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "true";

    const pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized,
      },
    });

    const adapter = new PrismaPg(pool);

    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  })();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
