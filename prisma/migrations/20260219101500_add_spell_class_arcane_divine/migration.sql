ALTER TABLE "Spell" ADD COLUMN "spell_class" TEXT;

UPDATE "Spell"
SET "spell_class" = CASE
  WHEN COALESCE(TRIM("sphere"), '') <> '' THEN 'divine'
  ELSE 'arcane'
END
WHERE "spell_class" IS NULL;

ALTER TABLE "Spell" ALTER COLUMN "spell_class" SET NOT NULL;

ALTER TABLE "Spell"
ADD CONSTRAINT "Spell_spell_class_check"
CHECK ("spell_class" IN ('arcane', 'divine'));
