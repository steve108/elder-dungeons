import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getLocaleFromSearchParams, withLang } from "@/lib/i18n";
import { PublicShell } from "@/components/public-shell";

type CoreAttr = "STRENGTH" | "CONSTITUTION" | "DEXTERITY" | "WISDOM" | "INTELLIGENCE" | "CHARISMA";

type RowRecord = Record<string, string | number | boolean | null | undefined>;

type AttributeDetail = {
  id: number;
  name: CoreAttr;
  description: string | null;
  fullDescription?: string | null;
  translations?: Array<{
    locale: string;
    name?: string | null;
    description: string | null;
    fullDescription?: string | null;
  }>;
  subAttributes: Array<{
    id: number;
    name: string;
    description: string | null;
    fullDescription?: string | null;
    translations?: Array<{
      locale: string;
      name?: string | null;
      description: string | null;
      fullDescription?: string | null;
    }>;
  }>;
};

function pickLocalizedText(
  baseName: string,
  baseDescription: string | null | undefined,
  baseFullDescription: string | null | undefined,
  translations: Array<{ locale: string; name?: string | null; description: string | null; fullDescription?: string | null }> | undefined,
  locale: "pt" | "en"
) {
  const exact = translations?.find((item) => item.locale === locale);
  const pt = translations?.find((item) => item.locale === "pt");
  const name = exact?.name ?? pt?.name ?? baseName;
  const description = exact?.description ?? pt?.description ?? baseDescription ?? null;
  const fullDescription = exact?.fullDescription ?? pt?.fullDescription ?? baseFullDescription ?? null;
  return { name, description, fullDescription };
}

type UiTextMap = Map<string, string>;

const defaultLabelPt: Record<string, string> = {
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

const defaultLabelEn: Record<string, string> = {
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

const defaultExplanationPt: Record<string, string> = {
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

const defaultExplanationEn: Record<string, string> = {
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

const slugToAttr: Record<string, CoreAttr> = {
  strength: "STRENGTH",
  constitution: "CONSTITUTION",
  dexterity: "DEXTERITY",
  wisdom: "WISDOM",
  intelligence: "INTELLIGENCE",
  charisma: "CHARISMA",
};

const attrLabel: Record<CoreAttr, string> = {
  STRENGTH: "Strength",
  CONSTITUTION: "Constitution",
  DEXTERITY: "Dexterity",
  WISDOM: "Wisdom",
  INTELLIGENCE: "Intelligence",
  CHARISMA: "Charisma",
};

const subAttrLabel: Record<string, string> = {
  Muscle: "Muscle",
  Stamina: "Stamina",
  Health: "Health",
  Fitness: "Fitness",
  Aim: "Aim",
  Balance: "Balance",
  Intuition: "Intuition",
  Willpower: "Willpower",
  Reason: "Reason",
  Knowledge: "Knowledge",
  Appearance: "Appearance",
  Leadership: "Leadership",
};

const attrFallbackDescription: Record<CoreAttr, string> = {
  STRENGTH: "Strength mede potência física, capacidade de causar impacto e eficiência em ações de força bruta.",
  CONSTITUTION: "Constitution representa resistência física, saúde geral e a capacidade de suportar desgaste e ferimentos.",
  DEXTERITY: "Dexterity define precisão, coordenação motora, tempo de reação e controle de movimento.",
  WISDOM: "Wisdom expressa percepção, intuição, força mental e sensibilidade para decisões prudentes.",
  INTELLIGENCE: "Intelligence reflete raciocínio, aprendizado, memória e domínio de conhecimentos complexos.",
  CHARISMA: "Charisma mede presença, influência social e capacidade de liderar, inspirar ou convencer outros.",
};

const attrFallbackDescriptionEn: Record<CoreAttr, string> = {
  STRENGTH: "Strength measures physical power, impact potential, and performance in feats of force.",
  CONSTITUTION: "Constitution represents physical endurance, overall health, and resilience under stress.",
  DEXTERITY: "Dexterity defines precision, coordination, reaction time, and movement control.",
  WISDOM: "Wisdom expresses perception, intuition, mental fortitude, and practical judgment.",
  INTELLIGENCE: "Intelligence reflects reasoning, learning capacity, memory, and technical understanding.",
  CHARISMA: "Charisma measures presence, social influence, and leadership potential.",
};

const subAttrFallbackDescription: Record<string, string> = {
  Muscle: "Define força aplicada em ataques corpo a corpo, esforço físico intenso e façanhas de potência.",
  Stamina: "Representa vigor físico contínuo, capacidade de carga e sustentação de esforço prolongado.",
  Health: "Relaciona-se à estabilidade corporal, resistência a choques e recuperação diante de efeitos agressivos.",
  Fitness: "Mostra condicionamento geral para suportar dano, fadiga e manter desempenho sob pressão.",
  Aim: "Mede precisão de golpes e disparos, afetando ataques à distância e ações de mira.",
  Balance: "Reflete controle corporal, agilidade defensiva e execução de movimentos com segurança.",
  Intuition: "Abrange percepção de contexto, sensibilidade a riscos e leitura de situações.",
  Willpower: "Indica firmeza mental para resistir a influências mágicas, medo e compulsões.",
  Reason: "Representa análise lógica, compreensão técnica e solução racional de problemas.",
  Knowledge: "Expressa repertório adquirido, estudo e facilidade de aprender novos conteúdos.",
  Appearance: "Afeta primeira impressão e reações sociais baseadas em presença e imagem.",
  Leadership: "Mede capacidade de coordenar aliados, conquistar lealdade e manter autoridade.",
};

const subAttrFallbackDescriptionEn: Record<string, string> = {
  Muscle: "Defines applied physical force in melee attacks and power-based feats.",
  Stamina: "Represents sustained endurance and carrying capacity over time.",
  Health: "Relates to bodily stability and resistance to shock and harmful effects.",
  Fitness: "Shows conditioning to absorb damage, fatigue, and sustained pressure.",
  Aim: "Measures precision in attacks, especially ranged and targeting actions.",
  Balance: "Reflects body control, agility, and defensive movement quality.",
  Intuition: "Covers situational awareness, instinct, and risk perception.",
  Willpower: "Indicates mental resolve against fear, compulsion, and hostile magic.",
  Reason: "Represents logical analysis and problem-solving capability.",
  Knowledge: "Expresses learned repertoire and ability to acquire new information.",
  Appearance: "Affects first impressions and social reaction to your presence.",
  Leadership: "Measures command, loyalty building, and group coordination.",
};

function prettifyKey(key: string, isEn: boolean, uiTexts: UiTextMap) {
  const fallback = (isEn ? defaultLabelEn : defaultLabelPt)[key] || key;
  return uiTexts.get(`label.${key}`) ?? fallback;
}

function valueToText(value: string | number | boolean | null, isEn: boolean, uiTexts: UiTextMap) {
  if (value == null) return "—";
  if (typeof value === "boolean") {
    if (value) return uiTexts.get("ui.booleanTrue") ?? (isEn ? "Yes" : "Sim");
    return uiTexts.get("ui.booleanFalse") ?? (isEn ? "No" : "Não");
  }
  return String(value);
}

function getItemExplanation(key: string, isEn: boolean, uiTexts: UiTextMap) {
  const fallback =
    (isEn ? defaultExplanationEn : defaultExplanationPt)[key] ||
    uiTexts.get("ui.explanationFallback") ||
    (isEn
      ? "Mechanical indicator used to determine this subattribute's rule effects."
      : "Indicador mecânico usado para definir efeitos deste subatributo nas regras.");

  return uiTexts.get(`explain.${key}`) ?? fallback;
}

function pickColumns(rows: RowRecord[]) {
  const preferred = [
    "scoreLabel",
    "scoreMin",
    "scoreMax",
    "baseScore",
    "attackAdjustment",
    "damageAdjustment",
    "reactionAdjustment",
    "defensiveAdjustment",
    "missileAdjustment",
    "magicDefenseAdjustment",
    "maxWizardSpellLevel",
    "maxSpellsPerLevel",
    "bonusSpellsText",
    "bonusProficiencies",
    "learnSpellPercent",
    "weightAllowance",
    "systemShockPercent",
    "poisonSaveModifier",
    "hitPointAdjustmentBase",
    "hitPointAdjustmentWarrior",
    "minimumHitDieResult",
    "resurrectionChancePercent",
    "pickPocketsPercent",
    "openLocksPercent",
    "moveSilentlyPercent",
    "climbWallsPercent",
    "openDoors",
    "openDoorsLocked",
    "bendBarsLiftGatesPercent",
    "maxPress",
    "spellFailurePercent",
    "spellImmunityLevel",
    "loyaltyBase",
    "maxHenchmen",
  ];

  return preferred.filter((key) => rows.some((row) => row[key] !== null && row[key] !== undefined));
}

function DerivativeTable({ title, rows, isEn, uiTexts }: { title: string; rows: RowRecord[]; isEn: boolean; uiTexts: UiTextMap }) {
  if (rows.length === 0) return null;
  const columns = pickColumns(rows);

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
      <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm text-zinc-300">
          <thead>
            <tr className="border-b border-zinc-700 text-zinc-200">
              {columns.map((column) => (
                <th key={column} className="px-2 py-2 font-semibold">
                  {prettifyKey(column, isEn, uiTexts)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b border-zinc-800/70 last:border-b-0">
                {columns.map((column) => (
                  <td key={column} className="px-2 py-2 align-top">
                    {valueToText(row[column] ?? null, isEn, uiTexts)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-md border border-zinc-800 bg-zinc-950/50 p-3">
        <p className="text-xs uppercase tracking-wide text-zinc-500">{uiTexts.get("ui.subattributeItemDetails") ?? (isEn ? "Subattribute item details" : "Detalhes dos itens do subatributo")}</p>
        <ul className="mt-2 space-y-2 text-sm text-zinc-300">
          {columns
            .filter((column) => !["scoreLabel", "scoreMin", "scoreMax", "baseScore"].includes(column))
            .map((column) => (
              <li key={column} className="rounded-md border border-zinc-800/80 px-3 py-2">
                <p className="font-semibold text-zinc-100">{prettifyKey(column, isEn, uiTexts)}</p>
                <p className="mt-1 text-zinc-400">{getItemExplanation(column, isEn, uiTexts)}</p>
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
}

export default async function AtributoDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ atributo: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = getLocaleFromSearchParams((await searchParams) ?? {});
  const isEn = locale === "en";
  const { atributo: atributoSlug } = await params;
  const coreAttr = slugToAttr[atributoSlug];
  if (!coreAttr) notFound();

  const db = prisma as any;

  const attribute: AttributeDetail | null = await db.attributeDefinition.findUnique({
    where: { name: coreAttr },
    include: {
      subAttributes: {
        orderBy: { id: "asc" },
      },
    },
  });

  if (!attribute) notFound();

  const columnCheckRows: Array<{ has_name_column: boolean }> = await db.$queryRawUnsafe(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'AttributeDefinitionTranslation'
        AND column_name = 'name'
    ) AS has_name_column
  `);
  const hasNameColumn = Boolean(columnCheckRows[0]?.has_name_column);

  const attributeTranslations: Array<{
    locale: string;
    name: string | null;
    description: string | null;
    full_description: string | null;
  }> = await db.$queryRawUnsafe(
    hasNameColumn
      ? 'SELECT "locale", "name", "description", "full_description" FROM "AttributeDefinitionTranslation" WHERE "attribute_id" = $1'
      : 'SELECT "locale", NULL::text AS "name", "description", "full_description" FROM "AttributeDefinitionTranslation" WHERE "attribute_id" = $1',
    attribute.id
  );

  const subAttributeIds = attribute.subAttributes.map((item) => item.id);
  const subAttributeTranslations: Array<{
    sub_attribute_id: number;
    locale: string;
    name: string | null;
    description: string | null;
    full_description: string | null;
  }> =
    subAttributeIds.length > 0
      ? await db.$queryRawUnsafe(
          hasNameColumn
            ? 'SELECT "sub_attribute_id", "locale", "name", "description", "full_description" FROM "SubAttributeDefinitionTranslation" WHERE "sub_attribute_id" = ANY($1::int[])'
            : 'SELECT "sub_attribute_id", "locale", NULL::text AS "name", "description", "full_description" FROM "SubAttributeDefinitionTranslation" WHERE "sub_attribute_id" = ANY($1::int[])',
          subAttributeIds
        )
      : [];

  const subAttributeTranslationsById = new Map<number, Array<{ locale: string; name: string | null; description: string | null; fullDescription: string | null }>>();
  for (const row of subAttributeTranslations) {
    const current = subAttributeTranslationsById.get(row.sub_attribute_id) ?? [];
    current.push({
      locale: row.locale,
      name: row.name,
      description: row.description,
      fullDescription: row.full_description,
    });
    subAttributeTranslationsById.set(row.sub_attribute_id, current);
  }

  const uiTextRows: Array<{ key: string; locale: string; text: string }> = await db.$queryRawUnsafe(
    'SELECT "key", "locale", "text" FROM "UiTextTranslation" WHERE "namespace" = $1 AND "locale" = ANY($2::varchar[])',
    "attribute-detail",
    ["pt", locale]
  );

  const uiTexts: UiTextMap = new Map<string, string>();
  for (const row of uiTextRows.filter((item) => item.locale === "pt")) {
    uiTexts.set(row.key, row.text);
  }
  for (const row of uiTextRows.filter((item) => item.locale === locale)) {
    uiTexts.set(row.key, row.text);
  }

  const localizedAttribute = pickLocalizedText(
    attrLabel[coreAttr],
    attribute.description,
    attribute.fullDescription,
    attributeTranslations.map((row) => ({
      locale: row.locale,
      name: row.name,
      description: row.description,
      fullDescription: row.full_description,
    })),
    locale
  );

  const subAttributeDisplayByBaseName = new Map<string, string>();
  for (const subAttribute of attribute.subAttributes) {
    const localizedSubAttribute = pickLocalizedText(
      subAttrLabel[subAttribute.name] ?? subAttribute.name,
      subAttribute.description,
      subAttribute.fullDescription,
      subAttributeTranslationsById.get(subAttribute.id),
      locale
    );
    subAttributeDisplayByBaseName.set(subAttribute.name, localizedSubAttribute.name);
  }

  const [
    strengthMuscle,
    strengthStamina,
    conHealth,
    conFitness,
    dexAim,
    dexBalance,
    wisIntuition,
    wisWillpower,
    intReason,
    intKnowledge,
    chaAppearance,
    chaLeadership,
  ] = await Promise.all([
    db.strengthMuscleScoreReference.findMany({ orderBy: { sortOrder: "asc" } }),
    db.strengthStaminaScoreReference.findMany({ orderBy: { sortOrder: "asc" } }),
    db.constitutionHealthScoreReference.findMany({ orderBy: { sortOrder: "asc" } }),
    db.constitutionFitnessScoreReference.findMany({ orderBy: { sortOrder: "asc" } }),
    db.dexterityAimScoreReference.findMany({ orderBy: { sortOrder: "asc" } }),
    db.dexterityBalanceScoreReference.findMany({ orderBy: { sortOrder: "asc" } }),
    db.wisdomIntuitionScoreReference.findMany({ orderBy: { sortOrder: "asc" } }),
    db.wisdomWillpowerScoreReference.findMany({ orderBy: { sortOrder: "asc" } }),
    db.intelligenceReasonScoreReference.findMany({ orderBy: { sortOrder: "asc" } }),
    db.intelligenceKnowledgeScoreReference.findMany({ orderBy: { sortOrder: "asc" } }),
    db.charismaAppearanceScoreReference.findMany({ orderBy: { sortOrder: "asc" } }),
    db.charismaLeadershipScoreReference.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const derivativeByAttr: Record<CoreAttr, Array<{ title: string; rows: RowRecord[] }>> = {
    STRENGTH: [
      { title: subAttributeDisplayByBaseName.get("Muscle") ?? "Muscle", rows: strengthMuscle as RowRecord[] },
      { title: subAttributeDisplayByBaseName.get("Stamina") ?? "Stamina", rows: strengthStamina as RowRecord[] },
    ],
    CONSTITUTION: [
      { title: subAttributeDisplayByBaseName.get("Health") ?? "Health", rows: conHealth as RowRecord[] },
      { title: subAttributeDisplayByBaseName.get("Fitness") ?? "Fitness", rows: conFitness as RowRecord[] },
    ],
    DEXTERITY: [
      { title: subAttributeDisplayByBaseName.get("Aim") ?? "Aim", rows: dexAim as RowRecord[] },
      { title: subAttributeDisplayByBaseName.get("Balance") ?? "Balance", rows: dexBalance as RowRecord[] },
    ],
    WISDOM: [
      { title: subAttributeDisplayByBaseName.get("Intuition") ?? "Intuition", rows: wisIntuition as RowRecord[] },
      { title: subAttributeDisplayByBaseName.get("Willpower") ?? "Willpower", rows: wisWillpower as RowRecord[] },
    ],
    INTELLIGENCE: [
      { title: subAttributeDisplayByBaseName.get("Reason") ?? "Reason", rows: intReason as RowRecord[] },
      { title: subAttributeDisplayByBaseName.get("Knowledge") ?? "Knowledge", rows: intKnowledge as RowRecord[] },
    ],
    CHARISMA: [
      { title: subAttributeDisplayByBaseName.get("Appearance") ?? "Appearance", rows: chaAppearance as RowRecord[] },
      { title: subAttributeDisplayByBaseName.get("Leadership") ?? "Leadership", rows: chaLeadership as RowRecord[] },
    ],
  };

  const derivatives = derivativeByAttr[coreAttr];

  return (
    <PublicShell
      locale={locale}
      currentPath="/atributos"
      title={localizedAttribute.name}
      description={
        localizedAttribute.fullDescription ||
        localizedAttribute.description ||
        (isEn ? attrFallbackDescriptionEn[coreAttr] : attrFallbackDescription[coreAttr])
      }
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-widest text-zinc-400">{uiTexts.get("ui.attributesAndDerived") ?? (isEn ? "Attributes and details" : "Atributos e detalhes")}</p>
          <div className="flex gap-2">
            <Link
              href={withLang("/atributos", locale)}
              className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-900"
            >
              {uiTexts.get("ui.backToAttributes") ?? (isEn ? "Back to Attributes" : "Voltar para Atributos")}
            </Link>
          </div>
        </div>

        <section className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
          <h2 className="text-lg font-semibold text-zinc-100">{uiTexts.get("ui.subattributes") ?? (isEn ? "Subattributes" : "Subatributos")}</h2>
          <ul className="mt-3 grid gap-2 text-sm text-zinc-300 md:grid-cols-2">
            {attribute.subAttributes.map((subAttribute) => {
              const localizedSubAttribute = pickLocalizedText(
                subAttrLabel[subAttribute.name] ?? subAttribute.name,
                subAttribute.description,
                subAttribute.fullDescription,
                subAttributeTranslationsById.get(subAttribute.id),
                locale
              );

              return (
                <li key={subAttribute.id} className="rounded-md border border-zinc-800 bg-zinc-950/50 px-3 py-2">
                  <span className="font-semibold text-zinc-100">{localizedSubAttribute.name}</span>
                  <p className="mt-1 text-zinc-400">
                    {localizedSubAttribute.fullDescription ||
                      localizedSubAttribute.description ||
                      (isEn ? subAttrFallbackDescriptionEn[subAttribute.name] : subAttrFallbackDescription[subAttribute.name]) ||
                      (isEn
                        ? "Subattribute that details a specific part of this attribute's performance."
                        : "Subatributo que detalha parte específica do desempenho deste atributo.")}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="mt-6 space-y-4">
          {derivatives.map((derivative) => (
            <DerivativeTable key={derivative.title} title={derivative.title} rows={derivative.rows} isEn={isEn} uiTexts={uiTexts} />
          ))}
        </div>
      </div>
    </PublicShell>
  );
}
