import { useRef, useState } from 'react'

import { loveuPortal } from '../../config/portals'
import { studioEngine } from '../engine'
import { createLyraSourceFromUrl, createUploadSourceFromFile } from '../sources'
import { useStudioStore } from '../useStudioStore'

export function SourceBrowser() {
  const addChannelFromSource = useStudioStore((state) => state.addChannelFromSource)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [lyraUrl, setLyraUrl] = useState('')
  const [channelName, setChannelName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openPicker = () => inputRef.current?.click()

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setError(null)
    const source = await createUploadSourceFromFile(file)
    await studioEngine.previewSource(source)
    addChannelFromSource({
      name: channelName.trim() || file.name.replace(/\.[^/.]+$/, ''),
      source,
    })
    setChannelName('')
    event.target.value = ''
  }

  const handleLyraImport = async () => {
    if (!lyraUrl.trim()) return
    setLoading(true)
    setError(null)
    try {
      const source = await createLyraSourceFromUrl(lyraUrl.trim())
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
        <input
          type="text"
          value={channelName}
          onChange={(event) => setChannelName(event.target.value)}
          placeholder="ex: chuva brilhante"
        />
      </label>

      <div className="source-card">
        <strong>Upload local</strong>
        <p>Arrasta um `wav` ou `mp3` do teu mundo para dentro do nosso estudio.</p>
        <button className="source-action" onClick={openPicker}>
          escolher sample
        </button>
        <input
          ref={inputRef}
          hidden
          type="file"
          accept="audio/wav,audio/mpeg,.wav,.mp3"
          onChange={(event) => void handleUpload(event)}
        />
      </div>

      <div className="source-card">
        <strong>Trazer do Lyra</strong>
        <p>Cola uma URL de audio do lounge e puxa esse som para a sessao.</p>
        <input
          type="url"
          placeholder="https://..."
          value={lyraUrl}
          onChange={(event) => setLyraUrl(event.target.value)}
        />
        <div className="source-actions-row">
          <button className="source-action" onClick={() => void handleLyraImport()}>
            {loading ? 'importando...' : 'importar'}
          </button>
          <a className="source-link" href={loveuPortal.url} target="_blank" rel="noreferrer">
            abrir Lyra
          </a>
        </div>
      </div>

      <div className="source-note">
        <strong>para o Lucas:</strong>
        <span>
          começa por um kick, depois um detalhe fofo, depois um som estranho. aprender producao e tambem aprender a confiar no teu ouvido.
        </span>
      </div>

      {error ? <div className="source-error">{error}</div> : null}
    </aside>
  )
}
