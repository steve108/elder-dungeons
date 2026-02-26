-- Add class subgroup and seed POSP classes + Fighter catalog

CREATE TYPE "ClassGroup" AS ENUM ('WARRIOR', 'ROGUE', 'WIZARD', 'PRIEST');

ALTER TABLE "RuleClass"
  ADD COLUMN "class_group" "ClassGroup" NOT NULL DEFAULT 'WARRIOR';

-- Base classes by subgroup
INSERT INTO "RuleClass" (
  "name",
  "class_group",
  "description",
  "full_description",
  "class_point_budget",
  "ability_requirements",
  "prime_requisite",
  "allowed_races_text",
  "updated_at"
)
VALUES
  ('Fighter', 'WARRIOR', 'Warrior class focused on weapons and combat tactics.', 'POSP Fighter class with purchasable combat abilities and optional restrictions.', 15, 'Strength 9', 'Strength', 'All', CURRENT_TIMESTAMP),
  ('Paladin', 'WARRIOR', 'Lawful good holy warrior class.', 'POSP Paladin class with divine abilities and optional restrictions shared with Fighter.', 60, 'Strength 12, Constitution 9, Wisdom 13, Charisma 17', 'Strength, Charisma', 'Human', CURRENT_TIMESTAMP),
  ('Ranger', 'WARRIOR', 'Wilderness warrior and hunter class.', 'POSP Ranger class with tracking, stealth and nature abilities; optional restrictions shared with Fighter.', 60, 'Strength 13, Dexterity 13, Constitution 14, Wisdom 14', 'Strength, Dexterity, Wisdom', 'Human, Elf, Half-Elf', CURRENT_TIMESTAMP),
  ('Thief', 'ROGUE', 'Rogue class centered on stealth and larceny skills.', 'POSP Thief class with broad skill-based progression and discretionary skill points.', 80, 'Dexterity 9', 'Dexterity', 'All', CURRENT_TIMESTAMP),
  ('Bard', 'ROGUE', 'Rogue performer and versatile support class.', 'POSP Bard class with performance powers, limited wizard spellcasting, and rogue skills.', 70, 'Dexterity 12, Intelligence 13, Charisma 15', 'Dexterity, Charisma', 'Human, Half-Elf', CURRENT_TIMESTAMP),
  ('Mage', 'WIZARD', 'Arcane caster with access to wizard schools.', 'POSP Mage class with school-based access purchases and optional magical-item restriction.', 40, 'Intelligence 9', 'Intelligence', 'Human, Half-Elf, Elf', CURRENT_TIMESTAMP),
  ('Cleric', 'PRIEST', 'Priest class with broad sphere access and turning undead.', 'POSP Cleric class with sphere access purchases and divine class abilities.', 125, 'Wisdom 9', 'Wisdom', 'All', CURRENT_TIMESTAMP),
  ('Druid', 'PRIEST', 'Nature priest with shapeshifting and sphere access.', 'POSP Druid class with nature-focused powers and optional sphere customization.', 100, 'Wisdom 12, Charisma 15', 'Wisdom, Charisma', 'Human, Half-Elf', CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO UPDATE
SET
  "class_group" = EXCLUDED."class_group",
  "description" = EXCLUDED."description",
  "full_description" = EXCLUDED."full_description",
  "class_point_budget" = EXCLUDED."class_point_budget",
  "ability_requirements" = EXCLUDED."ability_requirements",
  "prime_requisite" = EXCLUDED."prime_requisite",
  "allowed_races_text" = EXCLUDED."allowed_races_text",
  "updated_at" = CURRENT_TIMESTAMP;

-- Mage specialist wizard schools as kits
WITH mage AS (
  SELECT id FROM "RuleClass" WHERE "name" = 'Mage'
)
INSERT INTO "RuleKit" ("class_id", "name", "description", "full_description", "updated_at")
SELECT mage.id, v.name, v.description, v.full_description, CURRENT_TIMESTAMP
FROM mage
CROSS JOIN (
  VALUES
    ('Abjurer', 'Specialist wizard in Abjuration school.', 'Specialist Wizard (POSP): Abjurer.'),
    ('Conjurer/Summoner', 'Specialist wizard in Conjuration/Summoning school.', 'Specialist Wizard (POSP): Conjurer/Summoner.'),
    ('Diviner', 'Specialist wizard in Divination school.', 'Specialist Wizard (POSP): Diviner.'),
    ('Enchanter/Charmer', 'Specialist wizard in Enchantment/Charm school.', 'Specialist Wizard (POSP): Enchanter/Charmer.'),
    ('Illusionist', 'Specialist wizard in Illusion/Phantasm school.', 'Specialist Wizard (POSP): Illusionist.'),
    ('Invoker/Evoker', 'Specialist wizard in Invocation/Evocation school.', 'Specialist Wizard (POSP): Invoker/Evoker.'),
    ('Necromancer', 'Specialist wizard in Necromancy school.', 'Specialist Wizard (POSP): Necromancer.'),
    ('Transmuter', 'Specialist wizard in Alteration/Transmutation school.', 'Specialist Wizard (POSP): Transmuter.')
) AS v(name, description, full_description)
ON CONFLICT ("class_id", "name") DO UPDATE
SET
  "description" = EXCLUDED."description",
  "full_description" = EXCLUDED."full_description",
  "updated_at" = CURRENT_TIMESTAMP;

-- Fighter abilities and optional restrictions
INSERT INTO "RuleClassAbility" (
  "name",
  "description",
  "full_description",
  "kind",
  "point_cost",
  "point_cost_min",
  "point_cost_max",
  "cost_notes",
  "is_shared_penalty",
  "shared_penalty_key",
  "source_class_hint",
  "updated_at"
)
VALUES
  ('Fighter 1d12 Hit Points', 'Use 1d12 instead of 1d10 for hit points.', 'Instead of rolling 1d10 for hit points, the fighter rolls 1d12 at each level.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Fighter', CURRENT_TIMESTAMP),
  ('Fighter Building', 'Knowledge to construct heavy war machines and siege engines.', 'The fighter can design/construct heavy war machines, siege engines, and siege towers.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Fighter', CURRENT_TIMESTAMP),
  ('Fighter Defense Bonus', '+2 AC when unarmored and unencumbered.', 'Fighter gains +2 Armor Class bonus when unarmored and unencumbered.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Fighter', CURRENT_TIMESTAMP),
  ('Fighter Followers', 'Gain followers by stronghold rules (earlier with higher cost).', '5 points: followers when stronghold is built and fighter is at least 9th level. 10 points: followers whenever stronghold is built, regardless of level.', 'BENEFIT', NULL, 5, 10, '5/10 depending on level requirement for followers.', false, NULL, 'Fighter', CURRENT_TIMESTAMP),
  ('Fighter Increased Movement', 'Base movement becomes 15 instead of 12.', 'Fighter base movement score is 15 rather than 12.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Fighter', CURRENT_TIMESTAMP),
  ('Fighter Leadership', 'Lead up to 100 soldiers per level.', 'Fighter can command large troops, use signals/messengers, and handle military maneuvers.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Fighter', CURRENT_TIMESTAMP),
  ('Fighter Magic Resistance', '2% MR per level.', 'Fighter gains 2% Magic Resistance per class level.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Fighter', CURRENT_TIMESTAMP),
  ('Fighter Move Silently', 'Move silently like a thief under armor limits.', 'Chance equals Dexterity score + fighter level; armor limited to studded leather or lighter.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Fighter', CURRENT_TIMESTAMP),
  ('Fighter Multiple Specialization', 'Specialize in multiple weapons.', 'Can be taken instead of single specialization; fighter may specialize in as many weapons as desired, paying each specialization cost.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Fighter', CURRENT_TIMESTAMP),
  ('Fighter Poison Resistance', '+1 saves vs poison.', 'Fighter gains +1 bonus to all saving throws versus poison.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Fighter', CURRENT_TIMESTAMP),
  ('Fighter Spell Resistance', '+1 saves vs spells.', 'Fighter gains +1 bonus to all saving throws versus spells.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Fighter', CURRENT_TIMESTAMP),
  ('Fighter Supervisor', 'Supervise defensive constructions.', 'Can supervise construction of ditches, pits, stakes, barricades, and semi-permanent fortifications.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Fighter', CURRENT_TIMESTAMP),
  ('Fighter War Machines', 'Operate heavy war machines and siege engines.', 'Knowledge to operate ballistae, catapults, rams, bores, and siege towers.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Fighter', CURRENT_TIMESTAMP),
  ('Fighter Weapon Specialization', 'Can specialize in one weapon.', 'Fighter can specialize in a specific weapon, paying normal proficiency/specialization costs.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Fighter', CURRENT_TIMESTAMP),

  ('Fighter Restriction: Limited Armor', 'Gain CP by limiting armor category.', '5 CP (chain or lighter), 10 CP (studded leather or lighter), 15 CP (no armor). Shield use remains allowed.', 'PENALTY', NULL, 5, 15, 'Variable refund: 5/10/15 based on armor restriction severity.', true, 'WARRIOR_SHARED_LIMITED_ARMOR', 'Fighter', CURRENT_TIMESTAMP),
  ('Fighter Restriction: Limited Weapon Selection', 'Gain CP by restricting weapon categories.', '5 CP if restricted to melee-only, cleric weapons, or thief weapons list.', 'PENALTY', 5, NULL, NULL, NULL, true, 'WARRIOR_SHARED_LIMITED_WEAPONS', 'Fighter', CURRENT_TIMESTAMP),
  ('Fighter Restriction: Limited Magical Item Use', 'Gain CP per barred magical item category.', 'Gain +5 CP per barred category: (1) potions/oils/scrolls, (2) rings/rods/staves/wands/misc, (3) weapons, (4) armor.', 'PENALTY', NULL, 5, 20, 'Variable refund +5 per barred item category.', true, 'WARRIOR_SHARED_LIMITED_MAGIC_ITEMS', 'Fighter', CURRENT_TIMESTAMP)
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

-- Link Fighter abilities to Fighter class
WITH fighter AS (
  SELECT id FROM "RuleClass" WHERE "name" = 'Fighter'
), ability_rows AS (
  SELECT
    rc.id AS class_id,
    rca.id AS class_ability_id,
    CASE WHEN rca."name" IN ('Fighter Weapon Specialization', 'Fighter Followers') THEN true ELSE false END AS is_default_package,
    CASE WHEN rca."kind" = 'PENALTY'::"ClassAbilityKind" THEN true ELSE false END AS is_optional_restriction,
    CASE
      WHEN rca."name" = 'Fighter Weapon Specialization' THEN 1
      WHEN rca."name" = 'Fighter Followers' THEN 2
      ELSE 100
    END AS display_order
  FROM fighter rc
  JOIN "RuleClassAbility" rca
    ON rca."source_class_hint" = 'Fighter'
)
INSERT INTO "RuleClassAbilityLink" (
  "class_id",
  "class_ability_id",
  "is_default_package",
  "is_optional_restriction",
  "display_order",
  "notes"
)
SELECT
  class_id,
  class_ability_id,
  is_default_package,
  is_optional_restriction,
  display_order,
  NULL
FROM ability_rows
ON CONFLICT ("class_id", "class_ability_id") DO UPDATE
SET
  "is_default_package" = EXCLUDED."is_default_package",
  "is_optional_restriction" = EXCLUDED."is_optional_restriction",
  "display_order" = EXCLUDED."display_order";

-- Explicit class references for shared restrictions
WITH refs AS (
  SELECT
    c.id AS class_id,
    f.id AS source_class_id,
    v.notes
  FROM "RuleClass" c
  JOIN "RuleClass" f ON f."name" = 'Fighter'
  JOIN (
    VALUES
      ('Paladin', 'Optional restrictions are the same as Fighter (POSP).'),
      ('Ranger', 'Optional restrictions are the same as Fighter (POSP).')
  ) AS v(class_name, notes)
    ON v.class_name = c."name"
)
INSERT INTO "RuleClassRestrictionReference" ("class_id", "source_class_id", "notes")
SELECT class_id, source_class_id, notes
FROM refs
ON CONFLICT ("class_id", "source_class_id") DO UPDATE
SET "notes" = EXCLUDED."notes";
