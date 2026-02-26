-- Seed RaceAbility and default subrace packages for Half-Elf, Half-Orc, Half-Ogre, Human
-- Idempotent upserts

-- =========================================================
-- HALF-ELF abilities
-- =========================================================
WITH rb AS (
  SELECT id FROM "RaceBase" WHERE "name" = 'Half-Elf'
)
INSERT INTO "RaceAbility" ("race_base_id", "name", "description", "cost", "kind", "updated_at")
SELECT rb.id, v.name, v.description, v.cost, v.kind::"RaceAbilityKind", CURRENT_TIMESTAMP
FROM rb
CROSS JOIN (
  VALUES
    ('Infravision, 60''', 'Half-elf infravision range of 60 feet.', 10, 'BENEFIT'),
    ('Resistance', '30% resistance to sleep and charm spells.', 5, 'BENEFIT'),
    ('Languages', 'Common, elf, gnome, halfling, goblin, hobgoblin, orc, and gnoll.', 5, 'BENEFIT'),
    ('Secret Doors', 'Improved chance to detect secret and concealed doors.', 5, 'BENEFIT')
) AS v(name, description, cost, kind)
ON CONFLICT ("race_base_id", "name") DO UPDATE
SET
  "description" = EXCLUDED."description",
  "cost" = EXCLUDED."cost",
  "kind" = EXCLUDED."kind",
  "updated_at" = CURRENT_TIMESTAMP;

WITH package_abilities AS (
  SELECT
    sr.id AS subrace_id,
    ra.id AS race_ability_id,
    true AS is_default_package
  FROM "SubRace" sr
  JOIN "RaceBase" rb ON rb.id = sr."race_base_id" AND rb."name" = 'Half-Elf'
  JOIN (
    VALUES
      ('Standard Half-Elf', 'Infravision, 60'''),
      ('Standard Half-Elf', 'Resistance'),
      ('Standard Half-Elf', 'Languages'),
      ('Standard Half-Elf', 'Secret Doors')
  ) AS v(subrace_name, ability_name)
    ON v.subrace_name = sr."name"
  JOIN "RaceAbility" ra
    ON ra."race_base_id" = rb.id
   AND ra."name" = v.ability_name
)
INSERT INTO "SubRaceStandardAbility" ("sub_race_id", "race_ability_id", "is_default_package")
SELECT subrace_id, race_ability_id, is_default_package
FROM package_abilities
ON CONFLICT ("sub_race_id", "race_ability_id") DO UPDATE
SET "is_default_package" = EXCLUDED."is_default_package";

-- =========================================================
-- HALF-ORC abilities
-- =========================================================
WITH rb AS (
  SELECT id FROM "RaceBase" WHERE "name" = 'Half-Orc'
)
INSERT INTO "RaceAbility" ("race_base_id", "name", "description", "cost", "kind", "updated_at")
SELECT rb.id, v.name, v.description, v.cost, v.kind::"RaceAbilityKind", CURRENT_TIMESTAMP
FROM rb
CROSS JOIN (
  VALUES
    ('Infravision, 60''', 'Half-orc infravision range of 60 feet.', 10, 'BENEFIT'),
    ('Languages', 'Common, orc, dwarf, goblin, hobgoblin, and ogre.', 5, 'BENEFIT'),
    ('Human Society Stigma', '-2 reaction roll penalty in human societies.', -5, 'PENALTY')
) AS v(name, description, cost, kind)
ON CONFLICT ("race_base_id", "name") DO UPDATE
SET
  "description" = EXCLUDED."description",
  "cost" = EXCLUDED."cost",
  "kind" = EXCLUDED."kind",
  "updated_at" = CURRENT_TIMESTAMP;

WITH package_abilities AS (
  SELECT
    sr.id AS subrace_id,
    ra.id AS race_ability_id,
    true AS is_default_package
  FROM "SubRace" sr
  JOIN "RaceBase" rb ON rb.id = sr."race_base_id" AND rb."name" = 'Half-Orc'
  JOIN (
    VALUES
      ('Standard Half-Orc', 'Infravision, 60'''),
      ('Standard Half-Orc', 'Languages'),
      ('Standard Half-Orc', 'Human Society Stigma')
  ) AS v(subrace_name, ability_name)
    ON v.subrace_name = sr."name"
  JOIN "RaceAbility" ra
    ON ra."race_base_id" = rb.id
   AND ra."name" = v.ability_name
)
INSERT INTO "SubRaceStandardAbility" ("sub_race_id", "race_ability_id", "is_default_package")
SELECT subrace_id, race_ability_id, is_default_package
FROM package_abilities
ON CONFLICT ("sub_race_id", "race_ability_id") DO UPDATE
SET "is_default_package" = EXCLUDED."is_default_package";

-- =========================================================
-- HALF-OGRE abilities
-- =========================================================
WITH rb AS (
  SELECT id FROM "RaceBase" WHERE "name" = 'Half-Ogre'
)
INSERT INTO "RaceAbility" ("race_base_id", "name", "description", "cost", "kind", "updated_at")
SELECT rb.id, v.name, v.description, v.cost, v.kind::"RaceAbilityKind", CURRENT_TIMESTAMP
FROM rb
CROSS JOIN (
  VALUES
    ('Languages', 'Common, ogre, orc, troll, stone giant, and gnoll.', 5, 'BENEFIT'),
    ('Tough Hide', 'Natural Armor Class baseline and conditional AC bonus.', 5, 'BENEFIT'),
    ('Large Target Drawback', 'Large size suffers increased damage and enemy combat advantages.', -10, 'PENALTY')
) AS v(name, description, cost, kind)
ON CONFLICT ("race_base_id", "name") DO UPDATE
SET
  "description" = EXCLUDED."description",
  "cost" = EXCLUDED."cost",
  "kind" = EXCLUDED."kind",
  "updated_at" = CURRENT_TIMESTAMP;

WITH package_abilities AS (
  SELECT
    sr.id AS subrace_id,
    ra.id AS race_ability_id,
    true AS is_default_package
  FROM "SubRace" sr
  JOIN "RaceBase" rb ON rb.id = sr."race_base_id" AND rb."name" = 'Half-Ogre'
  JOIN (
    VALUES
      ('Standard Half-Ogre', 'Languages'),
      ('Standard Half-Ogre', 'Tough Hide'),
      ('Standard Half-Ogre', 'Large Target Drawback')
  ) AS v(subrace_name, ability_name)
    ON v.subrace_name = sr."name"
  JOIN "RaceAbility" ra
    ON ra."race_base_id" = rb.id
   AND ra."name" = v.ability_name
)
INSERT INTO "SubRaceStandardAbility" ("sub_race_id", "race_ability_id", "is_default_package")
SELECT subrace_id, race_ability_id, is_default_package
FROM package_abilities
ON CONFLICT ("sub_race_id", "race_ability_id") DO UPDATE
SET "is_default_package" = EXCLUDED."is_default_package";

-- =========================================================
-- HUMAN abilities
-- =========================================================
WITH rb AS (
  SELECT id FROM "RaceBase" WHERE "name" = 'Human'
)
INSERT INTO "RaceAbility" ("race_base_id", "name", "description", "cost", "kind", "updated_at")
SELECT rb.id, v.name, v.description, v.cost, v.kind::"RaceAbilityKind", CURRENT_TIMESTAMP
FROM rb
CROSS JOIN (
  VALUES
    ('Open Class Advancement', 'Humans can advance without class level limits.', 0, 'BENEFIT'),
    ('Bonus Character Points', 'Humans receive 10 character points to spend.', 0, 'BENEFIT'),
    ('Attack Bonus', '+1 attack with one weapon of choice.', 5, 'BENEFIT'),
    ('Balance Bonus', '+1 to Balance subability score.', 10, 'BENEFIT'),
    ('Experience Bonus', '+5% experience bonus.', 10, 'BENEFIT'),
    ('Health Bonus', '+1 to Health subability score.', 10, 'BENEFIT'),
    ('Hit Point Bonus', '+1 hit point whenever new hit points are rolled.', 10, 'BENEFIT'),
    ('Secret Doors', 'Detect secret/concealed doors (rare trace of elven blood).', 10, 'BENEFIT'),
    ('Tough Hide', 'Natural Armor Class baseline and conditional AC bonus.', 10, 'BENEFIT')
) AS v(name, description, cost, kind)
ON CONFLICT ("race_base_id", "name") DO UPDATE
SET
  "description" = EXCLUDED."description",
  "cost" = EXCLUDED."cost",
  "kind" = EXCLUDED."kind",
  "updated_at" = CURRENT_TIMESTAMP;

WITH package_abilities AS (
  SELECT
    sr.id AS subrace_id,
    ra.id AS race_ability_id,
    true AS is_default_package
  FROM "SubRace" sr
  JOIN "RaceBase" rb ON rb.id = sr."race_base_id" AND rb."name" = 'Human'
  JOIN (
    VALUES
      ('Standard Human', 'Open Class Advancement'),
      ('Standard Human', 'Bonus Character Points')
  ) AS v(subrace_name, ability_name)
    ON v.subrace_name = sr."name"
  JOIN "RaceAbility" ra
    ON ra."race_base_id" = rb.id
   AND ra."name" = v.ability_name
)
INSERT INTO "SubRaceStandardAbility" ("sub_race_id", "race_ability_id", "is_default_package")
SELECT subrace_id, race_ability_id, is_default_package
FROM package_abilities
ON CONFLICT ("sub_race_id", "race_ability_id") DO UPDATE
SET "is_default_package" = EXCLUDED."is_default_package";
