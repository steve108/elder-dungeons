import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import OpenAI from "openai";
import { z } from "zod";

const iconInputSchema = z.object({
  name: z.string().trim().min(1),
  spellClass: z.enum(["arcane", "divine"]),
  school: z.string().trim().nullable().optional(),
  sphere: z.string().trim().nullable().optional(),
  summaryEn: z.string().trim().optional().nullable(),
  descriptionOriginal: z.string().trim().min(1),
});

export type SpellIconInput = z.infer<typeof iconInputSchema>;

type GenerateSpellIconOptions = {
  promptOverride?: string | null;
};

type IconStyleRule = {
  weight: number;
  groups: string[];
  primaryColor: string;
  secondaryColor: string;
  symbolStyle: string;
};

const iconStyleRules: IconStyleRule[] = [
  { weight: 100, groups: ["elemental fire"], primaryColor: "#ff3300", secondaryColor: "#ffaa00", symbolStyle: "magma cracked stone" },
  { weight: 100, groups: ["elemental water"], primaryColor: "#0066ff", secondaryColor: "#00ffff", symbolStyle: "wave carved stone" },
  { weight: 100, groups: ["elemental earth"], primaryColor: "#996633", secondaryColor: "#66ff33", symbolStyle: "rock fractured stone" },
  { weight: 100, groups: ["elemental air"], primaryColor: "#ccffff", secondaryColor: "#66ccff", symbolStyle: "wind swirl stone" },
  { weight: 95, groups: ["sun"], primaryColor: "#ffff00", secondaryColor: "#ffaa00", symbolStyle: "sunburst engraved stone" },
  { weight: 95, groups: ["shadow"], primaryColor: "#6600aa", secondaryColor: "#000000", symbolStyle: "shadow mist stone" },
  { weight: 95, groups: ["plant"], primaryColor: "#33aa33", secondaryColor: "#99ff66", symbolStyle: "root covered stone" },
  { weight: 95, groups: ["animal"], primaryColor: "#cc9933", secondaryColor: "#663300", symbolStyle: "claw marked stone" },
  { weight: 90, groups: ["weather"], primaryColor: "#66aaff", secondaryColor: "#ffffff", symbolStyle: "storm cracked stone" },
  { weight: 90, groups: ["necromancy"], primaryColor: "#9933ff", secondaryColor: "#33ff66", symbolStyle: "rotting bone stone" },
  { weight: 90, groups: ["illusion/phantasm", "illusion", "phantasm"], primaryColor: "#ff66ff", secondaryColor: "#66ffff", symbolStyle: "shimmer mirror stone" },
  { weight: 90, groups: ["healing"], primaryColor: "#66ff99", secondaryColor: "#ffffff", symbolStyle: "soft glow marble stone" },
  { weight: 90, groups: ["war"], primaryColor: "#ff0000", secondaryColor: "#000000", symbolStyle: "battle scarred stone" },
  { weight: 90, groups: ["combat"], primaryColor: "#ff3333", secondaryColor: "#ffaa00", symbolStyle: "weapon etched stone" },
  { weight: 90, groups: ["song"], primaryColor: "#ff66cc", secondaryColor: "#66ffff", symbolStyle: "vibration rune stone" },
  { weight: 85, groups: ["summoning"], primaryColor: "#00aaff", secondaryColor: "#8844ff", symbolStyle: "portal rune stone" },
  { weight: 85, groups: ["travelers"], primaryColor: "#66ccff", secondaryColor: "#00ffff", symbolStyle: "road etched stone" },
  { weight: 85, groups: ["guardian"], primaryColor: "#66ccff", secondaryColor: "#ffffff", symbolStyle: "shield fortress stone" },
  { weight: 80, groups: ["abjuration"], primaryColor: "#ffd700", secondaryColor: "#ffffff", symbolStyle: "shield rune stone" },
  { weight: 80, groups: ["protection"], primaryColor: "#ffdd66", secondaryColor: "#ffffff", symbolStyle: "marble shield stone" },
  { weight: 80, groups: ["wards"], primaryColor: "#ffaa00", secondaryColor: "#ffffff", symbolStyle: "rune circle stone" },
  { weight: 80, groups: ["conjuration/summoning", "conjuration"], primaryColor: "#00aaff", secondaryColor: "#8844ff", symbolStyle: "portal carved stone" },
  { weight: 80, groups: ["invocation/evocation", "invocation", "evocation"], primaryColor: "#ff5500", secondaryColor: "#ffaa00", symbolStyle: "burned rune stone" },
  { weight: 80, groups: ["alteration"], primaryColor: "#ffff66", secondaryColor: "#00ffcc", symbolStyle: "shifting rune stone" },
  { weight: 75, groups: ["divination"], primaryColor: "#66ffff", secondaryColor: "#ffffff", symbolStyle: "eye engraved stone" },
  { weight: 75, groups: ["artifice"], primaryColor: "#cccccc", secondaryColor: "#ffaa00", symbolStyle: "gear carved stone" },
  { weight: 75, groups: ["alchemy"], primaryColor: "#ffaa33", secondaryColor: "#66ffcc", symbolStyle: "bubbling etched stone" },
  { weight: 70, groups: ["force"], primaryColor: "#66ccff", secondaryColor: "#ffffff", symbolStyle: "arcane energy stone" },
  { weight: 70, groups: ["mentalism"], primaryColor: "#ff99cc", secondaryColor: "#6600ff", symbolStyle: "psychic ripple stone" },
  { weight: 70, groups: ["thought"], primaryColor: "#ff99ff", secondaryColor: "#9999ff", symbolStyle: "mindwave stone" },
  { weight: 70, groups: ["charm"], primaryColor: "#ff66aa", secondaryColor: "#ffffff", symbolStyle: "heart rune stone" },
  { weight: 70, groups: ["enchantment/charm", "enchantment"], primaryColor: "#ff44aa", secondaryColor: "#ffccff", symbolStyle: "sparkle rune stone" },
  { weight: 65, groups: ["time"], primaryColor: "#ffd700", secondaryColor: "#000000", symbolStyle: "clockwork cracked stone" },
  { weight: 65, groups: ["geometry"], primaryColor: "#00ccff", secondaryColor: "#ffaa00", symbolStyle: "sacred pattern stone" },
  { weight: 65, groups: ["numbers"], primaryColor: "#00ffff", secondaryColor: "#00ff99", symbolStyle: "numeric rune stone" },
  { weight: 65, groups: ["law"], primaryColor: "#3366ff", secondaryColor: "#ffffff", symbolStyle: "ordered marble stone" },
  { weight: 65, groups: ["chaos"], primaryColor: "#ff00ff", secondaryColor: "#ff5500", symbolStyle: "chaotic cracked stone" },
  { weight: 60, groups: ["astral"], primaryColor: "#c0c0ff", secondaryColor: "#8000ff", symbolStyle: "starfield stone" },
  { weight: 60, groups: ["dimension"], primaryColor: "#00ffff", secondaryColor: "#0044ff", symbolStyle: "fractured portal stone" },
  { weight: 55, groups: ["wild magic", "generic"], primaryColor: "#ff00ff", secondaryColor: "#00ffff", symbolStyle: "unstable glowing stone" },
  { weight: 50, groups: ["universal magic", "generic"], primaryColor: "#dddddd", secondaryColor: "#aaaaaa", symbolStyle: "faded rune stone" },
  { weight: 50, groups: ["all", "generic"], primaryColor: "#ffffff", secondaryColor: "#ffd700", symbolStyle: "neutral rune stone" },
];

const symbolSchema = z.object({ symbol: z.string().trim().min(3).max(120) });

function normalizeToken(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9/\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalizeIconGroup(value: string): string {
  const token = normalizeToken(value);

  if (["invocation", "evocation", "invocation/evocation", "evocation/invocation"].includes(token)) {
    return "invocation/evocation";
  }

  if (["conjuration", "summoning", "conjuration/summoning", "summoning/conjuration"].includes(token)) {
    return "conjuration/summoning";
  }

  if (["illusion", "phantasm", "illusion/phantasm", "phantasm/illusion"].includes(token)) {
    return "illusion/phantasm";
  }

  if (["enchantment", "charm", "enchantment/charm", "charm/enchantment"].includes(token)) {
    return "enchantment/charm";
  }

  return token;
}

function splitGroups(value?: string | null): string[] {
  if (!value) return [];

  return value
    .split(/[\/,;|]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map(canonicalizeIconGroup)
    .filter(Boolean);
}

function chooseStyleRule(input: SpellIconInput): IconStyleRule {
  const schoolGroups = splitGroups(input.school);
  const sphereGroups = splitGroups(input.sphere);

  function scoreRule(rule: IconStyleRule): number {
    const ruleGroups = rule.groups.map(canonicalizeIconGroup);
    let bestScore = -1;

    for (const ruleGroup of ruleGroups) {
      for (const candidate of schoolGroups) {
        if (candidate === ruleGroup) {
          bestScore = Math.max(bestScore, 1000 + rule.weight);
        } else if (candidate.includes(ruleGroup) || (ruleGroup.includes(candidate) && candidate.length > 4)) {
          bestScore = Math.max(bestScore, 300 + rule.weight);
        }
      }

      for (const candidate of sphereGroups) {
        if (candidate === ruleGroup) {
          bestScore = Math.max(bestScore, 700 + rule.weight);
        } else if (candidate.includes(ruleGroup) || (ruleGroup.includes(candidate) && candidate.length > 4)) {
          bestScore = Math.max(bestScore, 150 + rule.weight);
        }
      }
    }

    return bestScore;
  }

  const ranked = iconStyleRules
    .map((rule) => ({ rule, score: scoreRule(rule) }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length > 0) return ranked[0].rule;
  return iconStyleRules[iconStyleRules.length - 1];
}

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return new OpenAI({ apiKey });
}

async function createSymbolConcept(client: OpenAI, input: SpellIconInput): Promise<string> {
  const model = process.env.OPENAI_ICON_TEXT_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

  const summaryText = (input.summaryEn ?? "").trim();

  const completion = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "Return JSON only with {\"symbol\":\"...\"}. Create one concise visual symbol idea for a fantasy spell icon. Keep 4-12 words. Describe only the central symbol/object, not colors/background/style/text.",
      },
      {
        role: "user",
        content: [
          `spell name: ${input.name}`,
          `spell class: ${input.spellClass}`,
          `school: ${input.school ?? "unknown"}`,
          `sphere: ${input.sphere ?? "unknown"}`,
          `summary: ${summaryText || "unknown"}`,
          `description: ${input.descriptionOriginal.slice(0, 1200)}`,
        ].join("\n"),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) return `arcane sigil representing ${input.name}`;

  try {
    return symbolSchema.parse(JSON.parse(content)).symbol;
  } catch {
    return `arcane sigil representing ${input.name}`;
  }
}

function buildIconPrompt(params: { symbolConcept: string; style: IconStyleRule }): string {
  return [
    "Square icon carved into an ancient slab of rough dark basalt stone, with irregular chipped edges and worn corners, never a perfect frame.",
    "Stone outside the symbol remains flat and untouched; do not excavate the whole surface.",
    "Only the symbol lines are engraved in low relief with narrow deep grooves, sharp internal shadows, chamfered cuts and micro-fissures.",
    `The groove fill behaves like luminous liquid trapped inside the carved cavities using only ${params.style.primaryColor} and ${params.style.secondaryColor}.`,
    "Glow must stay inside grooves only; no outward bloom, no painted overlays, no floating symbol.",
    `Centered magic symbol with thick lines: ${params.symbolConcept}.`,
    `Material behavior and carving mood: ${params.style.symbolStyle}.`,
    "Internal spaces of the symbol are filled with the same stone texture, ancient weathered underground basalt.",
    "High contrast and legible at 64px, simple silhouette, fantasy game UI icon, 1:1 ratio.",
    "Avoid hollow cutouts, recessed internal areas, perfect frames, modern UI visuals, plastic or metal textures, blur, watermark, text, letters.",
  ].join(" ");
}

export async function generateSpellIconPrompt(rawInput: SpellIconInput): Promise<string> {
  const input = iconInputSchema.parse(rawInput);
  const style = chooseStyleRule(input);
  const client = getOpenAIClient();
  const symbolConcept = await createSymbolConcept(client, input);
  return buildIconPrompt({ symbolConcept, style });
}

async function createImageBuffer(client: OpenAI, prompt: string): Promise<Buffer> {
  const imageModel = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1";

  const result = await client.images.generate({
    model: imageModel,
    size: "1024x1024",
    prompt,
  });

  const first = result.data?.[0];
  const b64 = first?.b64_json;
  if (typeof b64 === "string" && b64.length > 0) {
    return Buffer.from(b64, "base64");
  }

  if (typeof first?.url === "string" && first.url.length > 0) {
    const response = await fetch(first.url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to download generated image from OpenAI URL");
    }

    const arr = await response.arrayBuffer();
    return Buffer.from(arr);
  }

  throw new Error("OpenAI image generation returned no usable image payload");
}

function sanitizeFileName(value: string): string {
  const normalized = normalizeToken(value).replace(/[\s/]+/g, "-");
  return normalized.length > 0 ? normalized.slice(0, 64) : "spell-icon";
}

async function uploadToCloudflareImage(image: Buffer, fileBaseName: string): Promise<string> {
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET;
  const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT;
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;

  if (!accessKeyId || !secretAccessKey || !bucket || !endpoint || !publicUrl) {
    throw new Error(
      "CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, CLOUDFLARE_R2_BUCKET, CLOUDFLARE_R2_ENDPOINT and CLOUDFLARE_R2_PUBLIC_URL must be configured",
    );
  }

  const client = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const objectKey = `spells/${fileBaseName}-${Date.now()}.png`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: image,
      ContentType: "image/png",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  const base = publicUrl.endsWith("/") ? publicUrl.slice(0, -1) : publicUrl;
  return `${base}/${objectKey}`;
}

export async function generateAndUploadSpellIcon(
  rawInput: SpellIconInput,
  options?: GenerateSpellIconOptions,
): Promise<{ iconUrl: string; iconPrompt: string }> {
  const input = iconInputSchema.parse(rawInput);
  const promptOverride = options?.promptOverride?.trim() || "";

  const finalPrompt = promptOverride || (await generateSpellIconPrompt(input));

  const client = getOpenAIClient();
  const imageBuffer = await createImageBuffer(client, finalPrompt);
  const iconUrl = await uploadToCloudflareImage(imageBuffer, sanitizeFileName(input.name));

  return {
    iconUrl,
    iconPrompt: finalPrompt,
  };
}
