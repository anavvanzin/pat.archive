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

## Redesign v2 (Codex branch)

A redesigned 6-section scaffold lives alongside the canonical page as
`site/index-v2.html` + `site/style-redesign.css`. It is the next iteration of the
CHDX site (Mid Editorial hero, oversized `012` numeral, paper-cream atelier mode
switch, 5 distinct CTA variations). It uses the canonical photos in
`site/assets/` (with two new additions: `IMG_7546.png` and `IMG_7549.jpg`).

To preview locally:

```bash
cd site
python3.12 -m http.server 8080 --bind 127.0.0.1
# open http://127.0.0.1:8080/index-v2.html
```

To promote v2 to the production root URL:

```bash
mv site/index.html site/index-v1.html
mv site/index-v2.html site/index.html
mv site/style-redesign.css site/style.css
```

Design brief, per-section spec, and verification captures live at
`docs/chdx-redesign/`. The brief's standalone scaffold (with inline SVG
placeholders) is at `docs/chdx-redesign/site/` for diff review.
