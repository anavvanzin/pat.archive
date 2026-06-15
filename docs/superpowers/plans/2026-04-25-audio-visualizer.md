# Audio Visualizer Implementation Plan

**Goal:** Integrate a lightweight real-time frequency visualizer into the SpotifyPlayer.
**Architecture:** Use `Howler.ctx` + `AnalyserNode` -> Canvas rendering in a dedicated React component.
**Tech Stack:** Web Audio API, React, HTML5 Canvas.

---

### Task 1: PixelAudioEngine Visualizer Hook

**Files:**
- Modify: `src/audio/pixelLoveAudio.ts`

- [ ] **Step 1: Expose AnalyserNode**
  Create a getter in `PixelAudioEngine` that returns the `AnalyserNode` connected to `Howler.ctx`.
- [ ] **Step 2: Commit**
  `git add src/audio/pixelLoveAudio.ts && git commit -m "feat: expose AnalyserNode for audio visualization"`

### Task 2: AudioVisualizer Component

**Files:**
- Create: `src/components/AudioVisualizer.tsx`

- [ ] **Step 1: Implement Canvas Renderer**
  Create a component that accepts an `analyser` prop and renders frequency bars via `requestAnimationFrame`.
- [ ] **Step 2: Commit**
  `git add src/components/AudioVisualizer.tsx && git commit -m "feat: implement AudioVisualizer canvas component"`

### Task 3: Integration

**Files:**
- Modify: `src/components/SpotifyPlayer.tsx`

- [ ] **Step 1: Integrate Visualizer**
  Import `AudioVisualizer` and insert it into the `SpotifyPlayer` layout.
- [ ] **Step 2: Run and Verify**
  Ensure visualizer renders smoothly without performance drops.
- [ ] **Step 3: Commit**
  `git add . && git commit -m "feat: integrate audio visualizer into SpotifyPlayer"`
