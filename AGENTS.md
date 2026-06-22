# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Repository Structure

This repo has three parts:

- **Root** — a minimal Express.js server (`server.js`) that can support future backend work.
- **`site/`** — static HTML, CSS, and JS frontend files for Patricia (main site `index.html` and life planner `planejamento-vida.html`).
- **`chdx-sync/`** — Cloudflare Worker backend for remote synchronization.
- **`produtividade/`** — a local task/productivity dashboard (`dashboard.html`) for Patricia.

## Commands

### Backend (root)
```bash
npm install
npm start          # runs server.js on port 8080
npm run dev        # runs server.js on port 8080 with nodemon (auto-reload)
```

### Sync Worker (`chdx-sync/`)
```bash
cd chdx-sync
npx wrangler dev   # run local worker
```

## Frontend Architecture (`site/`)

**Navigation model**: Single-page static structures. The app uses vanilla JavaScript and `localStorage` to persist state locally, with remote backup and synchronization integrated via the worker.

**UI pages** (`site/`):
- `index.html` — main CHDX portfolio and player hub for Patricia.
- `planejamento-vida.html` — interactive life planner with calendar, budgeting, apartment hunting, goals, and DJ sets.

**Design Aesthetics**:
- **Aesthetic Theme**: Woodcut/xilogravura contemporary art, tarot card layouts, punk serigrafia.
- **Palette**: Printing black, paper cream, dark red, burned yellow. No smooth digital gradients or corporate-style cards.
- **Dual Atmosphere**: Dynamic transition from Ateliê (light mode: cream background, light) to Pista (dark mode: black background, red/amber lights).
- **Interactive Elements**: Keep animations clean and controlled. The Panther is a silent presence. No Discord links.

## Deployment

- **Frontend → Cloudflare Pages**: `.github/workflows/deploy.yml` deploys the `site/` folder directly to Cloudflare Pages.
- **Sync Worker → Cloudflare Worker**: Deployable via Wrangler.

## Life Planner & Remote Synchronization

- **Sync Path**: Integrated via Cloudflare Worker `chdx-sync` (KV namespace `STATE`).
- **Partial Merge**: PUT method must perform partial updates to preserve independent fields (`camarim`, `guests`, `photos`, `planner`).
- **Planner Security**: Access to the edit mode of `planejamento-vida.html` is gated behind the `?k=<EDIT_KEY>` URL query string. Non-authenticated users see a readonly version.
