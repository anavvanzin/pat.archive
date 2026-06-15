# Melo-Buddy Implementation Plan

**Goal:** Implement the "Melo-Buddy" persistent companion with Karma-main (League of Legends) integration.

**Architecture:**
- **Store**: `useBuddyStore` (persisted via `localStorage`).
- **Component**: `MeloBuddy.tsx` (persistent portal at root level).
- **Animation**: `framer-motion` for drag, bounce, and Karma-aura effects.

---

### Task 1: Buddy State & Store

**Files:**
- Create: `src/store/useBuddyStore.ts`

- [ ] **Step 1: Initialize Buddy Store**
  Create store with `item`, `mood`, `auraColor`, `pos`, and `isMantraActive`.
- [ ] **Step 2: Commit**
  `git add src/store/useBuddyStore.ts && git commit -m "feat: init melobuddy zustand store"`

### Task 2: Implement Melo-Buddy Component

**Files:**
- Create: `src/components/MeloBuddy.tsx`

- [ ] **Step 1: Setup Draggable Overlay**
  Use `framer-motion` to make a draggable, bouncy persistent companion.
- [ ] **Step 2: Implement Karma Aura**
  Add a CSS animation for the "Mantra" pulse (Karma's colors).
- [ ] **Step 3: Commit**
  `git add src/components/MeloBuddy.tsx && git commit -m "feat: implement persistent MeloBuddy with Karma aura"`

### Task 3: World & League Integration

**Files:**
- Modify: `src/App.tsx` (to mount Buddy)
- Modify: `src/screens/BotLaneWorld.tsx` (trigger Mantra aura)

- [ ] **Step 1: Mount Buddy**
  Mount in `App.tsx` alongside `CRTOverlay`.
- [ ] **Step 2: World-Aware Trigger**
  Trigger "Mantra Aura" when the user is inside `BotLaneWorld`.
- [ ] **Step 3: Commit**
  `git add . && git commit -m "feat: link melobuddy to game worlds and karma champion status"`

---

### Execution Choice:
1. **Subagent-Driven** (I will spawn subagents for these tasks).
2. **Inline Execution** (I will handle these directly).

Which do you prefer?
