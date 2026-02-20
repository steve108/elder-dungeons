# Elder Dungeons

Painel administrativo para ingestão, parse com IA, geração de ícones e manutenção de magias AD&D 2e.

## Visão Geral

O projeto usa Next.js + Prisma + OpenAI para converter texto/imagem de spells em dados estruturados, com persistência em PostgreSQL e assets de ícone no Cloudflare R2.

Fluxo principal:

1. Admin envia texto e/ou imagem em `/admin/spell-import`.
2. API `/api/spell-parse` chama OpenAI, valida com Zod e aplica normalizações de domínio.
3. Ícone pode ser gerado automaticamente durante o parse (com fallback seguro em caso de falha).
4. Admin revisa/edita e salva em `/api/spell-save`.
5. Spell fica disponível para listagem, visualização e edição em `/admin/spells`.

## Stack

- Next.js 16 (App Router + Pages API)
- TypeScript
- Prisma 7 + PostgreSQL
- OpenAI SDK (texto + imagem)
- AWS SDK S3 Client (upload para Cloudflare R2)
- Zod
- TailwindCSS

## Funcionalidades Implementadas

### Import e Parse

- Importa spell por texto e/ou imagem.
- Entrada de imagem por upload, colar da área de transferência e drag-and-drop.
- Parse com instruções AD&D 2e para:
	- `savingThrow` canônico (categorias 2e),
	- `savingThrowOutcome` (`NEGATES | HALF | PARTIAL | OTHER`),
	- `magicalResistance`, `canBeDispelled`, `dispelHow`.
- Canonicalização de grupos (ex.: `Invocation/Evocation`, `Conjuration/Summoning`, etc.).

### Ícones de Spell

- Geração de ícone por prompt com estilo baseado em escola/esfera.
- Upload do PNG para Cloudflare R2 e persistência de:
	- `iconUrl`
	- `iconPrompt`
- Regeneração manual de ícone sem reparse da spell.
- Geração automática de prompt (`Prompt automático`) sem gerar imagem.
- Suporte a prompt customizado para regeneração de ícone.

### Admin UI

- `/admin/spells`:
	- filtros por nome, classe (`Arcane/Divine`), nível e grupo;
	- ações de `view` e `edit` por registro.
- `/admin/spells/[id]/view`:
	- visão somente leitura com alternância PT/EN;
	- exibição do ícone da spell.
- `/admin/spells/[id]` (edição):
	- seção de ícone com preview, URL e prompt editável;
	- botões `Regenerar Ícone` e `Prompt automático`;
	- navegação entre spells (`anterior`, `view`, `próximo`) com suporte a lacunas de IDs;
	- proteção contra saída com alterações não salvas.
- `/admin/missing-retry`:
	- tela dedicada para retry de pendências de hidratação (`missing`).

## Estrutura Relevante

- `src/app/admin/spell-import/page.tsx`
- `src/app/admin/missing-retry/page.tsx`
- `src/app/admin/spells/page.tsx`
- `src/app/admin/spells/[id]/view/page.tsx`
- `src/app/admin/spells/[id]/page.tsx`
- `src/lib/openai.ts`
- `src/lib/spell-icon.ts`
- `src/lib/spell.ts`
- `src/lib/spell-ui.ts`
- `src/pages/api/spell-icon-generate.ts`
- `src/pages/api/spell-icon-prompt.ts`
- `src/pages/api/spell-save.ts`
- `src/pages/api/spells/index.ts`
- `src/pages/api/spells/[id].ts`
- `src/pages/api/spell-reference-hydrate.ts`
- `prisma/schema.prisma`

## Endpoints

- `GET /api/health`
- `POST /api/spell-parse`
- `POST /api/spell-save`
- `POST /api/spell-icon-generate`
- `POST /api/spell-icon-prompt`
- `GET /api/spells`
- `GET|PUT /api/spells/[id]`
- `GET|POST /api/spell-reference-hydrate`
- `POST /api/spell-reference-sync`

## Banco e Migrations

Campos adicionados/ajustados no domínio de spell:

- `saving_throw_outcome`
- `icon_url`
- `icon_prompt`

Tabela de suporte para backlog de hidratação:

- `SpellReferenceMissing`

## Variáveis de Ambiente

Crie `.env` com:

- `DATABASE_URL`
- `DATABASE_SSL_REJECT_UNAUTHORIZED` (`true`/`false`)
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (opcional, default `gpt-4.1-mini`)
- `OPENAI_IMAGE_MODEL` (opcional, default `gpt-image-1`)
- `OPENAI_ICON_TEXT_MODEL` (opcional)
- `CLOUDFLARE_R2_ACCESS_KEY_ID`
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_R2_BUCKET`
- `CLOUDFLARE_R2_ENDPOINT`
- `CLOUDFLARE_R2_PUBLIC_URL`
- `JWT_SECRET`

## Execução

```bash
npm install
npx prisma migrate dev
npx prisma generate
npm run dev
```

Validação local:

```bash
npm run build
npm run lint
```

## Scripts úteis

- `npm run import:spell-reference`
- `npm run sync:spell-reference`
- `npm run repair:spell-ptbr`

## Observações

- O fluxo de parse continua funcional mesmo se a geração de ícone falhar (fallback sem quebrar import).
- Regeneração de ícone cria novo objeto no bucket (não remove arquivos antigos).
