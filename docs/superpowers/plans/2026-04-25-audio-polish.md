# Audio Polish Implementation Plan

**Goal:** Elevate audio UX by moving the visualizer to an immersive overlay, adding playlist navigation feedback (1/N), and toggling active visual states for the loop button.

**Architecture:** Use absolute CSS positioning for visualizer overlay + local component state for UI feedback.

---

### Task 1: Immersive Visualizer Overlay

**Files:**
- Modify: `src/components/SpotifyPlayer.tsx`
- Modify: `src/components/AudioVisualizer.tsx`

- [ ] **Step 1: Reposition Visualizer**
  Modify `AudioVisualizer.tsx` and the `SpotifyPlayer` grid to place the visualizer absolutely behind the song title text as a subtle layer.
- [ ] **Step 2: Commit**
  `git add src/components/AudioVisualizer.tsx src/components/SpotifyPlayer.tsx && git commit -m "feat: make visualizer immersive behind track title"`

### Task 2: Playlist & Loop Feedback

**Files:**
- Modify: `src/components/SpotifyPlayer.tsx`

- [ ] **Step 1: Add Playlist Label**
  Display `currentTrackIndex + 1 / total` in the player UI.
- [ ] **Step 2: Toggle Loop Visuals**
  Add a `className="text-green-500"` when the repeat button is active.
- [ ] **Step 3: Commit**
  `git add src/components/SpotifyPlayer.tsx && git commit -m "feat: add playlist navigation feedback and loop active state"`

---

### Execution Choice:
1. **Subagent-Driven** (I will spawn a subagent to execute these visual refinements).
2. **Inline Execution** (I will handle these directly).

Which do you prefer?
