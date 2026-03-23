import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'

const LOVE_MESSAGES = [
  {
    title: 'desde o primeiro "oi"',
    body: 'foi no Discord que tudo começou. uma mensagem, depois outra, e de repente você virou a minha pessoa favorita no mundo inteiro. obrigada por entrar no servidor. ♡',
  },
  {
    title: 'não noia sozinho',
    body: 'você sempre fala isso quando tô em espiral. e funciona toda vez. porque quando você fala, eu acredito. você é meu lugar seguro, Lucas. sempre. 🫧',
  },
  {
    title: 'fruit loops forever',
    body: 'eu não sabia que aprender sobre FL Studio seria tão romântico. mas ouvir você explicar cada batida enquanto eu tentava entender... foi quando percebi que ia me apaixonar muito. 🎵',
  },
  {
    title: 'tibia & nós',
    body: 'amor nível 999. nunca morre. HP e MP sempre cheios porque você recarrega minha energia só de existir. obrigada por ser meu duo nesse jogo enorme que é a vida. ⚔',
  },
  {
    title: 'sair de dia ☀',
    body: 'lembra quando você perguntou se eu queria sair de dia? aquela frase simples mudou tudo. eu disse sim e ganhou meu coração inteiro. a gente vai sair de dia pra sempre. 🌞',
  },
  {
    title: 'bot lane duo',
    body: 'eu sou o suporte, você é o carry — ou vice-versa, depende do dia. mas o importante é que a gente nunca perde quando tá junto. zero derrotas quando somos parceiros. 🏆',
  },
  {
    title: 'brownies & você',
    body: 'toda vez que faço brownie penso em você. não porque você pediu, mas porque fazer coisas gostosas quando penso em você faz sentido. você é minha coisa favorita. 🍫',
  },
  {
    title: 'vamo si ama!!',
    body: 'a Capivara sabia antes de nós dois. olha ela aí, com a mochilinha, já mandando mensagem de amor. obrigada por amarmos tanto um ao outro. vamo si ama, pra sempre. 🐾',
  },
  {
    title: 'meu universo',
    body: 'essa coisa toda — o Discord, o Tibia, o FL Studio, o bot lane — é o universo só nosso que a gente construiu. e ele é lindo demais. igual você. te amo, Lucas. 🫧',
  },
  {
    title: 'meu amor é maior',
    body: 'não importa o que você faça, o quanto você tente medir, meu amor por você sempre vai ser maior. maior que qualquer palavra, qualquer beat, qualquer mapa de Tibia. sempre. ♡',
  },
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
      {/* Floating ✦ button */}
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
              {/* Decorative hearts */}
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

              <h2
                className="pixel-font mb-6 leading-relaxed"
                style={{ fontSize: '16px', color: 'var(--pu)', textShadow: '0 0 16px var(--pu)' }}
              >
                {msg.title}
              </h2>

              <p
                className="leading-relaxed mb-8"
                style={{ color: 'var(--tx)', fontSize: '15px', lineHeight: '1.8' }}
              >
                {msg.body}
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
