# Audio Engine Overhaul Implementation Plan

> **For agentic workers:** Use subagent-driven-development (recommended) or executing-plans to implement task-by-task.

**Goal:** Replace placeholder audio module with a Howler.js-based engine supporting playlist/looping and introduce an icon-based UI.
**Architecture:** Singleton engine (`PixelAudioEngine`) + React component (`SpotifyPlayer`).
**Tech Stack:** React, TypeScript, Zustand, Howler.js.

---

### Task 1: Initialize PixelAudioEngine

**Files:**
- Modify: `src/audio/pixelLoveAudio.ts`

- [ ] **Step 1: Install Howler.js types**
  `npm install @types/howler`
- [ ] **Step 2: Implement PixelAudioEngine**
  Replace placeholder with Howler implementation.
- [ ] **Step 3: Commit**
  `git add src/audio/pixelLoveAudio.ts && git commit -m "feat: implement PixelAudioEngine with Howler.js"`

### Task 2: SpotifyPlayer UI Overhaul

**Files:**
- Modify: `src/components/SpotifyPlayer.tsx`

- [ ] **Step 1: Replace text controls**
  Remove "PLAY"/"PAUSE" and replace with `Lucide` icons.
- [ ] **Step 2: Add playlist/loop controls**
  Implement skip/back and loop buttons.
- [ ] **Step 3: Commit**
  `git add src/components/SpotifyPlayer.tsx && git commit -m "feat: implement icon-based player controls and playlist logic"`

### Task 3: State Sync and Integration

**Files:**
- Modify: `src/store/useStore.ts`

- [ ] **Step 1: Update Store**
  Ensure audio engine state (isPlaying, volume, progress) is correctly reflected.
- [ ] **Step 2: Verify Integration**
  `npm run dev` and test audio playback.
- [ ] **Step 3: Commit**
  `git add . && git commit -m "feat: integrate audio engine with global store"`
