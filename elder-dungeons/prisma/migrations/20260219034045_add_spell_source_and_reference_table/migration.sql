-- AlterTable
ALTER TABLE "Spell" ADD COLUMN     "source" TEXT;

-- CreateTable
CREATE TABLE "SpellReference" (
    "id" SERIAL NOT NULL,
    "class_name" TEXT NOT NULL,
    "group_name" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalized_name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpellReference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SpellReference_normalized_name_idx" ON "SpellReference"("normalized_name");

-- CreateIndex
CREATE UNIQUE INDEX "SpellReference_normalized_name_class_name_group_name_level__key" ON "SpellReference"("normalized_name", "class_name", "group_name", "level", "source");
