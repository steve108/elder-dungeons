-- DropIndex
DROP INDEX "CharismaAppearanceScoreReference_score_key";

-- DropIndex
DROP INDEX "CharismaLeadershipScoreReference_score_key";

-- DropIndex
DROP INDEX "ConstitutionFitnessScoreReference_score_key";

-- DropIndex
DROP INDEX "ConstitutionHealthScoreReference_score_key";

-- DropIndex
DROP INDEX "DexterityAimScoreReference_score_key";

-- DropIndex
DROP INDEX "DexterityBalanceScoreReference_score_key";

-- DropIndex
DROP INDEX "IntelligenceKnowledgeScoreReference_score_key";

-- DropIndex
DROP INDEX "IntelligenceReasonScoreReference_score_key";

-- DropIndex
DROP INDEX "WisdomIntuitionScoreReference_score_key";

-- DropIndex
DROP INDEX "WisdomWillpowerScoreReference_score_key";

-- AlterTable
ALTER TABLE "CharismaAppearanceScoreReference"
ADD COLUMN     "reaction_adjustment" INTEGER,
ADD COLUMN     "score_label" TEXT,
ADD COLUMN     "score_max" INTEGER,
ADD COLUMN     "score_min" INTEGER,
ADD COLUMN     "sort_order" INTEGER;

UPDATE "CharismaAppearanceScoreReference"
SET "score_label" = "score"::text,
	"score_min" = "score",
	"score_max" = "score",
	"sort_order" = "score"
WHERE "score_label" IS NULL;

ALTER TABLE "CharismaAppearanceScoreReference"
ALTER COLUMN "score_label" SET NOT NULL,
ALTER COLUMN "score_min" SET NOT NULL,
ALTER COLUMN "score_max" SET NOT NULL,
ALTER COLUMN "sort_order" SET NOT NULL,
DROP COLUMN "score";

-- AlterTable
ALTER TABLE "CharismaLeadershipScoreReference"
ADD COLUMN     "loyalty_base" INTEGER,
ADD COLUMN     "max_henchmen" INTEGER,
ADD COLUMN     "score_label" TEXT,
ADD COLUMN     "score_max" INTEGER,
ADD COLUMN     "score_min" INTEGER,
ADD COLUMN     "sort_order" INTEGER;

UPDATE "CharismaLeadershipScoreReference"
SET "score_label" = "score"::text,
	"score_min" = "score",
	"score_max" = "score",
	"sort_order" = "score"
WHERE "score_label" IS NULL;

ALTER TABLE "CharismaLeadershipScoreReference"
ALTER COLUMN "score_label" SET NOT NULL,
ALTER COLUMN "score_min" SET NOT NULL,
ALTER COLUMN "score_max" SET NOT NULL,
ALTER COLUMN "sort_order" SET NOT NULL,
DROP COLUMN "score";

-- AlterTable
ALTER TABLE "ConstitutionFitnessScoreReference"
ADD COLUMN     "hit_point_adjustment_base" INTEGER,
ADD COLUMN     "hit_point_adjustment_warrior" INTEGER,
ADD COLUMN     "minimum_hit_die_result" INTEGER,
ADD COLUMN     "resurrection_chance_percent" INTEGER,
ADD COLUMN     "score_label" TEXT,
ADD COLUMN     "score_max" INTEGER,
ADD COLUMN     "score_min" INTEGER,
ADD COLUMN     "sort_order" INTEGER;

UPDATE "ConstitutionFitnessScoreReference"
SET "score_label" = "score"::text,
	"score_min" = "score",
	"score_max" = "score",
	"sort_order" = "score"
WHERE "score_label" IS NULL;

ALTER TABLE "ConstitutionFitnessScoreReference"
ALTER COLUMN "score_label" SET NOT NULL,
ALTER COLUMN "score_min" SET NOT NULL,
ALTER COLUMN "score_max" SET NOT NULL,
ALTER COLUMN "sort_order" SET NOT NULL,
DROP COLUMN "score";

-- AlterTable
ALTER TABLE "ConstitutionHealthScoreReference"
ADD COLUMN     "poison_save_modifier" INTEGER,
ADD COLUMN     "score_label" TEXT,
ADD COLUMN     "score_max" INTEGER,
ADD COLUMN     "score_min" INTEGER,
ADD COLUMN     "sort_order" INTEGER,
ADD COLUMN     "system_shock_percent" INTEGER;

UPDATE "ConstitutionHealthScoreReference"
SET "score_label" = "score"::text,
	"score_min" = "score",
	"score_max" = "score",
	"sort_order" = "score"
WHERE "score_label" IS NULL;

ALTER TABLE "ConstitutionHealthScoreReference"
ALTER COLUMN "score_label" SET NOT NULL,
ALTER COLUMN "score_min" SET NOT NULL,
ALTER COLUMN "score_max" SET NOT NULL,
ALTER COLUMN "sort_order" SET NOT NULL,
DROP COLUMN "score";

-- AlterTable
ALTER TABLE "DexterityAimScoreReference"
ADD COLUMN     "missile_adjustment" INTEGER,
ADD COLUMN     "open_locks_percent" INTEGER,
ADD COLUMN     "pick_pockets_percent" INTEGER,
ADD COLUMN     "score_label" TEXT,
ADD COLUMN     "score_max" INTEGER,
ADD COLUMN     "score_min" INTEGER,
ADD COLUMN     "sort_order" INTEGER;

UPDATE "DexterityAimScoreReference"
SET "score_label" = "score"::text,
	"score_min" = "score",
	"score_max" = "score",
	"sort_order" = "score"
WHERE "score_label" IS NULL;

ALTER TABLE "DexterityAimScoreReference"
ALTER COLUMN "score_label" SET NOT NULL,
ALTER COLUMN "score_min" SET NOT NULL,
ALTER COLUMN "score_max" SET NOT NULL,
ALTER COLUMN "sort_order" SET NOT NULL,
DROP COLUMN "score";

-- AlterTable
ALTER TABLE "DexterityBalanceScoreReference"
ADD COLUMN     "climb_walls_percent" INTEGER,
ADD COLUMN     "defensive_adjustment" INTEGER,
ADD COLUMN     "move_silently_percent" INTEGER,
ADD COLUMN     "reaction_adjustment" INTEGER,
ADD COLUMN     "score_label" TEXT,
ADD COLUMN     "score_max" INTEGER,
ADD COLUMN     "score_min" INTEGER,
ADD COLUMN     "sort_order" INTEGER;

UPDATE "DexterityBalanceScoreReference"
SET "score_label" = "score"::text,
	"score_min" = "score",
	"score_max" = "score",
	"sort_order" = "score"
WHERE "score_label" IS NULL;

ALTER TABLE "DexterityBalanceScoreReference"
ALTER COLUMN "score_label" SET NOT NULL,
ALTER COLUMN "score_min" SET NOT NULL,
ALTER COLUMN "score_max" SET NOT NULL,
ALTER COLUMN "sort_order" SET NOT NULL,
DROP COLUMN "score";

-- AlterTable
ALTER TABLE "IntelligenceKnowledgeScoreReference"
ADD COLUMN     "bonus_proficiencies" INTEGER,
ADD COLUMN     "learn_spell_percent" INTEGER,
ADD COLUMN     "score_label" TEXT,
ADD COLUMN     "score_max" INTEGER,
ADD COLUMN     "score_min" INTEGER,
ADD COLUMN     "sort_order" INTEGER;

UPDATE "IntelligenceKnowledgeScoreReference"
SET "score_label" = "score"::text,
	"score_min" = "score",
	"score_max" = "score",
	"sort_order" = "score"
WHERE "score_label" IS NULL;

ALTER TABLE "IntelligenceKnowledgeScoreReference"
ALTER COLUMN "score_label" SET NOT NULL,
ALTER COLUMN "score_min" SET NOT NULL,
ALTER COLUMN "score_max" SET NOT NULL,
ALTER COLUMN "sort_order" SET NOT NULL,
DROP COLUMN "score";

-- AlterTable
ALTER TABLE "IntelligenceReasonScoreReference"
ADD COLUMN     "all_spells_per_level" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "max_spells_per_level" INTEGER,
ADD COLUMN     "max_wizard_spell_level" INTEGER,
ADD COLUMN     "score_label" TEXT,
ADD COLUMN     "score_max" INTEGER,
ADD COLUMN     "score_min" INTEGER,
ADD COLUMN     "sort_order" INTEGER,
ADD COLUMN     "spell_immunity_level" INTEGER;

UPDATE "IntelligenceReasonScoreReference"
SET "score_label" = "score"::text,
	"score_min" = "score",
	"score_max" = "score",
	"sort_order" = "score"
WHERE "score_label" IS NULL;

ALTER TABLE "IntelligenceReasonScoreReference"
ALTER COLUMN "score_label" SET NOT NULL,
ALTER COLUMN "score_min" SET NOT NULL,
ALTER COLUMN "score_max" SET NOT NULL,
ALTER COLUMN "sort_order" SET NOT NULL,
DROP COLUMN "score";

-- AlterTable
ALTER TABLE "StrengthMuscleScoreReference" ADD COLUMN     "attack_adjustment" INTEGER,
ADD COLUMN     "bend_bars_lift_gates_percent" INTEGER,
ADD COLUMN     "damage_adjustment" INTEGER,
ADD COLUMN     "max_press" INTEGER,
ADD COLUMN     "open_doors" INTEGER,
ADD COLUMN     "open_doors_locked" INTEGER;

-- AlterTable
ALTER TABLE "StrengthStaminaScoreReference" ADD COLUMN     "weight_allowance" INTEGER;

-- AlterTable
ALTER TABLE "WisdomIntuitionScoreReference"
ADD COLUMN     "bonus_spells_text" TEXT,
ADD COLUMN     "score_label" TEXT,
ADD COLUMN     "score_max" INTEGER,
ADD COLUMN     "score_min" INTEGER,
ADD COLUMN     "sort_order" INTEGER,
ADD COLUMN     "spell_failure_percent" INTEGER;

UPDATE "WisdomIntuitionScoreReference"
SET "score_label" = "score"::text,
	"score_min" = "score",
	"score_max" = "score",
	"sort_order" = "score"
WHERE "score_label" IS NULL;

ALTER TABLE "WisdomIntuitionScoreReference"
ALTER COLUMN "score_label" SET NOT NULL,
ALTER COLUMN "score_min" SET NOT NULL,
ALTER COLUMN "score_max" SET NOT NULL,
ALTER COLUMN "sort_order" SET NOT NULL,
DROP COLUMN "score";

-- AlterTable
ALTER TABLE "WisdomWillpowerScoreReference"
ADD COLUMN     "magic_defense_adjustment" INTEGER,
ADD COLUMN     "score_label" TEXT,
ADD COLUMN     "score_max" INTEGER,
ADD COLUMN     "score_min" INTEGER,
ADD COLUMN     "sort_order" INTEGER,
ADD COLUMN     "spell_immunity_level" INTEGER;

UPDATE "WisdomWillpowerScoreReference"
SET "score_label" = "score"::text,
	"score_min" = "score",
	"score_max" = "score",
	"sort_order" = "score"
WHERE "score_label" IS NULL;

ALTER TABLE "WisdomWillpowerScoreReference"
ALTER COLUMN "score_label" SET NOT NULL,
ALTER COLUMN "score_min" SET NOT NULL,
ALTER COLUMN "score_max" SET NOT NULL,
ALTER COLUMN "sort_order" SET NOT NULL,
DROP COLUMN "score";

-- CreateIndex
CREATE UNIQUE INDEX "CharismaAppearanceScoreReference_score_label_key" ON "CharismaAppearanceScoreReference"("score_label");

-- CreateIndex
CREATE UNIQUE INDEX "CharismaLeadershipScoreReference_score_label_key" ON "CharismaLeadershipScoreReference"("score_label");

-- CreateIndex
CREATE UNIQUE INDEX "ConstitutionFitnessScoreReference_score_label_key" ON "ConstitutionFitnessScoreReference"("score_label");

-- CreateIndex
CREATE UNIQUE INDEX "ConstitutionHealthScoreReference_score_label_key" ON "ConstitutionHealthScoreReference"("score_label");

-- CreateIndex
CREATE UNIQUE INDEX "DexterityAimScoreReference_score_label_key" ON "DexterityAimScoreReference"("score_label");

-- CreateIndex
CREATE UNIQUE INDEX "DexterityBalanceScoreReference_score_label_key" ON "DexterityBalanceScoreReference"("score_label");

-- CreateIndex
CREATE UNIQUE INDEX "IntelligenceKnowledgeScoreReference_score_label_key" ON "IntelligenceKnowledgeScoreReference"("score_label");

-- CreateIndex
CREATE UNIQUE INDEX "IntelligenceReasonScoreReference_score_label_key" ON "IntelligenceReasonScoreReference"("score_label");

-- CreateIndex
CREATE UNIQUE INDEX "WisdomIntuitionScoreReference_score_label_key" ON "WisdomIntuitionScoreReference"("score_label");

-- CreateIndex
CREATE UNIQUE INDEX "WisdomWillpowerScoreReference_score_label_key" ON "WisdomWillpowerScoreReference"("score_label");

