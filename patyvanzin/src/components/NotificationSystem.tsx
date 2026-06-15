import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/useStore'

const NOTIFICATION_POOL = [
  { message: 'Patrícia entrou em voz — vamo si ama!!', icon: '🎙' },
  { message: 'Ana começou a fazer brownies 🍫', icon: '🍫' },
  { message: 'Capivara quer atenção 🐾', icon: '🐾' },
  { message: 'novo beat salvo no Fruit Loops ✦', icon: '🎵' },
  { message: 'Patrícia mandou coração no Discord ♡', icon: '💜' },
  { message: 'Ana: "não noia sozinho — fala comigo" 💬', icon: '💬' },
  { message: 'Capivara Bot: vamo si ama!! 🐾', icon: '🤖' },
  { message: 'Ana online — sair de dia? ☀', icon: '☀' },
]

export default function NotificationSystem() {
  const { notifications, addNotification, removeNotification } = useStore()

  useEffect(() => {
    let idx = Math.floor(Math.random() * NOTIFICATION_POOL.length)
    const fire = () => {
      const n = NOTIFICATION_POOL[idx % NOTIFICATION_POOL.length]
      addNotification(n.message, n.icon)
      idx++
      schedule()
    }
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      timer = setTimeout(fire, 8000 + Math.random() * 12000)
    }
    schedule()
    return () => clearTimeout(timer)
  }, [addNotification])

  return (
    <div
      className="fixed flex flex-col gap-2 z-50"
      style={{ bottom: '68px', right: '12px', maxWidth: '220px' }}
    >
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg p-3 relative"
            style={{
              background: 'rgba(31,33,68,0.97)',
              border: '1px solid var(--dc)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 0 12px rgba(88,101,242,0.3)',
            }}
          >
            <div className="flex items-start gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm"
                style={{ background: 'var(--dc)' }}
              >
                {n.icon}
              </div>
              <div>
                <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--dc2)' }}>
                  ♡
                </div>
                <div className="text-xs leading-relaxed" style={{ color: 'var(--tx2)' }}>
                  {n.message}
                </div>
              </div>
            </div>
            <button
              onClick={() => removeNotification(n.id)}
              className="absolute top-1 right-2 text-xs hover:text-white transition-colors"
              style={{ background: 'none', border: 'none', color: 'var(--tx3)', cursor: 'pointer' }}
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
