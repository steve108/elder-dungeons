-- CreateEnum
CREATE TYPE "WeaponAdvancementKind" AS ENUM ('SPECIALIZATION', 'MASTERY');

-- CreateTable
CREATE TABLE "RuleWeaponProficiencyCpCost" (
    "id" SERIAL NOT NULL,
    "class_name" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "source_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuleWeaponProficiencyCpCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleWeaponNonproficiencyPenalty" (
    "id" SERIAL NOT NULL,
    "class_name" TEXT NOT NULL,
    "nonproficiency_text" TEXT NOT NULL,
    "familiarity_text" TEXT NOT NULL,
    "source_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuleWeaponNonproficiencyPenalty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleWeaponShieldProficiencyEffect" (
    "id" SERIAL NOT NULL,
    "shield_type" TEXT NOT NULL,
    "ac_bonus_text" TEXT NOT NULL,
    "attackers_text" TEXT NOT NULL,
    "source_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuleWeaponShieldProficiencyEffect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleWeaponFightingStyleClass" (
    "id" SERIAL NOT NULL,
    "style_name" TEXT NOT NULL,
    "eligible_classes" TEXT NOT NULL,
    "source_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuleWeaponFightingStyleClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleWeaponAdvancementCost" (
    "id" SERIAL NOT NULL,
    "kind" "WeaponAdvancementKind" NOT NULL,
    "class_name" TEXT NOT NULL,
    "point_cost" INTEGER NOT NULL,
    "minimum_level" INTEGER NOT NULL,
    "source_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuleWeaponAdvancementCost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RuleWeaponProficiencyCpCost_class_name_key" ON "RuleWeaponProficiencyCpCost"("class_name");

-- CreateIndex
CREATE UNIQUE INDEX "RuleWeaponNonproficiencyPenalty_class_name_key" ON "RuleWeaponNonproficiencyPenalty"("class_name");

-- CreateIndex
CREATE UNIQUE INDEX "RuleWeaponShieldProficiencyEffect_shield_type_key" ON "RuleWeaponShieldProficiencyEffect"("shield_type");

-- CreateIndex
CREATE UNIQUE INDEX "RuleWeaponFightingStyleClass_style_name_key" ON "RuleWeaponFightingStyleClass"("style_name");

-- CreateIndex
CREATE UNIQUE INDEX "RuleWeaponAdvancementCost_kind_class_name_key" ON "RuleWeaponAdvancementCost"("kind", "class_name");
