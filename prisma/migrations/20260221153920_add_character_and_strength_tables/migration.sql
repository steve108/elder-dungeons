-- CreateEnum
CREATE TYPE "CoreAttributeName" AS ENUM ('STRENGTH', 'CONSTITUTION', 'DEXTERITY', 'WISDOM', 'INTELLIGENCE', 'CHARISMA');

-- CreateTable
CREATE TABLE "Character" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "player_name" TEXT,
    "notes" TEXT,
    "race_base_id" INTEGER,
    "sub_race_id" INTEGER,
    "class_id" INTEGER,
    "kit_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaceBase" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "class_point_budget" INTEGER NOT NULL DEFAULT 0,
    "strength_adjustment" INTEGER NOT NULL DEFAULT 0,
    "constitution_adjustment" INTEGER NOT NULL DEFAULT 0,
    "dexterity_adjustment" INTEGER NOT NULL DEFAULT 0,
    "wisdom_adjustment" INTEGER NOT NULL DEFAULT 0,
    "intelligence_adjustment" INTEGER NOT NULL DEFAULT 0,
    "charisma_adjustment" INTEGER NOT NULL DEFAULT 0,
    "max_level_fighter" INTEGER,
    "max_level_paladin" INTEGER,
    "max_level_ranger" INTEGER,
    "max_level_thief" INTEGER,
    "max_level_bard" INTEGER,
    "max_level_wizard" INTEGER,
    "max_level_illusionist" INTEGER,
    "max_level_cleric" INTEGER,
    "max_level_druid" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RaceBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubRace" (
    "id" SERIAL NOT NULL,
    "race_base_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "languages" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubRace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaceAbility" (
    "id" SERIAL NOT NULL,
    "race_base_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cost" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RaceAbility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubRaceStandardAbility" (
    "id" SERIAL NOT NULL,
    "sub_race_id" INTEGER NOT NULL,
    "race_ability_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubRaceStandardAbility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttributeDefinition" (
    "id" SERIAL NOT NULL,
    "name" "CoreAttributeName" NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttributeDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubAttributeDefinition" (
    "id" SERIAL NOT NULL,
    "attribute_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubAttributeDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrengthMuscleScoreReference" (
    "id" SERIAL NOT NULL,
    "score_label" TEXT NOT NULL,
    "base_score" INTEGER NOT NULL,
    "exceptional_min" INTEGER,
    "exceptional_max" INTEGER,
    "sort_order" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StrengthMuscleScoreReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrengthStaminaScoreReference" (
    "id" SERIAL NOT NULL,
    "score_label" TEXT NOT NULL,
    "base_score" INTEGER NOT NULL,
    "exceptional_min" INTEGER,
    "exceptional_max" INTEGER,
    "sort_order" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StrengthStaminaScoreReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConstitutionHealthScoreReference" (
    "id" SERIAL NOT NULL,
    "score" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConstitutionHealthScoreReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConstitutionFitnessScoreReference" (
    "id" SERIAL NOT NULL,
    "score" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConstitutionFitnessScoreReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DexterityAimScoreReference" (
    "id" SERIAL NOT NULL,
    "score" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DexterityAimScoreReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DexterityBalanceScoreReference" (
    "id" SERIAL NOT NULL,
    "score" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DexterityBalanceScoreReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WisdomIntuitionScoreReference" (
    "id" SERIAL NOT NULL,
    "score" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WisdomIntuitionScoreReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WisdomWillpowerScoreReference" (
    "id" SERIAL NOT NULL,
    "score" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WisdomWillpowerScoreReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntelligenceReasonScoreReference" (
    "id" SERIAL NOT NULL,
    "score" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntelligenceReasonScoreReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntelligenceKnowledgeScoreReference" (
    "id" SERIAL NOT NULL,
    "score" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntelligenceKnowledgeScoreReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharismaAppearanceScoreReference" (
    "id" SERIAL NOT NULL,
    "score" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharismaAppearanceScoreReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharismaLeadershipScoreReference" (
    "id" SERIAL NOT NULL,
    "score" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharismaLeadershipScoreReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterSubAttributeValue" (
    "id" SERIAL NOT NULL,
    "character_id" INTEGER NOT NULL,
    "sub_attribute_id" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "exceptional_value" INTEGER,
    "value_label" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharacterSubAttributeValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleClass" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuleClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleKit" (
    "id" SERIAL NOT NULL,
    "class_id" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuleKit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleTraitDisadvantage" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "point_cost" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuleTraitDisadvantage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterTraitDisadvantage" (
    "id" SERIAL NOT NULL,
    "character_id" INTEGER NOT NULL,
    "trait_disadvantage_id" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterTraitDisadvantage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleNonWeaponProficiency" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "point_cost" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuleNonWeaponProficiency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterNonWeaponProficiency" (
    "id" SERIAL NOT NULL,
    "character_id" INTEGER NOT NULL,
    "proficiency_id" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterNonWeaponProficiency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleWeaponProficiency" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "point_cost" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuleWeaponProficiency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterWeaponProficiency" (
    "id" SERIAL NOT NULL,
    "character_id" INTEGER NOT NULL,
    "proficiency_id" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterWeaponProficiency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleEquipment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuleEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterEquipment" (
    "id" SERIAL NOT NULL,
    "character_id" INTEGER NOT NULL,
    "equipment_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Character_name_idx" ON "Character"("name");

-- CreateIndex
CREATE INDEX "Character_player_name_idx" ON "Character"("player_name");

-- CreateIndex
CREATE UNIQUE INDEX "RaceBase_name_key" ON "RaceBase"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SubRace_race_base_id_name_key" ON "SubRace"("race_base_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "RaceAbility_race_base_id_name_key" ON "RaceAbility"("race_base_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "SubRaceStandardAbility_sub_race_id_race_ability_id_key" ON "SubRaceStandardAbility"("sub_race_id", "race_ability_id");

-- CreateIndex
CREATE UNIQUE INDEX "AttributeDefinition_name_key" ON "AttributeDefinition"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SubAttributeDefinition_attribute_id_name_key" ON "SubAttributeDefinition"("attribute_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "StrengthMuscleScoreReference_score_label_key" ON "StrengthMuscleScoreReference"("score_label");

-- CreateIndex
CREATE UNIQUE INDEX "StrengthStaminaScoreReference_score_label_key" ON "StrengthStaminaScoreReference"("score_label");

-- CreateIndex
CREATE UNIQUE INDEX "ConstitutionHealthScoreReference_score_key" ON "ConstitutionHealthScoreReference"("score");

-- CreateIndex
CREATE UNIQUE INDEX "ConstitutionFitnessScoreReference_score_key" ON "ConstitutionFitnessScoreReference"("score");

-- CreateIndex
CREATE UNIQUE INDEX "DexterityAimScoreReference_score_key" ON "DexterityAimScoreReference"("score");

-- CreateIndex
CREATE UNIQUE INDEX "DexterityBalanceScoreReference_score_key" ON "DexterityBalanceScoreReference"("score");

-- CreateIndex
CREATE UNIQUE INDEX "WisdomIntuitionScoreReference_score_key" ON "WisdomIntuitionScoreReference"("score");

-- CreateIndex
CREATE UNIQUE INDEX "WisdomWillpowerScoreReference_score_key" ON "WisdomWillpowerScoreReference"("score");

-- CreateIndex
CREATE UNIQUE INDEX "IntelligenceReasonScoreReference_score_key" ON "IntelligenceReasonScoreReference"("score");

-- CreateIndex
CREATE UNIQUE INDEX "IntelligenceKnowledgeScoreReference_score_key" ON "IntelligenceKnowledgeScoreReference"("score");

-- CreateIndex
CREATE UNIQUE INDEX "CharismaAppearanceScoreReference_score_key" ON "CharismaAppearanceScoreReference"("score");

-- CreateIndex
CREATE UNIQUE INDEX "CharismaLeadershipScoreReference_score_key" ON "CharismaLeadershipScoreReference"("score");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSubAttributeValue_character_id_sub_attribute_id_key" ON "CharacterSubAttributeValue"("character_id", "sub_attribute_id");

-- CreateIndex
CREATE UNIQUE INDEX "RuleClass_name_key" ON "RuleClass"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RuleKit_class_id_name_key" ON "RuleKit"("class_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "RuleTraitDisadvantage_name_key" ON "RuleTraitDisadvantage"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterTraitDisadvantage_character_id_trait_disadvantage__key" ON "CharacterTraitDisadvantage"("character_id", "trait_disadvantage_id");

-- CreateIndex
CREATE UNIQUE INDEX "RuleNonWeaponProficiency_name_key" ON "RuleNonWeaponProficiency"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterNonWeaponProficiency_character_id_proficiency_id_key" ON "CharacterNonWeaponProficiency"("character_id", "proficiency_id");

-- CreateIndex
CREATE UNIQUE INDEX "RuleWeaponProficiency_name_key" ON "RuleWeaponProficiency"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterWeaponProficiency_character_id_proficiency_id_key" ON "CharacterWeaponProficiency"("character_id", "proficiency_id");

-- CreateIndex
CREATE UNIQUE INDEX "RuleEquipment_name_key" ON "RuleEquipment"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterEquipment_character_id_equipment_id_key" ON "CharacterEquipment"("character_id", "equipment_id");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_race_base_id_fkey" FOREIGN KEY ("race_base_id") REFERENCES "RaceBase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_sub_race_id_fkey" FOREIGN KEY ("sub_race_id") REFERENCES "SubRace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "RuleClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_kit_id_fkey" FOREIGN KEY ("kit_id") REFERENCES "RuleKit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubRace" ADD CONSTRAINT "SubRace_race_base_id_fkey" FOREIGN KEY ("race_base_id") REFERENCES "RaceBase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaceAbility" ADD CONSTRAINT "RaceAbility_race_base_id_fkey" FOREIGN KEY ("race_base_id") REFERENCES "RaceBase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubRaceStandardAbility" ADD CONSTRAINT "SubRaceStandardAbility_sub_race_id_fkey" FOREIGN KEY ("sub_race_id") REFERENCES "SubRace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubRaceStandardAbility" ADD CONSTRAINT "SubRaceStandardAbility_race_ability_id_fkey" FOREIGN KEY ("race_ability_id") REFERENCES "RaceAbility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubAttributeDefinition" ADD CONSTRAINT "SubAttributeDefinition_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "AttributeDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSubAttributeValue" ADD CONSTRAINT "CharacterSubAttributeValue_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSubAttributeValue" ADD CONSTRAINT "CharacterSubAttributeValue_sub_attribute_id_fkey" FOREIGN KEY ("sub_attribute_id") REFERENCES "SubAttributeDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleKit" ADD CONSTRAINT "RuleKit_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "RuleClass"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTraitDisadvantage" ADD CONSTRAINT "CharacterTraitDisadvantage_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterTraitDisadvantage" ADD CONSTRAINT "CharacterTraitDisadvantage_trait_disadvantage_id_fkey" FOREIGN KEY ("trait_disadvantage_id") REFERENCES "RuleTraitDisadvantage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterNonWeaponProficiency" ADD CONSTRAINT "CharacterNonWeaponProficiency_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterNonWeaponProficiency" ADD CONSTRAINT "CharacterNonWeaponProficiency_proficiency_id_fkey" FOREIGN KEY ("proficiency_id") REFERENCES "RuleNonWeaponProficiency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterWeaponProficiency" ADD CONSTRAINT "CharacterWeaponProficiency_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterWeaponProficiency" ADD CONSTRAINT "CharacterWeaponProficiency_proficiency_id_fkey" FOREIGN KEY ("proficiency_id") REFERENCES "RuleWeaponProficiency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterEquipment" ADD CONSTRAINT "CharacterEquipment_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterEquipment" ADD CONSTRAINT "CharacterEquipment_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "RuleEquipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SeedData
INSERT INTO "StrengthMuscleScoreReference" (
    "score_label",
    "base_score",
    "exceptional_min",
    "exceptional_max",
    "sort_order",
    "title",
    "description",
    "updated_at"
) VALUES
    ('1', 1, NULL, NULL, 1, NULL, NULL, CURRENT_TIMESTAMP),
    ('2', 2, NULL, NULL, 2, NULL, NULL, CURRENT_TIMESTAMP),
    ('3', 3, NULL, NULL, 3, NULL, NULL, CURRENT_TIMESTAMP),
    ('4-5', 4, NULL, NULL, 4, NULL, NULL, CURRENT_TIMESTAMP),
    ('6-7', 6, NULL, NULL, 5, NULL, NULL, CURRENT_TIMESTAMP),
    ('8-9', 8, NULL, NULL, 6, NULL, NULL, CURRENT_TIMESTAMP),
    ('10-11', 10, NULL, NULL, 7, NULL, NULL, CURRENT_TIMESTAMP),
    ('12-13', 12, NULL, NULL, 8, NULL, NULL, CURRENT_TIMESTAMP),
    ('14-15', 14, NULL, NULL, 9, NULL, NULL, CURRENT_TIMESTAMP),
    ('16', 16, NULL, NULL, 10, NULL, NULL, CURRENT_TIMESTAMP),
    ('17', 17, NULL, NULL, 11, NULL, NULL, CURRENT_TIMESTAMP),
    ('18', 18, NULL, NULL, 12, NULL, NULL, CURRENT_TIMESTAMP),
    ('18/01-50', 18, 1, 50, 13, NULL, NULL, CURRENT_TIMESTAMP),
    ('18/51-75', 18, 51, 75, 14, NULL, NULL, CURRENT_TIMESTAMP),
    ('18/76-90', 18, 76, 90, 15, NULL, NULL, CURRENT_TIMESTAMP),
    ('18/91-99', 18, 91, 99, 16, NULL, NULL, CURRENT_TIMESTAMP),
    ('18/00', 18, 100, 100, 17, NULL, NULL, CURRENT_TIMESTAMP),
    ('19', 19, NULL, NULL, 18, NULL, NULL, CURRENT_TIMESTAMP),
    ('20', 20, NULL, NULL, 19, NULL, NULL, CURRENT_TIMESTAMP),
    ('21', 21, NULL, NULL, 20, NULL, NULL, CURRENT_TIMESTAMP),
    ('22', 22, NULL, NULL, 21, NULL, NULL, CURRENT_TIMESTAMP),
    ('23', 23, NULL, NULL, 22, NULL, NULL, CURRENT_TIMESTAMP),
    ('24', 24, NULL, NULL, 23, NULL, NULL, CURRENT_TIMESTAMP),
    ('25', 25, NULL, NULL, 24, NULL, NULL, CURRENT_TIMESTAMP)
ON CONFLICT ("score_label") DO NOTHING;

