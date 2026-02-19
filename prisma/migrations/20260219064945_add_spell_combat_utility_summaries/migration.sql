-- AlterTable
ALTER TABLE "Spell" ADD COLUMN     "combat" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "summary_en" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "summary_pt_br" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "utility" BOOLEAN NOT NULL DEFAULT false;
