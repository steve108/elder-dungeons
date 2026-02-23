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

const namespace = "attribute-detail";

const labelsPt = {
  scoreLabel: "Faixa",
  scoreMin: "Mínimo",
  scoreMax: "Máximo",
  baseScore: "Base",
  exceptionalMin: "Excepcional Min",
  exceptionalMax: "Excepcional Max",
  attackAdjustment: "Ajuste de Ataque",
  damageAdjustment: "Ajuste de Dano",
  maxPress: "Press Máximo",
  openDoors: "Abrir Portas",
  openDoorsLocked: "Portas mágicas",
  bendBarsLiftGatesPercent: "Entortar/Erguer (%)",
  weightAllowance: "Carga",
  systemShockPercent: "Choque Sistêmico (%)",
  poisonSaveModifier: "Teste vs Veneno",
  hitPointAdjustmentBase: "PV (Base)",
  hitPointAdjustmentWarrior: "PV (Guerreiro)",
  minimumHitDieResult: "Dado de Vida Mínimo",
  resurrectionChancePercent: "Ressurreição (%)",
  missileAdjustment: "Ajuste de Míssil",
  pickPocketsPercent: "Punga (%)",
  openLocksPercent: "Abrir Fechaduras (%)",
  reactionAdjustment: "Ajuste de Reação",
  defensiveAdjustment: "Ajuste Defensivo",
  moveSilentlyPercent: "Mover-se em Silêncio (%)",
  climbWallsPercent: "Escalar Paredes (%)",
  bonusSpellsText: "Magias Bônus",
  spellFailurePercent: "Falha de Magia (%)",
  magicDefenseAdjustment: "Defesa Mágica",
  spellImmunityLevel: "Imunidade de Magia",
  maxWizardSpellLevel: "Nível Máx de Magia",
  maxSpellsPerLevel: "Magias Máx por Nível",
  allSpellsPerLevel: "Todas as Magias por Nível",
  bonusProficiencies: "Proficiências Bônus",
  learnSpellPercent: "Aprender Magia (%)",
  loyaltyBase: "Lealdade Base",
  maxHenchmen: "Máx. Aliados",
};

const labelsEn = {
  scoreLabel: "Range",
  scoreMin: "Minimum",
  scoreMax: "Maximum",
  baseScore: "Base",
  attackAdjustment: "Attack Adjustment",
  damageAdjustment: "Damage Adjustment",
  maxPress: "Maximum Press",
  openDoors: "Open Doors",
  openDoorsLocked: "Magic doors",
  bendBarsLiftGatesPercent: "Bend/Lift (%)",
  weightAllowance: "Carry Allowance",
  systemShockPercent: "System Shock (%)",
  poisonSaveModifier: "Poison Save Modifier",
  hitPointAdjustmentBase: "HP Adjustment (Base)",
  hitPointAdjustmentWarrior: "HP Adjustment (Warrior)",
  minimumHitDieResult: "Minimum Hit Die",
  resurrectionChancePercent: "Resurrection Chance (%)",
  missileAdjustment: "Missile Adjustment",
  pickPocketsPercent: "Pick Pockets (%)",
  openLocksPercent: "Open Locks (%)",
  reactionAdjustment: "Reaction Adjustment",
  defensiveAdjustment: "Defensive Adjustment",
  moveSilentlyPercent: "Move Silently (%)",
  climbWallsPercent: "Climb Walls (%)",
  bonusSpellsText: "Bonus Spells",
  spellFailurePercent: "Spell Failure (%)",
  magicDefenseAdjustment: "Magic Defense",
  spellImmunityLevel: "Spell Immunity",
  maxWizardSpellLevel: "Max Wizard Spell Level",
  maxSpellsPerLevel: "Max Spells per Level",
  allSpellsPerLevel: "All Spells per Level",
  bonusProficiencies: "Bonus Proficiencies",
  learnSpellPercent: "Learn Spell (%)",
  loyaltyBase: "Base Loyalty",
  maxHenchmen: "Max Henchmen",
};

const explanationsPt = {
  scoreLabel: "Faixa de valor usada para localizar os efeitos daquele subatributo.",
  scoreMin: "Valor mínimo da faixa de pontuação considerada.",
  scoreMax: "Valor máximo da faixa de pontuação considerada.",
  baseScore: "Valor-base de referência para aplicar os efeitos da linha.",
  attackAdjustment: "Modificador aplicado às jogadas de ataque.",
  damageAdjustment: "Modificador aplicado ao dano causado em ataques.",
  reactionAdjustment: "Modificador nas reações de NPCs e situações de iniciativa social.",
  defensiveAdjustment: "Ajuste defensivo que dificulta ou facilita ser atingido.",
  missileAdjustment: "Modificador para acertos com armas de ataque à distância.",
  magicDefenseAdjustment: "Bônus de resistência contra efeitos mágicos hostis.",
  maxWizardSpellLevel: "Maior nível de magia arcana que o personagem pode aprender/usar.",
  maxSpellsPerLevel: "Quantidade máxima de magias memorizáveis por nível.",
  bonusSpellsText: "Magias bônus concedidas por alto valor do subatributo.",
  bonusProficiencies: "Número extra de proficiências recebidas.",
  learnSpellPercent: "Chance percentual de aprender novas magias.",
  weightAllowance: "Capacidade de carga sem penalidades adicionais.",
  systemShockPercent: "Chance de suportar choques físicos e efeitos traumáticos.",
  poisonSaveModifier: "Ajuste no teste de resistência contra venenos.",
  hitPointAdjustmentBase: "Bônus ou penalidade de pontos de vida para classes gerais.",
  hitPointAdjustmentWarrior: "Bônus ou penalidade de pontos de vida para classes guerreiras.",
  minimumHitDieResult: "Resultado mínimo considerado na rolagem de dado de vida.",
  resurrectionChancePercent: "Chance de retorno bem-sucedido em efeitos de ressurreição.",
  pickPocketsPercent: "Chance percentual de sucesso para furtar bolsos.",
  openLocksPercent: "Chance percentual de abrir fechaduras.",
  moveSilentlyPercent: "Chance percentual de se mover em silêncio.",
  climbWallsPercent: "Chance percentual de escalar superfícies verticais.",
  openDoors: "Capacidade de forçar a abertura de portas comuns.",
  openDoorsLocked: "Capacidade de forçar abertura de portas mágicas ou resistentes.",
  bendBarsLiftGatesPercent: "Chance percentual de entortar barras ou erguer portões.",
  maxPress: "Peso máximo que pode ser erguido em esforço extremo.",
  spellFailurePercent: "Chance percentual de falha ao lançar magias sacerdotais.",
  spellImmunityLevel: "Nível de magia contra o qual o personagem pode obter imunidade.",
  loyaltyBase: "Base de lealdade de seguidores e aliados sob comando.",
  maxHenchmen: "Quantidade máxima de seguidores próximos sob liderança.",
};

const explanationsEn = {
  scoreLabel: "Value range used to locate the effects for this subattribute.",
  scoreMin: "Minimum value considered in this score range.",
  scoreMax: "Maximum value considered in this score range.",
  baseScore: "Base reference score for applying this row's effects.",
  attackAdjustment: "Modifier applied to attack rolls.",
  damageAdjustment: "Modifier applied to damage rolls.",
  reactionAdjustment: "Modifier affecting NPC/social reaction outcomes.",
  defensiveAdjustment: "Defensive modifier that affects how easily you are hit.",
  missileAdjustment: "Modifier for ranged attack accuracy.",
  magicDefenseAdjustment: "Defense bonus against hostile magical effects.",
  maxWizardSpellLevel: "Highest arcane spell level the character can learn/use.",
  maxSpellsPerLevel: "Maximum number of spells known/memorized per level.",
  bonusSpellsText: "Bonus spells granted by high subattribute values.",
  bonusProficiencies: "Additional proficiency slots granted.",
  learnSpellPercent: "Percent chance to learn a new spell.",
  weightAllowance: "Carrying capacity before extra penalties apply.",
  systemShockPercent: "Chance to survive trauma and severe bodily shock.",
  poisonSaveModifier: "Modifier to saving throws against poison.",
  hitPointAdjustmentBase: "Hit point bonus/penalty for most classes.",
  hitPointAdjustmentWarrior: "Hit point bonus/penalty for warrior classes.",
  minimumHitDieResult: "Minimum effective result when rolling hit dice.",
  resurrectionChancePercent: "Chance to survive resurrection effects.",
  pickPocketsPercent: "Percent chance to successfully pick pockets.",
  openLocksPercent: "Percent chance to successfully open locks.",
  moveSilentlyPercent: "Percent chance to move silently.",
  climbWallsPercent: "Percent chance to climb walls and vertical surfaces.",
  openDoors: "Ability to force open normal doors.",
  openDoorsLocked: "Ability to force open magical or specially resistant doors.",
  bendBarsLiftGatesPercent: "Percent chance to bend bars or lift gates.",
  maxPress: "Maximum weight that can be pressed in extreme effort.",
  spellFailurePercent: "Percent chance of priest spell failure.",
  spellImmunityLevel: "Spell level threshold where immunity may apply.",
  loyaltyBase: "Base loyalty score for followers and allies.",
  maxHenchmen: "Maximum number of close followers under leadership.",
};

const uiStringsPt = {
  "ui.attributesAndDerived": "Atributos e detalhes",
  "ui.backToAttributes": "Voltar para Atributos",
  "ui.index": "Índice",
  "ui.subattributes": "Subatributos",
  "ui.subattributeItemDetails": "Detalhes dos itens do subatributo",
  "ui.booleanTrue": "Sim",
  "ui.booleanFalse": "Não",
  "ui.explanationFallback": "Indicador mecânico usado para definir efeitos deste subatributo nas regras.",
};

const uiStringsEn = {
  "ui.attributesAndDerived": "Attributes and details",
  "ui.backToAttributes": "Back to Attributes",
  "ui.index": "Index",
  "ui.subattributes": "Subattributes",
  "ui.subattributeItemDetails": "Subattribute item details",
  "ui.booleanTrue": "Yes",
  "ui.booleanFalse": "No",
  "ui.explanationFallback": "Mechanical indicator used to determine this subattribute's rule effects.",
};

function buildRows(locale, labels, explanations, uiStrings) {
  const rows = [];

  for (const [key, text] of Object.entries(labels)) {
    rows.push({ namespace, key: `label.${key}`, locale, text });
  }

  for (const [key, text] of Object.entries(explanations)) {
    rows.push({ namespace, key: `explain.${key}`, locale, text });
  }

  for (const [key, text] of Object.entries(uiStrings)) {
    rows.push({ namespace, key, locale, text });
  }

  return rows;
}

async function seedUiTexts() {
  const rows = [
    ...buildRows("pt", labelsPt, explanationsPt, uiStringsPt),
    ...buildRows("en", labelsEn, explanationsEn, uiStringsEn),
  ];

  let upserts = 0;

  for (const row of rows) {
    await prisma.$executeRawUnsafe(
      `
      INSERT INTO "UiTextTranslation" ("namespace", "key", "locale", "text")
      VALUES ($1, $2, $3, $4)
      ON CONFLICT ("namespace", "key", "locale")
      DO UPDATE SET
        "text" = EXCLUDED."text",
        "updated_at" = CURRENT_TIMESTAMP
      `,
      row.namespace,
      row.key,
      row.locale,
      row.text,
    );

    upserts += 1;
  }

  return { upserts };
}

async function main() {
  const result = await seedUiTexts();
  console.log(`Seed UI texts concluído. Upserts: ${result.upserts}.`);
}

main()
  .catch((error) => {
    console.error("Erro no seed de textos UI:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
