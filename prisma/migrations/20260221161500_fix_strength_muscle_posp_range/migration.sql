-- Align StrengthMuscleScoreReference with POSP range (3..25 with exceptional 18/xx)

DELETE FROM "StrengthMuscleScoreReference"
WHERE "score_label" IN ('1', '2');
