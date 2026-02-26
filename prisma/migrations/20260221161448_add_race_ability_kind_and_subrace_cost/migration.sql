-- CreateEnum
CREATE TYPE "RaceAbilityKind" AS ENUM ('BENEFIT', 'PENALTY');

-- AlterTable
ALTER TABLE "RaceAbility" ADD COLUMN     "kind" "RaceAbilityKind" NOT NULL DEFAULT 'BENEFIT';

-- AlterTable
ALTER TABLE "SubRace" ADD COLUMN     "character_point_cost" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "SubRaceStandardAbility" ADD COLUMN     "is_default_package" BOOLEAN NOT NULL DEFAULT true;

