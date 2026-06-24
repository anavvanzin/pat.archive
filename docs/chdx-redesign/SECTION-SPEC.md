# Section-by-section spec

Six sections, six anchors, six CTA variations. Each section specifies:

- composition anchor
- background mode
- copy blocks (verbatim, ready to render)
- CTA variation
- motion language
- measured render (live site, post-fix)

The scaffolding in `site/index.html` implements each section as `<section
id="s1">…<section id="s6">`. CSS hooks live in `site/style.css` under matching
`#s1`-`#s6` selectors.

The "measured render" rows come from headless Chromium 1440×900 captures
against `http://127.0.0.1:8765/`. They reflect the current state, not the spec.

---

## Section 1 of 6 — Hero

- **Anchor**: bottom-left text over full-bleed image.
- **Background**: SVG DJ silhouette (placeholder) + amber rim radial + paper
  grain + ink vignette.
- **Composition**: portrait fills viewport; text stack anchored to lower-left
  40% safe area; tiny woodcut panther mark in nav + nav links across the top.
- **Motion**: parallax image drift on scroll (deferred to JS).
- **Type**: Oswald 700 display + Cormorant italic accent.
- **Copy (verbatim)**:

  ```text
  eyebrow:        CHDX · pat · selectora
  headline:       SOM QUE / INVOCA
  headline-accent: pista · ritual · ruído
  support:        Floripa · techno · tech house · noise — DJ sets para pista,
                  festival e after-hours.
  primary CTA:    booking & contato   (outlined pill, cream border)
  secondary CTA:  ler manifesto ↓     (underlined inline)
  ```

- **CTA variation**: classic outlined pill + tiny underlined hint.
- **Measured render** (1440×900):
  - Section box: 1440 × 900
  - h1 box: 764 × 266 (3 lines: SOM QUE / INVOCA / pista · ritual · ruído)
  - Inner text: 269 chars
  - Hero portrait background: SVG + rim radial + stage pool (no broken `<img>`)

---

## Section 2 of 6 — Manifesto

- **Anchor**: centered low over grain.
- **Background**: solid `--ink` + paper grain radial gradient + vertical
  rhythm hairlines on left edge.
- **Composition**: small uppercase eyebrow at top-center, then a long
  editorial sentence in italic Cormorant centered, then an underlined inline
  CTA below.
- **Motion**: cinematic fade-through on enter.
- **Type**: Cormorant Garamond 500 italic for the sentence; Oswald 600
  uppercase for the eyebrow.
- **Copy (verbatim)**:

  ```text
  eyebrow:        MANIFESTO
  manifesto:      "Eu não procuro batida certa. Procuro o momento em que a
                   pista para de fingir. CHDX é isso: oferenda sonora pra
                   quem veio dançar, não pra quem veio posar."
                   — pat, 2026
  inline CTA:     ler manifesto completo →
  ```

- **CTA variation**: underlined inline link with arrow.
- **Measured render** (1440×720):
  - Section box: 1440 × 720
  - Blockquote box: 820 × 184, blood eyebrow at y=221..231
  - Inner text: 202 chars
  - Section carries the `data-rhythm="on"` attribute → vertical hairlines active

---

## Section 3 of 6 — Sets

- **Anchor**: left-third caption + right-two-thirds Diagonal Staggered Masonry.
- **Background**: solid `--ink` with subtle texture.
- **Composition**:
  - Left third: small eyebrow `SETS · 2026`, headline with the `012` numeral
    as the second-read oversized element (`-webkit-text-stroke: 2px var(--gold)`,
    font-size 360px), short support line, primary CTA `play set 012 ▶`.
  - Right two-thirds: 3×2 staggered square masonry of set covers (rotate ±2° /
    ±1.6°, hard `--gold` borders, paper background `rgb(242, 234, 217)`). Each
    cover is an inline SVG with a distinct motif so the design reads without
    external image files.
- **Motion**: parallax image drift on the masonry.
- **Type**: Oswald 700 for the numeral; Oswald 600 uppercase for eyebrows;
  Hanken Grotesk for the support line.
- **Set list (verbatim)**:

  ```text
  001 · AQUECIMENTO LENTO     [available]
  002 · OFERENDA              [available]
  003 · PANTERA NEGRA         [available]
  004 · RITUAL NOTURNO        [available]
  005 · AFTER DO AFTER        [live recording, ● ao vivo]
  006 · PISTA VAZIA           [available]
  ```

- **CTA variation**: tiny play icon inline (primary CTA `▶ play set 012`,
  background `rgb(181, 34, 26)`).
- **Measured render** (1440×955):
  - Section box: 1440 × 955
  - 6 set cards rendered, first card bg = paper
  - 6 / 6 cards contain inline SVG cover
  - Numeral font-size: 360px
  - Sticky left column keeps headline visible during scroll

---

## Section 4 of 6 — Atelier

- **Anchor**: right-third caption + left-two-thirds Layered Image Crop Frames.
- **Background mode**: editorial side-image (40/60 inverted). **Mode switch**:
  paper-cream background `rgb(242, 234, 217)` + ink type. This is the page's
  pivot from Pista to Ateliê.
- **Composition**:
  - Left two-thirds: a cluster of 4 framed artwork crops with hard borders,
    rotation `var(--tA, -2deg)` / `var(--tB, 1.6deg)`, paper texture inside
    the frame. Each crop is an inline SVG with distinct aspect ratio (200×140,
    120×180, 200×140, 120×180) so the cluster feels curated.
  - Right third: small eyebrow `ATELIÊ · XILOGRAVURA`, headline
    `MANUFATURA / DE IMAGEM`, support line, ghost button CTA.
- **Motion**: subtle parallax on the cluster.
- **Type**: Oswald 700 headline + Cormorant italic accent + Hanken Grotesk
  body.
- **Copy (verbatim)**:

  ```text
  eyebrow:        ATELIÊ · XILOGRAVURA
  headline:       MANUFATURA / DE IMAGEM
  headline-accent: o outro ofício da pat
  support:        Xilogravura, serigrafia e acrílica sobre papel algodão.
                   Edições curtas, feitas à mão em Floripa. Sem reprint,
                   sem loja aberta — só quando a peça pede.
  ghost CTA:      conhecer ateliê →
  ```

- **CTA variation**: ghost / outline button with arrow (border color
  `rgb(14, 11, 10)`).
- **Measured render** (1440×1083):
  - Section box: 1440 × 1083
  - 4 / 4 crops rendered with inline SVG artwork
  - Mode switch verified: background = paper, type = ink
  - Sticky right column

---

## Section 5 of 6 — Testimonials

- **Anchor**: split quote wall (two-column).
- **Background**: solid `--ink` + subtle paper grain.
- **Composition**: 2-column grid of large pull-quotes in Cormorant italic,
  attribution underneath in Oswald uppercase, hairlines separating them.
- **Type**: Cormorant Garamond 600 italic for quotes; Oswald 500 uppercase for
  attribution.
- **Copy (verbatim; quotes are placeholder until real ones are collected)**:

  ```text
  quote 1:
    "Pat lê a pista como quem lê partitura. Cada set é uma carta de tarô
    que ela joga pra pista."
    — DJ CARMEN MARIA, Radio Beats Floripa

  quote 2:
    "O ateliê dela imprime o que a música dela toca: marcas de madeira,
    silêncio entre traços, oferenda visual."
    — ARNO DAL RI JÚNIOR, UFSC
  ```

- **CTA variation**: none — this section is pure proof. CTA goes in the next
  section.
- **Measured render** (1440×720):
  - Section box: 1440 × 720
  - Quote 1 at x=120, quote 2 at x=756, same y → side-by-side confirmed
  - Inner text: 280 chars
  - Min-height: 80vh honored

---

## Section 6 of 6 — CTA + footer

- **Anchor**: stacked center, mini minimalist.
- **Background**: solid `--ink` + vertical rhythm hairlines.
- **Composition**: a tiny woodcut panther mark on top, eyebrow `CHDX`, then a
  massive oversized headline `PAT · / SELECTORA` in Oswald 700, a tiny CTA hint
  `→ pat@chdx.fm` below, and a thin footer with trust cues.
- **Motion**: cinematic fade-through on enter.
- **Type**: Oswald 700 headline, Oswald 500 uppercase meta.
- **Copy (verbatim)**:

  ```text
  eyebrow:        CHDX
  headline:       PAT · / SELECTORA
  support:        pista · ritual · ateliê
  CTA hint:       → pat@chdx.fm
  footer line 1:  florianópolis · sc · brasil
  footer line 2:  soundcloud / instagram / bandcamp — @chdx
  footer line 3:  © 2026 — feito por ana
  ```

- **CTA variation**: oversized headline + tiny CTA hint (the email is the
  primary action).
- **Measured render** (1440×914):
  - Section box: 1440 × 914
  - Headline box: 777 × 294 across two lines
  - Panther mark: 88 × 88
  - Inner text: 153 chars

---

## Cross-section checks (all verified)

- **Variety check**: 6 anchors used across 6 sections, no repeat > 2.
- **Background mix**: full-bleed (1), solid+inline (3), editorial side-image
  (1), solid+hairlines (1).
- **CTA variations**: 5 distinct styles used (outlined pill, underlined inline,
  play CTA, ghost button, oversized+CTA hint) — all five render with the
  expected colors.
- **Mode switch**: Pista (dark) → Ateliê (paper) → Pista (dark). Verified via
  `getComputedStyle().backgroundColor` on each section.
- **Spacing cadence**: equal vertical breathing between sections; atelier
  section is taller because it carries the mode switch.
- **Palette lock**: zero theme swap; only the surface inverts in atelier.
- **Conversion path**: hook → voice → proof (work) → proof (craft) →
  proof (people) → action. Every section has a job.

## How this spec was implemented (post-fix)

The first pass had three concrete problems, all caught by inspection of the
rendered output rather than the spec itself:

1. Hero was a flat gradient because the portrait image was missing.
2. Sets and atelier grids collapsed too thin on a 2-column split.
3. Testimonials looked like a thin strip (464px) instead of the spec's 720px.

Fixes that landed:

- Hero now ships a hand-drawn SVG DJ silhouette
  ([assets/hero-portrait-placeholder.svg](site/assets/hero-portrait-placeholder.svg)),
  amber rim radial, paper grain overlay and ink vignette. The page reads
  without external photography.
- Sets masonry widened to 1fr / 2.4fr so the right column carries 3 cards ×
  2 rows. Each cover is an inline SVG motif (no image files needed).
- Atelier cluster widened to 2.4fr / 1fr with 8-column inner grid; 4 distinct
  aspect-ratio crops (pantera, oferenda, pista vazia, ritual) rendered as
  inline SVGs.
- Testimonials given `min-height: 80vh` and inner max-width so the quotes
  breathe.
- Closing CTA headline broken across two lines (`PAT ·` / `SELECTORA`) so the
  scale reads at 200px.
- A panther mark SVG
  ([assets/panther-mark.svg](site/assets/panther-mark.svg)) drives both the nav
  and the closing CTA so the brand is identifiable without a real woodcut file.
