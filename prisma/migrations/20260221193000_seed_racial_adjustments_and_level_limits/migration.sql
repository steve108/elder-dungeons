-- Seed racial ability adjustments and numeric racial level limits (POSP)
-- Source: https://adnd2e.fandom.com/wiki/Racial_Requirements_(POSP)

WITH data(
  name,
  strength_adjustment,
  constitution_adjustment,
  dexterity_adjustment,
  wisdom_adjustment,
  intelligence_adjustment,
  charisma_adjustment,
  max_level_fighter,
  max_level_paladin,
  max_level_ranger,
  max_level_thief,
  max_level_bard,
  max_level_wizard,
  max_level_illusionist,
  max_level_cleric,
  max_level_druid
) AS (
  VALUES
    ('Dwarf',      0,  1,  0,  0,  0, -1, 15, NULL::int, NULL::int, 12, NULL::int, NULL::int, NULL::int, 10, NULL::int),
    ('Elf',        0, -1,  1,  0,  0,  0, 12, NULL::int, 15, 12, NULL::int, 15, NULL::int, 12, NULL::int),
    ('Gnome',      0,  0,  0, -1,  1,  0, 11, NULL::int, NULL::int, 13, NULL::int, NULL::int, 15,  9, NULL::int),
    ('Half-Elf',   0,  0,  0,  0,  0,  0, 14, NULL::int, 16, 12, NULL::int, 12, NULL::int, 14,  9),
    ('Half-Orc',   1,  1,  0,  0,  0, -2, 10, NULL::int, NULL::int,  8, NULL::int, NULL::int, NULL::int,  4, NULL::int),
    ('Half-Ogre',  1,  1,  0,  0, -1, -1, 12, NULL::int, NULL::int, NULL::int, NULL::int, NULL::int, NULL::int,  4, NULL::int),
    ('Halfling',  -1,  0,  1,  0,  0,  0,  9, NULL::int, NULL::int, 15, NULL::int, NULL::int, NULL::int,  8, NULL::int),
    ('Human',      0,  0,  0,  0,  0,  0, NULL::int, NULL::int, NULL::int, NULL::int, NULL::int, NULL::int, NULL::int, NULL::int, NULL::int)
)
UPDATE "RaceBase" rb
SET
  "strength_adjustment" = d.strength_adjustment,
  "constitution_adjustment" = d.constitution_adjustment,
  "dexterity_adjustment" = d.dexterity_adjustment,
  "wisdom_adjustment" = d.wisdom_adjustment,
  "intelligence_adjustment" = d.intelligence_adjustment,
  "charisma_adjustment" = d.charisma_adjustment,
  "max_level_fighter" = d.max_level_fighter,
  "max_level_paladin" = d.max_level_paladin,
  "max_level_ranger" = d.max_level_ranger,
  "max_level_thief" = d.max_level_thief,
  "max_level_bard" = d.max_level_bard,
  "max_level_wizard" = d.max_level_wizard,
  "max_level_illusionist" = d.max_level_illusionist,
  "max_level_cleric" = d.max_level_cleric,
  "max_level_druid" = d.max_level_druid,
  "updated_at" = CURRENT_TIMESTAMP
FROM data d
WHERE rb."name" = d.name;
