DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProficiencyClassGroup') THEN
    CREATE TYPE "ProficiencyClassGroup" AS ENUM ('GENERAL', 'PRIEST', 'ROGUE', 'WARRIOR', 'WIZARD');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TraitDisadvantageKind') THEN
    CREATE TYPE "TraitDisadvantageKind" AS ENUM ('TRAIT', 'DISADVANTAGE');
  END IF;
END $$;

ALTER TABLE "RuleNonWeaponProficiency"
  ADD COLUMN IF NOT EXISTS "source_url" TEXT,
  ADD COLUMN IF NOT EXISTS "initial_rating" TEXT,
  ADD COLUMN IF NOT EXISTS "ability_text" TEXT;

ALTER TABLE "RuleTraitDisadvantage"
  ADD COLUMN IF NOT EXISTS "kind" "TraitDisadvantageKind" NOT NULL DEFAULT 'TRAIT',
  ADD COLUMN IF NOT EXISTS "source_url" TEXT,
  ADD COLUMN IF NOT EXISTS "point_cost_moderate" INTEGER,
  ADD COLUMN IF NOT EXISTS "point_cost_severe" INTEGER;

CREATE TABLE IF NOT EXISTS "RuleNonWeaponProficiencyRate" (
  "id" SERIAL NOT NULL,
  "proficiency_id" INTEGER NOT NULL,
  "class_group" "ProficiencyClassGroup" NOT NULL,
  "point_cost" INTEGER NOT NULL,
  "initial_rating" TEXT NOT NULL,
  "ability_text" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RuleNonWeaponProficiencyRate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "RuleNonWeaponProficiencyRate_proficiency_id_class_group_key"
  ON "RuleNonWeaponProficiencyRate"("proficiency_id", "class_group");

CREATE INDEX IF NOT EXISTS "RuleNonWeaponProficiencyRate_class_group_idx"
  ON "RuleNonWeaponProficiencyRate"("class_group");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'RuleNonWeaponProficiencyRate_proficiency_id_fkey'
  ) THEN
    ALTER TABLE "RuleNonWeaponProficiencyRate"
      ADD CONSTRAINT "RuleNonWeaponProficiencyRate_proficiency_id_fkey"
      FOREIGN KEY ("proficiency_id") REFERENCES "RuleNonWeaponProficiency"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
