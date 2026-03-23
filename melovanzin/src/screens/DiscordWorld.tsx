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

type Channel = 'primeiro-contato' | 'fruit-loops' | 'tibia-gg' | 'gg-bot-lane' | 'lofi-vibes' | 'vamo-si-ama'

const CHANNELS: { id: Channel; icon: string; label: string; unread?: boolean }[] = [
  { id: 'primeiro-contato', icon: '#', label: 'primeiro-contato', unread: true },
  { id: 'fruit-loops', icon: '#', label: 'fruit-loops' },
  { id: 'tibia-gg', icon: '#', label: 'tibia-gg' },
  { id: 'gg-bot-lane', icon: '#', label: 'gg-bot-lane' },
  { id: 'lofi-vibes', icon: '#', label: 'lofi-vibes' },
  { id: 'vamo-si-ama', icon: '🎙', label: 'vamo-si-ama' },
]

const CHANNEL_MESSAGES: Record<Channel, Omit<Message, 'id'>[]> = {
  'primeiro-contato': [
    { author: 'lucas', content: 'oi! vi você lá no servidor do Tibia Brasil', timestamp: '20:14' },
    { author: 'ana', content: 'oi!! sim sim eu jogo às vezes haha', timestamp: '20:15' },
    { author: 'lucas', content: 'que coincidência. também faço umas coisas no FL Studio, vi que você comentou sobre música', timestamp: '20:16' },
    { author: 'ana', content: 'ai que legal!! eu amo música mas não sei fazer nada kk', timestamp: '20:17' },
    { author: 'lucas', content: 'posso te ensinar alguma coisa se quiser 👀', timestamp: '20:18' },
    { author: 'ana', content: 'com certeza sim!! mas me avisa, não noia sozinho haha', timestamp: '20:19' },
    { author: 'lucas', content: 'haha combinado. ei, você toparia sair de dia algum dia?', timestamp: '20:31' },
    { author: 'ana', content: '...', timestamp: '20:32' },
    { author: 'ana', content: 'sim 🌸', timestamp: '20:32' },
    { author: 'lucas', content: 'que bom 🥹', timestamp: '20:33' },
    { author: 'capy', content: '🐾 VAMO SI AMA!!', timestamp: '20:33' },
  ],
  'fruit-loops': [
    { author: 'lucas', content: 'então, o FL Studio tem esse conceito de "fruit loops" pra os samples', timestamp: '15:20' },
    { author: 'ana', content: 'fruit loops igual o cereal kkkk', timestamp: '15:21' },
    { author: 'lucas', content: 'exatamente KKKK', timestamp: '15:21' },
    { author: 'ana', content: 'eu to tentando fazer um beat mas ta ficando horrível hjdbsajdsa', timestamp: '15:35' },
    { author: 'lucas', content: 'manda aqui eu vejo', timestamp: '15:35' },
    { author: 'ana', content: '[beat_ana_v1.flp]', timestamp: '15:36' },
    { author: 'lucas', content: 'ESPERA ISSO TA MUITO BOM', timestamp: '15:37' },
    { author: 'ana', content: 'para mentira', timestamp: '15:37' },
    { author: 'lucas', content: 'juro! o hi-hat tá perfeito. você tem talento', timestamp: '15:38' },
    { author: 'ana', content: 'vai demais 🥺 obrigada', timestamp: '15:39' },
    { author: 'capy', content: '🎵 beat aprovado pela capivara', timestamp: '15:39' },
  ],
  'tibia-gg': [
    { author: 'lucas', content: 'ei, tô farmando em Venore, passa lá se quiser', timestamp: '22:05' },
    { author: 'ana', content: 'tô vindo!! char dela é mage tá', timestamp: '22:06' },
    { author: 'lucas', content: 'perfeito, eu tô de knight. você cura e eu tanko', timestamp: '22:07' },
    { author: 'ana', content: 'COMBINAÇÃO PERFEITA', timestamp: '22:08' },
    { author: 'lucas', content: '...igual a gente né', timestamp: '22:09' },
    { author: 'ana', content: '...', timestamp: '22:10' },
    { author: 'ana', content: '🥺🥺🥺', timestamp: '22:10' },
    { author: 'lucas', content: 'haha bora farmar', timestamp: '22:10' },
    { author: 'capy', content: '⚔ amor lvl 999 detected', timestamp: '22:11' },
  ],
  'gg-bot-lane': [
    { author: 'lucas', content: 'ei quer dualar bot lane? eu posso de suporte', timestamp: '19:00' },
    { author: 'ana', content: 'SIM! adoro adc. faz tempo que não jogo', timestamp: '19:01' },
    { author: 'lucas', content: 'bora! te protejo a partida inteira prometido', timestamp: '19:02' },
    { author: 'ana', content: 'kkkkk que pressão', timestamp: '19:02' },
    { author: 'lucas', content: 'GG EZ que duo hein', timestamp: '19:54' },
    { author: 'ana', content: 'SOMOS IMPARÁVEIS KKKK', timestamp: '19:54' },
    { author: 'lucas', content: 'duo games: ∞. losses: 0. gg forever', timestamp: '19:55' },
    { author: 'ana', content: '♡♡♡', timestamp: '19:55' },
    { author: 'capy', content: '🏆 VICTORY ROYALE (é de outro jogo mas tanto faz)', timestamp: '19:56' },
  ],
  'lofi-vibes': [
    { author: 'ana', content: 'ouvindo SORRY do Nemzzz no loopinho', timestamp: '01:30' },
    { author: 'lucas', content: 'que música boa', timestamp: '01:31' },
    { author: 'ana', content: 'combina muito com essa hora', timestamp: '01:31' },
    { author: 'lucas', content: 'combina com você também', timestamp: '01:32' },
    { author: 'ana', content: '...vai demais kk', timestamp: '01:32' },
    { author: 'lucas', content: 'é verdade haha', timestamp: '01:33' },
    { author: 'ana', content: 'to fazendo brownie quer?', timestamp: '01:45' },
    { author: 'lucas', content: 'SEMPRE quero brownie seu', timestamp: '01:45' },
    { author: 'capy', content: '🍫 capivara também quer brownie', timestamp: '01:46' },
  ],
  'vamo-si-ama': [
    { author: 'capy', content: '🎙 vamo-si-ama ativado', timestamp: '00:00' },
    { author: 'lucas', content: '🎙 Lucas entrou em voz', timestamp: '00:01' },
    { author: 'ana', content: '🎙 Ana entrou em voz', timestamp: '00:02' },
    { author: 'capy', content: '🐾 vamo si ama, desde sempre!!', timestamp: '00:03' },
    { author: 'ana', content: 'haha a capivara bot é demais kk', timestamp: '00:04' },
    { author: 'lucas', content: 'ela sabe das coisas', timestamp: '00:04' },
    { author: 'ana', content: 'vamo si ama mesmo 🥺', timestamp: '00:05' },
    { author: 'lucas', content: 'vamo si ama. sempre. ♡', timestamp: '00:05' },
    { author: 'capy', content: '🐾 ♡♡♡', timestamp: '00:05' },
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
    tooltip: 'fruit loops aficionado • tibia veteran • ama a ana demais',
  },
  capy: {
    name: 'Capivara Bot',
    color: '#1db954',
    dot: '#1db954',
    status: 'bot',
    avatar: '🐾',
    tooltip: 'vamo si ama!! • bot oficial do MeloVanzin',
  },
}

function Avatar({ author }: { author: 'ana' | 'lucas' | 'capy'; showTooltip?: boolean }) {
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
        style={{
          background: cfg.dot,
          borderColor: '#1e2124',
        }}
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
          {cfg.status === 'bot' && (
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
  const { setWorld } = useStore()

  const [activeChannel, setActiveChannel] = useState<Channel>('primeiro-contato')
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState<'ana' | 'lucas' | 'capy' | null>(null)
  const [msgIndex, setMsgIndex] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const allMessages = CHANNEL_MESSAGES[activeChannel]

  // Reset and replay messages when channel changes
  useEffect(() => {
    setVisibleMessages([])
    setMsgIndex(0)
    setIsTyping(null)
  }, [activeChannel])

  // Message reveal effect
  useEffect(() => {
    if (msgIndex >= allMessages.length) return

    const msg = allMessages[msgIndex]
    const delay = msgIndex === 0 ? 500 : 800

    const typingTimer = setTimeout(() => {
      setIsTyping(msg.author)
    }, delay - 400)

    const msgTimer = setTimeout(() => {
      setIsTyping(null)
      setVisibleMessages((prev) => [...prev, { ...msg, id: msgIndex }])
      setMsgIndex((i) => i + 1)
    }, delay)

    return () => {
      clearTimeout(typingTimer)
      clearTimeout(msgTimer)
    }
  }, [msgIndex, allMessages, activeChannel])

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
          {/* Back button */}
          <button
            onClick={() => setWorld('hub')}
            className="pixel-font text-left px-3 py-2 text-xs transition-colors hover:text-white"
            style={{ background: 'none', border: 'none', color: 'var(--tx3)', cursor: 'pointer', borderBottom: '1px solid #1e2124' }}
          >
            ← hub
          </button>

          {/* Server header */}
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

          {/* Pinned */}
          <div className="px-3 py-2" style={{ borderBottom: '1px solid #1e2124' }}>
            <div className="text-xs" style={{ color: 'var(--tx3)', fontFamily: 'JetBrains Mono, monospace' }}>
              📌 foi aqui que tudo começou 🫧
            </div>
          </div>

          {/* Channels */}
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
                  fontSize: '13px',
                  textAlign: 'left',
                  width: 'calc(100% - 8px)',
                }}
              >
                <span style={{ color: 'var(--tx3)' }}>{ch.icon}</span>
                <span>{ch.label}</span>
                {ch.unread && (
                  <span
                    className="ml-auto w-2 h-2 rounded-full"
                    style={{ background: 'var(--dc)', flexShrink: 0 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Users */}
          <div
            className="p-3 flex flex-col gap-2"
            style={{ borderTop: '1px solid #1e2124', background: '#292b2f' }}
          >
            <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--tx3)' }}>
              Online — 3
            </div>
            {(['ana', 'lucas', 'capy'] as const).map((u) => (
              <div key={u} className="flex items-center gap-2">
                <Avatar author={u} showTooltip />
                <div>
                  <div className="text-xs font-medium" style={{ color: AUTHOR_CONFIG[u].color }}>
                    {AUTHOR_CONFIG[u].name}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--tx3)' }}>
                    {AUTHOR_CONFIG[u].status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main chat */}
        <div className="flex-1 flex flex-col" style={{ background: '#36393f' }}>
          {/* Channel header */}
          <div
            className="flex items-center gap-2 px-4 py-3 shrink-0"
            style={{ borderBottom: '1px solid #1e2124', background: '#36393f' }}
          >
            <span style={{ color: 'var(--tx3)', fontSize: '16px' }}>
              {CHANNELS.find((c) => c.id === activeChannel)?.icon}
            </span>
            <span className="font-semibold text-white">
              {activeChannel}
            </span>
            <div className="ml-auto flex items-center gap-3">
              <div
                className="text-xs px-2 py-1 rounded"
                style={{
                  background: 'rgba(88,101,242,0.2)',
                  border: '1px solid rgba(88,101,242,0.4)',
                  color: 'var(--dc2)',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                MeloVanzin Server
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {/* Pinned banner */}
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
                  <Avatar author={msg.author} showTooltip />
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
                        className="text-xs"
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

          {/* Input (decorative) */}
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
