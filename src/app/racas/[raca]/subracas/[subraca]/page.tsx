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

function getSubRaceImageSrc(raceSlug: string, subRaceKey: string) {
  const imagePath = path.join(process.cwd(), "public", "images", "races", raceSlug, subRaceKey, "portrait-2x3.png");
  if (existsSync(imagePath)) return `/images/races/${raceSlug}/${subRaceKey}/portrait-2x3.png`;
  return "/images/races/default.svg";
}

export default async function SubRacaDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ raca: string; subraca: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = getLocaleFromSearchParams((await searchParams) ?? {});
  const isEn = locale === "en";
  const { raca, subraca } = await params;

  const db = prisma as any;
  const races = await db.raceBase.findMany({
    orderBy: { name: "asc" },
    include: {
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
  const isElf = raceSlug === "elf";
  const isDwarf = raceSlug === "dwarf";
  const isGnome = raceSlug === "gnome";
  const isHalfling = raceSlug === "halfling";

  const subRace = race.subRaces.find((item: { name: string }) => toSlug(item.name) === subraca);
  if (!subRace) notFound();
  const subRaceSlug = toSlug(subRace.name);
  const subRaceSlugAliases: Record<string, string> = {
    "aquatic-elves": "aquatic-elf",
    "aquatic-elfs": "aquatic-elf",
    "dark-elves": "dark-elf",
    "dark-elfs": "dark-elf",
    "gray-elves": "gray-elf",
    "grey-elves": "gray-elf",
    "high-elves": "high-elf",
    "sylvan-wood-elves": "sylvan-wood-elf",
    "sylvan-elves": "sylvan-wood-elf",
    "sylvan-elf": "sylvan-wood-elf",
    "wood-elves": "sylvan-wood-elf",
    "wood-elf": "sylvan-wood-elf",
    "deep-dwarves": "deep-dwarf",
    "gray-dwarves": "gray-dwarf",
    "grey-dwarf": "gray-dwarf",
    "grey-dwarves": "gray-dwarf",
    "hill-dwarves": "hill-dwarf",
    "mountain-dwarves": "mountain-dwarf",
    "deep-gnomes": "deep-gnome",
    "forest-gnomes": "forest-gnome",
    "rock-gnomes": "rock-gnome",
    "hairfoot-halflings": "hairfoot-halfling",
    "stout-halflings": "stout-halfling",
    "tallfellow-halflings": "tallfellow-halfling",
  };
  const subRaceKey = subRaceSlugAliases[subRaceSlug] ?? subRaceSlug;
  const isHighElf = subRaceKey === "high-elf";

  const subRaceDescriptionPt: Record<string, string> = {
    "aquatic-elf":
      "Os elfos aquáticos, também chamados de elfos do mar, vivem em oceanos, baías, enseadas e outras regiões de água salgada. Patrulham águas rasas e profundas e mantêm cortes em recifes de coral vivo. Costumam ser vistos ao lado de golfinhos e atuam no combate às ameaças das profundezas, especialmente sahuagins e grandes predadores marinhos.\n\nA coloração da pele varia entre verde-prateado e azul-claro, e os cabelos geralmente seguem tons esverdeados. Possuem fendas branquiais e retiram o ar da água. Também conseguem permanecer fora d'água por um período, mas essa permanência é limitada e pode enfraquecê-los gradualmente.",
    "dark-elf":
      "Os elfos negros, também conhecidos como drow, vivem no subterrâneo. A maior parte dessa subraça é maligna e domina regiões do Underdark por meio de astúcia e crueldade. Muitas criaturas inteligentes os evitam, e eles são vistos como uma versão corrompida dos elfos da superfície.\n\nTêm pele muito escura, em geral negra, o que favorece deslocamento discreto no subsolo. Também tendem a ser mais baixos que outros elfos e apresentam olhos de brilho avermelhado. Embora raros, existem indivíduos de bom alinhamento, normalmente representados por personagens jogadores.",
    "gray-elf":
      "Os elfos cinzentos são considerados os mais nobres e reservados entre os elfos, dedicando grande parte da vida ao aprimoramento intelectual. Também chamados de faerie, afastaram-se do mundo comum e costumam surgir apenas diante de grandes ameaças. Esse distanciamento faz com que muitas pessoas — inclusive outros elfos — os enxerguem como arrogantes.\n\nSão altos e esguios, com olhos âmbar ou violetas e cabelos prateados ou dourado-pálido. Preferem vestes claras com mantos em tons escuros. Em sua maioria, seguem inclinação caótica e boa, mas personagens jogadores podem adotar outros alinhamentos.",
    "high-elf":
      "Os High Elves são a variedade élfica mais comum e também a mais aberta, amistosa e cooperativa. Servem como referência física para os elfos em geral, com cerca de 1,52 m de altura e peso em torno de 50 kg. Costumam ter pele clara e combinam diferentes variações de cabelo e olhos, com preferência por vestes em tons pastéis e capas adequadas à estação quando estão em campo.\n\nA maioria segue alinhamento caótico e bom, embora personagens jogadores possam adotar outras opções. Em jogo, mantêm os traços clássicos da raça élfica e carregam a penalidade característica para desacreditar ilusões.",
    "sylvan-wood-elf":
      "Os elfos silvestres, ou wood elves, descendem do mesmo tronco das demais linhagens élficas, mas preferem um estilo de vida mais primitivo e ligado às florestas ancestrais. Valorizam sobrevivência prática, observação do ambiente e tradições próprias, em vez de debates filosóficos ou estudos arcanos extensos.\n\nTendem a ser mais musculosos e de compleição mais escura do que outros elfos, com cabelos entre amarelo e cobre-avermelhado. Vestem-se em tons de verde e marrom para se misturar à mata. Ao contrário de outras linhagens, costumam inclinar-se mais para alinhamentos neutros, embora personagens jogadores possam variar.",
    "deep-dwarf":
      "Os deep dwarves vivem mais profundamente no subterrâneo do que seus parentes hill e mountain, preferindo isolamento e segurança em regiões remotas do mundo inferior. São mais esguios que outros anões, mas ainda fortes e resistentes, e se movem com facilidade em túneis estreitos escavados na rocha.\n\nTêm pouco contato com povos da superfície e mantêm hábitos voltados à sobrevivência no subsolo. Costumam tender a alinhamentos neutros (incluindo lawful neutral e chaotic neutral), embora personagens jogadores possam escolher qualquer alinhamento.",
    "gray-dwarf":
      "Os gray dwarves, também chamados duergar, vivem em áreas profundas do subterrâneo e costumam disputar recursos com outras comunidades anãs abaixo da superfície. São mais magros e de aparência mais severa que outras subraças, com cultura marcada por disciplina dura e desconfiança.\n\nRaramente sobem à superfície, pois a luz intensa lhes causa grande desconforto. A tradição dos duergar tende a alinhamentos lawful evil ou neutros, mas personagens jogadores podem variar.",
    "hill-dwarf":
      "Os hill dwarves são a subraça anã mais comum e adaptável, vivendo tanto em complexos subterrâneos quanto em assentamentos de superfície. Têm constituição robusta, pele em tons terrosos e forte vocação para trabalho constante, artesanato e defesa de comunidade.\n\nEm termos culturais, são conhecidos por disciplina e pragmatismo, com tendência frequente ao lawful good, embora personagens jogadores possam escolher outros alinhamentos.",
    "mountain-dwarf":
      "Os mountain dwarves habitam fortalezas isoladas sob cadeias montanhosas, valorizando privacidade, tradição e autonomia política. Em média são um pouco mais altos e pesados que os hill dwarves, com compleição muito sólida e forte identidade clânica.\n\nMuitas comunidades mountain mantêm cautela diante do mundo exterior e até certa reserva em relação a outros anões mais abertos. A tendência comum é lawful good, mas personagens jogadores podem seguir qualquer alinhamento permitido na campanha.",
    "deep-gnome":
      "Os deep gnomes, ou svirfneblin, vivem em cidades escondidas do Underdark e evitam o máximo de contato com a superfície. São extremamente furtivos e desconfiados, mas também engenhosos e disciplinados. Têm pele cinza-pedra, olhos em tons escuros e preferem vestimentas de cores neutras para se camuflar nas cavernas.\n\nEm jogo, mantêm afinidade forte com pedra e gemas, aliada a talentos de ilusão e furtividade. Por viverem tão profundamente, sofrem -2 em reações iniciais com outras raças e dependem bastante de planejamento, já que raramente contam com apoio externo. Alinhamentos tendem ao neutro (incluindo lawful/chaotic neutral), mas personagens jogadores podem variar conforme a campanha.",
    "forest-gnome":
      "Os forest gnomes vivem em comunidades minúsculas e secretas dentro de florestas antigas. Preferem harmonia com a natureza, evitam confrontos diretos e usam a magia de ilusão para permanecer invisíveis a estranhos. São ainda menores que outros gnomos, com pele acastanhada, cabelos castanho-claros ou loiros e roupas em tons de verde e marrom.\n\nNão possuem infravisão e dependem de prudência, amizades com animais e conhecimento do terreno para sobreviver. Em campanhas, costumam ser neutros ou neutro-bons, priorizando defesa do bosque, fuga inteligente e diplomacia antes de recorrer à força.",
    "rock-gnome":
      "Os rock gnomes são a subraça gnômica mais comum, conhecida por curiosidade incessante e paixão por mecanismos, joias e truques de ilusão. Vivem em colinas ou túneis bem organizados, cheios de oficinas e ferramentas. Têm pele bronzeada ou acobreada, cabelos em tons de cinza claro a marrom e olhos azuis brilhantes; barbas masculinas tendem a ser curtas e bem cuidadas.\n\nMantêm relações amistosas com anões e halflings, negociando metal, pedras preciosas e engenhocas. Em mesa, suas habilidades de mineração, percepção e ilusão trazem utilidade constante para exploração e social. Alinhamentos variam, mas a maioria é boa ou neutra, com senso de humor irônico e lealdade profunda aos amigos.",
    "hairfoot-halfling":
      "Os hairfoot são os halflings mais comuns: adoram conforto, boa comida e rotinas previsíveis. Vivem em colinas com tocas bem cuidadas, hortas e vizinhança tranquila. Pele morena clara a bronzeada, cabelos lisos (e pés peludos) são típicos; movem-se com muita leveza e silêncio.\n\nEm jogo, brilham em furtividade, arremesso e testes de resistência. Evitam confrontos frontais, preferindo diplomacia, emboscadas ou retirada. Tendem ao neutro-bom ou neutro, mas personagens podem variar conforme a campanha.",
    "stout-halfling":
      "Os stout são mais robustos e costumam viver perto de anões, adotando hábitos de mineração e comércio de pedra. Alguns mostram traços levemente élficos. Pele costuma ser mais pálida e a compleição é mais sólida do que a dos hairfoot.\n\nGanham infravisão e detecção de mineração, mas sofrem desconfiança dos elfos (-1 em reações). Mantêm ótima furtividade e arremessos. Alinhamentos variam, com leve inclinação a neutro ou neutro-bom; os jogadores ajustam ao tom da mesa.",
    "tallfellow-halfling":
      "Os tallfellow são um pouco mais altos e esguios, com laços fortes com elfos e bosques. Preferem casas em árvores ou tocas junto a florestas. Pele clara a dourada e cabelos loiros ou castanhos claros são comuns.\n\nPossuem afinidade com portas secretas, furtividade e arremessos. Sofrem -2 de reação com anões, refletindo atritos culturais. Em jogo, costumam ser neutro-bons ou neutros, valorizando liberdade, hospitalidade e paz local.",
  };

  const subRaceDescriptionEn: Record<string, string> = {
    "aquatic-elf":
      "Aquatic elves, also called sea elves, live in oceans, bays, inlets, and other bodies of salt water. They patrol both shallows and depths and rule from courts of living coral. They are often seen with dolphins and actively fight dangerous undersea threats, especially sahuagin and large marine predators.\n\nTheir skin tones range from silver-green to pale blue, and their hair usually follows greenish shades. They have gill slits and draw the air they need from water. They can also remain out of water for a period, but that limit matters and prolonged time away weakens them.",
    "dark-elf":
      "Dark elves, also known as drow, dwell underground. Most of this subrace is evil and has used cunning and cruelty to dominate parts of the Underdark. Many intelligent beings avoid them, and they are widely seen as a twisted form of surface elven kin.\n\nThey usually have very dark, often black skin that helps conceal movement below ground. They also tend to be shorter than other elves and are known for eyes with a red glow. Good-aligned individuals are rare, and are most often represented by player characters.",
    "gray-elf":
      "Gray elves are considered the most noble and reclusive among elvenkind, devoting much of their lives to intellectual refinement. Also called faerie elves, they withdrew from the wider world and usually emerge only when great evils must be confronted. This distance makes many people—including other elves—see them as arrogant.\n\nThey are tall and slender, with amber or violet eyes and silver or pale-golden hair. They favor light garments with darker cloaks. Most tend toward chaotic good, though player characters may follow other alignments.",
    "high-elf":
      "High elves are the most common elven type and also the most open, friendly, and cooperative. They are often treated as the physical baseline for elvenkind, standing around 5 feet tall and weighing roughly 110 pounds. They are usually fair-skinned, with varied hair and eye combinations, and prefer pastel clothing with seasonal cloaks when adventuring outdoors.\n\nMost high elves are chaotic good, though player characters may choose other alignments. In play, they keep core elven strengths and carry their characteristic penalty when attempting to disbelieve illusions.",
    "sylvan-wood-elf":
      "Sylvan elves, or wood elves, descend from the same stock as other elves but prefer a more primitive lifestyle tied to ancient forests. They value practical survival, close environmental awareness, and traditional customs over philosophical debate or extensive arcane study.\n\nThey are usually more muscular and darker-complexioned than other elves, with hair ranging from yellow to copper-red. Their clothing favors green and brown tones for woodland camouflage. Unlike many other elven lines, they often lean toward neutral alignments, though player characters may vary.",
    "deep-dwarf":
      "Deep dwarves dwell farther below the surface than hill and mountain dwarves, favoring security and isolation in remote underworld regions. They are somewhat leaner than other dwarves while remaining strong and durable, and they move efficiently through narrow stone tunnels.\n\nThey have little regular contact with surface peoples and maintain habits shaped by deep subterranean life. Most trend toward neutral alignments (including lawful neutral and chaotic neutral), though player characters may choose any alignment.",
    "gray-dwarf":
      "Gray dwarves, also known as duergar, live in deep underground domains and often clash with neighboring dwarven groups over underworld resources. They are thinner and harsher-looking than many other dwarves, with a culture marked by rigid discipline and suspicion.\n\nThey rarely travel above ground because bright light is painful to them. Duergar tradition often leans lawful evil or neutral, though player characters may vary.",
    "hill-dwarf":
      "Hill dwarves are the most common and adaptable dwarven subrace, found in both underground settlements and surface outposts. They are heavily built, earth-toned, and strongly associated with steady labor, practical craft, and community defense.\n\nCulturally they are known for discipline and pragmatism, with a frequent lawful good tendency, though player characters may choose other alignments.",
    "mountain-dwarf":
      "Mountain dwarves live in isolated strongholds beneath mountain ranges, where they value privacy, tradition, and clan autonomy. They are generally a bit taller and heavier than hill dwarves, with very sturdy builds and strong internal identity.\n\nMany mountain communities are cautious toward outsiders and sometimes even wary of more outward-facing dwarven kin. Their common tendency is lawful good, though player characters may follow any campaign-legal alignment.",
    "deep-gnome":
      "Deep gnomes, or svirfneblin, dwell in hidden Underdark cities and avoid surface contact whenever possible. They are intensely stealthy and wary yet ingenious and disciplined. Their skin is rock-gray, eyes are dark-toned, and they favor neutral clothing to blend into cavern stone.\n\nIn play they keep a strong affinity with stone and gems alongside illusion and stealth talents. Because they live so deep, they take a -2 penalty on initial reactions with other races and lean heavily on planning, since outside help is rare. Alignments tend to neutrality (including lawful/chaotic neutral), though player characters may vary by campaign.",
    "forest-gnome":
      "Forest gnomes live in tiny, hidden communities within ancient woods. They seek harmony with nature, avoid direct confrontation, and use illusion magic to stay unseen by strangers. They are even smaller than other gnomes, with brownish skin, light brown or blond hair, and clothing in green and brown tones.\n\nThey lack infravision and instead rely on caution, animal friendships, and terrain mastery to survive. In campaigns they skew neutral or neutral good, focusing on forest defense, clever retreat, and diplomacy before force.",
    "rock-gnome":
      "Rock gnomes are the most common gnomish subrace, defined by relentless curiosity and a love of mechanisms, jewels, and illusion tricks. They live in orderly hillside or tunneled communities filled with workshops and tools. Their skin runs from tan to copper, hair ranges light gray to brown, and eyes are often bright blue; male beards are short and neatly kept.\n\nRock gnomes maintain friendly ties with dwarves and halflings, trading metalwork, gemstones, and inventions. At the table their mining sense, perception, and illusion knack provide constant utility in exploration and social scenes. Alignments vary, but most are good or neutral, with wry humor and deep loyalty to friends.",
    "hairfoot-halfling":
      "Hairfoot halflings are the most common type: they love comfort, hearty meals, and predictable routines. They live in hillside burrows with tended gardens and quiet neighbors. Skin is light brown to tan, hair is straight (with famously hairy feet), and they move very lightly and quietly.\n\nThey excel at stealth, thrown weapons, and strong saving throws. They avoid frontal fights, leaning on diplomacy, ambush, or withdrawal. They often skew neutral good or neutral, though PCs may differ by campaign.",
    "stout-halfling":
      "Stout halflings are stockier and often dwell near dwarves, adopting mining habits and stone trade; some show slight elven traits. Their skin tends to be paler and builds more solid than hairfoot cousins.\n\nThey gain infravision and mining detection but face distrust from elves (-1 reaction). They keep excellent stealth and throwing skills. Alignments vary with a slight tilt to neutral or neutral good; player characters choose per table norms.",
    "tallfellow-halfling":
      "Tallfellow halflings are a bit taller and slimmer, with strong ties to elves and forests. They prefer tree homes or burrows near woods. Skin ranges fair to golden, with blond or light brown hair common.\n\nThey have affinity for secret doors, stealth, and excellent throwing, but take a -2 reaction penalty from dwarves, reflecting cultural friction. In play they are often neutral good or neutral, valuing freedom, hospitality, and local peace.",
  };

  const subRaceProfile =
    (isEn ? subRaceDescriptionEn[subRaceKey] : subRaceDescriptionPt[subRaceKey]) ||
    subRace.fullDescription ||
    subRace.description ||
    (isEn ? "No descriptive text registered." : "Sem texto descritivo cadastrado.");

  const subRaceImageSrc = isElf || isDwarf || isGnome || isHalfling ? getSubRaceImageSrc(raceSlug, subRaceKey) : "/images/races/default.svg";

  const abilityRows = [...subRace.standardAbilities]
    .map((link: { raceAbility: { name: string; kind: string; cost: number; fullDescription: string | null; description: string | null } }) => ({
      name: link.raceAbility.name,
      kind: link.raceAbility.kind,
      cost: link.raceAbility.cost,
      description: link.raceAbility.fullDescription || link.raceAbility.description || "—",
    }))
    .sort((a, b) => {
      const aPenalty = a.kind === "PENALTY" ? 1 : 0;
      const bPenalty = b.kind === "PENALTY" ? 1 : 0;
      if (aPenalty !== bPenalty) return aPenalty - bPenalty;
      return a.name.localeCompare(b.name);
    });

  const totalAbilityCost = abilityRows.reduce((sum, row) => sum + row.cost, 0);
  const effectiveClassPoints = race.classPointBudget - subRace.characterPointCost + totalAbilityCost;

  return (
    <PublicShell
      locale={locale}
      currentPath="/racas"
      title={`${race.name} · ${subRace.name}`}
      description={
        isEn
          ? "Subrace detail with role profile and ability investment summary."
          : "Detalhe da subraça com perfil de jogo e resumo de investimento em habilidades."
      }
    >
      <div className="space-y-6">
        <section className="rounded-xl border border-[var(--graphite)] bg-[var(--black-soft)] p-4">
          <h2 className="text-lg font-semibold text-[var(--gold-bright)]">{isEn ? "Subrace profile" : "Perfil da subraça"}</h2>
          <div className="mt-3 grid gap-4 lg:grid-cols-[2fr_1fr]">
            <p className="whitespace-pre-line text-sm text-[var(--white-secondary)]">{subRaceProfile}</p>
            <img
              src={subRaceImageSrc}
              alt={isEn ? "Subrace image 2:3" : "Imagem da subraça 2:3"}
              className="aspect-[2/3] w-full rounded-lg border border-[var(--graphite)] object-cover"
            />
          </div>
        </section>

        <section className="rounded-xl border border-[var(--info)] bg-[var(--info-bg)] p-4">
          <h2 className="text-lg font-semibold text-[var(--white-primary)]">{isEn ? "Class point summary" : "Resumo de pontos de classe"}</h2>
          <div className="mt-3 grid gap-2 text-sm text-[var(--text-secondary)] sm:grid-cols-3">
            <div className="rounded-md border border-[var(--graphite)] bg-[var(--black-elevated)] px-3 py-2">
              <p className="text-[var(--white-muted)]">{isEn ? "Base race budget" : "Orçamento da raça base"}</p>
              <p className="mt-1 font-semibold text-[var(--white-primary)]">{race.classPointBudget}</p>
            </div>
            <div className="rounded-md border border-[var(--graphite)] bg-[var(--black-elevated)] px-3 py-2">
              <p className="text-[var(--white-muted)]">{isEn ? "Subrace cost" : "Custo da subraça"}</p>
              <p className="mt-1 font-semibold text-[var(--white-primary)]">{subRace.characterPointCost}</p>
            </div>
            <div className="rounded-md border border-[var(--graphite)] bg-[var(--black-elevated)] px-3 py-2">
              <p className="text-[var(--white-muted)]">{isEn ? "Effective points" : "Pontos efetivos"}</p>
              <p className="mt-1 font-semibold text-[var(--white-primary)]">{effectiveClassPoints}</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--warning)] bg-[var(--warning-bg)] p-4">
          <h2 className="text-lg font-semibold text-[var(--white-primary)]">{isEn ? "Subrace abilities and costs" : "Habilidades e custos da subraça"}</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm text-[var(--text-secondary)]">
              <thead>
                <tr className="border-b border-[var(--graphite)] text-[var(--white-primary)]">
                  <th className="px-2 py-2 font-semibold">{isEn ? "Ability" : "Habilidade"}</th>
                  <th className="px-2 py-2 font-semibold">{isEn ? "Cost" : "Custo"}</th>
                </tr>
              </thead>
              <tbody>
                {abilityRows.map((row, index) => (
                  <tr key={`${row.name}-${index}`} className="border-b border-[var(--graphite)]/60 last:border-b-0">
                    <td className="px-2 py-2 font-semibold text-[var(--white-primary)]">{row.name}</td>
                    <td className="px-2 py-2">{row.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-sm text-[var(--white-muted)]">
            {isEn ? "Total ability cost" : "Custo total das habilidades"}: <span className="font-semibold text-[var(--white-primary)]">{totalAbilityCost}</span>
          </p>
        </section>

        <div className="flex flex-wrap gap-2">
          <Link
            href={withLang(`/racas/${raca}`, locale)}
            className="rounded-md border border-[var(--graphite)] px-4 py-2 text-sm font-semibold text-[var(--white-primary)] hover:bg-[var(--hover-gold-bg)] hover:border-[var(--hover-gold-border)]"
          >
            {isEn ? "Back to race" : "Voltar para raça"}
          </Link>
          <Link
            href={withLang(`/racas/${raca}/custos`, locale)}
            className="rounded-md border border-[var(--gold-primary)] bg-[var(--hover-gold-bg)] px-4 py-2 text-sm font-semibold text-[var(--gold-bright)] hover:border-[var(--hover-gold-border)]"
          >
            {isEn ? "Costs and abilities" : "Custos e habilidades"}
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}
