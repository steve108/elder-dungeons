-- Add class ability/restriction catalog tables with support for shared penalties across classes.

CREATE TYPE "ClassAbilityKind" AS ENUM ('BENEFIT', 'PENALTY');

ALTER TABLE "RuleClass"
  ADD COLUMN "class_point_budget" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "ability_requirements" TEXT,
  ADD COLUMN "prime_requisite" TEXT,
  ADD COLUMN "allowed_races_text" TEXT;

CREATE TABLE "RuleClassAbility" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "full_description" TEXT,
  "kind" "ClassAbilityKind" NOT NULL DEFAULT 'BENEFIT',
  "point_cost" INTEGER,
  "point_cost_min" INTEGER,
  "point_cost_max" INTEGER,
  "cost_notes" TEXT,
  "is_shared_penalty" BOOLEAN NOT NULL DEFAULT false,
  "shared_penalty_key" TEXT,
  "source_class_hint" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RuleClassAbility_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RuleClassAbilityLink" (
  "id" SERIAL NOT NULL,
  "class_id" INTEGER NOT NULL,
  "class_ability_id" INTEGER NOT NULL,
  "is_default_package" BOOLEAN NOT NULL DEFAULT false,
  "is_optional_restriction" BOOLEAN NOT NULL DEFAULT false,
  "display_order" INTEGER,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RuleClassAbilityLink_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RuleClassRestrictionReference" (
  "id" SERIAL NOT NULL,
  "class_id" INTEGER NOT NULL,
  "source_class_id" INTEGER NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RuleClassRestrictionReference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RuleClassAbility_name_key" ON "RuleClassAbility"("name");
CREATE INDEX "RuleClassAbility_kind_idx" ON "RuleClassAbility"("kind");
CREATE INDEX "RuleClassAbility_shared_penalty_key_idx" ON "RuleClassAbility"("shared_penalty_key");

CREATE UNIQUE INDEX "RuleClassAbilityLink_class_id_class_ability_id_key" ON "RuleClassAbilityLink"("class_id", "class_ability_id");

CREATE UNIQUE INDEX "RuleClassRestrictionReference_class_id_source_class_id_key" ON "RuleClassRestrictionReference"("class_id", "source_class_id");

ALTER TABLE "RuleClassAbilityLink"
  ADD CONSTRAINT "RuleClassAbilityLink_class_id_fkey"
  FOREIGN KEY ("class_id") REFERENCES "RuleClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RuleClassAbilityLink"
  ADD CONSTRAINT "RuleClassAbilityLink_class_ability_id_fkey"
  FOREIGN KEY ("class_ability_id") REFERENCES "RuleClassAbility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RuleClassRestrictionReference"
  ADD CONSTRAINT "RuleClassRestrictionReference_class_id_fkey"
  FOREIGN KEY ("class_id") REFERENCES "RuleClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RuleClassRestrictionReference"
  ADD CONSTRAINT "RuleClassRestrictionReference_source_class_id_fkey"
  FOREIGN KEY ("source_class_id") REFERENCES "RuleClass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
