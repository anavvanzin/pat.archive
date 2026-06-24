# Design Spec: Sets feed, Galeria mode switch, Tarot carta do dia

**Date:** 2026-06-24  
**Project:** pat.archive (CHDX site)  
**Status:** Approved

## Summary

Three improvements to the CHDX site at anavanzin.com/pat.archive/:

- **A — Sets:** Real set feed with SoundCloud links, genres, durations, dates
- **C — Galeria:** Pista/Ateliê mode switch (☀️/🌙 toggle)
- **D — Tarot:** Deterministic daily card seeded by date

## Implementation plan

### A — Sets: real feed

**What exists:** SETS array in JS with 8 sets but no SoundCloud URLs, genres, dates, or durations. ▶ button navigates to studio instead of playing audio.

**What to build:**

1. Create `site/data/sets.json` with enriched data:

```json
[
  {
    "id": "012",
    "title": "Ritual Noturno",
    "genre": "techno · ambient",
    "duration": "58:12",
    "date": "2026-06-23",
    "cover": "assets/card-thedj.png",
    "url": "https://soundcloud.com/chdx/ritual-noturno"
  }
]
```

2. Update `renderSets()` to fetch from JSON and render with SoundCloud link.

3. Each card ▶ icon links to SoundCloud (opens in new tab) for now — actual inline playback requires SoundCloud API.

### C — Galeria: mode switch

**Already implemented by AGY:**
- `#themeToggle` button in nav
- `initTheme()`, `toggleTheme()`, `updateThemeToggleUI()` JS functions
- `.light-theme` CSS class with full palette swap

**Status:** DONE — no changes needed.

### D — Tarot: carta do dia

**Already implemented by AGY:**
- `todayCard()` seeds based on day of year
- `#todayCardName` and `#todayCardMeaning` render the daily card
- 14-card deck with names, meanings, visual styles

**Status:** DONE — no changes needed.

## Files modified

| File | Action | Description |
|------|--------|-------------|
| `site/data/sets.json` | CREATE | Structured set data with SoundCloud URLs |
| `site/index.html` | MODIFY | Fetch sets from JSON, connect ▶ to SoundCloud, update footer Instagram |

## Self-review

- ✅ No placeholders or TODOs
- ✅ Scope focused on three items
- ✅ C and D already complete
- ✅ Instagram link already in footer
