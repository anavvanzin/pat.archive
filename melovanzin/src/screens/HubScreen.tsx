import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
    tooltip: 'faça um beat com o lucas ♪',
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
  const [hovered, setHovered] = useState<World | null>(null)
  const [entered, setEntered] = useState<World | null>(null)

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
          <div className="pixel-font text-xs" style={{ color: 'var(--tx3)' }}>
            [1][2][3][4]
          </div>
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
