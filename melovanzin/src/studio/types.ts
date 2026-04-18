export type StepPattern = boolean[]

export interface Pattern {
  id: string
  name: string
  length: number
}

export interface ChannelSource {
  type: 'upload' | 'lyra'
  fileName: string
  mimeType: string
  sampleDataUrl?: string
  remoteUrl?: string
  sourceLabel: string
}

export interface FilterFxState {
  enabled: boolean
  frequency: number
  resonance: number
}

export interface DelayFxState {
  enabled: boolean
  wet: number
  time: number
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

export interface StudioChannel {
  id: string
  name: string
  color: string
  source: ChannelSource
  volume: number
  pan: number
  mute: boolean
  solo: boolean
  fx: ChannelFxState
  steps: Record<string, StepPattern>
}

export interface PlaylistClip {
  id: string
  patternId: string
  channelId: string
  barIndex: number
}

export interface StudioProject {
  version: 1
  id: string
  name: string
  bpm: number
  bars: number
  patternLength: number
  patternOrder: string[]
  patterns: Record<string, Pattern>
  channels: StudioChannel[]
  playlist: PlaylistClip[]
  selectedPatternId: string
  createdAt: number
  updatedAt: number
}

export interface TransportState {
  isPlaying: boolean
  currentStep: number
  currentBar: number
}

export interface StudioSelectionState {
  selectedPatternId: string
  selectedChannelId: string | null
  selectedBarIndex: number | null
}

export const DEFAULT_BPM = 124
export const DEFAULT_BARS = 8
export const DEFAULT_PATTERN_LENGTH = 16
export const DEFAULT_PATTERN_ID = 'pattern-a'

export const CHANNEL_COLORS = ['#ff6eb4', '#c97dff', '#ffe066', '#7c3aed', '#1db954', '#ff9ed6']
