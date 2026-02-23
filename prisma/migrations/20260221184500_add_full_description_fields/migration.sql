-- Add full_description columns to keep complete text alongside summarized description

ALTER TABLE "RaceBase" ADD COLUMN IF NOT EXISTS "full_description" TEXT;
ALTER TABLE "SubRace" ADD COLUMN IF NOT EXISTS "full_description" TEXT;
ALTER TABLE "RaceAbility" ADD COLUMN IF NOT EXISTS "full_description" TEXT;
ALTER TABLE "AttributeDefinition" ADD COLUMN IF NOT EXISTS "full_description" TEXT;
ALTER TABLE "SubAttributeDefinition" ADD COLUMN IF NOT EXISTS "full_description" TEXT;

ALTER TABLE "StrengthMuscleScoreReference" ADD COLUMN IF NOT EXISTS "full_description" TEXT;
ALTER TABLE "StrengthStaminaScoreReference" ADD COLUMN IF NOT EXISTS "full_description" TEXT;
ALTER TABLE "ConstitutionHealthScoreReference" ADD COLUMN IF NOT EXISTS "full_description" TEXT;
ALTER TABLE "ConstitutionFitnessScoreReference" ADD COLUMN IF NOT EXISTS "full_description" TEXT;
ALTER TABLE "DexterityAimScoreReference" ADD COLUMN IF NOT EXISTS "full_description" TEXT;
ALTER TABLE "DexterityBalanceScoreReference" ADD COLUMN IF NOT EXISTS "full_description" TEXT;
ALTER TABLE "WisdomIntuitionScoreReference" ADD COLUMN IF NOT EXISTS "full_description" TEXT;
ALTER TABLE "WisdomWillpowerScoreReference" ADD COLUMN IF NOT EXISTS "full_description" TEXT;
ALTER TABLE "IntelligenceReasonScoreReference" ADD COLUMN IF NOT EXISTS "full_description" TEXT;
ALTER TABLE "IntelligenceKnowledgeScoreReference" ADD COLUMN IF NOT EXISTS "full_description" TEXT;
ALTER TABLE "CharismaAppearanceScoreReference" ADD COLUMN IF NOT EXISTS "full_description" TEXT;
ALTER TABLE "CharismaLeadershipScoreReference" ADD COLUMN IF NOT EXISTS "full_description" TEXT;

ALTER TABLE "RuleClass" ADD COLUMN IF NOT EXISTS "full_description" TEXT;
ALTER TABLE "RuleKit" ADD COLUMN IF NOT EXISTS "full_description" TEXT;
ALTER TABLE "RuleTraitDisadvantage" ADD COLUMN IF NOT EXISTS "full_description" TEXT;
ALTER TABLE "RuleNonWeaponProficiency" ADD COLUMN IF NOT EXISTS "full_description" TEXT;
ALTER TABLE "RuleWeaponProficiency" ADD COLUMN IF NOT EXISTS "full_description" TEXT;
ALTER TABLE "RuleEquipment" ADD COLUMN IF NOT EXISTS "full_description" TEXT;

-- Backfill: preserve existing text in the new field
UPDATE "RaceBase" SET "full_description" = "description" WHERE "full_description" IS NULL AND "description" IS NOT NULL;
UPDATE "SubRace" SET "full_description" = "description" WHERE "full_description" IS NULL AND "description" IS NOT NULL;
UPDATE "RaceAbility" SET "full_description" = "description" WHERE "full_description" IS NULL AND "description" IS NOT NULL;
UPDATE "AttributeDefinition" SET "full_description" = "description" WHERE "full_description" IS NULL AND "description" IS NOT NULL;
UPDATE "SubAttributeDefinition" SET "full_description" = "description" WHERE "full_description" IS NULL AND "description" IS NOT NULL;

UPDATE "StrengthMuscleScoreReference" SET "full_description" = "description" WHERE "full_description" IS NULL AND "description" IS NOT NULL;
UPDATE "StrengthStaminaScoreReference" SET "full_description" = "description" WHERE "full_description" IS NULL AND "description" IS NOT NULL;
UPDATE "ConstitutionHealthScoreReference" SET "full_description" = "description" WHERE "full_description" IS NULL AND "description" IS NOT NULL;
UPDATE "ConstitutionFitnessScoreReference" SET "full_description" = "description" WHERE "full_description" IS NULL AND "description" IS NOT NULL;
UPDATE "DexterityAimScoreReference" SET "full_description" = "description" WHERE "full_description" IS NULL AND "description" IS NOT NULL;
UPDATE "DexterityBalanceScoreReference" SET "full_description" = "description" WHERE "full_description" IS NULL AND "description" IS NOT NULL;
UPDATE "WisdomIntuitionScoreReference" SET "full_description" = "description" WHERE "full_description" IS NULL AND "description" IS NOT NULL;
UPDATE "WisdomWillpowerScoreReference" SET "full_description" = "description" WHERE "full_description" IS NULL AND "description" IS NOT NULL;
UPDATE "IntelligenceReasonScoreReference" SET "full_description" = "description" WHERE "full_description" IS NULL AND "description" IS NOT NULL;
UPDATE "IntelligenceKnowledgeScoreReference" SET "full_description" = "description" WHERE "full_description" IS NULL AND "description" IS NOT NULL;
UPDATE "CharismaAppearanceScoreReference" SET "full_description" = "description" WHERE "full_description" IS NULL AND "description" IS NOT NULL;
UPDATE "CharismaLeadershipScoreReference" SET "full_description" = "description" WHERE "full_description" IS NULL AND "description" IS NOT NULL;

UPDATE "RuleClass" SET "full_description" = "description" WHERE "full_description" IS NULL AND "description" IS NOT NULL;
UPDATE "RuleKit" SET "full_description" = "description" WHERE "full_description" IS NULL AND "description" IS NOT NULL;
UPDATE "RuleTraitDisadvantage" SET "full_description" = "description" WHERE "full_description" IS NULL AND "description" IS NOT NULL;
UPDATE "RuleNonWeaponProficiency" SET "full_description" = "description" WHERE "full_description" IS NULL AND "description" IS NOT NULL;
UPDATE "RuleWeaponProficiency" SET "full_description" = "description" WHERE "full_description" IS NULL AND "description" IS NOT NULL;
UPDATE "RuleEquipment" SET "full_description" = "description" WHERE "full_description" IS NULL AND "description" IS NOT NULL;
