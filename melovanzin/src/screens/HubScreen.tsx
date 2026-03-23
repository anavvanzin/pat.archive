import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import type { World } from '../store/useStore'
import PixelChar from '../components/PixelChar'
import SpotifyPlayer from '../components/SpotifyPlayer'

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
    id: 'fruitloops',
    key: '1',
    icon: '🎵',
    label: 'Fruit Loops',
    sublabel: 'FL Studio world',
    color: 'var(--yl)',
    glow: 'rgba(255,224,102,0.4)',
    border: 'rgba(255,224,102,0.5)',
    tooltip: 'fruit loops™ — bora fazer um beat',
  },
  {
    id: 'tibia',
    key: '2',
    icon: '⚔',
    label: 'Tibia',
    sublabel: 'RPG world',
    color: 'var(--tibia2)',
    glow: 'rgba(160,82,45,0.4)',
    border: 'rgba(222,184,135,0.5)',
    tooltip: 'amor lvl 999 — nunca morre',
  },
  {
    id: 'botlane',
    key: '3',
    icon: '🏆',
    label: 'Bot Lane',
    sublabel: 'League of Legends',
    color: 'var(--lol)',
    glow: 'rgba(200,155,60,0.4)',
    border: 'rgba(200,155,60,0.5)',
    tooltip: 'duo games: ∞ / losses: 0',
  },
  {
    id: 'discord',
    key: '4',
    icon: '💬',
    label: 'Discord',
    sublabel: 'the origin story',
    color: 'var(--dc2)',
    glow: 'rgba(88,101,242,0.4)',
    border: 'rgba(88,101,242,0.5)',
    tooltip: 'foi aqui que tudo começou 🫧',
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
        <div className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
          <div className="pixel-font text-xs" style={{ color: 'var(--tx3)', letterSpacing: '1px' }}>
            melovanzin v1.0
          </div>
          <div
            className="pixel-font"
            style={{ fontSize: '10px', color: 'var(--pu)', textShadow: '0 0 8px var(--pu)' }}
          >
            ♡ hub ♡
          </div>
          {/* Easter egg counter */}
          <motion.div
            className="pixel-font"
            style={{
              fontSize: '9px',
              color: easterEggs.length === 6 ? 'var(--yl)' : 'var(--tx3)',
              textShadow: easterEggs.length === 6 ? '0 0 8px var(--yl)' : 'none',
            }}
            animate={easterEggs.length === 6 ? { opacity: [1, 0.6, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            ✦ {easterEggs.length}/6
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
          <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
            {DOORS.map((door, i) => (
              <motion.button
                key={door.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.08, type: 'spring', damping: 15 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleDoorClick(door.id)}
                onMouseEnter={() => setHovered(door.id)}
                onMouseLeave={() => setHovered(null)}
                className="relative p-4 rounded-xl flex flex-col items-center gap-2 transition-all"
                style={{
                  background: entered === door.id
                    ? `linear-gradient(135deg, ${door.glow}, rgba(13,0,21,0.9))`
                    : 'rgba(22,0,42,0.8)',
                  border: `2px solid ${hovered === door.id ? door.border : 'var(--border)'}`,
                  boxShadow: hovered === door.id ? `0 0 20px ${door.glow}` : 'none',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  minHeight: '110px',
                }}
              >
                {/* Key hint */}
                <div
                  className="absolute top-2 right-3 pixel-font"
                  style={{ fontSize: '8px', color: 'var(--tx3)' }}
                >
                  [{door.key}]
                </div>

                {/* Portal glow */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-1 transition-all"
                  style={{
                    background: `radial-gradient(circle, ${door.glow} 0%, transparent 70%)`,
                    boxShadow: hovered === door.id ? `0 0 24px ${door.glow}` : 'none',
                  }}
                >
                  {door.icon}
                </div>

                <div
                  className="pixel-font text-center"
                  style={{ fontSize: '9px', color: door.color, letterSpacing: '0.5px' }}
                >
                  {door.label}
                </div>
                <div className="text-xs" style={{ color: 'var(--tx3)' }}>
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
            <PixelChar char="lucas" size={4} />
          </motion.div>
        </div>

        {/* Bottom: Spotify */}
        <SpotifyPlayer />
      </div>
    </div>
  )
}
