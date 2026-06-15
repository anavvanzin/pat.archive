import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DJTrack {
  id: string
  name: string
  url: string
  duration: number
  bpm: number
  artist?: string
  isLocal?: boolean
}

export interface DeckState {
  track: DJTrack | null
  isPlaying: boolean
  playbackRate: number // multiplier (e.g. 1.0)
  tempBpm: number // tempo em BPM ajustado
  currentTime: number
  cuePoint: number | null // hot cue principal
  loopActive: boolean
  loopLength: number // em batidas (1, 2, 4, 8, 16)
  volume: number // 0 a 1
  eqHigh: number // -12 a 12 dB
  eqMid: number // -12 a 12 dB
  eqLow: number // -12 a 12 dB
  filterFreq: number // -1 a 1 (0 é neutro, -1 LP completo, 1 HP completo)
}

const initialDeckState = (): DeckState => ({
  track: null,
  isPlaying: false,
  playbackRate: 1.0,
  tempBpm: 120,
  currentTime: 0,
  cuePoint: null,
  loopActive: false,
  loopLength: 4,
  volume: 0.8,
  eqHigh: 0,
  eqMid: 0,
  eqLow: 0,
  filterFreq: 0,
})

interface DJState {
  deckA: DeckState
  deckB: DeckState
  crossfader: number // -1 (Deck A) a 1 (Deck B)
  playlist: DJTrack[]
  
  // Actions
  loadTrack: (deck: 'A' | 'B', track: DJTrack) => void
  setPlaying: (deck: 'A' | 'B', playing: boolean) => void
  setPlaybackRate: (deck: 'A' | 'B', rate: number) => void
  setCurrentTime: (deck: 'A' | 'B', time: number) => void
  setCuePoint: (deck: 'A' | 'B', time: number | null) => void
  setLoopActive: (deck: 'A' | 'B', active: boolean) => void
  setLoopLength: (deck: 'A' | 'B', length: number) => void
  setVolume: (deck: 'A' | 'B', volume: number) => void
  setEQ: (deck: 'A' | 'B', band: 'high' | 'mid' | 'low', value: number) => void
  setFilter: (deck: 'A' | 'B', value: number) => void
  syncBpm: (fromDeck: 'A' | 'B', toDeck: 'A' | 'B') => void
  setCrossfader: (value: number) => void
  addToPlaylist: (track: DJTrack) => void
  removeFromPlaylist: (id: string) => void
  resetDJState: () => void
}

export const useDJStore = create<DJState>()(
  persist(
    (set, get) => ({
      deckA: initialDeckState(),
      deckB: initialDeckState(),
      crossfader: 0,
      playlist: [
        {
          id: 'demo1',
          name: 'House Groove',
          artist: 'MeloVanzin Cloud',
          url: 'https://tonejs.github.io/audio/loop/lately.mp3',
          duration: 0,
          bpm: 120,
        },
        {
          id: 'demo2',
          name: 'Minimal Techno Pulse',
          artist: 'MeloVanzin Cloud',
          url: 'https://tonejs.github.io/audio/loop/strings.mp3',
          duration: 0,
          bpm: 126,
        },
      ],

      loadTrack: (deck, track) =>
        set((s) => {
          const deckKey = deck === 'A' ? 'deckA' : 'deckB'
          return {
            [deckKey]: {
              ...s[deckKey],
              track,
              isPlaying: false,
              currentTime: 0,
              cuePoint: null,
              loopActive: false,
              tempBpm: track.bpm || 120,
              playbackRate: 1.0,
            },
          }
        }),

      setPlaying: (deck, playing) =>
        set((s) => {
          const deckKey = deck === 'A' ? 'deckA' : 'deckB'
          return {
            [deckKey]: {
              ...s[deckKey],
              isPlaying: playing,
            },
          }
        }),

      setPlaybackRate: (deck, rate) =>
        set((s) => {
          const deckKey = deck === 'A' ? 'deckA' : 'deckB'
          const trackBpm = s[deckKey].track?.bpm || 120
          return {
            [deckKey]: {
              ...s[deckKey],
              playbackRate: rate,
              tempBpm: trackBpm * rate,
            },
          }
        }),

      setCurrentTime: (deck, time) =>
        set((s) => {
          const deckKey = deck === 'A' ? 'deckA' : 'deckB'
          return {
            [deckKey]: {
              ...s[deckKey],
              currentTime: time,
            },
          }
        }),

      setCuePoint: (deck, time) =>
        set((s) => {
          const deckKey = deck === 'A' ? 'deckA' : 'deckB'
          return {
            [deckKey]: {
              ...s[deckKey],
              cuePoint: time,
            },
          }
        }),

      setLoopActive: (deck, active) =>
        set((s) => {
          const deckKey = deck === 'A' ? 'deckA' : 'deckB'
          return {
            [deckKey]: {
              ...s[deckKey],
              loopActive: active,
            },
          }
        }),

      setLoopLength: (deck, length) =>
        set((s) => {
          const deckKey = deck === 'A' ? 'deckA' : 'deckB'
          return {
            [deckKey]: {
              ...s[deckKey],
              loopLength: length,
            },
          }
        }),

      setVolume: (deck, volume) =>
        set((s) => {
          const deckKey = deck === 'A' ? 'deckA' : 'deckB'
          return {
            [deckKey]: {
              ...s[deckKey],
              volume,
            },
          }
        }),

      setEQ: (deck, band, value) =>
        set((s) => {
          const deckKey = deck === 'A' ? 'deckA' : 'deckB'
          const eqKey = band === 'high' ? 'eqHigh' : band === 'mid' ? 'eqMid' : 'eqLow'
          return {
            [deckKey]: {
              ...s[deckKey],
              [eqKey]: value,
            },
          }
        }),

      setFilter: (deck, value) =>
        set((s) => {
          const deckKey = deck === 'A' ? 'deckA' : 'deckB'
          return {
            [deckKey]: {
              ...s[deckKey],
              filterFreq: value,
            },
          }
        }),

      syncBpm: (fromDeck, toDeck) =>
        set((s) => {
          const fromKey = fromDeck === 'A' ? 'deckA' : 'deckB'
          const toKey = toDeck === 'A' ? 'deckA' : 'deckB'
          const targetBpm = s[fromKey].tempBpm
          const originalToBpm = s[toKey].track?.bpm || 120
          const neededRate = targetBpm / originalToBpm

          return {
            [toKey]: {
              ...s[toKey],
              playbackRate: neededRate,
              tempBpm: targetBpm,
            },
          }
        }),

      setCrossfader: (value) => set({ crossfader: value }),

      addToPlaylist: (track) =>
        set((s) => ({
          playlist: [...s.playlist.filter((t) => t.id !== track.id), track],
        })),

      removeFromPlaylist: (id) =>
        set((s) => ({
          playlist: s.playlist.filter((t) => t.id !== id),
        })),

      resetDJState: () =>
        set({
          deckA: initialDeckState(),
          deckB: initialDeckState(),
          crossfader: 0,
        }),
    }),
    {
      name: 'melovanzin-dj-storage',
      partialize: (s) => ({
        playlist: s.playlist,
      }),
    }
  )
)
