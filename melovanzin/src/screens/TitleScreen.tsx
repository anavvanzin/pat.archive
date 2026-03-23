import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import PixelChar from '../components/PixelChar'

function StarField() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 3,
    duration: 1.5 + Math.random() * 2,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animation: `twinkle ${s.duration}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

function ParticleBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: { x: number; y: number; vx: number; vy: number; size: number; color: string; alpha: number }[] = []
    const colors = ['#c97dff', '#ff6eb4', '#a855f7', '#ff9ed6', '#7c3aed']

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5 - 0.2,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.2,
      })
    }

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 }
    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY }
    window.addEventListener('mousemove', onMove)

    let raf: number
    const animate = () => {
      ctx.fillStyle = 'rgba(13,0,21,0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        // Attract to mouse
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 200) {
          p.vx += dx / dist * 0.02
          p.vy += dy / dist * 0.02
        }

        p.vx *= 0.99
        p.vy *= 0.99
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  )
}

export default function TitleScreen() {
  const setWorld = useStore((s) => s.setWorld)
  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    const handler = () => {
      if (!pressed) {
        setPressed(true)
        setTimeout(() => setWorld('hub'), 600)
      }
    }
    window.addEventListener('keydown', handler)
    window.addEventListener('click', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      window.removeEventListener('click', handler)
    }
  }, [pressed, setWorld])

  return (
    <div className="screen" style={{ background: 'var(--bg)', cursor: 'pointer' }}>
      <ParticleBg />
      <StarField />

      {/* CRT horizontal bars subtle */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>
        <div className="crt-overlay" />
      </div>

      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center gap-6"
        style={{ zIndex: 3 }}
        animate={pressed ? { opacity: 0, scale: 1.05 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Characters */}
        <div className="flex items-end gap-8 mb-2">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          >
            <PixelChar char="ana" size={5} />
          </motion.div>
          <div className="pixel-font text-2xl" style={{ color: 'var(--pk)', marginBottom: '20px', textShadow: '0 0 12px var(--pk)' }}>♡</div>
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut', delay: 0.3 }}
          >
            <PixelChar char="lucas" size={5} />
          </motion.div>
        </div>

        {/* Title */}
        <div>
          <h1
            className="pixel-font text-center"
            style={{
              fontSize: 'clamp(18px, 4vw, 36px)',
              color: 'var(--pu)',
              textShadow: '0 0 20px var(--pu), 0 0 40px rgba(201,125,255,0.4)',
              letterSpacing: '2px',
              lineHeight: '1.4',
            }}
          >
            MeloVanzin
          </h1>
          <p
            className="pixel-font text-center mt-3"
            style={{
              fontSize: 'clamp(8px, 1.5vw, 12px)',
              color: 'var(--pk)',
              textShadow: '0 0 10px var(--pk)',
              letterSpacing: '1px',
            }}
          >
            um universo só nosso 🫧
          </p>
        </div>

        {/* Press start */}
        <div
          className="pixel-font mt-4"
          style={{
            fontSize: 'clamp(8px, 1.5vw, 11px)',
            color: 'var(--tx2)',
            animation: 'blink 1.4s ease-in-out infinite',
            letterSpacing: '1px',
          }}
        >
          — PRESS START —
        </div>

        {/* Floating hearts */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {['♡', '♡', '✦', '♡', '✦'].map((c, i) => (
            <div
              key={i}
              className="absolute pixel-font"
              style={{
                left: `${10 + i * 20}%`,
                bottom: `${20 + (i % 3) * 15}%`,
                fontSize: `${10 + i * 2}px`,
                color: i % 2 === 0 ? 'var(--pk)' : 'var(--pu)',
                opacity: 0.4,
                animation: `float ${2.5 + i * 0.4}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
