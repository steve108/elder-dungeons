-- AlterTable
ALTER TABLE "Spell" ADD COLUMN     "can_be_dispelled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dispel_how" TEXT;
