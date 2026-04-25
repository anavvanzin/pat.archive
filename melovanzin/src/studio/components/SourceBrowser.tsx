import { useState } from 'react'

import { studioEngine } from '../engine'
import { useStudioStore } from '../useStudioStore'

const DEMO_SAMPLES = [
  { id: 'kick', name: 'Kick', description: 'Bumbo grave', url: 'https://tonejs.github.io/audio/drum-samples/CR78/kick.mp3', color: '#c97dff' },
  { id: 'snare', name: 'Snare', description: 'Caixa crispy', url: 'https://tonejs.github.io/audio/drum-samples/CR78/snare.mp3', color: '#ff6eb4' },
  { id: 'hihat', name: 'Hi-Hat', description: 'Chimbal aberto', url: 'https://tonejs.github.io/audio/drum-samples/CR78/hihat.mp3', color: '#ffe066' },
  { id: 'tom', name: 'Tom', description: 'Tom medio', url: 'https://tonejs.github.io/audio/drum-samples/CR78/tom1.mp3', color: '#1db954' },
  { id: 'clap', name: 'Clap', description: 'Palma clap', url: 'https://tonejs.github.io/audio/drum-samples/Techno/clap.mp3', color: '#5865F2' },
  { id: 'perc', name: 'Perc', description: 'Percussao', url: 'https://tonejs.github.io/audio/drum-samples/Techno/perc.mp3', color: '#a0522d' },
]

const SYNTH_PRESETS = [
  { id: 'bass', name: 'Bass', freq: 80, type: 'sawtooth', color: '#c97dff' },
  { id: 'lead', name: 'Lead', freq: 440, type: 'square', color: '#ff6eb4' },
  { id: 'pad', name: 'Pad', freq: 220, type: 'sine', color: '#ffe066' },
  { id: 'arp', name: 'Arp', freq: 330, type: 'triangle', color: '#1db954' },
]

function generateWaveform(type: string, freq: number, duration = 1): string {
  const sampleRate = 44100
  const numSamples = sampleRate * duration
  const buffer = new ArrayBuffer(44 + numSamples * 2)
  const view = new DataView(buffer)
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }
  writeString(0, 'RIFF'); view.setUint32(4, 36 + numSamples * 2, true); writeString(8, 'WAVE')
  writeString(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true)
  view.setUint16(34, 16, true); writeString(36, 'data'); view.setUint32(40, numSamples * 2, true)
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate
    const envelope = Math.exp(-t * 2)
    let sample = 0
    switch (type) {
      case 'sawtooth': sample = 2 * ((t * freq) % 1) - 1; break
      case 'square': sample = ((t * freq) % 1) < 0.5 ? 0.8 : -0.8; break
      case 'sine': sample = Math.sin(2 * Math.PI * t * freq); break
      case 'triangle': sample = 4 * Math.abs((t * freq) % 1 - 0.5) - 1; break
    }
    const value = Math.max(-1, Math.min(1, sample * envelope * 0.5))
    view.setInt16(44 + i * 2, value * 32767, true)
  }
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return 'data:audio/wav;base64,' + btoa(binary)
}

export function SourceBrowser() {
  const addChannelFromSource = useStudioStore((state) => state.addChannelFromSource)
  const [lyraUrl, setLyraUrl] = useState('')
  const [channelName, setChannelName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleLyraImport = async () => {
    if (!lyraUrl.trim()) return
    setLoading(true)
    setError(null)
    try {
      const { createLyraSourceFromUrl } = await import('../sources')
      const isLocal = window.location.hostname === 'localhost';
      const proxyUrl = isLocal 
        ? `http://localhost:8080/api/audio-proxy?url=${encodeURIComponent(lyraUrl.trim())}`
        : lyraUrl.trim();
        
      const source = await createLyraSourceFromUrl(proxyUrl);
      await studioEngine.previewSource(source)
      addChannelFromSource({
        name: channelName.trim() || source.fileName.replace(/\.[^/.]+$/, ''),
        source,
      })
      setLyraUrl('')
      setChannelName('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Nao consegui importar esse som agora.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddDemoSample = async (demo: typeof DEMO_SAMPLES[0]) => {
    setLoadingId(demo.id)
    setError(null)
    try {
      const { createLyraSourceFromUrl } = await import('../sources')
      const source = await createLyraSourceFromUrl(demo.url, 'Tone.js Demo')
      await studioEngine.previewSource(source)
      addChannelFromSource({
        name: channelName.trim() || demo.name,
        source,
      })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Nao consegui carregar esse sample.')
    } finally {
      setLoadingId(null)
    }
  }

  const handleAddSynth = async (preset: typeof SYNTH_PRESETS[0]) => {
    setLoading(true)
    setError(null)
    try {
      const { fileToDataUrl } = await import('../sources')
      const { createSourceFromUpload } = await import('../project')
      const dataUrl = generateWaveform(preset.type, preset.freq, 0.5)
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      const sampleDataUrl = await fileToDataUrl(blob)
      const source = createSourceFromUpload({
        fileName: `${preset.name} Synth`,
        mimeType: 'audio/wav',
        sampleDataUrl,
      })
      await studioEngine.previewSource(source)
      addChannelFromSource({
        name: channelName.trim() || preset.name,
        source,
      })
      setChannelName('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Nao consegui criar esse sintetizador.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <aside className="source-browser panel-card">
      <div className="panel-heading">
        <div>
          <h3>Sound Browser</h3>
          <p>Escolhe uma textura, corta um sample e deixa o Lucas descobrir o proprio gosto.</p>
        </div>
      </div>
      <label className="field-block">
        <span>Nome do canal</span>
        <input type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} placeholder="ex: chuva brilhante" />
      </label>
      <div className="demo-samples">
        <strong className="demo-title">Drum Samples</strong>
        <div className="demo-grid">
          {DEMO_SAMPLES.map((demo) => (
            <button key={demo.id} className="demo-btn" onClick={() => void handleAddDemoSample(demo)} disabled={loadingId !== null}>
              <span className="demo-name">{demo.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="synth-section">
        <strong className="synth-title">Sintetizador</strong>
        <div className="synth-grid">
          {SYNTH_PRESETS.map((preset) => (
            <button key={preset.id} className="synth-btn" onClick={() => void handleAddSynth(preset)} disabled={loading}>
              <span className="synth-name">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="source-card">
        <strong>Trazer do Lyra</strong>
        <input type="url" placeholder="https://..." value={lyraUrl} onChange={(e) => setLyraUrl(e.target.value)} />
        <button className="source-action" onClick={() => void handleLyraImport()}>{loading ? 'importando...' : 'importar'}</button>
      </div>
      {error ? <div className="source-error">{error}</div> : null}
    </aside>
  )
}
