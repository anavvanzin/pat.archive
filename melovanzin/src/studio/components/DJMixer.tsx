import React, { useEffect, useRef } from 'react'
import { useDJStore } from '../../store/useDJStore'
import { djEngine } from '../djEngine'

interface VUMeterProps {
  deck: 'A' | 'B' | 'master'
}

function VUMeter({ deck }: VUMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    const renderMeter = () => {
      let data: Float32Array
      if (deck === 'master') {
        data = djEngine.getMasterWaveformData()
      } else {
        data = djEngine.getWaveformData(deck)
      }

      // Calcular o pico de volume (RMS ou valor absoluto máximo)
      let maxVal = 0
      if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          const val = Math.abs(data[i])
          if (val > maxVal) maxVal = val
        }
      }

      // Limpar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Desenhar leds retro (verde -> amarelo -> vermelho)
      const numLeds = 12
      const ledHeight = 5
      const spacing = 2
      const activeLeds = Math.round(maxVal * numLeds * 1.5) // Amplificar para visualização dinâmica

      for (let i = 0; i < numLeds; i++) {
        // Inverter índice para desenhar de baixo para cima
        const ledIndex = numLeds - 1 - i
        const y = i * (ledHeight + spacing)

        let color = '#1db954' // verde
        if (ledIndex >= 8 && ledIndex < 10) color = '#ffe066' // amarelo
        if (ledIndex >= 10) color = '#ff6eb4' // vermelho (neon pink)

        // Se o led estiver ativo, usa cor brilhante, senão escurecida
        const isActive = ledIndex < activeLeds
        ctx.fillStyle = isActive ? color : 'rgba(255, 255, 255, 0.05)'
        
        // Efeito de glow para leds ativos
        if (isActive) {
          ctx.shadowBlur = 4
          ctx.shadowColor = color
        } else {
          ctx.shadowBlur = 0
        }

        ctx.fillRect(0, y, canvas.width, ledHeight)
      }

      animationFrameId = requestAnimationFrame(renderMeter)
    }

    renderMeter()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [deck])

  return (
    <div className="vu-meter-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <canvas ref={canvasRef} width={12} height={82} style={{ background: '#0e0b16', borderRadius: '2px', border: '1px solid #1a1528' }} />
      <span className="vu-label" style={{ fontSize: '7px', marginTop: '4px', color: '#6d618c' }}>
        {deck === 'master' ? 'MST' : deck}
      </span>
    </div>
  )
}

export function DJMixer() {
  const { deckA, deckB, crossfader, setVolume, setEQ, setFilter, setCrossfader } = useDJStore()

  const handleVolumeChange = (deck: 'A' | 'B', val: number) => {
    setVolume(deck, val)
    djEngine.setVolume(deck, val)
  }

  const handleEQChange = (deck: 'A' | 'B', band: 'high' | 'mid' | 'low', val: number) => {
    setEQ(deck, band, val)
    djEngine.setEQ(deck, band, val)
  }

  const handleFilterChange = (deck: 'A' | 'B', val: number) => {
    setFilter(deck, val)
    djEngine.setFilter(deck, val)
  }

  const handleCrossfaderChange = (val: number) => {
    setCrossfader(val)
    djEngine.setCrossfader(val)
  }

  return (
    <section className="dj-mixer panel-card">
      <div className="panel-heading">
        <h3>Central Mixer</h3>
        <p>Equalize frequências, aplique filtros de corte e faça a transição.</p>
      </div>

      <div className="mixer-layout">
        {/* DECK A CHANNEL */}
        <div className="mixer-channel">
          <div className="mixer-knob-group">
            <div className="knob-label">FILTER</div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={deckA.filterFreq}
              onChange={(e) => handleFilterChange('A', parseFloat(e.target.value))}
              className="dj-knob-slider filter-knob"
            />
            <div className="knob-value">{deckA.filterFreq === 0 ? 'OFF' : deckA.filterFreq > 0 ? 'HPF' : 'LPF'}</div>
          </div>

          <div className="mixer-eq-group">
            <div className="eq-slider-wrapper">
              <span className="eq-label">HI</span>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={deckA.eqHigh}
                onChange={(e) => handleEQChange('A', 'high', parseFloat(e.target.value))}
                className="dj-eq-slider"
              />
              <span className="eq-val">{deckA.eqHigh > 0 ? `+${deckA.eqHigh}` : deckA.eqHigh} dB</span>
            </div>

            <div className="eq-slider-wrapper">
              <span className="eq-label">MID</span>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={deckA.eqMid}
                onChange={(e) => handleEQChange('A', 'mid', parseFloat(e.target.value))}
                className="dj-eq-slider"
              />
              <span className="eq-val">{deckA.eqMid > 0 ? `+${deckA.eqMid}` : deckA.eqMid} dB</span>
            </div>

            <div className="eq-slider-wrapper">
              <span className="eq-label">LOW</span>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={deckA.eqLow}
                onChange={(e) => handleEQChange('A', 'low', parseFloat(e.target.value))}
                className="dj-eq-slider"
              />
              <span className="eq-val">{deckA.eqLow > 0 ? `+${deckA.eqLow}` : deckA.eqLow} dB</span>
            </div>
          </div>

          <div className="fader-row">
            <VUMeter deck="A" />
            <div className="volume-fader-wrapper">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={deckA.volume}
                onChange={(e) => handleVolumeChange('A', parseFloat(e.target.value))}
                className="dj-volume-fader"
                style={{ transform: 'rotate(-90deg)' }}
              />
            </div>
          </div>
        </div>

        {/* MASTER VU METERS IN CENTER */}
        <div className="mixer-center-strip">
          <div className="master-vu-group">
            <VUMeter deck="master" />
          </div>
          <div style={{ fontSize: '8px', color: '#6d618c', textShadow: '0 0 4px var(--pu)' }}>
            MST GAIN
          </div>
          <input
            type="range"
            min="0"
            max="1.2"
            step="0.05"
            defaultValue="1"
            className="dj-knob-slider master-knob"
            style={{ width: '40px', height: '40px' }}
          />
        </div>

        {/* DECK B CHANNEL */}
        <div className="mixer-channel">
          <div className="mixer-knob-group">
            <div className="knob-label">FILTER</div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={deckB.filterFreq}
              onChange={(e) => handleFilterChange('B', parseFloat(e.target.value))}
              className="dj-knob-slider filter-knob"
            />
            <div className="knob-value">{deckB.filterFreq === 0 ? 'OFF' : deckB.filterFreq > 0 ? 'HPF' : 'LPF'}</div>
          </div>

          <div className="mixer-eq-group">
            <div className="eq-slider-wrapper">
              <span className="eq-label">HI</span>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={deckB.eqHigh}
                onChange={(e) => handleEQChange('B', 'high', parseFloat(e.target.value))}
                className="dj-eq-slider"
              />
              <span className="eq-val">{deckB.eqHigh > 0 ? `+${deckB.eqHigh}` : deckB.eqHigh} dB</span>
            </div>

            <div className="eq-slider-wrapper">
              <span className="eq-label">MID</span>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={deckB.eqMid}
                onChange={(e) => handleEQChange('B', 'mid', parseFloat(e.target.value))}
                className="dj-eq-slider"
              />
              <span className="eq-val">{deckB.eqMid > 0 ? `+${deckB.eqMid}` : deckB.eqMid} dB</span>
            </div>

            <div className="eq-slider-wrapper">
              <span className="eq-label">LOW</span>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.5"
                value={deckB.eqLow}
                onChange={(e) => handleEQChange('B', 'low', parseFloat(e.target.value))}
                className="dj-eq-slider"
              />
              <span className="eq-val">{deckB.eqLow > 0 ? `+${deckB.eqLow}` : deckB.eqLow} dB</span>
            </div>
          </div>

          <div className="fader-row">
            <VUMeter deck="B" />
            <div className="volume-fader-wrapper">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={deckB.volume}
                onChange={(e) => handleVolumeChange('B', parseFloat(e.target.value))}
                className="dj-volume-fader"
                style={{ transform: 'rotate(-90deg)' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CROSSFADER SECTION */}
      <div className="crossfader-section">
        <span className="cf-side-label">A</span>
        <input
          type="range"
          min="-1"
          max="1"
          step="0.02"
          value={crossfader}
          onChange={(e) => handleCrossfaderChange(parseFloat(e.target.value))}
          className="dj-crossfader"
        />
        <span className="cf-side-label">B</span>
      </div>
    </section>
  )
}
