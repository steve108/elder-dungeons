-- CreateEnum
CREATE TYPE "MagicalResistance" AS ENUM ('YES', 'NO');

-- CreateTable
CREATE TABLE "Spell" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "school" TEXT NOT NULL,
    "sphere" TEXT,
    "rangeText" TEXT NOT NULL,
    "durationText" TEXT NOT NULL,
    "castingTime" TEXT NOT NULL,
    "components" TEXT NOT NULL,
    "component_desc" TEXT,
    "component_cost" TEXT,
    "component_consumed" BOOLEAN NOT NULL DEFAULT false,
    "savingThrow" TEXT NOT NULL,
    "magicalResistance" "MagicalResistance" NOT NULL,
    "descriptionOriginal" TEXT NOT NULL,
    "descriptionPtBr" TEXT,
    "sourceImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Spell_pkey" PRIMARY KEY ("id")
);
