// ============================================================
// STUDIO PROJECT - Funções de domínio para projetos
// ============================================================

import type {
  ChannelFxState,
  ChannelSource,
  PlaylistClip,
  StepPattern,
  StudioChannel,
  StudioProject,
} from './types'
import {
  DEFAULT_BARS,
  DEFAULT_PATTERN_ID,
  DEFAULT_PATTERN_LENGTH,
} from './types'

// --- Utilitários ---

export function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

export function clonePatterns(patterns: Record<string, StepPattern>): Record<string, StepPattern> {
  return Object.fromEntries(Object.entries(patterns).map(([id, pattern]) => [id, [...pattern]]))
}

export function emptyFx(): ChannelFxState {
  return {
    filter: { enabled: false, frequency: 1200, resonance: 1 },
    delay: { enabled: false, wet: 0, time: '8n', feedback: 0.25 },
    reverb: { enabled: false, wet: 0, decay: 1.2 },
  }
}

// --- Constructors ---

export function createPattern(length = DEFAULT_PATTERN_LENGTH): StepPattern {
  return Array.from({ length }, () => false)
}

export interface NewChannelInput {
  name: string
  fileName: string
  mimeType: string
  sampleDataUrl: string
}

export function createSampleChannel(input: NewChannelInput): StudioChannel {
  return {
    id: makeId('channel'),
    name: input.name,
    color: 'var(--pu)',
    source: {
      fileName: input.fileName,
      mimeType: input.mimeType,
      sampleDataUrl: input.sampleDataUrl,
    },
    volume: 0,
    pan: 0,
    mute: false,
    solo: false,
    fx: emptyFx(),
    steps: {
      [DEFAULT_PATTERN_ID]: createPattern(),
    },
  }
}

export function createEmptyProject(name = 'Projeto Novo'): StudioProject {
  const now = Date.now()
  return {
    version: 1,
    id: makeId('project'),
    name,
    bpm: 128,
    bars: DEFAULT_BARS,
    patternLength: DEFAULT_PATTERN_LENGTH,
    patternOrder: [DEFAULT_PATTERN_ID],
    patterns: {
      [DEFAULT_PATTERN_ID]: createPattern(),
    },
    channels: [],
    playlist: [],
    selectedPatternId: DEFAULT_PATTERN_ID,
    createdAt: now,
    updatedAt: now,
  }
}

// --- mutations ---

export interface PlaceClipInput {
  patternId: string
  barIndex: number
  channelId: string
}

export function addChannelToProject(
  project: StudioProject,
  channel: StudioChannel
): StudioProject {
  const steps: Record<string, StepPattern> = {}
  for (const pid of project.patternOrder) {
    steps[pid] = channel.steps[pid] ?? createPattern(project.patternLength)
  }
  return {
    ...project,
    updatedAt: Date.now(),
    channels: [...project.channels, { ...channel, steps }],
  }
}

export function duplicatePattern(project: StudioProject, sourcePatternId: string): StudioProject {
  const source = project.patterns[sourcePatternId]
  if (!source) return project

  const nextLetter = String.fromCharCode(97 + project.patternOrder.length)
  const nextPatternId = `pattern-${nextLetter}`
  const now = Date.now()

  return {
    ...project,
    updatedAt: now,
    patternOrder: [...project.patternOrder, nextPatternId],
    patterns: {
      ...clonePatterns(project.patterns),
      [nextPatternId]: [...source],
    },
    channels: project.channels.map((channel) => ({
      ...channel,
      steps: {
        ...clonePatterns(channel.steps),
        [nextPatternId]: [...(channel.steps[sourcePatternId] ?? createPattern(project.patternLength))],
      },
    })),
  }
}

export function placeClip(project: StudioProject, clip: PlaceClipInput): StudioProject {
  const now = Date.now()
  const nextClip: PlaylistClip = {
    id: makeId('clip'),
    ...clip,
  }

  const filtered = project.playlist.filter(
    (item) => !(item.channelId === clip.channelId && item.barIndex === clip.barIndex)
  )

  return {
    ...project,
    updatedAt: now,
    playlist: [...filtered, nextClip].sort((a, b) => a.barIndex - b.barIndex),
  }
}

// --- Queries ---

export function resolveChannelStepsAtSongStep(
  project: StudioProject,
  channelId: string,
  songStep: number
): boolean {
  const channel = project.channels.find((entry) => entry.id === channelId)
  if (!channel) return false

  const barLength = project.patternLength
  const barIndex = Math.floor(songStep / barLength)
  const localStep = songStep % barLength

  const clip = project.playlist.find(
    (entry) => entry.channelId === channelId && entry.barIndex === barIndex
  )
  if (!clip) return false

  return Boolean(channel.steps[clip.patternId]?.[localStep])
}

// --- Serialização ---

export function serializeProject(project: StudioProject): string {
  return JSON.stringify(project, null, 2)
}

export function hydrateProject(raw: string): StudioProject | null {
  try {
    const parsed = JSON.parse(raw) as StudioProject
    if (parsed.version !== 1) return null
    if (!parsed.patternOrder?.length || !parsed.patterns || !parsed.channels) return null
    return parsed
  } catch {
    return null
  }
}