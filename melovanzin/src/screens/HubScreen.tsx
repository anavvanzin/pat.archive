import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { StudioScreen } from '../studio/StudioScreen'
import { pixelLoveAudio } from '../audio/pixelLoveAudio'

// Importação das imagens reais
import patriciaPortrait from '../assets/patricia_portrait.png'
import patriciaStudio from '../assets/patricia_studio.jpg'
import patriciaDj from '../assets/patricia_dj.jpg'
import patriciaSelfie from '../assets/patricia_selfie.jpg'
import patriciaPainting from '../assets/patricia_painting.jpg'
import patriciaArtwork from '../assets/patricia_artwork.jpg'

// Interface de obras de arte
interface Work {
  id: string
  title: string
  year: string
  dimensions: string
  materials: string
  image: string
  available: boolean
  description: string
  details: string
  process: string
}

const WORKS: Work[] = [
  {
    id: '1',
    title: 'ICONOCRACIA I',
    year: '2025',
    dimensions: '80 x 60 cm',
    materials: 'Xilogravura e Tinta Acrílica sobre papel algodão',
    image: patriciaArtwork,
    available: true,
    description: 'Estudo sobre as formas da alegoria feminina na cultura jurídica.',
    details: 'Impressão manual com prensa de ateliê. Tons terrosos combinados com preto de impressão puro.',
    process: 'Iniciado a partir de matriz em madeira de pinho entalhada à mão, seguida por múltiplas camadas de tinta acrílica crua.'
  },
  {
    id: '2',
    title: 'PRESENÇA E CONTRASTE',
    year: '2025',
    dimensions: '100 x 100 cm',
    materials: 'Tinta acrílica e Carvão sobre tela',
    image: patriciaPainting,
    available: false,
    description: 'Investigação gestual de texturas de serigrafia e sobreposição de tinta.',
    details: 'Bordas desestruturadas e marcas fortes de carvão queimado.',
    process: 'Desenho rápido com carvão seguido de pinceladas agressivas inspiradas no ritmo acelerado de música industrial.'
  },
  {
    id: '3',
    title: 'ESTUDO DE CORPO E MATÉRIA',
    year: '2024',
    dimensions: '50 x 70 cm',
    materials: 'Serigrafia e Nanquim sobre papel antigo',
    image: patriciaStudio,
    available: true,
    description: 'Contraste entre luz natural e sombras espessas de tinta preta.',
    details: 'Pequenos desalinhamentos propositais gerados na tiragem manual.',
    process: 'Desenho direto na tela de serigrafia com emulsão sensível e impressão sobre papel creme antigo resgatado de encadernadoras.'
  }
]

export default function HubScreen() {
  const currentMode = useStore((s) => s.currentMode)
  const setMode = useStore((s) => s.setMode)
  const audioEnabled = useStore((s) => s.audioEnabled)
  const addNotification = useStore((s) => s.addNotification)
  const triggerHeartBurst = useStore((s) => s.triggerHeartBurst)

  // Referências para detectar scroll das seções
  const musicRef = useRef<HTMLDivElement>(null)
  const artRef = useRef<HTMLDivElement>(null)
  const tarotRef = useRef<HTMLDivElement>(null)
  const aboutRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)

  const [selectedWork, setSelectedWork] = useState<Work | null>(null)
  const [flippedCard, setFlippedCard] = useState<number | null>(null)
  const [mixerActive, setMixerActive] = useState(false)
  const [isPlayingSet, setIsPlayingSet] = useState<string | null>(null)

  // Detectar seção ativa para mudar a atmosfera de Ateliê (claro) para Pista (escuro)
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2

      if (musicRef.current && scrollPosition >= musicRef.current.offsetTop) {
        if (currentMode !== 'pista') {
          setMode('pista')
          addNotification('Atmosfera: Pista 🎧 Ambientação escura e vermelha', '🌙')
        }
      } else {
        if (currentMode !== 'atelie') {
          setMode('atelie')
          addNotification('Atmosfera: Ateliê 🎨 Papel cru e luz natural', '☀️')
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentMode, setMode, addNotification])

  // Scroll suave para as seções
  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Tocar um set curto
  const togglePlaySet = (setId: string) => {
    if (isPlayingSet === setId) {
      pixelLoveAudio.pauseMusic()
      setIsPlayingSet(null)
    } else {
      pixelLoveAudio.primeFromGesture()
      pixelLoveAudio.playMusic()
      setIsPlayingSet(setId)
      addNotification(`Tocando: Set ${setId}`, '🔊')
    }
  }

  return (
    <div className={`paper-noise min-h-screen ${currentMode === 'pista' ? 'mode-pista bg-[#0d0d0d] text-[#fdfbf7]' : 'mode-atelie bg-[#fdfbf7] text-[#0d0d0d]'}`}>
      
      {/* Navegação Fixa - Borda de Cartaz Colado */}
      <nav className="fixed top-0 left-0 w-full z-50 border-b-3 border-current bg-background py-4 px-6 flex justify-between items-center transition-colors duration-500 bg-opacity-95 backdrop-blur-md">
        <div className="font-title text-2xl tracking-tighter cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          P. VANZIN
        </div>
        <div className="flex gap-4 md:gap-8 font-title text-sm tracking-wider">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-[var(--amarelo)] cursor-pointer">INÍCIO</button>
          <button onClick={() => scrollTo(musicRef)} className="hover:text-[var(--vermelho)] cursor-pointer">MÚSICA</button>
          <button onClick={() => scrollTo(artRef)} className="hover:text-[var(--amarelo)] cursor-pointer">ARTE</button>
          <button onClick={() => scrollTo(tarotRef)} className="hover:text-[var(--vermelho)] cursor-pointer">TARÔ</button>
          <button onClick={() => scrollTo(aboutRef)} className="hover:text-[var(--amarelo)] cursor-pointer">SOBRE</button>
          <button onClick={() => scrollTo(contactRef)} className="hover:text-[var(--vermelho)] cursor-pointer">CONTATO</button>
        </div>
      </nav>

      {/* Espaçador da Navbar */}
      <div className="h-20" />

      {/* 1. SEÇÃO INÍCIO / MANIFESTO */}
      <header className="zine-container flex flex-col md:flex-row items-center justify-between py-16 md:py-24 gap-12 border-b-3 border-current">
        <div className="space-y-6 max-w-xl">
          <div className="inline-block border-2 border-current px-3 py-1 font-mono text-xs skew-punk">
            [ DIÁRIO DE ATELIÊ & FREQUÊNCIAS ]
          </div>
          <h2 className="font-title text-5xl md:text-7xl tracking-tighter leading-none">
            A CRIAÇÃO
            <br />
            ENTRE TINTA
            <br />
            E SOM.
          </h2>
          <p className="font-serif text-lg leading-relaxed opacity-90">
            Duas atmosferas conectadas por instinto. De dia, a matéria no ateliê sob a luz natural,
            gravações manuais e xilogravuras. De noite, a frequência na pista escura, equipamentos de som
            e a pulsação underground da música eletrônica.
          </p>
        </div>

        {/* Retrato Xilogravura */}
        <div className="relative w-72 h-96 border-4 border-current bg-current flex-shrink-0 group woodcut-container">
          <div className="w-full h-full overflow-hidden bg-[#fdfbf7] border-2 border-background">
            <img
              src={patriciaPortrait}
              alt="Patricia Portrait"
              className="w-full h-full object-cover woodcut-img"
              width={288}
              height={384}
            />
          </div>
          <div className="absolute bottom-4 left-4 bg-[#fdfbf7] text-[#0d0d0d] font-mono text-[9px] px-2 py-1 border border-[#0d0d0d]">
            GRAVURA Nº 02 / A ARTISTA
          </div>
        </div>
      </header>

      {/* 2. SEÇÃO MÚSICA & MIXER */}
      <section ref={musicRef} className="border-b-3 border-current relative">
        {/* Banner Serigrafia Punk */}
        <div className="bg-[#800c0c] text-[#fdfbf7] py-6 border-b-3 border-current overflow-hidden relative">
          <div className="absolute inset-0 texture-screen opacity-20" />
          <h3 className="font-title text-7xl md:text-9xl text-center tracking-tighter select-none font-bold uppercase overflow-hidden whitespace-nowrap">
            MAKE NOISE · INSTINTO · FREQUÊNCIA ·
          </h3>
        </div>

        <div className="zine-container py-16 space-y-16">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            <div className="max-w-md space-y-4">
              <h4 className="font-title text-4xl">SETS UNDERGROUND</h4>
              <p className="font-serif text-base leading-relaxed opacity-80">
                Frequências escuras, graves pesados e ritmos hipnóticos. Pesquisa sonora focada no Techno de Berlim,
                EBM e sonoridades industriais de garagem.
              </p>
              
              {/* Manifesto Curto */}
              <div className="border-2 border-current p-6 bg-[#0d0d0d] text-[#fdfbf7] desalinhado-1">
                <h5 className="font-title text-lg text-[#d49b00] mb-2">✦ SONORIDADE</h5>
                <p className="font-mono text-xs leading-relaxed opacity-95">
                  “O som é matéria-prima. Assim como a goiva corta a madeira da matriz de xilo, os beats cortam o ar da pista. É visceral, físico e sem concessões corporativas.”
                </p>
              </div>
            </div>

            {/* Agenda Punk */}
            <div className="flex-1 space-y-6">
              <h4 className="font-title text-4xl text-right md:text-left">AGENDA</h4>
              <div className="space-y-4">
                {[
                  { data: '24 AGO', club: 'CLUB SUBTERRÂNEO', cidade: 'FLORIANÓPOLIS', hora: '23H' },
                  { data: '05 SET', club: 'ATELIÊ CAOS', cidade: 'SÃO PAULO', hora: '22H' },
                  { data: '18 SET', club: 'GALERIA PUNK ZINE', cidade: 'CURITIBA', hora: '19H' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`border-3 border-current p-4 flex justify-between items-center transition-all ${
                      idx === 0 ? 'bg-[#800c0c] text-[#fdfbf7] desalinhado-2' : 'bg-transparent'
                    }`}
                  >
                    <div className="font-mono text-lg font-bold">{item.data}</div>
                    <div className="text-center font-title text-xl tracking-tight">{item.club}</div>
                    <div className="text-right font-mono text-xs">{item.cidade} <br /> {item.hora}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sets Integrados com Imagens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { id: 'SET 01', title: 'WOODCUT FREQUENCY', tags: 'TECHNO / INDUSTRIAL', img: patriciaDj },
              { id: 'SET 02', title: 'ATELIÊ DE MEIO-TOM', tags: 'EBM / SYNTH WAVE', img: patriciaStudio },
              { id: 'SET 03', title: 'PANTERA UNDERGROUND', tags: 'ACID / DARK BEATS', img: patriciaSelfie }
            ].map((set) => (
              <div key={set.id} className="border-3 border-current p-4 space-y-4 bg-background">
                <div className="aspect-video overflow-hidden border-2 border-current relative group woodcut-container">
                  <img src={set.img} alt={set.title} className="w-full h-full object-cover woodcut-img" />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => togglePlaySet(set.id)}
                      className="btn-punk bg-[#fdfbf7] text-[#0d0d0d] font-bold"
                    >
                      {isPlayingSet === set.id ? 'PAUSAR' : 'OUVIR'}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-title text-xl tracking-tight leading-none">{set.title}</h5>
                    <span className="font-mono text-[10px] opacity-75">{set.tags}</span>
                  </div>
                  <span className="font-mono text-xs text-[#d49b00] font-bold">{set.id}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Botão de abrir DAW Mixer / Sequenciador */}
          <div className="flex justify-center pt-6">
            <button
              onClick={() => {
                setMixerActive(!mixerActive)
                triggerHeartBurst(window.innerWidth / 2, window.innerHeight / 2)
              }}
              className="btn-punk text-xl px-12 py-6 border-3 border-current"
            >
              {mixerActive ? '✦ FECHAR MESA DE DJ' : '✦ INICIAR MESA DE DJ / SEQUENCER'}
            </button>
          </div>

          {/* Estúdio Embutido */}
          <AnimatePresence>
            {mixerActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border-3 border-current p-4 md:p-8 bg-[#0d0d0d] text-[#fdfbf7] desalinhado-1"
              >
                <StudioScreen onExit={() => setMixerActive(false)} onOpenWorld={() => {}} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 3. SEÇÃO ARTE & PROCESSO */}
      <section ref={artRef} className="bg-[#fdfbf7] text-[#0d0d0d] border-b-3 border-current py-16">
        <div className="zine-container space-y-16">
          <div className="flex justify-between items-end border-b-3 border-current pb-6">
            <h3 className="font-title text-5xl md:text-7xl tracking-tighter">OBRAS DE ATELIÊ</h3>
            <div className="font-mono text-xs text-right">[ XILOGRAVURA CONTEMPORÂNEA ]</div>
          </div>

          {/* Grade Irregular de Trabalhos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {WORKS.map((work, idx) => (
              <div
                key={work.id}
                onClick={() => setSelectedWork(work)}
                className={`border-3 border-current p-4 bg-[#fdfbf7] cursor-pointer transition-all hover:-translate-y-2 hover:shadow-lg ${
                  idx === 0 ? 'desalinhado-1 md:col-span-2' : idx === 1 ? 'desalinhado-2' : 'desalinhado-3'
                }`}
              >
                <div className="overflow-hidden border-2 border-current aspect-video md:aspect-[4/3] bg-white woodcut-container">
                  <img src={work.image} alt={work.title} className="w-full h-full object-cover woodcut-img" />
                </div>
                <div className="mt-4 flex justify-between items-end">
                  <div>
                    <h4 className="font-title text-2xl tracking-tight">{work.title}</h4>
                    <p className="font-mono text-xs opacity-75">{work.materials}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-[#800c0c]">{work.year}</span>
                    <br />
                    <span className="font-mono text-[9px] bg-[#0d0d0d] text-[#fdfbf7] px-1">
                      {work.available ? 'DISPONÍVEL' : 'COLEÇÃO PRIVADA'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Seção Processo Humanizado */}
          <div className="border-3 border-current p-8 bg-[#fdfbf7] flex flex-col md:flex-row gap-12 items-center desalinhado-2">
            <div className="relative w-64 h-64 border-2 border-current overflow-hidden woodcut-container flex-shrink-0">
              <img src={patriciaStudio} alt="Ateliê Processo" className="w-full h-full object-cover woodcut-img" />
            </div>
            <div className="space-y-4">
              <h4 className="font-title text-3xl">O PROCESSO ANALÓGICO</h4>
              <p className="font-serif text-base leading-relaxed opacity-95">
                Em nosso estúdio, criamos usando prensa manual, goivas de aço e papel de algodão.
                Não há automações digitais no ateliê. Cada imperfeição, cada desalinhamento proposital de tinta
                e cada mancha de serigrafia é documentada como parte da obra. O erro humano é o gesto da presença.
              </p>
              <div className="flex gap-4 font-mono text-xs font-bold text-[#800c0c]">
                <span>[ MATRIZ DE PINHO ]</span>
                <span>[ PRENSA MANUAL ]</span>
                <span>[ NANQUIM PURO ]</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AS TRÊS CARTAS DE TARÔ */}
      <section ref={tarotRef} className="py-16 border-b-3 border-current relative bg-background">
        <div className="absolute inset-0 texture-lines opacity-10 pointer-events-none" />
        <div className="zine-container space-y-12 relative z-10">
          <div className="text-center space-y-3">
            <h3 className="font-title text-4xl md:text-5xl">MÍTICA DA CRIAÇÃO</h3>
            <p className="font-mono text-xs tracking-wider opacity-75">TOCAR NAS CARTAS PARA REVELAR OS SEGREDOS</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* CARTA I — A DJ */}
            <div
              onClick={() => setFlippedCard(flippedCard === 1 ? null : 1)}
              className="taro-card cursor-pointer min-h-[360px] flex flex-col justify-between animate-taro-glow"
            >
              <AnimatePresence mode="wait">
                {flippedCard !== 1 ? (
                  <motion.div
                    key="back"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-between py-6"
                  >
                    <div className="font-mono text-xs">CARTA I</div>
                    <div className="font-title text-4xl my-12 text-center text-[#800c0c]">A DJ</div>
                    <div className="font-serif text-[11px] opacity-70">INTUIÇÃO & FREQUÊNCIA</div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="front"
                    initial={{ opacity: 0, rotateY: 90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: -90 }}
                    className="h-full flex flex-col justify-between py-2 space-y-4"
                  >
                    <div className="font-mono text-xs text-[#d49b00] font-bold">CARTA I — ARCANA</div>
                    <p className="font-serif text-sm leading-relaxed opacity-95">
                      <strong>Ritmo e Transformação:</strong> Ela controla a onda sonora na escuridão.
                      A DJ é a sacerdotisa do subwoofer, guiando o transe coletivo através do contraste de graves
                      e texturas rústicas na pista underground.
                    </p>
                    <div className="font-mono text-[9px] text-[#800c0c]">[ FECHAR CARTA ]</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CARTA II — A ARTISTA */}
            <div
              onClick={() => setFlippedCard(flippedCard === 2 ? null : 2)}
              className="taro-card cursor-pointer min-h-[360px] flex flex-col justify-between animate-taro-glow"
            >
              <AnimatePresence mode="wait">
                {flippedCard !== 2 ? (
                  <motion.div
                    key="back"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-between py-6"
                  >
                    <div className="font-mono text-xs">CARTA II</div>
                    <div className="font-title text-4xl my-12 text-center text-[#d49b00]">A ARTISTA</div>
                    <div className="font-serif text-[11px] opacity-70">MATÉRIA & PERMANÊNCIA</div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="front"
                    initial={{ opacity: 0, rotateY: 90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: -90 }}
                    className="h-full flex flex-col justify-between py-2 space-y-4"
                  >
                    <div className="font-mono text-xs text-[#d49b00] font-bold">CARTA II — ARCANA</div>
                    <p className="font-serif text-sm leading-relaxed opacity-95">
                      <strong>Gesto e Permanência:</strong> Ela rasga a madeira e pinta a tela.
                      A Artista trabalha com a materialidade do mundo: tinta acrílica pura, carvão
                      e gravura manual que persistem contra o efêmero digital.
                    </p>
                    <div className="font-mono text-[9px] text-[#800c0c]">[ FECHAR CARTA ]</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CARTA III — A PANTERA */}
            <div
              onClick={() => {
                setFlippedCard(flippedCard === 3 ? null : 3)
                triggerHeartBurst(window.innerWidth / 2, window.innerHeight / 2)
              }}
              className="taro-card cursor-pointer min-h-[360px] flex flex-col justify-between animate-taro-glow"
            >
              <AnimatePresence mode="wait">
                {flippedCard !== 3 ? (
                  <motion.div
                    key="back"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-between py-6"
                  >
                    <div className="font-mono text-xs">CARTA III</div>
                    <div className="font-title text-4xl my-12 text-center text-current">A PANTERA</div>
                    <div className="font-serif text-[11px] opacity-70">INSTINTO & PRESENÇA</div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="front"
                    initial={{ opacity: 0, rotateY: 90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: -90 }}
                    className="h-full flex flex-col justify-between py-2 space-y-4"
                  >
                    <div className="font-mono text-xs text-[#d49b00] font-bold">CARTA III — SÍMBOLO</div>
                    <p className="font-serif text-sm leading-relaxed opacity-95">
                      <strong>Independência e Silêncio:</strong> A pantera é a nossa guardiã.
                      Ela não se explica, ela observa. Simboliza a força do ateliê silencioso e a presença
                      inabalável diante das frequências intensas da noite.
                    </p>
                    <div className="font-mono text-[9px] text-[#800c0c]">[ FECHAR CARTA ]</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PÁGINA SOBRE */}
      <section ref={aboutRef} className="py-16 border-b-3 border-current bg-background">
        <div className="zine-container flex flex-col md:flex-row gap-12 items-center">
          {/* Selfie tratada */}
          <div className="w-64 h-80 border-3 border-current bg-current flex-shrink-0 woodcut-container relative">
            <img src={patriciaSelfie} alt="Patricia Selfie" className="w-full h-full object-cover woodcut-img" width={256} height={320} />
          </div>

          <div className="space-y-6">
            <h3 className="font-title text-4xl md:text-5xl">PATRÍCIA VANZIN</h3>
            <blockquote className="font-serif text-xl italic border-l-4 border-[#800c0c] pl-6 leading-relaxed">
              “Entre tinta e frequência, ela constrói imagens e atmosferas. Seu trabalho atravessa pintura, cultura underground e música eletrônica, sempre guiado por contraste, instinto e presença.”
            </blockquote>
            
            {/* Linha do Tempo */}
            <div className="space-y-3 pt-4">
              <h4 className="font-mono text-xs font-bold text-[#d49b00]">[ LINHA DO TEMPO RECENTE ]</h4>
              <ul className="font-mono text-xs space-y-2 opacity-90">
                <li><strong>2025</strong> — Exposições de gravura "Iconocracia", Galeria UFSC, SC.</li>
                <li><strong>2025</strong> — DJ Sets gravados para plataformas internacionais de música eletrônica.</li>
                <li><strong>2024</strong> — Intervenções visuais e sets ao vivo no Festival Ruído Subterrâneo.</li>
                <li><strong>2023</strong> — Residência artística focada em serigrafia punk, Berlim, Alemanha.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CONTATO & BOOKINGS */}
      <section ref={contactRef} className="py-20 bg-[#0d0d0d] text-[#fdfbf7] relative">
        <div className="absolute inset-0 texture-screen opacity-10 pointer-events-none" />
        <div className="zine-container text-center space-y-10 relative z-10">
          
          <div className="space-y-3">
            <h3 className="font-title text-5xl md:text-7xl tracking-tighter">CONTATO & BOOKINGS</h3>
            <p className="font-serif text-lg opacity-85">PARA BOOKINGS, EXPOSIÇÕES E COLABORAÇÕES</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 pt-4">
            <a href="mailto:contato@patriciavanzin.art" className="btn-punk bg-[#fdfbf7] text-[#0d0d0d] hover:bg-[#800c0c] hover:text-[#fdfbf7] text-lg">
              E-MAIL
            </a>
            <a href="https://instagram.com/" target="_blank" rel="noreferrer" className="btn-punk bg-[#fdfbf7] text-[#0d0d0d] hover:bg-[#d49b00] hover:text-[#0d0d0d] text-lg">
              INSTAGRAM
            </a>
            <a href="https://soundcloud.com/" target="_blank" rel="noreferrer" className="btn-punk bg-[#fdfbf7] text-[#0d0d0d] hover:bg-[#800c0c] hover:text-[#fdfbf7] text-lg">
              SOUNDCLOUD
            </a>
            <a href="https://spotify.com/" target="_blank" rel="noreferrer" className="btn-punk bg-[#fdfbf7] text-[#0d0d0d] hover:bg-[#d49b00] hover:text-[#0d0d0d] text-lg">
              SPOTIFY
            </a>
          </div>

          {/* Press Kit Download */}
          <div className="pt-8">
            <button
              onClick={() => {
                addNotification('Baixando Press Kit…', '📥')
                triggerHeartBurst(window.innerWidth / 2, window.innerHeight / 2)
              }}
              className="font-mono text-xs border border-current px-4 py-2 hover:bg-[#fdfbf7] hover:text-[#0d0d0d] transition-colors"
            >
              [ BAIXAR PRESS KIT COMPLETO (PDF) ]
            </button>
          </div>
        </div>
      </section>

      {/* MODAL DE OBRAS */}
      <AnimatePresence>
        {selectedWork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-90 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#fdfbf7] text-[#0d0d0d] border-4 border-[#0d0d0d] max-w-3xl w-full p-6 space-y-6 relative desalinhado-1"
            >
              <button
                onClick={() => setSelectedWork(null)}
                className="absolute top-4 right-4 font-title text-xl font-bold cursor-pointer hover:text-[#800c0c]"
                aria-label="Fechar detalhes da obra"
              >
                [ X ]
              </button>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2 border-2 border-current overflow-hidden woodcut-container bg-white">
                  <img src={selectedWork.image} alt={selectedWork.title} className="w-full h-full object-cover" width={320} height={240} />
                </div>
                <div className="space-y-4 md:w-1/2 flex flex-col justify-between">
                  <div>
                    <h3 className="font-title text-3xl tracking-tight leading-none">{selectedWork.title}</h3>
                    <span className="font-mono text-xs text-[#800c0c] font-bold">{selectedWork.year}</span>
                    <hr className="my-2 border-current" />
                    
                    <p className="font-serif text-sm leading-relaxed">{selectedWork.description}</p>
                    
                    <div className="space-y-1 pt-2 font-mono text-[11px] opacity-90">
                      <div><strong>Dimensões:</strong> {selectedWork.dimensions}</div>
                      <div><strong>Materiais:</strong> {selectedWork.materials}</div>
                    </div>
                  </div>

                  <div className="bg-[#f2efe9] p-3 border border-current space-y-2 text-[11px]">
                    <div className="font-mono font-bold text-[#d49b00]">[ PROCESSO DO ATELIÊ ]</div>
                    <p className="font-serif italic leading-snug">{selectedWork.process}</p>
                  </div>

                  <div>
                    <span className="font-mono text-xs bg-current text-white px-2 py-1">
                      {selectedWork.available ? 'DISPONÍVEL PARA AQUISIÇÃO' : 'COLEÇÃO PRIVADA'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
