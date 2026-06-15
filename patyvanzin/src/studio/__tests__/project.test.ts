import { describe, expect, it } from 'vitest'

import {
  addChannelToProject,
  createEmptyProject,
  createPattern,
  createSourceFromLyra,
  createSourceFromUpload,
  createStudioChannel,
  duplicatePattern,
  placeClip,
  removeClip,
  resolveChannelStepAtSongPosition,
  serializeProject,
  hydrateProject,
} from '../project'

describe('studio project domain', () => {
  it('creates a session project with a starter pattern and no channels', () => {
    const project = createEmptyProject('Lucas Session')

    expect(project.name).toBe('Lucas Session')
    expect(project.version).toBe(1)
    expect(project.bpm).toBe(124)
    expect(project.patternOrder).toEqual(['pattern-a'])
    expect(project.patterns['pattern-a'].length).toBe(16)
    expect(project.channels).toEqual([])
    expect(project.playlist).toEqual([])
  })

  it('normalizes uploaded samples into a serializable channel source', () => {
    const source = createSourceFromUpload({
      fileName: 'kiss-snare.wav',
      mimeType: 'audio/wav',
      sampleDataUrl: 'data:audio/wav;base64,AAA=',
    })

    expect(source.type).toBe('upload')
    expect(source.fileName).toBe('kiss-snare.wav')
    expect(source.sampleDataUrl).toContain('data:audio/wav')
    expect(source.sourceLabel).toBe('upload')
  })

  it('normalizes lyra samples into a serializable channel source', () => {
    const source = createSourceFromLyra({
      fileName: 'lyra-spark.mp3',
      mimeType: 'audio/mpeg',
      remoteUrl: 'https://example.com/lyra-spark.mp3',
      sampleDataUrl: 'data:audio/mpeg;base64,BBB=',
      sourceLabel: 'Lyra cloud',
    })

    expect(source.type).toBe('lyra')
    expect(source.remoteUrl).toBe('https://example.com/lyra-spark.mp3')
    expect(source.sourceLabel).toBe('Lyra cloud')
  })

  it('creates a channel from a sample source with mixer/fx defaults', () => {
    const source = createSourceFromUpload({
      fileName: 'vocal.wav',
      mimeType: 'audio/wav',
      sampleDataUrl: 'data:audio/wav;base64,AAA=',
    })

    const channel = createStudioChannel({
      name: 'Vocal Chop',
      source,
      color: '#ff6eb4',
    })

    expect(channel.name).toBe('Vocal Chop')
    expect(channel.source.fileName).toBe('vocal.wav')
    expect(channel.volume).toBe(0)
    expect(channel.pan).toBe(0)
    expect(channel.fx.filter.enabled).toBe(false)
    expect(channel.fx.delay.enabled).toBe(false)
    expect(channel.fx.reverb.enabled).toBe(false)
  })

  it('adds a channel and initializes step arrays for every pattern', () => {
    const project = duplicatePattern(createEmptyProject('Patterns'), 'pattern-a')
    const channel = createStudioChannel({
      name: 'Kick',
      source: createSourceFromUpload({
        fileName: 'kick.wav',
        mimeType: 'audio/wav',
        sampleDataUrl: 'data:audio/wav;base64,AAA=',
      }),
    })

    const result = addChannelToProject(project, channel)

    expect(result.channels).toHaveLength(1)
    expect(result.channels[0].steps['pattern-a']).toHaveLength(16)
    expect(result.channels[0].steps['pattern-b']).toHaveLength(16)
  })

  it('duplicates a pattern and preserves channel sequencing', () => {
    const base = createEmptyProject('Dupes')
    const channel = createStudioChannel({
      name: 'Clap',
      source: createSourceFromUpload({
        fileName: 'clap.wav',
        mimeType: 'audio/wav',
        sampleDataUrl: 'data:audio/wav;base64,AAA=',
      }),
    })
    channel.steps['pattern-a'][2] = true
    const project = addChannelToProject(base, channel)

    const next = duplicatePattern(project, 'pattern-a')

    expect(next.patternOrder).toEqual(['pattern-a', 'pattern-b'])
    expect(next.channels[0].steps['pattern-b'][2]).toBe(true)
    expect(next.channels[0].steps['pattern-b']).not.toBe(next.channels[0].steps['pattern-a'])
  })

  it('places and removes clips in the playlist by bar/channel', () => {
    const channel = createStudioChannel({
      name: 'Pad',
      source: createSourceFromUpload({
        fileName: 'pad.wav',
        mimeType: 'audio/wav',
        sampleDataUrl: 'data:audio/wav;base64,AAA=',
      }),
    })
    let project = addChannelToProject(createEmptyProject('Playlist'), channel)

    project = placeClip(project, { channelId: channel.id, patternId: 'pattern-a', barIndex: 2 })
    expect(project.playlist).toHaveLength(1)
    expect(project.playlist[0].barIndex).toBe(2)

    const cleared = removeClip(project, { channelId: channel.id, barIndex: 2 })
    expect(cleared.playlist).toHaveLength(0)
  })

  it('resolves playback steps from channel pattern plus playlist position', () => {
    const channel = createStudioChannel({
      name: 'Kick',
      source: createSourceFromUpload({
        fileName: 'kick.wav',
        mimeType: 'audio/wav',
        sampleDataUrl: 'data:audio/wav;base64,AAA=',
      }),
    })
    channel.steps['pattern-a'][0] = true
    channel.steps['pattern-a'][4] = true

    let project = addChannelToProject(createEmptyProject('Arrange'), channel)
    project = placeClip(project, { channelId: channel.id, patternId: 'pattern-a', barIndex: 1 })

    expect(resolveChannelStepAtSongPosition(project, channel.id, 0, 0)).toBe(false)
    expect(resolveChannelStepAtSongPosition(project, channel.id, 1, 0)).toBe(true)
    expect(resolveChannelStepAtSongPosition(project, channel.id, 1, 4)).toBe(true)
    expect(resolveChannelStepAtSongPosition(project, channel.id, 1, 9)).toBe(false)
  })

  it('serializes and hydrates a project without losing source metadata', () => {
    const source = createSourceFromLyra({
      fileName: 'lyra-choir.mp3',
      mimeType: 'audio/mpeg',
      remoteUrl: 'https://example.com/lyra-choir.mp3',
      sampleDataUrl: 'data:audio/mpeg;base64,CCC=',
    })
    const channel = createStudioChannel({ name: 'Choir', source })
    const project = addChannelToProject(createEmptyProject('Hydrate'), channel)

    const raw = serializeProject(project)
    const hydrated = hydrateProject(raw)

    expect(hydrated).not.toBeNull()
    expect(hydrated?.channels[0].source.type).toBe('lyra')
    expect(hydrated?.channels[0].source.remoteUrl).toBe('https://example.com/lyra-choir.mp3')
  })

  it('creates pattern objects with stable length and naming', () => {
    const pattern = createPattern('pattern-z', 32, 'Scene Z')

    expect(pattern.id).toBe('pattern-z')
    expect(pattern.length).toBe(32)
    expect(pattern.name).toBe('Scene Z')
  })
})
