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
- `index.html` — public CHDX **digital press kit** (bio, sets, press photos, tech rider, booking).
- Personal/private pages live in `archive-private/` (not deployed).

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

## Public press kit

`site/index.html` + `site/style.css` is the deployed digital press kit
(hero → bio → sets → press photos → tech rider → booking). Visual language
still follows the woodcut / ink / blood system documented in
`docs/chdx-redesign/`.

Preview:

```bash
npm run dev
# open http://127.0.0.1:8080/
```

Personal archive HTML/media (poems, planner, gift gate, etc.) lives in
`archive-private/` and is excluded from Cloudflare Pages deploy.

## Cursor Cloud specific instructions

Dependencies are refreshed automatically on startup (`npm install` from the repo
root). Node 22 is available; `server.js` needs Node 18+ (native `fetch`/Web
Streams).

- **Primary dev service**: the root Express server (`npm run dev`, port 8080).
  It both serves the static `site/` folder AND provides the `/api/*` endpoints
  (`/api/tracks`, `/api/upload`, `/api/audio-proxy`). This is the one service to
  run to develop/test the site end to end — commands are in the "Backend (root)"
  section above.
- Serving `site/` with `python3 -m http.server` (as noted in the redesign
  section) is fine for pure static preview but SKIPS all `/api/*` endpoints, so
  audio track listing/upload won't work that way. Use `npm run dev` instead when
  you need the APIs.
- `site/uploads/` is created at runtime by the server and is gitignored; uploaded
  audio there is not tracked.
- **No lint or automated test setup exists** in this repo (no test/lint scripts
  in `package.json`, no test framework or config). Verify changes by running the
  server and exercising the pages/APIs manually.
- The `chdx-sync/` Worker and `npm run pages:dev` are OPTIONAL — the frontend
  works from `localStorage` alone. They run via `npx wrangler` (downloaded
  on-demand, needs network); local dev uses a simulated KV so no Cloudflare
  account is required, and `PUT /state` needs an `EDIT_KEY` (`.dev.vars` or
  `wrangler secret`). Only run these to exercise cross-device sync or R2-backed
  uploads.
