# Charge Glow Guide - Flui

Plataforma integrada para motoristas e equipe Flui, com app mobile responsivo, painel web, API REST, base de dados simulada e build preparado para Vercel.

Deploy de producao: https://charge-glow-guide-publish.vercel.app

## Funcionalidades

- App mobile com mapa interativo integrado ao Google Maps, marcadores de pontos, filtros por conector, potencia e comodidades.
- Ficha do ponto com carregadores, conectores, potencia, horarios, comodidades, rotas, avaliacoes e envio de nova avaliacao.
- Perfil do motorista com veiculo, favoritos e historico de recargas.
- Plataforma web Flui com dashboard, listagem, cadastro, edicao e gestao de disponibilidade dos pontos.
- Visualizacao de avaliacoes por ponto e relatorios operacionais com sessoes, disponibilidade, receita simulada e nota media.
- API REST documentada, autenticacao demo por papel e banco estruturado em memoria para prototipo.
- Deploy Vercel via Nitro, gerando `.vercel/output` no build.

## Acessos demo

| Perfil | Email | Senha | Token |
| --- | --- | --- | --- |
| Motorista | `motorista@flui.app` | `flui123` | `flui-driver-demo-token` |
| Admin Flui | `admin@flui.com.br` | `admin123` | `flui-admin-demo-token` |

## Rotas principais

- `/` - experiencia inicial da Flui.
- `/map` - app mobile com mapa, filtros e lista de pontos.
- `/stations/:id` - ficha detalhada do ponto e avaliacoes.
- `/profile` - perfil do motorista.
- `/login` - selecao de perfil demo.
- `/admin` - dashboard web da equipe Flui.
- `/admin/stations` - gestao de pontos e disponibilidade.
- `/admin/reviews` - avaliacoes dos motoristas por ponto.
- `/admin/reports` - relatorios operacionais.
- `/api/docs` - documentacao JSON da API.

## Desenvolvimento

```bash
bun install
bun run dev
bun run lint
bun run build
```

Para ativar Google Maps com chave real:

```bash
VITE_GOOGLE_MAPS_API_KEY=sua_chave
```

Sem chave, o app usa fallback visual com iframe do Google Maps e marcadores locais.

## Deploy Vercel

O projeto usa TanStack Start com Nitro preset `vercel`. O build gera a estrutura Vercel Build Output em `.vercel/output`.

```bash
bun run build
vercel deploy --prebuilt
vercel deploy --prebuilt --prod
```

A arquitetura completa, endpoints e esquema de dados estao em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
