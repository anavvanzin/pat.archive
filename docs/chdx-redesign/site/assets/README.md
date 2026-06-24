# Placeholder assets

These files back the inline SVG content in `index.html` and stay until a photo
shoot or a working image-model pass replaces them.

## What ships now

| File                                 | Used in            | Form                                |
|--------------------------------------|--------------------|-------------------------------------|
| `panther-mark.svg`                   | Nav + closing CTA  | Inline woodcut panther silhouette   |
| `hero-portrait-placeholder.svg`      | Hero background    | DJ silhouette + amber rim + smoke   |

## What is still placeholder

The 6 set covers and 4 atelier artworks are **inline `<svg>` elements inside
`index.html`**, not files in this folder. They use the locked palette
(`#0E0B0A`, `#F2EAD9`, `#B5221A`, `#C79A4B`) so the design reads without any
external image file.

## When real photography lands

Replace each inline `<svg>` with an `<img>` reference:

- `assets/hero-portrait-placeholder.jpg` — DJ booth at night, smoke, amber rim.
- `assets/set-cover-placeholder.jpg` × 6 — distinct covers, ink + blood + paper.
- `assets/atelier-artwork-{1..4}.jpg` — varied aspect woodcut/serigrafia/acrílica.
- `assets/panther-mark.jpg` — square woodcut scan, ≥1024px.

The CSS already targets `.cover svg`, `.crop svg`, `.hero-portrait { background: url(...) }`,
so swapping `<svg>` for `<img>` is a one-line change per node. The grid
sizing, rotation, framing and shadow do not need to change.

## Generation pass (when image model is available)

Run one section per call, 6 calls total. Each prompt must include:

- locked palette (`#0E0B0A`, `#F2EAD9`, `#B5221A`, `#C79A4B`)
- composition anchor (hero = bottom-left safe area; sets = square; atelier = varied aspect)
- background mode (hero = full-bleed; sets = solid; atelier = paper)
- forbidden AI tells (no purple glow, no orb blobs, no gradient text, no fake dashboards)
- typography cues when text is in-frame (Cormorant italic accent allowed only as a graphical element, not as rendered type)

## Photographic pass (preferred for hero + atelier)

- Hero: one portrait shoot at the DJ booth with smoke + amber rim light. Output as a single 16:9 JPEG.
- Atelier: one flat-lay shoot of 4 finished pieces on cream paper. Output as 4 JPEGs at varied aspect ratios.
- Panther mark: one ink-on-paper woodcut scan, square, 1024×1024 minimum.

Until then, the inline SVGs keep the page readable and the design system intact.
