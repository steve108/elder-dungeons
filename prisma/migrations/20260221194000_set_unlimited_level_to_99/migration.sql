-- Encode POSP unlimited class advancement (U) as 99 in RaceBase max level fields.
-- Keep NULL for classes not available to the race.

UPDATE "RaceBase"
SET
  "max_level_bard" = 99,
  "max_level_fighter" = 99,
  "max_level_paladin" = 99,
  "max_level_ranger" = 99,
  "max_level_thief" = 99,
  "max_level_wizard" = 99,
  "max_level_illusionist" = 99,
  "max_level_cleric" = 99,
  "max_level_druid" = 99,
  "updated_at" = CURRENT_TIMESTAMP
WHERE "name" = 'Human';

UPDATE "RaceBase"
SET
  "max_level_bard" = 99,
  "updated_at" = CURRENT_TIMESTAMP
WHERE "name" = 'Half-Elf';
