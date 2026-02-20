ALTER TABLE "Spell"
ADD COLUMN "saving_throw_outcome" TEXT;

ALTER TABLE "Spell"
ADD CONSTRAINT "Spell_saving_throw_outcome_check"
CHECK (
  "saving_throw_outcome" IS NULL
  OR "saving_throw_outcome" IN ('NEGATES', 'HALF', 'PARTIAL', 'OTHER')
);
