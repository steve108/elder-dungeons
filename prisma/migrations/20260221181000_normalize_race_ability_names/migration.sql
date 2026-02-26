-- Normalize race ability naming across races (idempotent and link-safe)

-- Target normalization for Gnome:
--   Saving Throw Bonus   -> Saving Throw Bonuses
--   Melee Combat Bonus   -> Melee Combat Bonuses

-- 1) Ensure canonical rows exist (upsert style)
WITH rb AS (
  SELECT id FROM "RaceBase" WHERE "name" = 'Gnome'
)
INSERT INTO "RaceAbility" ("race_base_id", "name", "description", "cost", "kind", "updated_at")
SELECT rb.id, v.name, v.description, v.cost, v.kind::"RaceAbilityKind", CURRENT_TIMESTAMP
FROM rb
CROSS JOIN (
  VALUES
    ('Saving Throw Bonuses', 'Gnomish magical saving throw bonus by Health score.', 5, 'BENEFIT'),
    ('Melee Combat Bonuses', 'Gnomish melee combat racial package benefit.', 10, 'BENEFIT')
) AS v(name, description, cost, kind)
ON CONFLICT ("race_base_id", "name") DO UPDATE
SET
  "description" = EXCLUDED."description",
  "cost" = EXCLUDED."cost",
  "kind" = EXCLUDED."kind",
  "updated_at" = CURRENT_TIMESTAMP;

-- 2) Move links from legacy names to canonical names (if legacy exists)
WITH rb AS (
  SELECT id FROM "RaceBase" WHERE "name" = 'Gnome'
), legacy AS (
  SELECT id, name
  FROM "RaceAbility"
  WHERE "race_base_id" = (SELECT id FROM rb)
    AND "name" IN ('Saving Throw Bonus', 'Melee Combat Bonus')
), canonical AS (
  SELECT id, name
  FROM "RaceAbility"
  WHERE "race_base_id" = (SELECT id FROM rb)
    AND "name" IN ('Saving Throw Bonuses', 'Melee Combat Bonuses')
), map_names AS (
  SELECT
    l.id AS legacy_id,
    c.id AS canonical_id
  FROM legacy l
  JOIN canonical c
    ON (
      (l.name = 'Saving Throw Bonus' AND c.name = 'Saving Throw Bonuses') OR
      (l.name = 'Melee Combat Bonus' AND c.name = 'Melee Combat Bonuses')
    )
)
INSERT INTO "SubRaceStandardAbility" ("sub_race_id", "race_ability_id", "is_default_package")
SELECT sra."sub_race_id", m.canonical_id, sra."is_default_package"
FROM "SubRaceStandardAbility" sra
JOIN map_names m ON m.legacy_id = sra."race_ability_id"
ON CONFLICT ("sub_race_id", "race_ability_id") DO UPDATE
SET "is_default_package" = EXCLUDED."is_default_package";

-- 3) Remove legacy links and rows
WITH rb AS (
  SELECT id FROM "RaceBase" WHERE "name" = 'Gnome'
), legacy AS (
  SELECT id
  FROM "RaceAbility"
  WHERE "race_base_id" = (SELECT id FROM rb)
    AND "name" IN ('Saving Throw Bonus', 'Melee Combat Bonus')
)
DELETE FROM "SubRaceStandardAbility"
WHERE "race_ability_id" IN (SELECT id FROM legacy);

WITH rb AS (
  SELECT id FROM "RaceBase" WHERE "name" = 'Gnome'
)
DELETE FROM "RaceAbility"
WHERE "race_base_id" = (SELECT id FROM rb)
  AND "name" IN ('Saving Throw Bonus', 'Melee Combat Bonus');
