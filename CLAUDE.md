# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Patricia's ("pat" / CHDX) personal art + DJ portfolio and life-planner. UI copy is in **Portuguese (pt-BR)**; keep it that way. The frontend is **vanilla HTML/CSS/JS with no framework, no bundler, and no build step** — files in `site/` are served as-is. There is **no test suite and no linter configured** (`package.json` only has `start`/`dev`/`pages:dev`); "running tests" is not a thing here — validate changes by opening the page in a browser.

## Commands

```bash
# Root Express server (local API backend; serves site/ on :8080)
npm install
npm start            # node server.js
npm run dev          # nodemon auto-reload

# Preview the static site over HTTP (needed — index.html loads js/main.js as a
# type="module", which fails over file://). Any static server works, e.g.:
npx http-server site -p 8080

# chdx-sync worker (state + audio proxy)
cd chdx-sync && npx wrangler dev     # serves on :8787 locally

# Pages Functions + static preview together (prod-like)
npm run pages:dev                    # wrangler pages dev site
```

There is no single-test command because there are no tests. When verifying interactive JS, drive a headless browser against a local HTTP server rather than `file://`.

## Architecture (the parts that span multiple files)

### Two interchangeable API backends with the same contract
The `/api/tracks`, `/api/tracks/:filename`, and `/api/upload` (audio crate) endpoints are implemented **twice** and must be kept in sync:
- **Local dev** → `server.js` (Express + multer), stores uploads on disk in `site/uploads/`.
- **Production** → Cloudflare **Pages Functions** in `functions/api/`, stores in an **R2 bucket** bound as `AUDIO_BUCKET`.

Both fall back to a single built-in `procedural` track when no store is configured. Uploads are capped at 40 MB and limited to `.mp3/.wav/.ogg/.m4a/.flac`; filenames are sanitized and prefixed with `Date.now()_`. If you change the track/upload API shape, change **both** implementations.

### chdx-sync worker (`chdx-sync/src/worker.js`) — separate Cloudflare Worker
Deployed at `https://chdx-sync.warholana.workers.dev` (KV namespace `STATE`, single key `v1`). Distinct from the Pages deploy above. Routes:
- `GET /state` — public read of `{ camarim, guests, photos, planner }`.
- `PUT /state` — **edit-gated**: requires header `x-edit-key === EDIT_KEY` (a Wrangler secret). Server-side merges the incoming fields onto the stored state so concurrent tabs don't clobber each other.
- `GET /audio-proxy?url=` — CORS proxy restricted to an **allowlist of hosts** (`AUDIO_HOSTS`). Add hosts there, not in the client.

### Frontend state & sync (`site/js/sync-client.js`)
`window.CHDX.SyncClient` is the single sync layer, **localStorage-first**: it loads/persists locally and debounces (500 ms) a remote push. Editing is gated by a `?k=<EDIT_KEY>` URL query param — without it, the client is read-only ("modo local"; the sync badge in the header reflects `online`/`local`/`erro`). Remote state is split by `field` (`'planner'` for `planejamento-vida.html`, `'camarim'` for the index camarim/guests/photos). `getAudioProxyUrl()` resolves same-origin vs. local Express (`/api/audio-proxy`) vs. prod worker (`/audio-proxy`) automatically.

### Theme system (`site/js/theme.js`)
Dual atmosphere: **pista** (dark, default) ↔ **ateliê** (light). Toggling adds/removes `body.light-theme`, which flips a set of CSS custom properties in `css/main.css` (`--ink`, `--paper`, `--cream`, `--blood`, `--gold`, plus per-component `--*-bg` tokens). State persists to `localStorage['chdx_theme']` and broadcasts a `chdx:theme-change` event. Any element with `[data-theme-toggle]` or `#themeToggle` is auto-wired. Prefer adding new colors as tokens with a `body.light-theme` override rather than hard-coded hex.

### Main app (`site/js/main.js`)
One large IIFE (`type="module"`) driving the index page: a **procedural Web Audio engine** (two decks, mixer/EQ/faders/crossfader, FX echo/filter/reverb, step sequencer, crate/library), the tarot draw, the camarim planner (films/books/calendar/notes/capsules synced via SyncClient), the flyer generator (html2canvas → PNG), and the persistent bottom player. Interactive controls should be **semantic and keyboard-accessible** (real `<button>`s, `role="slider"` + arrow-key handlers for faders) — a recent pass converted the old click-only `<div>`s, so follow that pattern for new controls.

### Pages & the gift gate
`index.html` is the public hub. `biblioteca.html`, `poemas.html`, `tarot.html` are the private archive, reached through the "SACERDOTISA GATE" overlay (`#giftGate`, dismissed by navigating to `#home`). `planejamento-vida.html` is a self-contained life planner (its own font stack: Fraunces / Space Grotesk / Space Mono). `produtividade/dashboard.html` is a separate personal task dashboard (see `produtividade/CLAUDE.md`).

## Deployment — two paths, one is redundant
- **Intended:** `.github/workflows/deploy.yml` runs `wrangler pages deploy site --project-name=pixel-love` on push to `main`. Root `wrangler.toml` sets `pages_build_output_dir = "site"`.
- **Also active:** a Cloudflare **Pages Git-integration** build triggers on every push/PR and surfaces as the "Cloudflare Pages" check. It has been failing independently of repo contents (it does not parse HTML/CSS/JS, and the Functions have no imports) — treat its red X as an infra/config issue, not a code regression, and check the Cloudflare dashboard logs. The Action is the real deploy.

## Gotchas
- **Google Fonts URLs:** multi-word families must be `+`-encoded (`Hanken+Grotesk`, not `Hanken Grotesk`) or the whole request silently drops the font.
- Everything deploys straight from `site/` with no build, so any file you add there ships — don't leave scratch/duplicate HTML in `site/`.
- Secrets (`EDIT_KEY`, `CLOUDFLARE_API_TOKEN`, R2 binding) live in Wrangler/GitHub, never in the repo.
