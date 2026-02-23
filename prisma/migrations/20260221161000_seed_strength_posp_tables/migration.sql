-- Seed Strength POSP tables (idempotent)

INSERT INTO "StrengthStaminaScoreReference" (
  "score_label",
  "base_score",
  "exceptional_min",
  "exceptional_max",
  "sort_order",
  "weight_allowance",
  "updated_at"
)
VALUES
  ('3', 3, NULL, NULL, 1, 5, CURRENT_TIMESTAMP),
  ('4-5', 4, NULL, NULL, 2, 10, CURRENT_TIMESTAMP),
  ('6-7', 6, NULL, NULL, 3, 20, CURRENT_TIMESTAMP),
  ('8-9', 8, NULL, NULL, 4, 35, CURRENT_TIMESTAMP),
  ('10-11', 10, NULL, NULL, 5, 40, CURRENT_TIMESTAMP),
  ('12-13', 12, NULL, NULL, 6, 45, CURRENT_TIMESTAMP),
  ('14-15', 14, NULL, NULL, 7, 55, CURRENT_TIMESTAMP),
  ('16', 16, NULL, NULL, 8, 70, CURRENT_TIMESTAMP),
  ('17', 17, NULL, NULL, 9, 85, CURRENT_TIMESTAMP),
  ('18', 18, NULL, NULL, 10, 110, CURRENT_TIMESTAMP),
  ('18/01-50', 18, 1, 50, 11, 135, CURRENT_TIMESTAMP),
  ('18/51-75', 18, 51, 75, 12, 160, CURRENT_TIMESTAMP),
  ('18/76-90', 18, 76, 90, 13, 185, CURRENT_TIMESTAMP),
  ('18/91-99', 18, 91, 99, 14, 235, CURRENT_TIMESTAMP),
  ('18/00', 18, 100, 100, 15, 335, CURRENT_TIMESTAMP),
  ('19', 19, NULL, NULL, 16, 485, CURRENT_TIMESTAMP),
  ('20', 20, NULL, NULL, 17, 535, CURRENT_TIMESTAMP),
  ('21', 21, NULL, NULL, 18, 635, CURRENT_TIMESTAMP),
  ('22', 22, NULL, NULL, 19, 785, CURRENT_TIMESTAMP),
  ('23', 23, NULL, NULL, 20, 935, CURRENT_TIMESTAMP),
  ('24', 24, NULL, NULL, 21, 1235, CURRENT_TIMESTAMP),
  ('25', 25, NULL, NULL, 22, 1535, CURRENT_TIMESTAMP)
ON CONFLICT ("score_label") DO UPDATE
SET
  "base_score" = EXCLUDED."base_score",
  "exceptional_min" = EXCLUDED."exceptional_min",
  "exceptional_max" = EXCLUDED."exceptional_max",
  "sort_order" = EXCLUDED."sort_order",
  "weight_allowance" = EXCLUDED."weight_allowance",
  "updated_at" = CURRENT_TIMESTAMP;

INSERT INTO "StrengthMuscleScoreReference" (
  "score_label",
  "base_score",
  "exceptional_min",
  "exceptional_max",
  "sort_order",
  "attack_adjustment",
  "damage_adjustment",
  "max_press",
  "open_doors",
  "open_doors_locked",
  "bend_bars_lift_gates_percent",
  "updated_at"
)
VALUES
  ('3', 3, NULL, NULL, 1, -3, -1, 10, 2, NULL, 0, CURRENT_TIMESTAMP),
  ('4-5', 4, NULL, NULL, 2, -2, -1, 25, 3, NULL, 0, CURRENT_TIMESTAMP),
  ('6-7', 6, NULL, NULL, 3, -1, 0, 55, 4, NULL, 0, CURRENT_TIMESTAMP),
  ('8-9', 8, NULL, NULL, 4, 0, 0, 90, 5, NULL, 1, CURRENT_TIMESTAMP),
  ('10-11', 10, NULL, NULL, 5, 0, 0, 115, 6, NULL, 2, CURRENT_TIMESTAMP),
  ('12-13', 12, NULL, NULL, 6, 0, 0, 140, 7, NULL, 4, CURRENT_TIMESTAMP),
  ('14-15', 14, NULL, NULL, 7, 0, 0, 170, 8, NULL, 7, CURRENT_TIMESTAMP),
  ('16', 16, NULL, NULL, 8, 0, 1, 195, 9, NULL, 10, CURRENT_TIMESTAMP),
  ('17', 17, NULL, NULL, 9, 1, 1, 220, 10, NULL, 13, CURRENT_TIMESTAMP),
  ('18', 18, NULL, NULL, 10, 1, 3, 255, 11, NULL, 16, CURRENT_TIMESTAMP),
  ('18/01-50', 18, 1, 50, 11, 1, 3, 280, 12, NULL, 20, CURRENT_TIMESTAMP),
  ('18/51-75', 18, 51, 75, 12, 2, 3, 305, 13, NULL, 25, CURRENT_TIMESTAMP),
  ('18/76-90', 18, 76, 90, 13, 2, 4, 330, 14, NULL, 30, CURRENT_TIMESTAMP),
  ('18/91-99', 18, 91, 99, 14, 2, 5, 380, 15, 3, 35, CURRENT_TIMESTAMP),
  ('18/00', 18, 100, 100, 15, 3, 6, 480, 16, 6, 40, CURRENT_TIMESTAMP),
  ('19', 19, NULL, NULL, 16, 3, 7, 640, 16, 8, 50, CURRENT_TIMESTAMP),
  ('20', 20, NULL, NULL, 17, 3, 8, 700, 17, 10, 60, CURRENT_TIMESTAMP),
  ('21', 21, NULL, NULL, 18, 4, 9, 810, 17, 12, 70, CURRENT_TIMESTAMP),
  ('22', 22, NULL, NULL, 19, 4, 10, 970, 18, 14, 80, CURRENT_TIMESTAMP),
  ('23', 23, NULL, NULL, 20, 5, 11, 1130, 18, 16, 90, CURRENT_TIMESTAMP),
  ('24', 24, NULL, NULL, 21, 6, 12, 1440, 19, 17, 95, CURRENT_TIMESTAMP),
  ('25', 25, NULL, NULL, 22, 7, 14, 1535, 19, 18, 99, CURRENT_TIMESTAMP)
ON CONFLICT ("score_label") DO UPDATE
SET
  "base_score" = EXCLUDED."base_score",
  "exceptional_min" = EXCLUDED."exceptional_min",
  "exceptional_max" = EXCLUDED."exceptional_max",
  "sort_order" = EXCLUDED."sort_order",
  "attack_adjustment" = EXCLUDED."attack_adjustment",
  "damage_adjustment" = EXCLUDED."damage_adjustment",
  "max_press" = EXCLUDED."max_press",
  "open_doors" = EXCLUDED."open_doors",
  "open_doors_locked" = EXCLUDED."open_doors_locked",
  "bend_bars_lift_gates_percent" = EXCLUDED."bend_bars_lift_gates_percent",
  "updated_at" = CURRENT_TIMESTAMP;
