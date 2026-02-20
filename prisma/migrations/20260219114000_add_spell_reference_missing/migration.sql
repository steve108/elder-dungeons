CREATE TABLE "SpellReferenceMissing" (
  "id" SERIAL NOT NULL,
  "normalized_name" TEXT NOT NULL,
  "spell_name" TEXT NOT NULL,
  "spell_class" TEXT NOT NULL,
  "reference_source" TEXT,
  "reason" TEXT NOT NULL,
  "last_url" TEXT,
  "attempt_count" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SpellReferenceMissing_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SpellReferenceMissing_spell_class_check" CHECK ("spell_class" IN ('arcane', 'divine'))
);

CREATE UNIQUE INDEX "SpellReferenceMissing_normalized_name_spell_class_key"
ON "SpellReferenceMissing"("normalized_name", "spell_class");

CREATE INDEX "SpellReferenceMissing_updated_at_idx"
ON "SpellReferenceMissing"("updated_at");
