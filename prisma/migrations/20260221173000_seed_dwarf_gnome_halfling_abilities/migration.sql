-- Seed RaceAbility and default subrace packages for Dwarf, Gnome, Halfling
-- Idempotent upserts

-- =========================================================
-- DWARF abilities
-- =========================================================
WITH rb AS (
  SELECT id FROM "RaceBase" WHERE "name" = 'Dwarf'
)
INSERT INTO "RaceAbility" ("race_base_id", "name", "description", "cost", "kind", "updated_at")
SELECT rb.id, v.name, v.description, v.cost, v.kind::"RaceAbilityKind", CURRENT_TIMESTAMP
FROM rb
CROSS JOIN (
  VALUES
    ('Infravision, 60''', 'Dwarf infravision range of 60 feet.', 10, 'BENEFIT'),
    ('Infravision, 90''', 'Dwarf infravision range of 90 feet.', 10, 'BENEFIT'),
    ('Infravision, 120''', 'Dwarf infravision range of 120 feet.', 10, 'BENEFIT'),
    ('Saving Throw Bonuses', 'Bonuses vs poison and magical attacks based on Health score.', 10, 'BENEFIT'),
    ('Melee Combat Bonuses', 'Dwarven melee racial combat bonuses.', 10, 'BENEFIT'),
    ('Mining Detection Abilities', 'Stonework/mining detection capabilities.', 10, 'BENEFIT'),
    ('Stealth', 'Dwarven stealth package ability when not in metal armor.', 10, 'BENEFIT'),

    ('Deep Dwarf Sunlight Penalty', '-1 to all rolls in bright sunlight or continual light.', -10, 'PENALTY'),
    ('Gray Dwarf Sunlight Penalty', '-1 to all rolls in bright sunlight or continual light.', -10, 'PENALTY'),
    ('Gray Dwarf Social Distrust', '-2 initial reaction penalty from other dwarves.', -5, 'PENALTY'),
    ('Hill Dwarf Water Unease', '-2 reaction penalty in or adjacent to rivers, lakes, and seas.', -5, 'PENALTY'),
    ('Mountain Dwarf Sea Unease', '-2 reaction penalty on sea-going vessels or large bodies of water.', -5, 'PENALTY')
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
  JOIN "RaceBase" rb ON rb.id = sr."race_base_id" AND rb."name" = 'Dwarf'
  JOIN (
    VALUES
      ('Deep Dwarf', 'Infravision, 90'''),
      ('Deep Dwarf', 'Saving Throw Bonuses'),
      ('Deep Dwarf', 'Melee Combat Bonuses'),
      ('Deep Dwarf', 'Mining Detection Abilities'),
      ('Deep Dwarf', 'Deep Dwarf Sunlight Penalty'),

      ('Gray Dwarf', 'Infravision, 120'''),
      ('Gray Dwarf', 'Saving Throw Bonuses'),
      ('Gray Dwarf', 'Melee Combat Bonuses'),
      ('Gray Dwarf', 'Stealth'),
      ('Gray Dwarf', 'Mining Detection Abilities'),
      ('Gray Dwarf', 'Gray Dwarf Sunlight Penalty'),
      ('Gray Dwarf', 'Gray Dwarf Social Distrust'),

      ('Hill Dwarf', 'Infravision, 60'''),
      ('Hill Dwarf', 'Saving Throw Bonuses'),
      ('Hill Dwarf', 'Melee Combat Bonuses'),
      ('Hill Dwarf', 'Mining Detection Abilities'),
      ('Hill Dwarf', 'Hill Dwarf Water Unease'),

      ('Mountain Dwarf', 'Infravision, 60'''),
      ('Mountain Dwarf', 'Saving Throw Bonuses'),
      ('Mountain Dwarf', 'Melee Combat Bonuses'),
      ('Mountain Dwarf', 'Mining Detection Abilities'),
      ('Mountain Dwarf', 'Mountain Dwarf Sea Unease')
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
-- GNOME abilities
-- =========================================================
WITH rb AS (
  SELECT id FROM "RaceBase" WHERE "name" = 'Gnome'
)
INSERT INTO "RaceAbility" ("race_base_id", "name", "description", "cost", "kind", "updated_at")
SELECT rb.id, v.name, v.description, v.cost, v.kind::"RaceAbilityKind", CURRENT_TIMESTAMP
FROM rb
CROSS JOIN (
  VALUES
    ('Infravision, 60''', 'Gnome infravision range of 60 feet.', 10, 'BENEFIT'),
    ('Infravision, 120''', 'Gnome infravision range of 120 feet.', 10, 'BENEFIT'),
    ('Saving Throw Bonus', 'Gnomish magical saving throw bonus by Health score.', 5, 'BENEFIT'),
    ('Melee Combat Bonus', 'Gnomish melee combat racial package benefit.', 10, 'BENEFIT'),
    ('Mining Detection Abilities', 'Stonework/mining detection capabilities.', 10, 'BENEFIT'),
    ('Dart Bonus', '+1 attack roll with darts.', 5, 'BENEFIT'),
    ('Freeze', 'Can remain motionless and hard to detect underground.', 10, 'BENEFIT'),
    ('Stealth', 'Stealth package ability when not in metal armor.', 10, 'BENEFIT'),
    ('Animal Friendship', 'Animal friendship ability (burrowing animals).', 10, 'BENEFIT'),
    ('Forest Movement', 'Pass without trace through woodland environment.', 10, 'BENEFIT'),
    ('Hide', 'Hide in woods package ability.', 10, 'BENEFIT'),

    ('Deep Gnome Reputation', '-2 reaction penalty when initially encountering other races.', -5, 'PENALTY'),
    ('Forest Gnome No Infravision', 'Forest gnomes cannot have infravision.', -5, 'PENALTY')
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
  JOIN "RaceBase" rb ON rb.id = sr."race_base_id" AND rb."name" = 'Gnome'
  JOIN (
    VALUES
      ('Deep Gnome', 'Dart Bonus'),
      ('Deep Gnome', 'Mining Detection Abilities'),
      ('Deep Gnome', 'Freeze'),
      ('Deep Gnome', 'Saving Throw Bonus'),
      ('Deep Gnome', 'Infravision, 120'''),
      ('Deep Gnome', 'Stealth'),
      ('Deep Gnome', 'Melee Combat Bonus'),
      ('Deep Gnome', 'Deep Gnome Reputation'),

      ('Forest Gnome', 'Animal Friendship'),
      ('Forest Gnome', 'Melee Combat Bonus'),
      ('Forest Gnome', 'Forest Movement'),
      ('Forest Gnome', 'Saving Throw Bonus'),
      ('Forest Gnome', 'Hide'),
      ('Forest Gnome', 'Forest Gnome No Infravision'),

      ('Rock Gnome', 'Infravision, 60'''),
      ('Rock Gnome', 'Mining Detection Abilities'),
      ('Rock Gnome', 'Melee Combat Bonus'),
      ('Rock Gnome', 'Saving Throw Bonus')
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
-- HALFLING abilities
-- =========================================================
WITH rb AS (
  SELECT id FROM "RaceBase" WHERE "name" = 'Halfling'
)
INSERT INTO "RaceAbility" ("race_base_id", "name", "description", "cost", "kind", "updated_at")
SELECT rb.id, v.name, v.description, v.cost, v.kind::"RaceAbilityKind", CURRENT_TIMESTAMP
FROM rb
CROSS JOIN (
  VALUES
    ('Attack Bonus', '+1 attack bonus with hurled weapons and slings.', 5, 'BENEFIT'),
    ('Stealth', 'Halfling stealth surprise bonus when not in metal armor.', 10, 'BENEFIT'),
    ('Saving Throw Bonuses', 'Halfling saving throw bonuses vs magic and poison.', 10, 'BENEFIT'),
    ('Infravision, 60''', 'Stout halfling package infravision range of 60 feet.', 10, 'BENEFIT'),
    ('Mining Detection Abilities', 'Halfling stonework/mining detection package ability.', 5, 'BENEFIT'),
    ('Secret Doors', 'Detect secret/concealed doors as package trait.', 5, 'BENEFIT'),
    ('Hide', 'Hide in woods package ability.', 10, 'BENEFIT'),

    ('Stout Elf Distrust', '-1 reaction penalty from elves.', -5, 'PENALTY'),
    ('Tallfellow Dwarf Distrust', '-2 reaction penalty vs dwarves.', -5, 'PENALTY')
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
  JOIN "RaceBase" rb ON rb.id = sr."race_base_id" AND rb."name" = 'Halfling'
  JOIN (
    VALUES
      ('Hairfoot Halfling', 'Attack Bonus'),
      ('Hairfoot Halfling', 'Stealth'),
      ('Hairfoot Halfling', 'Saving Throw Bonuses'),

      ('Stout Halfling', 'Attack Bonus'),
      ('Stout Halfling', 'Saving Throw Bonuses'),
      ('Stout Halfling', 'Infravision, 60'''),
      ('Stout Halfling', 'Stealth'),
      ('Stout Halfling', 'Mining Detection Abilities'),
      ('Stout Halfling', 'Stout Elf Distrust'),

      ('Tallfellow Halfling', 'Attack Bonus'),
      ('Tallfellow Halfling', 'Secret Doors'),
      ('Tallfellow Halfling', 'Hide'),
      ('Tallfellow Halfling', 'Stealth'),
      ('Tallfellow Halfling', 'Saving Throw Bonuses'),
      ('Tallfellow Halfling', 'Tallfellow Dwarf Distrust')
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
