import type {
  ChannelFxState,
  ChannelSource,
  Pattern,
  PlaylistClip,
  StepPattern,
  StudioChannel,
  StudioProject,
} from './types'
import {
  CHANNEL_COLORS,
  DEFAULT_BARS,
  DEFAULT_BPM,
  DEFAULT_PATTERN_ID,
  DEFAULT_PATTERN_LENGTH,
} from './types'

export function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

export function createPattern(
  id = DEFAULT_PATTERN_ID,
  length = DEFAULT_PATTERN_LENGTH,
  name = 'Pattern A'
): Pattern {
  return { id, length, name }
}

export function createEmptySteps(length = DEFAULT_PATTERN_LENGTH): StepPattern {
  return Array.from({ length }, () => false)
}

export function emptyFx(): ChannelFxState {
  return {
    filter: { enabled: false, frequency: 18000, resonance: 0.7 },
    delay: { enabled: false, wet: 0, time: 0.2, feedback: 0.25 },
    reverb: { enabled: false, wet: 0, decay: 2.2 },
  }
}

export interface UploadSourceInput {
  fileName: string
  mimeType: string
  sampleDataUrl: string
}

export interface LyraSourceInput extends UploadSourceInput {
  remoteUrl?: string
  sourceLabel?: string
}

export function createSourceFromUpload(input: UploadSourceInput): ChannelSource {
  return {
    type: 'upload',
    fileName: input.fileName,
    mimeType: input.mimeType,
    sampleDataUrl: input.sampleDataUrl,
    sourceLabel: 'upload',
  }
}

export function createSourceFromLyra(input: LyraSourceInput): ChannelSource {
  return {
    type: 'lyra',
    fileName: input.fileName,
    mimeType: input.mimeType,
    sampleDataUrl: input.sampleDataUrl,
    remoteUrl: input.remoteUrl,
    sourceLabel: input.sourceLabel ?? 'Lyra cloud',
  }
}

export interface NewChannelInput {
  name: string
  source: ChannelSource
  color?: string
}

export function createStudioChannel(input: NewChannelInput): StudioChannel {
  return {
    id: makeId('channel'),
    name: input.name,
    color: input.color ?? CHANNEL_COLORS[Math.floor(Math.random() * CHANNEL_COLORS.length)],
    source: input.source,
    volume: 0,
    pan: 0,
    mute: false,
    solo: false,
    fx: emptyFx(),
    steps: {
      [DEFAULT_PATTERN_ID]: createEmptySteps(),
    },
  }
}

export function createEmptyProject(name = 'Patrícia Session'): StudioProject {
  const starter = createPattern(DEFAULT_PATTERN_ID, DEFAULT_PATTERN_LENGTH, 'Pattern A')
  const now = Date.now()

  return {
    version: 1,
    id: makeId('project'),
    name,
    bpm: DEFAULT_BPM,
    bars: DEFAULT_BARS,
    patternLength: DEFAULT_PATTERN_LENGTH,
    patternOrder: [starter.id],
    patterns: { [starter.id]: starter },
    channels: [],
    playlist: [],
    selectedPatternId: starter.id,
    createdAt: now,
    updatedAt: now,
  }
}

function cloneChannelSteps(steps: Record<string, StepPattern>): Record<string, StepPattern> {
  return Object.fromEntries(Object.entries(steps).map(([id, pattern]) => [id, [...pattern]]))
}

function nextPatternIndex(project: StudioProject): number {
  return project.patternOrder.length
}

function patternNameFromIndex(index: number): string {
  const letter = String.fromCharCode(65 + index)
  return `Pattern ${letter}`
}

function patternIdFromIndex(index: number): string {
  const letter = String.fromCharCode(97 + index)
  return `pattern-${letter}`
}

export function addChannelToProject(project: StudioProject, channel: StudioChannel): StudioProject {
  const normalizedSteps = Object.fromEntries(
    project.patternOrder.map((patternId) => [
      patternId,
      [...(channel.steps[patternId] ?? createEmptySteps(project.patternLength))],
    ])
  )

  return {
    ...project,
    updatedAt: Date.now(),
    channels: [...project.channels, { ...channel, steps: normalizedSteps }],
  }
}

export function duplicatePattern(project: StudioProject, sourcePatternId: string): StudioProject {
  const sourcePattern = project.patterns[sourcePatternId]
  if (!sourcePattern) return project

  const nextIndex = nextPatternIndex(project)
  const nextId = patternIdFromIndex(nextIndex)
  const nextPattern = createPattern(nextId, sourcePattern.length, patternNameFromIndex(nextIndex))

  return {
    ...project,
    updatedAt: Date.now(),
    selectedPatternId: nextId,
    patternOrder: [...project.patternOrder, nextId],
    patterns: {
      ...project.patterns,
      [nextId]: nextPattern,
    },
    channels: project.channels.map((channel) => ({
      ...channel,
      steps: {
        ...cloneChannelSteps(channel.steps),
        [nextId]: [...(channel.steps[sourcePatternId] ?? createEmptySteps(project.patternLength))],
      },
    })),
  }
}

export function toggleStepInProject(
  project: StudioProject,
  channelId: string,
  patternId: string,
  stepIndex: number
): StudioProject {
  return {
    ...project,
    updatedAt: Date.now(),
    channels: project.channels.map((channel) => {
      if (channel.id !== channelId) return channel
      const current = [...(channel.steps[patternId] ?? createEmptySteps(project.patternLength))]
      current[stepIndex] = !current[stepIndex]
      return { ...channel, steps: { ...channel.steps, [patternId]: current } }
    }),
  }
}

export interface ClipPlacementInput {
  patternId: string
  channelId: string
  barIndex: number
}

export function placeClip(project: StudioProject, input: ClipPlacementInput): StudioProject {
  const nextClip: PlaylistClip = { id: makeId('clip'), ...input }
  const filtered = project.playlist.filter(
    (clip) => !(clip.channelId === input.channelId && clip.barIndex === input.barIndex)
  )

  return {
    ...project,
    updatedAt: Date.now(),
    playlist: [...filtered, nextClip].sort((a, b) => a.barIndex - b.barIndex),
  }
}

export function removeClip(
  project: StudioProject,
  input: Pick<ClipPlacementInput, 'channelId' | 'barIndex'>
): StudioProject {
  return {
    ...project,
    updatedAt: Date.now(),
    playlist: project.playlist.filter(
      (clip) => !(clip.channelId === input.channelId && clip.barIndex === input.barIndex)
    ),
  }
}

export function resolveChannelStepAtSongPosition(
  project: StudioProject,
  channelId: string,
  barIndex: number,
  stepIndex: number
): boolean {
  const channel = project.channels.find((entry) => entry.id === channelId)
  if (!channel) return false

  const clip = project.playlist.find(
    (entry) => entry.channelId === channelId && entry.barIndex === barIndex
  )
  if (!clip) return false

  return Boolean(channel.steps[clip.patternId]?.[stepIndex])
}

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
