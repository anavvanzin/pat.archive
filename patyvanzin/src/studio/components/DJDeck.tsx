import React, { useEffect, useRef, useState } from 'react'
import { useDJStore } from '../../store/useDJStore'
import type { DJTrack } from '../../store/useDJStore'
import { djEngine } from '../djEngine'

interface DJDeckProps {
  deck: 'A' | 'B'
}

export function DJDeck({ deck }: DJDeckProps) {
  const deckState = useDJStore((s) => (deck === 'A' ? s.deckA : s.deckB))
  const otherDeckState = useDJStore((s) => (deck === 'A' ? s.deckB : s.deckA))
  const { setPlaying, setPlaybackRate, setCurrentTime, setCuePoint, setLoopActive, setLoopLength, syncBpm } = useDJStore()

  const [currentTime, setLocalCurrentTime] = useState(0)
  const [waveformPeaks, setWaveformPeaks] = useState<number[]>([])
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null)
  const isCueActive = useRef(false)

  // Registrar callback para atualização em tempo real de progresso do motor de áudio
  useEffect(() => {
    const unsubscribe = djEngine.registerProgressCallback(deck, (time) => {
      setLocalCurrentTime(time)
      setCurrentTime(deck, time)
    })
    return () => unsubscribe()
  }, [deck, setCurrentTime])

  // Gerar picos para a waveform quando a track mudar
  useEffect(() => {
    const track = deckState.track
    if (!track) {
      setWaveformPeaks([])
      return
    }

    // Se for local, podemos tentar simular ou gerar uma waveform procedimental baseada no nome
    // para evitar ler buffers gigantescos se não carregados na memória.
    // Para tracks de demo ou locais carregados no Tone.Player,
    // podemos gerar uma bela waveform pseudo-aleatória consistente baseada no ID/nome
    const peaks: number[] = []
    const seed = track.id.charCodeAt(0) || 42
    const length = 200

    for (let i = 0; i < length; i++) {
      // Combinação de senoides para parecer uma estrutura real de música
      const val1 = Math.sin((i / 5) * (seed % 10 + 1)) * 0.4
      const val2 = Math.cos((i / 20) * (seed % 7 + 1)) * 0.3
      const noise = Math.sin((i / 2) * 20) * 0.1
      const breakSection = i > 70 && i < 110 ? 0.3 : 1.0 // simula um "break" no meio da track
      
      const peak = Math.max(0.05, Math.abs(val1 + val2 + noise) * breakSection)
      peaks.push(peak)
    }
    setWaveformPeaks(peaks)
  }, [deckState.track])

  // Desenhar a Waveform rolante no Canvas
  useEffect(() => {
    const canvas = waveformCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    if (waveformPeaks.length === 0 || !deckState.track) {
      ctx.fillStyle = '#6d618c'
      ctx.font = '8px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('NENHUMA FAIXA CARREGADA', canvas.width / 2, canvas.height / 2 + 3)
      return
    }

    const duration = deckState.track.duration || 60
    const progress = currentTime / duration
    const barWidth = 2
    const gap = 1
    const totalBars = waveformPeaks.length
    
    // O playhead está centralizado (x = largura / 2)
    const playheadX = canvas.width / 2
    
    // Desenhar a grade de batidas (Beatgrid) baseada no BPM
    const bpm = deckState.tempBpm || 120
    const secPerBeat = 60 / bpm
    const totalBeats = Math.ceil(duration / secPerBeat)

    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 1

    for (let b = 0; b < totalBeats; b++) {
      const beatTime = b * secPerBeat
      // Posição no canvas relativa ao tempo atual
      const relativeX = playheadX + ((beatTime - currentTime) / 10) * 150 // Janela de 10s visível
      if (relativeX >= 0 && relativeX <= canvas.width) {
        ctx.beginPath()
        ctx.moveTo(relativeX, 0)
        ctx.lineTo(relativeX, canvas.height)
        ctx.stroke()
      }
    }

    // Desenhar picos da waveform
    waveformPeaks.forEach((peak, index) => {
      // Mapear posição da barra relativa ao progresso atual
      const barProgress = index / totalBars
      const barTime = barProgress * duration
      
      // Janela visível de 10 segundos: tempo atual fica no meio
      // 1 segundo = 15 pixels de largura
      const relativeX = playheadX + ((barTime - currentTime) / 10) * canvas.width

      if (relativeX < -10 || relativeX > canvas.width + 10) return

      const height = peak * canvas.height * 0.95
      const y = (canvas.height - height) / 2

      // As barras que já tocaram ficam com cor esmaecida
      const played = barTime < currentTime
      ctx.fillStyle = played 
        ? 'var(--pu2)' 
        : deck === 'A' ? '#ff6eb4' : '#1db954' // rosa para A, verde para B

      ctx.fillRect(relativeX, y, barWidth, height)
    })

    // Desenhar linha de reprodução no centro (Playhead)
    ctx.strokeStyle = '#ffe066' // amarelo brilhante
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(playheadX, 0)
    ctx.lineTo(playheadX, canvas.height)
    ctx.stroke()
  }, [waveformPeaks, currentTime, deckState.track, deckState.tempBpm, deck])

  const handlePlayToggle = () => {
    if (!deckState.track) return
    const nextPlaying = !deckState.isPlaying
    setPlaying(deck, nextPlaying)
    if (nextPlaying) {
      djEngine.play(deck)
    } else {
      djEngine.pause(deck)
    }
  }

  // Comportamento do botão CUE (estilo Pioneer CDJ)
  const handleCueDown = () => {
    if (!deckState.track) return
    
    if (deckState.isPlaying) {
      // Se estiver tocando: para a música e pula para o ponto do cue
      setPlaying(deck, false)
      djEngine.pause(deck)
      const targetTime = deckState.cuePoint || 0
      djEngine.seek(deck, targetTime)
      setLocalCurrentTime(targetTime)
    } else {
      // Se estiver pausado: define um novo ponto de cue ou toca enquanto segura
      if (deckState.cuePoint === null) {
        setCuePoint(deck, currentTime)
      }
      // Inicia reprodução provisória
      isCueActive.current = true
      djEngine.play(deck)
    }
  }

  const handleCueUp = () => {
    if (isCueActive.current) {
      isCueActive.current = false
      // Para e volta ao cue point
      djEngine.pause(deck)
      const targetTime = deckState.cuePoint || 0
      djEngine.seek(deck, targetTime)
      setLocalCurrentTime(targetTime)
    }
  }

  const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rate = parseFloat(e.target.value)
    setPlaybackRate(deck, rate)
    djEngine.setPlaybackRate(deck, rate)
  }

  const handleBpmSync = () => {
    if (!deckState.track || !otherDeckState.track) return
    syncBpm(deck === 'A' ? 'B' : 'A', deck)
    // Sincronizar o playbackRate no motor
    const targetBpm = otherDeckState.tempBpm
    const originalBpm = deckState.track.bpm || 120
    const rate = targetBpm / originalBpm
    djEngine.setPlaybackRate(deck, rate)
  }

  const handleLoopToggle = (length: number) => {
    if (!deckState.track) return
    const nextActive = !deckState.loopActive
    setLoopActive(deck, nextActive)
    setLoopLength(deck, length)
    djEngine.setLoop(deck, nextActive, length, deckState.tempBpm)
  }

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    const ms = Math.floor((time % 1) * 100)
    return `${mins}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`
  }

  // Ângulo de rotação do vinil baseado no tempo atual da faixa
  const rotationAngle = (currentTime * 120) % 360

  return (
    <div className={`dj-deck panel-card deck-${deck.toLowerCase()}`}>
      {/* HEADER DO DECK */}
      <div className="deck-header">
        <div className="deck-indicator">DECK {deck}</div>
        <div className="deck-track-info">
          {deckState.track ? (
            <>
              <h4 className="track-title">{deckState.track.name}</h4>
              <span className="track-artist">{deckState.track.artist || 'Desconhecido'}</span>
            </>
          ) : (
            <h4 className="track-title">[ Carregue uma faixa ]</h4>
          )}
        </div>
      </div>

      {/* WAVEFORM VIEWER */}
      <div className="waveform-container" style={{ margin: '8px 0', border: '1px solid #1a1528', borderRadius: '4px', overflow: 'hidden' }}>
        <canvas ref={waveformCanvasRef} width={280} height={42} style={{ display: 'block', background: '#080510' }} />
      </div>

      <div className="deck-controls-grid">
        {/* LADO ESQUERDO: DISCO & TEMPO */}
        <div className="deck-left-panel">
          {/* JOG WHEEL (VINIL) */}
          <div className="jog-wheel-container">
            <div 
              className="jog-wheel"
              style={{
                transform: `rotate(${rotationAngle}deg)`,
                transition: deckState.isPlaying ? 'none' : 'transform 0.1s ease-out'
              }}
            >
              <div className="vinyl-groove-1" />
              <div className="vinyl-groove-2" />
              <div className="vinyl-label" style={{ backgroundColor: deck === 'A' ? 'var(--pk)' : 'var(--pu)' }}>
                <div className="vinyl-center-hole" />
              </div>
            </div>
          </div>

          {/* TIME DISPLAY */}
          <div className="time-display-box">
            <div className="time-value">{formatTime(currentTime)}</div>
            <div className="bpm-value">
              {deckState.tempBpm.toFixed(1)} <span className="bpm-label">BPM</span>
              {deckState.track && deckState.track.bpm !== deckState.tempBpm && (
                <span className="bpm-offset" style={{ color: deckState.tempBpm > deckState.track.bpm ? 'var(--pk)' : 'var(--pu)' }}>
                  {deckState.tempBpm > deckState.track.bpm ? ' +' : ' '}
                  {(((deckState.tempBpm - deckState.track.bpm) / deckState.track.bpm) * 100).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* LADO DIREITO: PITCH FADER & ACTIONS */}
        <div className="deck-right-panel">
          <div className="pitch-slider-container">
            <span className="pitch-limit">+10%</span>
            <input
              type="range"
              min="0.9"
              max="1.1"
              step="0.001"
              value={deckState.playbackRate}
              onChange={handlePitchChange}
              className="dj-pitch-slider"
              disabled={!deckState.track}
            />
            <span className="pitch-limit">-10%</span>
          </div>

          <div className="deck-buttons-group">
            {/* SYNC */}
            <button 
              className="dj-btn-sync" 
              onClick={handleBpmSync} 
              disabled={!deckState.track || !otherDeckState.track}
              style={{
                borderColor: deckState.tempBpm === otherDeckState.tempBpm && deckState.track ? 'var(--yl)' : 'var(--pu)'
              }}
            >
              SYNC
            </button>

            {/* LOOP SECTION */}
            <div className="deck-loop-box">
              <span className="loop-title">AUTO LOOP</span>
              <div className="loop-grid">
                {[2, 4, 8, 16].map((len) => (
                  <button
                    key={len}
                    onClick={() => handleLoopToggle(len)}
                    disabled={!deckState.track}
                    className={`dj-btn-loop ${deckState.loopActive && deckState.loopLength === len ? 'active' : ''}`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>

            {/* PLAY & CUE */}
            <div className="cue-play-row">
              <button
                className={`dj-btn-hardware cue-btn ${deckState.cuePoint !== null ? 'has-cue' : ''}`}
                onMouseDown={handleCueDown}
                onMouseUp={handleCueUp}
                onMouseLeave={handleCueUp}
                disabled={!deckState.track}
              >
                CUE
              </button>
              <button
                className={`dj-btn-hardware play-btn ${deckState.isPlaying ? 'playing' : ''}`}
                onClick={handlePlayToggle}
                disabled={!deckState.track}
              >
                {deckState.isPlaying ? '▮▮' : '▶'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
