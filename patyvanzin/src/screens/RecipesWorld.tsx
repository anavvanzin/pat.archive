import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { pixelLoveAudio } from '../audio/pixelLoveAudio'

interface Recipe {
  id: string
  title: string
  category: 'doce' | 'salgado' | 'bebida'
  prepTime: string
  ingredients: { name: string; quantity: string; isSecret?: boolean }[]
  instructions: string[]
  icon: string
  color: string
}

const RECIPES: Recipe[] = [
  {
    id: 'mug_cake',
    title: 'Bolo de Caneca de Canela',
    category: 'doce',
    prepTime: '3 min',
    icon: '🧁',
    color: 'var(--pk2)',
    ingredients: [
      { name: 'Farinha de trigo', quantity: '4 colheres (sopa)' },
      { name: 'Açúcar demerara', quantity: '3 colheres (sopa)' },
      { name: 'Canela em pó', quantity: '1 colher (chá)' },
      { name: 'Fermento em pó', quantity: '1/2 colher (chá)' },
      { name: 'Leite morno', quantity: '3 colheres (sopa)' },
      { name: 'Manteiga derretida', quantity: '2 colheres (sopa)' },
      { name: 'Ovo inteiro', quantity: '1 unidade' },
      { name: 'Pitada de carinho e amor', quantity: '∞', isSecret: true },
    ],
    instructions: [
      'Em uma caneca grande, misture bem todos os ingredientes secos.',
      'Adicione o ovo, a manteiga derretida e o leite.',
      'Bata delicadamente com um garfo até obter uma massa lisa e homogênea.',
      'Leve ao micro-ondas em potência alta por 2 minutos (ele vai crescer bastante!).',
      'Retire com cuidado, salpique açúcar com canela por cima e sirva ainda quentinho.',
    ],
  },
  {
    id: 'skillet_pao_queijo',
    title: 'Pão de Queijo de Frigideira',
    category: 'salgado',
    prepTime: '6 min',
    icon: '🍳',
    color: 'var(--yl)',
    ingredients: [
      { name: 'Polvilho doce ou tapioca', quantity: '3 colheres (sopa)' },
      { name: 'Requeijão cremoso', quantity: '1 colher (sopa cheia)' },
      { name: 'Queijo muçarela ralado', quantity: '2 colheres (sopa)' },
      { name: 'Ovo inteiro', quantity: '1 unidade' },
      { name: 'Sal e orégano', quantity: 'a gosto' },
      { name: 'Calor do fogão e carinho', quantity: 'de sobra', isSecret: true },
    ],
    instructions: [
      'Em uma tigela pequena, bata o ovo com o requeijão usando um garfo.',
      'Adicione o polvilho (ou tapioca), o queijo ralado e uma pitada de sal.',
      'Mexa bem até virar uma massa fluida e uniforme.',
      'Aqueça uma frigideira antiaderente pequena em fogo baixo.',
      'Despeje a massa, tampe e deixe dourar por cerca de 3 minutos.',
      'Vire do outro lado, doure por mais 2 minutos e sirva quentinho e queijudo.',
    ],
  },
  {
    id: 'iced_coffee',
    title: 'Café Gelado Cremoso',
    category: 'bebida',
    prepTime: '4 min',
    icon: '☕',
    color: 'var(--lol)',
    ingredients: [
      { name: 'Café coado forte ou expresso', quantity: '1/2 xícara' },
      { name: 'Doce de leite cremoso', quantity: '1 colher (sopa)' },
      { name: 'Leite gelado de sua preferência', quantity: '1/2 xícara' },
      { name: 'Cubos de gelo', quantity: 'a gosto' },
      { name: 'Chantilly para finalizar', quantity: 'opcional' },
      { name: 'Pitada de magia doce', quantity: '1 porção', isSecret: true },
    ],
    instructions: [
      'Pegue um copo alto e decore as laterais internas com o doce de leite.',
      'Adicione os cubos de gelo até a metade do copo.',
      'Despeje o leite gelado.',
      'Lentamente, jogue o café morno/frio por cima para criar um efeito de camadas.',
      'Finalize com chantilly e uma pitada extra de canela se gostar.',
    ],
  },
]

export default function RecipesWorld() {
  const setWorld = useStore((s) => s.setWorld)
  const unlockEasterEgg = useStore((s) => s.unlockEasterEgg)
  const addNotification = useStore((s) => s.addNotification)
  const triggerHeartBurst = useStore((s) => s.triggerHeartBurst)
  const easterEggs = useStore((s) => s.easterEggs)

  const [activeTab, setActiveTab] = useState<'doce' | 'salgado' | 'bebida'>('doce')
  const [showSecretMsg, setShowSecretMsg] = useState(false)

  const handleBack = () => {
    pixelLoveAudio.playBlip()
    setWorld('hub')
  }

  const handleSecretIngredientClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    triggerHeartBurst(e.clientX, e.clientY)
    if (!easterEggs.includes('ingrediente_secreto')) {
      unlockEasterEgg('ingrediente_secreto')
      addNotification('🍳 Ingrediente Secreto: amor descoberto! ♡', '🍳')
      pixelLoveAudio.playBlip()
      setShowSecretMsg(true)
      setTimeout(() => setShowSecretMsg(false), 4000)
    } else {
      pixelLoveAudio.playBlip()
    }
  }

  const activeRecipe = RECIPES.find((r) => r.category === activeTab) || RECIPES[0]

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
        <div className="pixel-font text-2xs text-center animate-pulse" style={{ color: 'var(--yl)', textShadow: '0 0 8px var(--yl)' }}>
          🍳 LIVRO DE RECEITAS 🍳
        </div>
        <div className="pixel-font text-2xs text-transparent select-none">
          0/0
        </div>
      </div>

      {/* Main Area: Recipe Index Card */}
      <div className="flex-1 flex flex-col items-center justify-center py-4 relative z-10 overflow-hidden w-full max-w-lg mx-auto">
        
        {/* TABS SWITCHER */}
        <div className="flex gap-2 mb-3 w-full justify-center">
          {(['doce', 'salgado', 'bebida'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                pixelLoveAudio.playBlip()
                setActiveTab(cat)
              }}
              className={`pixel-font px-3 py-1.5 rounded-lg border text-3xs cursor-pointer transition-all ${
                activeTab === cat 
                  ? 'border-purple-600 text-white bg-purple-950/80 shadow-[0_0_12px_rgba(168,85,247,0.4)]' 
                  : 'border-transparent text-purple-400 bg-purple-950/20'
              }`}
            >
              {cat === 'doce' ? '🧁 doce' : cat === 'salgado' ? '🍳 salgado' : '☕ bebida'}
            </button>
          ))}
        </div>

        {/* Index Card Body */}
        <div 
          className="w-full bg-[#fdfaf2] text-neutral-800 rounded-xl p-4 sm:p-5 shadow-2xl flex flex-col gap-4 overflow-y-auto max-h-[70vh] border border-[#ebdcb9]"
          style={{
            boxShadow: '0 12px 32px rgba(0,0,0,0.4), inset 0 0 0 2px rgba(255,255,255,0.7)',
            fontFamily: 'monospace',
          }}
        >
          {/* Card Header Title */}
          <div className="flex items-center justify-between border-b-2 border-dashed border-[#ebdcb9] pb-3 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeRecipe.icon}</span>
              <div>
                <h2 className="pixel-font text-2xs sm:text-xs font-bold" style={{ color: '#2a0845' }}>
                  {activeRecipe.title}
                </h2>
                <div className="text-3xs text-neutral-400 font-bold uppercase tracking-wider mt-0.5">
                  Preparo: {activeRecipe.prepTime}
                </div>
              </div>
            </div>
          </div>

          {/* Card Content grid */}
          <div className="flex flex-col gap-4 text-xs">
            {/* Ingredients */}
            <div>
              <h3 className="font-bold text-neutral-800 mb-2 border-b border-[#ebdcb9] pb-1 uppercase tracking-wider text-2xs">
                Ingredientes
              </h3>
              <ul className="flex flex-col gap-1.5">
                {activeRecipe.ingredients.map((ing, i) => (
                  <li 
                    key={i} 
                    onClick={ing.isSecret ? handleSecretIngredientClick : undefined}
                    className={`flex justify-between items-center py-0.5 rounded px-1 transition-all ${
                      ing.isSecret 
                        ? 'cursor-pointer hover:bg-pink-100 hover:shadow-sm font-semibold select-none border border-dashed border-transparent hover:border-pink-300' 
                        : ''
                    }`}
                    style={ing.isSecret ? { color: 'var(--pk2)', textShadow: '0 0 4px rgba(244,63,94,0.1)' } : {}}
                  >
                    <span>
                      {ing.isSecret ? '✦ ' : '• '}
                      {ing.name}
                    </span>
                    <span className="text-neutral-500 font-bold">{ing.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="font-bold text-neutral-800 mb-2 border-b border-[#ebdcb9] pb-1 uppercase tracking-wider text-2xs">
                Modo de Preparo
              </h3>
              <ol className="flex flex-col gap-2.5">
                {activeRecipe.instructions.map((inst, i) => (
                  <li key={i} className="flex gap-2 align-top text-neutral-700 leading-relaxed">
                    <span className="font-bold text-[#2a0845] text-2xs shrink-0 mt-0.5">{i + 1}.</span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Secret notification message overlay */}
      <AnimatePresence>
        {showSecretMsg && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed z-50 pixel-font text-center px-4 py-3 rounded-lg"
            style={{
              bottom: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(22,0,42,0.97)',
              border: '1px solid var(--pu)',
              fontSize: '8px',
              color: 'var(--yl)',
            }}
          >
            🍳 Ingrediente Secreto Descoberto: amor é a resposta para tudo!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Instructions */}
      <div className="flex justify-center items-center shrink-0 z-10 pb-2">
        <div
          className="pixel-font text-3xs text-center uppercase tracking-wider"
          style={{ color: 'var(--tx3)' }}
        >
          Encontre os ingredientes secretos marcados com ✦
        </div>
      </div>
    </div>
  )
}
