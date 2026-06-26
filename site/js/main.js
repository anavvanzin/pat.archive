  "use strict";
  (function(){
    /* ====== ASSETS (placeholders SVG — troque por arquivos reais em ./assets) ====== */
    const SVG = s => 'data:image/svg+xml;utf8,'+encodeURIComponent(s);
    const PANTHER = SVG('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23F2EAD9"/><path d="M50 20c-12 0-20 7-23 16-2-3-6-4-9-3 2 4 4 6 7 8-2 6-1 13 3 19 5 8 14 13 22 13s17-5 22-13c4-6 5-13 3-19 3-2 5-4 7-8-3-1-7 0-9 3-3-9-11-16-23-16z" fill="%230E0B0A"/><circle cx="42" cy="46" r="3" fill="%23B5221A"/><circle cx="58" cy="46" r="3" fill="%23B5221A"/></svg>');
    const THEDJ = SVG('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect width="300" height="400" fill="%230E0B0A"/><rect x="10" y="10" width="280" height="380" fill="none" stroke="%23C79A4B" stroke-width="2"/><text x="150" y="48" fill="%23C79A4B" font-family="Cormorant Garamond,serif" font-size="20" text-anchor="middle" letter-spacing="6">I</text><circle cx="150" cy="180" r="78" fill="none" stroke="%23B5221A" stroke-width="3"/><circle cx="150" cy="180" r="26" fill="none" stroke="%23C79A4B" stroke-width="3"/><circle cx="150" cy="180" r="5" fill="%23E9E0CE"/><rect x="92" y="262" width="116" height="10" fill="%236a5f52"/><text x="150" y="332" fill="%23E9E0CE" font-family="Cormorant Garamond,serif" font-style="italic" font-size="30" text-anchor="middle">The DJ</text><text x="150" y="362" fill="%238a8174" font-family="Hanken Grotesk,sans-serif" font-size="13" text-anchor="middle">domínio do som</text></svg>');
    const STUDIOBG = SVG('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%231a1410"/><g fill="none" stroke="%236a5f52" stroke-width="1" opacity="0.5"><circle cx="60" cy="100" r="34"/><circle cx="140" cy="100" r="34"/><rect x="92" y="70" width="16" height="60"/></g></svg>');
    document.querySelectorAll('.aset-panther').forEach(e=>{ e.style.background="url('assets/panther-flash.png') center/contain no-repeat, url(\""+PANTHER+"\") center/contain no-repeat var(--paper)"; });
    document.querySelectorAll('.aset-hero').forEach(e=>{ e.style.background="url('assets/IMG_7549.jpg') center/cover"; e.style.backgroundSize="cover"; });
    document.querySelectorAll('.aset-studiobg').forEach(e=>{ e.style.background="url('assets/studio-chdx.png') center/cover, url(\""+STUDIOBG+"\") center/cover"; e.style.imageRendering='pixelated'; });

    const $ = id => document.getElementById(id);
    const esc = s => (s==null?'':String(s)).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const BLOOD='#B5221A', GOLD='#C79A4B';

    /* ====== SYNC LAYER (Centralized SyncClient) ====== */
    const syncClient = window.CHDX.SyncClient;
    function updateSyncStatus(status) {
      const light = $('syncStatusLight');
      const text = $('syncStatusText');
      if (!light || !text) return;
      if (status === 'online') {
        light.style.background = 'var(--gold)';
        light.style.boxShadow = '0 0 5px var(--gold)';
        text.style.color = 'var(--cream)';
        text.textContent = 'sincronizado';
      } else if (status === 'local') {
        light.style.background = '#8a8174';
        light.style.boxShadow = 'none';
        text.style.color = '#8a8174';
        text.textContent = 'modo local';
      } else if (status === 'erro') {
        light.style.background = 'var(--blood)';
        light.style.boxShadow = '0 0 5px var(--blood)';
        text.style.color = 'var(--blood)';
        text.textContent = 'erro de sync';
      }
    }

    async function pullRemote(){
      const success = await syncClient.pull('camarim');
      if (success) {
        const state = syncClient.getState();
        if (state.camarim) camarim = state.camarim;
        if (state.guests) guests = state.guests;
        if (state.photos) photos = state.photos;
        return true;
      }
      return false;
    }

    /* ====== STATE ====== */
    let camarim = {
      owner:'pat', monthOffset:0,
      films:[
        {id:1, title:'Suspiria', by:'pat', seen:false},
        {id:2, title:'Possession', by:'ana', seen:false},
        {id:3, title:'Titane', by:'pat', seen:true},
      ],
      books:[
        {id:1, year:'1949', title:'O Segundo Sexo', author:'Simone de Beauvoir', by:'pat'},
        {id:2, year:'2008', title:'Testo Junkie', author:'Paul B. Preciado', by:'ana'},
      ],
      events:{}, notes:[], capsules:[],
    };
    let guests = [];
    let photos = {};
    let pendingFilm = null;
    let flyer = { name:'RITUAL NOTURNO', date:'SEX · 12 JUL', venue:'CLUB SUBSOLO', variant:0 };

    function loadLocal(){
      // Fallback transition from legacy keys to unified client key
      let localData = null;
      try { localData = localStorage.getItem('chdx_index_state_v1'); } catch(e) {}
      if (localData) {
        const parsed = JSON.parse(localData);
        if (parsed.camarim) camarim = parsed.camarim;
        if (parsed.guests) guests = parsed.guests;
        if (parsed.photos) photos = parsed.photos;
      } else {
        // Load legacy
        try{ const r=localStorage.getItem('chdx_camarim_v1'); if(r) camarim=Object.assign(camarim,JSON.parse(r)); }catch(e){}
        try{ const g=localStorage.getItem('chdx_guests'); if(g) guests=JSON.parse(g); }catch(e){}
        try{ const p=localStorage.getItem('chdx_photos'); if(p) photos=JSON.parse(p); }catch(e){}
      }

      // Initialize sync client with current state
      syncClient.init({
        key: 'chdx_index_state_v1',
        defaults: { camarim, guests, photos },
        onStatusChange: updateSyncStatus
      });
    }

    function saveCamarim(){
      syncClient.save({ camarim, guests, photos }, 'camarim');
    }
    function saveGuests(){
      syncClient.save({ camarim, guests, photos }, 'camarim');
    }
    function savePhotos(){
      syncClient.save({ camarim, guests, photos }, 'camarim');
    }
    function guardEdit(){
      if(syncClient.canEdit()) return true;
      alert('Modo somente leitura. Pra editar, abra o site com a chave secreta no fim do link (?k=...).');
      return false;
    }

    /* ====== GIFT GATE / PRIVATE ARCHIVE ====== */
    function initGiftGate(){
      const gate = $('giftGate');
      if (!gate) return;
      const unlock = $('giftUnlock');
      const pista = $('giftEnterPista');
      if (location.hash === '#home') {
        gate.classList.add('is-closed');
        return;
      }
      gate.classList.add('is-locked');
      if (unlock) {
        unlock.setAttribute('aria-expanded', 'false');
        unlock.addEventListener('click', () => {
          gate.classList.remove('is-locked');
          gate.classList.add('is-unlocked');
          unlock.setAttribute('aria-expanded', 'true');
        });
      }
      if (pista) {
        pista.addEventListener('click', () => {
          gate.classList.add('is-closed');
        });
      }
    }
    initGiftGate();

    const splash = $('splash');
    if (splash) {
      try{ if(sessionStorage.getItem('chdx_booted')) splash.style.display='none'; }catch(e){}
      splash.addEventListener('click',()=>{ splash.style.display='none'; try{sessionStorage.setItem('chdx_booted','1');}catch(e){} });
    }
    const secretPanther = $('secretPanther');
    const ded = $('ded');
    const dedcard = $('dedcard');
    if (secretPanther && ded && dedcard) {
      let secretTaps=0;
      secretPanther.addEventListener('click',()=>{ secretTaps++; if(secretTaps>=3){ ded.style.display='flex'; } });
      ded.addEventListener('click',()=>{ ded.style.display='none'; secretTaps=0; });
      dedcard.addEventListener('click',e=>e.stopPropagation());
    }

    /* ====== SETS LIST ====== */
    let SETS = [];
    
    async function loadSets() {
      try {
        const res = await fetch('data/sets.json');
        if (res.ok) {
          SETS = await res.json();
        } else {
          throw new Error('Falha ao carregar data/sets.json');
        }
      } catch(e) {
        try {
          const resFallback = await fetch('data/sets-fallback.json');
          if (resFallback.ok) {
            SETS = await resFallback.json();
          }
        } catch(err) {
          console.error("Não foi possível carregar os sets do DJ.", err);
        }
      }

      SETS.forEach(s => { if (!s.n && s.id) s.n = s.id; });
      renderSets();
      
      // Feed SETS to AudioEngine
      const engine = window.CHDX && window.CHDX.AudioEngine;
      if (engine) engine.load(SETS);
    }
    
    function renderSets() {
      $('setList').innerHTML = SETS.map((s,i)=>{
        const thumbBg = s.cover ? `url('${s.cover}') center/cover` : 'radial-gradient(rgba(233,224,206,.25) 1px, transparent 1.3px)';
        const isLive = s.live || s.isLive;
        return `
          <div class="set-row" data-set="${s.n}" data-idx="${i}">
            <span class="set-number" style="color:${i===0 ? 'var(--blood)' : 'var(--mute)'};">${s.n}</span>
            <div class="set-thumb" style="background:${thumbBg};${s.cover?'background-size:cover':''}">
              ${!s.cover ? `<span class="bside-label">B-side</span>` : ''}
            </div>
            <div class="set-info">
              <div class="set-title">${esc(s.title)}</div>
              <div class="set-genre">${esc(s.genre || '')}</div>
            </div>
            <span class="set-duration">${esc(s.duration || '')}</span>
            <div class="set-play-btn" role="button" aria-label="Ouvir set ${s.n}">${isLive ? '●' : '▶'}</div>
          </div>
        `;
      }).join('');

      document.querySelectorAll('#setList .set-row').forEach(row => {
        row.addEventListener('click', () => {
          const idx = parseInt(row.dataset.idx);
          const setObj = SETS[idx];
          if (!setObj) return;
          if (setObj.url) {
            // Play via AudioEngine — stream inline
            const engine = window.CHDX && window.CHDX.AudioEngine;
            if (engine) {
              engine.play(idx);
            } else {
              window.open(setObj.url, '_blank');
            }
          } else if (!setObj.live) {
            location.hash = '#studio';
            deckToggle('A');
          }
        });
      });
    }

    /* ====== FLYER ====== */
    const FLVARS=[
      {bg:'#0E0B0A',fg:'#E9E0CE',acc:'#B5221A',dots:'rgba(181,34,26,.22)'},
      {bg:'#F2EAD9',fg:'#211B16',acc:'#9B2C1C',dots:'rgba(33,27,22,.16)'},
      {bg:'#B5221A',fg:'#F2EAD9',acc:'#0E0B0A',dots:'rgba(0,0,0,.20)'},
    ];
    function renderPoster(){
      const v=FLVARS[(flyer.variant||0)%3];
      $('poster').innerHTML=`<div style="position:relative; width:100%; max-width:340px; aspect-ratio:3/4; background:${v.bg}; background-image:radial-gradient(${v.dots} 1px, transparent 1.6px); background-size:6px 6px; border:3px solid ${v.fg}; padding:22px; display:flex; flex-direction:column; justify-content:space-between; overflow:hidden;">
        <div style="font-family:var(--display-font); font-weight:600; font-size:11px; letter-spacing:.22em; text-transform:uppercase; color:${v.acc};">CHDX · pat apresenta</div>
        <div>
          <div style="font-family:var(--display-font); font-weight:700; font-size:42px; line-height:.9; text-transform:uppercase; color:${v.fg}; word-break:break-word;">${esc(flyer.name)}</div>
          <div style="height:3px; background:${v.acc}; margin:12px 0; width:70%;"></div>
          <div style="font-family:var(--display-font); font-weight:500; font-size:15px; letter-spacing:.08em; text-transform:uppercase; color:${v.fg};">${esc(flyer.date)}</div>
          <div style="font-family:var(--display-font); font-weight:500; font-size:15px; letter-spacing:.08em; text-transform:uppercase; color:${v.fg};">${esc(flyer.venue)}</div>
        </div>
        <div style="display:flex; align-items:flex-end; justify-content:space-between; gap:10px;">
          <span style="font-family:var(--display-font); font-weight:700; font-size:13px; letter-spacing:.2em; color:${v.acc};">★ AO VIVO</span>
          <div class="aset-panther" style="width:64px; height:64px; background:var(--paper); border:1px solid #211B16; padding:4px;"></div>
        </div>
      </div>`;
      const p=$('poster').querySelector('.aset-panther'); if(p) p.style.background="url('assets/panther-flash.png') center/contain no-repeat, url(\""+PANTHER+"\") center/contain no-repeat var(--paper)";
    }
    $('fName').value=flyer.name; $('fDate').value=flyer.date; $('fVenue').value=flyer.venue;
    $('fName').addEventListener('input',e=>{ flyer.name=e.target.value; renderPoster(); });
    $('fDate').addEventListener('input',e=>{ flyer.date=e.target.value; renderPoster(); });
    $('fVenue').addEventListener('input',e=>{ flyer.venue=e.target.value; renderPoster(); });
    $('fVariant').addEventListener('click',()=>{ flyer.variant=((flyer.variant||0)+1)%3; renderPoster(); });

    /* ====== AUDIO ENGINE ====== */
    let A={audio:null}, deckA=false, deckB=false, xfade=0.5, schedTimer=null, nextNoteTime=0, step=0, raf=null;
    let echoOn=false, filterOn=false, reverbOn=false;
    let volA=0.72, volB=0.51;
    let crateTracks = [
      { id: 'procedural', title: 'Sintetizador Procedural', artist: 'Cabine', len: 'Loop', url: null, bpm: 124 }
    ];
    let deckABuffer = null, deckBBuffer = null;
    let deckALoading = false, deckBLoading = false;

    window.deckToggle = deckToggle;
    window.loadTrackToDeck = loadTrackToDeck;

    function ensureAudio(){
      if(A.audio) return;
      try{
        const AC=window.AudioContext||window.webkitAudioContext; A.audio=new AC();
        A.master=A.audio.createGain(); A.master.gain.value=0.85;
        A.analyser=A.audio.createAnalyser(); A.analyser.fftSize=1024;
        A.master.connect(A.analyser); A.analyser.connect(A.audio.destination);
        
        A.gA=A.audio.createGain(); A.gB=A.audio.createGain();
        
        // FX Filter
        A.filter=A.audio.createBiquadFilter();
        A.filter.type='lowpass';
        A.filter.frequency.value=20000;
        
        A.gA.connect(A.filter);
        A.gB.connect(A.filter);
        A.filter.connect(A.master);
        
        // FX Echo (Delay)
        A.delay=A.audio.createDelay(1.0);
        A.delay.delayTime.value=0.3;
        A.delayFeedback=A.audio.createGain();
        A.delayFeedback.gain.value=0.4;
        A.delay.connect(A.delayFeedback);
        A.delayFeedback.connect(A.delay);
        
        A.delayWet=A.audio.createGain();
        A.delayWet.gain.value=echoOn?0.5:0.0;
        A.delay.connect(A.delayWet);
        
        A.filter.connect(A.delay);
        A.delayWet.connect(A.master);
        
        // FX Reverb (Short spatializer feedback delay)
        A.reverbDelay=A.audio.createDelay(0.1);
        A.reverbDelay.delayTime.value=0.025;
        A.reverbFeedback=A.audio.createGain();
        A.reverbFeedback.gain.value=0.7;
        A.reverbDelay.connect(A.reverbFeedback);
        A.reverbFeedback.connect(A.reverbDelay);
        
        A.reverbWet=A.audio.createGain();
        A.reverbWet.gain.value=reverbOn?0.6:0.0;
        A.reverb.connect(A.reverbWet); // Wait, fix typo in original if any - reverbOn is target.
        A.reverbDelay.connect(A.reverbWet);
        
        A.filter.connect(A.reverbDelay);
        A.reverbWet.connect(A.master);

        const len=Math.floor(A.audio.sampleRate*0.2); A.noise=A.audio.createBuffer(1,len,A.audio.sampleRate);
        const d=A.noise.getChannelData(0); for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
      }catch(e){}
    }
    function applyGains(){ if(!A.audio) return; const x=xfade==null?0.5:xfade; const gA=Math.cos(x*Math.PI/2), gB=Math.sin(x*Math.PI/2); const t=A.audio.currentTime; A.gA.gain.setTargetAtTime((deckA?volA:0)*gA,t,0.02); A.gB.gain.setTargetAtTime((deckB?volB:0)*gB,t,0.02); }
    
    function setVolAFrom(e){
      ensureAudio();
      const r=$('volA').getBoundingClientRect();
      let y=(e.clientY-r.top)/r.height;
      y=Math.max(0,Math.min(1,y));
      volA = 1 - y;
      $('volAHandle').style.top=(y*r.height - 4)+'px';
      applyGains();
    }
    function setVolBFrom(e){
      ensureAudio();
      const r=$('volB').getBoundingClientRect();
      let y=(e.clientY-r.top)/r.height;
      y=Math.max(0,Math.min(1,y));
      volB = 1 - y;
      $('volBHandle').style.top=(y*r.height - 4)+'px';
      applyGains();
    }
    
    function updateFilterFreq() {
      if(!A.audio || !A.filter) return;
      const t = A.audio.currentTime;
      if(filterOn) {
        A.filter.frequency.setTargetAtTime(800, t, 0.05);
        A.filter.Q.setTargetAtTime(3.5, t, 0.05);
      } else {
        A.filter.frequency.setTargetAtTime(20000, t, 0.05);
        A.filter.Q.setTargetAtTime(1.0, t, 0.05);
      }
    }

    function toggleEcho(){
      echoOn=!echoOn; updateFXUI();
      if(A.audio&&A.delayWet){ const t=A.audio.currentTime; A.delayWet.gain.setTargetAtTime(echoOn?0.5:0.0, t, 0.04); }
    }
    function toggleFilter(){
      filterOn=!filterOn; updateFXUI(); updateFilterFreq();
    }
    function toggleReverb(){
      reverbOn=!reverbOn; updateFXUI();
      if(A.audio&&A.reverbWet){ const t=A.audio.currentTime; A.reverbWet.gain.setTargetAtTime(reverbOn?0.6:0.0, t, 0.04); }
    }
    function updateFXUI(){
      const e=$('fxEcho'), f=$('fxFilter'), r=$('fxReverb');
      const s=(el,on)=>{ if(el){ el.style.border=on?'1.5px solid var(--blood)':'1px solid var(--edge)'; el.style.background=on?'rgba(181,34,26,.18)':'transparent'; el.style.color=on?'var(--cream)':'var(--mute)'; } };
      s(e,echoOn); s(f,filterOn); s(r,reverbOn);
    }
    function maybeSchedule(){ const on=deckA||deckB; if(on&&!schedTimer&&A.audio){ nextNoteTime=A.audio.currentTime+0.06; step=0; schedTimer=setInterval(sched,25); } else if(!on&&schedTimer){ clearInterval(schedTimer); schedTimer=null; } }
    function sched(){ if(!A.audio) return; const spb=60/124/4; while(nextNoteTime<A.audio.currentTime+0.12){ stepAt(step,nextNoteTime); nextNoteTime+=spb; step=(step+1)%16; } }
    function stepAt(s,t){
      if(deckA && !deckABuffer){
        if(s%4===0) kick(t);
        if(s%4===2) hat(t,0.32);
        if(s%2===1) hat(t,0.14);
      }
      if(deckB && !deckBBuffer){
        const map={0:55,6:82.41,8:65.41,11:97.99,14:55};
        if(map[s]) bass(t,map[s]);
      }
    }
    function kick(t){ const o=A.audio.createOscillator(),g=A.audio.createGain(); o.frequency.setValueAtTime(150,t); o.frequency.exponentialRampToValueAtTime(50,t+0.12); g.gain.setValueAtTime(1,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.2); o.connect(g); g.connect(A.gA); o.start(t); o.stop(t+0.22); }
    function hat(t,v){ const s=A.audio.createBufferSource(); s.buffer=A.noise; const hp=A.audio.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=7000; const g=A.audio.createGain(); g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.04); s.connect(hp); hp.connect(g); g.connect(A.gA); s.start(t); s.stop(t+0.05); }
    function bass(t,f){ const o=A.audio.createOscillator(),g=A.audio.createGain(),lp=A.audio.createBiquadFilter(); o.type='sawtooth'; o.frequency.value=f; lp.type='lowpass'; lp.frequency.value=520; g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(0.5,t+0.02); g.gain.exponentialRampToValueAtTime(0.001,t+0.22); o.connect(lp); lp.connect(g); g.connect(A.gB); o.start(t); o.stop(t+0.24); }
    function playFlipSound() {
      ensureAudio();
      if(!A.audio) return;
      const t = A.audio.currentTime;
      const s = A.audio.createBufferSource();
      s.buffer = A.noise;
      const hp = A.audio.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(2500, t);
      hp.frequency.exponentialRampToValueAtTime(8000, t + 0.12);
      const g = A.audio.createGain();
      g.gain.setValueAtTime(0.08, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      s.connect(hp); hp.connect(g); g.connect(A.master);
      
      const o = A.audio.createOscillator();
      const g2 = A.audio.createGain();
      o.frequency.setValueAtTime(120, t);
      o.frequency.exponentialRampToValueAtTime(60, t + 0.08);
      g2.gain.setValueAtTime(0.2, t);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      o.connect(g2); g2.connect(A.master);
      s.start(t); s.stop(t + 0.15);
      o.start(t); o.stop(t + 0.1);
    }
    async function loadAudioBuffer(url) {
      // Tenta fetch direto primeiro (archive.org tem CORS *, funciona sem proxy)
      let res;
      try {
        res = await fetch(url);
      } catch (e) {
        // CORS bloqueou — tenta via proxy do Cloudflare Worker
        const proxyUrl = syncClient && syncClient.getAudioProxyUrl ? syncClient.getAudioProxyUrl(url) : null;
        if (proxyUrl && proxyUrl !== url) {
          res = await fetch(proxyUrl);
        } else {
          throw new Error('CORS bloqueado e sem proxy disponível.');
        }
      }
      if (!res.ok) throw new Error('Falha ao baixar áudio (HTTP ' + res.status + ').');
      const arrayBuffer = await res.arrayBuffer();
      return new Promise((resolve, reject) => {
        A.audio.decodeAudioData(arrayBuffer, resolve, reject);
      });
    }
    async function loadTrackToDeck(track, deck) {
      ensureAudio();
      if (!A.audio) return;
      // All sets have playable URLs — load via proxy (no more fail-to-SoundCloud)
      if (track.url === null) {
        if (deck === 'A') {
          deckABuffer = null;
          if (A.sourceA) { try { A.sourceA.stop(); } catch(e){} A.sourceA = null; }
          if (deckA) { deckA = false; updateDeckUI(); }
          alert('Deck A: Sintetizador Procedural ativo.');
        } else {
          deckBBuffer = null;
          if (A.sourceB) { try { A.sourceB.stop(); } catch(e){} A.sourceB = null; }
          if (deckB) { deckB = false; updateDeckUI(); }
          alert('Deck B: Sintetizador Procedural ativo.');
        }
        updateDeckStatusUI();
        return;
      }
      if (deck === 'A') {
        deckALoading = true;
      } else {
        deckBLoading = true;
      }
      updateDeckStatusUI();
      try {
        const buffer = await loadAudioBuffer(track.url);
        if (deck === 'A') {
          deckABuffer = buffer;
          deckALoading = false;
          if (deckA) {
            try { if (A.sourceA) A.sourceA.stop(); } catch(e){}
            A.sourceA = A.audio.createBufferSource();
            A.sourceA.buffer = deckABuffer;
            A.sourceA.loop = true;
            A.sourceA.connect(A.gA);
            A.sourceA.start(0);
          }
        } else {
          deckBBuffer = buffer;
          deckBLoading = false;
          if (deckB) {
            try { if (A.sourceB) A.sourceB.stop(); } catch(e){}
            A.sourceB = A.audio.createBufferSource();
            A.sourceB.buffer = deckBBuffer;
            A.sourceB.loop = true;
            A.sourceB.connect(A.gB);
            A.sourceB.start(0);
          }
        }
        alert(`Faixa "${track.title}" carregada no Deck ${deck}!`);
      } catch (e) {
        alert(`Erro ao carregar áudio: ${e.message}`);
        if (deck === 'A') deckALoading = false;
        else deckBLoading = false;
      }
      updateDeckStatusUI();
    }
    function updateDeckStatusUI() {
      const ha = $('deckAHeader');
      const hb = $('deckBHeader');
      if (ha) {
        if (deckALoading) ha.innerHTML = 'DECK A <span style="color:var(--gold); font-size:10px;">(CARREGANDO...)</span>';
        else if (deckABuffer) ha.innerHTML = 'DECK A <span style="color:var(--gold); font-size:10px;">(ÁUDIO CARREGADO)</span>';
        else ha.innerHTML = 'DECK A <span style="color:var(--mute); font-size:10px;">(PROCEDURAL)</span>';
      }
      if (hb) {
        if (deckBLoading) hb.innerHTML = '<span style="color:var(--gold); font-size:10px;">(CARREGANDO...)</span> DECK B';
        else if (deckBBuffer) hb.innerHTML = '<span style="color:var(--gold); font-size:10px;">(ÁUDIO CARREGADO)</span> DECK B';
        else hb.innerHTML = '<span style="color:var(--mute); font-size:10px;">(PROCEDURAL)</span> DECK B';
      }
    }
    function renderCrate() {
      const list = $('crateList');
      if (!list) return;
      list.innerHTML = crateTracks.map(t => {
        const isProcedural = t.url === null;
        const hasUrl = t.url && !isProcedural;
        return `
          <div class="crate-row${hasUrl ? ' crate-has-url' : ''}">
            <span class="crate-row-dot${isProcedural ? ' procedural' : ''}"></span>
            <div class="crate-row-meta">
              <div class="crate-row-title">${esc(t.title)}</div>
              <div class="crate-row-artist">${esc(t.artist)}</div>
            </div>
            <span class="crate-row-bpm">${t.bpm} BPM</span>
            <div class="crate-row-btns">
              ${hasUrl ? `<button class="crate-play-btn" data-id="${t.id}">▶</button>` : ''}
              <button class="crate-load-btn" data-id="${t.id}" data-deck="A">A</button>
              <button class="crate-load-btn" data-id="${t.id}" data-deck="B">B</button>
            </div>
          </div>
        `;
      }).join('') || `<div style="padding:10px; text-align:center; color:var(--mute); font-size:12px;">Crate vazia</div>`;
      list.querySelectorAll('.crate-load-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const deck = btn.dataset.deck;
          const track = crateTracks.find(x => x.id === id);
          if (track) {
            loadTrackToDeck(track, deck);
          }
        });
      });
      list.querySelectorAll('.crate-play-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          const id = btn.dataset.id;
          const track = crateTracks.find(x => x.id === id);
          if (track && track.url) {
            // Find the set index and play via engine
            const engine = window.CHDX && window.CHDX.AudioEngine;
            if (engine) {
              const idx = engine.playlist.findIndex(p => p.id === id);
              if (idx >= 0) engine.play(idx);
            }
          }
        });
      });
    }
    function bindUploadListener() {
      const input = $('uploadTrackInput');
      if (!input) return;
      input.addEventListener('change', () => {
        const file = input.files[0];
        if (!file) return;
        if (!file.type.startsWith('audio/') && !file.name.endsWith('.mp3') && !file.name.endsWith('.wav') && !file.name.endsWith('.ogg') && !file.name.endsWith('.m4a')) {
          alert('Selecione um arquivo de áudio válido (.mp3, .wav, .ogg, .m4a)');
          return;
        }
        const formData = new FormData();
        formData.append('track', file);
        const label = input.parentElement;
        label.style.pointerEvents = 'none';
        label.textContent = 'enviando...';
        fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        .then(r => r.json())
        .then(d => {
          if (d.ok && d.track) {
            alert('Faixa enviada com sucesso!');
            fetchTracks();
          } else {
            alert('Erro no envio: ' + (d.error || 'Erro desconhecido'));
          }
        })
        .catch(err => {
          alert('Erro de conexão ao enviar arquivo.');
        })
        .finally(() => {
          label.style.pointerEvents = 'auto';
          label.innerHTML = `+ enviar faixa<input id="uploadTrackInput" type="file" accept="audio/*" style="display:none;">`;
          bindUploadListener();
        });
      });
    }
    async function fetchTracks() {
   // Populate crate from SETS data (SoundCloud-linked sets) + procedural synth
   crateTracks = [
     { id: 'procedural', title: 'Sintetizador Procedural', artist: 'Cabine', len: 'Loop', url: null, bpm: 124 },
     ...SETS.map(s => ({
       id: s.n,
       title: s.title,
       artist: (s.genre || 'CHDX') + ' · ' + (s.duration || '—'),
       len: s.duration || '—',
       url: s.url || null,
       bpm: 124,
       cover: s.cover || null,
       live: s.live || false,
     })),
   ];
   renderCrate();
 }
    function deckToggle(which){
      ensureAudio(); if(A.audio&&A.audio.state==='suspended'){ try{A.audio.resume();}catch(e){} }
      if(which==='A') {
        deckA=!deckA;
        if (deckA) {
          if (deckABuffer) {
            try { if (A.sourceA) { A.sourceA.stop(); } } catch(e){}
            A.sourceA = A.audio.createBufferSource();
            A.sourceA.buffer = deckABuffer;
            A.sourceA.loop = true;
            A.sourceA.connect(A.gA);
            A.sourceA.start(0);
          }
        } else {
          if (A.sourceA) {
            try { A.sourceA.stop(); } catch(e){}
            A.sourceA = null;
          }
        }
      } else {
        deckB=!deckB;
        if (deckB) {
          if (deckBBuffer) {
            try { if (A.sourceB) { A.sourceB.stop(); } } catch(e){}
            A.sourceB = A.audio.createBufferSource();
            A.sourceB.buffer = deckBBuffer;
            A.sourceB.loop = true;
            A.sourceB.connect(A.gB);
            A.sourceB.start(0);
          }
        } else {
          if (A.sourceB) {
            try { A.sourceB.stop(); } catch(e){}
            A.sourceB = null;
          }
        }
      }
      applyGains(); maybeSchedule(); updateDeckUI();
    }
    function updateDeckUI(){
      $('platterA').style.animation=deckA?'spin360 2.4s linear infinite':'none';
      $('platterB').style.animation=deckB?'spin360 2.4s linear infinite':'none';
      const setBtn=(el,on)=>{ el.style.background=on?BLOOD:'transparent'; el.style.color=on?'#0E0B0A':BLOOD; el.textContent=on?'❚❚ PLAY':'▶ PLAY'; };
      setBtn($('playA'),deckA); setBtn($('playB'),deckB);
    }
    $('deckADisc').addEventListener('click',()=>deckToggle('A'));
    $('deckBDisc').addEventListener('click',()=>deckToggle('B'));
    $('playA').addEventListener('click',e=>{e.stopPropagation();deckToggle('A');});
    $('playB').addEventListener('click',e=>{e.stopPropagation();deckToggle('B');});
    $('fxEcho').addEventListener('click',()=>{ ensureAudio(); toggleEcho(); });
    $('fxFilter').addEventListener('click',()=>{ ensureAudio(); toggleFilter(); });
    $('fxReverb').addEventListener('click',()=>{ ensureAudio(); toggleReverb(); });
    function setXfadeFrom(e){ const r=$('xfade').getBoundingClientRect(); let x=(e.clientX-r.left)/r.width; x=Math.max(0,Math.min(1,x)); xfade=x; $('xfadeHandle').style.left=(x*100)+'%'; applyGains(); }
    $('xfade').addEventListener('pointerdown',setXfadeFrom);
    $('xfade').addEventListener('pointermove',e=>{ if(e.buttons) setXfadeFrom(e); });
    $('volA').addEventListener('pointerdown',setVolAFrom);
    $('volA').addEventListener('pointermove',e=>{ if(e.buttons) setVolAFrom(e); });
    $('volB').addEventListener('pointerdown',setVolBFrom);
    $('volB').addEventListener('pointermove',e=>{ if(e.buttons) setVolBFrom(e); });
    function drawWave(){
      const cv=$('wf'); if(cv){ const ctx=cv.getContext('2d'); const w=cv.width=cv.clientWidth*2, h=cv.height=cv.clientHeight*2; ctx.clearRect(0,0,w,h);
        if(A.analyser&&(deckA||deckB)){ const buf=new Uint8Array(A.analyser.fftSize); A.analyser.getByteTimeDomainData(buf); ctx.lineWidth=2.4; ctx.strokeStyle=BLOOD; ctx.beginPath(); for(let i=0;i<buf.length;i++){ const x=i/buf.length*w; const y=(buf[i]/255)*h; if(i===0)ctx.moveTo(x,y); else ctx.lineTo(x,y);} ctx.stroke(); }
        else { ctx.strokeStyle='#2a221c'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(0,h/2); ctx.lineTo(w,h/2); ctx.stroke(); } }
      raf=requestAnimationFrame(drawWave);
    }

    /* ====== TAROT ====== */
    const DECK=[
      {num:'0',name:'O Louco',meaning:'recomeço, salto no escuro',kind:'fool',center:''},
      {num:'I',name:'The DJ',meaning:'domínio do som, presença',kind:'thedj',center:''},
      {num:'II',name:'A Sacerdotisa',meaning:'sabedoria, mistério interior',kind:'priestess',center:''},
      {num:'III',name:'A Imperatriz',meaning:'criação, abundância',kind:'type',center:'♀'},
      {num:'V',name:'O Hierofante',meaning:'tradição, mentoria espiritual',kind:'type',center:'☤'},
      {num:'VI',name:'Os Amantes',meaning:'escolha do coração',kind:'type',center:'❤'},
      {num:'VIII',name:'A Pantera',meaning:'força, instinto, desejo',kind:'panther',center:''},
      {num:'X',name:'A Roda',meaning:'ciclos, virada de sorte',kind:'type',center:'◴'},
      {num:'XI',name:'A Justiça',meaning:'equilíbrio, integridade, verdade',kind:'type',center:'⚖'},
      {num:'XIII',name:'A Morte',meaning:'fim que vira começo',kind:'death',center:''},
      {num:'XVI',name:'A Torre',meaning:'revolução repentina, libertação',kind:'tower',center:''},
      {num:'XVII',name:'A Estrela',meaning:'esperança, inspiração',kind:'dots',center:'✶'},
      {num:'XVIII',name:'A Lua',meaning:'sonho, mistério, intuição',kind:'moon',center:''},
      {num:'XIX',name:'O Sol',meaning:'alegria, clareza, vitalidade',kind:'sun',center:'☀'},
      {num:'XXI',name:'O Mundo',meaning:'realização, integração, dança',kind:'thedj',center:'❂'},
    ];
    function faceFor(kind){
      const base='flex:1; border:1px solid var(--line); display:flex; align-items:center; justify-content:center;';
      if(kind==='thedj') return base+"background:url('assets/card-thedj.png') center/cover, url('"+THEDJ+"') center/cover;";
      if(kind==='panther') return base+"background:#F2EAD9 url('assets/panther-flash.png') center/78% no-repeat, url('"+PANTHER+"') center/78% no-repeat var(--paper);";
      if(kind==='tower') return base+"background:url('assets/card-tower.png') center/cover;";
      if(kind==='fool') return base+"background:url('assets/card-fool.png') center/cover;";
      if(kind==='priestess') return base+"background:url('assets/card-priestess.png') center/cover;";
      if(kind==='death') return base+"background:url('assets/card-death.png') center/cover;";
      if(kind==='moon') return base+"background:url('assets/card-moon.png') center/cover;";
      if(kind==='sun') return base+'background-color:var(--ink); background-image:radial-gradient(circle, rgba(199,154,75,.32), transparent 60%);';
      return base+'background-color:var(--ink); background-image:radial-gradient(rgba(199,154,75,.22) 1px, transparent 1.4px); background-size:8px 8px;';
    }
    let tarot=null;
    let isShuffling=false;

    function drawTarot(){
      if (isShuffling) return;
      isShuffling = true;

      const tarotRow = $('tarotRow');
      // Vira as cartas de volta para baixo antes de embaralhar
      document.querySelectorAll('.tcard-inner').forEach(inner => {
        inner.style.transform = 'perspective(1000px) rotateY(0deg)';
      });

      tarotRow.classList.add('shuffling');

      // Toca áudios simulando embaralhamento físico das cartas
      playFlipSound();
      setTimeout(playFlipSound, 200);
      setTimeout(playFlipSound, 400);
      setTimeout(playFlipSound, 600);

      setTimeout(() => {
        tarotRow.classList.remove('shuffling');
        const idx=[];
        while(idx.length<3){
          const i=Math.floor(Math.random()*DECK.length);
          if(!idx.includes(i)) idx.push(i);
        }
        tarot={drawn:idx.map(i=>DECK[i]),revealed:[false,false,false]};
        isShuffling = false;
        renderTarot();
      }, 900);
    }

    function revealCard(k){
      if(!tarot || isShuffling) return;
      if(!tarot.revealed[k]) {
        tarot.revealed[k]=true;
        playFlipSound();
        renderTarot();
      }
    }

    function renderTarot(){
      const drawn=tarot?tarot.drawn:DECK.slice(0,3);
      const rev=tarot?tarot.revealed:[false,false,false];
      $('tarotRow').innerHTML=drawn.map((c,k)=>`
        <div class="tcard" data-k="${k}">
          <div class="tcard-inner" style="transform:perspective(1000px) rotateY(${rev[k]?180:0}deg); transition: transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);">
            <div class="tcard-face front">
              <div class="star-mark">✶</div>
            </div>
            <div class="tcard-face back">
              <div class="tcard-num">${c.num}</div>
              <div style="${faceFor(c.kind)}"><span style="font-family:'Cormorant Garamond',serif; font-size:46px; color:var(--gold); line-height:1;">${c.center||''}</span></div>
              <div class="tcard-name">${esc(c.name)}</div>
              <div class="tcard-meaning">${esc(c.meaning)}</div>
            </div>
          </div>
        </div>`).join('');

      document.querySelectorAll('.tcard').forEach(card => {
        const k = parseInt(card.dataset.k);
        card.addEventListener('click', () => revealCard(k));

        const cardInner = card.querySelector('.tcard-inner');
        
        // Efeito de Parallax / Tilt 3D Dinâmico ao mover o mouse
        card.addEventListener('mousemove', (e) => {
          if (isShuffling) return;
          const isRevealed = tarot && tarot.revealed[k];
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const xc = rect.width / 2;
          const yc = rect.height / 2;
          // Ângulos máximos de rotação (até 12 graus)
          const angleX = (yc - y) / 12;
          const angleY = (x - xc) / 12;

          cardInner.style.transition = 'none'; // desliga transições durante o rastreamento do mouse
          cardInner.style.transform = `perspective(1000px) rotateY(${(isRevealed ? 180 : 0) + angleY}deg) rotateX(${angleX}deg)`;
        });

        // Retorna a carta para o repouso com transição suave
        card.addEventListener('mouseleave', () => {
          const isRevealed = tarot && tarot.revealed[k];
          cardInner.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
          cardInner.style.transform = `perspective(1000px) rotateY(${isRevealed ? 180 : 0}deg) rotateX(0deg)`;
        });
      });
    }

    function todayCard(){ const n=new Date(); const doy=Math.floor((n-new Date(n.getFullYear(),0,0))/86400000); const c=DECK[doy%DECK.length]; $('todayCardName').textContent=c.name; $('todayCardMeaning').textContent='— '+c.meaning; }
    $('shuffle').addEventListener('click',drawTarot);

    /* ====== CAMARIM: owner ====== */
    function renderOwner(){
      const pat=camarim.owner==='pat', ana=camarim.owner==='ana';
      const P=$('ownerPat'), An=$('ownerAna');
      P.style.cssText='font-family:var(--display-font); font-size:13px; letter-spacing:.06em; padding:5px 15px; cursor:pointer; border:1.5px solid '+(pat?BLOOD:'#4a423a')+'; background:'+(pat?BLOOD:'transparent')+'; color:'+(pat?'#0E0B0A':'var(--soft)')+';';
      An.style.cssText='font-family:var(--display-font); font-size:13px; letter-spacing:.06em; padding:5px 15px; cursor:pointer; border:1.5px solid '+(ana?GOLD:'#4a423a')+'; background:'+(ana?GOLD:'transparent')+'; color:'+(ana?'#0E0B0A':'var(--soft)')+';';
    }
    $('ownerPat').addEventListener('click',()=>{ camarim.owner='pat'; renderOwner(); saveCamarim(); });
    $('ownerAna').addEventListener('click',()=>{ camarim.owner='ana'; renderOwner(); saveCamarim(); });

    /* ====== FILMS ====== */
    function renderFilms(){
      $('filmList').innerHTML=camarim.films.map(f=>`
        <div class="film-row${f.seen ? ' seen' : ''}" data-id="${f.id}">
          <div class="film-row-checkbox">${f.seen?'✓':''}</div>
          <div class="film-row-text">
            <div class="film-row-title">${esc(f.title)}</div>
            <div class="film-row-meta">indicação de <span class="by-${f.by}">${esc(f.by)}</span></div>
          </div>
          <button class="sessionbtn" data-sess="${f.id}">marcar sessão</button>
          ${f.seen ? `<div style="font-family:var(--display-font); font-weight:700; font-size:11px; letter-spacing:.15em; color:var(--blood); border:1.5px solid var(--blood); padding:2px 6px; transform:rotate(-6deg); flex:0 0 auto; margin-left: 10px;">VISTO</div>` : ''}
        </div>`).join('');
      document.querySelectorAll('.film-row').forEach(r=>r.addEventListener('click',()=>{ if(!guardEdit())return; const id=+r.dataset.id; const f=camarim.films.find(x=>x.id===id); if(f){ f.seen=!f.seen; renderFilms(); saveCamarim(); } }));
      document.querySelectorAll('[data-sess]').forEach(b=>b.addEventListener('click',e=>{ e.stopPropagation(); const f=camarim.films.find(x=>x.id==b.dataset.sess); if(f){ pendingFilm=f.title; renderPending(); location.hash='#camarim'; } }));
    }
    $('addFilm').addEventListener('click',()=>{ if(!guardEdit())return; const t=(prompt('Filme a assistir:')||'').trim(); if(!t)return; camarim.films.push({id:Date.now(),title:t,by:camarim.owner,seen:false}); renderFilms(); saveCamarim(); });

    /* ====== BOOKS ====== */
    function renderBooks(){
      $('bookList').innerHTML=camarim.books.map(b=>`
        <div class="book-item">
          <span class="book-year">${esc(b.year||'·')}</span>
          <div>
            <div class="book-title">${esc(b.title)}</div>
            <div class="book-author">${esc(b.author||'—')} · <span style="color:#9B2C1C;">ind. ${esc(b.by)}</span></div>
          </div>
        </div>`).join('');
    }
    $('addBook').addEventListener('click',()=>{ if(!guardEdit())return; const t=(prompt('Título do livro:')||'').trim(); if(!t)return; const a=(prompt('Autor(a):')||'').trim(); const y=(prompt('Ano (opcional):')||'').trim(); camarim.books.push({id:Date.now(),year:y,title:t,author:a,by:camarim.owner}); renderBooks(); saveCamarim(); });

    /* ====== CALENDAR ====== */
    const MN=['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];
    const WD=['DOM','SEG','TER','QUA','QUI','SEX','SÁB'];
    function renderPending(){ $('pendingBar').style.display=pendingFilm?'flex':'none'; if(pendingFilm) $('pendingName').textContent=pendingFilm; }
    $('cancelPending').addEventListener('click',()=>{ pendingFilm=null; renderPending(); });
    function renderCalendar(){
      const now=new Date(); const base=new Date(now.getFullYear(),now.getMonth()+camarim.monthOffset,1);
      const yy=base.getFullYear(), mm=base.getMonth();
      $('monthLabel').textContent=MN[mm]+' '+yy;
      const firstDow=new Date(yy,mm,1).getDay(), daysIn=new Date(yy,mm+1,0).getDate();
      const todayKey=now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate();
      const picking=!!pendingFilm;
      let html=WD.map(w=>`<div class="cal-header-cell">${w}</div>`).join('');
      for(let i=0;i<42;i++){
        const dayNum=i-firstDow+1, inMonth=dayNum>=1&&dayNum<=daysIn, key=yy+'-'+(mm+1)+'-'+dayNum;
        const isToday=inMonth&&key===todayKey;
        const evs=(inMonth&&camarim.events[key])?camarim.events[key]:[];
        const evHtml=evs.map((ev,idx)=>`<div class="evchip ${ev.owner}" data-key="${key}" data-idx="${idx}">${esc(ev.title)}</div>`).join('');
        
        let cellClass = 'calcell';
        if (!inMonth) cellClass += ' out';
        if (isToday) cellClass += ' today';
        
        let borderStyle = '';
        if (picking && inMonth) borderStyle = `style="box-shadow:inset 0 0 0 1px var(--gold);"`;
        
        html+=`<div class="${cellClass}" data-key="${inMonth?key:''}" ${borderStyle}>
          <span class="calcell-num">${inMonth?dayNum:''}</span>
          ${evHtml}
        </div>`;
      }
      $('calGrid').innerHTML=html;
      document.querySelectorAll('.calcell').forEach(c=>c.addEventListener('click',()=>{ const key=c.dataset.key; if(!key) return; addEvent(key); }));
      document.querySelectorAll('.evchip').forEach(ch=>ch.addEventListener('click',e=>{ e.stopPropagation(); if(!guardEdit())return; const key=ch.dataset.key, idx=+ch.dataset.idx; const ev=camarim.events[key][idx]; if(confirm('Apagar "'+ev.title+'"?')){ camarim.events[key].splice(idx,1); if(!camarim.events[key].length) delete camarim.events[key]; renderCalendar(); saveCamarim(); } }));
    }
    function addEvent(key){
      if(!guardEdit())return;
      let t;
      if(pendingFilm){ t='filme: '+pendingFilm; }
      else { t=(prompt('O que rola neste dia?')||'').trim(); if(!t)return; }
      (camarim.events[key]=camarim.events[key]||[]).push({title:t,owner:camarim.owner});
      pendingFilm=null; renderPending(); renderCalendar(); saveCamarim();
    }
    $('prevMonth').addEventListener('click',()=>{ camarim.monthOffset--; renderCalendar(); });
    $('nextMonth').addEventListener('click',()=>{ camarim.monthOffset++; renderCalendar(); });

    /* ====== NOTES ====== */
    const TILTS=['-2deg','1.5deg','-1deg','2deg','-1.5deg'];
    function renderNotes(){
      const list=camarim.notes||[];
      $('noteWrap').innerHTML=list.map((n,i)=>{ const ana=n.owner==='ana'; return `<div class="notecard${ana ? ' ana' : ''}" data-id="${n.id}" style="transform:rotate(${TILTS[i%TILTS.length]});">
          <div class="notecard-text">${esc(n.text)}</div>
          <div class="notecard-sig">— ${esc(n.owner)}</div>
        </div>`; }).join('') + (list.length?'':`<div style="display:flex; align-items:center; justify-content:center; width:164px; min-height:120px; border:1px dashed var(--edge); color:#6a5f52; font-family:'Hanken Grotesk',sans-serif; font-size:13px; text-align:center; padding:10px;">cole o primeiro recado ✎</div>`);
      document.querySelectorAll('.notecard').forEach(c=>c.addEventListener('click',()=>{ if(!guardEdit())return; if(confirm('Tirar este recado do mural?')){ camarim.notes=camarim.notes.filter(n=>n.id!=c.dataset.id); renderNotes(); saveCamarim(); } }));
    }
    $('addNote').addEventListener('click',()=>{ if(!guardEdit())return; const t=(prompt('Recado pro mural:')||'').trim(); if(!t)return; camarim.notes.push({id:Date.now(),text:t,owner:camarim.owner}); renderNotes(); saveCamarim(); });

    /* ====== CAPSULES ====== */
    function renderCapsules(){
      const list=camarim.capsules||[]; const now=new Date();
      $('capsuleWrap').innerHTML=list.map(c=>{ const open=new Date(c.openOn); const valid=!isNaN(open.getTime()); const isOpen=valid?(now>=open):true; const dd=valid?(open.getDate()+'/'+(open.getMonth()+1)+'/'+open.getFullYear()):''; const daysLeft=valid?Math.ceil((open-now)/86400000):0; const ownerClass=c.owner==='ana'?' ana':''; const openClass=isOpen?' open':'';
        return `<div class="capcard${openClass}${ownerClass}" data-id="${c.id}">
          <div class="capcard-header">${isOpen?('✦ aberta · '+dd):('🔒 abre em '+daysLeft+(daysLeft===1?' dia':' dias')+' · '+dd)}</div>
          <div class="capcard-body">${isOpen?esc(c.text):'lacrada até lá.'}</div>
        </div>`; }).join('') + (list.length?'':`<div style="border:1px dashed var(--edge); color:#6a5f52; font-family:var(--body-font); font-size:13px; padding:16px; text-align:center;">guarde uma mensagem pra abrir lá na frente.</div>`);
      document.querySelectorAll('.capcard').forEach(c=>c.addEventListener('click',()=>{ if(!guardEdit())return; if(confirm('Apagar esta cápsula?')){ camarim.capsules=camarim.capsules.filter(x=>x.id!=c.dataset.id); renderCapsules(); saveCamarim(); } }));
    }
    $('addCapsule').addEventListener('click',()=>{ if(!guardEdit())return; const t=(prompt('Mensagem da cápsula (fica lacrada até a data):')||'').trim(); if(!t)return; const d=(prompt('Abrir em qual data? (AAAA-MM-DD)')||'').trim(); if(!d)return; camarim.capsules.push({id:Date.now(),text:t,owner:camarim.owner,openOn:d}); renderCapsules(); saveCamarim(); });

    /* ====== GUESTS ====== */
    function renderGuests(){
      const list=guests||[];
      $('guestWrap').innerHTML=list.map(g=>`<div class="guest-signature">
          <div class="guest-msg">“${esc(g.msg)}”</div>
          <div class="guest-name">— ${esc(g.name)}</div>
        </div>`).join('') + (list.length?'':`<div style="border:1px solid var(--line); color:#6a5f52; font-family:var(--body-font); font-size:13px; padding:16px; text-align:center; grid-column: 1 / -1;">seja a primeira pessoa a assinar.</div>`);
    }
    $('addGuest').addEventListener('click',()=>{ const n=(prompt('Seu nome:')||'').trim(); if(!n)return; const m=(prompt('Deixe um recado:')||'').trim(); if(!m)return; guests=[{id:Date.now(),name:n,msg:m},...guests]; renderGuests(); saveGuests(); });

    /* ====== GALERIA image slots ====== */
    function renderPhotos(){
      document.querySelectorAll('.imgslot').forEach(slot=>{
        const id=slot.dataset.slot; const data=photos[id];
        if(data){ slot.style.background="url('"+data+"') center/cover"; slot.innerHTML='<button class="rmphoto" data-slot="'+id+'">trocar</button>'; }
        else { slot.style.background='#120d0b'; slot.innerHTML='<span class="imgslot-hint">arraste uma foto</span>'; }
      });
      document.querySelectorAll('.rmphoto').forEach(b=>b.addEventListener('click',e=>{ e.stopPropagation(); delete photos[b.dataset.slot]; renderPhotos(); savePhotos(); }));
    }
    function readImage(file,id){ if(!file||!file.type.startsWith('image/'))return; const r=new FileReader(); r.onload=()=>{ photos[id]=r.result; renderPhotos(); savePhotos(); }; r.readAsDataURL(file); }
    document.querySelectorAll('.imgslot').forEach(slot=>{
      const id=slot.dataset.slot;
      slot.addEventListener('click',()=>{ const inp=document.createElement('input'); inp.type='file'; inp.accept='image/*'; inp.onchange=()=>readImage(inp.files[0],id); inp.click(); });
      slot.addEventListener('dragover',e=>{ e.preventDefault(); slot.classList.add('drag'); });
      slot.addEventListener('dragleave',()=>slot.classList.remove('drag'));
      slot.addEventListener('drop',e=>{ e.preventDefault(); slot.classList.remove('drag'); readImage(e.dataTransfer.files[0],id); });
    });
    
    /* ====== THEME SWITCHER ====== */
    function initTheme() {
      if (window.CHDXTheme) {
        window.CHDXTheme.init();
        return;
      }
      const savedTheme = localStorage.getItem('chdx_theme') || 'pista';
      if (savedTheme === 'atelier') {
        document.body.classList.add('light-theme');
        updateThemeToggleUI('atelier');
      } else {
        document.body.classList.remove('light-theme');
        updateThemeToggleUI('pista');
      }
    }
    function toggleTheme() {
      if (window.CHDXTheme) {
        window.CHDXTheme.toggle();
        return;
      }
      const isLight = document.body.classList.toggle('light-theme');
      const activeTheme = isLight ? 'atelier' : 'pista';
      localStorage.setItem('chdx_theme', activeTheme);
      updateThemeToggleUI(activeTheme);
    }
    function updateThemeToggleUI(theme) {
      if (window.CHDXTheme) {
        window.CHDXTheme.updateButtons(theme);
        return;
      }
      const btn = $('themeToggle');
      if (!btn) return;
      if (theme === 'atelier') {
        btn.innerHTML = 'pista <span style="color: var(--soft);">✦</span> <strong>ateliê</strong>';
      } else {
        btn.innerHTML = '<strong>pista</strong> <span style="color: var(--gold);">✦</span> ateliê';
      }
    }
    const tBtn = $('themeToggle');
    if (tBtn && !window.CHDXTheme) tBtn.addEventListener('click', toggleTheme);

    /* ====== FLYER DOWNLOAD ====== */
    const fDlBtn = $('fDownload');
    if (fDlBtn) {
      fDlBtn.addEventListener('click', () => {
        const posterDiv = $('poster').firstElementChild;
        if (!posterDiv) return;
        if (window.html2canvas) {
          html2canvas(posterDiv, {
            scale: 2,
            useCORS: true,
            backgroundColor: null
          }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'chdx-flyer-' + flyer.name.toLowerCase().replace(/\s+/g, '-') + '.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
          }).catch(err => {
            alert('Erro ao gerar imagem: ' + err.message);
          });
        } else {
          alert('Carregando biblioteca de exportação. Tente novamente em alguns segundos.');
        }
      });
    }

    /* ====== AUDIO ENGINE WIRING ====== */
    function wireEngine() {
      const engine = window.CHDX && window.CHDX.AudioEngine;
      if (!engine) return;

      function updatePlayerUI(state) {
        const cur = state.current;
        if (cur) {
          const cover = cur.cover || '';
          $('playerTitle').textContent = cur.n ? `${cur.n} · ${cur.title.toUpperCase()}` : cur.title.toUpperCase();
          $('playerArtist').textContent = cur.artist + ' · ' + (cur.duration || '—');
          const thumb = $('playerThumb');
          if (cover) {
            thumb.innerHTML = `<div style="width:100%;height:100%;background:url('${cover}') center/cover;"></div>`;
          }
          $('playerProgressWrap').style.display = 'flex';
          $('playerNav').style.display = 'flex';
        }

        // Play/pause button
        const btn = $('playerBtn');
        if (state.isPlaying) {
          btn.textContent = '❚❚';
          btn.style.background = BLOOD;
          btn.style.color = '#0E0B0A';
        } else if (cur) {
          btn.textContent = '▶';
          btn.style.background = 'transparent';
          btn.style.color = BLOOD;
        }

        // Progress
        const fill = $('playerProgressFill');
        if (fill) fill.style.width = (state.progress * 100) + '%';

        // Persistent player visibility
        const pp = $('persistentPlayer');
        if (cur) {
          pp.classList.add('active');
        } else {
          pp.classList.remove('active');
        }
        
        // Spinning reel
        const thumb = $('playerThumb');
        if (thumb) {
          if (state.isPlaying) {
            thumb.classList.add('playing');
          } else {
            thumb.classList.remove('playing');
          }
        }
      }

      engine.on('change', updatePlayerUI);
      engine.on('loading', (data) => {
        const cur = data.track;
        if (cur) {
          const cover = cur.cover || '';
          $('playerTitle').textContent = cur.n ? `${cur.n} · ${cur.title.toUpperCase()}` : cur.title.toUpperCase();
          $('playerArtist').textContent = cur.artist + ' · carregando...';
          $('playerBtn').textContent = '⋯';
          $('playerBtn').style.background = GOLD;
          $('playerBtn').style.color = '#0E0B0A';
          $('playerProgressWrap').style.display = 'flex';
          $('playerNav').style.display = 'flex';
          $('persistentPlayer').classList.add('active');
        }
      });
      engine.on('error', () => {
        $('playerBtn').textContent = '⚠';
        $('playerBtn').style.background = 'transparent';
        $('playerBtn').style.color = BLOOD;
      });

      // Poll progress every second while playing
      let progressInterval = null;
      engine.on('change', (state) => {
        if (state.isPlaying && !progressInterval) {
          progressInterval = setInterval(() => {
            const fill = $('playerProgressFill');
            if (fill && engine.getCurrent()) {
              fill.style.width = (engine.getProgress() * 100) + '%';
            }
          }, 500);
        } else if (!state.isPlaying && progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
      });

      // Player button toggles engine
      $('playerBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (engine.getCurrent()) {
          engine.toggle();
        } else if (SETS.length > 0) {
          engine.play(0);
        }
      });

      // Prev / Next
      $('playerPrev').addEventListener('click', (e) => { e.stopPropagation(); engine.prev(); });
      $('playerNext').addEventListener('click', (e) => { e.stopPropagation(); engine.next(); });

      // Click progress bar to seek
      const pwrap = $('playerProgressWrap');
      if (pwrap) {
        pwrap.addEventListener('click', (e) => {
          const rect = pwrap.getBoundingClientRect();
          const frac = (e.clientX - rect.left) / rect.width;
          engine.seek(frac);
        });
      }
    }

    /* ====== BOOT ====== */
    async function init(){
      initTheme();
      loadLocal();
      updateSyncStatus(syncClient.canEdit() ? 'online' : 'local');
      const ok = await pullRemote();
      if (ok) updateSyncStatus('online');
      renderOwner(); renderFilms(); renderBooks(); renderCalendar(); renderPending();
      renderNotes(); renderCapsules(); renderGuests(); renderPhotos(); renderPoster();
      renderSets(); loadSets(); todayCard(); drawTarot(); updateDeckUI(); drawWave();
      wireEngine();
      
      bindUploadListener();
      
      /* Section draw-line animation */
      const secObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-line-draw');
            secObs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      document.querySelectorAll('section').forEach(s => secObs.observe(s));
      
      await fetchTracks();
      updateDeckStatusUI();
      
      if (syncClient.canEdit() && syncClient.EDIT_KEY) {
        const pLink = $('btnPlanner');
        if (pLink) {
          pLink.href = 'planejamento-vida.html?k=' + encodeURIComponent(syncClient.EDIT_KEY);
          pLink.style.display = 'inline-block';
        }
      }
    }
    init();
  })();
