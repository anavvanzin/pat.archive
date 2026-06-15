import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'

const LOVE_MESSAGES = [
  'não noia sozinho. fala comigo. a gente resolve qualquer coisa conversando. meu amor é maior que qualquer insegurança. ♡',
  'você começou falando mal do meu diamante roxo e terminou sendo a pessoa mais importante da minha vida. poetic cinema.',
  'eu cuido de você assim como você joga support pra mim. sempre. gg bot lane. ♡',
  'fruit loops, tibia, discord, bot lane, talheres que eram cinco e eram três. cada detalhe nosso é meu favorito.',
  'a pessoa do mal fez uma coisa boa. a melhor coisa. 🙏',
  'te amo no dia e na noite, no dungeon e na lane, no discord e fora dele. te amo em todos os servidores. ♡',
  'você é o beat que eu nunca consigo parar de ouvir.',
  'amor lvl 999. never dies. esse sou eu, esse é você, esse somos nós. 🫧',
  'quando eu falar que vou ficar bem, mas não estiver, você já sabe: fala comigo. sempre. meu amor quebra qualquer insegurança na porrada. ♡',
  'vamo si ama. hoje, amanhã, e em todos os servidores do universo. — ana',
]

export default function LoveMessageOverlay() {
  const { showLoveMessage, loveMessageIndex, setShowLoveMessage, nextLoveMessage } = useStore()

  const msg = LOVE_MESSAGES[loveMessageIndex]

  useEffect(() => {
    const handler = (_e: KeyboardEvent) => {
      if (showLoveMessage) {
        setShowLoveMessage(false)
        nextLoveMessage()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showLoveMessage, setShowLoveMessage, nextLoveMessage])

  return (
    <>
      {/* Botão flutuante ✦ */}
      <button
        onClick={() => setShowLoveMessage(true)}
        className="fixed z-40 w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all hover:scale-110"
        style={{
          bottom: '68px',
          left: '16px',
          background: 'linear-gradient(135deg, var(--pu3), var(--pk))',
          border: '2px solid var(--pu)',
          boxShadow: '0 0 16px rgba(201,125,255,0.6)',
          color: '#fff',
          cursor: 'pointer',
          animation: 'float 3s ease-in-out infinite',
        }}
        title="mensagem de amor ♡"
      >
        ✦
      </button>

      <AnimatePresence>
        {showLoveMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(13,0,21,0.92)', backdropFilter: 'blur(12px)' }}
            onClick={() => { setShowLoveMessage(false); nextLoveMessage() }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              transition={{ type: 'spring', damping: 20 }}
              className="max-w-lg w-full p-8 rounded-2xl text-center relative"
              style={{
                background: 'linear-gradient(145deg, #16002a, #1e0038)',
                border: '2px solid var(--pu)',
                boxShadow: '0 0 40px rgba(201,125,255,0.3), 0 0 80px rgba(201,125,255,0.1)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Corações decorativos */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                {['♡', '♡', '♡', '✦', '♡'].map((c, i) => (
                  <div
                    key={i}
                    className="absolute text-sm"
                    style={{
                      left: `${10 + i * 20}%`,
                      top: `${5 + (i % 2) * 80}%`,
                      color: i % 2 === 0 ? 'var(--pk)' : 'var(--pu)',
                      opacity: 0.3,
                      fontSize: '20px',
                      animation: `float ${2 + i * 0.5}s ease-in-out infinite`,
                      animationDelay: `${i * 0.3}s`,
                    }}
                  >
                    {c}
                  </div>
                ))}
              </div>

              <div className="pixel-font text-sm mb-6" style={{ color: 'var(--pk)', textShadow: '0 0 12px var(--pk)' }}>
                ♡ mensagem {loveMessageIndex + 1}/10 ♡
              </div>

              <p
                className="leading-relaxed mb-8"
                style={{ color: 'var(--tx)', fontSize: '15px', lineHeight: '1.9' }}
              >
                {msg}
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => { setShowLoveMessage(false); nextLoveMessage() }}
                  className="pixel-font px-6 py-3 rounded-lg transition-all hover:scale-105"
                  style={{
                    fontSize: '9px',
                    background: 'linear-gradient(135deg, var(--pu3), var(--pu2))',
                    border: '1px solid var(--pu)',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  próxima ♡
                </button>
              </div>

              <div className="mt-4 text-xs" style={{ color: 'var(--tx3)' }}>
                pressione qualquer tecla para fechar
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
