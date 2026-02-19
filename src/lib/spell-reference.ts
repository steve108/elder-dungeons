import { prisma } from "@/lib/prisma";

export type SpellReferenceMatch = {
  levels: number[];
  sources: string[];
  schools: string[];
  spheres: string[];
  classNames: string[];
};

export function normalizeSpellName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitGroupValues(groupName: string): string[] {
  return groupName
    .split(/[,/;|]+/)
    .map((value) => value.trim())
    .filter(Boolean);
}

function classifyGroupToken(className: string, groupToken: string): { school: string | null; sphere: string | null } {
  const token = groupToken.trim();
  if (!token) {
    return { school: null, sphere: null };
  }

  const normalizedToken = token.toLowerCase();
  const normalizedClass = className.trim().toLowerCase();

  const knownWizardSchools = new Set([
    "abjuration",
    "alteration",
    "conjuration",
    "conjuration/summoning",
    "divination",
    "enchantment/charm",
    "enchantment",
    "charm",
    "evocation",
    "invocation/evocation",
    "illusion",
    "illusion/phantasm",
    "necromancy",
    "force",
  ]);

  const knownPriestSpheres = new Set([
    "all",
    "animal",
    "chaos",
    "charm",
    "combat",
    "creation",
    "divination",
    "elemental",
    "guardian",
    "healing",
    "law",
    "necromantic",
    "plant",
    "protection",
    "summoning",
    "sun",
    "time",
    "travelers",
    "wards",
    "weather",
    "numbers",
    "thought",
    "war",
  ]);

  const classIndicatesSphere = normalizedClass.includes("priest") || normalizedClass.includes("druid");
  const tokenLooksSphere = knownPriestSpheres.has(normalizedToken) || normalizedToken.startsWith("sphere");
  const tokenLooksSchool = knownWizardSchools.has(normalizedToken);

  if (classIndicatesSphere || tokenLooksSphere) {
    return { school: null, sphere: token };
  }

  if (tokenLooksSchool || normalizedClass.includes("wizard") || normalizedClass.includes("mage")) {
    return { school: token, sphere: null };
  }

  return { school: token, sphere: null };
}

export async function findSpellReferenceByName(spellName: string): Promise<SpellReferenceMatch | null> {
  const normalizedName = normalizeSpellName(spellName);
  if (!normalizedName) {
    return null;
  }

  const rows = await prisma.spellReference.findMany({
    where: { normalizedName },
    orderBy: [{ level: "asc" }, { source: "asc" }, { className: "asc" }, { groupName: "asc" }],
  });

  if (rows.length === 0) {
    return null;
  }

  const levels = Array.from(new Set(rows.map((row) => row.level))).sort((a, b) => a - b);
  const sources = Array.from(new Set(rows.map((row) => row.source.trim()).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
  const classNames = Array.from(new Set(rows.map((row) => row.className.trim().toLowerCase()).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b),
  );

  const schools = new Set<string>();
  const spheres = new Set<string>();

  for (const row of rows) {
    const groups = splitGroupValues(row.groupName);
    for (const groupToken of groups) {
      const { school, sphere } = classifyGroupToken(row.className, groupToken);
      if (school) schools.add(school);
      if (sphere) spheres.add(sphere);
    }
  }

  return {
    levels,
    sources,
    schools: Array.from(schools).sort((a, b) => a.localeCompare(b)),
    spheres: Array.from(spheres).sort((a, b) => a.localeCompare(b)),
    classNames,
  };
}
