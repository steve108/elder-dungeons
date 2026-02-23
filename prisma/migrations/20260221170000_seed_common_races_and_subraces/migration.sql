-- Seed common races and standard subraces (POSP-aligned, idempotent)

-- Race bases
INSERT INTO "RaceBase" (
  "name",
  "description",
  "class_point_budget",
  "updated_at"
)
VALUES
  ('Dwarf', 'Dwarf race base from POSP.', 45, CURRENT_TIMESTAMP),
  ('Elf', 'Elf race base from POSP.', 45, CURRENT_TIMESTAMP),
  ('Gnome', 'Gnome race base from POSP.', 45, CURRENT_TIMESTAMP),
  ('Halfling', 'Halfling race base from POSP.', 35, CURRENT_TIMESTAMP),
  ('Half-Elf', 'Half-elf race base from POSP.', 25, CURRENT_TIMESTAMP),
  ('Half-Orc', 'Half-orc race base from POSP.', 15, CURRENT_TIMESTAMP),
  ('Half-Ogre', 'Half-ogre race base from POSP.', 15, CURRENT_TIMESTAMP),
  ('Human', 'Human race base from POSP.', 10, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO UPDATE
SET
  "description" = EXCLUDED."description",
  "class_point_budget" = EXCLUDED."class_point_budget",
  "updated_at" = CURRENT_TIMESTAMP;

-- Dwarf subraces
WITH rb AS (SELECT id FROM "RaceBase" WHERE "name" = 'Dwarf')
INSERT INTO "SubRace" ("race_base_id", "name", "description", "languages", "character_point_cost", "updated_at")
SELECT rb.id, v.name, v.description, v.languages, v.character_point_cost, CURRENT_TIMESTAMP
FROM rb
CROSS JOIN (
  VALUES
    ('Deep Dwarf', 'Deep dwarf (underdark-oriented).', 'deep dwarf, gray dwarf, illithid, troglodyte, deep gnome, undercommon', 45),
    ('Gray Dwarf', 'Gray dwarf (duergar).', 'duergar, deep dwarf, dark elf, illithid, kuo-toa, troglodyte, undercommon', 45),
    ('Hill Dwarf', 'Hill dwarf, most common dwarf variant.', 'hill dwarf dialects, gnome, goblin, orc, gnoll', 40),
    ('Mountain Dwarf', 'Mountain dwarf, stronghold-dwelling variant.', 'mountain dwarf, hill dwarf, gnome, hill giant, gnoll, bugbear, common', 40)
) AS v(name, description, languages, character_point_cost)
ON CONFLICT ("race_base_id", "name") DO UPDATE
SET
  "description" = EXCLUDED."description",
  "languages" = EXCLUDED."languages",
  "character_point_cost" = EXCLUDED."character_point_cost",
  "updated_at" = CURRENT_TIMESTAMP;

-- Elf subraces (upsert to keep consistent naming/cost)
WITH rb AS (SELECT id FROM "RaceBase" WHERE "name" = 'Elf')
INSERT INTO "SubRace" ("race_base_id", "name", "description", "languages", "character_point_cost", "updated_at")
SELECT rb.id, v.name, v.description, v.languages, v.character_point_cost, CURRENT_TIMESTAMP
FROM rb
CROSS JOIN (
  VALUES
    ('Aquatic Elf', 'Sea elf subrace adapted for salt-water life.', 'aquatic elf, kuo-toa, sahuagin, dolphin, merman, undersea common', 40),
    ('Dark Elf', 'Drow subrace from the Underdark.', 'drow, elf, gray dwarf, illithid, undercommon, kuo-toa, bugbear, orcish', 45),
    ('Gray Elf', 'Faerie elf subrace focused on intellect and reclusive nobility.', 'six languages of choice (DM approval)', 45),
    ('High Elf', 'Most common and open elven subrace.', 'high elf, common, elf, gnome, halfling, goblin, hobgoblin, orc, gnoll', 40),
    ('Sylvan Elf', 'Wood elf subrace strongly tied to forest life.', 'sylvan dialect, elf, centaur, pixie, dryad, treant, brownie', 40)
) AS v(name, description, languages, character_point_cost)
ON CONFLICT ("race_base_id", "name") DO UPDATE
SET
  "description" = EXCLUDED."description",
  "languages" = EXCLUDED."languages",
  "character_point_cost" = EXCLUDED."character_point_cost",
  "updated_at" = CURRENT_TIMESTAMP;

-- Gnome subraces
WITH rb AS (SELECT id FROM "RaceBase" WHERE "name" = 'Gnome')
INSERT INTO "SubRace" ("race_base_id", "name", "description", "languages", "character_point_cost", "updated_at")
SELECT rb.id, v.name, v.description, v.languages, v.character_point_cost, CURRENT_TIMESTAMP
FROM rb
CROSS JOIN (
  VALUES
    ('Deep Gnome', 'Svirfneblin subrace.', 'svirfneblin, gnome, common, undercommon, dark elf, kuo-toa, earth elemental language', 45),
    ('Forest Gnome', 'Forest-dwelling gnome variant.', 'forest gnome, gnome, treant, dryad, brownie, satyr, pixie', 45),
    ('Rock Gnome', 'Most common gnome variant.', 'common, dwarf, gnome, halfling, goblin, kobold, burrowing mammal languages', 40)
) AS v(name, description, languages, character_point_cost)
ON CONFLICT ("race_base_id", "name") DO UPDATE
SET
  "description" = EXCLUDED."description",
  "languages" = EXCLUDED."languages",
  "character_point_cost" = EXCLUDED."character_point_cost",
  "updated_at" = CURRENT_TIMESTAMP;

-- Halfling subraces
WITH rb AS (SELECT id FROM "RaceBase" WHERE "name" = 'Halfling')
INSERT INTO "SubRace" ("race_base_id", "name", "description", "languages", "character_point_cost", "updated_at")
SELECT rb.id, v.name, v.description, v.languages, v.character_point_cost, CURRENT_TIMESTAMP
FROM rb
CROSS JOIN (
  VALUES
    ('Hairfoot Halfling', 'Most common halfling variant.', 'any four halfling/human/elf dialects', 30),
    ('Stout Halfling', 'Stockier halfling variant often near dwarves.', 'any six halfling/human/dwarven dialects', 35),
    ('Tallfellow Halfling', 'Tall woodland halfling variant.', 'common, halfling, elf, gnome, centaur, dryad', 35)
) AS v(name, description, languages, character_point_cost)
ON CONFLICT ("race_base_id", "name") DO UPDATE
SET
  "description" = EXCLUDED."description",
  "languages" = EXCLUDED."languages",
  "character_point_cost" = EXCLUDED."character_point_cost",
  "updated_at" = CURRENT_TIMESTAMP;

-- Half-Elf standard (single-subrace package)
WITH rb AS (SELECT id FROM "RaceBase" WHERE "name" = 'Half-Elf')
INSERT INTO "SubRace" ("race_base_id", "name", "description", "languages", "character_point_cost", "updated_at")
SELECT rb.id, 'Standard Half-Elf', 'Single half-elf subrace package from POSP.', 'common, elf, gnome, halfling, goblin, hobgoblin, orc, gnoll', 20, CURRENT_TIMESTAMP
FROM rb
ON CONFLICT ("race_base_id", "name") DO UPDATE
SET
  "description" = EXCLUDED."description",
  "languages" = EXCLUDED."languages",
  "character_point_cost" = EXCLUDED."character_point_cost",
  "updated_at" = CURRENT_TIMESTAMP;

-- Half-Orc standard (single-subrace package)
WITH rb AS (SELECT id FROM "RaceBase" WHERE "name" = 'Half-Orc')
INSERT INTO "SubRace" ("race_base_id", "name", "description", "languages", "character_point_cost", "updated_at")
SELECT rb.id, 'Standard Half-Orc', 'Single half-orc subrace package from POSP.', 'common, orc, dwarf, goblin, hobgoblin, ogre', 10, CURRENT_TIMESTAMP
FROM rb
ON CONFLICT ("race_base_id", "name") DO UPDATE
SET
  "description" = EXCLUDED."description",
  "languages" = EXCLUDED."languages",
  "character_point_cost" = EXCLUDED."character_point_cost",
  "updated_at" = CURRENT_TIMESTAMP;

-- Half-Ogre standard (single-subrace package)
WITH rb AS (SELECT id FROM "RaceBase" WHERE "name" = 'Half-Ogre')
INSERT INTO "SubRace" ("race_base_id", "name", "description", "languages", "character_point_cost", "updated_at")
SELECT rb.id, 'Standard Half-Ogre', 'Single half-ogre subrace package from POSP.', 'common, ogre, orc, troll, stone giant, gnoll', 10, CURRENT_TIMESTAMP
FROM rb
ON CONFLICT ("race_base_id", "name") DO UPDATE
SET
  "description" = EXCLUDED."description",
  "languages" = EXCLUDED."languages",
  "character_point_cost" = EXCLUDED."character_point_cost",
  "updated_at" = CURRENT_TIMESTAMP;

-- Human standard (no POSP subraces; represented as standard package row)
WITH rb AS (SELECT id FROM "RaceBase" WHERE "name" = 'Human')
INSERT INTO "SubRace" ("race_base_id", "name", "description", "languages", "character_point_cost", "updated_at")
SELECT rb.id, 'Standard Human', 'Humans have no standard POSP subraces; this row represents base package.', 'common (setting dependent)', 0, CURRENT_TIMESTAMP
FROM rb
ON CONFLICT ("race_base_id", "name") DO UPDATE
SET
  "description" = EXCLUDED."description",
  "languages" = EXCLUDED."languages",
  "character_point_cost" = EXCLUDED."character_point_cost",
  "updated_at" = CURRENT_TIMESTAMP;
