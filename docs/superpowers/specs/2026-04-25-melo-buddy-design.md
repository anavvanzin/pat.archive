# Melo-Buddy: The Multiverse Companion Design Spec

## 1. Overview
The **Melo-Buddy** is a dynamic, persistent digital companion that lives within the MeloVanzin dashboard. It merges retro-fofo pixel aesthetics with modern glassmorphism UI, acting as a "Multiverse" agent that adapts to the player's current activity (League of Legends, Pokémon, friends) and acts as a direct line of communication between Ana and Lucas.

## 2. Core Systems
### 2.1 The Buddy (Entity)
- **Avatar**: A dynamic sprite that supports "Equippable Items" (League shield, Pokémon ball, Chucky knife).
- **Physics**: Uses `framer-motion` for fluid, spring-based dragging and bouncing.
- **Persistence**: Remembers the last state (active item, mood, position) via `localStorage`.

## 3. Personality & Karma-Sync
- **Karma-Main Integration**: The Buddy features a "Mantra" state. When he is active in the Hub/Game, the Buddy exhibits a subtle pink/gold aura characteristic of Karma's ultimate.
- **Mantra Mechanic**: Clicking the Buddy while the aura is active triggers a petal-burst animation (Karma-themed) instead of the standard heart-burst.
- **Dynamic Equipment**: The Buddy dynamically switches equipment/aura based on the `BotLaneWorld` status, reflecting his role as a support monochampion.

## 3. Aesthetic ("Modern Retro-Fofo")
- **Visuals**: High-resolution pixel art sprites (16x16 or 32x32) combined with modern UI components.
- **Glassmorphism**: Modals/Panels will feature backdrop-blur, subtle borders, and soft glows.
- **Motion**: `framer-motion` spring physics for natural "pet" movement.

## 4. Technical Strategy
- **State**: Extended Zustand store (`useBuddyStore`).
- **Animations**: `framer-motion` (Drag and AnimatePresence).
- **Icons**: `Lucide` (for the action menu) + custom sprite animations.

## 5. Success Criteria
- [ ] Buddy persists across world navigations.
- [ ] Buddy changes equipment based on the active world.
- [ ] Clicking Buddy opens the glassmorphic interaction panel.
- [ ] Interaction triggers a "Ping" notification and heart-burst on the receiving side.
- [ ] Aesthetic is crisp, performant, and maintains the retro charm.
