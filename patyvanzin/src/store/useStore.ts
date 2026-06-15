import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type World = 'title' | 'hub' | 'studio' | 'memories' | 'recipes'

export interface BeatPattern {
  id: string
  name: string
  kick: boolean[]
  snare: boolean[]
  hihat: boolean[]
  bpm: number
}

export interface InventoryItem {
  id: string
  icon: string
  name: string
  description: string
  collectedAt: number
}

interface AppState {
  // Navigation
  currentWorld: World
  setWorld: (w: World) => void

  // Firebase Auth
  firebaseUser: import('../firebase').FirebaseUser | null
  setFirebaseUser: (user: import('../firebase').FirebaseUser | null) => void

  // Spotify player
  spotifyPlaying: boolean
  setSpotifyPlaying: (v: boolean) => void
  spotifyProgress: number
  setSpotifyProgress: (v: number) => void
  spotifyRepeat: boolean
  setSpotifyRepeat: (v: boolean) => void

  // Notifications
  notifications: { id: string; message: string; icon: string }[]
  addNotification: (msg: string, icon?: string) => void
  removeNotification: (id: string) => void

  // Love message overlay
  showLoveMessage: boolean
  loveMessageIndex: number
  setShowLoveMessage: (v: boolean) => void
  nextLoveMessage: () => void

  // Fruit Loops
  savedBeats: BeatPattern[]
  saveBeat: (beat: BeatPattern) => void
  deleteBeat: (id: string) => void

  // Tibia inventory
  inventory: InventoryItem[]
  addToInventory: (item: Omit<InventoryItem, 'id' | 'collectedAt'>) => void

  // Buddy state
  buddyAura: 'none' | 'mantra' | 'love'
  setBuddyAura: (a: 'none' | 'mantra' | 'love') => void

  // Bot Lane
  botLaneScore: { kills: number; deaths: number; assists: number; minions: number }
  updateBotLaneScore: (delta: Partial<AppState['botLaneScore']>) => void
  highScoreMinions: number

  // Heart burst event
  heartBurstPos: { x: number; y: number } | null
  triggerHeartBurst: (x: number, y: number) => void
  clearHeartBurst: () => void

  // Easter eggs (max 6)
  easterEggs: string[]
  unlockEasterEgg: (id: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentWorld: 'title',
      setWorld: (w) => set({ currentWorld: w }),

      firebaseUser: null,
      setFirebaseUser: (user) => set({ firebaseUser: user }),

      spotifyPlaying: true,
      setSpotifyPlaying: (v) => set({ spotifyPlaying: v }),
      spotifyProgress: 0,
      setSpotifyProgress: (v) => set({ spotifyProgress: v }),
      spotifyRepeat: false,
      setSpotifyRepeat: (v) => set({ spotifyRepeat: v }),

      notifications: [],
      addNotification: (message, icon = '✦') => {
        const id = Math.random().toString(36).slice(2)
        set((s) => ({ notifications: [...s.notifications, { id, message, icon }] }))
        setTimeout(() => get().removeNotification(id), 4000)
      },
      removeNotification: (id) =>
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

      showLoveMessage: false,
      loveMessageIndex: 0,
      setShowLoveMessage: (v) => set({ showLoveMessage: v }),
      nextLoveMessage: () =>
        set((s) => ({ loveMessageIndex: (s.loveMessageIndex + 1) % 10 })),

      savedBeats: [],
      saveBeat: (beat) =>
        set((s) => ({
          savedBeats: [...s.savedBeats.filter((b) => b.id !== beat.id), beat],
        })),
      deleteBeat: (id) =>
        set((s) => ({ savedBeats: s.savedBeats.filter((b) => b.id !== id) })),

      inventory: [],
      addToInventory: (item) => {
        const id = Math.random().toString(36).slice(2)
        set((s) => ({
          inventory: [...s.inventory, { ...item, id, collectedAt: Date.now() }],
        }))
      },

      buddyAura: 'none',
      setBuddyAura: (aura) => set({ buddyAura: aura }),

      botLaneScore: { kills: 0, deaths: 0, assists: 0, minions: 0 },
      updateBotLaneScore: (delta) =>
        set((s) => ({ botLaneScore: { ...s.botLaneScore, ...delta } })),
      highScoreMinions: 0,

      heartBurstPos: null,
      triggerHeartBurst: (x, y) => {
        set({ heartBurstPos: { x, y } })
        setTimeout(() => set({ heartBurstPos: null }), 1200)
      },
      clearHeartBurst: () => set({ heartBurstPos: null }),

      easterEggs: [],
      unlockEasterEgg: (id) => {
        const current = get().easterEggs
        if (current.includes(id)) return
        set({ easterEggs: [...current, id] })
      },
    }),
    {
      name: 'patyvanzin-storage',
      partialize: (s) => ({
        savedBeats: s.savedBeats,
        inventory: s.inventory,
        highScoreMinions: s.highScoreMinions,
        easterEggs: s.easterEggs,
      }),
    }
  )
)
