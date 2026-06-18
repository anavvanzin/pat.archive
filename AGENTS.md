# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Repository Structure

This repo has two independent parts:

- **Root** — a minimal Express.js server (`server.js`) that can support future backend work. No active Cloud Run workflow is present in this repo right now.
- **`melovanzin/`** — a React + Vite frontend app (the actual interactive game). All frontend work happens here.

## Commands

### Backend (root)
```bash
npm install
npm start          # runs server.js on port 8080
```

### Frontend (`melovanzin/`)
```bash
cd melovanzin
npm install
npm run dev        # Vite dev server
npm run build      # tsc + vite build → dist/
npm run lint       # ESLint
npm run preview    # preview production build
```

## Frontend Architecture (`melovanzin/`)

**Navigation model**: No URL-based routing. The app uses a single Zustand store (`src/store/useStore.ts`) with a `currentWorld` field to switch between screens. `App.tsx` maps world keys to screen components via a `WORLDS` object.

**World screens** (`src/screens/`): Each screen is a self-contained component for a themed "world" — `TitleScreen`, `HubScreen`, `FruitLoopsWorld`, `TibiaWorld`, `BotLaneWorld`, `DiscordWorld`.

**Global state** (`src/store/useStore.ts`): Single Zustand store with `persist` middleware. Only `savedBeats`, `inventory`, and `highScoreMinions` are persisted to localStorage (key: `melovanzin-storage`). Everything else (notifications, overlays, current world) is ephemeral.

**Global UI layers** (always rendered in `App.tsx`):
- `CRTOverlay` — scanline/CRT visual effect
- `NotificationSystem` — toast notifications (auto-dismiss at 4s)
- `LoveMessageOverlay` — full-screen love message
- `HeartBurst` — particle animation triggered by `triggerHeartBurst(x, y)`

**Build output**: `vite-plugin-singlefile` inlines all JS/CSS into a single `index.html`. No asset files are emitted. The `amor-invencivel-melovanzin.html` at the root is a pre-built export of this.

## Deployment

- **Frontend → GitHub Pages**: `.github/workflows/deploy.yml` triggers on push to `main`, `master`, or `Codex/melovanzin-retro-game-iULVz`. Builds from `melovanzin/` and deploys `dist/` to Pages.
- **Backend → optional future Cloud Run path**: documentation may reference `GCP_PROJECT_ID`, `GCP_WORKLOAD_IDENTITY_PROVIDER`, and `GCP_SERVICE_ACCOUNT`, but there is no active backend deploy workflow checked into this repo at the moment.

## Design Conventions & Visual Universe (Patricia)

- **Aesthetic Theme**: Woodcut/xilogravura contemporary art, tarot card layouts, punk serigrafia.
- **Palette**: Printing black, paper cream, dark red, burned yellow. No smooth digital gradients or corporate-style cards.
- **Dual Atmosphere**: Dynamic transition from Ateliê (light mode: cream background, light) to Pista (dark mode: black background, red/amber lights).
- **Interactive Elements**:
  - Keep animations clean and controlled.
  - The Panther is a silent presence (no spoken dialogue/text).
  - No Discord pages/links.

## Life Planner & Remote Synchronization

- **Sync Path**: Integrated via Cloudflare Worker `chdx-sync` (KV namespace `STATE`).
- **Partial Merge**: PUT method must perform partial updates to preserve independent fields (`camarim`, `guests`, `photos`, `planner`).
- **Planner Security**: Access to the edit mode of `planejamento-vida.html` is gated behind the `?k=<EDIT_KEY>` URL query string. Non-authenticated users see a readonly version.
