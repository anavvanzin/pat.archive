# Audio Import Fix (Local Assets)

**Goal:** Move audio imports to a local-first pattern to solve CORS issues permanently.

**Architecture:** Assets will be served from `melovanzin/public/audio/`. The `SourceBrowser.tsx` will treat these as local relative paths.

---

### Task 1: Setup Local Audio Directory

- [ ] **Step 1: Create directory**
  `mkdir -p melovanzin/public/audio`
- [ ] **Step 2: Note**
  *Action Required:* You need to move your audio files into `melovanzin/public/audio/`.

### Task 2: Update SourceBrowser logic

**Files:**
- Modify: `melovanzin/src/studio/components/SourceBrowser.tsx`

- [ ] **Step 1: Update import handler**
  Refactor `handleLyraImport` to look for local `/audio/` files if they are not remote URLs.
- [ ] **Step 2: Commit**
  `git add . && git commit -m "fix: switch audio imports to local assets to bypass CORS"`

---

### Execution
I will perform the implementation now.
