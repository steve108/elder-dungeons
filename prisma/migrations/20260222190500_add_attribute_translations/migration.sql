CREATE TABLE "AttributeDefinitionTranslation" (
  "id" SERIAL PRIMARY KEY,
  "attribute_id" INTEGER NOT NULL,
  "locale" VARCHAR(5) NOT NULL,
  "description" TEXT,
  "full_description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AttributeDefinitionTranslation_attribute_id_fkey"
    FOREIGN KEY ("attribute_id")
    REFERENCES "AttributeDefinition"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "AttributeDefinitionTranslation_attribute_id_locale_key"
  ON "AttributeDefinitionTranslation"("attribute_id", "locale");

CREATE INDEX "AttributeDefinitionTranslation_locale_idx"
  ON "AttributeDefinitionTranslation"("locale");

CREATE TABLE "SubAttributeDefinitionTranslation" (
  "id" SERIAL PRIMARY KEY,
  "sub_attribute_id" INTEGER NOT NULL,
  "locale" VARCHAR(5) NOT NULL,
  "description" TEXT,
  "full_description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SubAttributeDefinitionTranslation_sub_attribute_id_fkey"
    FOREIGN KEY ("sub_attribute_id")
    REFERENCES "SubAttributeDefinition"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "SubAttributeDefinitionTranslation_sub_attribute_id_locale_key"
  ON "SubAttributeDefinitionTranslation"("sub_attribute_id", "locale");

CREATE INDEX "SubAttributeDefinitionTranslation_locale_idx"
  ON "SubAttributeDefinitionTranslation"("locale");
