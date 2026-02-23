CREATE TABLE "UiTextTranslation" (
  "id" SERIAL PRIMARY KEY,
  "namespace" VARCHAR(100) NOT NULL,
  "key" VARCHAR(150) NOT NULL,
  "locale" VARCHAR(5) NOT NULL,
  "text" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "UiTextTranslation_namespace_key_locale_key"
  ON "UiTextTranslation"("namespace", "key", "locale");

CREATE INDEX "UiTextTranslation_namespace_locale_idx"
  ON "UiTextTranslation"("namespace", "locale");
