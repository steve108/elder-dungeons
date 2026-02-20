WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(TRIM(name)), spell_class
      ORDER BY "updatedAt" DESC, id DESC
    ) AS rn
  FROM "Spell"
)
DELETE FROM "Spell" s
USING ranked r
WHERE s.id = r.id
  AND r.rn > 1;
