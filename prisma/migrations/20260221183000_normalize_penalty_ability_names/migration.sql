-- Normalize penalty RaceAbility names to a single naming convention:
-- every PENALTY ability name ends with "Penalty"
-- Idempotent and link-safe.

-- 1) Ensure canonical rows exist for all non-canonical penalty names
WITH legacy AS (
  SELECT
    id,
    "race_base_id",
    "name" AS legacy_name,
    CASE
      WHEN "name" LIKE '% Penalty' THEN "name"
      ELSE "name" || ' Penalty'
    END AS canonical_name,
    "description",
    "cost",
    "kind"
  FROM "RaceAbility"
  WHERE "kind" = 'PENALTY'::"RaceAbilityKind"
    AND "name" NOT LIKE '% Penalty'
)
INSERT INTO "RaceAbility" ("race_base_id", "name", "description", "cost", "kind", "updated_at")
SELECT
  l."race_base_id",
  l.canonical_name,
  l."description",
  l."cost",
  l."kind",
  CURRENT_TIMESTAMP
FROM legacy l
ON CONFLICT ("race_base_id", "name") DO UPDATE
SET
  "description" = EXCLUDED."description",
  "cost" = EXCLUDED."cost",
  "kind" = EXCLUDED."kind",
  "updated_at" = CURRENT_TIMESTAMP;

-- 2) Move subrace links from legacy rows to canonical rows
WITH legacy AS (
  SELECT
    id,
    "race_base_id",
    "name" AS legacy_name,
    CASE
      WHEN "name" LIKE '% Penalty' THEN "name"
      ELSE "name" || ' Penalty'
    END AS canonical_name
  FROM "RaceAbility"
  WHERE "kind" = 'PENALTY'::"RaceAbilityKind"
    AND "name" NOT LIKE '% Penalty'
), map_names AS (
  SELECT
    l.id AS legacy_id,
    c.id AS canonical_id
  FROM legacy l
  JOIN "RaceAbility" c
    ON c."race_base_id" = l."race_base_id"
   AND c."name" = l.canonical_name
)
INSERT INTO "SubRaceStandardAbility" ("sub_race_id", "race_ability_id", "is_default_package")
SELECT
  sra."sub_race_id",
  m.canonical_id,
  sra."is_default_package"
FROM "SubRaceStandardAbility" sra
JOIN map_names m
  ON m.legacy_id = sra."race_ability_id"
ON CONFLICT ("sub_race_id", "race_ability_id") DO UPDATE
SET "is_default_package" = EXCLUDED."is_default_package";

-- 3) Remove legacy links and legacy rows
WITH legacy AS (
  SELECT id
  FROM "RaceAbility"
  WHERE "kind" = 'PENALTY'::"RaceAbilityKind"
    AND "name" NOT LIKE '% Penalty'
)
DELETE FROM "SubRaceStandardAbility"
WHERE "race_ability_id" IN (SELECT id FROM legacy);

WITH legacy AS (
  SELECT id
  FROM "RaceAbility"
  WHERE "kind" = 'PENALTY'::"RaceAbilityKind"
    AND "name" NOT LIKE '% Penalty'
)
DELETE FROM "RaceAbility"
WHERE id IN (SELECT id FROM legacy);
