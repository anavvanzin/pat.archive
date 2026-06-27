/**
 * Arcanos do Limiar — Tarot Interativo 2D Canvas
 * Motor de jogo customizado para leitura de cartas de tarô de Patricia
 */

(function () {
  // Lista de 15 Arcanos com suas descrições místico-poéticas
  const TAROT_DECK = [
    {
      id: 'fool',
      num: '00',
      title: 'O Louco',
      img: 'assets/card-fool.png',
      meta: 'salto · início',
      desc: 'O início, o salto, o risco de ser livre. Não é falta de juízo, é a coragem de começar do zero sem saber onde o terreno termina.'
    },
    {
      id: 'thedj',
      num: 'I',
      title: 'O DJ',
      img: 'assets/card-thedj.png',
      meta: 'frequência · controle',
      desc: 'O regente das frequências, o controle da tension. Ele manipula o tempo e a percepção na pista, lembrando que você escolhe a próxima transição.'
    },
    {
      id: 'priestess',
      num: 'II',
      title: 'A Sacerdotisa',
      img: 'assets/card-priestess.png',
      meta: 'limiar · mistério',
      desc: 'O véu, o saber silencioso, o limiar. O convite é para parar e ouvir a intuição que o barulho da pista geralmente silencia.'
    },
    {
      id: 'empress',
      num: 'III',
      title: 'A Imperatriz',
      img: 'assets/card-empress.png',
      meta: 'criação · matéria',
      desc: 'A criação abundante, a matéria viva, a força do ateliê. A fertilidade não é passiva; é o ato de dar forma e textura às ideias brutas.'
    },
    {
      id: 'hierophant',
      num: 'V',
      title: 'O Hierofante',
      img: 'assets/card-hierophant.png',
      meta: 'estrutura · ritual',
      desc: 'A tradição, os rituais antigos, a estrutura invisível. A ordem que protege o caos. O respeito à linhagem e à técnica que precedem o ruído.'
    },
    {
      id: 'lovers',
      num: 'VI',
      title: 'Os Namorados',
      img: 'assets/card-lovers.png',
      meta: 'bifurcação · sintonia',
      desc: 'A escolha, a bifurcação das frequências. A sintonia fina entre o ateliê e a pista, onde cada atração exige um sacrifício de caminho.'
    },
    {
      id: 'wheel',
      num: 'X',
      title: 'A Roda da Fortuna',
      img: 'assets/card-wheel.png',
      meta: 'loop · compasso',
      desc: 'O loop, o compasso que gira sem parar. Altas frequências, baixas frequências. Nada é estático; aprenda a dançar tanto na subida quanto na queda.'
    },
    {
      id: 'justice',
      num: 'XI',
      title: 'A Justiça',
      img: 'assets/card-justice.png',
      meta: 'corte · precisão',
      desc: 'A precisão do corte, o equilíbrio estrito. A verdade crua despida de ornamentos. O peso exato de cada escolha no layout ou na mixagem.'
    },
    {
      id: 'death',
      num: 'XIII',
      title: 'A Morte',
      img: 'assets/card-death.png',
      meta: 'transformação · fim/início',
      desc: 'A transformação, o fechamento de ciclo. Nada acaba de verdade; a forma apenas se desfaz para algo novo poder emergir.'
    },
    {
      id: 'tower',
      num: 'XVI',
      title: 'A Torre',
      img: 'assets/card-tower.png',
      meta: 'ruptura · purificação',
      desc: 'A queda necessária. Tudo o que foi construído sobre bases falsas precisa ruir para que o espaço respire novamente.'
    },
    {
      id: 'star',
      num: 'XVII',
      title: 'A Estrela',
      img: 'assets/card-star.png',
      meta: 'lampejo · clareza',
      desc: 'A esperança fria, a luz distante que guia o fim da noite. Um lampejo de clareza em meio à neblina da pista. O prenúncio do amanhecer.'
    },
    {
      id: 'moon',
      num: 'XVIII',
      title: 'A Lua',
      img: 'assets/card-moon.png',
      meta: 'sombra · reflexo',
      desc: 'O inconsciente, os medos, os reflexos que brilham no escuro. A verdade não está na superfície, mas na sombra que ela projeta.'
    },
    {
      id: 'sun',
      num: 'XIX',
      title: 'O Sol',
      img: 'assets/card-sun.png',
      meta: 'exposição · energia',
      desc: 'A clareza absoluta, o calor da exposição. A luz que revela todos os segredos do ateliê e dissipa as ilusões da noite. A energia pura do fazer.'
    },
    {
      id: 'world',
      num: 'XXI',
      title: 'O Mundo',
      img: 'assets/card-world.png',
      meta: 'integração · totalidade',
      desc: 'A integração total, a faixa perfeitamente mixada. A fusão do ateliê e da pista. O ciclo completo onde tudo faz sentido e se resolve.'
    },
    {
      id: 'panther',
      num: 'Especial',
      title: 'A Pantera',
      img: 'assets/card-panther.png',
      meta: 'silêncio · instinto',
      desc: 'O silêncio à espreita, a presença vigilante. Ela se move nas sombras sem deixar rastros, ensinando a agir com precisão, instinto e mistério absoluto.'
    }
  ];

  // Configurações Globais do Canvas
  let canvas, ctx;
  let audioCtx = null;
  let currentSpreadMode = '1'; // '1' ou '3'
  let cardsInPlay = [];
  let particles = [];
  let assetsLoaded = false;
  const imagesCache = {};

  // Tokens de Cor Dinâmicos (Lidos do CSS)
  let colors = {
    ink: '#0E0B0A',
    paper: '#F2EAD9',
    blood: '#B5221A',
    gold: '#C79A4B',
    soft: '#b5ab98',
    line: '#2a221c'
  };

  // Pré-carregar imagens
  function loadAssets(callback) {
    let loadedCount = 0;
    const totalImages = TAROT_DECK.length;

    TAROT_DECK.forEach(card => {
      const img = new Image();
      img.src = card.img;
      img.onload = () => {
        imagesCache[card.id] = img;
        loadedCount++;
        if (loadedCount === totalImages) {
          assetsLoaded = true;
          if (callback) callback();
        }
      };
      img.onerror = () => {
        console.warn(`Erro ao carregar imagem: ${card.img}`);
        loadedCount++;
        if (loadedCount === totalImages) {
          assetsLoaded = true;
          if (callback) callback();
        }
      };
    });
  }

  // Atualizar Paleta de Cores baseado no tema atual da página
  function updatePalette() {
    const isLight = document.body.classList.contains('light-theme');
    if (isLight) {
      colors.ink = '#F2EAD9';    // Fundo creme
      colors.paper = '#0E0B0A';  // Elementos escuros
      colors.blood = '#9B2C1C';  // Vermelho escuro
      colors.gold = '#9C7C3D';   // Ouro escuro
      colors.soft = '#4a423a';
      colors.line = '#d8cfba';
    } else {
      colors.ink = '#0E0B0A';    // Fundo preto
      colors.paper = '#F2EAD9';  // Elementos claros
      colors.blood = '#B5221A';  // Vermelho vivo
      colors.gold = '#C79A4B';   // Ouro
      colors.soft = '#8a8174';
      colors.line = '#2a221c';
    }
  }

  // Web Audio API Synthesizer
  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playFrictionSound() {
    if (!audioCtx) return;
    try {
      const bufferSize = audioCtx.sampleRate * 0.15; // 150ms
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Gerar ruído rústico (papel se movendo)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = audioCtx.createBufferSource();
      noiseNode.buffer = buffer;

      // Filtro para dar textura áspera e opaca
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, audioCtx.currentTime);
      filter.Q.setValueAtTime(1.5, audioCtx.currentTime);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      noiseNode.start();
    } catch (e) {
      console.log('Audio error:', e);
    }
  }

  function playRevealSound() {
    if (!audioCtx) return;
    try {
      // Sub-grave atmosférico
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(75, audioCtx.currentTime); // 75Hz grave
      osc.frequency.exponentialRampToValueAtTime(55, audioCtx.currentTime + 0.6); // cai para 55Hz

      // Som estridente secundário para brilho místico/metálico
      const oscHigh = audioCtx.createOscillator();
      const gainHigh = audioCtx.createGain();
      oscHigh.type = 'sine';
      oscHigh.frequency.setValueAtTime(320, audioCtx.currentTime);
      oscHigh.frequency.exponentialRampToValueAtTime(180, audioCtx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

      gainHigh.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainHigh.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      oscHigh.connect(gainHigh);
      gainHigh.connect(audioCtx.destination);

      osc.start();
      oscHigh.start();
      osc.stop(audioCtx.currentTime + 0.81);
      oscHigh.stop(audioCtx.currentTime + 0.41);
    } catch (e) {
      console.log('Audio error:', e);
    }
  }

  // Classe Carta para controle físico no Canvas 2D
  class VirtualCard {
    constructor(deckIndex, x, y, delay = 0) {
      this.deckIndex = deckIndex;
      this.cardData = TAROT_DECK[deckIndex];
      this.x = x;
      this.y = y;
      this.targetX = x;
      this.targetY = y;
      this.width = 120;
      this.height = 200;
      this.angle = 0;
      this.targetAngle = 0;
      this.scaleX = 1;
      
      // Estado de revelação
      this.isFlipped = false;
      this.flipProgress = 0; // 0 (verso) a 1 (frente)
      this.isRevealed = false;
      this.delay = delay; // Atraso para entrar na mesa
      
      this.isHovered = false;
    }

    update(dt) {
      if (this.delay > 0) {
        this.delay -= dt * 1000;
        return;
      }

      // Interpolação suave de posição (lerp)
      const ease = 0.15;
      this.x += (this.targetX - this.x) * ease;
      this.y += (this.targetY - this.y) * ease;
      this.angle += (this.targetAngle - this.angle) * ease;

      // Animação de virar a carta
      if (this.isFlipped && this.flipProgress < 1) {
        const prevProgress = this.flipProgress;
        this.flipProgress += dt * 3.5; // Velocidade do flip
        if (this.flipProgress >= 1) {
          this.flipProgress = 1;
          this.isRevealed = true;
          triggerCardSelectionText(this);
        }
        
        // Som de revelação no meio do flip
        if (prevProgress < 0.5 && this.flipProgress >= 0.5) {
          playRevealSound();
          spawnDustParticles(this.x, this.y);
        }
      }

      // Escala X para simular flip 3D em 2D
      // Usamos Math.cos para girar a carta
      if (this.isFlipped) {
        // Gira de 180 a 0 (ou seja, de verso para frente)
        // flipProgress vai de 0 a 1
        const rotAngle = (1 - this.flipProgress) * Math.PI;
        this.scaleX = Math.cos(rotAngle);
      } else {
        this.scaleX = 1;
      }
    }

    draw() {
      if (this.delay > 0) return;

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.scale(this.scaleX, 1);

      // Sombra rústica
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(-this.width / 2 + 5, -this.height / 2 + 5, this.width, this.height);

      const halfW = this.width / 2;
      const halfH = this.height / 2;

      // Determinar se desenha frente ou verso
      const showingFront = (!this.isFlipped) ? false : (this.flipProgress >= 0.5);

      if (showingFront) {
        // --- DESENHAR FRENTE ---
        // Desenha a imagem se carregada, senão fallback rústico
        const img = imagesCache[this.cardData.id];
        if (assetsLoaded && img) {
          // Inverter horizontalmente se a rotação exigir (para manter imagem correta)
          if (this.scaleX < 0) {
            ctx.scale(-1, 1);
          }
          ctx.drawImage(img, -halfW, -halfH, this.width, this.height);
          
          // Borda preta estilo moldura de madeira
          ctx.strokeStyle = colors.paper; // papel é a cor de contorno/detalhes no modo Pista, ou ink no Ateliê
          ctx.lineWidth = 4;
          ctx.strokeRect(-halfW + 2, -halfH + 2, this.width - 4, this.height - 4);
        } else {
          // Fallback procedimental da frente da carta
          ctx.fillStyle = colors.paper;
          ctx.fillRect(-halfW, -halfH, this.width, this.height);

          ctx.strokeStyle = colors.ink;
          ctx.lineWidth = 3;
          ctx.strokeRect(-halfW + 5, -halfH + 5, this.width - 10, this.height - 10);

          // Texto improvisado
          ctx.fillStyle = colors.blood;
          ctx.font = 'bold 12px "Oswald", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(this.cardData.num, 0, -halfH + 30);

          ctx.fillStyle = colors.ink;
          ctx.font = '14px "Cormorant Garamond", serif';
          ctx.fillText(this.cardData.title, 0, 10);
        }
      } else {
        // --- DESENHAR VERSO (Estilo Xilogravura Rústico) ---
        ctx.fillStyle = colors.ink; // Fundo da mesa/carta
        ctx.fillRect(-halfW, -halfH, this.width, this.height);

        // Borda creme do papel
        ctx.strokeStyle = colors.paper;
        ctx.lineWidth = 3;
        ctx.strokeRect(-halfW + 6, -halfH + 6, this.width - 12, this.height - 12);

        // Linha secundária vermelha ou dourada
        ctx.strokeStyle = colors.blood;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-halfW + 11, -halfH + 11, this.width - 22, this.height - 22);

        // Desenhar um símbolo místico no centro (cruz geométrica e pontas)
        ctx.strokeStyle = colors.gold;
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Linha vertical central
        ctx.moveTo(0, -halfH + 30);
        ctx.lineTo(0, halfH - 30);
        // Linha horizontal central
        ctx.moveTo(-halfW + 25, 0);
        ctx.lineTo(halfW - 25, 0);
        ctx.stroke();

        // Losango central
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(20, 0);
        ctx.lineTo(0, 20);
        ctx.lineTo(-20, 0);
        ctx.closePath();
        ctx.fillStyle = colors.ink;
        ctx.fill();
        ctx.stroke();

        // Pequeno círculo vermelho no centro
        ctx.fillStyle = colors.blood;
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();

        // Cantos marcados
        ctx.strokeStyle = colors.paper;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        // Canto superior esquerdo
        ctx.moveTo(-halfW + 18, -halfH + 18);
        ctx.lineTo(-halfW + 28, -halfH + 18);
        ctx.moveTo(-halfW + 18, -halfH + 18);
        ctx.lineTo(-halfW + 18, -halfH + 28);
        // Canto superior direito
        ctx.moveTo(halfW - 18, -halfH + 18);
        ctx.lineTo(halfW - 28, -halfH + 18);
        ctx.moveTo(halfW - 18, -halfH + 18);
        ctx.lineTo(halfW - 18, -halfH + 28);
        // Canto inferior esquerdo
        ctx.moveTo(-halfW + 18, halfH - 18);
        ctx.lineTo(-halfW + 28, halfH - 18);
        ctx.moveTo(-halfW + 18, halfH - 18);
        ctx.lineTo(-halfW + 18, halfH - 28);
        // Canto inferior direito
        ctx.moveTo(halfW - 18, halfH - 18);
        ctx.lineTo(halfW - 28, halfH - 18);
        ctx.moveTo(halfW - 18, halfH - 18);
        ctx.lineTo(halfW - 18, halfH - 28);
        ctx.stroke();
      }

      // Efeito de hover (brilho sutil no contorno)
      if (this.isHovered && !this.isFlipped) {
        ctx.strokeStyle = colors.gold;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-halfW - 1, -halfH - 1, this.width + 2, this.height + 2);
      }

      ctx.restore();
    }

    containsPoint(px, py) {
      // Ajusta para o atraso de surgimento
      if (this.delay > 0) return false;
      return (
        px >= this.x - this.width / 2 &&
        px <= this.x + this.width / 2 &&
        py >= this.y - this.height / 2 &&
        py <= this.y + this.height / 2
      );
    }
  }

  // Partículas rústicas de poeira de madeira
  class DustParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.5 + 1;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 0.5; // leve subida
      this.size = Math.random() * 3 + 1.5;
      this.life = 1.0;
      this.decay = Math.random() * 0.03 + 0.015;
      this.color = Math.random() > 0.4 ? colors.blood : colors.gold;
    }

    update(dt) {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.05; // gravidade fraca
      this.life -= this.decay;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.life;
      ctx.fillStyle = this.color;
      // partículas rústicas quadradas (estilo aparas de madeira/xilo)
      ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  function spawnDustParticles(x, y) {
    for (let i = 0; i < 20; i++) {
      particles.push(new DustParticle(x, y));
    }
  }

  // Embaralhar baralho (Fisher-Yates)
  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Preparar Tiragem no Canvas
  function setupSpread() {
    cardsInPlay = [];
    particles = [];
    
    // Esconder painel de texto
    const resultPanel = document.getElementById('oraculo-leitura');
    if (resultPanel) {
      resultPanel.innerHTML = '<p class="reading-hint">Respire fundo, faça sua pergunta e vire as cartas reveladas...</p>';
    }

    // Embaralhar índices do deck completo
    const deckIndices = shuffleArray(TAROT_DECK.keys());
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    if (currentSpreadMode === '1') {
      // 1 Carta - Centralizada
      const index = deckIndices[0];
      const card = new VirtualCard(index, centerX, centerY, 100);
      // Posição inicial fora da tela para deslizar
      card.x = centerX;
      card.y = -150;
      cardsInPlay.push(card);
    } else {
      // 3 Cartas - Ateliê, Limiar, Pista
      const space = 180;
      const xPositions = [centerX - space, centerX, centerX + space];
      
      for (let i = 0; i < 3; i++) {
        const index = deckIndices[i];
        const card = new VirtualCard(index, xPositions[i], centerY, i * 150 + 100);
        card.x = centerX;
        card.y = canvas.height + 150; // Vem de baixo
        cardsInPlay.push(card);
      }
    }

    playFrictionSound();
  }

  // Evento ao clicar em uma carta
  function handleCanvasClick(e) {
    initAudio();

    const rect = canvas.getBoundingClientRect();
    // Converter coordenadas físicas do clique para lógicas do Canvas
    const px = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const py = ((e.clientY - rect.top) / rect.height) * canvas.height;

    for (let card of cardsInPlay) {
      if (card.containsPoint(px, py) && !card.isFlipped) {
        card.isFlipped = true;
        card.targetAngle = (Math.random() * 0.08 - 0.04); // leve rotação randômica ao revelar
        break;
      }
    }
  }

  // Evento hover do mouse
  function handleCanvasMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const py = ((e.clientY - rect.top) / rect.height) * canvas.height;

    let anyHovered = false;
    for (let card of cardsInPlay) {
      const hoverState = card.containsPoint(px, py);
      if (hoverState !== card.isHovered) {
        card.isHovered = hoverState;
        if (hoverState && !card.isFlipped) {
          playFrictionSound();
        }
      }
      if (hoverState && !card.isFlipped) {
        anyHovered = true;
      }
    }

    // Mudar cursor se estiver sobre carta fechada
    canvas.style.cursor = anyHovered ? 'pointer' : 'default';
  }

  // Exibir a interpretação de leitura abaixo do Canvas
  function triggerCardSelectionText() {
    const resultPanel = document.getElementById('oraculo-leitura');
    if (!resultPanel) return;

    // Se for tiragem de 1 carta
    if (currentSpreadMode === '1') {
      const card = cardsInPlay[0];
      if (card && card.isRevealed) {
        resultPanel.innerHTML = `
          <div class="reading-result single-reading fade-in">
            <div class="reading-card-header">
              <span class="reading-card-num">${card.cardData.num}</span>
              <h3>${card.cardData.title}</h3>
              <span class="reading-card-meta">${card.cardData.meta}</span>
            </div>
            <p class="reading-card-desc">"${card.cardData.desc}"</p>
          </div>
        `;
      }
    } else {
      // Tiragem de 3 cartas (Ateliê · Limiar · Pista)
      const positions = ['Ateliê (Raiz / De onde você vem)', 'Limiar (O Momento / Onde você está)', 'Pista (Fluxo / Para onde a energia vai)'];
      let html = '<div class="reading-result triple-reading fade-in">';
      
      let revealedCount = 0;

      cardsInPlay.forEach((card, i) => {
        if (card.isFlipped) {
          revealedCount++;
          html += `
            <div class="reading-triple-col">
              <span class="reading-triple-pos">${positions[i]}</span>
              <div class="reading-card-header">
                <span class="reading-card-num">${card.cardData.num}</span>
                <h3>${card.cardData.title}</h3>
                <span class="reading-card-meta">${card.cardData.meta}</span>
              </div>
              <p class="reading-card-desc">"${card.cardData.desc}"</p>
            </div>
          `;
        } else {
          html += `
            <div class="reading-triple-col reading-triple-col--closed">
              <span class="reading-triple-pos">${positions[i]}</span>
              <div class="reading-triple-placeholder">
                <p>Revelar carta...</p>
              </div>
            </div>
          `;
        }
      });

      html += '</div>';
      resultPanel.innerHTML = html;
    }
  }

  // Main Loop do Engine
  let lastTime = 0;
  function gameLoop(time) {
    if (!lastTime) lastTime = time;
    const dt = (time - lastTime) / 1000;
    lastTime = time;

    // Atualizar
    cardsInPlay.forEach(card => card.update(dt));
    
    // Limpar e atualizar partículas
    particles = particles.filter(p => {
      p.update(dt);
      return p.life > 0;
    });

    // Renderizar
    // Fundo rústico de papel (limpa canvas)
    ctx.fillStyle = colors.ink;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid de linhas de textura estilo linóleo/xilogravura no fundo
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 20, canvas.height);
      ctx.stroke();
    }

    // Desenhar cartas
    cardsInPlay.forEach(card => card.draw());

    // Desenhar partículas
    particles.forEach(p => p.draw());

    requestAnimationFrame(gameLoop);
  }

  // Inicializar o Engine
  function initEngine() {
    canvas = document.getElementById('tarotCanvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');

    // Escalar logicamente a resolução interna
    canvas.width = 760;
    canvas.height = 360;

    updatePalette();

    // Eventos
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);

    // Botões de Tiragem
    const btnSpread1 = document.getElementById('btnSpread1');
    const btnSpread3 = document.getElementById('btnSpread3');
    const btnShuffle = document.getElementById('btnShuffle');

    if (btnSpread1 && btnSpread3 && btnShuffle) {
      btnSpread1.addEventListener('click', () => {
        initAudio();
        currentSpreadMode = '1';
        btnSpread1.classList.add('active');
        btnSpread3.classList.remove('active');
        setupSpread();
      });

      btnSpread3.addEventListener('click', () => {
        initAudio();
        currentSpreadMode = '3';
        btnSpread3.classList.add('active');
        btnSpread1.classList.remove('active');
        setupSpread();
      });

      btnShuffle.addEventListener('click', () => {
        initAudio();
        setupSpread();
      });
    }

    // Observar mudanças de tema (Ateliê/Pista)
    const themeObserver = new MutationObserver(() => {
      updatePalette();
    });
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // Iniciar carregamento de imagens e loop
    loadAssets(() => {
      setupSpread();
      requestAnimationFrame(gameLoop);
    });
  }

  // Carrega ao carregar o DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEngine);
  } else {
    initEngine();
  }
})();
