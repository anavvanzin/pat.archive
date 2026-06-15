import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import type { World } from '../store/useStore'
import { pixelLoveAudio } from '../audio/pixelLoveAudio'
import PixelChar from '../components/PixelChar'
import SpotifyPlayer from '../components/SpotifyPlayer'
import { loveuPortal } from '../config/portals'

interface Door {
  id: World
  key: string
  icon: string
  label: string
  sublabel: string
  color: string
  glow: string
  border: string
  tooltip: string
}

const DOORS: Door[] = [
  {
    id: 'studio',
    key: '1',
    icon: '🎹',
    label: 'Studio',
    sublabel: 'Music production',
    color: 'var(--pk)',
    glow: 'rgba(244,63,94,0.4)',
    border: 'rgba(244,63,94,0.5)',
    tooltip: 'DAW & DJ Mixer — comandando a música 🎧',
  },
  {
    id: 'memories',
    key: '2',
    icon: '🖼️',
    label: 'Memórias',
    sublabel: 'galeria de fotos',
    color: 'var(--pu2)',
    glow: 'rgba(168,85,247,0.4)',
    border: 'rgba(168,85,247,0.5)',
    tooltip: 'momentos especiais e fotos da paty ✦',
  },
  {
    id: 'recipes',
    key: '3',
    icon: '🍳',
    label: 'Receitas',
    sublabel: 'livro de cozinha',
    color: 'var(--yl)',
    glow: 'rgba(255,224,102,0.4)',
    border: 'rgba(255,224,102,0.5)',
    tooltip: 'receitas deliciosas e fofas para fazer ♡',
  },
]

export default function HubScreen() {
  const setWorld = useStore((s) => s.setWorld)
  const easterEggs = useStore((s) => s.easterEggs)
  const unlockEasterEgg = useStore((s) => s.unlockEasterEgg)
  const addNotification = useStore((s) => s.addNotification)
  const triggerHeartBurst = useStore((s) => s.triggerHeartBurst)

  const [hovered, setHovered] = useState<World | null>(null)
  const [entered, setEntered] = useState<World | null>(null)

  // Easter egg #5 — talher escondido (clicar 3x)
  const [talherClicks, setTalherClicks] = useState(0)
  const [showTalherMsg, setShowTalherMsg] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const door = DOORS.find((d) => d.key === e.key)
      if (door) {
        setEntered(door.id)
        setTimeout(() => setWorld(door.id), 400)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setWorld])

  const handleDoorClick = (id: World) => {
    setEntered(id)
    setTimeout(() => setWorld(id), 400)
  }

  const handleTalherClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const next = talherClicks + 1
    setTalherClicks(next)
    if (next >= 3) {
      unlockEasterEgg('talheres')
      addNotification('🍴 talheres desbloqueados! eram cinco. ou três.', '🍴')
      triggerHeartBurst(e.clientX, e.clientY)
      setShowTalherMsg(true)
      setTimeout(() => setShowTalherMsg(false), 4000)
    }
  }

  const handleLoveuPortal = (e: React.MouseEvent<HTMLButtonElement>) => {
    pixelLoveAudio.primeFromGesture()
    pixelLoveAudio.playBlip()
    addNotification('☁ abrindo o lyra lounge...', '☁')
    triggerHeartBurst(e.clientX, e.clientY)

    const popup = window.open(loveuPortal.url, '_blank', 'noopener,noreferrer')
    if (!popup) {
      window.location.href = loveuPortal.url
    }
  }

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      {/* Background grid floor */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(46,0,85,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(46,0,85,0.3) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 60%, rgba(124,58,237,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Talher escondido — easter egg #5 (quase invisível no canto) */}
      <button
        onClick={handleTalherClick}
        title=""
        style={{
          position: 'absolute',
          bottom: '80px',
          right: '20px',
          background: 'none',
          border: 'none',
          cursor: 'default',
          opacity: talherClicks > 0 ? 0.12 : 0.04,
          fontSize: '10px',
          color: 'var(--tx3)',
          zIndex: 5,
          transition: 'opacity 0.3s',
          fontFamily: 'monospace',
        }}
      >
        🍴
      </button>

      {/* Mensagem do talher */}
      <AnimatePresence>
        {showTalherMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed z-50 pixel-font text-center px-4 py-3 rounded-lg"
            style={{
              bottom: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(22,0,42,0.97)',
              border: '1px solid var(--pu)',
              fontSize: '8px',
              color: 'var(--yl)',
            }}
          >
            🍴 eram cinco. ou três. nunca vamos saber.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col h-full" style={{ zIndex: 2, position: 'relative' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 pt-4 md:pt-5 pb-3 shrink-0">
          <div className="pixel-font text-xs" style={{ color: 'var(--tx3)', letterSpacing: '1px' }}>
            ♡ v1.0
          </div>
          <motion.div
            className="pixel-font"
            style={{ 
              fontSize: '10px', 
              color: 'var(--pu)', 
              textShadow: '0 0 8px var(--pu)',
              textAlign: 'center',
            }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            ♡ hub ♡
          </motion.div>
          {/* Easter egg counter */}
          <motion.div
            className="pixel-font"
            style={{
              fontSize: '9px',
              color: easterEggs.length === 5 ? 'var(--yl)' : 'var(--tx3)',
              textShadow: easterEggs.length === 5 ? '0 0 8px var(--yl)' : 'none',
            }}
            animate={easterEggs.length === 5 ? { opacity: [1, 0.6, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            ✦ {easterEggs.length}/5
          </motion.div>
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div
              className="pixel-font"
              style={{
                fontSize: 'clamp(14px, 2.5vw, 22px)',
                color: 'var(--pu)',
                textShadow: '0 0 16px var(--pu)',
                letterSpacing: '2px',
              }}
            >
              escolha um mundo
            </div>
            <div className="mono-font text-sm mt-1" style={{ color: 'var(--tx3)' }}>
              para onde vamos hoje? ✦
            </div>
          </motion.div>

          {/* Doors grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-xl px-2 sm:px-0">
            {DOORS.map((door, i) => (
              <motion.button
                key={door.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08, type: 'spring', damping: 15 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDoorClick(door.id)}
                onMouseEnter={() => setHovered(door.id)}
                onMouseLeave={() => setHovered(null)}
                className="relative p-3 sm:p-5 rounded-2xl flex flex-col items-center gap-2 sm:gap-3 transition-all card-hover"
                style={{
                  background: entered === door.id
                    ? `linear-gradient(135deg, ${door.glow}, rgba(13,0,21,0.95))`
                    : 'rgba(22,0,42,0.85)',
                  border: `2px solid ${hovered === door.id ? door.border : 'rgba(46,0,85,0.5)'}`,
                  boxShadow: hovered === door.id 
                    ? `0 0 30px ${door.glow}, 0 8px 32px rgba(0,0,0,0.3)` 
                    : '0 4px 16px rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  backdropFilter: 'blur(12px)',
                  minHeight: '100px sm:140px',
                  overflow: 'hidden',
                }}
              >
                {/* Shimmer overlay on hover */}
                {hovered === door.id && (
                  <div 
                    className="absolute inset-0 pointer-events-none shimmer"
                    style={{
                      background: `linear-gradient(135deg, transparent 40%, ${door.glow} 50%, transparent 60%)`,
                    }}
                  />
                )}
                {/* Key hint */}
                <div
                  className="absolute top-2 right-3 pixel-font"
                  style={{ fontSize: '8px', color: 'var(--tx3)' }}
                >
                  [{door.key}]
                </div>

                {/* Portal glow */}
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1 transition-all ${hovered === door.id ? 'text-2xl' : 'text-xl'} sm:text-2xl`}
                  style={{
                    background: `radial-gradient(circle, ${door.glow} 0%, transparent 70%)`,
                    boxShadow: hovered === door.id ? `0 0 24px ${door.glow}` : 'none',
                  }}
                >
                  {door.icon}
                </div>

                <div
                  className={`pixel-font text-center ${hovered === door.id ? 'text-xs' : 'text-2xs'} sm:text-9px`}
                  style={{ color: door.color, letterSpacing: '0.5px' }}
                >
                  {door.label}
                </div>
                <div className="text-2xs sm:text-xs" style={{ color: 'var(--tx3)' }}>
                  {door.sublabel}
                </div>

                {/* Tooltip */}
                {hovered === door.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -bottom-10 left-1/2 -translate-x-1/2 tooltip z-10"
                  >
                    {door.tooltip}
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

          <motion.button
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.985 }}
            onClick={handleLoveuPortal}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl px-5 py-4 text-left card-hover"
            style={{
              border: '1px solid rgba(201,125,255,0.42)',
              background:
                'linear-gradient(135deg, rgba(19,0,40,0.96) 0%, rgba(42,8,72,0.92) 48%, rgba(18,0,38,0.98) 100%)',
              boxShadow: '0 0 28px rgba(124,58,237,0.18), 0 8px 32px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.03)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 12% 30%, rgba(255,110,180,0.22) 0%, transparent 28%), radial-gradient(circle at 82% 20%, rgba(201,125,255,0.22) 0%, transparent 30%), linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
              }}
            />

            <div className="relative flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div
                  className="pixel-font mb-2 inline-flex items-center gap-2"
                  style={{ fontSize: '8px', color: 'var(--yl)', textShadow: '0 0 10px rgba(255,224,102,0.5)' }}
                >
                  <span>✦</span>
                  <span>novo portal</span>
                </div>

                <div
                  className="pixel-font"
                  style={{
                    fontSize: 'clamp(10px, 1.8vw, 14px)',
                    color: 'var(--pk2)',
                    textShadow: '0 0 16px rgba(255,110,180,0.28)',
                    letterSpacing: '0.8px',
                  }}
                >
                  {loveuPortal.title}
                </div>

                <div className="mono-font mt-1 text-sm" style={{ color: 'var(--tx2)' }}>
                  {loveuPortal.subtitle}
                </div>

                <p
                  className="mt-3"
                  style={{
                    color: 'var(--tx)',
                    fontSize: '13px',
                    lineHeight: 1.65,
                    maxWidth: '560px',
                  }}
                >
                  {loveuPortal.description}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <motion.div
                  className="pixel-font"
                  animate={{ y: [0, -6, 0], rotate: [0, 4, 0], scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  style={{ 
                    fontSize: '38px', 
                    filter: 'drop-shadow(0 0 16px rgba(201,125,255,0.6))',
                    textShadow: '0 0 20px var(--pu)',
                  }}
                >
                  ☁
                </motion.div>
                <motion.div
                  className="pixel-font mt-2"
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{ fontSize: '9px', color: 'var(--pu)' }}
                >
                  {loveuPortal.cta}
                </motion.div>
              </div>
            </div>
          </motion.button>

          {/* Characters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-end gap-4"
          >
            <PixelChar char="ana" size={4} />
            <div
              className="pixel-font mb-6 text-sm"
              style={{ color: 'var(--pk)', textShadow: '0 0 8px var(--pk)' }}
            >
              ♡
            </div>
            <PixelChar char="patricia" size={4} />
          </motion.div>
        </div>

        {/* Bottom: Spotify */}
        <SpotifyPlayer />
      </div>
    </div>
  )
}
