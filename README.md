# pixel-love
core data <3

Este repositório tem duas partes diferentes:

1. `melovanzin/` — a experiência principal, feita em `Vite + React + TypeScript`.
2. raiz do repo — um servidor Express mínimo (`server.js`), hoje útil como base para backend futuro.

## Deploy atual

O deploy ativo deste projeto é o frontend em **GitHub Pages** via [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml).

- branchs monitoradas: `main`, `master` e `claude/melovanzin-retro-game-iULVz`
- diretório de build: `melovanzin/dist`
- publicação: GitHub Pages

Hoje, o site público **não depende de Cloud Run** para funcionar.

## Rodando localmente

### Frontend principal

```bash
cd melovanzin
npm install
npm run dev
```

Abra `http://localhost:5173`.

### Servidor raiz

```bash
npm install
npm start
```

O servidor escuta na porta `8080` por padrão (ou `PORT`).

## Sobre Google / Lyra / Gemini

Se a ideia for aproximar o projeto do `loveu` baseado em Lyra:

- o app `loveu` usa `GEMINI_API_KEY` no frontend para protótipo/local;
- um **service account** como `1066380962084-compute@developer.gserviceaccount.com` **não** entra direto no browser;
- para produção pública, o caminho correto é criar um backend (por exemplo em Cloud Run) e deixar o frontend chamar esse backend.

Resumo rápido:

- `GEMINI_API_KEY` → protótipo local / AI Studio / app cliente
- `GCP_SERVICE_ACCOUNT` → deploy backend / autenticação server-to-server

Detalhes e próximos passos estão em [docs/google-audio-integration.md](./docs/google-audio-integration.md).
