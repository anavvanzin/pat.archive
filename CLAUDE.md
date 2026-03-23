# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This repo has two independent parts:

- **Root** — a minimal Express.js server (`server.js`) deployed to Google Cloud Run. No build step; runs directly with Node 18+.
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

- **Frontend → GitHub Pages**: `.github/workflows/deploy.yml` triggers on push to `main`, `master`, or `claude/melovanzin-retro-game-iULVz`. Builds from `melovanzin/` and deploys `dist/` to Pages.
- **Backend → Cloud Run**: Requires GitHub secrets `GCP_PROJECT_ID`, `GCP_WORKLOAD_IDENTITY_PROVIDER`, `GCP_SERVICE_ACCOUNT`.
