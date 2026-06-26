# CHDX Hype Refactor Implementation Plan

> **For agentic workers:** Use subagent-driven-development (recommended) or executing-plans to implement task-by-task.

**Goal:** Extract `index.html` inline styles/scripts and implement a persistent "Tape Deck" audio player with subtle interactive polish, without disrupting the canonical visual layout.
**Architecture:** Semantic HTML with Progressive Enhancement. CSS and JS extracted to dedicated files. Tape Deck added as a fixed bottom overlay.
**Tech Stack:** HTML5, CSS3 (variables, transitions), Vanilla JS, Howler.js.

---

### Task 1: CSS Extraction

**Files:**
- Create: `site/css/main.css`
- Modify: `site/index.html`

- [ ] **Step 1: Extract and link CSS**
  - Create `site/css/main.css`.
  - Cut the contents of the `<style>` block in `site/index.html` (lines 13-41) and paste into `site/css/main.css`.
  - In `site/index.html`, replace the `<style>` block with `<link rel="stylesheet" href="css/main.css">`.
  - Verify `site/index.html` still renders correctly visually via local server.

- [ ] **Step 2: Commit**
  ```bash
  git add site/index.html site/css/main.css
  git commit --author="anavvanzin <warholana@msn.com>" -m "refactor(css): extract inline styles to main.css"
  ```

### Task 2: JS Extraction

**Files:**
- Create: `site/js/main.js`
- Modify: `site/index.html`

- [ ] **Step 1: Extract and link JS**
  - Create `site/js/main.js`.
  - Cut the contents of the `<script type="module">` block at the bottom of `site/index.html` (Howler.js audio logic, smooth scroll, sync status) and paste into `site/js/main.js`.
  - In `site/index.html`, replace the script block with `<script type="module" src="js/main.js"></script>`.
  - Verify audio playback still functions.

- [ ] **Step 2: Commit**
  ```bash
  git add site/index.html site/js/main.js
  git commit --author="anavvanzin <warholana@msn.com>" -m "refactor(js): extract inline scripts to main.js"
  ```

### Task 3: The Persistent Tape Deck HTML

**Files:**
- Modify: `site/index.html`

- [ ] **Step 1: Inject Tape Deck Markup**
  - At the bottom of `site/index.html` (just before `</body>`), add the persistent Tape Deck HTML structure.
  ```html
  <!-- ===== TAPE DECK ===== -->
  <div id="tape-deck-wrapper" style="display: none;">
    <div class="tape-deck">
      <div class="audio-info">
        <div class="tape-reel-small" id="tape-reel-anim"></div>
        <div>
          <div class="tape-title" id="tape-title">NENHUM SET SELECIONADO</div>
          <div class="tape-meta" id="tape-meta">--:-- / -- BPM</div>
        </div>
      </div>
      <div class="audio-controls">
        <button class="btn ghost" id="tape-btn-prev">|&lt;</button>
        <button class="btn btnred" id="tape-btn-play">PLAY</button>
        <button class="btn ghost" id="tape-btn-next">&gt;|</button>
      </div>
    </div>
  </div>
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add site/index.html
  git commit --author="anavvanzin <warholana@msn.com>" -m "feat(html): add persistent tape deck structure"
  ```

### Task 4: Tape Deck Styling & Global Polish

**Files:**
- Modify: `site/css/main.css`

- [ ] **Step 1: Apply CSS to Tape Deck and Cards**
  - Append to `site/css/main.css`:
  ```css
  /* TAPE DECK */
  #tape-deck-wrapper {
    position: fixed; bottom: 0; left: 0; right: 0;
    background: var(--ink); border-top: 2px solid var(--gold);
    padding: 15px 30px; z-index: 100;
  }
  .tape-deck {
    max-width: 1180px; margin: 0 auto; display: flex;
    justify-content: space-between; align-items: center;
  }
  .audio-info { display: flex; align-items: center; gap: 15px; }
  .audio-controls { display: flex; gap: 10px; }
  .tape-reel-small {
    width: 24px; height: 24px; border: 1px solid var(--gold); border-radius: 50%;
    display: inline-flex; align-items: center; justify-content: center;
  }
  .tape-reel-small.playing { animation: spin360 4s linear infinite; }
  .tape-reel-small::after {
    content: ""; width: 8px; height: 8px; background: var(--ink);
    border: 1px solid var(--gold); border-radius: 50%;
  }
  .tape-title { color: var(--gold); font-family: Oswald, sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 0.1em; }
  .tape-meta { color: var(--blood); font-family: 'Space Mono', monospace; font-size: 10px; margin-top: 2px; }
  
  /* CARD HOVER POLISH */
  .setrow { transition: all 0.2s ease; border-left: 2px solid transparent; }
  .setrow:hover { background: rgba(181,34,26,.06); border-left-color: var(--blood); transform: translateX(4px); }
  ```
  - Ensure `body` has `padding-bottom: 90px;` to clear the tape deck.

- [ ] **Step 2: Commit**
  ```bash
  git add site/css/main.css
  git commit --author="anavvanzin <warholana@msn.com>" -m "style: style tape deck and add card hover polish"
  ```

### Task 5: Tape Deck Logic Integration

**Files:**
- Modify: `site/js/main.js`

- [ ] **Step 1: Wire up Howler to Tape Deck UI**
  - In `site/js/main.js`, update the playback logic to reveal and populate the `#tape-deck-wrapper` when a track starts.
  - Bind `#tape-btn-play` to toggle Howler playback state.
  - Update `#tape-btn-play` text (PLAY/PAUSE) based on state.
  - Toggle the `.playing` class on `#tape-reel-anim` based on state.
  - Sync track title and meta (duration/BPM) to `#tape-title` and `#tape-meta`.

- [ ] **Step 2: Commit**
  ```bash
  git add site/js/main.js
  git commit --author="anavvanzin <warholana@msn.com>" -m "feat(audio): bind persistent tape deck to howler playback state"
  ```