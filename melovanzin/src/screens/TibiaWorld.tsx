import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import PixelChar from '../components/PixelChar'
import SpotifyPlayer from '../components/SpotifyPlayer'

const CHEST_MESSAGES = [
  { title: 'tesouro encontrado!', text: 'dentro do baú tinha uma nota: "você é o tesouro mais raro que já dropei nessa vida. amor lvl 999." ♡' },
  { title: 'item raro!', text: '"cada dia com você é um drop épico. e eu coleciono cada momento como se fosse o item mais valioso do jogo." ⚔' },
  { title: 'loot especial!', text: '"eles dizem que amor verdadeiro é raro de dropar. acho que dropei logo de primeira, e nunca mais vou largar." 🌟' },
  { title: 'baú aberto!', text: '"se o Tibia tivesse uma skill chamada Amar você seria lvl 999 e eu ia ser o mob mais feliz do servidor." 🐾' },
  { title: 'surpresa!', text: '"vamo si ama??" — diz a capivara dentro do baú, usando um chapéu de aventureira. sim. sempre sim. ♡' },
]

const LOOT_ITEMS = [
  { icon: '♡', name: 'Coração Encantado', desc: 'dropado com amor. +999 de carinho ao equipar.' },
  { icon: '★', name: 'Estrela de Guardar', desc: 'para guardar os momentos bons. peso: 0. valor: infinito.' },
  { icon: '♪', name: 'Nota Musical', desc: 'uma nota de um beat feito só pra você. toca suave.' },
  { icon: '⚔', name: 'Espada do Amor', desc: 'arma +10 de afeto. causa dano de "saudade" em inimigos.' },
]

function TileMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const TILE = 32

    const drawTile = (x: number, y: number, color: string, darker?: string) => {
      ctx.fillStyle = color
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE)
      if (darker) {
        ctx.fillStyle = darker
        ctx.fillRect(x * TILE, y * TILE + TILE - 3, TILE, 3)
        ctx.fillRect(x * TILE + TILE - 3, y * TILE, 3, TILE)
      }
    }

    const cols = Math.ceil(W / TILE)
    const rows = Math.ceil(H / TILE)

    // Draw grass/dungeon floor
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const isEdge = x === 0 || y === 0 || x === cols - 1 || y === rows - 1
        if (isEdge) {
          drawTile(x, y, '#2d1a0a', '#1a0a00')
        } else if ((x + y) % 4 === 0) {
          drawTile(x, y, '#1a3a10', '#143008')
        } else if ((x + y) % 7 === 0) {
          drawTile(x, y, '#1f4012', '#153008')
        } else {
          drawTile(x, y, '#183010', '#123008')
        }
      }
    }

    // Draw path
    for (let x = 3; x < cols - 3; x++) {
      const y = Math.floor(rows / 2)
      ctx.fillStyle = '#3a2a10'
      ctx.fillRect(x * TILE, y * TILE - TILE, TILE, TILE * 3)
    }

    // Flowers
    const flowers = [
      { x: 2, y: 2 }, { x: cols - 3, y: 2 }, { x: 2, y: rows - 3 }, { x: cols - 3, y: rows - 3 },
      { x: 4, y: 4 }, { x: cols - 5, y: rows - 5 },
    ]
    flowers.forEach(({ x, y }) => {
      ctx.fillStyle = '#ff6eb4'
      ctx.fillRect(x * TILE + 12, y * TILE + 8, 8, 8)
      ctx.fillStyle = '#ffee00'
      ctx.fillRect(x * TILE + 14, y * TILE + 10, 4, 4)
    })
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={320}
      style={{
        imageRendering: 'pixelated',
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
    />
  )
}

function FireflyEffect() {
  const [flies] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 60,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 3,
    }))
  )

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {flies.map((f) => (
        <motion.div
          key={f.id}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            background: 'var(--yl)',
            boxShadow: '0 0 6px var(--yl), 0 0 12px rgba(255,224,102,0.5)',
          }}
          animate={{
            x: [0, 30, -20, 10, 0],
            y: [0, -20, 15, -10, 0],
            opacity: [0, 1, 0.8, 1, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: f.duration,
            delay: f.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export default function TibiaWorld() {
  const { setWorld, addToInventory, inventory, addNotification, triggerHeartBurst } = useStore()

  const [chestOpen, setChestOpen] = useState(false)
  const [chestIdx, setChestIdx] = useState(0)
  const [capyTalking, setCapyTalking] = useState(false)
  const [dropItems, setDropItems] = useState<{ id: number; item: typeof LOOT_ITEMS[0]; x: number; y: number }[]>([])
  const [timeOfDay, setTimeOfDay] = useState(0) // 0=day, 1=night
  const [showInventory, setShowInventory] = useState(false)

  // Day/night cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeOfDay((t) => (t + 0.005) % 2)
    }, 100)
    return () => clearInterval(timer)
  }, [])

  // Loot drops
  useEffect(() => {
    const timer = setInterval(() => {
      const item = LOOT_ITEMS[Math.floor(Math.random() * LOOT_ITEMS.length)]
      const id = Date.now()
      setDropItems((prev) => [
        ...prev,
        { id, item, x: 15 + Math.random() * 70, y: 10 + Math.random() * 50 },
      ])
    }, 30000)
    // First drop after 10s for demo
    const first = setTimeout(() => {
      const item = LOOT_ITEMS[Math.floor(Math.random() * LOOT_ITEMS.length)]
      setDropItems([{ id: Date.now(), item, x: 40 + Math.random() * 20, y: 20 + Math.random() * 30 }])
    }, 10000)
    return () => { clearInterval(timer); clearTimeout(first) }
  }, [])

  const collectItem = (id: number, item: typeof LOOT_ITEMS[0]) => {
    addToInventory({ icon: item.icon, name: item.name, description: item.desc })
    setDropItems((prev) => prev.filter((d) => d.id !== id))
    addNotification(`coletado: ${item.name}! ${item.icon}`, item.icon)
  }

  const openChest = (e: React.MouseEvent) => {
    setChestOpen(true)
    triggerHeartBurst(e.clientX, e.clientY)
  }

  const closeChest = () => {
    setChestOpen(false)
    setChestIdx((i) => (i + 1) % CHEST_MESSAGES.length)
  }

  const nightAlpha = Math.max(0, Math.min(1, (timeOfDay - 0.8) * 3))

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-2 shrink-0"
        style={{ background: 'rgba(10,5,0,0.95)', borderBottom: `2px solid var(--tibia)` }}
      >
        <button
          onClick={() => setWorld('hub')}
          className="pixel-font transition-colors hover:text-white"
          style={{ fontSize: '8px', color: 'var(--tx3)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ← hub
        </button>
        <div className="pixel-font" style={{ fontSize: '10px', color: 'var(--tibia2)', letterSpacing: '1px' }}>
          ⚔ TIBIA ⚔
        </div>
        <div className="flex-1" />
        <button
          onClick={() => setShowInventory((v) => !v)}
          className="pixel-font px-2 py-1 rounded text-xs"
          style={{ fontSize: '8px', background: 'rgba(160,82,45,0.2)', border: '1px solid var(--tibia)', color: 'var(--tibia2)', cursor: 'pointer' }}
        >
          🎒 inventário ({inventory.length})
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Game area */}
        <div className="flex-1 relative overflow-hidden">
          <TileMap />

          {/* Night overlay */}
          <div
            className="absolute inset-0 pointer-events-none transition-all"
            style={{ background: `rgba(0,0,30,${nightAlpha * 0.6})` }}
          />

          <FireflyEffect />

          {/* Capybara NPC */}
          <motion.div
            className="absolute cursor-pointer"
            style={{ bottom: '30%', left: '15%' }}
            animate={{ x: [0, 80, 0] }}
            transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
            onClick={() => setCapyTalking(true)}
          >
            <PixelChar char="capybara" size={3} />
            <AnimatePresence>
              {capyTalking && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute -top-12 left-0 px-3 py-2 rounded-lg pixel-font text-center whitespace-nowrap"
                  style={{
                    fontSize: '8px',
                    background: 'var(--panel)',
                    border: '2px solid var(--tibia)',
                    color: 'var(--tibia2)',
                  }}
                  onAnimationComplete={() => setTimeout(() => setCapyTalking(false), 2000)}
                >
                  🐾 vamo si ama!!
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Ana and Lucas characters */}
          <div className="absolute" style={{ bottom: '25%', left: '40%' }}>
            <PixelChar char="ana" size={4} />
          </div>
          <div className="absolute" style={{ bottom: '25%', left: '55%' }}>
            <PixelChar char="lucas" size={4} />
          </div>

          {/* Treasure chest */}
          <motion.div
            className="absolute cursor-pointer"
            style={{ bottom: '28%', left: '50%', transform: 'translateX(-50%)' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={openChest}
          >
            <div
              className="pixel-font text-3xl"
              style={{
                filter: 'drop-shadow(0 0 8px var(--yl))',
                animation: 'float 2s ease-in-out infinite',
              }}
            >
              📦
            </div>
            <div className="pixel-font text-center mt-1" style={{ fontSize: '7px', color: 'var(--yl)' }}>
              clique!
            </div>
          </motion.div>

          {/* Loot drops */}
          {dropItems.map((d) => (
            <motion.button
              key={d.id}
              className="absolute pixel-font cursor-pointer text-xl"
              style={{ left: `${d.x}%`, top: `${d.y}%`, background: 'none', border: 'none' }}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ scale: 1.3 }}
              onClick={() => collectItem(d.id, d.item)}
            >
              {d.item.icon}
            </motion.button>
          ))}

          {/* HUD bars */}
          <div
            className="absolute top-2 left-2 p-2 rounded"
            style={{ background: 'rgba(10,5,0,0.9)', border: '2px solid var(--tibia)', minWidth: '140px' }}
          >
            <div className="pixel-font mb-2" style={{ fontSize: '6px', color: 'var(--tibia2)', letterSpacing: '1px' }}>
              AMOR LVL 999
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="pixel-font" style={{ fontSize: '6px', color: 'var(--tibia2)', width: '12px' }}>HP</span>
                <div className="flex-1 h-2 rounded" style={{ background: '#1a0a00', border: '1px solid var(--tibia)' }}>
                  <div className="h-full rounded" style={{ width: '100%', background: 'linear-gradient(90deg, #cc0000, #ff3333)' }} />
                </div>
                <span className="pixel-font" style={{ fontSize: '6px', color: 'var(--tibia2)' }}>999</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="pixel-font" style={{ fontSize: '6px', color: 'var(--tibia2)', width: '12px' }}>MP</span>
                <div className="flex-1 h-2 rounded" style={{ background: '#000a1a', border: '1px solid var(--tibia)' }}>
                  <div className="h-full rounded" style={{ width: '100%', background: 'linear-gradient(90deg, #0044cc, #3399ff)' }} />
                </div>
                <span className="pixel-font" style={{ fontSize: '6px', color: 'var(--tibia2)' }}>999</span>
              </div>
            </div>
            <div className="pixel-font mt-1" style={{ fontSize: '5px', color: 'var(--tx3)' }}>
              never dies ♡
            </div>
          </div>

          {/* Time indicator */}
          <div className="absolute top-2 right-2 pixel-font" style={{ fontSize: '7px', color: 'var(--tx3)' }}>
            {timeOfDay < 1 ? '☀ dia' : '🌙 noite'}
          </div>
        </div>

        <SpotifyPlayer />
      </div>

      {/* Chest modal */}
      <AnimatePresence>
        {chestOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ background: 'rgba(13,0,21,0.85)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5 }}
              transition={{ type: 'spring', damping: 12 }}
              className="p-8 rounded-2xl max-w-sm w-full mx-4 text-center"
              style={{ background: 'linear-gradient(135deg, #1a0a00, #2a1500)', border: '3px solid var(--yl)', boxShadow: '0 0 40px rgba(255,224,102,0.3)' }}
            >
              <div className="text-4xl mb-4">📦✨</div>
              <div className="pixel-font mb-4" style={{ fontSize: '11px', color: 'var(--yl)', textShadow: '0 0 10px var(--yl)' }}>
                {CHEST_MESSAGES[chestIdx].title}
              </div>
              <p className="leading-relaxed mb-6" style={{ color: 'var(--tx)', fontSize: '14px', lineHeight: '1.8' }}>
                {CHEST_MESSAGES[chestIdx].text}
              </p>
              <button
                onClick={closeChest}
                className="pixel-font px-6 py-2 rounded-lg"
                style={{ fontSize: '9px', background: 'var(--yl)', color: '#000', border: 'none', cursor: 'pointer' }}
              >
                ♡ fechar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inventory panel */}
      <AnimatePresence>
        {showInventory && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed right-0 top-0 bottom-0 w-72 z-40 flex flex-col"
            style={{ background: 'rgba(10,5,0,0.98)', borderLeft: '2px solid var(--tibia)' }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--tibia)' }}>
              <div className="pixel-font" style={{ fontSize: '9px', color: 'var(--tibia2)' }}>🎒 INVENTÁRIO</div>
              <button onClick={() => setShowInventory(false)} style={{ background: 'none', border: 'none', color: 'var(--tx3)', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {inventory.length === 0 ? (
                <div className="pixel-font text-center mt-8" style={{ fontSize: '8px', color: 'var(--tx3)' }}>
                  nenhum item ainda.<br />colete os drops que caem do céu!
                </div>
              ) : (
                inventory.map((item) => (
                  <div key={item.id} className="p-2 rounded" style={{ background: 'rgba(160,82,45,0.1)', border: '1px solid rgba(160,82,45,0.3)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{item.icon}</span>
                      <span className="pixel-font" style={{ fontSize: '8px', color: 'var(--tibia2)' }}>{item.name}</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--tx3)', fontFamily: 'JetBrains Mono, monospace' }}>{item.description}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
