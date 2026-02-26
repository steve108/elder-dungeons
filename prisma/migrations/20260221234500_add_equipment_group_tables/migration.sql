CREATE TABLE IF NOT EXISTS "RuleEquipmentSettingItem" (
  "id" SERIAL PRIMARY KEY,
  "table_number" INTEGER NOT NULL,
  "setting_name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "item_name" TEXT NOT NULL,
  "is_limited" BOOLEAN NOT NULL DEFAULT false,
  "source_url" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "RuleEquipmentSettingItem_table_number_idx" ON "RuleEquipmentSettingItem"("table_number");
CREATE INDEX IF NOT EXISTS "RuleEquipmentSettingItem_setting_name_category_idx" ON "RuleEquipmentSettingItem"("setting_name", "category");

CREATE TABLE IF NOT EXISTS "RuleEquipmentWeapon" (
  "id" SERIAL PRIMARY KEY,
  "item_name" TEXT NOT NULL,
  "cost_text" TEXT,
  "weight_text" TEXT,
  "size_text" TEXT,
  "type_text" TEXT,
  "factor_text" TEXT,
  "damage_sm_med" TEXT,
  "damage_large" TEXT,
  "notes" TEXT,
  "source_url" TEXT,
  "display_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "RuleEquipmentWeapon_display_order_idx" ON "RuleEquipmentWeapon"("display_order");

CREATE TABLE IF NOT EXISTS "RuleEquipmentMissileRange" (
  "id" SERIAL PRIMARY KEY,
  "category" TEXT,
  "item_name" TEXT NOT NULL,
  "rate_of_fire" TEXT,
  "short_range" TEXT,
  "medium_range" TEXT,
  "long_range" TEXT,
  "notes" TEXT,
  "source_url" TEXT,
  "display_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "RuleEquipmentMissileRange_display_order_idx" ON "RuleEquipmentMissileRange"("display_order");

CREATE TABLE IF NOT EXISTS "RuleEquipmentArmor" (
  "id" SERIAL PRIMARY KEY,
  "item_name" TEXT NOT NULL,
  "cost_text" TEXT,
  "weight_text" TEXT,
  "ac_text" TEXT,
  "bulk_points" TEXT,
  "source_url" TEXT,
  "display_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "RuleEquipmentArmor_display_order_idx" ON "RuleEquipmentArmor"("display_order");

CREATE TABLE IF NOT EXISTS "RuleEquipmentShield" (
  "id" SERIAL PRIMARY KEY,
  "item_name" TEXT NOT NULL,
  "cost_text" TEXT,
  "weight_text" TEXT,
  "num_foes_text" TEXT,
  "bulk_points" TEXT,
  "source_url" TEXT,
  "display_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "RuleEquipmentShield_display_order_idx" ON "RuleEquipmentShield"("display_order");

CREATE TABLE IF NOT EXISTS "RuleEquipmentMiscItem" (
  "id" SERIAL PRIMARY KEY,
  "item_name" TEXT NOT NULL,
  "cost_text" TEXT,
  "weight_text" TEXT,
  "bulk_points" TEXT,
  "initial_avail" TEXT,
  "source_url" TEXT,
  "display_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "RuleEquipmentMiscItem_display_order_idx" ON "RuleEquipmentMiscItem"("display_order");

CREATE TABLE IF NOT EXISTS "RuleEquipmentTradeGood" (
  "id" SERIAL PRIMARY KEY,
  "item_name" TEXT NOT NULL,
  "cost_text" TEXT,
  "weight_text" TEXT,
  "bulk_points" TEXT,
  "initial_avail" TEXT,
  "source_url" TEXT,
  "display_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "RuleEquipmentTradeGood_display_order_idx" ON "RuleEquipmentTradeGood"("display_order");

CREATE TABLE IF NOT EXISTS "RuleEquipmentDemihumanItem" (
  "id" SERIAL PRIMARY KEY,
  "demihuman_type" TEXT NOT NULL,
  "item_name" TEXT NOT NULL,
  "cost_text" TEXT,
  "weight_text" TEXT,
  "bulk_points" TEXT,
  "source_url" TEXT,
  "display_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "RuleEquipmentDemihumanItem_demihuman_type_idx" ON "RuleEquipmentDemihumanItem"("demihuman_type");
CREATE INDEX IF NOT EXISTS "RuleEquipmentDemihumanItem_display_order_idx" ON "RuleEquipmentDemihumanItem"("display_order");

CREATE TABLE IF NOT EXISTS "RuleEquipmentCommonMagicItem" (
  "id" SERIAL PRIMARY KEY,
  "item_name" TEXT NOT NULL,
  "occurrence_low" TEXT,
  "occurrence_medium" TEXT,
  "occurrence_high" TEXT,
  "cost_text" TEXT,
  "weight_text" TEXT,
  "bulk_points" TEXT,
  "source_url" TEXT,
  "display_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "RuleEquipmentCommonMagicItem_display_order_idx" ON "RuleEquipmentCommonMagicItem"("display_order");
