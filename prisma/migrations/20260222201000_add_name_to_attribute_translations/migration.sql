ALTER TABLE "AttributeDefinitionTranslation"
  ADD COLUMN IF NOT EXISTS "name" VARCHAR(100);

ALTER TABLE "SubAttributeDefinitionTranslation"
  ADD COLUMN IF NOT EXISTS "name" VARCHAR(100);
