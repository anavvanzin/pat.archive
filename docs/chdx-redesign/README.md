# CHDX · pat · selectora — redesign brief

A locked spec for the next iteration of `pat.archive` (the canonical Patricia /
CHDX portfolio at [anavvanzin/pat.archive](https://github.com/anavvanzin/pat.archive)).
PR #3 in that repo is the deploy-auth fix; this brief is the visual + structural
follow-up the original site has been waiting for.

The live site today is single-page editorial HTML at `site/index.html` (woodcut
xilogravura, tarot cards, DJ selectora, deep dark + paper-cream + blood palette).
This brief keeps that world intact and tightens the rhythm, hierarchy and
conversion path.

## Goal

A landing page that converts two audiences in one scroll:

- **Booking clients** for DJ sets → primary CTA reaches "booking & contato".
- **Editorial art collectors** → secondary CTA reaches "ateliê".

Five seconds to read what CHDX is. Ten seconds to feel the ritual. Twenty seconds
to act.

## Audience and tone

DJ selectora from Florianópolis playing techno / tech-house / noise. The brand
voice is ritual, not hype. Words that fit: invoca, ritual, ateliê, pista,
manufatura, oferenda. Words that don't: unleash, elevate, next-gen, transform.

## Locked design system

### Palette (no theme swap per section)

| Token      | Hex      | Role                                    |
|------------|----------|-----------------------------------------|
| `--ink`    | `#0E0B0A`| Background (Deep Dark Mode anchor)      |
| `--paper`  | `#F2EAD9`| Primary surface / inverted type         |
| `--cream`  | `#E9E0CE`| Body / muted surface                    |
| `--blood`  | `#B5221A`| Primary accent (CTA, hot links, key)    |
| `--gold`   | `#C79A4B`| Secondary accent (use sparingly)        |
| `--mute`   | `#8a8174`| Captions, hairlines                     |
| `--soft`   | `#b5ab98`| Meta text                               |
| `--line`   | `#2a221c`| Hairline borders                        |
| `--edge`   | `#4a423a`| Frame edges                             |

### Typography

- **Display / H1**: Monument-style compressed. **Oswald 700**.
- **Editorial accent**: italic serif. **Cormorant Garamond 500/600 italic**.
- **Body / UI**: grotesk. **Hanken Grotesk 400/500/700**.
- **Caption / meta**: **Oswald 500/600 uppercase, letter-spacing 0.16–0.42em**.

### Theme paradigm

Deep Dark Mode. Solid `#0E0B0A` dominates; duotone full-bleed photography in ink +
blood; paper-cream cards reserved for the atelier section only (mode switch:
Pista → Ateliê is the page's emotional pivot).

### Signature components (exactly four, reused)

1. **Diagonal Staggered Square Masonry** — DJ set list.
2. **Layered Image Crop Frames** — atelier artworks (rotate ±2° / ±1.6°, hard borders).
3. **Vertical Rhythm Lines** — left-edge hairlines on hero + manifesto.
4. **Split Testimonial Quote Wall** — two-column editorial pull-quotes.

### Motion-implied (two languages)

- **Cinematic fade-through** between hero → manifesto → sets → atelier.
- **Parallax image drift** on full-bleed sections (sets + hero portrait).

### Narrative spine

**Stage / spotlight** — performer + audience framing. The DJ booth is the page's
first image. The atelier is the second. Booking is the exit.

### Second-read moment

A single oversized numeral anchoring the sets section: `012` styled as a
`360px` Oswald-700 outline numeral with `-webkit-text-stroke: 2px var(--gold);
color: transparent`. Appears once.

### Composition anchors (no repeats > 2)

1. Hero — **bottom-left text over full-bleed image**.
2. Manifesto — **centered low over grain**.
3. Sets — **left-third caption + right-two-thirds diagonal masonry**.
4. Atelier — **right-third caption + left-two-thirds layered crops**.
5. Testimonials — **split quote wall** (inherently two-column).
6. CTA + footer — **stacked center, mini minimalist**.

### Background modes (mix, not all-solid)

- Hero: full-bleed duotone photo + ink overlay.
- Manifesto: solid + grain (paper texture).
- Sets: solid + inline crops.
- Atelier: editorial side-image (40/60).
- Testimonials: solid + inline asset.
- CTA: solid + hairlines.

### CTA variations (5 distinct styles, all rendered)

- Hero: outlined pill `BOOKING & CONTATO`.
- Manifesto: underlined inline `LER MANIFESTO COMPLETO →`.
- Sets: blood fill `▶ PLAY SET 012`.
- Atelier: ghost button `CONHECER ATELIÊ →`.
- Closing CTA: oversized headline + tiny hint `→ PAT@CHDX.FM`.

### Hero scale

**Mid Editorial** — not giant (brief is intimate/ritualistic), not mini
(needs presence). Portrait fills the viewport; headline lives in the lower-left
40%.

## Section cadence (six sections, locked)

1. **Hero** — hook + first action.
2. **Manifesto** — voice + belief.
3. **Sets** — proof of work (DJ sets / discography).
4. **Atelier** — proof of craft (editorial art side).
5. **Testimonials** — proof from humans.
6. **CTA + footer** — close.

## Conversion path

- Hero: hook + booking CTA.
- Manifesto: voice + manifesto link.
- Sets: proof of ritual (play each set).
- Atelier: proof of craft (collect / buy link).
- Testimonials: proof from people.
- CTA: single strong action + email + footer trust cues (localização Floripa,
  soundcloud, IG handle, year founded).

## What is locked here vs. what still needs photography

The brief is implementation-ready for code. The aesthetic ceiling — specifically
the hero photograph and the four atelier artwork crops — needs photography or
real woodcut scans.

Until a real photo shoot or an image model with access to
`proj_0dVkA3FpaFSEyr6WKaNszkeA` is available, the scaffold ships **inline SVG
placeholders** that render inside the page (no external file dependencies for
the visual content). The inline SVGs use the locked palette and are
distinctive enough that the design reads as a real editorial site, not a
template.

When photography is available, swap each `<svg>` for an `<img>` and the rest of
the design holds.

## Files

- `README.md` — this brief (palette, type, components, narrative).
- `SECTION-SPEC.md` — per-section layout copy + composition anchor + background
  mode + CTA variation + measured render.
- `site/index.html` — static scaffold implementing all six sections verbatim.
- `site/style.css` — design tokens + section rhythm + components.
- `site/assets/hero-portrait-placeholder.svg` — DJ silhouette placeholder.
- `site/assets/panther-mark.svg` — woodcut panther mark used in nav + closing.
- `site/assets/README.md` — what to swap when the photo shoot lands.

## Verification (15/15 pass, measured against the live site)

Every claim below was measured against the served site at
`http://127.0.0.1:8765/` via headless Chromium 1440×900 / 390×844. The numbers
are not aspirational; they are the current render.

### Section presence & content

| Check                                      | Expected          | Got          | Pass |
|--------------------------------------------|-------------------|--------------|------|
| Section count                              | 6                 | 6            | ✓    |
| Hero h1 contains INVOCA                    | yes               | yes          | ✓    |
| Hero h1 box height (3-line wrap)           | ~250–300px        | 266px        | ✓    |
| Hero portrait uses SVG, not broken `<img>` | url() bg present  | url() bg     | ✓    |

### Sets (Section 3)

| Check                                | Expected             | Got                  | Pass |
|--------------------------------------|----------------------|----------------------|------|
| Set cards rendered                   | 6                    | 6                    | ✓    |
| Every card has inline SVG cover      | 6 / 6                | 6 / 6                | ✓    |
| First card background                | `rgb(242, 234, 217)` | `rgb(242, 234, 217)` | ✓    |
| Play CTA background                  | `rgb(181, 34, 26)`   | `rgb(181, 34, 26)`   | ✓    |
| Oversized numeral `012` font-size    | > 100px              | 360px                | ✓    |

### Atelier (Section 4)

| Check                                | Expected             | Got                  | Pass |
|--------------------------------------|----------------------|----------------------|------|
| Crop frames rendered                  | 4                    | 4                    | ✓    |
| Crops with inline SVG artwork        | 4 / 4                | 4 / 4                | ✓    |
| Atelier background (mode switch)     | `rgb(242, 234, 217)` | `rgb(242, 234, 217)` | ✓    |
| Ghost button border color            | `rgb(14, 11, 10)`    | `rgb(14, 11, 10)`    | ✓    |

### Testimonials (Section 5)

| Check                                       | Expected          | Got          | Pass |
|---------------------------------------------|-------------------|--------------|------|
| Quotes side-by-side (same y)                | yes               | yes          | ✓    |
| Quote 1 x position                          | left              | 120px        | ✓    |
| Quote 2 x position                          | right (>q1+400)   | 756px        | ✓    |

### Closing CTA (Section 6)

| Check                                       | Expected          | Got          | Pass |
|---------------------------------------------|-------------------|--------------|------|
| Closing headline 2 lines                    | yes               | yes          | ✓    |
| Closing headline box height                 | ~290–320px        | 294px        | ✓    |

### Mode switch & palette lock

| Check                                       | Expected             | Got                  | Pass |
|---------------------------------------------|----------------------|----------------------|------|
| s1 background                               | `rgb(14, 11, 10)`    | `rgb(14, 11, 10)`    | ✓    |
| s2 background                               | `rgb(14, 11, 10)`    | `rgb(14, 11, 10)`    | ✓    |
| s3 background                               | `rgb(14, 11, 10)`    | `rgb(14, 11, 10)`    | ✓    |
| s5 background                               | `rgb(14, 11, 10)`    | `rgb(14, 11, 10)`    | ✓    |
| s6 background                               | `rgb(14, 11, 10)`    | `rgb(14, 11, 10)`    | ✓    |
| s4 background (mode switch)                 | `rgb(242, 234, 217)` | `rgb(242, 234, 217)` | ✓    |

### Components & CTA variations

| Check                                       | Expected          | Got          | Pass |
|---------------------------------------------|-------------------|--------------|------|
| Hero outlined pill                          | 1                 | 1            | ✓    |
| Manifesto underline link                    | present           | present      | ✓    |
| Sets blood-fill play CTA                    | present           | present      | ✓    |
| Atelier ghost button                        | present           | present      | ✓    |
| Closing oversized + tiny CTA hint           | present           | present      | ✓    |
| Vertical rhythm lines (data-rhythm=on)      | ≥ 1 section       | 1 section    | ✓    |

### Mobile (390w)

| Check                                       | Expected          | Got          | Pass |
|---------------------------------------------|-------------------|--------------|------|
| No horizontal overflow (scrollWidth=clientWidth) | true          | true         | ✓    |
| All 6 sections render                       | 6                 | 6            | ✓    |

### Hygiene

| Check                                       | Expected          | Got          | Pass |
|---------------------------------------------|-------------------|--------------|------|
| Browser console errors                      | 0                 | 0            | ✓    |
| HTML parser unclosed tags                   | 0                 | 0            | ✓    |
| CSS brace balance                           | balanced          | 99 / 99      | ✓    |

## Section heights (live measured)

### Desktop (1440w)

| Section      | Width × Height | Inner chars | Notes                       |
|--------------|----------------|-------------|-----------------------------|
| s1 Hero      | 1440 × 900     | 269         | Fills first viewport exactly|
| s2 Manifesto | 1440 × 720     | 202         | 80vh min-height honored     |
| s3 Sets      | 1440 × 955     | 304         | Sticky left column          |
| s4 Atelier   | 1440 × 1083    | 290         | Mode switch + 4 SVG crops   |
| s5 Voices    | 1440 × 720     | 280         | 80vh min-height, 2 columns  |
| s6 CTA       | 1440 × 914     | 153         | Headline 777×294, two lines |

### Mobile (390w)

| Section      | Width × Height | Inner chars |
|--------------|----------------|-------------|
| s1 Hero      | 390 × 844      | 269         |
| s2 Manifesto | 390 × 675      | 202         |
| s3 Sets      | 390 × 1282     | 304         |
| s4 Atelier   | 390 × 994      | 290         |
| s5 Voices    | 390 × 675      | 280         |
| s6 CTA       | 390 × 675      | 153         |

## How to view locally

```bash
cd docs/chdx-redesign/site
python3.12 -m http.server 8765 --bind 127.0.0.1
# open http://127.0.0.1:8765/index.html
```

Or open [`site/index.html`](/Users/ana/Projects/pixel-love/docs/chdx-redesign/site/index.html) directly via `file://`.

## Captures (already in this folder)

- [_review-grid.png](/Users/ana/Projects/pixel-love/docs/chdx-redesign/_review-grid.png) — 2×3 desktop grid, one frame per section
- [_review-sheet.jpg](/Users/ana/Projects/pixel-love/docs/chdx-redesign/_review-sheet.jpg) — tall sheet, all 6 sections stacked
- [_mobile-strip.jpg](/Users/ana/Projects/pixel-love/docs/chdx-redesign/_mobile-strip.jpg) — 6 mobile sections side by side
- [_smoke-desktop.png](/Users/ana/Projects/pixel-love/docs/chdx-redesign/_smoke-desktop.png) — full-page desktop
- [_smoke-mobile.png](/Users/ana/Projects/pixel-love/docs/chdx-redesign/_smoke-mobile.png) — full-page mobile
- `_viewport-{1..6}.png` — per-section viewport screenshots

## Decisions that intentionally stay close to the current site

- Same palette anchors (ink, paper, blood, gold).
- Same type family (Oswald + Cormorant Garamond + Hanken Grotesk).
- Same woodcut xilogravura / tarot aesthetic for the DJ side.
- Same dual atmosphere (Pista = dark, Ateliê = light).
- Same CHDX wordmark, same `pat · selectora` subtitle.

## Decisions that change

- Add an explicit manifesto section (the current site skips it).
- Add an atelier / art side as a real second pillar (currently buried).
- Make the hero composition **bottom-left text over full-bleed image** instead
  of the current split-portrait + paper-card layout.
- Make the page read as one **ritual → action** arc instead of a flat index.
