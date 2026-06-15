import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import patriciaPortrait from '../assets/patricia_portrait.png'

// Símbolo minimalista/geométrico da Pantera em SVG
function PanteraSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M50 10 L80 30 L90 70 L50 90 L10 70 L20 30 Z" opacity="0.15" />
      {/* Orelhas */}
      <path d="M25 25 L35 15 L40 28 Z" />
      <path d="M75 25 L65 15 L60 28 Z" />
      {/* Olhos que brilham */}
      <polygon points="38,40 44,43 36,45" fill="var(--secondary)" />
      <polygon points="62,40 56,43 64,45" fill="var(--secondary)" />
      {/* Detalhes geométricos do focinho */}
      <path d="M50 45 L45 55 L55 55 Z" />
      <path d="M42 60 Q 50 65 58 60" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  )
}

export default function TitleScreen() {
  const setWorld = useStore((s) => s.setWorld)
  const setMode = useStore((s) => s.setMode)
  const audioEnabled = useStore((s) => s.audioEnabled)
  const setAudioEnabled = useStore((s) => s.setAudioEnabled)
  const [hoveredMode, setHoveredMode] = useState<'atelie' | 'pista' | null>(null)

  const playSubBeep = () => {
    if (!audioEnabled) return
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(65.4, ctx.currentTime) // som sub grave C2
      gain.gain.setValueAtTime(0.4, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.6)
    } catch (e) {
      console.error(e)
    }
  }

  const playChalkSound = () => {
    if (!audioEnabled) return
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const bufferSize = ctx.sampleRate * 0.2
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }
      const noise = ctx.createBufferSource()
      noise.buffer = buffer
      
      const filter = ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 1000
      filter.Q.value = 2

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)

      noise.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      noise.start()
    } catch (e) {
      console.error(e)
    }
  }

  const handleEnter = (mode: 'atelie' | 'pista') => {
    setMode(mode)
    setWorld('hub')
  }

  return (
    <div
      className={`screen paper-noise flex flex-col items-center justify-between min-h-screen p-8 transition-colors duration-1000 select-none ${
        hoveredMode === 'pista'
          ? 'bg-[#0d0d0d] text-[#fdfbf7]'
          : 'bg-[#fdfbf7] text-[#0d0d0d]'
      }`}
    >
      {/* Ativar Áudio no Topo */}
      <div className="w-full max-w-6xl flex justify-between items-center z-20 font-mono text-xs">
        <div>[ PATRÍCIA VANZIN — UNIVERSO ]</div>
        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className="border-2 border-current px-3 py-1 cursor-pointer font-bold btn-punk text-[10px]"
          style={{ padding: '4px 8px' }}
        >
          SOM: {audioEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Seção Principal Central */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full max-w-6xl flex-grow z-10">
        
        {/* Retrato Xilogravura com Pantera de Fundo */}
        <div className="relative w-64 h-80 md:w-80 md:h-[400px] border-4 border-current p-3 bg-current flex-shrink-0 group">
          {/* Pantera como espírito protetor atrás */}
          <PanteraPresence hoveredMode={hoveredMode} />
          
          {/* Retrato */}
          <div className="w-full h-full overflow-hidden border-2 border-background bg-[#fdfbf7]">
            <img
              src={patriciaPortrait}
              alt="Patrícia Vanzin"
              className={`w-full h-full object-cover transition-all duration-700 ${
                hoveredMode === 'pista'
                  ? 'grayscale contrast-200 invert'
                  : 'grayscale contrast-200'
              }`}
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>

          {/* Efeitos de Riscos de Tinta ou Flashes */}
          <AnimatePresence>
            {hoveredMode === 'atelie' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none texture-lines"
              />
            )}
            {hoveredMode === 'pista' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none texture-screen bg-[var(--vermelho)]"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Informações da Artista e Bifurcação */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-8 max-w-lg">
          <div className="space-y-3">
            <h1 className="font-title text-6xl md:text-8xl tracking-tighter leading-none select-text">
              PATRÍCIA
              <br />
              VANZIN
            </h1>
            <p className="font-mono text-sm tracking-widest text-[#d49b00] font-bold">
              DJ · ARTISTA VISUAL · CRIADORA
            </p>
          </div>

          {/* Linha Divisória de Cartaz */}
          <div className="w-24 h-1 bg-current" />

          {/* Dois Caminhos Grandes */}
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {/* ENTRAR NO ATELIÊ */}
            <button
              onMouseEnter={() => {
                setHoveredMode('atelie')
                playChalkSound()
              }}
              onMouseLeave={() => setHoveredMode(null)}
              onClick={() => handleEnter('atelie')}
              className="btn-punk flex-grow text-center text-lg md:text-xl py-4 font-bold border-3 border-current"
            >
              ENTRAR NO ATELIÊ
            </button>

            {/* ENTRAR NA PISTA */}
            <button
              onMouseEnter={() => {
                setHoveredMode('pista')
                playSubBeep()
              }}
              onMouseLeave={() => setHoveredMode(null)}
              onClick={() => handleEnter('pista')}
              className="btn-punk flex-grow text-center text-lg md:text-xl py-4 font-bold border-3 border-current bg-[#800c0c] text-[#fdfbf7] hover:bg-[#fdfbf7] hover:text-[#0d0d0d]"
            >
              ENTRAR NA PISTA
            </button>
          </div>
        </div>
      </div>

      {/* Nota de Rodapé estilo editorial */}
      <div className="w-full max-w-6xl flex justify-between items-center z-20 font-mono text-[10px] opacity-70">
        <div>GRAVURA Nº 01/2026</div>
        <div>[ CLIQUE EM QUALQUER LUGAR PARA INICIAR ]</div>
        <div>PPGD / UFSC</div>
      </div>
    </div>
  )
}

function PanteraPresence({ hoveredMode }: { hoveredMode: 'atelie' | 'pista' | null }) {
  return (
    <div className="absolute -top-10 -right-10 w-28 h-28 text-current pointer-events-none transition-all duration-700">
      <PanteraSvg
        className={`w-full h-full transform transition-transform duration-700 ${
          hoveredMode === 'pista' ? 'scale-110 rotate-12 text-[#d49b00]' : 'scale-90 opacity-40'
        }`}
      />
    </div>
  )
}
