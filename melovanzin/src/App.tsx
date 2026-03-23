import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from './store/useStore'
import CRTOverlay from './components/CRTOverlay'
import NotificationSystem from './components/NotificationSystem'
import LoveMessageOverlay from './components/LoveMessageOverlay'
import TitleScreen from './screens/TitleScreen'
import HubScreen from './screens/HubScreen'
import FruitLoopsWorld from './screens/FruitLoopsWorld'
import TibiaWorld from './screens/TibiaWorld'
import BotLaneWorld from './screens/BotLaneWorld'
import DiscordWorld from './screens/DiscordWorld'

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

const WORLDS = {
  title: TitleScreen,
  hub: HubScreen,
  fruitloops: FruitLoopsWorld,
  tibia: TibiaWorld,
  botlane: BotLaneWorld,
  discord: DiscordWorld,
} as const

export default function App() {
  const currentWorld = useStore((s) => s.currentWorld)
  const Component = WORLDS[currentWorld]

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

      <AnimatePresence mode="wait">
        <motion.div
          key={currentWorld}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <Component />
        </motion.div>
      </AnimatePresence>

      {currentWorld !== 'title' && (
        <>
          <NotificationSystem />
          <LoveMessageOverlay />
          <HeartBurst />
        </>
      )}
    </div>
  )
}
