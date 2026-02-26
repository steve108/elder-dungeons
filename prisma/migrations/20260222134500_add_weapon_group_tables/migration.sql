-- CreateEnum
CREATE TYPE "WeaponGroupKind" AS ENUM ('BROAD', 'TIGHT');

-- CreateTable
CREATE TABLE "RuleWeaponGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "WeaponGroupKind" NOT NULL,
    "parent_group_id" INTEGER,
    "source_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuleWeaponGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RuleWeaponGroupWeapon" (
    "id" SERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "weapon_name" TEXT NOT NULL,
    "source_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuleWeaponGroupWeapon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RuleWeaponGroup_name_kind_parent_group_id_key" ON "RuleWeaponGroup"("name", "kind", "parent_group_id");

-- CreateIndex
CREATE INDEX "RuleWeaponGroup_kind_idx" ON "RuleWeaponGroup"("kind");

-- CreateIndex
CREATE INDEX "RuleWeaponGroup_parent_group_id_idx" ON "RuleWeaponGroup"("parent_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "RuleWeaponGroupWeapon_group_id_weapon_name_key" ON "RuleWeaponGroupWeapon"("group_id", "weapon_name");

-- CreateIndex
CREATE INDEX "RuleWeaponGroupWeapon_weapon_name_idx" ON "RuleWeaponGroupWeapon"("weapon_name");

-- AddForeignKey
ALTER TABLE "RuleWeaponGroup" ADD CONSTRAINT "RuleWeaponGroup_parent_group_id_fkey"
FOREIGN KEY ("parent_group_id") REFERENCES "RuleWeaponGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleWeaponGroupWeapon" ADD CONSTRAINT "RuleWeaponGroupWeapon_group_id_fkey"
FOREIGN KEY ("group_id") REFERENCES "RuleWeaponGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
