-- Seed class abilities for all POSP base classes and link them to each class.

-- =========================================================
-- PALADIN
-- =========================================================
INSERT INTO "RuleClassAbility" (
  "name", "description", "full_description", "kind", "point_cost", "point_cost_min", "point_cost_max", "cost_notes", "is_shared_penalty", "shared_penalty_key", "source_class_hint", "updated_at"
)
VALUES
  ('Paladin Circle of Power', 'Project circle of power when wielding holy sword.', 'With a holy sword, paladin projects a 10'' circle that dispels hostile magic at level equal to paladin level.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Paladin', CURRENT_TIMESTAMP),
  ('Paladin Curative', 'Cure disease periodically by level.', 'Cure disease once/week per five levels (ineffective against lycanthropy).', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Paladin', CURRENT_TIMESTAMP),
  ('Paladin Detection', 'Detect evil by concentration.', 'Detect evil creatures/monsters up to 60 feet by concentrating.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Paladin', CURRENT_TIMESTAMP),
  ('Paladin Faithful Mount', 'Summon special steed at 4th level.', 'Paladin gains a bonded special mount appropriate to campaign/DM at level 4.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Paladin', CURRENT_TIMESTAMP),
  ('Paladin Healing', 'Lay on hands once/day.', 'Restore 2 hit points per level once per day by laying on hands.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Paladin', CURRENT_TIMESTAMP),
  ('Paladin Health', 'Immunity to disease.', 'Immune to all forms of disease except specific exceptions like lycanthropy/mummy rot.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Paladin', CURRENT_TIMESTAMP),
  ('Paladin Poison Resistance', '+1 saves vs poison.', 'Gain +1 bonus to all saving throws versus poison.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Paladin', CURRENT_TIMESTAMP),
  ('Paladin Priest Spells', 'Gain priest spellcasting earlier.', 'By purchasing this, paladin spellcasting begins at level 4 (instead of later PHB progression).', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Paladin', CURRENT_TIMESTAMP),
  ('Paladin Protection from Evil', 'Natural 10'' anti-evil aura.', 'Summoned/evil creatures within 10'' suffer -1 to attack rolls; they sense paladin as source.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Paladin', CURRENT_TIMESTAMP),
  ('Paladin Resist Charm', '+2 saves vs charm.', 'Gain +2 bonus to saving throws versus charm-like spells/abilities.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Paladin', CURRENT_TIMESTAMP),
  ('Paladin Saving Throw Bonus', '+2 to all saving throws.', 'Gain +2 bonus to all saving throws.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Paladin', CURRENT_TIMESTAMP),
  ('Paladin Turn Undead', 'Turn undead as cleric two levels lower.', 'Starting at level 3, paladin can turn undead as a cleric two levels lower.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Paladin', CURRENT_TIMESTAMP),
  ('Paladin Weapon Specialization', 'Can specialize in one weapon.', 'Paladin can specialize in a weapon by paying normal proficiency/specialization costs.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Paladin', CURRENT_TIMESTAMP)
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

-- =========================================================
-- RANGER
-- =========================================================
INSERT INTO "RuleClassAbility" (
  "name", "description", "full_description", "kind", "point_cost", "point_cost_min", "point_cost_max", "cost_notes", "is_shared_penalty", "shared_penalty_key", "source_class_hint", "updated_at"
)
VALUES
  ('Ranger Bow Bonus', '+1 attack with bows.', 'Gain +1 attack bonus when using any type of bow.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Ranger', CURRENT_TIMESTAMP),
  ('Ranger Climbing', 'Climb natural formations.', 'Climbing score equals Dexterity/Balance plus hide in shadows percentage by level.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Ranger', CURRENT_TIMESTAMP),
  ('Ranger Detect Noise', 'Detect noise as thief-style ability.', 'Chance based on Intuition score plus move silently percentage.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Ranger', CURRENT_TIMESTAMP),
  ('Ranger Empathy with Animals', 'Befriend/assess animals.', 'Automatically befriend domestic/non-hostile animals; wild animals save vs rods with level-based penalty.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Ranger', CURRENT_TIMESTAMP),
  ('Ranger Find/Remove Wilderness Traps', 'Find/remove wilderness traps.', 'Chance equals move silently percentage; applies to pits, snares, and similar wilderness traps.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Ranger', CURRENT_TIMESTAMP),
  ('Ranger Followers', 'Gain followers at level 10.', 'At 10th level ranger attracts 2d6 followers without requiring stronghold.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Ranger', CURRENT_TIMESTAMP),
  ('Ranger Hide in Shadows', 'Hide in shadows in natural settings.', 'Thief-like hide in shadows in natural settings with armor limitations and reduced non-natural effectiveness.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Ranger', CURRENT_TIMESTAMP),
  ('Ranger Move Silently', 'Move silently in natural settings.', 'Thief-like move silently in natural settings with armor limitations and reduced non-natural effectiveness.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Ranger', CURRENT_TIMESTAMP),
  ('Ranger Pass Without Trace', 'Pass without trace once/day.', 'Gain druid-like pass without trace once per day.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Ranger', CURRENT_TIMESTAMP),
  ('Ranger Priest Spells', 'Gain ranger priest spellcasting.', 'At level 8+, ranger can learn priest spells from plant/animal spheres with POSP progression.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Ranger', CURRENT_TIMESTAMP),
  ('Ranger Sneak Attack', 'Backstab-like attack in natural settings.', 'If successfully hidden/silent, ranger can sneak-attack as thief backstab of same level in natural settings.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Ranger', CURRENT_TIMESTAMP),
  ('Ranger Speak with Animals', 'Speak with animals once/day.', 'Once/day cast equivalent of speak with animals.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Ranger', CURRENT_TIMESTAMP),
  ('Ranger Special Enemy', '+4 attack vs selected enemy type.', 'Choose one special enemy type; gain +4 to attacks and corresponding roleplay/reaction effects.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Ranger', CURRENT_TIMESTAMP),
  ('Ranger Tracking Proficiency', 'Gain and scale tracking proficiency.', 'Gain tracking proficiency with +1 improvement every three levels.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Ranger', CURRENT_TIMESTAMP),
  ('Ranger Two-Weapon Style', 'No dual-wield penalties in light armor.', 'Can fight with two weapons without penalties (subject to armor constraints).', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Ranger', CURRENT_TIMESTAMP),
  ('Ranger Weapon Specialization', 'Can specialize in one weapon.', 'Ranger can specialize in a weapon by paying normal proficiency/specialization costs.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Ranger', CURRENT_TIMESTAMP)
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

-- =========================================================
-- THIEF
-- =========================================================
INSERT INTO "RuleClassAbility" (
  "name", "description", "full_description", "kind", "point_cost", "point_cost_min", "point_cost_max", "cost_notes", "is_shared_penalty", "shared_penalty_key", "source_class_hint", "updated_at"
)
VALUES
  ('Thief Backstab', 'Backstab attack with multiplier by level.', 'Backstab attack with +4 to hit from surprise and level-scaled damage multipliers.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Thief', CURRENT_TIMESTAMP),
  ('Thief Bribe', 'Bribe officials/targets.', 'Attempt one bribe per target with reaction consequences on failure.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Thief', CURRENT_TIMESTAMP),
  ('Thief Climb Walls', 'Climb smooth/vertical surfaces.', 'Use climb walls skill against thief table progression.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Thief', CURRENT_TIMESTAMP),
  ('Thief Defense Bonus', '+2 AC when unarmored and unencumbered.', 'Gain +2 Armor Class bonus while unarmored and unencumbered.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Thief', CURRENT_TIMESTAMP),
  ('Thief Detect Illusion', 'Detect illusions in line of sight.', 'Perceive illusions up to 90 feet as translucent overlays.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Thief', CURRENT_TIMESTAMP),
  ('Thief Detect Magic', 'Detect magical radiations in line of sight.', 'Detect magic up to 60 feet, with intensity awareness.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Thief', CURRENT_TIMESTAMP),
  ('Thief Detect Noise', 'Hear sounds others cannot.', 'Thief auditory detection skill progression.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Thief', CURRENT_TIMESTAMP),
  ('Thief Escaping Bonds', 'Escape ropes/manacles/chains.', 'Escape bonds and bindings; may require multiple checks and include lock interactions.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Thief', CURRENT_TIMESTAMP),
  ('Thief Find/Remove Traps', 'Find and disarm small mechanical traps.', 'Locate and disarm thief-targeted traps and alarms.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Thief', CURRENT_TIMESTAMP),
  ('Thief Followers', 'Gain followers by stronghold rules (earlier with higher cost).', '5 points: followers at stronghold and level 10. 10 points: followers with stronghold regardless of level.', 'BENEFIT', NULL, 5, 10, '5/10 depending on level requirement for followers.', false, NULL, 'Thief', CURRENT_TIMESTAMP),
  ('Thief Hide in Shadows', 'Hide effectively in shadows and cover.', 'Hide in shadows with thief progression and movement constraints.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Thief', CURRENT_TIMESTAMP),
  ('Thief Move Silently', 'Move without noise.', 'Move silently at reduced speed with thief progression.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Thief', CURRENT_TIMESTAMP),
  ('Thief Open Locks', 'Pick locks using tools and finesse.', 'Attempt lockpicking; failed lock cannot be retried until next level.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Thief', CURRENT_TIMESTAMP),
  ('Thief Pick Pockets', 'Pilfer items from targets.', 'Pick pockets with notice check based on target level when attempt fails.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Thief', CURRENT_TIMESTAMP),
  ('Thief Read Languages', 'Read foreign/unknown languages.', 'Thief reading capability progression for useful written material.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Thief', CURRENT_TIMESTAMP),
  ('Thief Scroll Use', 'Read/use magical scrolls with chance table.', 'At 10th level by default; 10-point purchase enables any-level scroll-use chance progression.', 'BENEFIT', NULL, 5, 10, '5/10 variant for timing of access.', false, NULL, 'Thief', CURRENT_TIMESTAMP),
  ('Thief Thieves'' Cant', 'Use specialized criminal slang.', 'Converse covertly about illicit operations via thieves'' cant.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Thief', CURRENT_TIMESTAMP),
  ('Thief Tunneling', 'Dig tunnels with terrain modifiers/time.', 'Tunneling checks and time vary by soil type; failures can collapse tunnels.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Thief', CURRENT_TIMESTAMP),
  ('Thief Weapon Specialization', 'Can specialize in one weapon.', 'Thief may specialize in a weapon with additional proficiency/specialization costs.', 'BENEFIT', 15, NULL, NULL, NULL, false, NULL, 'Thief', CURRENT_TIMESTAMP)
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

-- =========================================================
-- BARD
-- =========================================================
INSERT INTO "RuleClassAbility" (
  "name", "description", "full_description", "kind", "point_cost", "point_cost_min", "point_cost_max", "cost_notes", "is_shared_penalty", "shared_penalty_key", "source_class_hint", "updated_at"
)
VALUES
  ('Bard Alter Moods', 'Shift audience mood by performance.', 'On failed saves vs paralyzation, audience mood shifts one category toward bard intent.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Bard', CURRENT_TIMESTAMP),
  ('Bard Animal Friendship', 'Cast animal friendship once/day.', 'Once/day animal friendship via soothing performance.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Bard', CURRENT_TIMESTAMP),
  ('Bard Charm Resistance', '+1 saves vs charm effects.', 'Gain +1 bonus to saves versus charm-like spells/effects.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Bard', CURRENT_TIMESTAMP),
  ('Bard Climb Walls', 'Climb smooth or vertical surfaces.', 'Bard climb walls skill progression.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Bard', CURRENT_TIMESTAMP),
  ('Bard Counter Effects', 'Counter sonic/music magical effects.', 'Counter-song grants nearby immunity to song/music attacks while maintained.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Bard', CURRENT_TIMESTAMP),
  ('Bard Detect Magic', 'Detect magic in line of sight.', 'Detect magical radiation up to 60 feet with intensity clues.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Bard', CURRENT_TIMESTAMP),
  ('Bard Detect Noise', 'Hear sounds others cannot.', 'Bard auditory detection skill progression.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Bard', CURRENT_TIMESTAMP),
  ('Bard History', 'Lore and magic-item historical insight.', '5% per level chance to identify purpose/function/history of magical items.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Bard', CURRENT_TIMESTAMP),
  ('Bard Pick Pockets', 'Pilfer items from targets.', 'Pick pockets with notice check based on victim level.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Bard', CURRENT_TIMESTAMP),
  ('Bard Rally Friends', 'Inspire allies before battle.', 'After rally rounds, grant bonus to attacks, saves, or morale for upcoming battle.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Bard', CURRENT_TIMESTAMP),
  ('Bard Read Languages', 'Read unfamiliar languages.', 'Bard language-reading skill progression.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Bard', CURRENT_TIMESTAMP),
  ('Bard Sound Resistance', '+2 saves vs sound-based attacks.', 'Gain +2 bonus vs sound-based magical attacks.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Bard', CURRENT_TIMESTAMP),
  ('Bard Scroll Use', 'Read/use magical scrolls with chance table.', 'At 10th level by default; 10-point purchase enables any-level scroll-use chance progression.', 'BENEFIT', NULL, 5, 10, '5/10 variant for timing of access.', false, NULL, 'Bard', CURRENT_TIMESTAMP),
  ('Bard Weapon Specialization', 'Can specialize in one weapon.', 'Bard may specialize in a weapon with additional proficiency/specialization costs.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Bard', CURRENT_TIMESTAMP),
  ('Bard Wizard Spells', 'Gain bard wizard spellcasting progression.', 'Bard gains wizard spellcasting progression from level 2 and spellbook access by POSP rules.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Bard', CURRENT_TIMESTAMP)
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

-- =========================================================
-- MAGE
-- =========================================================
INSERT INTO "RuleClassAbility" (
  "name", "description", "full_description", "kind", "point_cost", "point_cost_min", "point_cost_max", "cost_notes", "is_shared_penalty", "shared_penalty_key", "source_class_hint", "updated_at"
)
VALUES
  ('Mage Access to Schools', 'Purchase access to wizard schools.', 'Costs 5 points per school; standard mage commonly buys access to all eight core schools.', 'BENEFIT', NULL, 5, 40, '5 points per school; total varies by number of schools.', false, NULL, 'Mage', CURRENT_TIMESTAMP),
  ('Mage Armored Wizard', 'Cast spells while armored.', 'Wizard can cast spells while wearing armor of choice.', 'BENEFIT', 15, NULL, NULL, NULL, false, NULL, 'Mage', CURRENT_TIMESTAMP),
  ('Mage Automatic Spells', 'Auto-gain spells at new spell levels.', 'When accessing a new spell level, automatically gains one spell of that level in spellbook.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Mage', CURRENT_TIMESTAMP),
  ('Mage Casting Reduction', 'Reduce spell casting times by 1.', 'Casting time of all wizard spells reduced by 1, with minimum casting time 1.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Mage', CURRENT_TIMESTAMP),
  ('Mage Combat Bonus', 'Use rogue THAC0 progression.', 'Wizard uses rogue THAC0 chart for improved combat performance.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Mage', CURRENT_TIMESTAMP),
  ('Mage Detect Magic', 'Detect magic several times/day by level.', 'Detect magic uses/day scale by level in addition to memorized spells.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Mage', CURRENT_TIMESTAMP),
  ('Mage Extend Duration', 'Increase non-instant spell durations.', 'Duration of non-instant spells increases by 1 round per 2 wizard levels.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Mage', CURRENT_TIMESTAMP),
  ('Mage Hit Point Bonus', 'Use 1d6 hit die instead of 1d4.', 'Wizard rolls 1d6 for hit points instead of 1d4.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Mage', CURRENT_TIMESTAMP),
  ('Mage Warrior Hit Point Bonus', 'Use fighter-style Constitution bonuses.', 'Wizard uses fighter Constitution bonus table for hit point adjustments.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Mage', CURRENT_TIMESTAMP),
  ('Mage Priestly Wizards', 'Gain one priest sphere as wizard casting.', 'Wizard gains access to one priest sphere and casts those as wizard spells under normal slot constraints.', 'BENEFIT', 15, NULL, NULL, NULL, false, NULL, 'Mage', CURRENT_TIMESTAMP),
  ('Mage Read Magic', 'Read magic several times/day by level.', 'Read magic uses/day scale by level in addition to memorized spells.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Mage', CURRENT_TIMESTAMP),
  ('Mage Resistance to Sleep and Charm', '+1 saves vs sleep/charm.', 'Gain +1 bonus to saving throws versus sleep/charm effects when saves apply.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Mage', CURRENT_TIMESTAMP),
  ('Mage Weapon Specialization', 'Can specialize in one weapon.', 'Wizard may specialize in a weapon with extra proficiency/specialization costs.', 'BENEFIT', 15, NULL, NULL, NULL, false, NULL, 'Mage', CURRENT_TIMESTAMP),
  ('Mage Restriction: Limited Magical Item Use', 'Gain CP per barred magical item category.', 'Gain +5 CP per barred category: (1) potions/oils/scrolls, (2) rings/rods/staves/wands/misc, (3) all weapons and armor.', 'PENALTY', NULL, 5, 15, 'Variable refund +5 per barred category.', true, 'WIZARD_SHARED_LIMITED_MAGIC_ITEMS', 'Mage', CURRENT_TIMESTAMP)
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

-- =========================================================
-- CLERIC
-- =========================================================
INSERT INTO "RuleClassAbility" (
  "name", "description", "full_description", "kind", "point_cost", "point_cost_min", "point_cost_max", "cost_notes", "is_shared_penalty", "shared_penalty_key", "source_class_hint", "updated_at"
)
VALUES
  ('Cleric Access to Spheres', 'Purchase minor/major sphere access.', 'Sphere access costs vary (3 to 15) by sphere and minor/major level.', 'BENEFIT', NULL, 3, 15, 'Variable by sphere and access level (minor/major).', false, NULL, 'Cleric', CURRENT_TIMESTAMP),
  ('Cleric Casting Reduction', 'Reduce spell casting times by 1.', 'Casting time reduced by 1 with minimum casting time 1.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Cleric', CURRENT_TIMESTAMP),
  ('Cleric Detect Evil', 'Detect evil in 10'' x 60'' path.', 'Scan one direction per round to detect evil emanations.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Cleric', CURRENT_TIMESTAMP),
  ('Cleric Detect Undead', 'Detect undead in 10'' x 60'' path.', 'Scan one direction per round to detect undead (blocked by thick materials).', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Cleric', CURRENT_TIMESTAMP),
  ('Cleric Expert Healer', 'Extra cure light wounds/day.', 'Cast one additional cure light wounds per day beyond normal spell slots.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Cleric', CURRENT_TIMESTAMP),
  ('Cleric Followers', 'Gain followers by stronghold rules (earlier with higher cost).', '5 points: followers at stronghold and level 8. 10 points: followers with stronghold regardless of level.', 'BENEFIT', NULL, 5, 10, '5/10 depending on level requirement for followers.', false, NULL, 'Cleric', CURRENT_TIMESTAMP),
  ('Cleric Hit Point Bonus', 'Use 1d10 hit die instead of 1d8.', 'Cleric rolls 1d10 for hit points instead of 1d8.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Cleric', CURRENT_TIMESTAMP),
  ('Cleric Know Alignment', 'Cast know alignment once/day extra.', 'Cast know alignment once/day in addition to normal spells.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Cleric', CURRENT_TIMESTAMP),
  ('Cleric Resist Energy Drain', '+1 saves vs energy drain attacks.', 'Gain +1 bonus to relevant saves against level-drain/energy-drain effects when saves apply.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Cleric', CURRENT_TIMESTAMP),
  ('Cleric Spell Duration Increase', 'Increase non-instant durations by level.', 'Non-instant spell durations increase by 1 round per 2 cleric levels.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Cleric', CURRENT_TIMESTAMP),
  ('Cleric Turn Undead', 'Turn/destroy undead by cleric chart.', 'Cleric gains full turning ability progression vs undead classes and HD tiers.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Cleric', CURRENT_TIMESTAMP),
  ('Cleric Warrior-Priests', 'Use warrior Strength/Con bonuses.', 'Priest can use warrior exceptional Strength/Constitution bonus progressions.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Cleric', CURRENT_TIMESTAMP),
  ('Cleric Weapon Allowance', 'Use one favored edged weapon of deity.', 'May use a deity-favored edged weapon (still requires proficiency purchase).', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Cleric', CURRENT_TIMESTAMP),
  ('Cleric Weapon Specialization', 'Can specialize in one weapon.', 'Cleric may specialize in a weapon with extra proficiency/specialization costs.', 'BENEFIT', 15, NULL, NULL, NULL, false, NULL, 'Cleric', CURRENT_TIMESTAMP),
  ('Cleric Wizardly Priests', 'Gain one wizard school as clerical casting.', 'Priest gains one school of wizard spells cast as clerical spells under normal slot constraints.', 'BENEFIT', 15, NULL, NULL, NULL, false, NULL, 'Cleric', CURRENT_TIMESTAMP)
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

-- =========================================================
-- DRUID
-- =========================================================
INSERT INTO "RuleClassAbility" (
  "name", "description", "full_description", "kind", "point_cost", "point_cost_min", "point_cost_max", "cost_notes", "is_shared_penalty", "shared_penalty_key", "source_class_hint", "updated_at"
)
VALUES
  ('Druid Access to Spheres', 'Use standard package or buy spheres individually.', 'Standard druid sphere package costs 60 CP; alternatively buy spheres individually using cleric cost model.', 'BENEFIT', NULL, 5, 60, 'Variable: package or individual sphere purchases.', false, NULL, 'Druid', CURRENT_TIMESTAMP),
  ('Druid Bonus Spell', 'Cast animal friendship once/day bonus.', 'Gain one bonus animal friendship spell per day outside normal slots.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Druid', CURRENT_TIMESTAMP),
  ('Druid Cold Resistance', '+2 saves vs cold/ice.', 'Gain +2 saving throw bonus versus cold- and ice-based attacks.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Druid', CURRENT_TIMESTAMP),
  ('Druid Communicate with Creatures', 'Learn woodland creature languages by level.', 'Acquire one woodland-creature language per level and communicate broadly with nature beings.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Druid', CURRENT_TIMESTAMP),
  ('Druid Elemental Spell Bonus', 'Elemental spells cast as +1 level.', 'Elemental-sphere spell variables are resolved as if druid were one level higher.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Druid', CURRENT_TIMESTAMP),
  ('Druid Hit Point Bonus', 'Use 1d10 hit die instead of 1d8.', 'Druid rolls 1d10 for hit points instead of 1d8.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Druid', CURRENT_TIMESTAMP),
  ('Druid Identify', 'Identify plants/animals/water at level 3.', 'At 3rd level, accurately identify plants, animals, and clean water.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Druid', CURRENT_TIMESTAMP),
  ('Druid Immunity to Charm', 'Gain charm immunity timing upgrade.', '5 points follows normal timing; 10 points grants immediate woodland-charm immunity.', 'BENEFIT', NULL, 5, 10, '5/10 variant for timing of immunity.', false, NULL, 'Druid', CURRENT_TIMESTAMP),
  ('Druid Immunity to Disease', 'Immunity to natural diseases.', 'Druid becomes immune to natural diseases.', 'BENEFIT', 10, NULL, NULL, NULL, false, NULL, 'Druid', CURRENT_TIMESTAMP),
  ('Druid Pass Without Trace', 'Use pass without trace at level 3.', 'At 3rd level, move at normal rate while passing without trace.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Druid', CURRENT_TIMESTAMP),
  ('Druid Purify Water', 'Extra purify food and drink/day.', 'Gain one additional purify food and drink spell per day.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Druid', CURRENT_TIMESTAMP),
  ('Druid Fire/Electrical Resistance', '+2 saves vs fire/electrical.', 'Gain +2 bonus to all saves versus fire and electrical attacks.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Druid', CURRENT_TIMESTAMP),
  ('Druid Hide in Shadows', 'Hide in shadows as ranger ability.', 'Use ranger-style hide in shadows in natural surroundings.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Druid', CURRENT_TIMESTAMP),
  ('Druid Move Silently', 'Move silently as ranger ability.', 'Use ranger-style move silently in natural surroundings.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Druid', CURRENT_TIMESTAMP),
  ('Druid Secret Language', 'Speak druidic secret language.', 'Druids can communicate in their secret language.', 'BENEFIT', 5, NULL, NULL, NULL, false, NULL, 'Druid', CURRENT_TIMESTAMP),
  ('Druid Shapechange', 'Gain shapechange progression.', '10 points follows PHB timing; 15 points grants earlier staged shapechanging from levels 5 to 7.', 'BENEFIT', NULL, 10, 15, '10/15 variant for timing and breadth of shapechange.', false, NULL, 'Druid', CURRENT_TIMESTAMP),
  ('Druid Weapon Specialization', 'Can specialize in one weapon.', 'Druid may specialize in a weapon with extra proficiency/specialization costs.', 'BENEFIT', 15, NULL, NULL, NULL, false, NULL, 'Druid', CURRENT_TIMESTAMP)
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

-- =========================================================
-- LINK abilities to classes (all non-Fighter source_class_hint classes)
-- =========================================================
WITH links AS (
  SELECT
    rc.id AS class_id,
    rca.id AS class_ability_id,
    false AS is_default_package,
    CASE WHEN rca.kind = 'PENALTY'::"ClassAbilityKind" THEN true ELSE false END AS is_optional_restriction,
    NULL::int AS display_order,
    NULL::text AS notes
  FROM "RuleClass" rc
  JOIN "RuleClassAbility" rca
    ON rca."source_class_hint" = rc."name"
  WHERE rc."name" IN ('Paladin','Ranger','Thief','Bard','Mage','Cleric','Druid')
)
INSERT INTO "RuleClassAbilityLink" (
  "class_id", "class_ability_id", "is_default_package", "is_optional_restriction", "display_order", "notes"
)
SELECT
  class_id, class_ability_id, is_default_package, is_optional_restriction, display_order, notes
FROM links
ON CONFLICT ("class_id", "class_ability_id") DO UPDATE
SET
  "is_optional_restriction" = EXCLUDED."is_optional_restriction";

-- =========================================================
-- Also link shared Fighter restrictions to Paladin and Ranger
-- =========================================================
WITH class_targets AS (
  SELECT id, name FROM "RuleClass" WHERE name IN ('Paladin', 'Ranger')
), shared_fighter_penalties AS (
  SELECT id
  FROM "RuleClassAbility"
  WHERE "shared_penalty_key" IN (
    'WARRIOR_SHARED_LIMITED_ARMOR',
    'WARRIOR_SHARED_LIMITED_WEAPONS',
    'WARRIOR_SHARED_LIMITED_MAGIC_ITEMS'
  )
)
INSERT INTO "RuleClassAbilityLink" (
  "class_id", "class_ability_id", "is_default_package", "is_optional_restriction", "display_order", "notes"
)
SELECT
  ct.id,
  sfp.id,
  false,
  true,
  NULL,
  'Shared optional restriction imported from Fighter (POSP).'
FROM class_targets ct
CROSS JOIN shared_fighter_penalties sfp
ON CONFLICT ("class_id", "class_ability_id") DO UPDATE
SET
  "is_optional_restriction" = EXCLUDED."is_optional_restriction",
  "notes" = EXCLUDED."notes";
