-- Split variable-cost class abilities into discrete rows per variant.
-- This removes point_cost_min/point_cost_max usage for previously variable rows.

-- 1) Insert discrete variants (idempotent upsert by unique name)
INSERT INTO "RuleClassAbility" (
  "name", "description", "full_description", "kind", "point_cost", "point_cost_min", "point_cost_max", "cost_notes", "is_shared_penalty", "shared_penalty_key", "source_class_hint", "updated_at"
)
VALUES
  -- Fighter followers
  ('Fighter Followers (5 CP)', 'Gain followers via stronghold at level 9+.', 'By purchasing this 5 CP ability, the fighter gains followers if he establishes a stronghold and is at least 9th level. Source: Fighter (POSP).', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Fighter', CURRENT_TIMESTAMP),
  ('Fighter Followers (10 CP)', 'Gain followers via stronghold regardless of level.', 'By purchasing this 10 CP ability, the fighter gains followers whenever he establishes a stronghold, regardless of level. Source: Fighter (POSP).', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Fighter', CURRENT_TIMESTAMP),

  -- Fighter limited armor
  ('Fighter Restriction: Limited Armor (5 CP)', 'Restricted to chain mail or lighter.', 'Restriction grants +5 CP: fighter limited to chain mail or lighter armor (shield still allowed). Source: Fighter (POSP).', 'PENALTY', 5, NULL, NULL, NULL, true, 'WARRIOR_SHARED_LIMITED_ARMOR', 'Fighter', CURRENT_TIMESTAMP),
  ('Fighter Restriction: Limited Armor (10 CP)', 'Restricted to studded leather or lighter.', 'Restriction grants +10 CP: fighter limited to studded leather or lighter armor (shield still allowed). Source: Fighter (POSP).', 'PENALTY', 10, NULL, NULL, NULL, true, 'WARRIOR_SHARED_LIMITED_ARMOR', 'Fighter', CURRENT_TIMESTAMP),
  ('Fighter Restriction: Limited Armor (15 CP)', 'Cannot wear armor.', 'Restriction grants +15 CP: fighter cannot wear armor (shield still allowed). Source: Fighter (POSP).', 'PENALTY', 15, NULL, NULL, NULL, true, 'WARRIOR_SHARED_LIMITED_ARMOR', 'Fighter', CURRENT_TIMESTAMP),

  -- Fighter limited magical items
  ('Fighter Restriction: Limited Magical Item Use (5 CP)', 'One magical item category barred.', 'Restriction grants +5 CP for barring one magical-item category. Source: Fighter (POSP).', 'PENALTY', 5, NULL, NULL, NULL, true, 'WARRIOR_SHARED_LIMITED_MAGIC_ITEMS', 'Fighter', CURRENT_TIMESTAMP),
  ('Fighter Restriction: Limited Magical Item Use (10 CP)', 'Two magical item categories barred.', 'Restriction grants +10 CP for barring two magical-item categories. Source: Fighter (POSP).', 'PENALTY', 10, NULL, NULL, NULL, true, 'WARRIOR_SHARED_LIMITED_MAGIC_ITEMS', 'Fighter', CURRENT_TIMESTAMP),
  ('Fighter Restriction: Limited Magical Item Use (15 CP)', 'Three magical item categories barred.', 'Restriction grants +15 CP for barring three magical-item categories. Source: Fighter (POSP).', 'PENALTY', 15, NULL, NULL, NULL, true, 'WARRIOR_SHARED_LIMITED_MAGIC_ITEMS', 'Fighter', CURRENT_TIMESTAMP),
  ('Fighter Restriction: Limited Magical Item Use (20 CP)', 'Four magical item categories barred.', 'Restriction grants +20 CP for barring four magical-item categories. Source: Fighter (POSP).', 'PENALTY', 20, NULL, NULL, NULL, true, 'WARRIOR_SHARED_LIMITED_MAGIC_ITEMS', 'Fighter', CURRENT_TIMESTAMP),

  -- Thief
  ('Thief Followers (5 CP)', 'Gain followers via stronghold at level 10+.', 'By purchasing this 5 CP ability, thief gains followers when establishing stronghold at level 10+. Source: Thief (POSP).', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Thief', CURRENT_TIMESTAMP),
  ('Thief Followers (10 CP)', 'Gain followers via stronghold regardless of level.', 'By purchasing this 10 CP ability, thief gains followers whenever stronghold is established. Source: Thief (POSP).', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Thief', CURRENT_TIMESTAMP),
  ('Thief Scroll Use (5 CP)', 'Read scrolls from level 10 onward.', 'With 5 CP, thief uses scrolls at 10th level using POSP chance table. Source: Thief (POSP).', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Thief', CURRENT_TIMESTAMP),
  ('Thief Scroll Use (10 CP)', 'Read scrolls at any level by chance table.', 'With 10 CP, thief attempts scroll use at any level using POSP chance table. Source: Thief (POSP).', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Thief', CURRENT_TIMESTAMP),

  -- Bard
  ('Bard Scroll Use (5 CP)', 'Read scrolls from level 10 onward.', 'With 5 CP, bard uses scrolls at 10th level using POSP chance table. Source: Bard (POSP).', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Bard', CURRENT_TIMESTAMP),
  ('Bard Scroll Use (10 CP)', 'Read scrolls at any level by chance table.', 'With 10 CP, bard attempts scroll use at any level using POSP chance table. Source: Bard (POSP).', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Bard', CURRENT_TIMESTAMP),

  -- Cleric
  ('Cleric Followers (5 CP)', 'Gain followers via stronghold at level 8+.', 'By purchasing this 5 CP ability, cleric gains followers when establishing stronghold at level 8+. Source: Cleric (POSP).', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Cleric', CURRENT_TIMESTAMP),
  ('Cleric Followers (10 CP)', 'Gain followers via stronghold regardless of level.', 'By purchasing this 10 CP ability, cleric gains followers whenever stronghold is established. Source: Cleric (POSP).', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Cleric', CURRENT_TIMESTAMP),

  -- Druid
  ('Druid Immunity to Charm (5 CP)', 'Charm immunity by normal timing.', '5 CP variant follows normal druid timing for woodland charm immunity. Source: Druid (POSP).', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Druid', CURRENT_TIMESTAMP),
  ('Druid Immunity to Charm (10 CP)', 'Immediate charm immunity.', '10 CP variant grants immediate woodland charm immunity. Source: Druid (POSP).', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Druid', CURRENT_TIMESTAMP),
  ('Druid Shapechange (10 CP)', 'Shapechange by normal timing.', '10 CP variant follows normal timing for druid shapechange progression. Source: Druid (POSP).', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Druid', CURRENT_TIMESTAMP),
  ('Druid Shapechange (15 CP)', 'Earlier shapechange progression.', '15 CP variant grants earlier staged shapechange (bird/reptile/mammal progression). Source: Druid (POSP).', 'BENEFIT', 15, NULL, NULL, NULL, false, NULL, 'Druid', CURRENT_TIMESTAMP),

  -- Mage limited magical items
  ('Mage Restriction: Limited Magical Item Use (5 CP)', 'One magical item category barred.', 'Restriction grants +5 CP for barring one magical-item category. Source: Mage (POSP).', 'PENALTY', 5, NULL, NULL, NULL, true, 'WIZARD_SHARED_LIMITED_MAGIC_ITEMS', 'Mage', CURRENT_TIMESTAMP),
  ('Mage Restriction: Limited Magical Item Use (10 CP)', 'Two magical item categories barred.', 'Restriction grants +10 CP for barring two magical-item categories. Source: Mage (POSP).', 'PENALTY', 10, NULL, NULL, NULL, true, 'WIZARD_SHARED_LIMITED_MAGIC_ITEMS', 'Mage', CURRENT_TIMESTAMP),
  ('Mage Restriction: Limited Magical Item Use (15 CP)', 'Three magical item categories barred.', 'Restriction grants +15 CP for barring three magical-item categories. Source: Mage (POSP).', 'PENALTY', 15, NULL, NULL, NULL, true, 'WIZARD_SHARED_LIMITED_MAGIC_ITEMS', 'Mage', CURRENT_TIMESTAMP),

  -- Mage access to schools (1..8)
  ('Mage Access to Schools (1 School)', 'Access to one wizard school.', 'Purchase access to 1 wizard school (5 CP total). Source: Mage (POSP).', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Mage', CURRENT_TIMESTAMP),
  ('Mage Access to Schools (2 Schools)', 'Access to two wizard schools.', 'Purchase access to 2 wizard schools (10 CP total). Source: Mage (POSP).', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Mage', CURRENT_TIMESTAMP),
  ('Mage Access to Schools (3 Schools)', 'Access to three wizard schools.', 'Purchase access to 3 wizard schools (15 CP total). Source: Mage (POSP).', 'BENEFIT', 15, NULL, NULL, NULL, false, NULL, 'Mage', CURRENT_TIMESTAMP),
  ('Mage Access to Schools (4 Schools)', 'Access to four wizard schools.', 'Purchase access to 4 wizard schools (20 CP total). Source: Mage (POSP).', 'BENEFIT', 20, NULL, NULL, NULL, false, NULL, 'Mage', CURRENT_TIMESTAMP),
  ('Mage Access to Schools (5 Schools)', 'Access to five wizard schools.', 'Purchase access to 5 wizard schools (25 CP total). Source: Mage (POSP).', 'BENEFIT', 25, NULL, NULL, NULL, false, NULL, 'Mage', CURRENT_TIMESTAMP),
  ('Mage Access to Schools (6 Schools)', 'Access to six wizard schools.', 'Purchase access to 6 wizard schools (30 CP total). Source: Mage (POSP).', 'BENEFIT', 30, NULL, NULL, NULL, false, NULL, 'Mage', CURRENT_TIMESTAMP),
  ('Mage Access to Schools (7 Schools)', 'Access to seven wizard schools.', 'Purchase access to 7 wizard schools (35 CP total). Source: Mage (POSP).', 'BENEFIT', 35, NULL, NULL, NULL, false, NULL, 'Mage', CURRENT_TIMESTAMP),
  ('Mage Access to Schools (8 Schools)', 'Access to eight wizard schools.', 'Purchase access to 8 wizard schools (40 CP total, standard mage profile). Source: Mage (POSP).', 'BENEFIT', 40, NULL, NULL, NULL, false, NULL, 'Mage', CURRENT_TIMESTAMP),

  -- Cleric access to spheres as discrete tiers
  ('Cleric Access to Spheres (Minor 3 CP)', 'Minor sphere access, low tier.', 'Minor sphere access option at 3 CP for qualifying low-cost spheres. Source: Cleric (POSP).', 'BENEFIT', 3, NULL, NULL, NULL, false, NULL, 'Cleric', CURRENT_TIMESTAMP),
  ('Cleric Access to Spheres (Minor 5 CP)', 'Minor sphere access, standard tier.', 'Minor sphere access option at 5 CP for standard spheres. Source: Cleric (POSP).', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Cleric', CURRENT_TIMESTAMP),
  ('Cleric Access to Spheres (Minor 10 CP)', 'Minor sphere access, high tier.', 'Minor sphere access option at 10 CP for high-cost spheres. Source: Cleric (POSP).', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Cleric', CURRENT_TIMESTAMP),
  ('Cleric Access to Spheres (Major 5 CP)', 'Major sphere access, low tier.', 'Major sphere access option at 5 CP for qualifying low-cost spheres. Source: Cleric (POSP).', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Cleric', CURRENT_TIMESTAMP),
  ('Cleric Access to Spheres (Major 10 CP)', 'Major sphere access, standard tier.', 'Major sphere access option at 10 CP for standard spheres. Source: Cleric (POSP).', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Cleric', CURRENT_TIMESTAMP),
  ('Cleric Access to Spheres (Major 15 CP)', 'Major sphere access, high tier.', 'Major sphere access option at 15 CP for high-cost spheres. Source: Cleric (POSP).', 'BENEFIT', 15, NULL, NULL, NULL, false, NULL, 'Cleric', CURRENT_TIMESTAMP),

  -- Druid sphere access as discrete options
  ('Druid Access to Spheres (Standard Package 60 CP)', 'Standard druid sphere package.', 'Standard druid sphere package costs 60 CP. Source: Druid (POSP).', 'BENEFIT', 60, NULL, NULL, NULL, false, NULL, 'Druid', CURRENT_TIMESTAMP),
  ('Druid Access to Spheres (Individual Minor 3 CP)', 'Individual minor sphere access, low tier.', 'Individual minor sphere access option at 3 CP under cleric-style costs. Source: Druid (POSP).', 'BENEFIT', 3, NULL, NULL, NULL, false, NULL, 'Druid', CURRENT_TIMESTAMP),
  ('Druid Access to Spheres (Individual Minor 5 CP)', 'Individual minor sphere access, standard tier.', 'Individual minor sphere access option at 5 CP under cleric-style costs. Source: Druid (POSP).', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Druid', CURRENT_TIMESTAMP),
  ('Druid Access to Spheres (Individual Minor 10 CP)', 'Individual minor sphere access, high tier.', 'Individual minor sphere access option at 10 CP under cleric-style costs. Source: Druid (POSP).', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Druid', CURRENT_TIMESTAMP),
  ('Druid Access to Spheres (Individual Major 5 CP)', 'Individual major sphere access, low tier.', 'Individual major sphere access option at 5 CP under cleric-style costs. Source: Druid (POSP).', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Druid', CURRENT_TIMESTAMP),
  ('Druid Access to Spheres (Individual Major 10 CP)', 'Individual major sphere access, standard tier.', 'Individual major sphere access option at 10 CP under cleric-style costs. Source: Druid (POSP).', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Druid', CURRENT_TIMESTAMP),
  ('Druid Access to Spheres (Individual Major 15 CP)', 'Individual major sphere access, high tier.', 'Individual major sphere access option at 15 CP under cleric-style costs. Source: Druid (POSP).', 'BENEFIT', 15, NULL, NULL, NULL, false, NULL, 'Druid', CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO UPDATE
SET
  "description" = EXCLUDED."description",
  "full_description" = EXCLUDED."full_description",
  "kind" = EXCLUDED."kind",
  "point_cost" = EXCLUDED."point_cost",
  "point_cost_min" = EXCLUDED."point_cost_min",
  "point_cost_max" = EXCLUDED."point_cost_max",
  "cost_notes" = EXCLUDED."cost_notes",
  "is_shared_penalty" = EXCLUDED."is_shared_penalty",
  "shared_penalty_key" = EXCLUDED."shared_penalty_key",
  "source_class_hint" = EXCLUDED."source_class_hint",
  "updated_at" = CURRENT_TIMESTAMP;

-- 2) Map old variable rows to new discrete variants for link migration
WITH mappings(old_name, new_name) AS (
  VALUES
    ('Fighter Followers', 'Fighter Followers (5 CP)'),
    ('Fighter Followers', 'Fighter Followers (10 CP)'),

    ('Fighter Restriction: Limited Armor', 'Fighter Restriction: Limited Armor (5 CP)'),
    ('Fighter Restriction: Limited Armor', 'Fighter Restriction: Limited Armor (10 CP)'),
    ('Fighter Restriction: Limited Armor', 'Fighter Restriction: Limited Armor (15 CP)'),

    ('Fighter Restriction: Limited Magical Item Use', 'Fighter Restriction: Limited Magical Item Use (5 CP)'),
    ('Fighter Restriction: Limited Magical Item Use', 'Fighter Restriction: Limited Magical Item Use (10 CP)'),
    ('Fighter Restriction: Limited Magical Item Use', 'Fighter Restriction: Limited Magical Item Use (15 CP)'),
    ('Fighter Restriction: Limited Magical Item Use', 'Fighter Restriction: Limited Magical Item Use (20 CP)'),

    ('Thief Followers', 'Thief Followers (5 CP)'),
    ('Thief Followers', 'Thief Followers (10 CP)'),

    ('Thief Scroll Use', 'Thief Scroll Use (5 CP)'),
    ('Thief Scroll Use', 'Thief Scroll Use (10 CP)'),

    ('Bard Scroll Use', 'Bard Scroll Use (5 CP)'),
    ('Bard Scroll Use', 'Bard Scroll Use (10 CP)'),

    ('Cleric Followers', 'Cleric Followers (5 CP)'),
    ('Cleric Followers', 'Cleric Followers (10 CP)'),

    ('Druid Immunity to Charm', 'Druid Immunity to Charm (5 CP)'),
    ('Druid Immunity to Charm', 'Druid Immunity to Charm (10 CP)'),

    ('Druid Shapechange', 'Druid Shapechange (10 CP)'),
    ('Druid Shapechange', 'Druid Shapechange (15 CP)'),

    ('Mage Restriction: Limited Magical Item Use', 'Mage Restriction: Limited Magical Item Use (5 CP)'),
    ('Mage Restriction: Limited Magical Item Use', 'Mage Restriction: Limited Magical Item Use (10 CP)'),
    ('Mage Restriction: Limited Magical Item Use', 'Mage Restriction: Limited Magical Item Use (15 CP)'),

    ('Mage Access to Schools', 'Mage Access to Schools (1 School)'),
    ('Mage Access to Schools', 'Mage Access to Schools (2 Schools)'),
    ('Mage Access to Schools', 'Mage Access to Schools (3 Schools)'),
    ('Mage Access to Schools', 'Mage Access to Schools (4 Schools)'),
    ('Mage Access to Schools', 'Mage Access to Schools (5 Schools)'),
    ('Mage Access to Schools', 'Mage Access to Schools (6 Schools)'),
    ('Mage Access to Schools', 'Mage Access to Schools (7 Schools)'),
    ('Mage Access to Schools', 'Mage Access to Schools (8 Schools)'),

    ('Cleric Access to Spheres', 'Cleric Access to Spheres (Minor 3 CP)'),
    ('Cleric Access to Spheres', 'Cleric Access to Spheres (Minor 5 CP)'),
    ('Cleric Access to Spheres', 'Cleric Access to Spheres (Minor 10 CP)'),
    ('Cleric Access to Spheres', 'Cleric Access to Spheres (Major 5 CP)'),
    ('Cleric Access to Spheres', 'Cleric Access to Spheres (Major 10 CP)'),
    ('Cleric Access to Spheres', 'Cleric Access to Spheres (Major 15 CP)'),

    ('Druid Access to Spheres', 'Druid Access to Spheres (Standard Package 60 CP)'),
    ('Druid Access to Spheres', 'Druid Access to Spheres (Individual Minor 3 CP)'),
    ('Druid Access to Spheres', 'Druid Access to Spheres (Individual Minor 5 CP)'),
    ('Druid Access to Spheres', 'Druid Access to Spheres (Individual Minor 10 CP)'),
    ('Druid Access to Spheres', 'Druid Access to Spheres (Individual Major 5 CP)'),
    ('Druid Access to Spheres', 'Druid Access to Spheres (Individual Major 10 CP)'),
    ('Druid Access to Spheres', 'Druid Access to Spheres (Individual Major 15 CP)')
)
INSERT INTO "RuleClassAbilityLink" (
  "class_id", "class_ability_id", "is_default_package", "is_optional_restriction", "display_order", "notes"
)
SELECT
  l."class_id",
  na.id AS class_ability_id,
  l."is_default_package",
  l."is_optional_restriction",
  l."display_order",
  l."notes"
FROM "RuleClassAbilityLink" l
JOIN "RuleClassAbility" oa ON oa.id = l."class_ability_id"
JOIN mappings m ON m.old_name = oa."name"
JOIN "RuleClassAbility" na ON na."name" = m.new_name
ON CONFLICT ("class_id", "class_ability_id") DO UPDATE
SET
  "is_default_package" = EXCLUDED."is_default_package",
  "is_optional_restriction" = EXCLUDED."is_optional_restriction",
  "display_order" = EXCLUDED."display_order",
  "notes" = EXCLUDED."notes";

-- 3) Fine-tune defaults for explicit baseline choices
UPDATE "RuleClassAbilityLink" l
SET "is_default_package" = false
FROM "RuleClass" rc, "RuleClassAbility" rca
WHERE l."class_id" = rc.id
  AND l."class_ability_id" = rca.id
  AND rc."name" = 'Fighter'
  AND rca."name" = 'Fighter Followers (10 CP)';

UPDATE "RuleClassAbilityLink" l
SET "is_default_package" = true
FROM "RuleClass" rc, "RuleClassAbility" rca
WHERE l."class_id" = rc.id
  AND l."class_ability_id" = rca.id
  AND rc."name" = 'Fighter'
  AND rca."name" = 'Fighter Followers (5 CP)';

-- 4) Remove links to old variable rows
DELETE FROM "RuleClassAbilityLink"
WHERE "class_ability_id" IN (
  SELECT id
  FROM "RuleClassAbility"
  WHERE "name" IN (
    'Bard Scroll Use',
    'Cleric Access to Spheres',
    'Cleric Followers',
    'Druid Access to Spheres',
    'Druid Immunity to Charm',
    'Druid Shapechange',
    'Fighter Followers',
    'Fighter Restriction: Limited Armor',
    'Fighter Restriction: Limited Magical Item Use',
    'Mage Access to Schools',
    'Mage Restriction: Limited Magical Item Use',
    'Thief Followers',
    'Thief Scroll Use'
  )
);

-- 5) Remove old variable rows
DELETE FROM "RuleClassAbility"
WHERE "name" IN (
  'Bard Scroll Use',
  'Cleric Access to Spheres',
  'Cleric Followers',
  'Druid Access to Spheres',
  'Druid Immunity to Charm',
  'Druid Shapechange',
  'Fighter Followers',
  'Fighter Restriction: Limited Armor',
  'Fighter Restriction: Limited Magical Item Use',
  'Mage Access to Schools',
  'Mage Restriction: Limited Magical Item Use',
  'Thief Followers',
  'Thief Scroll Use'
);
