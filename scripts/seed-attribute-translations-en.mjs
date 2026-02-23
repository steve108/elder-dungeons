import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL não configurada no ambiente.");
}

const rejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "true";
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized,
  },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const attributeDescriptionsEn = {
  STRENGTH: {
    name: "Strength",
    description: "Strength measures physical power, impact potential, and performance in feats of force.",
    fullDescription:
      "Strength defines how effectively a character applies raw physical force in combat, lifting, forcing doors, and other power-based actions.",
  },
  CONSTITUTION: {
    name: "Constitution",
    description: "Constitution represents physical endurance, overall health, and resilience under stress.",
    fullDescription:
      "Constitution governs stamina, resistance to poison and trauma, and the character's ability to withstand sustained hardship.",
  },
  DEXTERITY: {
    name: "Dexterity",
    description: "Dexterity defines precision, coordination, reaction time, and movement control.",
    fullDescription:
      "Dexterity influences accuracy, evasive movement, and fine motor control in both combat and non-combat tasks.",
  },
  WISDOM: {
    name: "Wisdom",
    description: "Wisdom expresses perception, intuition, mental fortitude, and practical judgment.",
    fullDescription:
      "Wisdom represents awareness, common sense, and inner resolve used to interpret danger, resist influence, and make prudent choices.",
  },
  INTELLIGENCE: {
    name: "Intelligence",
    description: "Intelligence reflects reasoning, learning capacity, memory, and technical understanding.",
    fullDescription:
      "Intelligence determines analytical ability, knowledge acquisition, and mastery of complex information and magical learning.",
  },
  CHARISMA: {
    name: "Charisma",
    description: "Charisma measures presence, social influence, and leadership potential.",
    fullDescription:
      "Charisma affects first impressions, persuasion, command presence, and the ability to inspire loyalty in others.",
  },
};

const subAttributeDescriptionsEn = {
  Muscle: {
    name: "Muscle",
    description: "Defines applied physical force in melee attacks and power-based feats.",
    fullDescription: "Muscle controls attack and damage adjustments tied to raw physical power.",
  },
  Stamina: {
    name: "Stamina",
    description: "Represents sustained endurance and carrying capacity over time.",
    fullDescription: "Stamina determines how much effort and load a character can sustain before performance drops.",
  },
  Health: {
    name: "Health",
    description: "Relates to bodily stability and resistance to shock and harmful effects.",
    fullDescription: "Health affects shock survival, poison resistance, and other body resilience checks.",
  },
  Fitness: {
    name: "Fitness",
    description: "Shows conditioning to absorb damage, fatigue, and sustained pressure.",
    fullDescription: "Fitness impacts hit point adjustments and durability over long adventures.",
  },
  Aim: {
    name: "Aim",
    description: "Measures precision in attacks, especially ranged and targeting actions.",
    fullDescription: "Aim drives missile attack modifiers and other precision-based combat outcomes.",
  },
  Balance: {
    name: "Balance",
    description: "Reflects body control, agility, and defensive movement quality.",
    fullDescription: "Balance influences defensive adjustments, movement control, and stability under pressure.",
  },
  Intuition: {
    name: "Intuition",
    description: "Covers situational awareness, instinct, and risk perception.",
    fullDescription: "Intuition helps with practical perception, reading situations, and early danger assessment.",
  },
  Willpower: {
    name: "Willpower",
    description: "Indicates mental resolve against fear, compulsion, and hostile magic.",
    fullDescription: "Willpower measures mental resistance to manipulation, panic, and coercive effects.",
  },
  Reason: {
    name: "Reason",
    description: "Represents logical analysis and problem-solving capability.",
    fullDescription: "Reason governs structured thinking, deduction, and technical understanding.",
  },
  Knowledge: {
    name: "Knowledge",
    description: "Expresses learned repertoire and ability to acquire new information.",
    fullDescription: "Knowledge tracks study depth, memory, and learning effectiveness for complex topics.",
  },
  Appearance: {
    name: "Appearance",
    description: "Affects first impressions and social reaction to your presence.",
    fullDescription: "Appearance shapes immediate social perception before deeper interaction occurs.",
  },
  Leadership: {
    name: "Leadership",
    description: "Measures command, loyalty building, and group coordination.",
    fullDescription: "Leadership defines how effectively a character directs allies and maintains follower loyalty.",
  },
};

async function seedAttributeTranslationsEn() {
  const attributes = await prisma.$queryRawUnsafe(
    'SELECT "id", "name" FROM "AttributeDefinition" ORDER BY "id" ASC'
  );

  let attributeUpserts = 0;

  for (const attribute of attributes) {
    const content = attributeDescriptionsEn[attribute.name];
    if (!content) continue;

    await prisma.$executeRawUnsafe(
      `
      INSERT INTO "AttributeDefinitionTranslation" ("attribute_id", "locale", "name", "description", "full_description")
      VALUES ($1, 'en', $2, $3, $4)
      ON CONFLICT ("attribute_id", "locale")
      DO UPDATE SET
        "name" = EXCLUDED."name",
        "description" = EXCLUDED."description",
        "full_description" = EXCLUDED."full_description",
        "updated_at" = CURRENT_TIMESTAMP
      `,
      attribute.id,
      content.name,
      content.description,
      content.fullDescription
    );

    attributeUpserts += 1;
  }

  const subAttributes = await prisma.$queryRawUnsafe(
    'SELECT "id", "name" FROM "SubAttributeDefinition" ORDER BY "id" ASC'
  );

  let subAttributeUpserts = 0;

  for (const subAttribute of subAttributes) {
    const content = subAttributeDescriptionsEn[subAttribute.name];
    if (!content) continue;

    await prisma.$executeRawUnsafe(
      `
      INSERT INTO "SubAttributeDefinitionTranslation" ("sub_attribute_id", "locale", "name", "description", "full_description")
      VALUES ($1, 'en', $2, $3, $4)
      ON CONFLICT ("sub_attribute_id", "locale")
      DO UPDATE SET
        "name" = EXCLUDED."name",
        "description" = EXCLUDED."description",
        "full_description" = EXCLUDED."full_description",
        "updated_at" = CURRENT_TIMESTAMP
      `,
      subAttribute.id,
      content.name,
      content.description,
      content.fullDescription
    );

    subAttributeUpserts += 1;
  }

  return {
    attributeUpserts,
    subAttributeUpserts,
  };
}

async function main() {
  const result = await seedAttributeTranslationsEn();
  console.log(
    `Seed EN concluído. AttributeDefinition: ${result.attributeUpserts} upserts. SubAttributeDefinition: ${result.subAttributeUpserts} upserts.`
  );
}

main()
  .catch((error) => {
    console.error("Erro no seed de traduções EN:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
