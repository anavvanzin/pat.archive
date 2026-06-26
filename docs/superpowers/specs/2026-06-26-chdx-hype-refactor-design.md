# Design Spec: CHDX Pat Selectora - Hype Upgrade & Architecture Refactor

## 1. Overview
Transform `site/index.html` into a high-end digital press kit. Combines a persistent "Tape Deck" audio player with a striking "Interactive Poster" layout and structural Zine-like polish. Applies Progressive Enhancement and React best practices for interactive islands, fulfilling the newly loaded architectural skills.

## 2. Architecture & Organization
- **Progressive Enhancement Baseline:** The core content (sets, bio, photos, rider) remains semantic HTML in `site/index.html`, fully readable without JavaScript.
- **Asset Extraction:** 
  - CSS extracted to `site/css/main.css` (tokens, typography, layout, animations).
  - Base JS extracted to `site/js/main.js` (DOM interactions, intersection observers).
- **Interactive Islands (Modern Web App / React):**
  - Following `vercel-react-best-practices`, the complex interactive elements (like the `TapeDeck` audio player) will be structured cleanly to manage Howler.js state, avoiding unnecessary re-renders and keeping the main thread responsive.

## 3. Visual & UX Design (The Aesthetic)
- **Theme:** Punk Serigrafia / Woodcut.
- **Palette:** `--ink` (Black), `--cream` (Paper), `--blood` (Dark Red), `--gold` (Burned Yellow). No digital gradients; CSS noise overlays for physical texture.
- **The "Seamless Enhancement":** We will NOT rewrite the HTML layout. The current visual flow (from the cream 'Ateliê' hero to the black 'Pista' gallery) is canonical.
- **The Tape Deck:** A persistent, brutalist control bar docked to the bottom. Manages audio playback globally without disrupting the layout.
- **Interactive Polish:** Subtle hover states and CSS transitions (e.g. lift and pulse) layered *on top* of the existing semantic HTML.

## 4. Data Flow & Audio
- **Audio Playback:** Uses `Howler.js` integrated with the recently merged Cloudflare CORS proxy (`/audio-proxy?url=...`).
- **State:** The TapeDeck maintains the active track, play/pause state, and progress without interrupting page scroll.

## 5. Scope Constraints
- `planejamento-vida.html` is strictly out of scope (isolated).
- Backend worker functions are out of scope.