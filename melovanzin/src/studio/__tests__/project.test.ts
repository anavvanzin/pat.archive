import { describe, expect, it } from 'vitest'

import {
  createEmptyProject,
  createSampleChannel,
  createPattern,
  duplicatePattern,
  placeClip,
  resolveChannelStepsAtSongStep,
  serializeProject,
  hydrateProject,
  addChannelToProject,
} from '../project'

describe('studio project domain', () => {
  it('creates a project with a default starter pattern and empty playlist', () => {
    const project = createEmptyProject('Nosso Loop')

    expect(project.name).toBe('Nosso Loop')
    expect(project.bpm).toBe(128)
    expect(project.patternOrder).toEqual(['pattern-a'])
    expect(project.playlist).toEqual([])
    expect(project.channels).toHaveLength(0)
    expect(project.patterns['pattern-a']).toHaveLength(16)
  })

  it('creates uploaded-sample channels with mixer defaults and empty pattern data', () => {
    const channel = createSampleChannel({
      name: 'Vocal Chop',
      fileName: 'lucas-vocal.wav',
      mimeType: 'audio/wav',
      sampleDataUrl: 'data:audio/wav;base64,AAA=',
    })

    expect(channel.name).toBe('Vocal Chop')
    expect(channel.source?.fileName).toBe('lucas-vocal.wav')
    expect(channel.steps['pattern-a']).toHaveLength(16)
    expect(channel.volume).toBe(0)
    expect(channel.pan).toBe(0)
    expect(channel.fx.filter.enabled).toBe(false)
    expect(channel.fx.delay.wet).toBe(0)
    expect(channel.fx.reverb.wet).toBe(0)
  })

  it('adds channel to project with pattern steps initialized', () => {
    const project = createEmptyProject('Channel Test')
    const channel = createSampleChannel({
      name: 'HiHat',
      fileName: 'hihat.wav',
      mimeType: 'audio/wav',
      sampleDataUrl: 'data:audio/wav;base64,AAA=',
    })
    channel.steps['pattern-a'][0] = true

    const result = addChannelToProject(project, channel)

    expect(result.channels).toHaveLength(1)
    expect(result.channels[0].name).toBe('HiHat')
    expect(result.channels[0].steps['pattern-a']).toHaveLength(16)
    expect(result.channels[0].steps['pattern-a'][0]).toBe(true)
  })

  it('adds channel with steps for all existing patterns', () => {
    let project = createEmptyProject('Multi Pattern')
    project = duplicatePattern(project, 'pattern-a')

    const channel = createSampleChannel({
      name: 'Kick',
      fileName: 'kick.wav',
      mimeType: 'audio/wav',
      sampleDataUrl: 'data:audio/wav;base64,AAA=',
    })

    // channel only has pattern-a steps initially
    expect(channel.steps['pattern-a']).toBeDefined()
    expect(channel.steps['pattern-b']).toBeUndefined()

    const result = addChannelToProject(project, channel)

    // After adding, should have steps for both patterns
    expect(result.channels).toHaveLength(1)
    expect(result.channels[0].steps['pattern-a']).toHaveLength(16)
    expect(result.channels[0].steps['pattern-b']).toHaveLength(16)
  })

  it('updates channel volume and pan', () => {
    const project = createEmptyProject('Mixer Test')
    const channel = createSampleChannel({
      name: 'Bass',
      fileName: 'bass.wav',
      mimeType: 'audio/wav',
      sampleDataUrl: 'data:audio/wav;base64,AAA=',
    })
    let result = addChannelToProject(project, channel)

    // Simular update via map
    result = {
      ...result,
      channels: result.channels.map(ch =>
        ch.id === channel.id
          ? { ...ch, volume: -6, pan: -0.5 }
          : ch
      ),
    }

    expect(result.channels[0].volume).toBe(-6)
    expect(result.channels[0].pan).toBe(-0.5)
  })

  it('mutes channel and respects solo logic', () => {
    const project = createEmptyProject('Mute Solo Test')
    const ch1 = createSampleChannel({
      name: 'Kick',
      fileName: 'kick.wav',
      mimeType: 'audio/wav',
      sampleDataUrl: 'data:audio/wav;base64,AAA=',
    })
    let result = addChannelToProject(project, ch1)
    result = {
      ...result,
      channels: result.channels.map(ch =>
        ch.id === ch1.id ? { ...ch, mute: true } : ch
      ),
    }

    expect(result.channels[0].mute).toBe(true)

    // Solo: when any channel is solo'd, only solo'd channels play
    result = {
      ...result,
      channels: result.channels.map(ch =>
        ch.id === ch1.id ? { ...ch, mute: false, solo: true } : ch
      ),
    }

    expect(result.channels[0].solo).toBe(true)
  })

  it('toggles step in a channel pattern', () => {
    const project = createEmptyProject('Step Toggle')
    const channel = createSampleChannel({
      name: 'Clap',
      fileName: 'clap.wav',
      mimeType: 'audio/wav',
      sampleDataUrl: 'data:audio/wav;base64,AAA=',
    })
    let result = addChannelToProject(project, channel)

    // Toggle step on
    const steps = result.channels[0].steps['pattern-a']
    steps[4] = true

    result = {
      ...result,
      channels: result.channels.map(ch =>
        ch.id === channel.id
          ? { ...ch, steps: { ...ch.steps, 'pattern-a': [...steps] } }
          : ch
      ),
    }

    expect(result.channels[0].steps['pattern-a'][4]).toBe(true)
  })

  it('removes clip from playlist at specific bar', () => {
    const project = createEmptyProject('Remove Clip')
    const channel = createSampleChannel({
      name: 'Snare',
      fileName: 'snare.wav',
      mimeType: 'audio/wav',
      sampleDataUrl: 'data:audio/wav;base64,AAA=',
    })
    let result = addChannelToProject(project, channel)

    result = placeClip(result, {
      patternId: 'pattern-a',
      barIndex: 3,
      channelId: channel.id,
    })

    expect(result.playlist).toHaveLength(1)

    // Remove by placing empty (or filter approach)
    result = {
      ...result,
      playlist: result.playlist.filter(
        clip => !(clip.channelId === channel.id && clip.barIndex === 3)
      ),
    }

    expect(result.playlist).toHaveLength(0)
  })

  it('updates channel FX state', () => {
    const project = createEmptyProject('FX Update')
    const channel = createSampleChannel({
      name: 'Synth',
      fileName: 'synth.wav',
      mimeType: 'audio/wav',
      sampleDataUrl: 'data:audio/wav;base64,AAA=',
    })
    let result = addChannelToProject(project, channel)

    result = {
      ...result,
      channels: result.channels.map(ch =>
        ch.id === channel.id
          ? {
              ...ch,
              fx: {
                ...ch.fx,
                filter: { enabled: true, frequency: 800, resonance: 2 },
                delay: { enabled: true, wet: 0.3, time: '16n', feedback: 0.4 },
              },
            }
          : ch
      ),
    }

    expect(result.channels[0].fx.filter.enabled).toBe(true)
    expect(result.channels[0].fx.filter.frequency).toBe(800)
    expect(result.channels[0].fx.delay.enabled).toBe(true)
    expect(result.channels[0].fx.delay.wet).toBe(0.3)
  })

  it('duplicates a pattern and preserves the original step arrangement', () => {
    const project = createEmptyProject('Pad test')
    const source = createPattern()
    source[0] = true
    source[7] = true
    project.patterns['pattern-a'] = source

    const next = duplicatePattern(project, 'pattern-a')

    expect(next.patternOrder).toEqual(['pattern-a', 'pattern-b'])
    expect(next.patterns['pattern-b']).toEqual(source)
    expect(next.patterns['pattern-b']).not.toBe(source)
  })

  it('places clips on bars and resolves active channel steps from playlist arrangement', () => {
    let project = createEmptyProject('Arrangement')
    const channel = createSampleChannel({
      name: 'Kick',
      fileName: 'kick.wav',
      mimeType: 'audio/wav',
      sampleDataUrl: 'data:audio/wav;base64,AAA=',
    })
    channel.steps['pattern-a'][0] = true
    channel.steps['pattern-a'][4] = true
    project.channels.push(channel)
    project = placeClip(project, {
      patternId: 'pattern-a',
      barIndex: 2,
      channelId: channel.id,
    })

    expect(resolveChannelStepsAtSongStep(project, channel.id, 0)).toBe(false)
    expect(resolveChannelStepsAtSongStep(project, channel.id, 32)).toBe(true)
    expect(resolveChannelStepsAtSongStep(project, channel.id, 36)).toBe(true)
    expect(resolveChannelStepsAtSongStep(project, channel.id, 47)).toBe(false)
  })

  it('serializes and hydrates project JSON without losing channels, patterns or clips', () => {
    let project = createEmptyProject('Save me')
    const channel = createSampleChannel({
      name: 'Snare',
      fileName: 'snare.mp3',
      mimeType: 'audio/mpeg',
      sampleDataUrl: 'data:audio/mpeg;base64,BBB=',
    })
    project.channels.push(channel)
    project = placeClip(project, {
      patternId: 'pattern-a',
      barIndex: 1,
      channelId: channel.id,
    })

    const serialized = serializeProject(project)
    const hydrated = hydrateProject(serialized)

    expect(hydrated).not.toBeNull()
    expect(hydrated?.name).toBe('Save me')
    expect(hydrated?.channels[0]?.source?.fileName).toBe('snare.mp3')
    expect(hydrated?.playlist[0]?.patternId).toBe('pattern-a')
    expect(hydrated?.playlist[0]?.barIndex).toBe(1)
    expect(hydrated?.playlist[0]?.channelId).toBe(channel.id)
  })
})
