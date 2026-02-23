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

function getRaceGeneralImageSrc(raceSlug: string) {
  const imagePath = path.join(process.cwd(), "public", "images", "races", raceSlug, "general-2x3.png");
  if (existsSync(imagePath)) return `/images/races/${raceSlug}/general-2x3.png`;
  return "/images/races/default.svg";
}

export default async function RacaDetalhePage({
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
      subRaces: {
        orderBy: { name: "asc" },
      },
    },
  });

  const race = races.find((item: { name: string }) => toSlug(item.name) === raca);
  if (!race) notFound();
  const raceSlug = toSlug(race.name);
  const isElf = raceSlug === "elf";
  const isDwarf = raceSlug === "dwarf";
  const isGnome = raceSlug === "gnome";
  const isHuman = raceSlug === "human";
  const isHalfElf = raceSlug === "half-elf";
  const isHalfOrc = raceSlug === "half-orc";
  const isHalfOgre = raceSlug === "half-ogre";
  const isHalfling = raceSlug === "halfling";

  const elfOverviewPt =
    "Os elfos tendem a ser mais altos que os anões, e mais baixos e esguios que os humanos. Seus traços são angulares e bem definidos, e embora possam parecer frágeis, são rápidos e fortes. Quando necessário, tornam-se guerreiros ferozes, fazendo o que for preciso para proteger a si mesmos, seus lares e seus amigos. A maioria dos elfos mede entre 1,52 m e 1,68 m de altura e pesa por volta de 50 kg. Preferem viver em ambientes naturais, como florestas e bosques isolados. São caóticos por natureza, e outras raças às vezes os consideram frívolos e distantes.\n\nOs elfos são uma raça extremamente longeva, com média de cerca de 1.200 anos de vida. Isso ajuda a explicar parte de sua postura: a vida deve ser vivida com calma e prazer; não há necessidade de pressa para realizar as coisas; sempre há tempo para todas as atividades. Elfos gostam de cantar, dançar e encontrar beleza natural em tudo o que veem.\n\nTalvez por viverem tanto tempo, os elfos tenham dificuldade em criar amizade com raças de vida mais curta. Alguns não veem sentido em se aproximar de humanos, já que esses amigos envelhecem e morrem muito cedo. Ainda assim, os elfos que fazem amizades fora de sua raça tratam seus companheiros como iguais. Amigos — e inimigos — jamais são esquecidos.\n\nOs elfos são fascinados por magia e dedicam tempo e energia ao estudo das forças arcanas. Até mesmo magos humanos poderosos respeitam e admiram o entendimento élfico da magia.\n\nAs subraças élficas padrão são: aquatic, dark, gray, high e wood. Personagens élficos podem seguir as classes fighter, mage, cleric ou thief. Também podem escolher as combinações multiclasse fighter/mage, fighter/thief, fighter/mage/thief ou mage/thief.";

  const elfOverviewEn =
    "Elves tend to be taller than dwarves, and shorter and slimmer than humans. Their features are angular and finely chiseled, and although elves may appear thin and weak, they are actually quick and strong. When circumstances dictate, elves can be fierce warriors, taking any steps necessary to protect themselves, their homes, and their friends. Most elves are between 5 and 5 1/2' tall and weigh about 110 pounds. They prefer to live in natural settings such as secluded forests and groves. They are chaotic by nature, and other races sometimes consider elves frivolous and aloof.\n\nElves are an extremely long-lived race, averaging about 1,200 years. This may explain some of their attitudes—life is to be taken slowly and enjoyed; never rush about to accomplish things; there is plenty of time for all activities. Elves enjoy singing, dancing, and looking for the natural beauty in everything they see.\n\nPerhaps because they live so long, elves find it difficult to make friends with the shorter-lived races. Some elves don't want to bother getting close to humans when those friends will die of old age so soon. However, elves who do make friends outside their race treat their comrades as equals. Friends—and enemies—are never forgotten.\n\nElves are fascinated by magic and devote time and energy to studying arcane forces. Even powerful human mages respect and admire elves' understanding of magic.\n\nThe standard elven subraces are: aquatic, dark, gray, high, and wood. Player character elves can be the following classes: fighter, mage, cleric, or thief. They also can take the following multi-class combinations: fighter/mage, fighter/thief, fighter/mage/thief, or mage/thief.";

  const dwarfOverviewPt =
    "Os anões são uma raça baixa e robusta, com altura média em torno de 1,22 m a 1,37 m. Em geral têm pele avermelhada, cabelos escuros e olhar intenso. Vivem por cerca de 350 anos e costumam ser sérios, reservados e trabalhadores. Embora às vezes pareçam austeros, são reconhecidos por coragem, disciplina e firmeza. Têm pouco talento natural para magia, mas se destacam em combate, estratégia e ofícios como engenharia e mineração.\n\nA maioria dos anões vive em regiões de colinas e montanhas, em fortalezas escavadas na rocha. Sua cultura valoriza a terra, o metal e as gemas, com especial apreço por ouro. A resistência anã à magia também traz uma limitação: itens mágicos que não sejam adequados à classe do personagem podem falhar no uso.\n\nAs subraças anãs padrão são: deep, gray, hill e mountain. Personagens anões podem seguir as classes fighter, cleric ou thief. Também podem escolher as combinações multiclasse fighter/cleric e fighter/thief.";

  const dwarfOverviewEn =
    "Dwarves are a short, stocky people, averaging roughly 4 to 4 1/2 feet in height. They are often ruddy-complexioned, dark-haired, and sharp-eyed. Their natural life span is around 350 years, and they are usually serious, disciplined, and hardworking. Though sometimes considered dour or taciturn, dwarves are respected for courage and resolve. They have little natural talent for magic, but excel in warfare, craft, engineering, and stonework.\n\nMost dwarves live in hilly or mountainous regions, favoring underground halls carved from earth and stone. Their culture values mining and metalwork, with a well-known fondness for precious metals and gems. Their innate resistance to magic also creates a drawback: magical items that are not suited to the dwarf's class can malfunction when used.\n\nThe standard dwarven subraces are: deep, gray, hill, and mountain. Player character dwarves can be fighters, clerics, or thieves, and may also use the fighter/cleric and fighter/thief multi-class combinations.";

  const gnomeOverviewPt =
    "Gnomos medem em torno de 90 cm a 1,05 m de altura, são curiosos e meticulosos, com facilidade para resolver problemas e notar detalhes. Vivem cerca de 350 anos e têm tendência a colecionar curiosidades, contar histórias e testar pequenos experimentos. Seu temperamento é mais leve do que o dos anões, mas compartilham o apreço por artesanato, gemas e mecanismos.\n\nPreferem comunidades subterrâneas ou de encosta, com túneis bem organizados e áreas dedicadas a oficinas e bibliotecas. Gnomos são conhecidos por humor irônico e lealdade profunda aos amigos. Seu domínio sobre ilusões e engenharia permite abordagens criativas em combate e exploração.\n\nAs subraças padrão de gnomo são: deep (svirfneblin), forest e rock. Personagens gnomos podem seguir as classes fighter, cleric ou thief, e também podem escolher fighter/cleric ou fighter/thief como combinações multiclasse.";

  const gnomeOverviewEn =
    "Gnomes stand roughly 3 to 3 1/2 feet tall, are inquisitive and exacting, and have a knack for problem solving and noticing fine details. They live about 350 years and often collect oddities, tell elaborate stories, and tinker with small experiments. Their temperament is lighter than dwarves but they share a love of craft, gems, and mechanisms.\n\nGnomes prefer underground or hillside communities with orderly tunnels and dedicated workshops and archives. They are known for wry humor and deep loyalty to friends. Their command of illusions and engineering lets them approach combat and exploration with creativity.\n\nThe standard gnomish subraces are: deep (svirfneblin), forest, and rock. Player character gnomes can be fighters, clerics, or thieves, and may also choose the fighter/cleric or fighter/thief multi-class combinations.";

  const humanOverviewPt =
    "Humanos variam muito em aparência e cultura, com altura comum entre 1,60 m e 1,90 m e expectativa de vida curta (cerca de 70–90 anos). Têm reputação de adaptáveis e ambiciosos, formando cidades-estado, impérios ou caravanas nômades conforme o cenário. Sem limites naturais de nível, são os mais livres para avançar em qualquer classe disponível. Recebem 10 pontos de personagem extras para gastar na criação.\n\nNão possuem subraças padrão no POSP; o pacote padrão representa a base humana. Idiomas dependem do cenário, partindo do comum e variações regionais.\n\nPodem escolher qualquer classe que o mestre permita (incluindo kits e multiclasse específicos do cenário), usando sua flexibilidade para explorar papéis variados no grupo.";

  const humanOverviewEn =
    "Humans vary widely in appearance and culture, typically standing 5'4\" to 6'3\" tall with lifespans around 70–90 years. They are known for adaptability and ambition, building city-states, empires, or roaming caravans depending on the setting. With no racial level limits, they advance freely in any class. They also receive 10 bonus character points to spend during creation.\n\nHumans have no standard POSP subraces; the standard package represents the human baseline. Languages are setting-dependent, usually starting from Common and regional variants.\n\nThey may take any class the DM allows (including kits and specific multi-class options), leveraging flexibility to fill many party roles.";

  const halfOgreOverviewPt =
    "Meio-ogros são altos e robustos (geralmente acima de 2,10 m), misturando porte ogro com adaptabilidade humana. Têm pele espessa que funciona como armadura natural, mas o tamanho os torna alvos chamativos e mais fáceis de acertar. O pacote padrão inclui idiomas (comum, ogro, orc, troll, gigante das pedras, gnoll) e a pele resistente, mas também a desvantagem de ser um alvo grande.";

  const halfOgreOverviewEn =
    "Half-ogres are tall and bulky (often over 7 feet), blending ogre size with human adaptability. Their thick hide provides natural armor, but their size makes them conspicuous and easier to hit. The standard package covers languages (Common, ogre, orc, troll, stone giant, gnoll) and tough hide, along with the large-target drawback.";

  const halfElfOverviewPt =
    "Meio-elfos combinam traços humanos e élficos. Medem em torno de 1,65 m e 68 kg, e costumam ser diplomáticos e adaptáveis. Têm infravisão de 60 pés, 30% de resistência a magias de sono e encanto, e boa percepção para portas secretas. Precisam de apenas quatro horas de sono para descansar.\n\nPodem seguir as classes cleric, druid, fighter, ranger, mage, specialist wizard, thief ou bard. Combinações multiclasse comuns incluem cleric (ou druid)/fighter, cleric (ou druid)/fighter/mage, cleric/ranger, cleric (ou druid)/mage, fighter/mage, fighter/thief, fighter/mage/thief e mage/thief. O pacote padrão é único, mas os jogadores podem comprar habilidades individuais segundo o POSP.";

  const halfElfOverviewEn =
    "Half-elves blend human and elven traits. They average about 5 1/2 feet tall and 150 pounds, and are noted for diplomacy and adaptability. They gain 60-foot infravision, 30% resistance to sleep and charm magic, keen chances to notice secret doors, and need only four hours of sleep to rest.\n\nHalf-elves may be clerics, druids, fighters, rangers, mages, specialist wizards, thieves, or bards. Common multi-class options include cleric (or druid)/fighter, cleric (or druid)/fighter/mage, cleric/ranger, cleric (or druid)/mage, fighter/mage, fighter/thief, fighter/mage/thief, and mage/thief. The standard package is single, but players can buy individual abilities per POSP.";

  const halfOrcOverviewPt =
    "Meio-orcs combinam herança humana e orc. Têm altura semelhante a meio-elfos e podem passar por humanos em público, apesar de traços mais duros. Possuem infravisão de 60 pés e sofrem -2 em reações em sociedades humanas. O pacote padrão inclui idiomas (comum, orc, anão, goblin, hobgoblin, ogro).\n\nPodem ser fighter, cleric ou thief, e podem escolher qualquer combinação multiclasse de dois desses, mas não três. Jogadores recebem 15 pontos de personagem para habilidades raciais, podendo usar o pacote padrão (10) ou comprar habilidades individuais conforme o POSP.";

  const halfOrcOverviewEn =
    "Half-orcs blend human and orc heritage. They stand about as tall as half-elves and can often pass as human despite harsher features. They have 60-foot infravision and take a -2 reaction penalty in human societies. The standard package covers languages (common, orc, dwarf, goblin, hobgoblin, ogre).\n\nThey may be fighters, clerics, or thieves, and can multi-class in any two of those but not three. Players get 15 character points for racial abilities, spending them on the 10-point standard package or buying individual abilities per POSP.";

  const halflingOverviewPt =
    "Halflings medem entre 90 cm e 1,10 m e são ágeis, observadores e reservados com estranhos, mas calorosos entre amigos. Vivem em média 150 anos, preferem conforto simples, boa comida e uma vida de comunidade bem organizada. São mestres em furtividade, arremesso e sobrevivência rural, usando o próprio tamanho para se manter discretos.\n\nComunidades halflings costumam ficar em colinas e vales férteis, com túneis aconchegantes, hortas extensas e rotas de patrulha curtas e eficientes. Halflings valorizam hospitalidade, mas evitam riscos desnecessários, usando diplomacia, astúcia e fuga rápida antes de recorrer à violência.\n\nAs subraças padrão são: hairfoot (a mais comum), stout (mais robusta, com raízes próximas a anões) e tallfellow (mais alta e ligada a florestas). Personagens halflings podem ser thieves; em POSP têm acesso limitado a fighter e a combinações multiclasse específicas, conforme permitido pelo mestre.";

  const halflingOverviewEn =
    "Halflings stand roughly 3 to 3 1/2 feet tall and are quick, observant, and cautious around strangers but warm with friends. They live about 150 years, prefer simple comforts, good meals, and tightly knit communities. They excel at stealth, thrown weapons, and rural survival, leveraging their size to stay unnoticed.\n\nHalfling communities sit in gentle hills and fertile vales with snug burrows, broad gardens, and short, well-watched patrol routes. They prize hospitality yet avoid needless danger, leaning on diplomacy, cunning, and quick withdrawal before open force.\n\nThe standard subraces are: hairfoot (most common), stout (stockier, with ties to dwarves), and tallfellow (taller, woodland-linked). Player character halflings can be thieves; in POSP they have constrained access to fighter and specific multi-class options as allowed by the DM.";

  const raceOverview =
    isElf
      ? isEn
        ? elfOverviewEn
        : elfOverviewPt
      : isDwarf
        ? isEn
          ? dwarfOverviewEn
          : dwarfOverviewPt
        : isGnome
          ? isEn
            ? gnomeOverviewEn
            : gnomeOverviewPt
          : isHuman
            ? isEn
              ? humanOverviewEn
              : humanOverviewPt
          : isHalfElf
            ? isEn
              ? halfElfOverviewEn
              : halfElfOverviewPt
          : isHalfOrc
            ? isEn
              ? halfOrcOverviewEn
              : halfOrcOverviewPt
          : isHalfOgre
            ? isEn
              ? halfOgreOverviewEn
              : halfOgreOverviewPt
          : isHalfling
            ? isEn
              ? halflingOverviewEn
              : halflingOverviewPt
            : race.fullDescription ||
              race.description ||
              (isEn
                ? "This race defines baseline identity, subrace access, and progression constraints."
                : "Esta raça define identidade base, acesso a subraças e limites de progressão.");

  const attributes = [
    { label: "STR", value: race.strengthAdjustment },
    { label: "CON", value: race.constitutionAdjustment },
    { label: "DEX", value: race.dexterityAdjustment },
    { label: "WIS", value: race.wisdomAdjustment },
    { label: "INT", value: race.intelligenceAdjustment },
    { label: "CHA", value: race.charismaAdjustment },
  ];

  const classLimits = [
    { label: "Fighter", value: race.maxLevelFighter },
    { label: "Paladin", value: race.maxLevelPaladin },
    { label: "Ranger", value: race.maxLevelRanger },
    { label: "Thief", value: race.maxLevelThief },
    { label: "Bard", value: race.maxLevelBard },
    { label: "Wizard", value: race.maxLevelWizard },
    { label: "Illusionist", value: race.maxLevelIllusionist },
    { label: "Cleric", value: race.maxLevelCleric },
    { label: "Druid", value: race.maxLevelDruid },
  ];

  return (
    <PublicShell
      locale={locale}
      currentPath="/racas"
      title={race.name}
      description={
        isEn
          ? "General race page with profile explanation and statistical references."
          : "Página geral da raça com explicação de perfil e referências estatísticas."
      }
    >
      <div className="space-y-6">
        <section className="rounded-xl border border-[var(--graphite)] bg-[var(--black-soft)] p-4">
          <h2 className="text-lg font-semibold text-[var(--gold-bright)]">{isEn ? "General overview" : "Visão geral"}</h2>
          <div className="mt-3 grid gap-4 lg:grid-cols-[2fr_1fr]">
            <p className="whitespace-pre-line text-sm text-[var(--white-secondary)]">{raceOverview}</p>
            <img
              src={getRaceGeneralImageSrc(raceSlug)}
              alt={isEn ? "Race image 2:3" : "Imagem da raça 2:3"}
              className="aspect-[2/3] w-full rounded-lg border border-[var(--graphite)] object-cover"
            />
          </div>
        </section>

        <section className="rounded-xl border border-[var(--info)] bg-[var(--info-bg)] p-4">
          <h2 className="text-lg font-semibold text-[var(--white-primary)]">{isEn ? "Attribute adjustments" : "Ajustes de atributo"}</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-left text-sm text-[var(--text-secondary)]">
              <thead>
                <tr className="border-b border-[var(--graphite)] text-[var(--white-primary)]">
                  {attributes.map((item) => (
                    <th key={item.label} className="px-2 py-2 font-semibold">
                      {item.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {attributes.map((item) => (
                    <td key={item.label} className="px-2 py-2">
                      {statText(item.value)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--graphite)] bg-[var(--black-soft)] p-4">
          <h2 className="text-lg font-semibold text-[var(--gold-primary)]">{isEn ? "Class limits" : "Limites de classe"}</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm text-[var(--text-secondary)]">
              <thead>
                <tr className="border-b border-[var(--graphite)] text-[var(--white-primary)]">
                  {classLimits.map((item) => (
                    <th key={item.label} className="px-2 py-2 font-semibold">
                      {item.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {classLimits.map((item) => (
                    <td key={item.label} className="px-2 py-2">
                      {item.value ?? "—"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--warning)] bg-[var(--warning-bg)] p-4">
          <h2 className="text-lg font-semibold text-[var(--white-primary)]">{isEn ? "Subraces" : "Subraças"}</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {race.subRaces
              .map((subRace: { id: number; name: string; description?: string | null; languages?: string | null; characterPointCost: number }) => (
              <Link
                key={subRace.id}
                href={withLang(`/racas/${raca}/subracas/${toSlug(subRace.name)}`, locale)}
                className="rounded-md border border-[var(--gold-dark)] bg-[var(--hover-gold-bg)] px-3 py-2 text-sm text-[var(--white-primary)] hover:border-[var(--hover-gold-border)]"
              >
                <p className="font-semibold">{subRace.name}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {isEn ? "Class points" : "Pontos de classe"}: {subRace.characterPointCost}
                </p>
                {subRace.description ? (
                  <p className="mt-1 text-xs text-[var(--white-secondary)]">{subRace.description}</p>
                ) : null}
                {subRace.languages ? (
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--text-muted)]">{subRace.languages}</p>
                ) : null}
              </Link>
              ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          <Link
            href={withLang(`/racas/${raca}/custos`, locale)}
            className="rounded-md border border-[var(--gold-primary)] bg-[var(--gold-primary)] px-4 py-2 text-sm font-semibold text-[var(--black-deep)] hover:bg-[var(--gold-bright)] shadow-[var(--shadow-gold)]"
          >
            {isEn ? "View costs and abilities" : "Ver custos e habilidades"}
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
