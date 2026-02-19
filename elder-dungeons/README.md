# Elder Dungeons

Painel administrativo para ingestão, parse com IA, conferência e manutenção de magias de AD&D 2e.

## Visão Geral

Este projeto usa Next.js + Prisma + OpenAI para transformar texto/imagem de spell em dados estruturados e persistir no banco.

Fluxo principal:

1. Admin envia texto e/ou imagem (`/admin/spell-import`).
2. API `/api/spell-parse` chama OpenAI com prompt estruturado e valida retorno com Zod.
3. Usuário confere o resultado e salva em `/api/spell-save`.
4. Spell fica disponível para listagem/edição em `/admin/spells`.

## Stack

- Next.js 16 (App Router para UI admin + Pages API para endpoints)
- TypeScript (strict)
- Prisma 7 + PostgreSQL
- OpenAI SDK
- Zod (validação de payload)
- TailwindCSS

## Estrutura Relevante

- `src/app/admin/spell-import/page.tsx`: importação via texto, upload, arrastar/soltar e colar imagem.
- `src/components/spell-preview.tsx`: conferência dos campos parseados.
- `src/lib/openai.ts`: prompt, parse, fallbacks e normalizações.
- `src/lib/spell.ts`: schema canônico de spell e heurísticas.
- `src/pages/api/spell-parse.ts`: endpoint de parse (com body limit para imagem base64).
- `src/pages/api/spell-save.ts`: persistência (upsert por chave dedupe).
- `src/pages/api/spells/*.ts`: listagem e edição.
- `src/lib/spell-reference-sync.ts`: sincronização de `SpellReference` por CSV.
- `prisma/schema.prisma`: modelos e campos do domínio.

## Campos importantes do domínio

- Classificação: `spellClass`, `combat`, `utility`
- Resistência: `magicalResistance`
- Dispel: `canBeDispelled`, `dispelHow`
- Conteúdo: `summaryEn`, `summaryPtBr`, `descriptionOriginal`, `descriptionPtBr`

## Regras implementadas

- Parse de nível aceita formatos como `1`, `1st`, `2nd` etc. na referência CSV.
- `magicalResistance` foi refinada para evitar falso positivo em casos de summon/creation (ex.: `Mount`).
- `canBeDispelled` considera efeito ativo da magia e ignora interação durante conjuração.
- Import de imagem aceita:
	- upload por arquivo,
	- colar da área de transferência,
	- arrastar/soltar,
	- preview em miniatura antes do parse.

## Endpoints

- `GET /api/health`
	- Check de banco (`SELECT 1`) e check de runtime Prisma.
	- `200` quando saudável, `503` quando degradado.
- `POST /api/spell-parse`
	- Parse de spell por texto/imagem.
- `POST /api/spell-save`
	- Salva spell parseada.
- `GET /api/spells`
	- Listagem paginada.
- `GET|PUT /api/spells/[id]`
	- Consulta e atualização.
- `POST /api/spell-reference-sync`
	- Sincroniza tabela de referência por CSV(s) em `data/`.

## Ambiente

Crie `.env` com os valores necessários:

- `DATABASE_URL`
- `DATABASE_SSL_REJECT_UNAUTHORIZED` (`true`/`false`)
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (opcional, default `gpt-4.1-mini`)
- `JWT_SECRET` (para Bearer token nas rotas protegidas)

## Execução

Instalar dependências:

```bash
npm install
```

Aplicar migrations e gerar client:

```bash
npx prisma migrate dev
npx prisma generate
```

Desenvolvimento:

```bash
npm run dev
```

Build de validação:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Sincronização da SpellReference

Via script:

```bash
npm run sync:spell-reference
```

O script lê todos os `.csv` dentro de `data/` (ou um arquivo específico, se informado) e aplica diff (create/update/delete).

## Observações operacionais

- Se `next dev` travar por lock de porta/processo, encerre processos Node e limpe lock de `.next/dev/lock`.
- Se houver erro de payload grande no parse por imagem, o endpoint já está com limite aumentado.
- Quando API retornar erro não-JSON, a UI mostra mensagem amigável com status em vez de quebrar na desserialização.
