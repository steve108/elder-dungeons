-- Seed all attribute reference tables (POSP-aligned, idempotent)

-- Attribute definitions
INSERT INTO "AttributeDefinition" ("name", "description", "updated_at")
VALUES
  ('STRENGTH', 'Strength attribute definition.', CURRENT_TIMESTAMP),
  ('CONSTITUTION', 'Constitution attribute definition.', CURRENT_TIMESTAMP),
  ('DEXTERITY', 'Dexterity attribute definition.', CURRENT_TIMESTAMP),
  ('WISDOM', 'Wisdom attribute definition.', CURRENT_TIMESTAMP),
  ('INTELLIGENCE', 'Intelligence attribute definition.', CURRENT_TIMESTAMP),
  ('CHARISMA', 'Charisma attribute definition.', CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO UPDATE
SET
  "description" = EXCLUDED."description",
  "updated_at" = CURRENT_TIMESTAMP;

-- Sub-attribute definitions
INSERT INTO "SubAttributeDefinition" ("attribute_id", "name", "description", "updated_at")
SELECT id, 'Muscle', 'Strength sub-attribute: burst power.', CURRENT_TIMESTAMP FROM "AttributeDefinition" WHERE "name" = 'STRENGTH'
ON CONFLICT ("attribute_id", "name") DO UPDATE
SET "description" = EXCLUDED."description", "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "SubAttributeDefinition" ("attribute_id", "name", "description", "updated_at")
SELECT id, 'Stamina', 'Strength sub-attribute: endurance and carrying efficiency.', CURRENT_TIMESTAMP FROM "AttributeDefinition" WHERE "name" = 'STRENGTH'
ON CONFLICT ("attribute_id", "name") DO UPDATE
SET "description" = EXCLUDED."description", "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "SubAttributeDefinition" ("attribute_id", "name", "description", "updated_at")
SELECT id, 'Health', 'Constitution sub-attribute: resistance to bodily shock and poison.', CURRENT_TIMESTAMP FROM "AttributeDefinition" WHERE "name" = 'CONSTITUTION'
ON CONFLICT ("attribute_id", "name") DO UPDATE
SET "description" = EXCLUDED."description", "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "SubAttributeDefinition" ("attribute_id", "name", "description", "updated_at")
SELECT id, 'Fitness', 'Constitution sub-attribute: endurance and hit point resilience.', CURRENT_TIMESTAMP FROM "AttributeDefinition" WHERE "name" = 'CONSTITUTION'
ON CONFLICT ("attribute_id", "name") DO UPDATE
SET "description" = EXCLUDED."description", "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "SubAttributeDefinition" ("attribute_id", "name", "description", "updated_at")
SELECT id, 'Aim', 'Dexterity sub-attribute: hand-eye coordination and manual precision.', CURRENT_TIMESTAMP FROM "AttributeDefinition" WHERE "name" = 'DEXTERITY'
ON CONFLICT ("attribute_id", "name") DO UPDATE
SET "description" = EXCLUDED."description", "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "SubAttributeDefinition" ("attribute_id", "name", "description", "updated_at")
SELECT id, 'Balance', 'Dexterity sub-attribute: reflexes and agility.', CURRENT_TIMESTAMP FROM "AttributeDefinition" WHERE "name" = 'DEXTERITY'
ON CONFLICT ("attribute_id", "name") DO UPDATE
SET "description" = EXCLUDED."description", "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "SubAttributeDefinition" ("attribute_id", "name", "description", "updated_at")
SELECT id, 'Reason', 'Intelligence sub-attribute: deduction and logical processing.', CURRENT_TIMESTAMP FROM "AttributeDefinition" WHERE "name" = 'INTELLIGENCE'
ON CONFLICT ("attribute_id", "name") DO UPDATE
SET "description" = EXCLUDED."description", "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "SubAttributeDefinition" ("attribute_id", "name", "description", "updated_at")
SELECT id, 'Knowledge', 'Intelligence sub-attribute: education, memory and learned breadth.', CURRENT_TIMESTAMP FROM "AttributeDefinition" WHERE "name" = 'INTELLIGENCE'
ON CONFLICT ("attribute_id", "name") DO UPDATE
SET "description" = EXCLUDED."description", "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "SubAttributeDefinition" ("attribute_id", "name", "description", "updated_at")
SELECT id, 'Intuition', 'Wisdom sub-attribute: awareness and perceptive insight.', CURRENT_TIMESTAMP FROM "AttributeDefinition" WHERE "name" = 'WISDOM'
ON CONFLICT ("attribute_id", "name") DO UPDATE
SET "description" = EXCLUDED."description", "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "SubAttributeDefinition" ("attribute_id", "name", "description", "updated_at")
SELECT id, 'Willpower', 'Wisdom sub-attribute: will strength and resistance to mental influence.', CURRENT_TIMESTAMP FROM "AttributeDefinition" WHERE "name" = 'WISDOM'
ON CONFLICT ("attribute_id", "name") DO UPDATE
SET "description" = EXCLUDED."description", "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "SubAttributeDefinition" ("attribute_id", "name", "description", "updated_at")
SELECT id, 'Appearance', 'Charisma sub-attribute: physical presence and attractiveness.', CURRENT_TIMESTAMP FROM "AttributeDefinition" WHERE "name" = 'CHARISMA'
ON CONFLICT ("attribute_id", "name") DO UPDATE
SET "description" = EXCLUDED."description", "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "SubAttributeDefinition" ("attribute_id", "name", "description", "updated_at")
SELECT id, 'Leadership', 'Charisma sub-attribute: force of personality and command.', CURRENT_TIMESTAMP FROM "AttributeDefinition" WHERE "name" = 'CHARISMA'
ON CONFLICT ("attribute_id", "name") DO UPDATE
SET "description" = EXCLUDED."description", "updated_at" = CURRENT_TIMESTAMP;

-- Strength / Stamina
INSERT INTO "StrengthStaminaScoreReference" (
  "score_label", "base_score", "exceptional_min", "exceptional_max", "sort_order", "weight_allowance", "updated_at"
)
VALUES
  ('3', 3, NULL, NULL, 1, 5, CURRENT_TIMESTAMP),
  ('4-5', 4, NULL, NULL, 2, 10, CURRENT_TIMESTAMP),
  ('6-7', 6, NULL, NULL, 3, 20, CURRENT_TIMESTAMP),
  ('8-9', 8, NULL, NULL, 4, 35, CURRENT_TIMESTAMP),
  ('10-11', 10, NULL, NULL, 5, 40, CURRENT_TIMESTAMP),
  ('12-13', 12, NULL, NULL, 6, 45, CURRENT_TIMESTAMP),
  ('14-15', 14, NULL, NULL, 7, 55, CURRENT_TIMESTAMP),
  ('16', 16, NULL, NULL, 8, 70, CURRENT_TIMESTAMP),
  ('17', 17, NULL, NULL, 9, 85, CURRENT_TIMESTAMP),
  ('18', 18, NULL, NULL, 10, 110, CURRENT_TIMESTAMP),
  ('18/01-50', 18, 1, 50, 11, 135, CURRENT_TIMESTAMP),
  ('18/51-75', 18, 51, 75, 12, 160, CURRENT_TIMESTAMP),
  ('18/76-90', 18, 76, 90, 13, 185, CURRENT_TIMESTAMP),
  ('18/91-99', 18, 91, 99, 14, 235, CURRENT_TIMESTAMP),
  ('18/00', 18, 100, 100, 15, 335, CURRENT_TIMESTAMP),
  ('19', 19, NULL, NULL, 16, 485, CURRENT_TIMESTAMP),
  ('20', 20, NULL, NULL, 17, 535, CURRENT_TIMESTAMP),
  ('21', 21, NULL, NULL, 18, 635, CURRENT_TIMESTAMP),
  ('22', 22, NULL, NULL, 19, 785, CURRENT_TIMESTAMP),
  ('23', 23, NULL, NULL, 20, 935, CURRENT_TIMESTAMP),
  ('24', 24, NULL, NULL, 21, 1235, CURRENT_TIMESTAMP),
  ('25', 25, NULL, NULL, 22, 1535, CURRENT_TIMESTAMP)
ON CONFLICT ("score_label") DO UPDATE
SET
  "base_score" = EXCLUDED."base_score",
  "exceptional_min" = EXCLUDED."exceptional_min",
  "exceptional_max" = EXCLUDED."exceptional_max",
  "sort_order" = EXCLUDED."sort_order",
  "weight_allowance" = EXCLUDED."weight_allowance",
  "updated_at" = CURRENT_TIMESTAMP;

-- Strength / Muscle
INSERT INTO "StrengthMuscleScoreReference" (
  "score_label", "base_score", "exceptional_min", "exceptional_max", "sort_order",
  "attack_adjustment", "damage_adjustment", "max_press", "open_doors", "open_doors_locked", "bend_bars_lift_gates_percent", "updated_at"
)
VALUES
  ('3', 3, NULL, NULL, 1, -3, -1, 10, 2, NULL, 0, CURRENT_TIMESTAMP),
  ('4-5', 4, NULL, NULL, 2, -2, -1, 25, 3, NULL, 0, CURRENT_TIMESTAMP),
  ('6-7', 6, NULL, NULL, 3, -1, 0, 55, 4, NULL, 0, CURRENT_TIMESTAMP),
  ('8-9', 8, NULL, NULL, 4, 0, 0, 90, 5, NULL, 1, CURRENT_TIMESTAMP),
  ('10-11', 10, NULL, NULL, 5, 0, 0, 115, 6, NULL, 2, CURRENT_TIMESTAMP),
  ('12-13', 12, NULL, NULL, 6, 0, 0, 140, 7, NULL, 4, CURRENT_TIMESTAMP),
  ('14-15', 14, NULL, NULL, 7, 0, 0, 170, 8, NULL, 7, CURRENT_TIMESTAMP),
  ('16', 16, NULL, NULL, 8, 0, 1, 195, 9, NULL, 10, CURRENT_TIMESTAMP),
  ('17', 17, NULL, NULL, 9, 1, 1, 220, 10, NULL, 13, CURRENT_TIMESTAMP),
  ('18', 18, NULL, NULL, 10, 1, 3, 255, 11, NULL, 16, CURRENT_TIMESTAMP),
  ('18/01-50', 18, 1, 50, 11, 1, 3, 280, 12, NULL, 20, CURRENT_TIMESTAMP),
  ('18/51-75', 18, 51, 75, 12, 2, 3, 305, 13, NULL, 25, CURRENT_TIMESTAMP),
  ('18/76-90', 18, 76, 90, 13, 2, 4, 330, 14, NULL, 30, CURRENT_TIMESTAMP),
  ('18/91-99', 18, 91, 99, 14, 2, 5, 380, 15, 3, 35, CURRENT_TIMESTAMP),
  ('18/00', 18, 100, 100, 15, 3, 6, 480, 16, 6, 40, CURRENT_TIMESTAMP),
  ('19', 19, NULL, NULL, 16, 3, 7, 640, 16, 8, 50, CURRENT_TIMESTAMP),
  ('20', 20, NULL, NULL, 17, 3, 8, 700, 17, 10, 60, CURRENT_TIMESTAMP),
  ('21', 21, NULL, NULL, 18, 4, 9, 810, 17, 12, 70, CURRENT_TIMESTAMP),
  ('22', 22, NULL, NULL, 19, 4, 10, 970, 18, 14, 80, CURRENT_TIMESTAMP),
  ('23', 23, NULL, NULL, 20, 5, 11, 1130, 18, 16, 90, CURRENT_TIMESTAMP),
  ('24', 24, NULL, NULL, 21, 6, 12, 1440, 19, 17, 95, CURRENT_TIMESTAMP),
  ('25', 25, NULL, NULL, 22, 7, 14, 1535, 19, 18, 99, CURRENT_TIMESTAMP)
ON CONFLICT ("score_label") DO UPDATE
SET
  "base_score" = EXCLUDED."base_score",
  "exceptional_min" = EXCLUDED."exceptional_min",
  "exceptional_max" = EXCLUDED."exceptional_max",
  "sort_order" = EXCLUDED."sort_order",
  "attack_adjustment" = EXCLUDED."attack_adjustment",
  "damage_adjustment" = EXCLUDED."damage_adjustment",
  "max_press" = EXCLUDED."max_press",
  "open_doors" = EXCLUDED."open_doors",
  "open_doors_locked" = EXCLUDED."open_doors_locked",
  "bend_bars_lift_gates_percent" = EXCLUDED."bend_bars_lift_gates_percent",
  "updated_at" = CURRENT_TIMESTAMP;

-- Constitution / Health
INSERT INTO "ConstitutionHealthScoreReference" (
  "score_label", "score_min", "score_max", "sort_order", "system_shock_percent", "poison_save_modifier", "updated_at"
)
VALUES
  ('3', 3, 3, 1, 35, 0, CURRENT_TIMESTAMP),
  ('4', 4, 4, 2, 40, 0, CURRENT_TIMESTAMP),
  ('5', 5, 5, 3, 45, 0, CURRENT_TIMESTAMP),
  ('6', 6, 6, 4, 50, 0, CURRENT_TIMESTAMP),
  ('7', 7, 7, 5, 55, 0, CURRENT_TIMESTAMP),
  ('8', 8, 8, 6, 60, 0, CURRENT_TIMESTAMP),
  ('9', 9, 9, 7, 65, 0, CURRENT_TIMESTAMP),
  ('10', 10, 10, 8, 70, 0, CURRENT_TIMESTAMP),
  ('11', 11, 11, 9, 75, 0, CURRENT_TIMESTAMP),
  ('12', 12, 12, 10, 80, 0, CURRENT_TIMESTAMP),
  ('13', 13, 13, 11, 85, 0, CURRENT_TIMESTAMP),
  ('14', 14, 14, 12, 88, 0, CURRENT_TIMESTAMP),
  ('15', 15, 15, 13, 90, 0, CURRENT_TIMESTAMP),
  ('16', 16, 16, 14, 95, 0, CURRENT_TIMESTAMP),
  ('17', 17, 17, 15, 97, 0, CURRENT_TIMESTAMP),
  ('18', 18, 18, 16, 99, 0, CURRENT_TIMESTAMP),
  ('19', 19, 19, 17, 99, 1, CURRENT_TIMESTAMP),
  ('20', 20, 20, 18, 99, 1, CURRENT_TIMESTAMP),
  ('21', 21, 21, 19, 99, 2, CURRENT_TIMESTAMP),
  ('22', 22, 22, 20, 99, 2, CURRENT_TIMESTAMP),
  ('23', 23, 23, 21, 99, 3, CURRENT_TIMESTAMP),
  ('24', 24, 24, 22, 99, 3, CURRENT_TIMESTAMP),
  ('25', 25, 25, 23, 100, 4, CURRENT_TIMESTAMP)
ON CONFLICT ("score_label") DO UPDATE
SET
  "score_min" = EXCLUDED."score_min",
  "score_max" = EXCLUDED."score_max",
  "sort_order" = EXCLUDED."sort_order",
  "system_shock_percent" = EXCLUDED."system_shock_percent",
  "poison_save_modifier" = EXCLUDED."poison_save_modifier",
  "updated_at" = CURRENT_TIMESTAMP;

-- Constitution / Fitness
INSERT INTO "ConstitutionFitnessScoreReference" (
  "score_label", "score_min", "score_max", "sort_order", "hit_point_adjustment_base", "hit_point_adjustment_warrior", "minimum_hit_die_result", "resurrection_chance_percent", "updated_at"
)
VALUES
  ('3', 3, 3, 1, -2, NULL, NULL, 40, CURRENT_TIMESTAMP),
  ('4', 4, 4, 2, -1, NULL, NULL, 45, CURRENT_TIMESTAMP),
  ('5', 5, 5, 3, -1, NULL, NULL, 50, CURRENT_TIMESTAMP),
  ('6', 6, 6, 4, -1, NULL, NULL, 55, CURRENT_TIMESTAMP),
  ('7', 7, 7, 5, 0, NULL, NULL, 60, CURRENT_TIMESTAMP),
  ('8', 8, 8, 6, 0, NULL, NULL, 65, CURRENT_TIMESTAMP),
  ('9', 9, 9, 7, 0, NULL, NULL, 70, CURRENT_TIMESTAMP),
  ('10', 10, 10, 8, 0, NULL, NULL, 75, CURRENT_TIMESTAMP),
  ('11', 11, 11, 9, 0, NULL, NULL, 80, CURRENT_TIMESTAMP),
  ('12', 12, 12, 10, 0, NULL, NULL, 85, CURRENT_TIMESTAMP),
  ('13', 13, 13, 11, 0, NULL, NULL, 90, CURRENT_TIMESTAMP),
  ('14', 14, 14, 12, 0, NULL, NULL, 92, CURRENT_TIMESTAMP),
  ('15', 15, 15, 13, 1, NULL, NULL, 94, CURRENT_TIMESTAMP),
  ('16', 16, 16, 14, 2, NULL, NULL, 96, CURRENT_TIMESTAMP),
  ('17', 17, 17, 15, 2, 3, NULL, 98, CURRENT_TIMESTAMP),
  ('18', 18, 18, 16, 2, 4, NULL, 100, CURRENT_TIMESTAMP),
  ('19', 19, 19, 17, 2, 5, NULL, 100, CURRENT_TIMESTAMP),
  ('20', 20, 20, 18, 2, 5, 2, 100, CURRENT_TIMESTAMP),
  ('21', 21, 21, 19, 2, 6, 3, 100, CURRENT_TIMESTAMP),
  ('22', 22, 22, 20, 2, 6, 3, 100, CURRENT_TIMESTAMP),
  ('23', 23, 23, 21, 2, 6, 4, 100, CURRENT_TIMESTAMP),
  ('24', 24, 24, 22, 2, 7, 4, 100, CURRENT_TIMESTAMP),
  ('25', 25, 25, 23, 2, 7, 4, 100, CURRENT_TIMESTAMP)
ON CONFLICT ("score_label") DO UPDATE
SET
  "score_min" = EXCLUDED."score_min",
  "score_max" = EXCLUDED."score_max",
  "sort_order" = EXCLUDED."sort_order",
  "hit_point_adjustment_base" = EXCLUDED."hit_point_adjustment_base",
  "hit_point_adjustment_warrior" = EXCLUDED."hit_point_adjustment_warrior",
  "minimum_hit_die_result" = EXCLUDED."minimum_hit_die_result",
  "resurrection_chance_percent" = EXCLUDED."resurrection_chance_percent",
  "updated_at" = CURRENT_TIMESTAMP;

-- Dexterity / Aim
INSERT INTO "DexterityAimScoreReference" (
  "score_label", "score_min", "score_max", "sort_order", "missile_adjustment", "pick_pockets_percent", "open_locks_percent", "updated_at"
)
VALUES
  ('3', 3, 3, 1, -3, -30, -30, CURRENT_TIMESTAMP),
  ('4', 4, 4, 2, -2, -25, -25, CURRENT_TIMESTAMP),
  ('5', 5, 5, 3, -1, -25, -20, CURRENT_TIMESTAMP),
  ('6', 6, 6, 4, 0, -20, -20, CURRENT_TIMESTAMP),
  ('7', 7, 7, 5, 0, -20, -15, CURRENT_TIMESTAMP),
  ('8', 8, 8, 6, 0, -15, -15, CURRENT_TIMESTAMP),
  ('9', 9, 9, 7, 0, -15, -10, CURRENT_TIMESTAMP),
  ('10', 10, 10, 8, 0, -10, -5, CURRENT_TIMESTAMP),
  ('11', 11, 11, 9, 0, -5, 0, CURRENT_TIMESTAMP),
  ('12-15', 12, 15, 10, 0, 0, 0, CURRENT_TIMESTAMP),
  ('16', 16, 16, 11, 1, 0, 5, CURRENT_TIMESTAMP),
  ('17', 17, 17, 12, 2, 5, 10, CURRENT_TIMESTAMP),
  ('18', 18, 18, 13, 2, 10, 15, CURRENT_TIMESTAMP),
  ('19', 19, 19, 14, 3, 15, 20, CURRENT_TIMESTAMP),
  ('20', 20, 20, 15, 3, 20, 20, CURRENT_TIMESTAMP),
  ('21', 21, 21, 16, 4, 20, 25, CURRENT_TIMESTAMP),
  ('22', 22, 22, 17, 4, 25, 25, CURRENT_TIMESTAMP),
  ('23', 23, 23, 18, 4, 25, 30, CURRENT_TIMESTAMP),
  ('24', 24, 24, 19, 5, 30, 30, CURRENT_TIMESTAMP),
  ('25', 25, 25, 20, 5, 30, 35, CURRENT_TIMESTAMP)
ON CONFLICT ("score_label") DO UPDATE
SET
  "score_min" = EXCLUDED."score_min",
  "score_max" = EXCLUDED."score_max",
  "sort_order" = EXCLUDED."sort_order",
  "missile_adjustment" = EXCLUDED."missile_adjustment",
  "pick_pockets_percent" = EXCLUDED."pick_pockets_percent",
  "open_locks_percent" = EXCLUDED."open_locks_percent",
  "updated_at" = CURRENT_TIMESTAMP;

-- Dexterity / Balance
INSERT INTO "DexterityBalanceScoreReference" (
  "score_label", "score_min", "score_max", "sort_order", "reaction_adjustment", "defensive_adjustment", "move_silently_percent", "climb_walls_percent", "updated_at"
)
VALUES
  ('3', 3, 3, 1, -3, 4, -30, -30, CURRENT_TIMESTAMP),
  ('4', 4, 4, 2, -2, 3, -30, -25, CURRENT_TIMESTAMP),
  ('5', 5, 5, 3, -1, 2, -30, -20, CURRENT_TIMESTAMP),
  ('6', 6, 6, 4, 0, 1, -25, -20, CURRENT_TIMESTAMP),
  ('7', 7, 7, 5, 0, 0, -25, -15, CURRENT_TIMESTAMP),
  ('8', 8, 8, 6, 0, 0, -20, -15, CURRENT_TIMESTAMP),
  ('9', 9, 9, 7, 0, 0, -20, -10, CURRENT_TIMESTAMP),
  ('10', 10, 10, 8, 0, 0, -15, -5, CURRENT_TIMESTAMP),
  ('11', 11, 11, 9, 0, 0, -10, 0, CURRENT_TIMESTAMP),
  ('12', 12, 12, 10, 0, 0, -5, 0, CURRENT_TIMESTAMP),
  ('13-14', 13, 14, 11, 0, 0, 0, 0, CURRENT_TIMESTAMP),
  ('15', 15, 15, 12, 0, -1, 0, 0, CURRENT_TIMESTAMP),
  ('16', 16, 16, 13, 1, -2, 0, 0, CURRENT_TIMESTAMP),
  ('17', 17, 17, 14, 2, -3, 5, 5, CURRENT_TIMESTAMP),
  ('18', 18, 18, 15, 2, -4, 10, 10, CURRENT_TIMESTAMP),
  ('19', 19, 19, 16, 3, -4, 15, 15, CURRENT_TIMESTAMP),
  ('20', 20, 20, 17, 3, -4, 15, 20, CURRENT_TIMESTAMP),
  ('21', 21, 21, 18, 4, -5, 20, 20, CURRENT_TIMESTAMP),
  ('22', 22, 22, 19, 4, -5, 20, 25, CURRENT_TIMESTAMP),
  ('23', 23, 23, 20, 5, -6, 25, 25, CURRENT_TIMESTAMP),
  ('24', 24, 24, 21, 5, -6, 25, 30, CURRENT_TIMESTAMP),
  ('25', 25, 25, 22, 5, -6, 30, 30, CURRENT_TIMESTAMP)
ON CONFLICT ("score_label") DO UPDATE
SET
  "score_min" = EXCLUDED."score_min",
  "score_max" = EXCLUDED."score_max",
  "sort_order" = EXCLUDED."sort_order",
  "reaction_adjustment" = EXCLUDED."reaction_adjustment",
  "defensive_adjustment" = EXCLUDED."defensive_adjustment",
  "move_silently_percent" = EXCLUDED."move_silently_percent",
  "climb_walls_percent" = EXCLUDED."climb_walls_percent",
  "updated_at" = CURRENT_TIMESTAMP;

-- Intelligence / Reason
INSERT INTO "IntelligenceReasonScoreReference" (
  "score_label", "score_min", "score_max", "sort_order", "max_wizard_spell_level", "max_spells_per_level", "all_spells_per_level", "spell_immunity_level", "updated_at"
)
VALUES
  ('3-8', 3, 8, 1, NULL, NULL, false, NULL, CURRENT_TIMESTAMP),
  ('9', 9, 9, 2, 4, 6, false, NULL, CURRENT_TIMESTAMP),
  ('10-11', 10, 11, 3, 5, 7, false, NULL, CURRENT_TIMESTAMP),
  ('12', 12, 12, 4, 6, 7, false, NULL, CURRENT_TIMESTAMP),
  ('13', 13, 13, 5, 6, 9, false, NULL, CURRENT_TIMESTAMP),
  ('14', 14, 14, 6, 7, 9, false, NULL, CURRENT_TIMESTAMP),
  ('15', 15, 15, 7, 7, 11, false, NULL, CURRENT_TIMESTAMP),
  ('16', 16, 16, 8, 8, 11, false, NULL, CURRENT_TIMESTAMP),
  ('17', 17, 17, 9, 8, 14, false, NULL, CURRENT_TIMESTAMP),
  ('18', 18, 18, 10, 9, 18, false, NULL, CURRENT_TIMESTAMP),
  ('19', 19, 19, 11, 9, NULL, true, 1, CURRENT_TIMESTAMP),
  ('20', 20, 20, 12, 9, NULL, true, 2, CURRENT_TIMESTAMP),
  ('21', 21, 21, 13, 9, NULL, true, 3, CURRENT_TIMESTAMP),
  ('22', 22, 22, 14, 9, NULL, true, 4, CURRENT_TIMESTAMP),
  ('23', 23, 23, 15, 9, NULL, true, 5, CURRENT_TIMESTAMP),
  ('24', 24, 24, 16, 9, NULL, true, 6, CURRENT_TIMESTAMP),
  ('25', 25, 25, 17, 9, NULL, true, 7, CURRENT_TIMESTAMP)
ON CONFLICT ("score_label") DO UPDATE
SET
  "score_min" = EXCLUDED."score_min",
  "score_max" = EXCLUDED."score_max",
  "sort_order" = EXCLUDED."sort_order",
  "max_wizard_spell_level" = EXCLUDED."max_wizard_spell_level",
  "max_spells_per_level" = EXCLUDED."max_spells_per_level",
  "all_spells_per_level" = EXCLUDED."all_spells_per_level",
  "spell_immunity_level" = EXCLUDED."spell_immunity_level",
  "updated_at" = CURRENT_TIMESTAMP;

-- Intelligence / Knowledge
INSERT INTO "IntelligenceKnowledgeScoreReference" (
  "score_label", "score_min", "score_max", "sort_order", "bonus_proficiencies", "learn_spell_percent", "updated_at"
)
VALUES
  ('3-8', 3, 8, 1, 1, NULL, CURRENT_TIMESTAMP),
  ('9', 9, 9, 2, 2, 35, CURRENT_TIMESTAMP),
  ('10', 10, 10, 3, 2, 40, CURRENT_TIMESTAMP),
  ('11', 11, 11, 4, 2, 45, CURRENT_TIMESTAMP),
  ('12', 12, 12, 5, 3, 50, CURRENT_TIMESTAMP),
  ('13', 13, 13, 6, 3, 55, CURRENT_TIMESTAMP),
  ('14', 14, 14, 7, 4, 60, CURRENT_TIMESTAMP),
  ('15', 15, 15, 8, 4, 65, CURRENT_TIMESTAMP),
  ('16', 16, 16, 9, 5, 70, CURRENT_TIMESTAMP),
  ('17', 17, 17, 10, 6, 75, CURRENT_TIMESTAMP),
  ('18', 18, 18, 11, 7, 85, CURRENT_TIMESTAMP),
  ('19', 19, 19, 12, 8, 95, CURRENT_TIMESTAMP),
  ('20', 20, 20, 13, 9, 96, CURRENT_TIMESTAMP),
  ('21', 21, 21, 14, 10, 97, CURRENT_TIMESTAMP),
  ('22', 22, 22, 15, 11, 98, CURRENT_TIMESTAMP),
  ('23', 23, 23, 16, 12, 99, CURRENT_TIMESTAMP),
  ('24', 24, 24, 17, 15, 100, CURRENT_TIMESTAMP),
  ('25', 25, 25, 18, 20, 100, CURRENT_TIMESTAMP)
ON CONFLICT ("score_label") DO UPDATE
SET
  "score_min" = EXCLUDED."score_min",
  "score_max" = EXCLUDED."score_max",
  "sort_order" = EXCLUDED."sort_order",
  "bonus_proficiencies" = EXCLUDED."bonus_proficiencies",
  "learn_spell_percent" = EXCLUDED."learn_spell_percent",
  "updated_at" = CURRENT_TIMESTAMP;

-- Wisdom / Intuition
INSERT INTO "WisdomIntuitionScoreReference" (
  "score_label", "score_min", "score_max", "sort_order", "bonus_spells_text", "spell_failure_percent", "updated_at"
)
VALUES
  ('3', 3, 3, 1, '0', 50, CURRENT_TIMESTAMP),
  ('4', 4, 4, 2, '0', 45, CURRENT_TIMESTAMP),
  ('5', 5, 5, 3, '0', 40, CURRENT_TIMESTAMP),
  ('6', 6, 6, 4, '0', 35, CURRENT_TIMESTAMP),
  ('7', 7, 7, 5, '0', 30, CURRENT_TIMESTAMP),
  ('8', 8, 8, 6, '0', 25, CURRENT_TIMESTAMP),
  ('9', 9, 9, 7, '0', 20, CURRENT_TIMESTAMP),
  ('10', 10, 10, 8, '0', 15, CURRENT_TIMESTAMP),
  ('11', 11, 11, 9, '0', 10, CURRENT_TIMESTAMP),
  ('12', 12, 12, 10, '0', 5, CURRENT_TIMESTAMP),
  ('13', 13, 13, 11, '1st', 0, CURRENT_TIMESTAMP),
  ('14', 14, 14, 12, '1st', 0, CURRENT_TIMESTAMP),
  ('15', 15, 15, 13, '2nd', 0, CURRENT_TIMESTAMP),
  ('16', 16, 16, 14, '2nd', 0, CURRENT_TIMESTAMP),
  ('17', 17, 17, 15, '3rd', 0, CURRENT_TIMESTAMP),
  ('18', 18, 18, 16, '4th', 0, CURRENT_TIMESTAMP),
  ('19', 19, 19, 17, '1st, 3rd', 0, CURRENT_TIMESTAMP),
  ('20', 20, 20, 18, '2nd, 4th', 0, CURRENT_TIMESTAMP),
  ('21', 21, 21, 19, '3rd, 5th', 0, CURRENT_TIMESTAMP),
  ('22', 22, 22, 20, '4th, 5th', 0, CURRENT_TIMESTAMP),
  ('23', 23, 23, 21, '1st, 6th', 0, CURRENT_TIMESTAMP),
  ('24', 24, 24, 22, '5th, 6th', 0, CURRENT_TIMESTAMP),
  ('25', 25, 25, 23, '6th, 7th', 0, CURRENT_TIMESTAMP)
ON CONFLICT ("score_label") DO UPDATE
SET
  "score_min" = EXCLUDED."score_min",
  "score_max" = EXCLUDED."score_max",
  "sort_order" = EXCLUDED."sort_order",
  "bonus_spells_text" = EXCLUDED."bonus_spells_text",
  "spell_failure_percent" = EXCLUDED."spell_failure_percent",
  "updated_at" = CURRENT_TIMESTAMP;

-- Wisdom / Willpower
INSERT INTO "WisdomWillpowerScoreReference" (
  "score_label", "score_min", "score_max", "sort_order", "magic_defense_adjustment", "spell_immunity_level", "updated_at"
)
VALUES
  ('3', 3, 3, 1, -3, NULL, CURRENT_TIMESTAMP),
  ('4', 4, 4, 2, -2, NULL, CURRENT_TIMESTAMP),
  ('5', 5, 5, 3, -1, NULL, CURRENT_TIMESTAMP),
  ('6', 6, 6, 4, -1, NULL, CURRENT_TIMESTAMP),
  ('7', 7, 7, 5, -1, NULL, CURRENT_TIMESTAMP),
  ('8-14', 8, 14, 6, NULL, NULL, CURRENT_TIMESTAMP),
  ('15', 15, 15, 7, 1, NULL, CURRENT_TIMESTAMP),
  ('16', 16, 16, 8, 2, NULL, CURRENT_TIMESTAMP),
  ('17', 17, 17, 9, 3, NULL, CURRENT_TIMESTAMP),
  ('18', 18, 18, 10, 4, NULL, CURRENT_TIMESTAMP),
  ('19', 19, 19, 11, 4, 1, CURRENT_TIMESTAMP),
  ('20', 20, 20, 12, 4, 2, CURRENT_TIMESTAMP),
  ('21', 21, 21, 13, 4, 3, CURRENT_TIMESTAMP),
  ('22', 22, 22, 14, 4, 4, CURRENT_TIMESTAMP),
  ('23', 23, 23, 15, 4, 5, CURRENT_TIMESTAMP),
  ('24', 24, 24, 16, 4, 6, CURRENT_TIMESTAMP),
  ('25', 25, 25, 17, 4, 7, CURRENT_TIMESTAMP)
ON CONFLICT ("score_label") DO UPDATE
SET
  "score_min" = EXCLUDED."score_min",
  "score_max" = EXCLUDED."score_max",
  "sort_order" = EXCLUDED."sort_order",
  "magic_defense_adjustment" = EXCLUDED."magic_defense_adjustment",
  "spell_immunity_level" = EXCLUDED."spell_immunity_level",
  "updated_at" = CURRENT_TIMESTAMP;

-- Charisma / Leadership
INSERT INTO "CharismaLeadershipScoreReference" (
  "score_label", "score_min", "score_max", "sort_order", "loyalty_base", "max_henchmen", "updated_at"
)
VALUES
  ('3', 3, 3, 1, -6, 1, CURRENT_TIMESTAMP),
  ('4', 4, 4, 2, -5, 1, CURRENT_TIMESTAMP),
  ('5', 5, 5, 3, -4, 2, CURRENT_TIMESTAMP),
  ('6', 6, 6, 4, -3, 2, CURRENT_TIMESTAMP),
  ('7', 7, 7, 5, -2, 3, CURRENT_TIMESTAMP),
  ('8', 8, 8, 6, -1, 3, CURRENT_TIMESTAMP),
  ('9-11', 9, 11, 7, 0, 4, CURRENT_TIMESTAMP),
  ('12-13', 12, 13, 8, 0, 5, CURRENT_TIMESTAMP),
  ('14', 14, 14, 9, 1, 6, CURRENT_TIMESTAMP),
  ('15', 15, 15, 10, 3, 7, CURRENT_TIMESTAMP),
  ('16', 16, 16, 11, 4, 8, CURRENT_TIMESTAMP),
  ('17', 17, 17, 12, 6, 10, CURRENT_TIMESTAMP),
  ('18', 18, 18, 13, 8, 15, CURRENT_TIMESTAMP),
  ('19', 19, 19, 14, 10, 20, CURRENT_TIMESTAMP),
  ('20', 20, 20, 15, 12, 25, CURRENT_TIMESTAMP),
  ('21', 21, 21, 16, 14, 30, CURRENT_TIMESTAMP),
  ('22', 22, 22, 17, 16, 35, CURRENT_TIMESTAMP),
  ('23', 23, 23, 18, 18, 40, CURRENT_TIMESTAMP),
  ('24', 24, 24, 19, 20, 45, CURRENT_TIMESTAMP),
  ('25', 25, 25, 20, 20, 50, CURRENT_TIMESTAMP)
ON CONFLICT ("score_label") DO UPDATE
SET
  "score_min" = EXCLUDED."score_min",
  "score_max" = EXCLUDED."score_max",
  "sort_order" = EXCLUDED."sort_order",
  "loyalty_base" = EXCLUDED."loyalty_base",
  "max_henchmen" = EXCLUDED."max_henchmen",
  "updated_at" = CURRENT_TIMESTAMP;

-- Charisma / Appearance
INSERT INTO "CharismaAppearanceScoreReference" (
  "score_label", "score_min", "score_max", "sort_order", "reaction_adjustment", "updated_at"
)
VALUES
  ('3', 3, 3, 1, -5, CURRENT_TIMESTAMP),
  ('4', 4, 4, 2, -4, CURRENT_TIMESTAMP),
  ('5', 5, 5, 3, -3, CURRENT_TIMESTAMP),
  ('6', 6, 6, 4, -2, CURRENT_TIMESTAMP),
  ('7', 7, 7, 5, -1, CURRENT_TIMESTAMP),
  ('8-12', 8, 12, 6, 0, CURRENT_TIMESTAMP),
  ('13', 13, 13, 7, 1, CURRENT_TIMESTAMP),
  ('14', 14, 14, 8, 2, CURRENT_TIMESTAMP),
  ('15', 15, 15, 9, 3, CURRENT_TIMESTAMP),
  ('16', 16, 16, 10, 5, CURRENT_TIMESTAMP),
  ('17', 17, 17, 11, 6, CURRENT_TIMESTAMP),
  ('18', 18, 18, 12, 7, CURRENT_TIMESTAMP),
  ('19', 19, 19, 13, 8, CURRENT_TIMESTAMP),
  ('20', 20, 20, 14, 9, CURRENT_TIMESTAMP),
  ('21', 21, 21, 15, 10, CURRENT_TIMESTAMP),
  ('22', 22, 22, 16, 11, CURRENT_TIMESTAMP),
  ('23', 23, 23, 17, 12, CURRENT_TIMESTAMP),
  ('24', 24, 24, 18, 13, CURRENT_TIMESTAMP),
  ('25', 25, 25, 19, 14, CURRENT_TIMESTAMP)
ON CONFLICT ("score_label") DO UPDATE
SET
  "score_min" = EXCLUDED."score_min",
  "score_max" = EXCLUDED."score_max",
  "sort_order" = EXCLUDED."sort_order",
  "reaction_adjustment" = EXCLUDED."reaction_adjustment",
  "updated_at" = CURRENT_TIMESTAMP;
