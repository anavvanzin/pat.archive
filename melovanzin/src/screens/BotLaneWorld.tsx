import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import SpotifyPlayer from '../components/SpotifyPlayer'

interface Minion {
  id: number
  x: number
  lane: 'ana' | 'lucas'
  hp: number
}

interface Ward {
  id: number
  x: number
  y: number
}

type Phase = 'playing' | 'dragon' | 'victory'

export default function BotLaneWorld() {
  const { setWorld, triggerHeartBurst, addNotification } = useStore()

  const [minions, setMinions] = useState<Minion[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [score, setScore] = useState({ minions: 0, kills: 0 })
  const [phase, setPhase] = useState<Phase>('playing')
  const [timer, setTimer] = useState(0)
  const [dragonHp, setDragonHp] = useState(100)
  const [dragonMsg, setDragonMsg] = useState('')
  const [fireworks, setFireworks] = useState(false)
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)

  const minionIdRef = useRef(0)
  const wardIdRef = useRef(0)

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return
    const t = setInterval(() => {
      setTimer((s) => {
        if (s >= 59) {
          setPhase('victory')
          setFireworks(true)
          return s
        }
        return s + 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [phase])

  // Dragon spawn at 30s
  useEffect(() => {
    if (timer === 30 && phase === 'playing') {
      setPhase('dragon')
      setDragonHp(100)
      addNotification('DRAGÃO APARECEU! 🐉 clique rápido!', '🐉')
    }
  }, [timer, phase, addNotification])

  // Minion spawns
  useEffect(() => {
    if (phase !== 'playing') return
    const t = setInterval(() => {
      const id = minionIdRef.current++
      const lane = Math.random() > 0.5 ? 'ana' : 'lucas'
      setMinions((prev) => [...prev, { id, x: 0, lane, hp: 3 }])
    }, 5000)
    // First spawn immediately
    const first = setTimeout(() => {
      setMinions([
        { id: minionIdRef.current++, x: 5, lane: 'ana', hp: 3 },
        { id: minionIdRef.current++, x: 5, lane: 'lucas', hp: 3 },
      ])
    }, 1000)
    return () => { clearInterval(t); clearTimeout(first) }
  }, [phase])

  // Move minions
  useEffect(() => {
    if (phase !== 'playing') return
    const t = setInterval(() => {
      setMinions((prev) =>
        prev
          .map((m) => ({ ...m, x: m.x + 1.5 }))
          .filter((m) => m.x < 90)
      )
    }, 200)
    return () => clearInterval(t)
  }, [phase])

  const lastHit = (id: number, e: React.MouseEvent) => {
    setMinions((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, hp: m.hp - 1 } : m
      ).filter((m) => m.hp > 0)
    )
    setScore((s) => ({ ...s, minions: s.minions + 1 }))
    triggerHeartBurst(e.clientX, e.clientY)
  }

  const placeWard = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== 'playing') return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    // Only in river area (middle)
    if (y > 35 && y < 65) {
      const id = wardIdRef.current++
      setWards((prev) => [...prev, { id, x, y }])
      setTooltip({ text: '🟣 ward colocada! visão ativada', x: e.clientX, y: e.clientY })
      setTimeout(() => setTooltip(null), 1500)
    }
  }

  const hitDragon = useCallback((e: React.MouseEvent) => {
    setDragonHp((hp) => {
      const next = Math.max(0, hp - 8)
      if (next <= 0) {
        setPhase('playing')
        setDragonMsg('DRAGÃO ABATIDO ♡')
        triggerHeartBurst(e.clientX, e.clientY)
        addNotification('DRAGON SLAIN ♡ duo unbeatable!!', '🐉')
        setTimeout(() => setDragonMsg(''), 3000)
      }
      return next
    })
  }, [triggerHeartBurst, addNotification])

  return (
    <div className="screen" style={{ background: '#0a1a0a' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-2 shrink-0"
        style={{ background: 'rgba(5,15,5,0.97)', borderBottom: '2px solid rgba(200,155,60,0.5)' }}
      >
        <button
          onClick={() => setWorld('hub')}
          className="pixel-font transition-colors hover:text-white"
          style={{ fontSize: '8px', color: 'var(--tx3)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ← hub
        </button>
        <div className="pixel-font" style={{ fontSize: '10px', color: 'var(--lol)', letterSpacing: '1px', animation: 'lolGlow 2.5s infinite' }}>
          🏆 BOT LANE
        </div>
        <div className="flex-1" />
        {/* Timer */}
        <div className="pixel-font" style={{ fontSize: '9px', color: 'var(--lol)' }}>
          {String(Math.floor(timer / 60)).padStart(2,'0')}:{String(timer % 60).padStart(2,'0')}
        </div>
        {/* Stats */}
        <div className="mono-font text-xs" style={{ color: 'var(--tx3)' }}>
          CS: {score.minions} | Duo: ∞ | Losses: 0
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Game map */}
        <div
          className="flex-1 relative overflow-hidden cursor-crosshair"
          style={{ background: '#0d200d' }}
          onClick={placeWard}
        >
          {/* Lane backgrounds */}
          {/* Ana's lane (top, pink) */}
          <div
            className="absolute"
            style={{
              top: 0, left: 0, right: 0, height: '35%',
              background: 'linear-gradient(180deg, rgba(255,110,180,0.08), rgba(255,110,180,0.04))',
              borderBottom: '2px solid rgba(255,110,180,0.2)',
            }}
          />
          {/* Lane labels */}
          <div className="absolute top-2 left-3 pixel-font" style={{ fontSize: '7px', color: 'var(--pk)', opacity: 0.6 }}>
            ♡ ANA lane (ADC)
          </div>
          <div className="absolute bottom-16 left-3 pixel-font" style={{ fontSize: '7px', color: 'var(--pu)', opacity: 0.6 }}>
            ♡ LUCAS lane (Support)
          </div>

          {/* River */}
          <div
            className="absolute"
            style={{
              top: '35%', left: 0, right: 0, height: '30%',
              background: 'linear-gradient(180deg, rgba(0,60,120,0.4), rgba(0,40,100,0.5), rgba(0,60,120,0.4))',
              borderTop: '1px solid rgba(0,100,200,0.3)',
              borderBottom: '1px solid rgba(0,100,200,0.3)',
            }}
          />
          <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '42%' }}>
            <div className="pixel-font text-center" style={{ fontSize: '7px', color: 'rgba(100,150,200,0.5)' }}>
              ~ RIO ~
            </div>
          </div>

          {/* Lucas's lane (bottom, purple) */}
          <div
            className="absolute"
            style={{
              top: '65%', left: 0, right: 0, bottom: 0,
              background: 'linear-gradient(180deg, rgba(124,58,237,0.04), rgba(124,58,237,0.08))',
              borderTop: '2px solid rgba(124,58,237,0.2)',
            }}
          />

          {/* Nexus (right side) with heart */}
          <div
            className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
            title="Nexus — coração invencível"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{
                background: 'radial-gradient(circle, rgba(201,125,255,0.3) 0%, rgba(88,101,242,0.2) 100%)',
                border: '2px solid var(--pu)',
                boxShadow: '0 0 20px rgba(201,125,255,0.5)',
                animation: 'pulse 2s infinite',
              }}
            >
              ♡
            </div>
            <div className="pixel-font" style={{ fontSize: '6px', color: 'var(--pu)', opacity: 0.7 }}>nexus</div>
          </div>

          {/* Towers */}
          {['15%', '65%'].map((top, i) => (
            <div
              key={i}
              className="absolute right-20"
              style={{ top }}
              onMouseEnter={(e) => setTooltip({ text: 'Torre defensiva — nunca apagada ♡', x: e.clientX, y: e.clientY })}
              onMouseLeave={() => setTooltip(null)}
            >
              <div className="pixel-font text-xl">🗼</div>
            </div>
          ))}

          {/* Minions */}
          {minions.map((m) => (
            <motion.button
              key={m.id}
              className="absolute pixel-font cursor-pointer text-base"
              style={{
                left: `${m.x}%`,
                top: m.lane === 'ana' ? '20%' : '75%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                filter: `drop-shadow(0 0 4px ${m.lane === 'ana' ? 'var(--pk)' : 'var(--pu)'})`,
              }}
              onClick={(e) => { e.stopPropagation(); lastHit(m.id, e) }}
              onMouseEnter={(e) => setTooltip({ text: `minion ${m.lane === 'ana' ? '(Ana lane)' : '(Lucas lane)'} — last hit! cs +1`, x: e.clientX, y: e.clientY })}
              onMouseLeave={() => setTooltip(null)}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.8 }}
            >
              {m.lane === 'ana' ? '🧡' : '💜'}
              <div
                className="absolute -top-2 left-0 right-0 h-1 rounded"
                style={{ background: 'rgba(255,0,0,0.5)' }}
              >
                <div style={{ width: `${(m.hp / 3) * 100}%`, height: '100%', background: '#00ff44', borderRadius: '2px' }} />
              </div>
            </motion.button>
          ))}

          {/* Wards */}
          {wards.map((w) => (
            <div
              key={w.id}
              className="absolute"
              style={{
                left: `${w.x}%`,
                top: `${w.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background: 'var(--pu)',
                  boxShadow: '0 0 12px var(--pu), 0 0 24px rgba(201,125,255,0.4)',
                  animation: 'pulse 2s infinite',
                }}
              />
            </div>
          ))}

          {/* Dragon (phase) */}
          <AnimatePresence>
            {phase === 'dragon' && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 z-10"
              >
                <motion.button
                  onClick={hitDragon}
                  className="text-5xl cursor-pointer"
                  style={{ background: 'none', border: 'none' }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  whileTap={{ scale: 0.8 }}
                  onMouseEnter={(e) => setTooltip({ text: '🐉 DRAGÃO — clique rápido para abater! duo pode tudo!', x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setTooltip(null)}
                >
                  🐉
                </motion.button>
                <div className="w-32 h-2 rounded" style={{ background: 'rgba(255,0,0,0.3)' }}>
                  <div style={{ width: `${dragonHp}%`, height: '100%', background: '#ff4400', borderRadius: '4px', transition: 'width 0.1s' }} />
                </div>
                <div className="pixel-font" style={{ fontSize: '7px', color: '#ff4400' }}>
                  DRAGÃO {dragonHp}%
                </div>
                <div className="pixel-font" style={{ fontSize: '8px', color: 'var(--yl)' }}>
                  clique para abater!
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dragon slain message */}
          <AnimatePresence>
            {dragonMsg && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              >
                <div
                  className="pixel-font text-center"
                  style={{ fontSize: 'clamp(14px, 3vw, 24px)', color: 'var(--pk)', textShadow: '0 0 20px var(--pk)' }}
                >
                  {dragonMsg}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tooltip */}
          {tooltip && (
            <div className="tooltip" style={{ left: tooltip.x + 8, top: tooltip.y - 40, position: 'fixed' }}>
              {tooltip.text}
            </div>
          )}

          {/* Stats overlay */}
          <div
            className="absolute top-2 right-16"
            style={{
              background: 'rgba(5,15,5,0.85)',
              border: '1px solid rgba(200,155,60,0.4)',
              borderRadius: '6px',
              padding: '4px 8px',
            }}
          >
            <div className="pixel-font" style={{ fontSize: '7px', color: 'var(--lol)' }}>♡♡♡</div>
            <div className="mono-font" style={{ fontSize: '9px', color: 'var(--tx2)' }}>Duo: ∞</div>
            <div className="mono-font" style={{ fontSize: '9px', color: 'var(--tx2)' }}>Losses: 0</div>
          </div>

          {/* Ward hint */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pixel-font text-center" style={{ fontSize: '7px', color: 'rgba(100,150,200,0.5)' }}>
            clique no rio para colocar ward
          </div>
        </div>

        <SpotifyPlayer />
      </div>

      {/* Victory Screen */}
      <AnimatePresence>
        {phase === 'victory' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ background: 'rgba(5,15,5,0.95)' }}
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className="text-center p-8"
            >
              {/* Fireworks */}
              {fireworks && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {Array.from({ length: 20 }, (_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-2xl"
                      style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: [0, 1, 0], scale: [0, 2, 0], y: -100 }}
                      transition={{ delay: i * 0.1, duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                    >
                      {['♡', '✦', '★', '🏆', '♡'][i % 5]}
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="pixel-font mb-4" style={{ fontSize: 'clamp(20px, 4vw, 36px)', color: 'var(--lol)', textShadow: '0 0 20px var(--lol)', animation: 'lolGlow 2s infinite' }}>
                VICTORY!
              </div>
              <div className="pixel-font mb-2" style={{ fontSize: '12px', color: 'var(--pk)' }}>
                ♡ duo invencível ♡
              </div>
              <div className="mono-font mb-6" style={{ color: 'var(--tx2)', fontSize: '14px' }}>
                CS: {score.minions} | Duo games: ∞ | Losses: 0
              </div>
              <div className="pixel-font mb-8" style={{ fontSize: '10px', color: 'var(--tx)' }}>
                "juntos a gente nunca perde.<br />nem no jogo, nem na vida." ♡
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => { setPhase('playing'); setTimer(0); setScore({ minions: 0, kills: 0 }); setMinions([]); setWards([]) }}
                  className="pixel-font px-6 py-2 rounded"
                  style={{ fontSize: '9px', background: 'var(--lol)', color: '#000', border: 'none', cursor: 'pointer' }}
                >
                  jogar de novo
                </button>
                <button
                  onClick={() => setWorld('hub')}
                  className="pixel-font px-6 py-2 rounded"
                  style={{ fontSize: '9px', background: 'var(--panel)', color: 'var(--tx2)', border: '1px solid var(--border)', cursor: 'pointer' }}
                >
                  ← hub
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
