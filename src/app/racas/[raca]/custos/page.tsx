import Link from "next/link";
import { notFound } from "next/navigation";
import { existsSync } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { getLocaleFromSearchParams, withLang } from "@/lib/i18n";
import { PublicShell } from "@/components/public-shell";

function toSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function statText(value: number | null | undefined) {
  if (value == null) return "—";
  if (value > 0) return `+${value}`;
  return String(value);
}

function getRaceCostsImageSrc(raceSlug: string) {
  const costsPath = path.join(process.cwd(), "public", "images", "races", raceSlug, "costs-2x3.png");
  if (existsSync(costsPath)) return `/images/races/${raceSlug}/costs-2x3.png`;

  return "/images/races/default.svg";
}

function normalizeAbilityName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getElfAbilityDescription(name: string, isEn: boolean, fallback: string) {
  const key = normalizeAbilityName(name);

  if (key.startsWith("infravision")) {
    if (key.includes("120")) {
      return isEn
        ? "Infravision range is 120 feet, allowing vision based on heat contrast in darkness."
        : "A infravisão tem alcance de 120 pés, permitindo percepção por contraste térmico no escuro.";
    }
    return isEn
      ? "Infravision range is 60 feet, allowing vision based on heat contrast in darkness."
      : "A infravisão tem alcance de 60 pés, permitindo percepção por contraste térmico no escuro.";
  }

  if (key.includes("aquatic dehydration")) {
    return isEn
      ? "Out of salt water, aquatic elves can remain on land only for a number of days equal to Fitness. Every two days out of water applies -1 to all ability scores, proficiency checks, attack rolls, and damage rolls. If any score reaches zero, the elf dies. Recovery happens after returning to salt water."
      : "Fora de água salgada, elfos aquáticos podem permanecer em terra por um número de dias igual ao valor de Fitness. A cada dois dias fora d'água, sofrem -1 em todos os atributos, testes de proficiência, jogadas de ataque e jogadas de dano. Se algum atributo chegar a zero, o elfo morre. A recuperação ocorre ao retornar à água salgada.";
  }

  if (key.includes("aquatic") && key.includes("bow") && key.includes("underwater")) {
    return isEn
      ? "Aquatic elves do not receive the standard elven bow attack bonus while underwater, because bows are ineffective in that environment."
      : "Elfos aquáticos não recebem o bônus élfico padrão de ataque com arco quando estão submersos, pois arcos são ineficazes nesse ambiente.";
  }

  if (key.includes("dark sunlight penalty")) {
    return isEn
      ? "Dark elves suffer -1 on all rolls when exposed to bright sunlight or continual light effects. Lesser light sources do not impose this penalty."
      : "Elfos negros sofrem -1 em todas as jogadas quando expostos à luz solar intensa ou a efeitos de luz contínua. Fontes menores de luz não aplicam essa penalidade.";
  }

  if (key.includes("dark elf social stigma")) {
    return isEn
      ? "Dark elves receive an initial reaction penalty of -2 when dealing with other elves due to deep social hostility."
      : "Elfos negros recebem penalidade inicial de reação de -2 ao lidar com outros elfos, devido à forte hostilidade social.";
  }

  if (key.includes("gray elf aloof penalty")) {
    return isEn
      ? "Because of their aloof and haughty reputation, gray elves suffer -1 to reaction rolls with other elves and -2 when dealing with other races."
      : "Por sua reputação reservada e altiva, elfos cinzentos sofrem -1 em reações com outros elfos e -2 ao lidar com outras raças.";
  }

  if (key.includes("high elf illusion credulity penalty")) {
    return isEn
      ? "High elves are trusting and open; when attempting to disbelieve an effect that is truly an illusion, they suffer a -2 penalty on that attempt."
      : "High Elves têm perfil mais aberto e confiante; ao tentar desacreditar um efeito que realmente seja ilusão, sofrem penalidade de -2 na tentativa.";
  }

  if (key.includes("sylvan") && key.includes("penalty")) {
    return isEn
      ? "When outside their forest home, sylvan elves show visible discomfort; people encountering them apply a -1 reaction adjustment."
      : "Quando estão fora de sua floresta natal, elfos silvestres demonstram desconforto visível; quem interage com eles aplica ajuste de reação de -1.";
  }

  const en: Record<string, string> = {
    "aim bonus": "+1 to the Aim subability score. This also relaxes Dexterity subability spread so values can differ by up to 5 instead of 4.",
    "balance bonus": "+1 to the Balance subability score. This also relaxes Dexterity subability spread so values can differ by up to 5 instead of 4.",
    "bow bonus": "+1 on attack rolls when using short or long bows.",
    "cold resistance": "+1 bonus on saving throws versus cold- and ice-based attacks.",
    companion: "Gain a companion (cooshee or elven cat), following the companion rules used by the Animal Master style feature.",
    "confer water breathing": "Once per day, may grant water breathing to another creature. Duration is 1 hour per level of the elf granting the effect.",
    "dagger bonus": "+1 on attack rolls with daggers.",
    "heat resistance": "+1 bonus on saving throws versus heat- and fire-based attacks.",
    "javelin bonus": "+1 on attack rolls with javelins.",
    "less sleep": "Needs only four hours of sleep to be considered fully rested.",
    "magic identification": "5% per level chance to identify the general purpose and function of magical items, using bard-like item lore behavior.",
    "reason bonus": "+1 to the Reason subability score.",
    resistance: "90% resistance against sleep and charm-related magical effects.",
    "secret doors": "When merely passing within 10 feet, gains 1-in-6 chance to notice concealed doors. If actively searching: 2-in-6 to find secret doors and 3-in-6 to notice concealed doors.",
    "speak with plants": "Once per day, may use Speak with Plants as a priest of equal level.",
    "spear bonus": "+1 on attack rolls with spears.",
    "spell abilities": "Once per day may cast faerie fire, dancing lights, and darkness as a priest or wizard of equal level. At 4th level, also gains levitate, detect magic, and know alignment.",
    stealth: "When alone and not wearing metal armor, gains surprise advantage: opponents suffer -4, or -2 if the elf must open a door.",
    "sword bonus": "+1 on attack rolls with short swords and long swords.",
    "trident bonus": "+1 on attack rolls with tridents.",
  };

  const pt: Record<string, string> = {
    "aim bonus": "+1 no subatributo Aim. Também afrouxa a diferença permitida entre subatributos de Destreza para até 5 em vez de 4.",
    "balance bonus": "+1 no subatributo Balance. Também afrouxa a diferença permitida entre subatributos de Destreza para até 5 em vez de 4.",
    "bow bonus": "+1 nas jogadas de ataque ao usar arcos curtos ou longos.",
    "cold resistance": "+1 em testes de resistência contra ataques de frio e gelo.",
    companion: "Ganha um companheiro (cooshee ou gato élfico), seguindo as regras de companheiro usadas pelo estilo Animal Master.",
    "confer water breathing": "Uma vez por dia, pode conceder respiração aquática a outra criatura. Duração de 1 hora por nível do elfo que concede o efeito.",
    "dagger bonus": "+1 nas jogadas de ataque com adagas.",
    "heat resistance": "+1 em testes de resistência contra ataques de calor e fogo.",
    "javelin bonus": "+1 nas jogadas de ataque com dardos.",
    "less sleep": "Precisa de apenas quatro horas de sono para ser considerado plenamente descansado.",
    "magic identification": "5% por nível para identificar o propósito geral e a função de itens mágicos, usando comportamento de item lore de bardo.",
    "reason bonus": "+1 no subatributo Reason.",
    resistance: "90% de resistência contra efeitos mágicos de sono e encantamento.",
    "secret doors": "Ao simplesmente passar a até 10 pés, tem 1 em 6 de notar portas escondidas. Se estiver procurando ativamente: 2 em 6 para encontrar portas secretas e 3 em 6 para notar portas disfarçadas.",
    "speak with plants": "Uma vez por dia, pode usar Falar com Plantas como um sacerdote de nível equivalente.",
    "spear bonus": "+1 nas jogadas de ataque com lanças.",
    "spell abilities": "Uma vez por dia pode lançar faerie fire, dancing lights e darkness como sacerdote ou mago de nível equivalente. No 4º nível, também ganha levitate, detect magic e know alignment.",
    stealth: "Quando sozinho e sem usar armadura metálica, ganha vantagem de surpresa: oponentes sofrem -4, ou -2 se o elfo precisar abrir uma porta.",
    "sword bonus": "+1 nas jogadas de ataque com espadas curtas e longas.",
    "trident bonus": "+1 nas jogadas de ataque com tridentes.",
  };

  const catalog = isEn ? en : pt;
  return catalog[key] ?? fallback;
}

function getDwarfAbilityDescription(name: string, isEn: boolean, fallback: string) {
  const key = normalizeAbilityName(name);

  if (key.startsWith("infravision")) {
    if (key.includes("120")) {
      return isEn
        ? "Infravision range is 120 feet, allowing detection of heat patterns in darkness."
        : "A infravisão tem alcance de 120 pés, permitindo detectar padrões de calor no escuro.";
    }
    if (key.includes("90")) {
      return isEn
        ? "Infravision range is 90 feet, allowing detection of heat patterns in darkness."
        : "A infravisão tem alcance de 90 pés, permitindo detectar padrões de calor no escuro.";
    }
    return isEn
      ? "Infravision range is 60 feet, allowing detection of heat patterns in darkness."
      : "A infravisão tem alcance de 60 pés, permitindo detectar padrões de calor no escuro.";
  }

  // Subrace-specific penalties (dwarf)
  if (key.includes("sunlight") && key.includes("deep")) {
    return isEn
      ? "Deep dwarves suffer a –1 penalty to all rolls when in bright sunlight or within the radius of a continual light spell. Light spells and all other light sources have no effect on a deep dwarf."
      : "Anões profundos sofrem penalidade de –1 em todas as jogadas quando estão sob luz solar intensa ou dentro do raio de uma magia de luz contínua. Outras fontes de luz não afetam.";
  }
  if (key.includes("sunlight") && (key.includes("gray") || key.includes("grey") || key.includes("duergar"))) {
    return isEn
      ? "Gray dwarves suffer a –1 penalty on all rolls when exposed to bright sunlight or continual light spells. Other light sources do not impair them."
      : "Anões cinzentos sofrem penalidade de –1 em todas as jogadas quando expostos à luz solar intensa ou magias de luz contínua. Outras fontes de luz não afetam.";
  }
  if (key.includes("social") && key.includes("distrust")) {
    return isEn
      ? "Duergar (gray dwarves) suffer an initial –2 penalty to reaction rolls from their cousins due to entrenched distrust."
      : "Duergar (anões cinzentos) sofrem penalidade inicial de –2 em reações por parte de outros anões devido à desconfiança arraigada.";
  }
  if (key.includes("water") && key.includes("hill")) {
    return isEn
      ? "Hill dwarves are not accustomed to traveling over water. They suffer a –2 penalty to reaction rolls when they are in or adjacent to rivers, lakes, and seas."
      : "Anões das colinas não são acostumados a viajar sobre água. Sofrem penalidade de –2 em reações quando estão em rios, lagos ou mares, ou adjacentes a eles.";
  }
  if (key.includes("water") && (key.includes("mountain") || key.includes("sea") || key.includes("ship"))) {
    return isEn
      ? "Mountain dwarves are not accustomed to traveling over water. However, they are comfortable around rivers and small lakes. They suffer a –2 penalty to reaction rolls only when on board sea-going vessels or when in large bodies of water."
      : "Anões das montanhas não são acostumados a viajar sobre água, mas se sentem confortáveis em rios e lagos pequenos. Sofrem penalidade de –2 em reações apenas quando estão em navios marítimos ou grandes massas de água.";
  }

  const en: Record<string, string> = {
    "saving throw bonuses": "Dwarves gain saving throw bonuses versus poison and against magical attacks from rods, wands, and spells, based on their Constitution/Health score.",
    "melee combat bonuses": "+1 attack vs. orcs, half-orcs, goblins, and hobgoblins; ogres, half-ogres, ogre magi, trolls, giants, and titans suffer -4 to hit dwarves.",
    "mining detection abilities": "By concentrating for one round, the dwarf may determine depth underground (1-3), detect sliding/shifting walls (1-4), detect grade/slope (1-5), detect stone traps/deadfalls (1-3), and detect new stone construction (1-5) on 1d6.",
    "stealth": "If the dwarf is not in metal armor, a –2 penalty is applied to opponent's surprise rolls if the dwarf is at least 90 feet ahead of a party of characters without this ability, or accompanied only by characters with equivalent stealth skills. The dwarf is also difficult to surprise himself and receives a +2 bonus to his own surprise rolls.",
    "deep dwarf sunlight penalty": "Deep dwarves suffer a –1 penalty to all rolls when in bright sunlight or within the radius of a continual light spell. Light spells and all other light sources have no effect on a deep dwarf.",
    "gray dwarf sunlight penalty": "Gray dwarves suffer a –1 penalty on all rolls when exposed to bright sunlight or continual light spells. Other light sources do not impair them.",
    "gray dwarf social distrust": "Duergar (gray dwarves) suffer an initial –2 penalty to reaction rolls from their cousins due to entrenched distrust.",
    "hill dwarf water unease": "Hill dwarves are not accustomed to traveling over water. They suffer a –2 penalty to reaction rolls when they are in or adjacent to rivers, lakes, and seas.",
    "mountain dwarf sea unease": "Mountain dwarves are not accustomed to traveling over water. However, they are comfortable around rivers and small lakes. They suffer a –2 penalty to reaction rolls only when on board sea-going vessels or when in large bodies of water.",
  };
  const pt: Record<string, string> = {
    "saving throw bonuses": "Anões recebem bônus em testes de resistência contra venenos e contra ataques mágicos de varinhas, bastões e magias, de acordo com o valor de Constituição/Health.",
    "melee combat bonuses": "+1 de ataque contra orcs, meio-orcs, goblins e hobgoblins; ogros, meio-ogros, ogre magi, trolls, gigantes e titãs sofrem -4 para acertar anões.",
    "mining detection abilities": "Concentrando-se por 1 rodada, o anão pode: estimar profundidade (1-3), detectar paredes móveis (1-4), detectar declive (1-5), detectar armadilhas/queda de rochas em pedra (1-3) e detectar construção nova em alvenaria (1-5), em 1d6.",
    "stealth": "Se não estiver usando armadura metálica, aplica penalidade de –2 na surpresa dos oponentes se estiver pelo menos 90 pés à frente de um grupo sem essa habilidade, ou acompanhado apenas de personagens com furtividade equivalente. O anão também é difícil de ser surpreendido e recebe +2 na própria surpresa.",
    "deep dwarf sunlight penalty": "Anões profundos sofrem penalidade de –1 em todas as jogadas quando estão sob luz solar intensa ou dentro do raio de uma magia de luz contínua. Outras fontes de luz não afetam.",
    "gray dwarf sunlight penalty": "Anões cinzentos sofrem penalidade de –1 em todas as jogadas quando expostos à luz solar intensa ou magias de luz contínua. Outras fontes de luz não afetam.",
    "gray dwarf social distrust": "Duergar (anões cinzentos) sofrem penalidade inicial de –2 em reações por parte de outros anões devido à desconfiança arraigada.",
    "hill dwarf water unease": "Anões das colinas não são acostumados a viajar sobre água. Sofrem penalidade de –2 em reações quando estão em rios, lagos ou mares, ou adjacentes a eles.",
    "mountain dwarf sea unease": "Anões das montanhas não são acostumados a viajar sobre água, mas se sentem confortáveis em rios e lagos pequenos. Sofrem penalidade de –2 em reações apenas quando estão em navios marítimos ou grandes massas de água.",
  };

  // ...existing code...

  const catalog = isEn ? en : pt;
  return catalog[key] ?? fallback;
}

function getAbilityDescription(raceSlug: string, name: string, isEn: boolean, fallback: string) {
  if (raceSlug === "elf") return getElfAbilityDescription(name, isEn, fallback);
  if (raceSlug === "dwarf") return getDwarfAbilityDescription(name, isEn, fallback);
  if (raceSlug === "gnome") return getGnomeAbilityDescription(name, isEn, fallback);
  if (raceSlug === "half-elf") return getHalfElfAbilityDescription(name, isEn, fallback);
  if (raceSlug === "half-orc") return getHalfOrcAbilityDescription(name, isEn, fallback);
  if (raceSlug === "half-ogre") return getHalfOgreAbilityDescription(name, isEn, fallback);
  if (raceSlug === "halfling") return getHalflingAbilityDescription(name, isEn, fallback);
  if (raceSlug === "human") return getHumanAbilityDescription(name, isEn, fallback);
  return fallback;
}

type CatalogAbility = {
  name: string;
  cost: number;
  description: string;
};

type BenefitRow = {
  key: string;
  name: string;
  cost: number;
  description: string;
};

function getGnomeAbilityDescription(name: string, isEn: boolean, fallback: string) {
  const key = normalizeAbilityName(name);

  if (key.startsWith("infravision")) {
    if (key.includes("120")) {
      return isEn
        ? "Infravision range is 120 feet, allowing detection of heat patterns in darkness."
        : "A infravisão tem alcance de 120 pés, permitindo detectar padrões de calor no escuro.";
    }
    return isEn
      ? "Infravision range is 60 feet, allowing detection of heat patterns in darkness."
      : "A infravisão tem alcance de 60 pés, permitindo detectar padrões de calor no escuro.";
  }

  // Subrace-specific penalties (gnome)
  if (key.includes("deep") && key.includes("reaction")) {
    return isEn
      ? "Deep gnomes suffer a –2 reaction roll penalty when initially encountering individuals of other races."
      : "Anões profundos (gnomos) sofrem penalidade de –2 em testes iniciais de reação ao encontrar indivíduos de outras raças.";
  }
  if (key.includes("forest") && key.includes("infravision")) {
    return isEn
      ? "Forest gnomes cannot have infravision."
      : "Gnomos da floresta não podem ter infravisão.";
  }

  // General gnome abilities
  const en: Record<string, string> = {
    "animal friendship": "Once per day, gains the animal friendship ability (as the priest spell) with respect to burrowing animals.",
    "melee combat bonus": "+1 attack vs. kobolds and goblins; gnolls, bugbears, ogres, half-ogres, ogre magi, trolls, giants, and titans suffer –4 to hit gnomes.",
    "dagger bonus": "+1 to attack rolls with daggers.",
    "dart bonus": "+1 to attack rolls with darts.",
    "defensive bonus": "+1 to Armor Class when in their native underground environment.",
    "engineering bonus": "+2 bonus to engineering proficiency (requires the proficiency).",
    "forest movement": "Can pass without trace through native woodland, as the druidic ability.",
    freeze: "Can freeze in place in underground environment; 60% chance not to be noticed by passersby.",
    hide: "Can hide in woods with a chance equal to a thief of the same level's hide in shadows ability.",
    "infravision": "60-foot infravision range.",
    "mining detection abilities": "By concentrating for one round, can: determine depth underground (1–4 on 1d6); determine approximate direction underground (1–3 on 1d6); detect grade or slope (1–5 on 1d6); detect unsafe walls/ceilings/floors (1–7 on 1d10).",
    "short sword bonus": "+1 to attack rolls with short swords.",
    "saving throw bonus": "Saving throw bonus vs. magical wands, staves, rods, and spells based on Constitution/Health: 4–6 +1; 7–10 +2; 11–13 +3; 14–17 +4; 18–20 +5.",
    "potion identification": "Can identify a potion by appearance and scent with a percentage chance equal to Wisdom score.",
    "reason bonus": "+1 to the Reason subability score.",
    "sling bonus": "+1 to attack rolls with slings.",
    stealth: "If not in metal armor, opponents suffer –4 to surprise rolls if the gnome is at least 90 feet ahead of a party without this ability (or only with equivalents). The gnome is also hard to surprise and gains +2 to own surprise rolls.",
  };

  const pt: Record<string, string> = {
    "animal friendship": "Uma vez por dia, ganha a habilidade animal friendship (como a magia de sacerdote) com animais escavadores.",
    "melee combat bonus": "+1 de ataque contra kobolds e goblins; gnolls, bugbears, ogros, meio-ogros, ogre magi, trolls, gigantes e titãs sofrem –4 para acertar gnomos.",
    "dagger bonus": "+1 nas jogadas de ataque com adagas.",
    "dart bonus": "+1 nas jogadas de ataque com dardos.",
    "defensive bonus": "+1 na Classe de Armadura quando estiver em seu ambiente subterrâneo nativo.",
    "engineering bonus": "+2 na proficiência de engenharia (requer possuir a proficiência).",
    "forest movement": "Pode passar sem deixar rastros em seu bosque nativo, como a habilidade druídica.",
    freeze: "Pode ficar imóvel em ambiente subterrâneo; 60% de chance de não ser notado por quem passa.",
    hide: "Pode se esconder em florestas com chance igual à habilidade esconder-se nas sombras de um ladrão do mesmo nível.",
    "infravision": "Infravisão de 60 pés.",
    "mining detection abilities": "Concentrando-se por 1 rodada, pode: determinar profundidade subterrânea (1–4 em 1d6); direção aproximada subterrânea (1–3 em 1d6); detectar declive (1–5 em 1d6); detectar paredes/tetos/pisos inseguros (1–7 em 1d10).",
    "short sword bonus": "+1 nas jogadas de ataque com espadas curtas.",
    "saving throw bonus": "Bônus em testes de resistência contra varinhas, cajados, bastões e magias, conforme Constituição/Health: 4–6 +1; 7–10 +2; 11–13 +3; 14–17 +4; 18–20 +5.",
    "potion identification": "Pode identificar uma poção por aparência e aroma com chance percentual igual ao valor de Sabedoria.",
    "reason bonus": "+1 no subatributo Reason.",
    "sling bonus": "+1 nas jogadas de ataque com fundas.",
    stealth: "Se não estiver usando armadura metálica, aplica –4 na surpresa dos oponentes se estiver a pelo menos 90 pés à frente de um grupo sem essa habilidade (ou apenas com equivalentes). O gnomo também é difícil de ser surpreendido e recebe +2 na própria surpresa.",
  };

  const catalog = isEn ? en : pt;
  return catalog[key] ?? fallback;
}

function getHalfElfAbilityDescription(name: string, isEn: boolean, fallback: string) {
  const key = normalizeAbilityName(name);

  if (key.startsWith("infravision")) {
    return isEn
      ? "Infravision range is 60 feet, allowing detection of heat patterns in darkness."
      : "A infravisão tem alcance de 60 pés, permitindo detectar padrões de calor no escuro.";
  }

  const en: Record<string, string> = {
    "bow bonus": "+1 to attack rolls with any bows other than crossbows.",
    "cold resistance": "+1 bonus on saving throws vs. cold- and ice-based attacks.",
    "detect secret doors":
      "When passing within 10 feet, 1-in-6 to notice concealed doors; actively searching: 2-in-6 for secret doors, 3-in-6 for concealed doors.",
    "health bonus": "+1 to the Health subability score; Health can be up to 5 points higher than Fitness.",
    "heat resistance": "+1 bonus on saving throws vs. heat- and fire-based attacks.",
    "infravision": "Infravision range is 60 feet.",
    "less sleep": "Needs only four hours of sleep to be rested; especially helpful to casters.",
    resistance: "30% resistance to sleep and charm spells.",
    stealth:
      "When alone and not wearing metal armor, opponents suffer -4 to their surprise rolls; the penalty is -2 if opening a door. Also gains +2 to own surprise rolls.",
    "sword bonus": "+1 to attack rolls with long swords or short swords.",
    languages: "Common, elf, gnome, halfling, goblin, hobgoblin, orc, and gnoll.",
    "secret doors":
      "When passing within 10 feet, 1-in-6 to notice concealed doors; actively searching: 2-in-6 for secret doors, 3-in-6 for concealed doors.",
  };

  const pt: Record<string, string> = {
    "bow bonus": "+1 nas jogadas de ataque com arcos que não sejam bestas.",
    "cold resistance": "+1 em testes de resistência contra ataques de frio e gelo.",
    "detect secret doors":
      "Ao passar a até 10 pés, 1 em 6 de notar portas disfarçadas; procurando ativamente: 2 em 6 para portas secretas e 3 em 6 para portas disfarçadas.",
    "health bonus": "+1 no subatributo Health; pode ficar até 5 pontos acima de Fitness.",
    "heat resistance": "+1 em testes de resistência contra ataques de calor e fogo.",
    "infravision": "Infravisão de 60 pés.",
    "less sleep": "Precisa de apenas quatro horas de sono para ficar descansado; especialmente útil para conjuradores.",
    resistance: "30% de resistência a magias de sono e encantamento.",
    stealth:
      "Quando estiver sozinho e sem armadura metálica, os oponentes sofrem -4 na surpresa; a penalidade é -2 se precisar abrir uma porta. Também recebe +2 na própria surpresa.",
    "sword bonus": "+1 nas jogadas de ataque com espadas longas ou curtas.",
    languages: "Comum, élfico, gnomo, halfling, goblin, hobgoblin, orc e gnoll.",
    "secret doors":
      "Ao passar a até 10 pés, 1 em 6 de notar portas disfarçadas; procurando ativamente: 2 em 6 para portas secretas e 3 em 6 para portas disfarçadas.",
  };

  const catalog = isEn ? en : pt;
  return catalog[key] ?? fallback;
}

function getHalfOrcAbilityDescription(name: string, isEn: boolean, fallback: string) {
  const key = normalizeAbilityName(name);

  if (key.startsWith("infravision")) {
    return isEn ? "Infravision range is 60 feet." : "Infravisão de 60 pés.";
  }

  if (key.includes("human") && key.includes("society") && key.includes("stigma")) {
    return isEn ? "In human societies, half-orcs suffer a -2 reaction roll penalty." : "Em sociedades humanas, meio-orcs sofrem -2 em testes de reação.";
  }

  const en: Record<string, string> = {
    "active sense of smell": "Keen smell grants +1 to surprise checks.",
    "acute taste": "+2 bonus on saving throws vs. imbibed poisons due to very sensitive taste.",
    "attack bonus": "+1 attack bonus with one weapon of the player's choice.",
    "damage bonus": "+1 damage bonus with one weapon of the player's choice.",
    "fitness bonus": "+1 to the Fitness subability; can be up to 5 points higher than Health.",
    "stamina bonus": "+1 to the Stamina subability; can be up to 5 points higher than Muscle.",
    "mining detection abilities":
      "Concentrate 1 round to: determine depth underground (1–2 on 1d6); detect grade or slope (1 on 1d4); detect new stone construction (1–2 on 1d6).",
    languages: "Common, orc, dwarf, goblin, hobgoblin, and ogre.",
  };

  const pt: Record<string, string> = {
    "active sense of smell": "Olfato aguçado concede +1 em testes de surpresa.",
    "acute taste": "+2 em testes de resistência contra venenos ingeridos, graças ao paladar muito sensível.",
    "attack bonus": "+1 de ataque com uma arma à escolha do jogador.",
    "damage bonus": "+1 de dano com uma arma à escolha do jogador.",
    "fitness bonus": "+1 no subatributo Fitness; pode ficar até 5 pontos acima de Health.",
    "stamina bonus": "+1 no subatributo Stamina; pode ficar até 5 pontos acima de Muscle.",
    "mining detection abilities":
      "Concentrando-se por 1 rodada pode: estimar profundidade subterrânea (1–2 em 1d6); detectar declive (1 em 1d4); detectar construção recente em pedra (1–2 em 1d6).",
    languages: "Comum, orc, anão, goblin, hobgoblin e ogro.",
  };

  const catalog = isEn ? en : pt;
  return catalog[key] ?? fallback;
}

function getHalfOgreAbilityDescription(name: string, isEn: boolean, fallback: string) {
  const key = normalizeAbilityName(name);

  if (key.includes("large") && key.includes("target")) {
    return isEn
      ? "Large frame draws fire: enemies find it easier to hit, may apply size-based damage bonuses against the half-ogre."
      : "Corpo grande chama atenção: inimigos têm mais facilidade para acertar e podem aplicar bônus de dano por tamanho contra o meio-ogro.";
  }

  if (key.includes("tough") && key.includes("hide")) {
    return isEn
      ? "Thick hide works as natural armor, improving base AC; DM may allow an extra –1 AC vs. physical blows when armored."
      : "Pele grossa funciona como armadura natural, melhorando o AC base; o Mestre pode permitir –1 adicional no AC contra golpes físicos quando em armadura.";
  }

  const en: Record<string, string> = {
    languages: "Common, ogre, orc, troll, stone giant, and gnoll.",
  };

  const pt: Record<string, string> = {
    languages: "Comum, ogro, orc, troll, gigante das pedras e gnoll.",
  };

  const catalog = isEn ? en : pt;
  return catalog[key] ?? fallback;
}

function getHumanAbilityDescription(name: string, isEn: boolean, fallback: string) {
  const key = normalizeAbilityName(name);

  if (key.includes("open") && key.includes("advance")) {
    return isEn
      ? "Humans ignore class level limits; advancement follows class rules without racial caps."
      : "Humanos ignoram limites de nível por classe; avançam conforme as regras da classe sem travas raciais.";
  }

  if (key.includes("bonus") && key.includes("character") && key.includes("points")) {
    return isEn
      ? "Receives 10 character points to allocate during creation; these are in addition to racial budget rules."
      : "Recebe 10 pontos de personagem extras para gastar na criação; são adicionais ao orçamento racial.";
  }

  if (key.includes("experience")) {
    return isEn ? "+5% experience bonus to earned XP." : "+5% de bônus na experiência obtida.";
  }

  if (key.includes("secret") && key.includes("door")) {
    return isEn
      ? "Faint elven trace: 1-in-6 to notice concealed doors when passing within 10 feet; if searching, 2-in-6 for secret doors and 3-in-6 for concealed doors."
      : "Traço élfico leve: 1 em 6 de notar portas disfarçadas ao passar a até 10 pés; procurando ativamente, 2 em 6 para portas secretas e 3 em 6 para disfarçadas.";
  }

  if (key.includes("tough") && key.includes("hide")) {
    return isEn
      ? "Natural armor: unarmored humans treat base AC as improved (e.g., AC 8 instead of 10); when wearing armor, the hide can justify an additional –1 AC bonus against physical blows at the DM's discretion."
      : "Armadura natural: humanos sem armadura tratam o AC base como melhorado (ex.: AC 8 em vez de 10); usando armadura, a pele pode justificar -1 adicional no AC contra golpes físicos, a critério do Mestre.";
  }

  const en: Record<string, string> = {
    "attack bonus": "+1 attack with one weapon of choice.",
    "balance bonus": "+1 to the Balance subability score.",
    "health bonus": "+1 to the Health subability score.",
    "hit point bonus": "+1 hit point whenever new hit points are rolled.",
  };

  const pt: Record<string, string> = {
    "attack bonus": "+1 de ataque com uma arma à escolha.",
    "balance bonus": "+1 no subatributo Balance.",
    "health bonus": "+1 no subatributo Health.",
    "hit point bonus": "+1 ponto de vida sempre que novos PV forem rolados.",
  };

  const catalog = isEn ? en : pt;
  return catalog[key] ?? fallback;
}

function getHalflingAbilityDescription(name: string, isEn: boolean, fallback: string) {
  const key = normalizeAbilityName(name);

  // Subrace penalties
  if (key.includes("stout") && key.includes("elf") && key.includes("distrust")) {
    return isEn
      ? "Stout halflings suffer a -1 reaction penalty when dealing with elves due to mutual distrust."
      : "Halflings stout sofrem -1 em reações ao lidar com elfos, por desconfiança mútua.";
  }
  if (key.includes("tallfellow") && key.includes("dwarf") && key.includes("distrust")) {
    return isEn
      ? "Tallfellow halflings take a -2 reaction penalty from dwarves, reflecting cultural friction."
      : "Halflings tallfellow recebem -2 em reações vindas de anões, refletindo atrito cultural.";
  }

  const en: Record<string, string> = {
    "aim bonus": "+1 to the Aim subability score. Also relaxes Dexterity subability spread to a 5-point difference (vs. default 4).",
    "attack bonus": "+1 attack bonus with hurled weapons and slings.",
    "balance bonus": "+1 to the Balance subability score. Also relaxes Dexterity subability spread to a 5-point difference (vs. default 4).",
    "detect evil": "Once per day, may detect evil in creatures/individuals (not items or locations).",
    "detect secret doors": "Detect secret and concealed doors as an elf.",
    stealth:
      "If not wearing metal armor, opponents suffer -4 to their surprise rolls; the penalty is -2 if the halfling is opening a door. Also difficult to surprise, the halfling gains +2 to own surprise rolls.",
    "saving throw bonuses": "Bonuses vs. magic and poison based on Constitution/Health: 4–6 +1; 7–10 +2; 11–13 +3; 14–17 +4; 18–20 +5.",
    "health bonus": "+1 to the Health subability score.",
    "infravision": "60-foot infravision range (stout halfling package).",
    "infravision 60": "60-foot infravision range (stout halfling package).",
    "infravision 60'": "60-foot infravision range (stout halfling package).",
    "infravision 30": "30-foot infravision range (indicates stout blood in lineage).",
    "infravision 30'": "30-foot infravision range (indicates stout blood in lineage).",
    "mining detection abilities":
      "Concentrate 1 round to: determine depth underground (1–3 on 1d6); determine approximate direction underground (1–3 on 1d6); detect grade or slope (1–3 on 1d4); detect unsafe stonework like pits, deadfalls, weak walls (1–7 on 1d10).",
    "reaction bonus": "+1 to reaction rolls because other races tend to accept halflings.",
    "secret doors":
      "1-in-6 chance to notice concealed doors when passing within 10 feet; if actively searching, 2-in-6 to find secret doors and 3-in-6 to notice concealed doors.",
    hide: "Can hide in woods with a chance equal to a thief of the same level's hide in shadows ability.",
    taunt: "Once per day, may taunt as per the 1st-level wizard spell.",
  };

  const pt: Record<string, string> = {
    "aim bonus": "+1 no subatributo Aim. Afrouxa a diferença permitida entre subatributos de Destreza para até 5 (vs. 4 padrão).",
    "attack bonus": "+1 de ataque com armas arremessadas e fundas.",
    "balance bonus": "+1 no subatributo Balance. Afrouxa a diferença permitida entre subatributos de Destreza para até 5 (vs. 4 padrão).",
    "detect evil": "Uma vez por dia pode detectar mal em criaturas/indivíduos (não funciona em itens ou locais).",
    "detect secret doors": "Detecta portas secretas e disfarçadas como um elfo.",
    stealth:
      "Se não estiver em armadura metálica, os oponentes sofrem -4 na surpresa; a penalidade é -2 se o halfling estiver abrindo uma porta. O halfling também é difícil de ser surpreendido e recebe +2 na própria surpresa.",
    "saving throw bonuses": "Bônus contra magia e veneno conforme Constituição/Health: 4–6 +1; 7–10 +2; 11–13 +3; 14–17 +4; 18–20 +5.",
    "health bonus": "+1 no subatributo Health.",
    "infravision": "Infravisão de 60 pés (pacote stout).",
    "infravision 60": "Infravisão de 60 pés (pacote stout).",
    "infravision 60'": "Infravisão de 60 pés (pacote stout).",
    "infravision 30": "Infravisão de 30 pés (indica sangue stout na linhagem).",
    "infravision 30'": "Infravisão de 30 pés (indica sangue stout na linhagem).",
    "mining detection abilities":
      "Concentrando-se por 1 rodada pode: determinar profundidade subterrânea (1–3 em 1d6); determinar direção aproximada subterrânea (1–3 em 1d6); detectar declive (1–3 em 1d4); detectar pedra insegura como pits, desabamentos e paredes fracas (1–7 em 1d10).",
    "reaction bonus": "+1 em reações porque outras raças tendem a aceitar halflings.",
    "secret doors":
      "1 em 6 de notar portas disfarçadas ao passar a até 10 pés; procurando ativamente, 2 em 6 para portas secretas e 3 em 6 para portas disfarçadas.",
    hide: "Pode se esconder em florestas com chance igual à habilidade esconder-se nas sombras de um ladrão do mesmo nível.",
    taunt: "Uma vez por dia, pode zombar/irritar como a magia Taunt de mago de 1º nível.",
  };

  const catalog = isEn ? en : pt;
  return catalog[key] ?? fallback;
}

function getHalfElfAbilityCatalog(isEn: boolean): CatalogAbility[] {
  if (isEn) {
    return [
      { name: "Bow Bonus", cost: 5, description: "+1 to attack rolls with any bows other than crossbows." },
      { name: "Cold Resistance", cost: 5, description: "+1 bonus on saving throws vs. cold- and ice-based attacks." },
      {
        name: "Detect Secret Doors",
        cost: 5,
        description: "1-in-6 to notice concealed doors when passing within 10 feet; searching: 2-in-6 secret doors, 3-in-6 concealed doors.",
      },
      { name: "Health Bonus", cost: 10, description: "+1 to the Health subability; can be up to 5 points higher than Fitness." },
      { name: "Heat Resistance", cost: 5, description: "+1 bonus on saving throws vs. heat- and fire-based attacks." },
      { name: "Infravision, 60'", cost: 10, description: "60-foot infravision range." },
      { name: "Less Sleep", cost: 5, description: "Needs only four hours of sleep to be fully rested." },
      { name: "Resistance", cost: 5, description: "30% resistance to sleep and charm spells." },
      {
        name: "Stealth",
        cost: 10,
        description: "When alone and not in metal armor, opponents suffer -4 to surprise; penalty is -2 if opening a door. Gains +2 to own surprise.",
      },
      { name: "Sword Bonus", cost: 5, description: "+1 to attack rolls with long swords or short swords." },
      { name: "Languages", cost: 0, description: "Common, elf, gnome, halfling, goblin, hobgoblin, orc, and gnoll." },
    ];
  }

  return [
    { name: "Bow Bonus", cost: 5, description: "+1 nas jogadas de ataque com arcos que não sejam bestas." },
    { name: "Cold Resistance", cost: 5, description: "+1 em testes de resistência contra ataques de frio e gelo." },
    {
      name: "Detect Secret Doors",
      cost: 5,
      description: "1 em 6 de notar portas disfarçadas ao passar a até 10 pés; procurando: 2 em 6 para secretas, 3 em 6 para disfarçadas.",
    },
    { name: "Health Bonus", cost: 10, description: "+1 no subatributo Health; pode ficar até 5 pontos acima de Fitness." },
    { name: "Heat Resistance", cost: 5, description: "+1 em testes de resistência contra ataques de calor e fogo." },
    { name: "Infravision, 60'", cost: 10, description: "Infravisão de 60 pés." },
    { name: "Less Sleep", cost: 5, description: "Precisa de apenas quatro horas de sono para ficar descansado." },
    { name: "Resistance", cost: 5, description: "30% de resistência a magias de sono e encantamento." },
    {
      name: "Stealth",
      cost: 10,
      description: "Quando sozinho e sem armadura metálica, os oponentes sofrem -4 na surpresa; a penalidade é -2 se abrir uma porta. Recebe +2 na própria surpresa.",
    },
    { name: "Sword Bonus", cost: 5, description: "+1 nas jogadas de ataque com espadas longas ou curtas." },
    { name: "Languages", cost: 0, description: "Comum, élfico, gnomo, halfling, goblin, hobgoblin, orc e gnoll." },
  ];
}

function getHalfOrcAbilityCatalog(isEn: boolean): CatalogAbility[] {
  if (isEn) {
    return [
      { name: "Active Sense of Smell", cost: 5, description: "Keen smell grants +1 to surprise checks." },
      { name: "Acute Taste", cost: 5, description: "+2 bonus on saving throws vs. imbibed poisons." },
      { name: "Attack Bonus", cost: 5, description: "+1 attack bonus with one weapon of choice." },
      { name: "Damage Bonus", cost: 5, description: "+1 damage bonus with one weapon of choice." },
      { name: "Fitness Bonus", cost: 10, description: "+1 to Fitness; can be up to 5 points higher than Health." },
      { name: "Stamina Bonus", cost: 10, description: "+1 to Stamina; can be up to 5 points higher than Muscle." },
      { name: "Infravision, 60'", cost: 10, description: "60-foot infravision range." },
      {
        name: "Mining Detection Abilities",
        cost: 5,
        description: "Concentrate 1 round to: depth underground 1–2/1d6; detect slope 1/1d4; detect new stone construction 1–2/1d6.",
      },
      { name: "Languages", cost: 0, description: "Common, orc, dwarf, goblin, hobgoblin, and ogre." },
    ];
  }

  return [
    { name: "Active Sense of Smell", cost: 5, description: "Olfato aguçado concede +1 em testes de surpresa." },
    { name: "Acute Taste", cost: 5, description: "+2 em testes de resistência contra venenos ingeridos." },
    { name: "Attack Bonus", cost: 5, description: "+1 de ataque com uma arma à escolha." },
    { name: "Damage Bonus", cost: 5, description: "+1 de dano com uma arma à escolha." },
    { name: "Fitness Bonus", cost: 10, description: "+1 no subatributo Fitness; pode ficar até 5 pontos acima de Health." },
    { name: "Stamina Bonus", cost: 10, description: "+1 no subatributo Stamina; pode ficar até 5 pontos acima de Muscle." },
    { name: "Infravision, 60'", cost: 10, description: "Infravisão de 60 pés." },
    {
      name: "Mining Detection Abilities",
      cost: 5,
      description: "Concentrando-se por 1 rodada pode: estimar profundidade subterrânea 1–2/1d6; detectar declive 1/1d4; detectar construção recente em pedra 1–2/1d6.",
    },
    { name: "Languages", cost: 0, description: "Comum, orc, anão, goblin, hobgoblin e ogro." },
  ];
}

function getHalfOgreAbilityCatalog(isEn: boolean): CatalogAbility[] {
  if (isEn) {
    return [
      { name: "Languages", cost: 0, description: "Common, ogre, orc, troll, stone giant, and gnoll." },
      {
        name: "Tough Hide",
        cost: 5,
        description: "Thick hide counts as natural armor, improving base AC; DM may grant an extra –1 AC vs. physical blows when armored.",
      },
    ];
  }

  return [
    { name: "Languages", cost: 0, description: "Comum, ogro, orc, troll, gigante das pedras e gnoll." },
    {
      name: "Tough Hide",
      cost: 5,
      description: "Pele grossa funciona como armadura natural, melhorando o AC base; o Mestre pode conceder –1 extra no AC contra golpes físicos quando em armadura.",
    },
  ];
}

function getHumanAbilityCatalog(isEn: boolean): CatalogAbility[] {
  if (isEn) {
    return [
      { name: "Open Class Advancement", cost: 0, description: "Humans ignore class level limits; advancement follows normal class rules." },
      { name: "Bonus Character Points", cost: 0, description: "Receives 10 character points to spend during creation." },
      { name: "Attack Bonus", cost: 5, description: "+1 attack bonus with one weapon of choice." },
      { name: "Balance Bonus", cost: 10, description: "+1 to the Balance subability score." },
      { name: "Experience Bonus", cost: 10, description: "+5% experience bonus." },
      { name: "Health Bonus", cost: 10, description: "+1 to the Health subability score." },
      { name: "Hit Point Bonus", cost: 10, description: "+1 hit point whenever new hit points are rolled." },
      {
        name: "Secret Doors",
        cost: 10,
        description: "1-in-6 to notice concealed doors when passing within 10 feet; searching: 2-in-6 secret doors, 3-in-6 concealed doors.",
      },
      {
        name: "Tough Hide",
        cost: 10,
        description: "Natural armor improves base AC (e.g., AC 8 unarmored); DM may grant an extra –1 AC vs physical blows when armored.",
      },
    ];
  }

  return [
    { name: "Open Class Advancement", cost: 0, description: "Humanos ignoram limites de nível por classe; avançam conforme as regras normais da classe." },
    { name: "Bonus Character Points", cost: 0, description: "Recebe 10 pontos de personagem extras para gastar na criação." },
    { name: "Attack Bonus", cost: 5, description: "+1 de ataque com uma arma à escolha." },
    { name: "Balance Bonus", cost: 10, description: "+1 no subatributo Balance." },
    { name: "Experience Bonus", cost: 10, description: "+5% de bônus de experiência." },
    { name: "Health Bonus", cost: 10, description: "+1 no subatributo Health." },
    { name: "Hit Point Bonus", cost: 10, description: "+1 PV sempre que novos pontos de vida forem rolados." },
    {
      name: "Secret Doors",
      cost: 10,
      description: "1 em 6 de notar portas disfarçadas ao passar a até 10 pés; procurando: 2 em 6 para portas secretas, 3 em 6 para disfarçadas.",
    },
    {
      name: "Tough Hide",
      cost: 10,
      description: "Pele funciona como armadura natural (ex.: AC 8 sem armadura); o Mestre pode conceder -1 extra no AC contra golpes físicos quando estiver em armadura.",
    },
  ];
}

function getDwarfAbilityCatalog(isEn: boolean): CatalogAbility[] {
  if (isEn) {
    return [
      { name: "Aim Bonus", cost: 10, description: "+1 to the Aim subability; also allows up to 5-point Dexterity subability spread." },
      { name: "Axe Bonus", cost: 5, description: "+1 to attack rolls with hand or battle axes." },
      { name: "Balance Bonus", cost: 10, description: "+1 to the Balance subability; also allows up to 5-point Dexterity subability spread." },
      { name: "Detect Evil", cost: 5, description: "Once per day may detect evil in creatures/individuals (not items or locations)." },
      { name: "Detect Secret Doors", cost: 5, description: "Detect secret and concealed doors as an elf." },
      { name: "Better Balance", cost: 10, description: "+1 to the Balance subability score. This allows a dwarven character to have more than a 4 point difference in the Dexterity subabilities." },
      { name: "Brewing", cost: 5, description: "+2 to the Brewing proficiency score. The dwarf must have this proficiency to gain this benefit." },
      { name: "Health Bonus", cost: 10, description: "+1 to the Health subability score." },
      { name: "Infravision, 30'", cost: 5, description: "30-foot infravision range (indicates stout blood)." },
      { name: "Infravision, 60'", cost: 10, description: "60-foot infravision range (stout halfling package)." },
      { name: "Constitution/Health Bonus", cost: 10, description: "A Constitution/Health score bonus of +1, because the dwarf is accustomed to the cold and often damp Underdark." },
      { name: "Reaction Bonus", cost: 5, description: "+1 to reaction rolls due to general acceptance of halflings." },
      { name: "Crossbow Bonus", cost: 5, description: "Dwarves gain a +1 attack bonus with any crossbow. Hurled weapons are limited in tunnels, and other bows require large pieces of wood which are not readily accessible." },
      { name: "Determine Stability", cost: 5, description: "By concentrating for one round, the character can determine if there will be a dangerous tremor, collapse, rockfall or slide when the character enters an area. The chance of success is 1–4 on 1d6." },
      { name: "Taunt", cost: 5, description: "Once per day may taunt as the 1st-level wizard spell." },
      { name: "Determine Age", cost: 5, description: "By examining a building or ruins, the dwarf stands an excellent chance of determining the approximate age of the structure. The chance of success is 1–5 on 1d6." },
      { name: "Dense Skin", cost: 10, description: "If the dwarf is struck by a blunt weapon, the character suffers only half the damage the attack would normally inflict." },
      { name: "Detect Poison", cost: 5, description: "By sniffing food or drink, the dwarf can determine if it has been poisoned. The chance of success is 1–4 on 1d6." },
      { name: "Evaluate Gems", cost: 5, description: "A dwarf with this ability can determine within 10% the value of any given gem." },
    { name: "Aim Bonus", cost: 10, description: "+1 no subatributo Aim; permite diferença de até 5 pontos entre subatributos de Destreza." },
      { name: "Expert Haggler", cost: 5, description: "Anything he purchases costs 10% less than the listed price." },
    { name: "Balance Bonus", cost: 10, description: "+1 no subatributo Balance; permite diferença de até 5 pontos entre subatributos de Destreza." },
    { name: "Detect Evil", cost: 5, description: "Uma vez por dia pode detectar mal em criaturas/indivíduos (não itens ou locais)." },
    { name: "Detect Secret Doors", cost: 5, description: "Detecta portas secretas/disfarçadas como um elfo." },
      { name: "Hit Point Bonus", cost: 10, description: "The dwarf gains an additional hit point each time the character attains a new level." },
      { name: "Illusion Resistant", cost: 5, description: "These dwarves gain a +2 bonus on attempts to disbelieve illusions." },
    { name: "Health Bonus", cost: 10, description: "+1 no subatributo Health." },
    { name: "Infravision, 30'", cost: 5, description: "Infravisão de 30 pés (indica sangue stout)." },
    { name: "Infravision, 60'", cost: 10, description: "Infravisão de 60 pés (pacote stout)." },
      { name: "Infravision, 60'", cost: 10, description: "Dwarves have infravision to 60 feet—the ability to see heat patterns given off by living warm-blooded creatures in the dark." },
    { name: "Reaction Bonus", cost: 5, description: "+1 em reações pela aceitação geral dos halflings." },
      { name: "Mace Bonus", cost: 5, description: "+1 to attack rolls with the footman's mace." },
      { name: "Meld into Stone", cost: 10, description: "Once a day a dwarf with this ability can meld into stone as a priest of the same level." },
    { name: "Taunt", cost: 5, description: "Uma vez por dia, pode zombar (Taunt) como mago de 1º nível." },
      { name: "Melee Combat Bonuses", cost: 10, description: "Dwarves have a +1 bonus to their attack rolls vs. orcs, half-orcs, goblins, and hobgoblins. Further, when ogres, half-ogres, ogre magi, trolls, giants, or titans fight dwarves, these aggressors suffer a –4 penalty on all attack rolls." },
      { name: "Mining Detection Abilities", cost: 10, description: "A character with this skill is familiar with mining, tunneling and stonework. By concentrating for one round the character can: Determine the approximate depth underground, 1–3 on 1d6. Detect any sliding or shifting walls or rooms, 1–4 on 1d6. Detect any grade or slope in the passage they are passing through, 1–5 on 1d6. Detect stonework traps, pits, and deadfalls, 1–3 on 1d6. Detect new construction in stonework, 1–5 on 1d6." },
      { name: "More Muscles", cost: 10, description: "+1 to the Muscle subability score. This allows a dwarven character to have more than a 4 point difference in the Strength subabilities." },
      { name: "Pick Bonus", cost: 5, description: "+1 to attack rolls with military picks." },
      { name: "Saving Throw Bonuses", cost: 10, description: "Dwarves gain bonuses to saving throws vs. poison and against magical attacks from rods, wands, and spells based on their Constitution/Health scores. Determine the dwarf's Constitution/Health score and consult the chart below: 4–6 | +1, 7–10 | +2, 11–13 | +3, 14–17 | +4, 18–20 | +5." },
      { name: "Short Sword Bonus", cost: 5, description: "+1 to attack rolls with short swords." },
      { name: "Stealth", cost: 10, description: "If the dwarf is not in metal armor, a –2 penalty is applied to opponent's surprise rolls if the dwarf is at least 90 feet ahead of a party of characters without this ability, or accompanied only by characters with equivalent stealth skills. The dwarf is also difficult to surprise himself and receives a +2 bonus to his own surprise rolls." },
      { name: "Stone Tell", cost: 10, description: "Once a day a dwarf with this ability can use the stone tell ability, as a priest of the same level." },
      { name: "Warhammer Bonus", cost: 5, description: "+1 to attack rolls with the war hammer." },
    ];
  }

  return [
    { name: "Axe Bonus", cost: 5, description: "+1 nas jogadas de ataque com machado de mão ou machado de batalha." },
    { name: "Better Balance", cost: 10, description: "+1 na sub-habilidade Equilíbrio. Permite ao anão ter mais de 4 pontos de diferença entre as sub-habilidades de Destreza." },
    { name: "Brewing", cost: 5, description: "+2 na proficiência de Cervejaria. O anão deve possuir essa proficiência para receber o benefício." },
    { name: "Close to the Earth", cost: 5, description: "Quando subterrâneo, cura 2 pontos de dano por noite, em vez de 1. Esse bônus não se aplica se o personagem estiver acima do solo." },
    { name: "Constitution/Health Bonus", cost: 10, description: "Bônus de +1 em Constituição/Health, pois o anão está acostumado ao frio e à umidade do Underdark." },
    { name: "Crossbow Bonus", cost: 5, description: "Anões ganham +1 nas jogadas de ataque com qualquer besta. Armas arremessadas são limitadas em túneis, e outros arcos exigem madeira grande, difícil de encontrar." },
    { name: "Determine Stability", cost: 5, description: "Concentrando-se por uma rodada, o personagem pode determinar se há risco de tremor, colapso, desabamento ou deslizamento ao entrar em uma área. Chance de sucesso: 1–4 em 1d6." },
    { name: "Determine Age", cost: 5, description: "Ao examinar uma construção ou ruína, o anão tem grande chance de determinar a idade aproximada da estrutura. Chance de sucesso: 1–5 em 1d6." },
    { name: "Dense Skin", cost: 10, description: "Se o anão for atingido por arma contundente, sofre apenas metade do dano normalmente causado." },
    { name: "Detect Poison", cost: 5, description: "Ao cheirar comida ou bebida, o anão pode determinar se está envenenada. Chance de sucesso: 1–4 em 1d6." },
    { name: "Evaluate Gems", cost: 5, description: "O anão pode determinar o valor de uma gema com margem de erro de até 10%." },
    { name: "Expert Haggler", cost: 5, description: "Tudo que compra custa 10% menos que o preço tabelado." },
    { name: "Hit Point Bonus", cost: 10, description: "O anão ganha +1 ponto de vida cada vez que sobe de nível." },
    { name: "Illusion Resistant", cost: 5, description: "Esses anões recebem +2 nas tentativas de desacreditar ilusões." },
    { name: "Improved Stamina", cost: 10, description: "+1 na sub-habilidade Vigor. Permite ao anão ter mais de 4 pontos de diferença entre as sub-habilidades de Força." },
    { name: "Infravision, 60'", cost: 10, description: "Anões têm infravisão de 60 pés—capacidade de enxergar padrões de calor emitidos por criaturas de sangue quente no escuro." },
    { name: "Mace Bonus", cost: 5, description: "+1 nas jogadas de ataque com maça de infantaria." },
    { name: "Meld into Stone", cost: 10, description: "Uma vez por dia, pode fundir-se à pedra como sacerdote de mesmo nível." },
    { name: "Melee Combat Bonuses", cost: 10, description: "Anões têm +1 nas jogadas de ataque contra orcs, meio-orcs, goblins e hobgoblins. Quando ogros, meio-ogros, ogre magi, trolls, gigantes ou titãs lutam contra anões, esses agressores sofrem penalidade de –4 em todas as jogadas de ataque." },
    { name: "Mining Detection Abilities", cost: 10, description: "Personagem familiarizado com mineração, escavação e pedra. Concentrando-se por uma rodada pode: determinar profundidade (1–3 em 1d6), detectar paredes móveis (1–4 em 1d6), detectar declive (1–5 em 1d6), detectar armadilhas/pits/queda de rochas (1–3 em 1d6), detectar construção nova em pedra (1–5 em 1d6)." },
    { name: "More Muscles", cost: 10, description: "+1 na sub-habilidade Músculo. Permite ao anão ter mais de 4 pontos de diferença entre as sub-habilidades de Força." },
    { name: "Pick Bonus", cost: 5, description: "+1 nas jogadas de ataque com picareta militar." },
    { name: "Saving Throw Bonuses", cost: 10, description: "Anões recebem bônus em testes de resistência contra venenos e ataques mágicos de bastões, varinhas e magias, de acordo com o valor de Constituição/Health: 4–6 | +1, 7–10 | +2, 11–13 | +3, 14–17 | +4, 18–20 | +5." },
    { name: "Short Sword Bonus", cost: 5, description: "+1 nas jogadas de ataque com espada curta." },
    { name: "Stealth", cost: 10, description: "Se não estiver usando armadura metálica, aplica penalidade de –2 na surpresa dos oponentes se estiver pelo menos 90 pés à frente de um grupo sem essa habilidade, ou acompanhado apenas de personagens com furtividade equivalente. O anão também é difícil de ser surpreendido e recebe +2 na própria surpresa." },
    { name: "Stone Tell", cost: 10, description: "Uma vez por dia, pode usar stone tell como sacerdote de mesmo nível." },
    { name: "Warhammer Bonus", cost: 5, description: "+1 nas jogadas de ataque com martelo de guerra." },
  ];
}

function getGnomeAbilityCatalog(isEn: boolean): CatalogAbility[] {
  if (isEn) {
    return [
      { name: "Animal Friendship", cost: 10, description: "Once a day gains animal friendship (as the priest spell) for burrowing animals." },
      { name: "Melee Combat Bonus", cost: 10, description: "+1 attack vs. kobolds and goblins; gnolls, bugbears, ogres, half-ogres, ogre magi, trolls, giants, and titans suffer –4 to hit gnomes." },
      { name: "Dagger Bonus", cost: 5, description: "+1 to attack rolls with daggers." },
      { name: "Dart Bonus", cost: 5, description: "+1 to attack rolls with darts." },
      { name: "Defensive Bonus", cost: 5, description: "+1 to Armor Class when in their native underground environment." },
      { name: "Engineering Bonus", cost: 5, description: "+2 bonus to engineering proficiency (requires the proficiency)." },
      { name: "Forest Movement", cost: 10, description: "Can pass without trace through native woodland, as the druidic ability." },
      { name: "Freeze", cost: 10, description: "Can freeze in place in underground environment; 60% chance not to be noticed by passersby." },
      { name: "Hide", cost: 10, description: "Can hide in woods with chance equal to a thief of the same level's hide in shadows." },
      { name: "Infravision, 60'", cost: 10, description: "Infravision range is 60 feet." },
      { name: "Mining Detection Abilities", cost: 10, description: "Concentrate 1 round to: depth underground 1–4/1d6; approximate direction 1–3/1d6; detect slope 1–5/1d6; detect unsafe stone 1–7/1d10." },
      { name: "Short Sword Bonus", cost: 5, description: "+1 to attack rolls with short swords." },
      { name: "Saving Throw Bonus", cost: 5, description: "Bonus vs. magical wands, staves, rods, spells based on Constitution/Health: 4–6 +1; 7–10 +2; 11–13 +3; 14–17 +4; 18–20 +5." },
      { name: "Potion Identification", cost: 5, description: "Percent chance equal to Wisdom to identify a potion by appearance and scent." },
      { name: "Reason Bonus", cost: 10, description: "+1 to the Reason subability score." },
      { name: "Sling Bonus", cost: 5, description: "+1 to attack rolls with slings." },
      { name: "Stealth", cost: 10, description: "If not in metal armor, opponents suffer –4 to surprise rolls if the gnome is 90 feet ahead of non-stealthy allies; gnome gains +2 to own surprise rolls." },
    ];
  }

  return [
    { name: "Animal Friendship", cost: 10, description: "Uma vez por dia, ganha animal friendship (como a magia de sacerdote) com animais escavadores." },
    { name: "Melee Combat Bonus", cost: 10, description: "+1 de ataque contra kobolds e goblins; gnolls, bugbears, ogros, meio-ogros, ogre magi, trolls, gigantes e titãs sofrem –4 para acertar gnomos." },
    { name: "Dagger Bonus", cost: 5, description: "+1 nas jogadas de ataque com adagas." },
    { name: "Dart Bonus", cost: 5, description: "+1 nas jogadas de ataque com dardos." },
    { name: "Defensive Bonus", cost: 5, description: "+1 na CA quando estiver em ambiente subterrâneo nativo." },
    { name: "Engineering Bonus", cost: 5, description: "+2 na proficiência de engenharia (requer possuir a proficiência)." },
    { name: "Forest Movement", cost: 10, description: "Pode passar sem deixar rastros em seu bosque nativo, como a habilidade druídica." },
    { name: "Freeze", cost: 10, description: "Pode ficar imóvel em ambiente subterrâneo; 60% de chance de não ser notado." },
    { name: "Hide", cost: 10, description: "Pode se esconder em florestas com chance igual à habilidade esconder-se nas sombras de um ladrão do mesmo nível." },
    { name: "Infravision, 60'", cost: 10, description: "Infravisão de 60 pés." },
    { name: "Mining Detection Abilities", cost: 10, description: "Concentrando-se por 1 rodada pode: profundidade 1–4/1d6; direção 1–3/1d6; declive 1–5/1d6; perigo estrutural 1–7/1d10." },
    { name: "Short Sword Bonus", cost: 5, description: "+1 nas jogadas de ataque com espadas curtas." },
    { name: "Saving Throw Bonus", cost: 5, description: "Bônus em testes de resistência contra varinhas, cajados, bastões e magias conforme Constituição/Health: 4–6 +1; 7–10 +2; 11–13 +3; 14–17 +4; 18–20 +5." },
    { name: "Potion Identification", cost: 5, description: "Chance percentual igual à Sabedoria para identificar uma poção por aparência e aroma." },
    { name: "Reason Bonus", cost: 10, description: "+1 no subatributo Reason." },
    { name: "Sling Bonus", cost: 5, description: "+1 nas jogadas de ataque com fundas." },
    { name: "Stealth", cost: 10, description: "Se não estiver em armadura metálica, aplica –4 na surpresa de oponentes se estiver 90 pés à frente de aliados sem furtividade; recebe +2 na própria surpresa." },
  ];
}

function getHalflingAbilityCatalog(isEn: boolean): CatalogAbility[] {
  if (isEn) {
    return [
      { name: "Aim Bonus", cost: 10, description: "+1 to the Aim subability score. Also relaxes Dexterity subability spread to a 5-point difference (vs. default 4)." },
      { name: "Attack Bonus", cost: 5, description: "+1 attack bonus with hurled weapons and slings." },
      { name: "Balance Bonus", cost: 10, description: "+1 to the Balance subability score. Also relaxes Dexterity subability spread to a 5-point difference (vs. default 4)." },
      { name: "Detect Evil", cost: 5, description: "Once per day, may detect evil in creatures/individuals (not items or locations)." },
      { name: "Detect Secret Doors", cost: 5, description: "Detect secret and concealed doors as an elf." },
      { name: "Hide", cost: 10, description: "Can hide in woods with chance equal to a thief of same level's hide in shadows." },
      { name: "Health Bonus", cost: 10, description: "+1 to the Health subability score." },
      { name: "Infravision, 30'", cost: 5, description: "30-foot infravision range (indicates stout blood in lineage)." },
      { name: "Infravision, 60'", cost: 10, description: "60-foot infravision range (stout halfling package)." },
      { name: "Mining Detection Abilities", cost: 5, description: "Concentrate 1 round to: determine depth underground 1–3/1d6; direction 1–3/1d6; detect slope 1–3/1d4; unsafe stone 1–7/1d10." },
      { name: "Reaction Bonus", cost: 5, description: "+1 to reaction rolls because other races tend to accept halflings." },
      { name: "Saving Throw Bonuses", cost: 10, description: "Bonuses vs. magic and poison based on Constitution/Health: 4–6 +1; 7–10 +2; 11–13 +3; 14–17 +4; 18–20 +5." },
      { name: "Secret Doors", cost: 5, description: "1-in-6 chance to notice concealed doors when passing within 10 feet; if actively searching, 2-in-6 to find secret doors and 3-in-6 to notice concealed doors." },
      { name: "Stealth", cost: 10, description: "If not wearing metal armor, opponents suffer -4 to their surprise rolls; the penalty is -2 if the halfling is opening a door. Also difficult to surprise, the halfling gains +2 to own surprise rolls." },
      { name: "Taunt", cost: 5, description: "Once per day, may taunt as per the 1st-level wizard spell." },
    ];
  }

  return [
    { name: "Aim Bonus", cost: 10, description: "+1 no subatributo Aim. Afrouxa a diferença permitida entre subatributos de Destreza para até 5 (vs. 4 padrão)." },
    { name: "Attack Bonus", cost: 5, description: "+1 de ataque com armas arremessadas e fundas." },
    { name: "Balance Bonus", cost: 10, description: "+1 no subatributo Balance. Afrouxa a diferença permitida entre subatributos de Destreza para até 5 (vs. 4 padrão)." },
    { name: "Detect Evil", cost: 5, description: "Uma vez por dia pode detectar mal em criaturas/indivíduos (não funciona em itens ou locais)." },
    { name: "Detect Secret Doors", cost: 5, description: "Detecta portas secretas e disfarçadas como um elfo." },
    { name: "Hide", cost: 10, description: "Pode se esconder em florestas com chance igual à habilidade esconder-se nas sombras de um ladrão do mesmo nível." },
    { name: "Health Bonus", cost: 10, description: "+1 no subatributo Health." },
    { name: "Infravision, 30'", cost: 5, description: "Infravisão de 30 pés (indica sangue stout na linhagem)." },
    { name: "Infravision, 60'", cost: 10, description: "Infravisão de 60 pés (pacote stout)." },
    { name: "Mining Detection Abilities", cost: 5, description: "Concentrando-se por 1 rodada pode: determinar profundidade subterrânea 1–3/1d6; direção aproximada 1–3/1d6; declive 1–3/1d4; pedra insegura 1–7/1d10." },
    { name: "Reaction Bonus", cost: 5, description: "+1 em reações porque outras raças tendem a aceitar halflings." },
    { name: "Saving Throw Bonuses", cost: 10, description: "Bônus contra magia e veneno conforme Constituição/Health: 4–6 +1; 7–10 +2; 11–13 +3; 14–17 +4; 18–20 +5." },
    { name: "Secret Doors", cost: 5, description: "1 em 6 de notar portas disfarçadas ao passar a até 10 pés; procurando ativamente, 2 em 6 para portas secretas e 3 em 6 para portas disfarçadas." },
    { name: "Stealth", cost: 10, description: "Se não estiver em armadura metálica, os oponentes sofrem -4 na surpresa; a penalidade é -2 se o halfling estiver abrindo uma porta. O halfling também é difícil de ser surpreendido e recebe +2 na própria surpresa." },
    { name: "Taunt", cost: 5, description: "Uma vez por dia, pode zombar/irritar como a magia Taunt de mago de 1º nível." },
  ];
}

export default async function RacaCustosPage({
  params,
  searchParams,
}: {
  params: Promise<{ raca: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = getLocaleFromSearchParams((await searchParams) ?? {});
  const isEn = locale === "en";
  const { raca } = await params;

  const db = prisma as any;
  const races = await db.raceBase.findMany({
    orderBy: { name: "asc" },
    include: {
      abilities: {
        orderBy: { name: "asc" },
      },
      subRaces: {
        orderBy: { name: "asc" },
        include: {
          standardAbilities: {
            include: {
              raceAbility: true,
            },
          },
        },
      },
    },
  });

  const race = races.find((item: { name: string }) => toSlug(item.name) === raca);
  if (!race) notFound();
  const raceSlug = toSlug(race.name);

  const benefits = race.abilities.filter((item: { kind: string }) => item.kind === "BENEFIT");
  const penalties = race.abilities.filter((item: { kind: string }) => item.kind === "PENALTY");
  const nonZeroAdjustments = [
    { label: "STR", value: race.strengthAdjustment },
    { label: "CON", value: race.constitutionAdjustment },
    { label: "DEX", value: race.dexterityAdjustment },
    { label: "WIS", value: race.wisdomAdjustment },
    { label: "INT", value: race.intelligenceAdjustment },
    { label: "CHA", value: race.charismaAdjustment },
  ].filter((item) => (item.value ?? 0) !== 0);

  const defaultSubraceByRaceSlug: Record<string, string[]> = {
    elf: ["high-elf", "high-elves"],
    dwarf: ["hill-dwarf", "hill-dwarves"],
    gnome: ["rock-gnome", "rock-gnomes"],
    "half-elf": ["standard-half-elf"],
    "half-orc": ["standard-half-orc"],
    "half-ogre": ["standard-half-ogre"],
    human: ["standard-human"],
    halfling: ["hairfoot-halfling", "hairfoot-halflings"],
  };

  const preferredDefaultSlugs = defaultSubraceByRaceSlug[raceSlug] ?? [];

  const defaultSubRace =
    race.subRaces.find((item: { name: string }) => {
      const slug = toSlug(item.name);
      return preferredDefaultSlugs.includes(slug);
    }) ?? null;

  const defaultSubRaceAbilities = defaultSubRace
    ? [...defaultSubRace.standardAbilities]
        .map((link: { raceAbility: { id: number; name: string; cost: number; kind: string } }) => link.raceAbility)
        .sort((a: { kind: string; name: string }, b: { kind: string; name: string }) => {
          const aPenalty = a.kind === "PENALTY" ? 1 : 0;
          const bPenalty = b.kind === "PENALTY" ? 1 : 0;
          if (aPenalty !== bPenalty) return aPenalty - bPenalty;
          return a.name.localeCompare(b.name);
        })
    : benefits
        .slice()
        .sort((a: { kind: string; name: string }, b: { kind: string; name: string }) => a.name.localeCompare(b.name));

  const benefitRows: BenefitRow[] = benefits.map((ability: { id: number; name: string; cost: number; fullDescription: string | null; description: string | null }) => ({
    key: String(ability.id),
    name: ability.name,
    cost: ability.cost,
    description: getAbilityDescription(raceSlug, ability.name, isEn, ability.fullDescription || ability.description || "—"),
  }));

  const standardSubRaceName = defaultSubRace?.name ?? race.name;
  const standardSubRaceCost = (defaultSubRace as any)?.characterPointCost ?? (race as any)?.characterPointCost ?? "—";

  if (raceSlug === "dwarf") {
    const existing = new Set(benefitRows.map((row: BenefitRow) => normalizeAbilityName(row.name)));
    const extras = getDwarfAbilityCatalog(isEn)
      .filter((ability) => !existing.has(normalizeAbilityName(ability.name)))
      .map((ability) => ({
        key: `catalog-${normalizeAbilityName(ability.name)}`,
        name: ability.name,
        cost: ability.cost,
        description: ability.description,
      }));

    benefitRows.push(...extras);
    benefitRows.sort((a: BenefitRow, b: BenefitRow) => a.name.localeCompare(b.name));
  }

  if (raceSlug === "gnome") {
    const existing = new Set(benefitRows.map((row: BenefitRow) => normalizeAbilityName(row.name)));
    const extras = getGnomeAbilityCatalog(isEn)
      .filter((ability) => !existing.has(normalizeAbilityName(ability.name)))
      .map((ability) => ({
        key: `catalog-${normalizeAbilityName(ability.name)}`,
        name: ability.name,
        cost: ability.cost,
        description: ability.description,
      }));

    benefitRows.push(...extras);
    benefitRows.sort((a: BenefitRow, b: BenefitRow) => a.name.localeCompare(b.name));
  }

  if (raceSlug === "half-elf") {
    const existing = new Set(benefitRows.map((row: BenefitRow) => normalizeAbilityName(row.name)));
    const extras = getHalfElfAbilityCatalog(isEn)
      .filter((ability) => !existing.has(normalizeAbilityName(ability.name)))
      .map((ability) => ({
        key: `catalog-${normalizeAbilityName(ability.name)}`,
        name: ability.name,
        cost: ability.cost,
        description: ability.description,
      }));

    benefitRows.push(...extras);
    benefitRows.sort((a: BenefitRow, b: BenefitRow) => a.name.localeCompare(b.name));
  }

  if (raceSlug === "half-ogre") {
    const existing = new Set(benefitRows.map((row: BenefitRow) => normalizeAbilityName(row.name)));
    const extras = getHalfOgreAbilityCatalog(isEn)
      .filter((ability) => !existing.has(normalizeAbilityName(ability.name)))
      .map((ability) => ({
        key: `catalog-${normalizeAbilityName(ability.name)}`,
        name: ability.name,
        cost: ability.cost,
        description: ability.description,
      }));

    benefitRows.push(...extras);
    benefitRows.sort((a: BenefitRow, b: BenefitRow) => a.name.localeCompare(b.name));
  }

  if (raceSlug === "half-orc") {
    const existing = new Set(benefitRows.map((row: BenefitRow) => normalizeAbilityName(row.name)));
    const extras = getHalfOrcAbilityCatalog(isEn)
      .filter((ability) => !existing.has(normalizeAbilityName(ability.name)))
      .map((ability) => ({
        key: `catalog-${normalizeAbilityName(ability.name)}`,
        name: ability.name,
        cost: ability.cost,
        description: ability.description,
      }));

    benefitRows.push(...extras);
    benefitRows.sort((a: BenefitRow, b: BenefitRow) => a.name.localeCompare(b.name));
  }

  if (raceSlug === "human") {
    const existing = new Set(benefitRows.map((row: BenefitRow) => normalizeAbilityName(row.name)));
    const extras = getHumanAbilityCatalog(isEn)
      .filter((ability) => !existing.has(normalizeAbilityName(ability.name)))
      .map((ability) => ({
        key: `catalog-${normalizeAbilityName(ability.name)}`,
        name: ability.name,
        cost: ability.cost,
        description: ability.description,
      }));

    benefitRows.push(...extras);
    benefitRows.sort((a: BenefitRow, b: BenefitRow) => a.name.localeCompare(b.name));
  }

  if (raceSlug === "halfling") {
    const existing = new Set(benefitRows.map((row: BenefitRow) => normalizeAbilityName(row.name)));
    const extras = getHalflingAbilityCatalog(isEn)
      .filter((ability) => !existing.has(normalizeAbilityName(ability.name)))
      .map((ability) => ({
        key: `catalog-${normalizeAbilityName(ability.name)}`,
        name: ability.name,
        cost: ability.cost,
        description: ability.description,
      }));

    benefitRows.push(...extras);
    benefitRows.sort((a: BenefitRow, b: BenefitRow) => a.name.localeCompare(b.name));
  }

  return (
    <PublicShell
      locale={locale}
      currentPath="/racas"
      title={isEn ? `${race.name} · Costs and abilities` : `${race.name} · Custos e habilidades`}
      description={
        isEn
          ? "Reference page for standard subrace package, abilities, and penalties."
          : "Página de referência para subraça padrão, habilidades e penalidades."
      }
    >
      <div className="space-y-6">
        <section className="rounded-xl border border-[var(--graphite)] bg-[var(--black-soft)] p-4">
          <h2 className="text-lg font-semibold text-[var(--gold-primary)]">{isEn ? "Racial variant rules" : "Regras de variantes raciais"}</h2>
          <div className="mt-3 whitespace-pre-line text-sm text-[var(--text-secondary)]">
            {isEn
              ? "Characters can be built from standard races and many off-shoot racial variants. A player may buy the standard subrace package, or customize the character by purchasing individual racial abilities from that race's list. In most cases, buying the package is the most efficient way to spend character points.\n\nSubrace language packages are granted at no additional character-point cost. However, the number of languages known cannot exceed what the character's Intelligence/Knowledge score allows. If a racial package offers more languages than the character can know, the player chooses which languages are actually known.\n\nCharacter points can be saved during race construction, but with limits: demihuman characters can keep up to 5 points for other parts of character creation, humans can keep up to 10, and nonstandard races such as lizard men and thri-kreen cannot save unspent racial points."
              : "Personagens podem ser construídos a partir de raças padrão e de várias variantes raciais. O jogador pode comprar o pacote padrão da subraça ou personalizar o personagem adquirindo habilidades raciais individuais da lista daquela raça. Na maior parte dos casos, comprar o pacote é a forma mais eficiente de gastar pontos de personagem.\n\nPacotes de idiomas da subraça são concedidos sem custo adicional em pontos de personagem. Ainda assim, o número de idiomas conhecidos não pode ultrapassar o limite permitido pelo valor de Inteligência/Conhecimento do personagem. Se o pacote racial oferecer mais idiomas do que o personagem pode conhecer, o jogador escolhe quais idiomas serão efetivamente conhecidos.\n\nPontos de personagem podem ser guardados na etapa racial, com limite: personagens demi-humanos podem reservar até 5 pontos para outras etapas da criação, humanos podem reservar até 10, e raças não padrão, como homens-lagarto e thri-kreen, não podem guardar pontos raciais não gastos."}
          </div>
        </section>

        <section className="rounded-xl border border-[var(--info)] bg-[var(--info-bg)] p-4">
          <h2 className="text-lg font-semibold text-[var(--white-primary)]">{isEn ? "Base race characteristics" : "Características da raça padrão"}</h2>
          <div className="mt-3 grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-3 text-sm text-[var(--text-secondary)]">
              <div className="rounded-md border border-[var(--graphite)] bg-[var(--black-elevated)] px-3 py-2">
                <p className="text-[var(--white-muted)]">{isEn ? "Standard subrace" : "Subraça padrão"}</p>
                <p className="mt-1 font-semibold text-[var(--white-primary)]">{standardSubRaceName}</p>
              </div>

              <div className="rounded-md border border-[var(--graphite)] bg-[var(--black-elevated)] px-3 py-2">
                <p className="text-[var(--white-muted)]">{isEn ? "Subrace package cost" : "Custo do pacote de subraça"}</p>
                <p className="mt-1 font-semibold text-[var(--white-primary)]">{standardSubRaceCost}</p>
              </div>

              <div className="rounded-md border border-[var(--graphite)] bg-[var(--black-elevated)] px-3 py-2">
                <p className="text-[var(--white-muted)]">{isEn ? "Class point budget" : "Orçamento de pontos de classe"}</p>
                <p className="mt-1 font-semibold text-[var(--white-primary)]">{race.classPointBudget}</p>
              </div>

              <div className="rounded-md border border-[var(--graphite)] bg-[var(--black-elevated)] px-3 py-2">
                <p className="text-[var(--white-muted)]">{isEn ? "Attribute adjustments" : "Ajustes de atributo"}</p>
                {nonZeroAdjustments.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {nonZeroAdjustments.map((item) => (
                      <span
                        key={item.label}
                        className="rounded-md border border-[var(--graphite)] bg-[var(--black-soft)] px-2 py-1 text-xs font-semibold text-[var(--white-primary)]"
                      >
                        {item.label} {statText(item.value)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-[var(--white-muted)]">{isEn ? "No non-zero adjustments." : "Sem ajustes diferentes de zero."}</p>
                )}
              </div>

              <div className="rounded-md border border-[var(--graphite)] bg-[var(--black-elevated)] px-3 py-2">
                <p className="text-[var(--white-muted)]">{isEn ? "Standard abilities and points" : "Habilidades padrão e pontos"}</p>
                <ul className="mt-2 space-y-1 text-[var(--white-primary)]">
                  {defaultSubRaceAbilities.map((ability: { id: number; name: string; cost: number }) => (
                    <li key={ability.id} className="flex items-center justify-between gap-3 border-b border-[var(--graphite)]/60 pb-1 last:border-b-0">
                      <span>{ability.name}</span>
                      <span className="font-semibold">{ability.cost}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <img
              src={getRaceCostsImageSrc(raceSlug)}
              alt={isEn ? "Standard race image 2:3" : "Imagem da raça padrão 2:3"}
              className="aspect-[2/3] w-full rounded-lg border border-[var(--graphite)] object-cover"
            />
          </div>
        </section>

        <section className="rounded-xl border border-[var(--success)] bg-[var(--success-bg)] p-4">
          <h2 className="text-lg font-semibold text-[var(--white-primary)]">{isEn ? "Benefits" : "Benefícios"}</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm text-[var(--text-secondary)]">
              <thead>
                <tr className="border-b border-[var(--graphite)] text-[var(--white-primary)]">
                  <th className="px-2 py-2 font-semibold">{isEn ? "Ability" : "Habilidade"}</th>
                  <th className="px-2 py-2 font-semibold">{isEn ? "Cost" : "Custo"}</th>
                  <th className="px-2 py-2 font-semibold">{isEn ? "Description" : "Descrição"}</th>
                </tr>
              </thead>
              <tbody>
                {benefitRows.map((ability: BenefitRow) => (
                  <tr key={ability.key} className="border-b border-[var(--graphite)]/60 last:border-b-0">
                    <td className="px-2 py-2 font-semibold text-[var(--white-primary)]">{ability.name}</td>
                    <td className="px-2 py-2">{ability.cost}</td>
                    <td className="px-2 py-2">{ability.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--error)] bg-[var(--error-bg)] p-4">
          <h2 className="text-lg font-semibold text-[var(--white-primary)]">{isEn ? "Penalties" : "Penalidades"}</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm text-[var(--text-secondary)]">
              <thead>
                <tr className="border-b border-[var(--graphite)] text-[var(--white-primary)]">
                  <th className="px-2 py-2 font-semibold">{isEn ? "Ability" : "Habilidade"}</th>
                  <th className="px-2 py-2 font-semibold">{isEn ? "Cost" : "Custo"}</th>
                  <th className="px-2 py-2 font-semibold">{isEn ? "Description" : "Descrição"}</th>
                </tr>
              </thead>
              <tbody>
                {penalties.map((ability: { id: number; name: string; cost: number; fullDescription: string | null; description: string | null }) => (
                  <tr key={ability.id} className="border-b border-[var(--graphite)]/60 last:border-b-0">
                    <td className="px-2 py-2 font-semibold text-[var(--white-primary)]">{ability.name}</td>
                    <td className="px-2 py-2">{ability.cost}</td>
                    <td className="px-2 py-2">
                      {getAbilityDescription(raceSlug, ability.name, isEn, ability.fullDescription || ability.description || "—")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </section>

        <div className="flex flex-wrap gap-2">
          <Link
            href={withLang(`/racas/${raca}`, locale)}
            className="rounded-md border border-[var(--graphite)] px-4 py-2 text-sm font-semibold text-[var(--white-primary)] hover:bg-[var(--hover-gold-bg)] hover:border-[var(--hover-gold-border)]"
          >
            {isEn ? "Back to race" : "Voltar para raça"}
          </Link>
          <Link
            href={withLang("/racas", locale)}
            className="rounded-md border border-[var(--graphite)] px-4 py-2 text-sm font-semibold text-[var(--white-primary)] hover:bg-[var(--hover-gold-bg)] hover:border-[var(--hover-gold-border)]"
          >
            {isEn ? "Back to races" : "Voltar para raças"}
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}
