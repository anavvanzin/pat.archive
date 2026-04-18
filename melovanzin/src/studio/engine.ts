// ============================================================
// STUDIO ENGINE - Tone.js audio engine para o FruitLoops Studio
// ============================================================

import * as Tone from 'tone'
import type {
  StudioChannel,
  StudioProject,
  ChannelFxState,
} from './types'
import { resolveChannelStepsAtSongStep } from './project'

// --- Estado interno ---
interface ChannelState {
  player: Tone.Player | null
  volume: Tone.Volume | null
  pan: Tone.Panner | null
  filter: Tone.Filter | null
  delay: Tone.FeedbackDelay | null
  reverb: Tone.Reverb | null
  chain: Tone.Channel | null
}

class StudioEngine {
  private channels: Map<string, ChannelState> = new Map()
  private masterVolume: Tone.Volume | null = null
  private sequence: Tone.Sequence | null = null
  private isInitialized = false
  private currentStep = 0
  private currentBar = 0

  // Callbacks
  private onStepCallback: ((step: number, bar: number) => void) | null = null

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    await Tone.start()
    this.masterVolume = new Tone.Volume(-6).toDestination()
    this.isInitialized = true
    console.log('[StudioEngine] Initialized')
  }

  setStepCallback(callback: (step: number, bar: number) => void): void {
    this.onStepCallback = callback
  }

  // --- Gestão de Canais ---

  async loadChannel(channel: StudioChannel): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    // Cleanup existing
    this.unloadChannel(channel.id)

    if (!channel.source?.sampleDataUrl) {
      console.warn(`[StudioEngine] No sample for channel ${channel.name}`)
      return
    }

    try {
      const player = new Tone.Player({
        url: channel.source.sampleDataUrl,
        loop: false,
        onload: () => console.log(`[StudioEngine] Loaded: ${channel.name}`),
        onerror: (err: Error) => console.error(`[StudioEngine] Error loading ${channel.name}:`, err),
      }).connect(this.masterVolume!)

      // FX Chain (nodes, não precisam de .start())
      const filter = new Tone.Filter({
        frequency: channel.fx.filter.frequency,
        Q: channel.fx.filter.resonance,
        type: 'lowpass',
      })

      const delay = new Tone.FeedbackDelay({
        delayTime: channel.fx.delay.time,
        feedback: channel.fx.delay.feedback,
      })

      const reverb = new Tone.Reverb({
        decay: channel.fx.reverb.decay,
        wet: channel.fx.reverb.wet,
      })

      // Routing: player -> filter -> delay -> reverb -> volume -> pan -> master
      const volume = new Tone.Volume(channel.volume).connect(filter)
      const pan = new Tone.Panner(channel.pan).connect(reverb)

      // Connect FX based on enabled state
      if (channel.fx.filter.enabled) {
        player.connect(filter)
      } else {
        player.connect(volume)
      }

      if (channel.fx.delay.enabled) {
        delay.wet.value = channel.fx.delay.wet
        filter.connect(delay)
        delay.connect(reverb)
      }

      if (channel.fx.reverb.enabled) {
        reverb.wet.value = channel.fx.reverb.wet
      }

      this.channels.set(channel.id, {
        player,
        volume,
        pan,
        filter,
        delay,
        reverb,
        chain: null,
      })
    } catch (err) {
      console.error(`[StudioEngine] Failed to load channel ${channel.name}:`, err)
    }
  }

  unloadChannel(channelId: string): void {
    const state = this.channels.get(channelId)
    if (state) {
      state.player?.dispose()
      state.volume?.dispose()
      state.pan?.dispose()
      state.filter?.dispose()
      state.delay?.dispose()
      state.reverb?.dispose()
      state.chain?.dispose()
      this.channels.delete(channelId)
    }
  }

  // --- Mixer Controls ---

  setChannelVolume(channelId: string, volume: number): void {
    const state = this.channels.get(channelId)
    if (state?.volume) {
      state.volume.volume.value = volume
    }
  }

  setChannelPan(channelId: string, pan: number): void {
    const state = this.channels.get(channelId)
    if (state?.pan) {
      state.pan.pan.value = pan
    }
  }

  setChannelMute(channelId: string, mute: boolean): void {
    const state = this.channels.get(channelId)
    if (state?.volume) {
      state.volume.mute = mute
    }
  }

  setChannelSolo(channelIds: string[]): void {
    // If any channel is solo'd, only those play
    const allIds = Array.from(this.channels.keys())
    for (const id of allIds) {
      const state = this.channels.get(id)
      if (state?.volume) {
        const isSoloed = channelIds.includes(id)
        // If any solo exists, mute non-soloed
        if (channelIds.length > 0 && !isSoloed) {
          state.volume.mute = true
        } else if (channelIds.length === 0) {
          // No solos - unmute all
          state.volume.mute = false
        }
      }
    }
  }

  // --- FX Controls ---

  setChannelFx(channelId: string, fx: ChannelFxState): void {
    const state = this.channels.get(channelId)
    if (!state) return

    if (state.filter) {
      state.filter.frequency.value = fx.filter.frequency
      state.filter.Q.value = fx.filter.resonance
    }

    if (state.delay) {
      state.delay.wet.value = fx.delay.enabled ? fx.delay.wet : 0
      state.delay.feedback.value = fx.delay.feedback
    }

    if (state.reverb) {
      state.reverb.wet.value = fx.reverb.enabled ? fx.reverb.wet : 0
    }
  }

  // --- Playback ---

  async start(project: StudioProject): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    // Stop existing
    this.stop()

    const stepDuration = `=${Math.floor(project.patternLength / 4)}n`

    // Create sequence
    this.sequence = new Tone.Sequence(
      (_time, step) => {
        this.currentStep = step + 1

        if (this.currentStep >= project.patternLength) {
          this.currentStep = 0
          this.currentBar += 1
        }
        if (this.currentBar >= project.bars) {
          this.currentBar = 0
        }

        // Notify UI
        this.onStepCallback?.(this.currentStep, this.currentBar)

        // Trigger active channels
        this.triggerStep(project, step)
      },
      [...Array(project.patternLength).keys()],
      stepDuration
    )

    Tone.getTransport().bpm.value = project.bpm
    this.sequence.start(0)
    Tone.getTransport().start()

    console.log('[StudioEngine] Playback started')
  }

  private triggerStep(project: StudioProject, step: number): void {
    const hasSolo = project.channels.some(ch => ch.solo)

    for (const channel of project.channels) {
      const state = this.channels.get(channel.id)
      if (!state?.player) continue

      // Check mute/solo
      if (channel.mute) continue
      if (hasSolo && !channel.solo) continue

      // Check step
      const active = resolveChannelStepsAtSongStep(project, channel.id, step)
      if (active) {
        state.player.start()
      }
    }
  }

  stop(): void {
    if (this.sequence) {
      this.sequence.stop()
      this.sequence.dispose()
      this.sequence = null
    }
    Tone.getTransport().stop()
    this.currentStep = 0
    this.currentBar = 0
  }

  pause(): void {
    Tone.getTransport().pause()
  }

  setBpm(bpm: number): void {
    Tone.getTransport().bpm.value = bpm
  }

  // --- Estado ---

  getCurrentStep(): number {
    return this.currentStep
  }

  getCurrentBar(): number {
    return this.currentBar
  }

  isPlaying(): boolean {
    return Tone.getTransport().state === 'started'
  }

  // --- Cleanup ---

  dispose(): void {
    this.stop()
    for (const [id] of this.channels) {
      this.unloadChannel(id)
    }
    this.masterVolume?.dispose()
    this.masterVolume = null
    this.isInitialized = false
    console.log('[StudioEngine] Disposed')
  }
}

// Singleton
export const studioEngine = new StudioEngine()