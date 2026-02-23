-- Seed Elf (POSP) race base, subraces, abilities, and default packages

-- Race base: Elf
INSERT INTO "RaceBase" (
  "name",
  "description",
  "class_point_budget",
  "strength_adjustment",
  "constitution_adjustment",
  "dexterity_adjustment",
  "wisdom_adjustment",
  "intelligence_adjustment",
  "charisma_adjustment",
  "updated_at"
)
VALUES (
  'Elf',
  'POSP elf race base with customizable racial ability point budget and subrace packages.',
  45,
  0,
  0,
  0,
  0,
  0,
  0,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("name") DO UPDATE
SET
  "description" = EXCLUDED."description",
  "class_point_budget" = EXCLUDED."class_point_budget",
  "strength_adjustment" = EXCLUDED."strength_adjustment",
  "constitution_adjustment" = EXCLUDED."constitution_adjustment",
  "dexterity_adjustment" = EXCLUDED."dexterity_adjustment",
  "wisdom_adjustment" = EXCLUDED."wisdom_adjustment",
  "intelligence_adjustment" = EXCLUDED."intelligence_adjustment",
  "charisma_adjustment" = EXCLUDED."charisma_adjustment",
  "updated_at" = CURRENT_TIMESTAMP;

-- Subraces
WITH elf AS (
  SELECT id FROM "RaceBase" WHERE "name" = 'Elf'
)
INSERT INTO "SubRace" ("race_base_id", "name", "description", "languages", "character_point_cost", "updated_at")
SELECT elf.id, v.name, v.description, v.languages, v.character_point_cost, CURRENT_TIMESTAMP
FROM elf
CROSS JOIN (
  VALUES
    (
      'Aquatic Elf',
      'Sea elf subrace adapted for salt-water life.',
      'Aquatic elf, kuo-toa, sahuagin, dolphin, merman, undersea common',
      40
    ),
    (
      'Dark Elf',
      'Drow subrace from the Underdark.',
      'drow, elf, gray dwarf, illithid, undercommon, kuo-toa, bugbear, orcish',
      45
    ),
    (
      'Gray Elf',
      'Faerie elf subrace focused on intellect and reclusive nobility.',
      'Six languages of choice (DM approval)',
      45
    ),
    (
      'High Elf',
      'Most common and open elven subrace.',
      'high elf, common, elf, gnome, halfling, goblin, hobgoblin, orc, gnoll',
      40
    ),
    (
      'Sylvan Elf',
      'Wood elf subrace strongly tied to forest life.',
      'sylvan dialect, elf, centaur, pixie, dryad, treant, brownie',
      40
    )
) AS v(name, description, languages, character_point_cost)
ON CONFLICT ("race_base_id", "name") DO UPDATE
SET
  "description" = EXCLUDED."description",
  "languages" = EXCLUDED."languages",
  "character_point_cost" = EXCLUDED."character_point_cost",
  "updated_at" = CURRENT_TIMESTAMP;

-- Elf ability catalog (benefits + penalties)
WITH elf AS (
  SELECT id FROM "RaceBase" WHERE "name" = 'Elf'
)
INSERT INTO "RaceAbility" ("race_base_id", "name", "description", "cost", "kind", "updated_at")
SELECT elf.id, v.name, v.description, v.cost, v.kind::"RaceAbilityKind", CURRENT_TIMESTAMP
FROM elf
CROSS JOIN (
  VALUES
    ('Aim Bonus', '+1 to Aim subability score.', 10, 'BENEFIT'),
    ('Balance Bonus', '+1 to Balance subability score.', 10, 'BENEFIT'),
    ('Bow Bonus', '+1 attack with long or short bows.', 5, 'BENEFIT'),
    ('Cold Resistance', '+1 save vs. cold and ice effects.', 5, 'BENEFIT'),
    ('Companion', 'Companionship of a cooshee or elven cat.', 10, 'BENEFIT'),
    ('Confer Water Breathing', 'Once/day, grant water breathing for 1 hour per level.', 10, 'BENEFIT'),
    ('Dagger Bonus', '+1 attack roll with daggers.', 5, 'BENEFIT'),
    ('Heat Resistance', '+1 save vs. heat and fire effects.', 5, 'BENEFIT'),
    ('Infravision, 60''', 'Infravision range of 60 feet.', 10, 'BENEFIT'),
    ('Infravision, 120''', 'Infravision range of 120 feet.', 10, 'BENEFIT'),
    ('Javelin Bonus', '+1 attack roll with javelins.', 5, 'BENEFIT'),
    ('Less Sleep', 'Requires only four hours of sleep to be rested.', 5, 'BENEFIT'),
    ('Magic Identification', '5% per level chance to identify magical item function.', 10, 'BENEFIT'),
    ('Reason Bonus', '+1 to Reason subability score.', 10, 'BENEFIT'),
    ('Resistance', '90% resistance to sleep and charm-related spells.', 10, 'BENEFIT'),
    ('Secret Doors', 'Improved chance to detect concealed and secret doors.', 5, 'BENEFIT'),
    ('Speak with Plants', 'Once/day speak with plants as a priest of same level.', 10, 'BENEFIT'),
    ('Spear Bonus', '+1 attack roll with spears.', 5, 'BENEFIT'),
    ('Spell Abilities', 'Once/day cast faerie fire, dancing lights, darkness and higher-level additions.', 15, 'BENEFIT'),
    ('Stealth', 'Improved surprise when alone and not in metal armor.', 10, 'BENEFIT'),
    ('Sword Bonus', '+1 attack roll with short or long swords.', 5, 'BENEFIT'),
    ('Trident Bonus', '+1 attack roll with tridents.', 5, 'BENEFIT'),

    ('Aquatic Dehydration Vulnerability', 'Out of water, suffers progressive penalties and can die if scores reach zero.', -10, 'PENALTY'),
    ('Aquatic No Bow Bonus Underwater', 'Cannot gain elven bow attack bonus underwater.', -5, 'PENALTY'),
    ('Dark Sunlight Penalty', '-1 to all rolls under bright sunlight or continual light.', -10, 'PENALTY'),
    ('Dark Elf Social Stigma', '-2 initial reaction penalty with other elves.', -5, 'PENALTY'),
    ('Gray Elf Aloof Penalty', '-1 reaction with other elves and -2 with other races.', -5, 'PENALTY'),
    ('High Elf Illusion Credulity', '-2 penalty to disbelieve actual illusions.', -5, 'PENALTY'),
    ('Sylvan Outsider Unease', '-1 reaction penalty when encountered outside home forest.', -5, 'PENALTY')
) AS v(name, description, cost, kind)
ON CONFLICT ("race_base_id", "name") DO UPDATE
SET
  "description" = EXCLUDED."description",
  "cost" = EXCLUDED."cost",
  "kind" = EXCLUDED."kind",
  "updated_at" = CURRENT_TIMESTAMP;

-- Default subrace packages (benefits + penalties)
WITH package_abilities AS (
  SELECT
    sr.id AS subrace_id,
    ra.id AS race_ability_id,
    v.is_default_package
  FROM "SubRace" sr
  JOIN "RaceBase" rb ON rb.id = sr."race_base_id" AND rb."name" = 'Elf'
  JOIN (
    VALUES
      ('Aquatic Elf', 'Confer Water Breathing', true),
      ('Aquatic Elf', 'Stealth', true),
      ('Aquatic Elf', 'Resistance', true),
      ('Aquatic Elf', 'Trident Bonus', true),
      ('Aquatic Elf', 'Secret Doors', true),
      ('Aquatic Elf', 'Aquatic Dehydration Vulnerability', true),
      ('Aquatic Elf', 'Aquatic No Bow Bonus Underwater', true),

      ('Dark Elf', 'Infravision, 120''', true),
      ('Dark Elf', 'Spell Abilities', true),
      ('Dark Elf', 'Resistance', true),
      ('Dark Elf', 'Stealth', true),
      ('Dark Elf', 'Secret Doors', true),
      ('Dark Elf', 'Dark Sunlight Penalty', true),
      ('Dark Elf', 'Dark Elf Social Stigma', true),

      ('Gray Elf', 'Bow Bonus', true),
      ('Gray Elf', 'Secret Doors', true),
      ('Gray Elf', 'Infravision, 60''', true),
      ('Gray Elf', 'Stealth', true),
      ('Gray Elf', 'Resistance', true),
      ('Gray Elf', 'Sword Bonus', true),
      ('Gray Elf', 'Reason Bonus', true),
      ('Gray Elf', 'Gray Elf Aloof Penalty', true),

      ('High Elf', 'Bow Bonus', true),
      ('High Elf', 'Secret Doors', true),
      ('High Elf', 'Infravision, 60''', true),
      ('High Elf', 'Stealth', true),
      ('High Elf', 'Resistance', true),
      ('High Elf', 'Sword Bonus', true),
      ('High Elf', 'High Elf Illusion Credulity', true),

      ('Sylvan Elf', 'Bow Bonus', true),
      ('Sylvan Elf', 'Secret Doors', true),
      ('Sylvan Elf', 'Infravision, 60''', true),
      ('Sylvan Elf', 'Stealth', true),
      ('Sylvan Elf', 'Resistance', true),
      ('Sylvan Elf', 'Spear Bonus', true),
      ('Sylvan Elf', 'Sylvan Outsider Unease', true)
  ) AS v(subrace_name, ability_name, is_default_package)
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
