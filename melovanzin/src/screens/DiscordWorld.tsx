import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import SpotifyPlayer from '../components/SpotifyPlayer'

interface Message {
  id: number
  author: 'ana' | 'lucas' | 'capy'
  content: string
  timestamp: string
}

type Channel =
  | 'primeiro-contato'
  | 'diamante-roxo'
  | 'fruit-loops'
  | 'tibia-gg'
  | 'gg-bot-lane'
  | 'talheres-e-outros-misterios'
  | 'geral'

const CHANNELS: { id: Channel; icon: string; label: string; unread?: boolean }[] = [
  { id: 'primeiro-contato', icon: '#', label: 'primeiro-contato', unread: true },
  { id: 'diamante-roxo', icon: '#', label: 'diamante-roxo' },
  { id: 'fruit-loops', icon: '#', label: 'fruit-loops' },
  { id: 'tibia-gg', icon: '#', label: 'tibia-gg' },
  { id: 'gg-bot-lane', icon: '#', label: 'gg-bot-lane' },
  { id: 'talheres-e-outros-misterios', icon: '#', label: 'talheres-e-outros-misterios' },
  { id: 'geral', icon: '#', label: 'geral' },
]

const CHANNEL_MESSAGES: Record<Channel, Omit<Message, 'id'>[]> = {
  'primeiro-contato': [
    { author: 'lucas', content: 'oi', timestamp: '20:14' },
    { author: 'lucas', content: 'seu diamante roxo é muito feio', timestamp: '20:14' },
    { author: 'ana', content: 'com licença???', timestamp: '20:15' },
    { author: 'lucas', content: 'desculpa kkkk mas é verdade', timestamp: '20:15' },
    { author: 'lucas', content: 'posso te mandar um efeito melhor', timestamp: '20:16' },
    { author: 'ana', content: '...pode', timestamp: '20:16' },
    { author: 'ana', content: '[recebeu: Efeito de Perfil — Chama Etérea]', timestamp: '20:17' },
    { author: 'ana', content: 'ok esse é bonito', timestamp: '20:17' },
    { author: 'lucas', content: 'né', timestamp: '20:18' },
    { author: 'lucas', content: 'eu sou lucas btw', timestamp: '20:18' },
    { author: 'ana', content: 'eu sei quem você é', timestamp: '20:19' },
    { author: 'lucas', content: 'mentira', timestamp: '20:19' },
    { author: 'ana', content: 'mentira', timestamp: '20:19' },
    { author: 'ana', content: 'kkkkkkkkk', timestamp: '20:19' },
    { author: 'lucas', content: 'kkkkkkkkk', timestamp: '20:19' },
    { author: 'capy', content: '🐾 vamo si ama!!', timestamp: '20:20' },
  ],
  'diamante-roxo': [
    { author: 'capy', content: '📌 esse canal existe em homenagem ao diamante roxo mais feio do servidor', timestamp: '00:00' },
    { author: 'lucas', content: 'eu não me arrependo de nada', timestamp: '21:30' },
    { author: 'ana', content: 'você literalmente abriu conversa falando mal do meu efeito', timestamp: '21:31' },
    { author: 'lucas', content: 'e funcionou', timestamp: '21:31' },
    { author: 'ana', content: '...funcionou', timestamp: '21:32' },
    { author: 'capy', content: '🐾 a capivara aprova', timestamp: '21:32' },
  ],
  'fruit-loops': [
    { author: 'lucas', content: 'escuta essa aqui', timestamp: '15:20' },
    { author: 'lucas', content: '[anexo: beat_wip_03.mp3]', timestamp: '15:20' },
    { author: 'ana', content: 'espera isso é bom', timestamp: '15:22' },
    { author: 'lucas', content: 'fruit loops™ na hora', timestamp: '15:23' },
    { author: 'ana', content: 'você chama o fl studio de fruit loops', timestamp: '15:23' },
    { author: 'lucas', content: 'como cereal', timestamp: '15:23' },
    { author: 'ana', content: 'isso é a coisa mais você que já ouvi', timestamp: '15:24' },
    { author: 'lucas', content: 'obrigada', timestamp: '15:24' },
    { author: 'ana', content: 'não era elogio', timestamp: '15:25' },
    { author: 'ana', content: 'era elogio', timestamp: '15:25' },
    { author: 'capy', content: '🎵 beat aprovado pela capivara', timestamp: '15:25' },
  ],
  'tibia-gg': [
    { author: 'ana', content: 'você joga tibia há quanto tempo', timestamp: '22:05' },
    { author: 'lucas', content: 'desde que eu tinha 12 anos', timestamp: '22:06' },
    { author: 'lucas', content: 'passei mais tempo no tibia do que na escola', timestamp: '22:06' },
    { author: 'ana', content: 'isso explica muita coisa', timestamp: '22:07' },
    { author: 'lucas', content: 'kkkkk verdade', timestamp: '22:07' },
    { author: 'lucas', content: 'bora jogar juntos?', timestamp: '22:08' },
    { author: 'ana', content: 'eu sou horrível', timestamp: '22:08' },
    { author: 'lucas', content: 'não tem problema eu protejo você', timestamp: '22:09' },
    { author: 'ana', content: '🥹', timestamp: '22:09' },
    { author: 'capy', content: '⚔ amor lvl 999 detected', timestamp: '22:10' },
  ],
  'gg-bot-lane': [
    { author: 'lucas', content: 'você joga adc eu jogo support', timestamp: '19:00' },
    { author: 'ana', content: 'por quê você support', timestamp: '19:01' },
    { author: 'lucas', content: 'porque eu cuido de você', timestamp: '19:01' },
    { author: 'ana', content: 'para', timestamp: '19:02' },
    { author: 'lucas', content: 'gg bot lane ♡', timestamp: '19:02' },
    { author: 'ana', content: 'gg ♡', timestamp: '19:02' },
    { author: 'capy', content: '🏆 VICTORY (duo perfeito)', timestamp: '19:03' },
  ],
  'talheres-e-outros-misterios': [
    { author: 'ana', content: 'espera quantos talheres têm nessa mesa', timestamp: '23:10' },
    { author: 'lucas', content: 'cinco', timestamp: '23:10' },
    { author: 'ana', content: 'tem cinco?', timestamp: '23:11' },
    { author: 'lucas', content: 'tem cinco', timestamp: '23:11' },
    { author: 'ana', content: 'lucas', timestamp: '23:12' },
    { author: 'lucas', content: 'ana', timestamp: '23:12' },
    { author: 'ana', content: 'são TRÊS talheres', timestamp: '23:12' },
    { author: 'lucas', content: '...', timestamp: '23:13' },
    { author: 'lucas', content: 'a física não se aplica aqui', timestamp: '23:13' },
    { author: 'ana', content: 'a gente tá chapado', timestamp: '23:14' },
    { author: 'lucas', content: 'a gente tá chapado', timestamp: '23:14' },
    { author: 'ana', content: 'KKKKKKKKKKKK', timestamp: '23:14' },
    { author: 'lucas', content: 'KKKKKKKKKKKK', timestamp: '23:14' },
    { author: 'ana', content: 'histórico pra contar pros filhos', timestamp: '23:15' },
    { author: 'lucas', content: 'histórico pra contar pros filhos', timestamp: '23:15' },
    { author: 'capy', content: '🍴 a capivara contou: eram três', timestamp: '23:15' },
  ],
  'geral': [
    { author: 'capy', content: 'bem-vindos ao melovanzin 🫧', timestamp: '00:00' },
    { author: 'lucas', content: 'ei', timestamp: '01:00' },
    { author: 'ana', content: 'ei', timestamp: '01:01' },
    { author: 'lucas', content: 'eu gosto muito de você sabe', timestamp: '01:02' },
    { author: 'ana', content: 'kkkkk do nada', timestamp: '01:02' },
    { author: 'lucas', content: 'do nada não', timestamp: '01:03' },
    { author: 'lucas', content: 'você sabe que não é do nada', timestamp: '01:03' },
    { author: 'ana', content: 'eu sei', timestamp: '01:04' },
    { author: 'ana', content: 'eu também gosto muito de você', timestamp: '01:04' },
    { author: 'lucas', content: 'muito?', timestamp: '01:05' },
    { author: 'ana', content: 'muito muito', timestamp: '01:05' },
    { author: 'lucas', content: 'que bom', timestamp: '01:06' },
    { author: 'ana', content: 'que bom', timestamp: '01:06' },
    { author: 'lucas', content: 'vamo si ama?', timestamp: '01:07' },
    { author: 'ana', content: 'vamo si ama ♡', timestamp: '01:07' },
    { author: 'capy', content: '🐾 finalmente', timestamp: '01:07' },
  ],
}

const AUTHOR_CONFIG = {
  ana: {
    name: 'ana',
    color: '#ff6eb4',
    dot: '#ff6eb4',
    status: 'online',
    avatar: '🌸',
    tooltip: 'brownie enthusiast • phd candidate • ama o lucas demais',
  },
  lucas: {
    name: 'lucas',
    color: '#c97dff',
    dot: '#c97dff',
    status: 'online',
    avatar: '🎵',
    tooltip: 'fruit loops aficionado • tibia veteran • bigodinho iconic • ama a ana demais',
  },
  capy: {
    name: 'CapivaraBot',
    color: '#1db954',
    dot: '#1db954',
    status: 'bot',
    avatar: '🐾',
    tooltip: '🐾 — bot oficial do MeloVanzin',
  },
}

function Avatar({ author }: { author: 'ana' | 'lucas' | 'capy' }) {
  const [tip, setTip] = useState(false)
  const cfg = AUTHOR_CONFIG[author]

  return (
    <div
      className="relative shrink-0"
      onMouseEnter={() => setTip(true)}
      onMouseLeave={() => setTip(false)}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-base font-bold"
        style={{ background: `${cfg.color}22`, border: `2px solid ${cfg.color}` }}
      >
        {cfg.avatar}
      </div>
      <div
        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
        style={{ background: cfg.dot, borderColor: '#1e2124' }}
      />
      {tip && (
        <div
          className="absolute left-10 top-0 z-50 px-3 py-2 rounded-lg text-xs whitespace-nowrap"
          style={{
            background: '#111',
            border: '1px solid #333',
            color: '#ddd',
            fontFamily: 'Inter, sans-serif',
            lineHeight: '1.5',
          }}
        >
          <strong style={{ color: cfg.color }}>{cfg.name}</strong>
          {author === 'capy' && (
            <span
              className="ml-1 px-1 rounded text-xs"
              style={{ background: cfg.dot, color: '#000', fontSize: '9px' }}
            >
              BOT
            </span>
          )}
          <br />
          {cfg.tooltip}
        </div>
      )}
    </div>
  )
}

export default function DiscordWorld() {
  const { setWorld, unlockEasterEgg, easterEggs, addNotification, triggerHeartBurst } = useStore()

  const [activeChannel, setActiveChannel] = useState<Channel>('primeiro-contato')
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState<'ana' | 'lucas' | 'capy' | null>(null)
  const [msgIndex, setMsgIndex] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // Rastrear canais que o user leu até o fim
  const readChannels = useRef<Set<Channel>>(new Set())

  const allMessages = CHANNEL_MESSAGES[activeChannel]

  // Resetar ao mudar de canal
  useEffect(() => {
    setVisibleMessages([])
    setMsgIndex(0)
    setIsTyping(null)
  }, [activeChannel])

  // Revelar mensagens uma por uma
  useEffect(() => {
    if (msgIndex >= allMessages.length) {
      // Canal lido até o final
      readChannels.current.add(activeChannel)

      // Easter egg #4 — "A Origem": ler todos os canais até o fim do #geral
      if (
        activeChannel === 'geral' &&
        !easterEggs.includes('a_origem')
      ) {
        setTimeout(() => {
          unlockEasterEgg('a_origem')
          addNotification("🫧 Easter Egg: 'A Origem' — você leu tudo. obrigada por existir. ♡", '🫧')
          triggerHeartBurst(window.innerWidth / 2, window.innerHeight / 2)
        }, 800)
      }
      return
    }

    const msg = allMessages[msgIndex]
    const delay = msgIndex === 0 ? 500 : 700

    const typingTimer = setTimeout(() => {
      setIsTyping(msg.author)
    }, delay - 350)

    const msgTimer = setTimeout(() => {
      setIsTyping(null)
      setVisibleMessages((prev) => [...prev, { ...msg, id: msgIndex }])
      setMsgIndex((i) => i + 1)
    }, delay)

    return () => {
      clearTimeout(typingTimer)
      clearTimeout(msgTimer)
    }
  }, [msgIndex, allMessages, activeChannel, easterEggs, unlockEasterEgg, addNotification, triggerHeartBurst])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [visibleMessages, isTyping])

  return (
    <div className="screen" style={{ background: '#36393f' }}>
      <div className="flex h-full">
        {/* Sidebar */}
        <div
          className="flex flex-col shrink-0"
          style={{ width: '220px', background: '#2f3136', borderRight: '1px solid #1e2124' }}
        >
          <button
            onClick={() => setWorld('hub')}
            className="pixel-font text-left px-3 py-2 text-xs transition-colors hover:text-white"
            style={{ background: 'none', border: 'none', color: 'var(--tx3)', cursor: 'pointer', borderBottom: '1px solid #1e2124' }}
          >
            ← hub
          </button>

          {/* Cabeçalho do servidor */}
          <div
            className="flex items-center gap-2 px-3 py-3"
            style={{ borderBottom: '1px solid #1e2124', background: '#2f3136' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--pu3), var(--pk))', fontSize: '16px' }}
            >
              🐾
            </div>
            <div>
              <div className="font-semibold text-sm text-white">MeloVanzin</div>
              <div style={{ fontSize: '10px', color: 'var(--grn)' }}>✦ vamo si ama</div>
            </div>
          </div>

          {/* Mensagem fixada */}
          <div className="px-3 py-2" style={{ borderBottom: '1px solid #1e2124' }}>
            <div className="text-xs" style={{ color: 'var(--tx3)', fontFamily: 'JetBrains Mono, monospace' }}>
              📌 foi aqui que tudo começou 🫧
            </div>
          </div>

          {/* Canais */}
          <div className="flex-1 overflow-y-auto py-2">
            <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--tx3)' }}>
              Canais de texto
            </div>
            {CHANNELS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className="w-full flex items-center gap-1.5 px-3 py-1.5 rounded mx-1 transition-colors"
                style={{
                  background: activeChannel === ch.id ? 'rgba(88,101,242,0.3)' : 'transparent',
                  border: 'none',
                  color: activeChannel === ch.id ? '#fff' : 'var(--tx3)',
                  cursor: 'pointer',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '12px',
                  textAlign: 'left',
                  width: 'calc(100% - 8px)',
                }}
              >
                <span style={{ color: 'var(--tx3)', fontSize: '11px' }}>{ch.icon}</span>
                <span className="truncate">{ch.label}</span>
                {ch.unread && (
                  <span
                    className="ml-auto w-2 h-2 rounded-full shrink-0"
                    style={{ background: 'var(--dc)' }}
                  />
                )}
              </button>
            ))}

            {/* Voice channel */}
            <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider mt-2 mb-1" style={{ color: 'var(--tx3)' }}>
              Canais de voz
            </div>
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 mx-1 rounded"
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--tx3)' }}
            >
              <span>🎙</span>
              <span>vamo-si-ama</span>
              <span className="ml-auto text-xs" style={{ color: 'var(--grn)' }}>2</span>
            </div>
          </div>

          {/* Usuários online */}
          <div
            className="p-3 flex flex-col gap-2"
            style={{ borderTop: '1px solid #1e2124', background: '#292b2f' }}
          >
            <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--tx3)' }}>
              Online — 3
            </div>
            {(['ana', 'lucas', 'capy'] as const).map((u) => (
              <div key={u} className="flex items-center gap-2">
                <Avatar author={u} />
                <div>
                  <div className="text-xs font-medium" style={{ color: AUTHOR_CONFIG[u].color }}>
                    {AUTHOR_CONFIG[u].name}
                    {u === 'capy' && (
                      <span
                        className="ml-1 px-1 rounded"
                        style={{ background: 'var(--grn)', color: '#000', fontSize: '8px' }}
                      >
                        BOT
                      </span>
                    )}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--tx3)' }}>
                    {AUTHOR_CONFIG[u].status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat principal */}
        <div className="flex-1 flex flex-col" style={{ background: '#36393f', minWidth: 0 }}>
          {/* Cabeçalho do canal */}
          <div
            className="flex items-center gap-2 px-4 py-3 shrink-0"
            style={{ borderBottom: '1px solid #1e2124', background: '#36393f' }}
          >
            <span style={{ color: 'var(--tx3)', fontSize: '16px' }}>
              {CHANNELS.find((c) => c.id === activeChannel)?.icon}
            </span>
            <span className="font-semibold text-white text-sm truncate">
              {activeChannel}
            </span>
            <div className="ml-auto flex items-center gap-3 shrink-0">
              <div
                className="text-xs px-2 py-1 rounded"
                style={{
                  background: 'rgba(88,101,242,0.2)',
                  border: '1px solid rgba(88,101,242,0.4)',
                  color: 'var(--dc2)',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px',
                }}
              >
                MeloVanzin
              </div>
            </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {/* Banner especial para #primeiro-contato */}
            {activeChannel === 'primeiro-contato' && (
              <div
                className="px-4 py-3 rounded-lg mb-2"
                style={{
                  background: 'rgba(88,101,242,0.1)',
                  border: '1px solid rgba(88,101,242,0.3)',
                }}
              >
                <div className="text-xs font-semibold mb-1" style={{ color: 'var(--dc2)' }}>
                  📌 mensagem fixada
                </div>
                <div className="text-sm" style={{ color: 'var(--tx)' }}>
                  "foi aqui que tudo começou 🫧 — o universo MeloVanzin nasce nesse canal"
                </div>
              </div>
            )}

            {visibleMessages.map((msg) => {
              const cfg = AUTHOR_CONFIG[msg.author]
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start gap-3 dc-message"
                >
                  <Avatar author={msg.author} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="font-medium text-sm" style={{ color: cfg.color }}>
                        {cfg.name}
                        {msg.author === 'capy' && (
                          <span
                            className="ml-1 px-1 rounded text-xs"
                            style={{ background: 'var(--grn)', color: '#000', fontSize: '9px', verticalAlign: 'middle' }}
                          >
                            BOT
                          </span>
                        )}
                      </span>
                      <span
                        className="text-xs shrink-0"
                        style={{ color: 'var(--tx3)', fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                    <div className="text-sm leading-relaxed" style={{ color: '#dcddde', wordBreak: 'break-word' }}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              )
            })}

            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 flex items-center justify-center text-base">
                    {AUTHOR_CONFIG[isTyping].avatar}
                  </div>
                  <div className="flex items-center gap-1 px-3 py-2 rounded-lg" style={{ background: '#40444b' }}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: '#72767d',
                          animation: `typing 1s ease-in-out infinite`,
                          animationDelay: `${i * 0.2}s`,
                        }}
                      />
                    ))}
                    <span className="text-xs ml-2" style={{ color: '#72767d' }}>
                      {AUTHOR_CONFIG[isTyping].name} está digitando...
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Input decorativo */}
          <div className="px-4 pb-4 shrink-0">
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-lg"
              style={{ background: '#40444b' }}
            >
              <span className="text-lg">🐾</span>
              <span style={{ color: '#72767d', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
                mensagem no #{activeChannel}
              </span>
              <div className="ml-auto pixel-font" style={{ fontSize: '7px', color: 'var(--tx3)' }}>
                read-only ♡
              </div>
            </div>
          </div>

          <SpotifyPlayer />
        </div>
      </div>
    </div>
  )
}
