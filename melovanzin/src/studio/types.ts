// ============================================================
// STUDIO TYPES - Tipos canônicos para o FruitLoops Studio
// ============================================================

// --- Padrões ---
export type StepPattern = boolean[]

// --- Source de Áudio ---
export interface ChannelSource {
  fileName: string
  mimeType: string
  sampleDataUrl: string
}

// --- Estados de FX ---
export interface FilterFxState {
  enabled: boolean
  frequency: number
  resonance: number
}

export interface DelayFxState {
  enabled: boolean
  wet: number
  time: string
  feedback: number
}

export interface ReverbFxState {
  enabled: boolean
  wet: number
  decay: number
}

export interface ChannelFxState {
  filter: FilterFxState
  delay: DelayFxState
  reverb: ReverbFxState
}

// --- Canal (Track) ---
export interface StudioChannel {
  id: string
  name: string
  color: string
  source: ChannelSource | null
  volume: number
  pan: number
  mute: boolean
  solo: boolean
  fx: ChannelFxState
  steps: Record<string, StepPattern>
}

// --- Playlist ---
export interface PlaylistClip {
  id: string
  patternId: string
  barIndex: number
  channelId: string
}

// --- Projeto ---
export interface StudioProject {
  version: 1
  id: string
  name: string
  bpm: number
  bars: number
  patternLength: number
  patternOrder: string[]
  patterns: Record<string, StepPattern>
  channels: StudioChannel[]
  playlist: PlaylistClip[]
  selectedPatternId: string
  createdAt: number
  updatedAt: number
}

// --- Engine (runtime) ---
export interface EngineState {
  isPlaying: boolean
  currentStep: number
  currentBar: number
}

export interface ChannelPlaybackState {
  channelId: string
  isMuted: boolean
  volume: number
  pan: number
}

// --- UI State ---
export interface TransportControls {
  isPlaying: boolean
  isRecording: boolean
  bpm: number
  currentStep: number
  currentBar: number
}

export interface SelectionState {
  selectedChannelId: string | null
  selectedPatternId: string | null
  selectedBarIndex: number | null
}

// --- Export ---
export interface ExportFormat {
  type: 'json' | 'wav'
  includeSamples: boolean
}

// --- Persistência ---
export interface StoredProject {
  id: string
  name: string
  data: StudioProject
  savedAt: number
}

export interface StudioState {
  projects: Record<string, StudioProject>
  activeProjectId: string | null
  isStudioActive: boolean
}

// --- Constantes ---
export const DEFAULT_PATTERN_LENGTH = 16
export const DEFAULT_BARS = 8
export const DEFAULT_BPM = 128
export const DEFAULT_PATTERN_ID = 'pattern-a'