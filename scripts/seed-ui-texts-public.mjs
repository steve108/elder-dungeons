import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL não configurada no ambiente.");

const rejectUnauthorized = process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === "true";
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const rows = [
  ["public-shell", "badge", "pt", "Guia Público"],
  ["public-shell", "badge", "en", "Public Guide"],
  ["public-shell", "admin", "pt", "Admin"],
  ["public-shell", "admin", "en", "Admin"],
  ["public-shell", "sections", "pt", "Seções"],
  ["public-shell", "sections", "en", "Sections"],
  ["public-shell", "nav.home", "pt", "Home"],
  ["public-shell", "nav.home", "en", "Home"],
  ["public-shell", "nav.attributes", "pt", "Atributos"],
  ["public-shell", "nav.attributes", "en", "Attributes"],
  ["public-shell", "nav.race", "pt", "Raças"],
  ["public-shell", "nav.race", "en", "Races"],
  ["public-shell", "nav.class", "pt", "Class"],
  ["public-shell", "nav.class", "en", "Class"],
  ["public-shell", "nav.kit", "pt", "Kit"],
  ["public-shell", "nav.kit", "en", "Kit"],
  ["public-shell", "nav.traits", "pt", "Traits"],
  ["public-shell", "nav.traits", "en", "Traits"],
  ["public-shell", "nav.nwp", "pt", "Non Weapon Proficience"],
  ["public-shell", "nav.nwp", "en", "Non Weapon Proficiency"],
  ["public-shell", "nav.wp", "pt", "Weapon Proficience"],
  ["public-shell", "nav.wp", "en", "Weapon Proficiency"],
  ["public-shell", "nav.equips", "pt", "Equips"],
  ["public-shell", "nav.equips", "en", "Equipment"],
  ["public-shell", "nav.spells", "pt", "Spells"],
  ["public-shell", "nav.spells", "en", "Spells"],

  ["home", "badge", "pt", "Player's Option · Skills & Powers"],
  ["home", "badge", "en", "Player's Option · Skills & Powers"],
  ["home", "title", "pt", "Elder Dungeons"],
  ["home", "title", "en", "Elder Dungeons"],
  ["home", "intro", "pt", "Uma enciclopédia pública de regras do Elder Dungeons, feita para ajudar jogadores a entender criação e evolução de personagem de forma prática e clara."],
  ["home", "intro", "en", "A public rules encyclopedia for Elder Dungeons, designed to help players understand character creation and progression in a practical, easy-to-read format."],
  ["home", "sectionTitle", "pt", "O que você encontra aqui"],
  ["home", "sectionTitle", "en", "What you find here"],
  ["home", "sectionText", "pt", "O site organiza as regras por tema: atributos e detalhes, raças, classes, kits, proficiências, equipamentos e magias. Cada página explica o impacto mecânico de forma direta para apoiar decisões durante a criação do personagem."],
  ["home", "sectionText", "en", "The site organizes game rules by topic: attributes and derived values, races, classes, kits, proficiencies, equipment, and spells. Each page explains mechanical impact clearly, so you can make better decisions while building your character."],
  ["home", "useTitle", "pt", "Como usar"],
  ["home", "useTitle", "en", "How to use"],
  ["home", "useText", "pt", "Use o menu lateral esquerdo para navegar por assunto e altere o idioma no seletor do cabeçalho quando quiser."],
  ["home", "useText", "en", "Use the left menu to navigate by subject and switch language in the header selection box any time."],
  ["home", "cta", "pt", "Começar por Atributos"],
  ["home", "cta", "en", "Start with Attributes"],

  ["index", "title", "pt", "Índice"],
  ["index", "title", "en", "Index"],
  ["index", "description", "pt", "Escolha um tema para entender as regras e opções disponíveis na criação e evolução do personagem."],
  ["index", "description", "en", "Choose a topic to understand rules and options for character creation and progression."],
  ["index", "badge", "pt", "Navegação pública"],
  ["index", "badge", "en", "Public navigation"],
  ["index", "viewDetails", "pt", "Ver detalhes"],
  ["index", "viewDetails", "en", "View details"],
  ["index", "soon", "pt", "Em breve: páginas de detalhe completas para cada tópico, com navegação dedicada."],
  ["index", "soon", "en", "Soon: full detail pages for each topic, with dedicated navigation."],
  ["index", "section.attributes.title", "pt", "Atributos"],
  ["index", "section.attributes.title", "en", "Attributes"],
  ["index", "section.attributes.status", "pt", "Pronto"],
  ["index", "section.attributes.status", "en", "Ready"],
  ["index", "section.attributes.note", "pt", "Aqui você entende os atributos principais do personagem e como eles influenciam testes, combate e interações."],
  ["index", "section.attributes.note", "en", "Understand core character attributes and how they affect tests, combat, and interactions."],
  ["index", "section.race.title", "pt", "Raças"],
  ["index", "section.race.title", "en", "Races"],
  ["index", "section.race.status", "pt", "Pronto"],
  ["index", "section.race.status", "en", "Ready"],
  ["index", "section.race.note", "pt", "Mostra as raças e subraças disponíveis, com seus traços, vantagens naturais e impacto na criação do personagem."],
  ["index", "section.race.note", "en", "Shows available races and subraces, including traits and how they shape character creation."],
  ["index", "section.class.title", "pt", "Class"],
  ["index", "section.class.title", "en", "Class"],
  ["index", "section.class.status", "pt", "Pronto"],
  ["index", "section.class.status", "en", "Ready"],
  ["index", "section.class.note", "pt", "Explica o papel de cada classe, suas capacidades, limitações e estilo de jogo."],
  ["index", "section.class.note", "en", "Explains each class role, strengths, limits, and play style."],
  ["index", "section.kit.title", "pt", "Kit"],
  ["index", "section.kit.title", "en", "Kit"],
  ["index", "section.kit.status", "pt", "Pronto"],
  ["index", "section.kit.status", "en", "Ready"],
  ["index", "section.kit.note", "pt", "Kits são especializações dentro das classes, trazendo identidade, bônus e restrições para o personagem."],
  ["index", "section.kit.note", "en", "Kits are class specializations that add identity, perks, and trade-offs."],
  ["index", "section.traits.title", "pt", "Traits"],
  ["index", "section.traits.title", "en", "Traits"],
  ["index", "section.traits.status", "pt", "Pronto"],
  ["index", "section.traits.status", "en", "Ready"],
  ["index", "section.traits.note", "pt", "Apresenta vantagens e desvantagens para personalizar o personagem, equilibrando pontos fortes e fraquezas."],
  ["index", "section.traits.note", "en", "Traits and disadvantages help customize your character's strengths and weaknesses."],
  ["index", "section.nwp.title", "pt", "Non Weapon Proficience"],
  ["index", "section.nwp.title", "en", "Non Weapon Proficiency"],
  ["index", "section.nwp.status", "pt", "Pronto"],
  ["index", "section.nwp.status", "en", "Ready"],
  ["index", "section.nwp.note", "pt", "Reúne perícias não ligadas a combate, úteis para exploração, conhecimento, interação social e sobrevivência."],
  ["index", "section.nwp.note", "en", "Non-combat proficiencies for exploration, knowledge, social scenes, and survival."],
  ["index", "section.wp.title", "pt", "Weapon Proficience"],
  ["index", "section.wp.title", "en", "Weapon Proficiency"],
  ["index", "section.wp.status", "pt", "Pronto"],
  ["index", "section.wp.status", "en", "Ready"],
  ["index", "section.wp.note", "pt", "Mostra proficiências de armas, estilos de luta e níveis de especialização para definir como seu personagem combate."],
  ["index", "section.wp.note", "en", "Weapon proficiencies, fighting styles, and specialization levels that define combat approach."],
  ["index", "section.equips.title", "pt", "Equips"],
  ["index", "section.equips.title", "en", "Equipment"],
  ["index", "section.equips.status", "pt", "Pronto"],
  ["index", "section.equips.status", "en", "Ready"],
  ["index", "section.equips.note", "pt", "Catálogo de equipamentos para apoiar o personagem em aventura, combate, viagem e utilidade no dia a dia."],
  ["index", "section.equips.note", "en", "Equipment catalog to support adventure, combat, travel, and day-to-day utility."],
  ["index", "section.spells.title", "pt", "Spells"],
  ["index", "section.spells.title", "en", "Spells"],
  ["index", "section.spells.status", "pt", "Em evolução"],
  ["index", "section.spells.status", "en", "In progress"],
  ["index", "section.spells.note", "pt", "Área de magias em expansão, com descrição dos efeitos e uso prático para jogo."],
  ["index", "section.spells.note", "en", "Spells area in progress, with practical spell effect descriptions."],

  ["attributes-list", "title", "pt", "Atributos"],
  ["attributes-list", "title", "en", "Attributes"],
  ["attributes-list", "description", "pt", "Os atributos representam as capacidades básicas do personagem. Cada um possui subatributos que detalham efeitos práticos em combate, resistência, perícias, magia e interações."],
  ["attributes-list", "description", "en", "Attributes represent your character's core capabilities. Each one has derived subattributes that detail practical effects in combat, resilience, skills, magic, and interactions."],
  ["attributes-list", "badge", "pt", "Criação de personagem"],
  ["attributes-list", "badge", "en", "Character creation"],
  ["attributes-list", "openDerived", "pt", "Abrir detalhes"],
  ["attributes-list", "openDerived", "en", "Open details"],
  ["attributes-list", "subattributes", "pt", "Subatributos"],
  ["attributes-list", "subattributes", "en", "Subattributes"],
  ["attributes-list", "fallbackAttributeDesc", "pt", "Este atributo define parte central do desempenho do personagem."],
  ["attributes-list", "fallbackAttributeDesc", "en", "This attribute defines a core part of character performance."],

  ["races-list", "title", "pt", "Raças"],
  ["races-list", "title", "en", "Races"],
  ["races-list", "description", "pt", "Explore cada raça e subraça com referência visual e detalhes práticos para criação de personagem."],
  ["races-list", "description", "en", "Explore each race and subrace with visual references and practical character creation details."],
  ["races-list", "badge", "pt", "Opções de personagem"],
  ["races-list", "badge", "en", "Character options"],
  ["races-list", "subraces", "pt", "Subraças"],
  ["races-list", "subraces", "en", "Subraces"],
  ["races-list", "cpCost", "pt", "Custo em CP"],
  ["races-list", "cpCost", "en", "CP Cost"],
  ["races-list", "fallbackRaceDesc", "pt", "Raça base com identidade própria e impacto na progressão do personagem."],
  ["races-list", "fallbackRaceDesc", "en", "Core race with unique identity and progression impact."],
  ["races-list", "fallbackSubraceDesc", "pt", "Variação de subraça com traços próprios e escolhas de estilo de jogo."],
  ["races-list", "fallbackSubraceDesc", "en", "Subrace variation with specific traits and playstyle trade-offs."],
  ["races-list", "backToAttributes", "pt", "Voltar para Atributos"],
  ["races-list", "backToAttributes", "en", "Back to Attributes"],
];

async function main() {
  let upserts = 0;
  for (const [namespace, key, locale, text] of rows) {
    await prisma.$executeRawUnsafe(
      `
      INSERT INTO "UiTextTranslation" ("namespace", "key", "locale", "text")
      VALUES ($1, $2, $3, $4)
      ON CONFLICT ("namespace", "key", "locale")
      DO UPDATE SET
        "text" = EXCLUDED."text",
        "updated_at" = CURRENT_TIMESTAMP
      `,
      namespace,
      key,
      locale,
      text,
    );
    upserts += 1;
  }

  console.log(`Seed UI texts públicos concluído. Upserts: ${upserts}.`);
}

main()
  .catch((error) => {
    console.error("Erro no seed de UI pública:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
