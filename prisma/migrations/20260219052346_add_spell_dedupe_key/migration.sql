/*
  Warnings:

  - A unique constraint covering the columns `[dedupe_key]` on the table `Spell` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dedupe_key` to the `Spell` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Spell" ADD COLUMN     "dedupe_key" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Spell_dedupe_key_key" ON "Spell"("dedupe_key");
