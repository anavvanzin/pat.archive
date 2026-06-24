# CHDX v2 — landed in the canonical repo

The redesigned 6-section scaffold now exists as
[`site/index-v2.html`](/Users/ana/Projects/pixel-love/site/index-v2.html) in
the canonical `pat.archive` repo (this checkout, branch `main`, remote
`origin` = `https://github.com/anavvanzin/pat.archive.git`).

It coexists with the existing `site/index.html` (the live production page).
Nothing was overwritten; the canonical CHDX experience is untouched.

## How the v2 page uses the canonical assets

The v2 page is photographic from day one — no inline SVG placeholders. It maps the 6 existing photos into the redesigned section grid:

| Slot | Asset |
|---|---|
| Hero | `IMG_7549.jpg` (new, 2026-06-23) |
| Set 001 · aquecimento lento | `card-thedj.png` |
| Set 002 · oferenda | `portrait-atelier.png` |
| Set 003 · pantera negra | `panther-flash.png` |
| Set 004 · ritual noturno | `portrait-selfie.png` |
| Set 005 · after do after (ao vivo) | `studio-chdx.png` |
| Set 006 · pista vazia | `stilllife.png` |
| Set 007 · recent (new) | `IMG_7549.jpg` |
| Set 008 · still life (new) | `IMG_7546.png` |
| Atelier crop · pantera | `panther-flash.png` |
| Atelier crop · oferenda | `card-thedj.png` |
| Atelier crop · pista | `studio-chdx.png` |
| Atelier crop · ritual | `portrait-selfie.png` |
| Atelier crop · still life (new) | `IMG_7546.png` |
| Nav + closing CTA · panther mark | `panther-mark.svg` |

## Latest update (2026-06-23)

Two photos added to `site/assets/`:

- `IMG_7549.jpg` — DNG converted to JPEG (6280×4710, 3.6 MB) via `sips`; used as
  hero background and as set 007 cover. Original DNG stays at
  `/Users/ana/Downloads/IMG_7549.DNG`.
- `IMG_7546.png` — copied as-is (4032×3024, 11 MB) into `site/assets/`; used as
  set 008 cover and as a 5th atelier crop.

The `IMG_7550.MOV` (408 MB) was NOT committed — per user, it will be resent
through a different path.

## How to preview

```bash
cd site
python3.12 -m http.server 8080 --bind 127.0.0.1
# open http://127.0.0.1:8080/index-v2.html
```

Or open [site/index-v2.html](/Users/ana/Projects/pixel-love/site/index-v2.html)
directly via `file://`.

## What ships in v2

- `site/index-v2.html` — 6-section scaffold (203 lines), uses the canonical
  photography from `site/assets/` for hero, sets covers, and atelier crops.
- `site/style-redesign.css` — design tokens + section rhythm, supports both
  inline-SVG and `<img>`-based covers via layered rules.
- `site/assets/panther-mark.svg` — woodcut panther mark for nav + closing CTA.

The original `site/index.html` and `site/planejamento-vida.html` are unchanged.

## Verified 11/11 on the canonical repo

| Check                                    | Got                            | Pass |
|------------------------------------------|--------------------------------|------|
| Section count                            | 6                              | ✓    |
| Hero h1 contains INVOCA, 3 lines         | 266px box, "SOM QUE / INVOCA / pista · ritual · ruído" | ✓    |
| Hero photo uses portrait-atelier.png     | url(...portrait-atelier.png)   | ✓    |
| 6 set cards rendered with `<img>` covers | 6 cards / 6 covers             | ✓    |
| First set cover points at a PNG asset    | `assets/card-thedj.png`        | ✓    |
| 4 atelier crops with `<img>` artworks    | 4 crops / 4 imgs               | ✓    |
| Testimonials side-by-side at desktop     | q1.x=120, q2.x=756, same y     | ✓    |
| Atelier mode-switch background           | `rgb(242, 234, 217)`           | ✓    |
| Sets blood-fill play CTA                 | `rgb(181, 34, 26)`             | ✓    |
| Oversized numeral `012`                  | 360px                          | ✓    |
| Mobile no horizontal overflow (390w)     | scrollWidth=clientWidth=390    | ✓    |

Captures: `_v2-review/grid.{png,jpg}` (2×3 desktop), `_v2-review/sheet.jpg`
(tall stack), `_v2-review/viewport-{1..6}.png` (per-section viewport),
`_v2-review/mobile-{1..6}.png` (per-section mobile).

## What did not change

- `site/index.html` — the live production CHDX page, untouched.
- `site/planejamento-vida.html` — life planner, untouched.
- `site/assets/*.png` — the 6 canonical photos, untouched.
- `chdx-sync/`, `produtividade/`, `functions/`, `wrangler.toml` — untouched.
- `vanzin/` rename and uncommitted docs edits — left for the user to land.

## How to swap v2 → production

If you decide v2 is the new production page, the change is two renames:

```bash
mv site/index.html site/index-v1.html   # archive the old page
mv site/index-v2.html site/index.html   # promote v2 to /
mv site/style-redesign.css site/style.css   # promote v2 CSS to /
# optional: update site/assets/panther-mark.svg reference if needed
```

Then commit + push. The deploy workflow (`.github/workflows/deploy.yml`)
publishes the `site/` folder on every push to `main` — Cloudflare Pages
will pick up the new `index.html`.

## If you decide v2 is not the new production page

No further action needed. The redesign brief + scaffold + verification
remain captured at `docs/chdx-redesign/`. The v2 page in `site/` can be
removed with `rm site/index-v2.html site/style-redesign.css
site/assets/panther-mark.svg`.
