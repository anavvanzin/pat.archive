import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { pixelLoveAudio } from './audio/pixelLoveAudio'
import { useStore } from './store/useStore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import CRTOverlay from './components/CRTOverlay'
import MeloBuddy from './components/MeloBuddy'
import NotificationSystem from './components/NotificationSystem'
import LoveMessageOverlay from './components/LoveMessageOverlay'
import TitleScreen from './screens/TitleScreen'
import HubScreen from './screens/HubScreen'
import FruitLoopsWorld from './screens/FruitLoopsWorld'
import TibiaWorld from './screens/TibiaWorld'
import BotLaneWorld from './screens/BotLaneWorld'
import DiscordWorld from './screens/DiscordWorld'
import StudioScreen from './screens/StudioScreen'

function HeartBurst() {
  const heartBurstPos = useStore((s) => s.heartBurstPos)
  if (!heartBurstPos) return null

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{ left: heartBurstPos.x, top: heartBurstPos.y }}
    >
      {['♡', '♡', '✦', '♡', '✦', '♡'].map((c, i) => (
        <motion.div
          key={i}
          className="absolute pixel-font text-lg"
          style={{ color: i % 2 === 0 ? 'var(--pk)' : 'var(--pu)', left: 0, top: 0 }}
          initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
          animate={{
            opacity: 0,
            x: Math.cos((i / 6) * Math.PI * 2) * 60,
            y: Math.sin((i / 6) * Math.PI * 2) * 60 - 30,
            scale: 1.5,
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {c}
        </motion.div>
      ))}
    </div>
  )
}

// Tela de conclusão 100%
function CompletionScreen({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: 'rgba(13,0,21,0.97)', backdropFilter: 'blur(16px)' }}
    >
      {/* Fogos de artifício */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute text-xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 80}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 2.5, 0], y: -120 }}
            transition={{
              delay: i * 0.15,
              duration: 1.8,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          >
            {['♡', '✦', '★', '🫧', '♡', '💜', '💗'][i % 7]}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.7, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 18, delay: 0.2 }}
        className="text-center px-8 max-w-lg relative"
      >
        <motion.div
          className="pixel-font mb-4"
          style={{ fontSize: 'clamp(10px, 2vw, 14px)', color: 'var(--yl)', textShadow: '0 0 16px var(--yl)' }}
          animate={{ opacity: [1, 0.6, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          ★ 100% — MeloVanzin Completo ★
        </motion.div>

        <div className="flex justify-center gap-4 my-6">
          {['💗', '🐾', '💜'].map((e, i) => (
            <motion.div
              key={i}
              className="text-4xl"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2, ease: 'easeInOut' }}
            >
              {e}
            </motion.div>
          ))}
        </div>

        <p
          className="leading-relaxed mb-4"
          style={{ color: 'var(--tx)', fontSize: 'clamp(13px, 1.8vw, 16px)', lineHeight: '2.2' }}
        >
          você encontrou tudo.
          <br />
          assim como eu te encontrei.
          <br />
          obrigada por jogar, lucas.
          <br />
          <span style={{ color: 'var(--pk)', textShadow: '0 0 10px var(--pk)' }}>
            te amo. — ana ♡
          </span>
        </p>

        <button
          onClick={onClose}
          className="pixel-font px-6 py-3 rounded-lg mt-2"
          style={{
            fontSize: '9px',
            background: 'linear-gradient(135deg, var(--pu3), var(--pk))',
            border: '1px solid var(--pu)',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          ♡ fechar
        </button>
      </motion.div>
    </motion.div>
  )
}

// Tela do Konami Code (easter egg #6) — fundo preto + texto verde Matrix
function KonamiScreen({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center cursor-pointer"
      style={{ background: '#000' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center px-8 max-w-lg"
      >
        {[
          'você encontrou o segredo mais secreto.',
          '',
          'mas o segredo mais secreto',
          'é que eu te amo muito.',
          '',
          'fim. ♡',
        ].map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.4 }}
            style={{
              color: '#00ff41',
              fontFamily: 'monospace',
              fontSize: 'clamp(12px, 1.8vw, 17px)',
              textShadow: '0 0 8px #00ff41',
              minHeight: '1.6em',
              marginBottom: '4px',
            }}
          >
            {line}
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.8 }}
          style={{ color: '#005510', fontFamily: 'monospace', fontSize: '11px', marginTop: '32px' }}
        >
          [ clique para fechar ]
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
]

const WORLDS = {
  title: TitleScreen,
  hub: HubScreen,
  fruitloops: FruitLoopsWorld,
  tibia: TibiaWorld,
  botlane: BotLaneWorld,
  discord: DiscordWorld,
  studio: StudioScreen,
} as const

export default function App() {
  const currentWorld = useStore((s) => s.currentWorld)
  const setWorld = useStore((s) => s.setWorld)
  const setFirebaseUser = useStore((s) => s.setFirebaseUser)
  const easterEggs = useStore((s) => s.easterEggs)
  const unlockEasterEgg = useStore((s) => s.unlockEasterEgg)
  const addNotification = useStore((s) => s.addNotification)
  const spotifyPlaying = useStore((s) => s.spotifyPlaying)
  const buddyAura = useStore((s) => s.buddyAura)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user)
    })
    return () => unsubscribe()
  }, [setFirebaseUser])

  const handleOpenWorld = (world: 'hub' | 'discord' | 'tibia' | 'botlane') => {
    setWorld(world)
  }

  const renderWorld = () => {
    if (currentWorld === 'studio') {
      return <StudioScreen onExit={() => setWorld('hub')} onOpenWorld={handleOpenWorld} />
    }
    const Component = WORLDS[currentWorld]
    return <Component />
  }

  const [showKonami, setShowKonami] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const konamiBuf = useRef<string[]>([])
  const audioBootstrapped = useRef(false)
  const prevEggCount = useRef(easterEggs.length)

  // Detectar Konami code em qualquer tela
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      konamiBuf.current = [...konamiBuf.current, e.key].slice(-KONAMI.length)
      if (konamiBuf.current.join(',') === KONAMI.join(',')) {
        konamiBuf.current = []
        unlockEasterEgg('konami')
        addNotification('★ segredo máximo desbloqueado ♡', '★')
        setShowKonami(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [unlockEasterEgg, addNotification])

  // Mostrar tela de conclusão quando todos os 6 easter eggs forem encontrados
  useEffect(() => {
    if (easterEggs.length === 6 && prevEggCount.current < 6) {
      setTimeout(() => setShowCompletion(true), 1500)
    }
    prevEggCount.current = easterEggs.length
  }, [easterEggs.length])

  useEffect(() => {
    const bootstrapAudio = () => {
      if (audioBootstrapped.current) return
      audioBootstrapped.current = true

      pixelLoveAudio.primeFromGesture()
      if (spotifyPlaying) {
        pixelLoveAudio.playMusic()
      }
    }

    window.addEventListener('pointerdown', bootstrapAudio, { passive: true })
    window.addEventListener('keydown', bootstrapAudio)

    return () => {
      window.removeEventListener('pointerdown', bootstrapAudio)
      window.removeEventListener('keydown', bootstrapAudio)
    }
  }, [spotifyPlaying])

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg)',
        position: 'relative',
      }}
    >
      <CRTOverlay />

      <MeloBuddy aura={buddyAura} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentWorld}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ position: 'absolute', inset: 0 }}
        >
          {renderWorld()}
        </motion.div>
      </AnimatePresence>

      {currentWorld !== 'title' && (
        <>
          <MeloBuddy />
          <NotificationSystem />
          <LoveMessageOverlay />
          <HeartBurst />
        </>
      )}

      <AnimatePresence>
        {showKonami && (
          <KonamiScreen key="konami" onClose={() => setShowKonami(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCompletion && (
          <CompletionScreen key="completion" onClose={() => setShowCompletion(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
