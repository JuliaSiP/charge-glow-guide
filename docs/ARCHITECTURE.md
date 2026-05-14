# Arquitetura Tecnica - Flui Charge Glow Guide

## Visao geral

A solucao foi organizada como uma plataforma full-stack em TanStack Start/React, com o mesmo repositorio entregando app mobile, web admin, API REST e build para Vercel.

```mermaid
flowchart LR
  Driver["App mobile /map e /profile"] --> API["API REST /api/*"]
  Admin["Web admin /admin/*"] --> API
  API --> Auth["Auth demo por papel"]
  API --> DB["Banco estruturado em memoria"]
  DB --> Stations["Pontos e carregadores"]
  DB --> Reviews["Avaliacoes"]
  DB --> History["Historico de recargas"]
  API --> Reports["Relatorios operacionais"]
```

## Camadas

- `src/routes` contem as telas e rotas server-side do TanStack Start.
- `src/routes/api.$.ts` expoe a API REST no ambiente TanStack/local.
- `api/[...path].ts` adapta os mesmos handlers para Vercel Functions.
- `src/lib/apiHandlers.ts` concentra roteamento REST, validacao simples e respostas JSON.
- `src/lib/database.ts` modela o banco simulado estruturado e suas operacoes.
- `src/lib/auth.ts` define os tokens demo e autenticacao por papel.
- `src/lib/apiClient.ts` e usado pelo app mobile e pelo admin web para consumir a API.

## Banco de dados estruturado

O prototipo usa tabelas em memoria para funcionar sem servico externo. A estrutura foi separada para permitir troca futura por Postgres, Neon, Supabase ou outro banco.

| Tabela | Campos principais |
| --- | --- |
| `users` | `id`, `name`, `email`, `password`, `role`, `vehicle`, `favoriteStationIds` |
| `stations` | `id`, `name`, `address`, `lat`, `lng`, `powerKw`, `status`, `hours`, `amenities`, `pricePerKwh`, `operator` |
| `chargers` | `id`, `stationId`, `label`, `connector`, `powerKw`, `count`, `available` |
| `reviews` | `id`, `stationId`, `userId`, `rating`, `chargeQuality`, `infrastructure`, `comment` |
| `chargingHistory` | `id`, `userId`, `stationId`, `chargerId`, `startedAt`, `finishedAt`, `kwh`, `cost` |

## Autenticacao

A autenticacao e diferenciada por papel:

| Papel | Email | Senha | Bearer token | Permissoes |
| --- | --- | --- | --- | --- |
| `DRIVER` | `motorista@flui.app` | `flui123` | `flui-driver-demo-token` | Perfil, historico e envio de avaliacoes |
| `ADMIN` | `admin@flui.com.br` | `admin123` | `flui-admin-demo-token` | Cadastro/edicao de pontos, avaliacoes, usuarios, historico e relatorios |

As rotas protegidas esperam:

```http
Authorization: Bearer flui-admin-demo-token
```

ou

```http
Authorization: Bearer flui-driver-demo-token
```

## Endpoints REST

| Metodo | Endpoint | Auth | Descricao |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Publico | Status da API |
| `GET` | `/api/docs` | Publico | Documentacao JSON dos endpoints |
| `POST` | `/api/auth/login` | Publico | Login demo por email/senha |
| `GET` | `/api/me` | Driver/Admin | Perfil do usuario autenticado |
| `GET` | `/api/users` | Admin | Lista de usuarios sem senha |
| `GET` | `/api/stations` | Publico | Lista pontos com filtros `q`, `connector`, `minPower`, `amenity`, `available` |
| `POST` | `/api/stations` | Admin | Cadastra ponto de recarga |
| `GET` | `/api/stations/:id` | Publico | Ficha do ponto, avaliacoes e historico |
| `PATCH` | `/api/stations/:id` | Admin | Edita ponto, status e disponibilidade |
| `GET` | `/api/stations/:id/reviews` | Publico | Lista avaliacoes de um ponto |
| `POST` | `/api/stations/:id/reviews` | Driver | Envia avaliacao do motorista |
| `GET` | `/api/reviews` | Admin | Lista avaliacoes, com filtro opcional `stationId` |
| `GET` | `/api/history` | Driver/Admin | Historico proprio ou, para admin, filtravel por usuario/ponto |
| `GET` | `/api/reports` | Admin | KPIs, disponibilidade, receita simulada e series temporais |

### Exemplos

```bash
curl https://SEU_DEPLOY.vercel.app/api/stations?connector=CCS2&minPower=100
```

```bash
curl -H "Authorization: Bearer flui-admin-demo-token" \
  https://SEU_DEPLOY.vercel.app/api/reports
```

```bash
curl -X POST https://SEU_DEPLOY.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"motorista@flui.app","password":"flui123"}'
```

## Deploy

O build usa `vite.config.ts` com:

- `tanstackStart({ server: { entry: "server" } })`
- `nitro({ preset: "vercel" })`

Comandos:

```bash
bun install --frozen-lockfile
bun run build
vercel deploy --prebuilt
vercel deploy --prebuilt --prod
```

## Evolucao para producao

Para persistencia real, substituir `src/lib/database.ts` por um adaptador de banco relacional e manter os contratos de `apiHandlers.ts`. As tabelas ja estao normalizadas em usuarios, pontos, carregadores, avaliacoes e historico.
