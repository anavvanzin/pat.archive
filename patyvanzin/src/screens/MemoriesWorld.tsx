import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { pixelLoveAudio } from '../audio/pixelLoveAudio'

// Imagens carregadas e inlinadas automaticamente como Base64 pelo Vite
import patriciaPortrait from '../assets/patricia_portrait.png'
import patriciaSelfie from '../assets/patricia_selfie.jpg'
import patriciaDj from '../assets/patricia_dj.jpg'
import patriciaStudio from '../assets/patricia_studio.jpg'
import patriciaPainting from '../assets/patricia_painting.jpg'

interface Memory {
  img: string
  title: string
  desc: string
  date: string
}

const MEMORIES: Memory[] = [
  {
    img: patriciaPortrait,
    title: 'Brilho Cósmico',
    desc: 'Um olhar marcante, cheio de atitude e brilho. A minha obra de arte favorita ♡',
    date: '2026',
  },
  {
    img: patriciaSelfie,
    title: 'Reflexo de Estilo',
    desc: 'Aquela selfie perfeita no espelho, com muito estilo e as tattoos marcando presença 🤳✨',
    date: '2026',
  },
  {
    img: patriciaDj,
    title: 'DJ Paty',
    desc: 'Comandando as pickups com maestria e controlando as batidas do meu coração 🎧🔥',
    date: '2026',
  },
  {
    img: patriciaStudio,
    title: 'Ateliê Criativo',
    desc: 'Onde as tintas e as cores ganham vida sob o seu toque artístico incrível 🎨🖌️',
    date: '2026',
  },
  {
    img: patriciaPainting,
    title: 'Mão na Massa',
    desc: 'Toda a dedicação, paixão e delicadeza expressas em cada pincelada do quadro 🐆💛',
    date: '2026',
  },
]

export default function MemoriesWorld() {
  const setWorld = useStore((s) => s.setWorld)
  const triggerHeartBurst = useStore((s) => s.triggerHeartBurst)
  const unlockEasterEgg = useStore((s) => s.unlockEasterEgg)
  const addNotification = useStore((s) => s.addNotification)
  const easterEggs = useStore((s) => s.easterEggs)

  const [currentIdx, setCurrentIdx] = useState(0)
  const [direction, setDirection] = useState(0) // -1 para esquerda, 1 para direita
  const [viewedPhotos, setViewedPhotos] = useState<number[]>([0]) // Começa com a primeira foto vista

  const handleNext = () => {
    pixelLoveAudio.playBlip()
    setDirection(1)
    const nextIdx = (currentIdx + 1) % MEMORIES.length
    setCurrentIdx(nextIdx)
    if (!viewedPhotos.includes(nextIdx)) {
      setViewedPhotos((prev) => [...prev, nextIdx])
    }
  }

  const handlePrev = () => {
    pixelLoveAudio.playBlip()
    setDirection(-1)
    const prevIdx = (currentIdx - 1 + MEMORIES.length) % MEMORIES.length
    setCurrentIdx(prevIdx)
    if (!viewedPhotos.includes(prevIdx)) {
      setViewedPhotos((prev) => [...prev, prevIdx])
    }
  }

  const handlePhotoClick = (e: React.MouseEvent) => {
    triggerHeartBurst(e.clientX, e.clientY)
    
    // Desbloqueia o easter egg se todas as 5 fotos foram vistas
    if (viewedPhotos.length === 5 && !easterEggs.includes('album_completo')) {
      unlockEasterEgg('album_completo')
      addNotification('🖼️ Álbum de fotos completo! ♡', '🖼️')
      pixelLoveAudio.playBlip()
    }
  }

  const handleBack = () => {
    pixelLoveAudio.playBlip()
    setWorld('hub')
  }

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      rotate: dir > 0 ? 6 : -6,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 300, damping: 25 },
        opacity: { duration: 0.2 },
        rotate: { type: 'spring' as const, stiffness: 200, damping: 20 },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
      rotate: dir < 0 ? 6 : -6,
      scale: 0.9,
      transition: {
        x: { type: 'spring' as const, stiffness: 300, damping: 25 },
        opacity: { duration: 0.2 },
      },
    }),
  }

  const current = MEMORIES[currentIdx]

  return (
    <div className="screen flex flex-col justify-between p-4 md:p-6" style={{ background: 'var(--bg)' }}>
      {/* Grid background decorativo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(46,0,85,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(46,0,85,0.2) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.5,
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between shrink-0 z-10">
        <button
          onClick={handleBack}
          className="pixel-font px-4 py-2 rounded-lg border border-purple-950 text-2xs cursor-pointer flex items-center gap-2"
          style={{
            background: 'rgba(22,0,42,0.8)',
            color: 'var(--pk)',
            borderColor: 'rgba(244,63,94,0.4)',
            boxShadow: '0 0 10px rgba(244,63,94,0.1)',
          }}
        >
          ← voltar
        </button>
        <div className="pixel-font text-2xs text-center" style={{ color: 'var(--pu)', textShadow: '0 0 8px var(--pu)' }}>
          ✦ galeria de fotos ✦
        </div>
        <div className="pixel-font text-2xs" style={{ color: 'var(--tx3)' }}>
          {currentIdx + 1}/{MEMORIES.length}
        </div>
      </div>

      {/* Main Container - Polaroid */}
      <div className="flex-1 flex items-center justify-center py-4 relative z-10 overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIdx}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            onClick={handlePhotoClick}
            className="w-full max-w-[280px] sm:max-w-[340px] bg-white rounded-md p-3 sm:p-4 shadow-2xl flex flex-col gap-3 sm:gap-4 cursor-pointer select-none"
            style={{
              boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 40px rgba(244,63,94,0.15)',
              transformOrigin: 'center bottom',
            }}
          >
            {/* Foto Wrapper */}
            <div className="relative aspect-[4/5] bg-neutral-900 overflow-hidden rounded border border-neutral-200">
              <img
                src={current.img}
                alt={current.title}
                className="w-full h-full object-cover"
                draggable={false}
              />
              {/* Overlay sutil de brilho/CRT na foto */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(rgba(255,255,255,0.08) 50%, rgba(0,0,0,0.05) 50%)',
                  backgroundSize: '100% 4px',
                }}
              />
              {/* Polaroid Heart Tag */}
              <div
                className="absolute bottom-2 right-2 pixel-font text-xs flex items-center justify-center w-8 h-8 rounded-full bg-white/80 shadow-md backdrop-blur-sm"
                style={{ color: 'var(--pk)' }}
              >
                ❤
              </div>
            </div>

            {/* Caption Area (Polaroid Bottom) */}
            <div className="flex flex-col text-neutral-800 text-center gap-1.5 sm:gap-2 pt-1 pb-2 font-mono">
              <div
                className="pixel-font text-xs sm:text-sm tracking-wide"
                style={{ color: '#2a0845', lineHeight: 1.4 }}
              >
                {current.title}
              </div>
              <p className="text-2xs sm:text-xs leading-relaxed text-neutral-600 px-1 font-medium">
                {current.desc}
              </p>
              <div className="text-3xs sm:text-2xs tracking-widest text-neutral-400 font-bold mt-1">
                — {current.date} —
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="flex justify-center items-center gap-6 shrink-0 z-10 pb-2">
        <motion.button
          whileHover={{ scale: 1.1, x: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePrev}
          className="pixel-font w-10 h-10 rounded-full border border-purple-950 flex items-center justify-center cursor-pointer"
          style={{
            background: 'rgba(22,0,42,0.85)',
            borderColor: 'rgba(168,85,247,0.4)',
            color: '#fff',
            fontSize: '10px',
            boxShadow: '0 0 15px rgba(168,85,247,0.2)',
          }}
        >
          ◀
        </motion.button>

        <div
          className="pixel-font text-3xs text-center uppercase tracking-wider"
          style={{ color: 'var(--tx3)' }}
        >
          Clique na foto para soltar corações
        </div>

        <motion.button
          whileHover={{ scale: 1.1, x: 2 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleNext}
          className="pixel-font w-10 h-10 rounded-full border border-purple-950 flex items-center justify-center cursor-pointer"
          style={{
            background: 'rgba(22,0,42,0.85)',
            borderColor: 'rgba(168,85,247,0.4)',
            color: '#fff',
            fontSize: '10px',
            boxShadow: '0 0 15px rgba(168,85,247,0.2)',
          }}
        >
          ▶
        </motion.button>
      </div>
    </div>
  )
}
