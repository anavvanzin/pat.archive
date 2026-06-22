# patricia-love
core data <3

Este repositório contém as seguintes partes:

1. `site/` — o frontend principal com a experiência de portfólio da Patricia (`index.html`) e o hub de planejamento de vida (`planejamento-vida.html`), estruturados em HTML, CSS e JavaScript puros.
2. `chdx-sync/` — worker na Cloudflare para sincronização e persistência de dados do hub.
3. `produtividade/` — painel operacional de tarefas de dia-a-dia de uso pessoal da Patricia.
4. raiz do repo — um servidor Express mínimo (`server.js`), útil como base para backend futuro.

## Deploy atual

O deploy ativo do frontend está configurado para **Cloudflare Pages** via [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml).

- Branches monitoradas: `main`, `master`
- Diretório publicado: `site/`
- Publicação: Cloudflare Pages

## Sincronização e Worker

Para rodar ou gerenciar o worker de sincronização localmente:

```bash
cd chdx-sync
npx wrangler dev
```

## Servidor raiz

Para rodar o servidor Express:

```bash
npm install
npm start          # roda em produção
npm run dev        # roda em desenvolvimento com nodemon (auto-reload)
```

O servidor escuta na porta `8080` por padrão (ou `PORT`).

---

## Sobre Google / Lyra / Gemini

Se a ideia for aproximar o projeto do `loveu` baseado em Lyra:
- O app `loveu` usa `GEMINI_API_KEY` no frontend para protótipo/local;
- Um **service account** como `1066380962084-compute@developer.gserviceaccount.com` **não** entra direto no browser;
- Para produção pública, o caminho correto é criar um backend (por exemplo em Cloud Run) e deixar o frontend chamar esse backend.

Resumo rápido:
- `GEMINI_API_KEY` → protótipo local / AI Studio / app cliente
- `GCP_SERVICE_ACCOUNT` → deploy backend / autenticação server-to-server

Detalhes e próximos passos estão em [docs/google-audio-integration.md](./docs/google-audio-integration.md).
