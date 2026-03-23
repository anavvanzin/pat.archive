import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import PixelChar from '../components/PixelChar'
import SpotifyPlayer from '../components/SpotifyPlayer'

const STEPS = 16
const INITIAL_BPM = 120

function makeEmpty() {
  return Array(STEPS).fill(false)
}

const EASTER_KICK = [0, 4, 8, 12]
const EASTER_SNARE = [4, 12]
const EASTER_HIHAT = [2, 6, 10, 14]

function Waveform({ playing, activeStep }: { playing: boolean; activeStep: number }) {
  const bars = Array.from({ length: 32 }, (_, i) => i)
  return (
    <div className="flex items-center gap-px h-8 overflow-hidden rounded" style={{ background: 'var(--panel2)', padding: '0 4px' }}>
      {bars.map((i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all duration-75"
          style={{
            background: playing && i % 2 === activeStep % 2 ? 'var(--yl)' : 'var(--pu3)',
            height: playing
              ? `${20 + Math.sin(i * 0.8 + activeStep * 0.5) * 12}px`
              : '4px',
            opacity: playing ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  )
}

export default function FruitLoopsWorld() {
  const { setWorld, savedBeats, saveBeat, addNotification, unlockEasterEgg, easterEggs, triggerHeartBurst } = useStore()

  const [kick, setKick] = useState<boolean[]>(makeEmpty())
  const [snare, setSnare] = useState<boolean[]>(makeEmpty())
  const [hihat, setHihat] = useState<boolean[]>(makeEmpty())
  const [bpm, setBpm] = useState(INITIAL_BPM)
  const [playing, setPlaying] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [easterEgg, setEasterEgg] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [showSave, setShowSave] = useState(false)
  const [particleBurst, setParticleBurst] = useState<{ x: number; y: number; id: number } | null>(null)

  const stepRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const kickRef = useRef(kick)
  const snareRef = useRef(snare)
  const hihatRef = useRef(hihat)

  kickRef.current = kick
  snareRef.current = snare
  hihatRef.current = hihat

  // Check easter egg #1 — O Beat Clássico
  useEffect(() => {
    const isEgg =
      EASTER_KICK.every((i) => kick[i]) &&
      EASTER_SNARE.every((i) => snare[i]) &&
      EASTER_HIHAT.every((i) => hihat[i]) &&
      kick.filter(Boolean).length === 4 &&
      snare.filter(Boolean).length === 2 &&
      hihat.filter(Boolean).length === 4
    const wasEgg = easterEgg
    setEasterEgg(isEgg)
    if (isEgg && !wasEgg && !easterEggs.includes('beat_classico')) {
      unlockEasterEgg('beat_classico')
      addNotification("🏆 Easter Egg: 'O Beat Clássico'", '🏆')
      triggerHeartBurst(window.innerWidth / 2, window.innerHeight / 2)
    }
  }, [kick, snare, hihat, easterEgg, easterEggs, unlockEasterEgg, addNotification, triggerHeartBurst])

  const tick = useCallback(() => {
    const interval = (60 / bpm / 4) * 1000
    timerRef.current = setTimeout(() => {
      stepRef.current = (stepRef.current + 1) % STEPS
      setActiveStep(stepRef.current)

      // Trigger particle if any track is on
      if (
        kickRef.current[stepRef.current] ||
        snareRef.current[stepRef.current] ||
        hihatRef.current[stepRef.current]
      ) {
        setParticleBurst({ x: Math.random() * 80 + 10, y: Math.random() * 40 + 30, id: Date.now() })
        setTimeout(() => setParticleBurst(null), 600)
      }

      tick()
    }, interval)
  }, [bpm])

  useEffect(() => {
    if (playing) {
      stepRef.current = -1
      tick()
    } else {
      if (timerRef.current) clearTimeout(timerRef.current)
      setActiveStep(0)
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [playing, tick])

  const handleRandom = () => {
    setKick(Array.from({ length: STEPS }, () => Math.random() > 0.7))
    setSnare(Array.from({ length: STEPS }, () => Math.random() > 0.8))
    setHihat(Array.from({ length: STEPS }, () => Math.random() > 0.5))
  }

  const handleClear = () => {
    setKick(makeEmpty())
    setSnare(makeEmpty())
    setHihat(makeEmpty())
    setEasterEgg(false)
  }

  const handleSave = () => {
    if (!saveName.trim()) return
    const beat = {
      id: Date.now().toString(),
      name: saveName,
      kick, snare, hihat, bpm,
    }
    saveBeat(beat)
    addNotification(`beat "${saveName}" salvo! 🎵`, '🎵')
    setSaveName('')
    setShowSave(false)
  }

  const handleLoad = (beat: typeof savedBeats[0]) => {
    setKick(beat.kick)
    setSnare(beat.snare)
    setHihat(beat.hihat)
    setBpm(beat.bpm)
    setPlaying(false)
  }

  const togglePad = (
    track: 'kick' | 'snare' | 'hihat',
    idx: number,
    e: React.MouseEvent
  ) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setParticleBurst({ x: rect.left + rect.width / 2, y: rect.top, id: Date.now() })
    if (track === 'kick') setKick((p) => p.map((v, i) => (i === idx ? !v : v)))
    if (track === 'snare') setSnare((p) => p.map((v, i) => (i === idx ? !v : v)))
    if (track === 'hihat') setHihat((p) => p.map((v, i) => (i === idx ? !v : v)))
  }

  const tracks = [
    { id: 'kick' as const, label: 'KICK', color: 'var(--pu)', bgOn: '#7c3aed', data: kick },
    { id: 'snare' as const, label: 'SNARE', color: 'var(--pk)', bgOn: '#cc4488', data: snare },
    { id: 'hihat' as const, label: 'HI-HAT', color: 'var(--yl)', bgOn: '#cca800', data: hihat },
  ]

  return (
    <div className="screen" style={{ background: '#0a0800' }}>
      {/* FL Studio header */}
      <div
        className="flex items-center gap-3 px-4 py-2 shrink-0"
        style={{ background: '#111108', borderBottom: '2px solid #2a2200' }}
      >
        <button
          onClick={() => setWorld('hub')}
          className="pixel-font transition-colors hover:text-white"
          style={{ fontSize: '8px', color: 'var(--tx3)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ← hub
        </button>
        <div
          className="pixel-font"
          style={{ fontSize: '10px', color: 'var(--yl)', letterSpacing: '2px', textShadow: '0 0 8px var(--yl)' }}
        >
          ★ FRUIT LOOPS ★
        </div>
        <div className="flex-1" />
        <div className="mono-font text-sm" style={{ color: 'var(--grn)', background: 'rgba(29,185,84,0.1)', border: '1px solid rgba(29,185,84,0.2)', padding: '2px 8px', borderRadius: '4px' }}>
          {bpm} BPM
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Main panel */}
          <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
            {/* Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setPlaying((p) => !p)}
                className="pixel-font px-4 py-2 rounded transition-all"
                style={{
                  fontSize: '9px',
                  background: playing ? 'rgba(29,185,84,0.2)' : 'rgba(201,125,255,0.2)',
                  border: `1px solid ${playing ? 'var(--grn)' : 'var(--pu)'}`,
                  color: playing ? 'var(--grn)' : 'var(--pu)',
                  cursor: 'pointer',
                  minWidth: '70px',
                }}
              >
                {playing ? '⏹ STOP' : '▶ PLAY'}
              </button>
              <button onClick={handleClear} className="pixel-font px-3 py-2 rounded" style={{ fontSize: '8px', background: 'rgba(255,110,180,0.1)', border: '1px solid rgba(255,110,180,0.3)', color: 'var(--pk)', cursor: 'pointer' }}>
                CLEAR
              </button>
              <button onClick={handleRandom} className="pixel-font px-3 py-2 rounded" style={{ fontSize: '8px', background: 'rgba(255,224,102,0.1)', border: '1px solid rgba(255,224,102,0.3)', color: 'var(--yl)', cursor: 'pointer' }}>
                RANDOM
              </button>
              <button onClick={() => setShowSave(true)} className="pixel-font px-3 py-2 rounded" style={{ fontSize: '8px', background: 'rgba(29,185,84,0.1)', border: '1px solid rgba(29,185,84,0.3)', color: 'var(--grn)', cursor: 'pointer' }}>
                SAVE
              </button>

              {/* BPM slider */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="pixel-font" style={{ fontSize: '7px', color: 'var(--tx3)' }}>BPM</span>
                <input
                  type="range" min={60} max={200} value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  style={{ width: '80px', accentColor: 'var(--yl)' }}
                />
              </div>
            </div>

            {/* Waveform */}
            <Waveform playing={playing} activeStep={activeStep} />

            {/* Sequencer tracks */}
            <div className="flex flex-col gap-3">
              {tracks.map((track) => (
                <div key={track.id} className="flex items-center gap-2">
                  <div
                    className="pixel-font w-14 text-right shrink-0"
                    style={{ fontSize: '7px', color: track.color }}
                  >
                    {track.label}
                  </div>
                  <div className="flex gap-1 flex-1">
                    {track.data.map((on, i) => (
                      <button
                        key={i}
                        onClick={(e) => togglePad(track.id, i, e)}
                        className="seq-pad flex-1"
                        style={{
                          height: '24px',
                          background: on
                            ? track.bgOn
                            : i === activeStep && playing
                            ? 'rgba(255,255,255,0.15)'
                            : 'var(--panel2)',
                          border: `1px solid ${
                            i === activeStep && playing
                              ? '#fff'
                              : on
                              ? track.color
                              : 'var(--border)'
                          }`,
                          outline: i % 4 === 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                          outlineOffset: '2px',
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Easter egg */}
            <AnimatePresence>
              {easterEgg && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="pixel-font text-center py-3 rounded-lg"
                  style={{
                    fontSize: '9px',
                    color: 'var(--yl)',
                    background: 'rgba(255,224,102,0.1)',
                    border: '1px solid rgba(255,224,102,0.4)',
                    textShadow: '0 0 10px var(--yl)',
                  }}
                >
                  esse era o beat favorito dele 🎵
                </motion.div>
              )}
            </AnimatePresence>

            {/* Saved beats */}
            {savedBeats.length > 0 && (
              <div className="mt-2">
                <div className="pixel-font mb-2" style={{ fontSize: '8px', color: 'var(--tx3)' }}>SAVED BEATS</div>
                <div className="flex flex-col gap-2">
                  {savedBeats.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center gap-2 p-2 rounded cursor-pointer transition-all hover:opacity-80"
                      style={{ background: 'rgba(255,224,102,0.05)', border: '1px solid rgba(255,224,102,0.2)' }}
                      onClick={() => handleLoad(b)}
                    >
                      <span className="text-sm">🎵</span>
                      <span className="mono-font text-sm flex-1" style={{ color: 'var(--yl)' }}>{b.name}</span>
                      <span className="mono-font text-xs" style={{ color: 'var(--tx3)' }}>{b.bpm} bpm</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: characters */}
          <div
            className="flex flex-col items-center justify-end gap-2 p-4 shrink-0"
            style={{ width: '140px', borderLeft: '1px solid #2a2200' }}
          >
            <div className="pixel-font text-center mb-2" style={{ fontSize: '7px', color: 'var(--tx3)' }}>
              {playing ? 'tocando ♪' : 'parado'}
            </div>
            <motion.div
              animate={playing ? { y: [0, -4, 0, -2, 0] } : { y: 0 }}
              transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut' }}
            >
              <PixelChar char="lucas" size={4} animate={!playing} />
            </motion.div>
            <motion.div
              animate={playing ? { rotate: [-3, 3, -3] } : { rotate: 0 }}
              transition={{ repeat: Infinity, duration: 0.3 }}
            >
              <PixelChar char="ana" size={4} animate={!playing} />
            </motion.div>
          </div>
        </div>

        <SpotifyPlayer />
      </div>

      {/* Particle burst */}
      <AnimatePresence>
        {particleBurst && (
          <motion.div
            key={particleBurst.id}
            className="fixed pointer-events-none pixel-font text-lg"
            style={{ left: particleBurst.x, top: particleBurst.y, zIndex: 50 }}
            initial={{ opacity: 1, scale: 1, y: 0 }}
            animate={{ opacity: 0, scale: 2, y: -40 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            ✦
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save dialog */}
      <AnimatePresence>
        {showSave && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ background: 'rgba(13,0,21,0.85)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSave(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="p-6 rounded-xl"
              style={{ background: 'var(--panel)', border: '2px solid var(--yl)', minWidth: '260px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pixel-font mb-4 text-center" style={{ fontSize: '10px', color: 'var(--yl)' }}>
                salvar beat
              </div>
              <input
                autoFocus
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="nome do beat..."
                className="w-full px-3 py-2 rounded mono-font text-sm mb-3"
                style={{ background: 'var(--panel2)', border: '1px solid var(--border)', color: 'var(--tx)', outline: 'none' }}
              />
              <div className="flex gap-2">
                <button onClick={handleSave} className="flex-1 pixel-font py-2 rounded" style={{ fontSize: '8px', background: 'var(--yl)', color: '#000', border: 'none', cursor: 'pointer' }}>
                  salvar
                </button>
                <button onClick={() => setShowSave(false)} className="pixel-font py-2 px-4 rounded" style={{ fontSize: '8px', background: 'var(--panel2)', color: 'var(--tx2)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                  cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
