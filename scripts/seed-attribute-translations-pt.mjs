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

const attributeContentPt = {
  STRENGTH: {
    name: "Força",
    description: "Força representa potência física, impacto em combate corporal e capacidade de esforço bruto.",
    fullDescription:
      "A Força define o quanto o personagem domina ações físicas intensas, como causar dano em combate corpo a corpo, forçar passagens e sustentar esforço de carga em situações críticas.",
  },
  CONSTITUTION: {
    name: "Constituição",
    description: "Constituição mede resistência orgânica, vigor e tolerância a desgaste físico.",
    fullDescription:
      "A Constituição determina a robustez do personagem diante de veneno, fadiga, trauma e longos períodos de pressão física, influenciando sua sobrevivência ao longo da aventura.",
  },
  DEXTERITY: {
    name: "Destreza",
    description: "Destreza expressa coordenação, precisão, agilidade e controle de movimento.",
    fullDescription:
      "A Destreza governa a eficiência do personagem em ações que exigem mira, reflexo e equilíbrio, afetando desempenho ofensivo à distância e segurança defensiva.",
  },
  WISDOM: {
    name: "Sabedoria",
    description: "Sabedoria reflete percepção prática, intuição e firmeza mental.",
    fullDescription:
      "A Sabedoria orienta decisões prudentes, leitura de risco e resistência a influências externas, funcionando como base de discernimento em situações complexas.",
  },
  INTELLIGENCE: {
    name: "Inteligência",
    description: "Inteligência representa raciocínio, aprendizado e profundidade de conhecimento.",
    fullDescription:
      "A Inteligência mede a capacidade de compreender sistemas complexos, absorver estudo técnico e expandir repertório teórico, inclusive em contextos arcanos.",
  },
  CHARISMA: {
    name: "Carisma",
    description: "Carisma define presença social, influência e poder de liderança.",
    fullDescription:
      "O Carisma afeta a forma como o personagem é percebido, sua habilidade de convencer e coordenar aliados, e a força de sua autoridade em relações sociais.",
  },
};

const subAttributeContentPt = {
  Muscle: {
    name: "Musculatura",
    description: "Subatributo de força explosiva para impacto físico e dano corpo a corpo.",
    fullDescription:
      "Musculatura representa a potência imediata aplicada em ataques e ações de força bruta, destacando capacidade de impacto em curto prazo.",
  },
  Health: {
    name: "Saúde",
    description: "Subatributo ligado à estabilidade corporal e resistência a choques fisiológicos.",
    fullDescription:
      "Saúde expressa a capacidade do corpo de suportar estresse orgânico severo, efeitos nocivos e testes ligados à integridade física.",
  },
  Fitness: {
    name: "Condicionamento",
    description: "Subatributo de resistência contínua e sustentação física ao longo do tempo.",
    fullDescription:
      "Condicionamento representa preparo físico para manter desempenho sob desgaste, influenciando durabilidade em combates e jornadas longas.",
  },
  Aim: {
    name: "Mira",
    description: "Subatributo de precisão em ataques direcionados, especialmente à distância.",
    fullDescription:
      "Mira mede o controle fino de pontaria e acerto técnico em ações ofensivas que exigem exatidão.",
  },
  Balance: {
    name: "Equilíbrio",
    description: "Subatributo de controle corporal, estabilidade e resposta defensiva.",
    fullDescription:
      "Equilíbrio reflete agilidade defensiva e domínio de movimento em terreno adverso ou sob pressão de combate.",
  },
  Intuition: {
    name: "Intuição",
    description: "Subatributo de percepção situacional e leitura instintiva de risco.",
    fullDescription:
      "Intuição sintetiza sensibilidade prática ao contexto, antecipando ameaças e avaliando cenários com rapidez.",
  },
  Willpower: {
    name: "Força de Vontade",
    description: "Subatributo de resistência mental contra medo, compulsão e influência externa.",
    fullDescription:
      "Força de Vontade mede a firmeza psicológica do personagem para manter controle diante de pressão emocional ou mágica.",
  },
  Reason: {
    name: "Raciocínio",
    description: "Subatributo de análise lógica e solução estruturada de problemas.",
    fullDescription:
      "Raciocínio representa pensamento metódico, interpretação técnica e capacidade de construir respostas consistentes.",
  },
  Knowledge: {
    name: "Conhecimento",
    description: "Subatributo de repertório aprendido, memória e estudo acumulado.",
    fullDescription:
      "Conhecimento expressa profundidade de informação adquirida e facilidade de ampliar domínio teórico em novas áreas.",
  },
  Appearance: {
    name: "Aparência",
    description: "Subatributo de impressão visual e impacto social imediato.",
    fullDescription:
      "Aparência influencia a recepção inicial do personagem em interações sociais, antes de negociação mais profunda.",
  },
  Leadership: {
    name: "Liderança",
    description: "Subatributo de comando, coordenação de grupo e construção de lealdade.",
    fullDescription:
      "Liderança reflete a capacidade de organizar aliados, inspirar confiança e manter coesão em decisões coletivas.",
  },
  Stamina: {
    name: "Vigor",
    description: "Subatributo de fôlego e eficiência para manter esforço prolongado.",
    fullDescription:
      "Vigor mede a autonomia física em atividades longas, carga contínua e manutenção de performance sob exaustão progressiva.",
  },
};

async function seedAttributeTranslationsPt() {
  const attributes = await prisma.$queryRawUnsafe(
    'SELECT "id", "name", "description", "full_description" FROM "AttributeDefinition" ORDER BY "id" ASC'
  );

  let attributeUpserts = 0;

  for (const attribute of attributes) {
    const content = attributeContentPt[attribute.name];
    if (!content) continue;

    await prisma.$executeRawUnsafe(
      `
      INSERT INTO "AttributeDefinitionTranslation" ("attribute_id", "locale", "name", "description", "full_description")
      VALUES ($1, 'pt', $2, $3, $4)
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
    'SELECT "id", "name", "description", "full_description" FROM "SubAttributeDefinition" ORDER BY "id" ASC'
  );

  let subAttributeUpserts = 0;

  for (const subAttribute of subAttributes) {
    const content = subAttributeContentPt[subAttribute.name];
    if (!content) continue;

    await prisma.$executeRawUnsafe(
      `
      INSERT INTO "SubAttributeDefinitionTranslation" ("sub_attribute_id", "locale", "name", "description", "full_description")
      VALUES ($1, 'pt', $2, $3, $4)
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
  const result = await seedAttributeTranslationsPt();
  console.log(
    `Seed PT concluído. AttributeDefinition: ${result.attributeUpserts} upserts. SubAttributeDefinition: ${result.subAttributeUpserts} upserts.`
  );
}

main()
  .catch((error) => {
    console.error("Erro no seed de traduções PT:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
