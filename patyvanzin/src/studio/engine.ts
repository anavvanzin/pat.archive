import * as Tone from 'tone'

import { resolveChannelStepAtSongPosition } from './project'
import { renderProjectToWav } from './export'
import type { ChannelSource, StudioProject } from './types'

interface ChannelRuntime {
  sourceKey: string
  buffer: AudioBuffer | null
  input: Tone.Gain
  filter: Tone.Filter
  delay: Tone.FeedbackDelay
  reverb: Tone.Reverb
  panner: Tone.Panner
  volume: Tone.Volume
}

function getSourceKey(source: ChannelSource): string {
  return [source.type, source.remoteUrl ?? '', source.sampleDataUrl ?? '', source.fileName].join('::')
}

function dataUrlToArrayBuffer(dataUrl: string): ArrayBuffer {
  const base64 = dataUrl.split(',')[1] ?? ''
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes.buffer
}

async function decodeSource(source: ChannelSource): Promise<AudioBuffer | null> {
  const url = source.sampleDataUrl ?? source.remoteUrl
  if (!url) return null

  if (source.sampleDataUrl) {
    const arrayBuffer = dataUrlToArrayBuffer(source.sampleDataUrl)
    return Tone.getContext().rawContext.decodeAudioData(arrayBuffer.slice(0))
  }

  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  return Tone.getContext().rawContext.decodeAudioData(arrayBuffer)
}

class StudioEngine {
  private master: Tone.Gain | null = null
  private channels = new Map<string, ChannelRuntime>()
  private project: StudioProject | null = null
  private step = 0
  private bar = 0
  private tick = 0
  private callback: ((step: number, bar: number) => void) | null = null
  private initialized = false
  private previewPlayer: Tone.Player | null = null

  async initialize(): Promise<void> {
    if (this.initialized) return
    await Tone.start()
    this.master = new Tone.Gain(0.9).toDestination()
    this.initialized = true
  }

  setStepCallback(callback: (step: number, bar: number) => void): void {
    this.callback = callback
  }

  private createRuntime(): ChannelRuntime {
    const input = new Tone.Gain()
    const filter = new Tone.Filter({ type: 'lowpass', frequency: 22000, Q: 0.7 })
    const delay = new Tone.FeedbackDelay({ delayTime: 0.2, feedback: 0.25, wet: 0 })
    const reverb = new Tone.Reverb({ decay: 2.2, wet: 0 })
    const panner = new Tone.Panner(0)
    const volume = new Tone.Volume(0)

    input.chain(filter, delay, reverb, panner, volume, this.master!)

    return {
      sourceKey: '',
      buffer: null,
      input,
      filter,
      delay,
      reverb,
      panner,
      volume,
    }
  }

  async syncProject(project: StudioProject): Promise<void> {
    await this.initialize()
    this.project = project

    const activeIds = new Set(project.channels.map((channel) => channel.id))
    for (const [channelId, runtime] of this.channels.entries()) {
      if (!activeIds.has(channelId)) {
        runtime.input.dispose()
        runtime.filter.dispose()
        runtime.delay.dispose()
        runtime.reverb.dispose()
        runtime.panner.dispose()
        runtime.volume.dispose()
        this.channels.delete(channelId)
      }
    }

    for (const channel of project.channels) {
      let runtime = this.channels.get(channel.id)
      if (!runtime) {
        runtime = this.createRuntime()
        this.channels.set(channel.id, runtime)
      }

      const nextSourceKey = getSourceKey(channel.source)
      if (runtime.sourceKey !== nextSourceKey) {
        runtime.buffer = await decodeSource(channel.source)
        runtime.sourceKey = nextSourceKey
      }

      runtime.filter.frequency.value = channel.fx.filter.enabled ? channel.fx.filter.frequency : 22000
      runtime.filter.Q.value = channel.fx.filter.resonance
      runtime.delay.delayTime.value = channel.fx.delay.time
      runtime.delay.feedback.value = channel.fx.delay.feedback
      runtime.delay.wet.value = channel.fx.delay.enabled ? channel.fx.delay.wet : 0
      runtime.reverb.decay = channel.fx.reverb.decay
      runtime.reverb.wet.value = channel.fx.reverb.enabled ? channel.fx.reverb.wet : 0
      runtime.panner.pan.value = channel.pan
      runtime.volume.volume.value = channel.volume
      runtime.volume.mute = channel.mute
    }
  }

  async previewSource(source: ChannelSource): Promise<void> {
    await this.initialize()
    const buffer = await decodeSource(source)
    if (!buffer) return

    this.previewPlayer?.dispose()
    this.previewPlayer = new Tone.Player(buffer).toDestination()
    this.previewPlayer.volume.value = -4
    this.previewPlayer.start()
    this.previewPlayer.onstop = () => {
      this.previewPlayer?.dispose()
      this.previewPlayer = null
    }
  }

  async play(): Promise<void> {
    if (!this.project) return
    await this.initialize()
    await this.syncProject(this.project)

    this.stop()
    this.tick = 0
    Tone.getTransport().bpm.value = this.project.bpm
    Tone.getTransport().scheduleRepeat((time) => {
      if (!this.project) return
      const totalSteps = this.project.bars * this.project.patternLength
      const songTick = this.tick % totalSteps
      this.bar = Math.floor(songTick / this.project.patternLength)
      this.step = songTick % this.project.patternLength
      this.callback?.(this.step, this.bar)
      this.triggerTick(time, this.bar, this.step)
      this.tick += 1
    }, '16n')
    Tone.getTransport().start()
  }

  private triggerTick(time: number, barIndex: number, stepIndex: number): void {
    if (!this.project) return
    const soloed = this.project.channels.filter((channel) => channel.solo).map((channel) => channel.id)
    const hasSolo = soloed.length > 0

    for (const channel of this.project.channels) {
      if (channel.mute) continue
      if (hasSolo && !channel.solo) continue
      if (!resolveChannelStepAtSongPosition(this.project, channel.id, barIndex, stepIndex)) continue

      const runtime = this.channels.get(channel.id)
      if (!runtime?.buffer) continue

      const player = new Tone.Player(runtime.buffer)
      player.connect(runtime.input)
      player.start(time)
      player.onstop = () => player.dispose()
    }
  }

  stop(): void {
    Tone.getTransport().stop()
    Tone.getTransport().cancel()
    this.tick = 0
    this.step = 0
    this.bar = 0
    this.callback?.(0, 0)
  }

  async exportWav(): Promise<Blob | null> {
    if (!this.project) return null
    return renderProjectToWav(this.project)
  }

  dispose(): void {
    this.stop()
    this.previewPlayer?.dispose()
    this.previewPlayer = null
    for (const runtime of this.channels.values()) {
      runtime.input.dispose()
      runtime.filter.dispose()
      runtime.delay.dispose()
      runtime.reverb.dispose()
      runtime.panner.dispose()
      runtime.volume.dispose()
    }
    this.channels.clear()
    this.master?.dispose()
    this.master = null
    this.initialized = false
  }
}

export const studioEngine = new StudioEngine()
