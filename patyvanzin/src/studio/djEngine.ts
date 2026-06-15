import * as Tone from 'tone'
import type { DJTrack } from '../store/useDJStore'

interface DeckRuntime {
  player: Tone.Player | null
  eq: Tone.EQ3
  filter: Tone.Filter
  gain: Tone.Volume
  analyser: Tone.Analyser
  duration: number
  loopStart: number
  loopEnd: number
}

class DJEngine {
  private initialized = false
  private masterGain: Tone.Gain | null = null
  private crossfader: Tone.CrossFade | null = null
  private decks: Record<'A' | 'B', DeckRuntime | null> = { A: null, B: null }
  private masterAnalyser: Tone.Analyser | null = null
  private currentProgressCallbacks: Record<'A' | 'B', ((time: number) => void)[]> = { A: [], B: [] }
  private progressInterval: any = null

  async initialize(): Promise<void> {
    if (this.initialized) return
    await Tone.start()

    this.masterGain = new Tone.Gain(0.95).toDestination()
    this.crossfader = new Tone.CrossFade(0.5)
    this.masterAnalyser = new Tone.Analyser('waveform', 256)

    // Conectar crossfader ao master e ao analisador master
    this.crossfader.connect(this.masterGain)
    this.crossfader.connect(this.masterAnalyser)

    this.decks.A = this.createDeckRuntime('A')
    this.decks.B = this.createDeckRuntime('B')

    this.startProgressTracker()
    this.initialized = true
  }

  private createDeckRuntime(deck: 'A' | 'B'): DeckRuntime {
    const eq = new Tone.EQ3({
      high: 0,
      mid: 0,
      low: 0,
    })

    const filter = new Tone.Filter({
      type: 'lowpass',
      frequency: 20000,
      Q: 1,
    })

    const gain = new Tone.Volume(0) // 0 dB inicial
    const analyser = new Tone.Analyser('waveform', 256)

    // Conectar nós de efeito: Player -> EQ -> Filter -> Volume/Gain -> Analyser -> Crossfader
    eq.chain(filter, gain, analyser)
    
    // Conectar saída ao crossfader correspondente
    if (deck === 'A') {
      analyser.connect(this.crossfader!.a)
    } else {
      analyser.connect(this.crossfader!.b)
    }

    return {
      player: null,
      eq,
      filter,
      gain,
      analyser,
      duration: 0,
      loopStart: 0,
      loopEnd: 0,
    }
  }

  async loadTrack(deck: 'A' | 'B', track: DJTrack): Promise<number> {
    await this.initialize()
    const runtime = this.decks[deck]
    if (!runtime) throw new Error('Deck runtime não inicializado')

    if (runtime.player) {
      runtime.player.stop()
      runtime.player.dispose()
    }

    // Baixar ou ler dados de áudio
    const buffer = await Tone.Buffer.fromUrl(track.url)
    
    const player = new Tone.Player(buffer)
    player.connect(runtime.eq)
    runtime.player = player
    runtime.duration = buffer.duration

    // Reset loop boundaries
    runtime.loopStart = 0
    runtime.loopEnd = buffer.duration

    return buffer.duration
  }

  play(deck: 'A' | 'B'): void {
    const runtime = this.decks[deck]
    if (runtime?.player && runtime.player.loaded) {
      if (runtime.player.state !== 'started') {
        const offset = runtime.player.now()
        // Se estiver em loop
        if (runtime.player.loop) {
          runtime.player.start(0, runtime.player.loopStart)
        } else {
          // Iniciar do ponto atual (salvo no player ou track)
          runtime.player.start()
        }
      }
    }
  }

  pause(deck: 'A' | 'B'): void {
    const runtime = this.decks[deck]
    if (runtime?.player) {
      runtime.player.stop()
    }
  }

  seek(deck: 'A' | 'B', seconds: number): void {
    const runtime = this.decks[deck]
    if (runtime?.player && runtime.player.loaded) {
      const isPlaying = runtime.player.state === 'started'
      runtime.player.stop()
      // Tone.Player start aceita um offset em segundos como segundo argumento
      if (isPlaying) {
        runtime.player.start(0, Math.max(0, Math.min(seconds, runtime.duration)))
      } else {
        // Apenas atualiza a posição interna alterando o buffer offset se possível,
        // mas para players simples, o start define a posição.
        // Vamos guardar o tempo atual e usar no próximo play.
      }
    }
  }

  setPlaybackRate(deck: 'A' | 'B', rate: number): void {
    const runtime = this.decks[deck]
    if (runtime?.player) {
      runtime.player.playbackRate = rate
    }
  }

  setVolume(deck: 'A' | 'B', volume: number): void {
    const runtime = this.decks[deck]
    if (runtime) {
      // Mapear volume 0-1 para decibéis (-60 a 0 dB)
      const db = volume === 0 ? -Infinity : Tone.gainToDb(volume)
      runtime.gain.volume.value = db
    }
  }

  setEQ(deck: 'A' | 'B', band: 'high' | 'mid' | 'low', val: number): void {
    const runtime = this.decks[deck]
    if (runtime) {
      // Mapear valor -12 a 12 dB diretamente
      runtime.eq[band].value = val
    }
  }

  setFilter(deck: 'A' | 'B', val: number): void {
    const runtime = this.decks[deck]
    if (runtime) {
      if (val === 0) {
        // Desativado
        runtime.filter.type = 'lowpass'
        runtime.filter.frequency.value = 20000
      } else if (val < 0) {
        // Lowpass sweep (-1 a 0) -> mapear para 100Hz a 20000Hz
        runtime.filter.type = 'lowpass'
        const freq = 100 + Math.pow(val + 1, 3) * (20000 - 100)
        runtime.filter.frequency.value = freq
      } else {
        // Highpass sweep (0 a 1) -> mapear para 20Hz a 8000Hz
        runtime.filter.type = 'highpass'
        const freq = 20 + Math.pow(val, 3) * (8000 - 20)
        runtime.filter.frequency.value = freq
      }
    }
  }

  setCrossfader(val: number): void {
    if (this.crossfader) {
      // Mapear -1 (Deck A) a 1 (Deck B) para 0 (A) a 1 (B)
      const mapped = (val + 1) / 2
      this.crossfader.fade.value = mapped
    }
  }

  setLoop(deck: 'A' | 'B', active: boolean, beatLength?: number, bpm = 120): void {
    const runtime = this.decks[deck]
    if (runtime?.player && runtime.player.loaded) {
      runtime.player.loop = active
      if (active && beatLength) {
        // Calcular o tamanho do loop em segundos com base no BPM
        const beatDuration = 60 / bpm
        const loopSeconds = beatLength * beatDuration
        const currentPos = this.getCurrentTime(deck)

        runtime.player.loopStart = currentPos
        runtime.player.loopEnd = currentPos + loopSeconds
      } else {
        runtime.player.loopStart = 0
        runtime.player.loopEnd = runtime.duration
      }
    }
  }

  getCurrentTime(deck: 'A' | 'B'): number {
    const runtime = this.decks[deck]
    if (runtime?.player && runtime.player.loaded) {
      // Se estiver tocando, podemos estimar a posição atual do player
      // NOTA: Tone.Player não tem um helper direto para tempo atual, então rastreamos via progresso
      return (runtime.player as any)._synced ? 0 : (runtime.player as any)._state?.progress || 0
    }
    return 0
  }

  getWaveformData(deck: 'A' | 'B'): Float32Array {
    const runtime = this.decks[deck]
    if (runtime) {
      return runtime.analyser.getValue() as Float32Array
    }
    return new Float32Array(0)
  }

  getMasterWaveformData(): Float32Array {
    if (this.masterAnalyser) {
      return this.masterAnalyser.getValue() as Float32Array
    }
    return new Float32Array(0)
  }

  registerProgressCallback(deck: 'A' | 'B', cb: (time: number) => void): () => void {
    this.currentProgressCallbacks[deck].push(cb)
    return () => {
      this.currentProgressCallbacks[deck] = this.currentProgressCallbacks[deck].filter((c) => c !== cb)
    }
  }

  private startProgressTracker(): void {
    if (this.progressInterval) clearInterval(this.progressInterval)

    this.progressInterval = setInterval(() => {
      ;(['A', 'B'] as const).forEach((deck) => {
        const runtime = this.decks[deck]
        if (runtime?.player && runtime.player.state === 'started') {
          // O Tone.Player não expõe facilmente o tempo atual após o início.
          // Um workaround para estúdio/DJ é rastrear o tempo decorrido usando performance.now ou AudioContext.currentTime.
          // Vamos fazer uma estimativa usando o progresso de Tone.Player:
          // A propriedade internal _state rastreia a posição se o player estiver tocando.
          const state = (runtime.player as any)._state
          if (state && state.ticks) {
            // Se o player estiver ativo, podemos consultar o tempo de áudio
          }
          
          // Como Tone.Player roda nativamente, vamos obter a posição aproximada do playhead:
          const elapsed = Tone.now() - (runtime.player as any)._state.time
          const position = (runtime.player as any)._state.offset + elapsed * runtime.player.playbackRate
          
          // Se tiver em loop e passar do loopEnd
          let currentPos = position
          const loopStart = Tone.Time(runtime.player.loopStart).toSeconds()
          const loopEnd = Tone.Time(runtime.player.loopEnd).toSeconds()

          if (runtime.player.loop && currentPos >= loopEnd) {
            const loopDuration = loopEnd - loopStart
            if (loopDuration > 0) {
              currentPos = loopStart + ((currentPos - loopStart) % loopDuration)
            }
          }

          // Chamar callbacks
          const time = Math.min(runtime.duration, Math.max(0, currentPos))
          this.currentProgressCallbacks[deck].forEach((cb) => cb(time))
        }
      })
    }, 100)
  }

  dispose(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval)
      this.progressInterval = null
    }

    ;(['A', 'B'] as const).forEach((deck) => {
      const runtime = this.decks[deck]
      if (runtime) {
        runtime.player?.dispose()
        runtime.eq.dispose()
        runtime.filter.dispose()
        runtime.gain.dispose()
        runtime.analyser.dispose()
      }
      this.decks[deck] = null
    })

    this.masterGain?.dispose()
    this.masterGain = null
    this.crossfader?.dispose()
    this.crossfader = null
    this.masterAnalyser?.dispose()
    this.masterAnalyser = null
    this.initialized = false
  }
}

export const djEngine = new DJEngine()
