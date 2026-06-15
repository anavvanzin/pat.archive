import React, { useRef, useState } from 'react'
import { useDJStore } from '../../store/useDJStore'
import type { DJTrack } from '../../store/useDJStore'
import { djEngine } from '../djEngine'

export function TrackBrowser() {
  const { playlist, loadTrack, addToPlaylist, removeFromPlaylist } = useDJStore()
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null)
  const [tempBpm, setTempBpm] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      // Criar URL temporária local para o áudio
      const url = URL.createObjectURL(file)
      
      const newTrack: DJTrack = {
        id: Math.random().toString(36).slice(2),
        name: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Arquivo Local',
        url: url,
        duration: 0,
        bpm: 120, // default inicial, editável
        isLocal: true,
      }

      addToPlaylist(newTrack)
    })

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleLoad = async (deck: 'A' | 'B', track: DJTrack) => {
    try {
      const duration = await djEngine.loadTrack(deck, track)
      const updatedTrack = { ...track, duration }
      loadTrack(deck, updatedTrack)
      
      // Atualizar playlist com a duração decodificada para salvar
      addToPlaylist(updatedTrack)
    } catch (err) {
      console.error('Erro ao carregar faixa:', err)
      alert('Não consegui carregar o áudio desta faixa. Verifique se é um arquivo de áudio válido.')
    }
  }

  const startEditingBpm = (track: DJTrack) => {
    setEditingTrackId(track.id)
    setTempBpm(track.bpm.toString())
  }

  const saveBpm = (track: DJTrack) => {
    const bpmNum = parseFloat(tempBpm)
    if (!isNaN(bpmNum) && bpmNum > 40 && bpmNum < 220) {
      addToPlaylist({
        ...track,
        bpm: bpmNum,
      })
    }
    setEditingTrackId(null)
  }

  return (
    <div className="track-browser panel-card">
      <div className="panel-heading">
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <div>
            <h3>Track Library</h3>
            <p>Carregue suas faixas para mixar. Formatos suportados: MP3, WAV, OGG.</p>
          </div>
          <button 
            className="dj-btn-primary" 
            onClick={() => fileInputRef.current?.click()}
            style={{ fontSize: '9px', padding: '6px 12px' }}
          >
            ✦ Importar Faixa(s)
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="audio/*" 
            multiple 
            style={{ display: 'none' }} 
          />
        </div>
      </div>

      <div className="track-list-container">
        {playlist.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma faixa na biblioteca. Clique em "Importar Faixa" para carregar arquivos locais!</p>
          </div>
        ) : (
          <table className="track-table">
            <thead>
              <tr>
                <th>Nome da Faixa</th>
                <th>Artista / Origem</th>
                <th>BPM Original</th>
                <th>Duração</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {playlist.map((track) => (
                <tr key={track.id} className="track-row">
                  <td className="track-name-cell">
                    <span className="track-icon">🎵</span> {track.name}
                  </td>
                  <td className="track-artist-cell">{track.artist || 'Desconhecido'}</td>
                  <td className="track-bpm-cell">
                    {editingTrackId === track.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          value={tempBpm}
                          onChange={(e) => setTempBpm(e.target.value)}
                          className="bpm-inline-input"
                          style={{ width: '50px' }}
                        />
                        <button className="dj-btn-mini" onClick={() => saveBpm(track)}>✓</button>
                      </div>
                    ) : (
                      <div className="bpm-display-edit" onClick={() => startEditingBpm(track)}>
                        {track.bpm} <span className="edit-pencil">✏️</span>
                      </div>
                    )}
                  </td>
                  <td>
                    {track.duration
                      ? `${Math.floor(track.duration / 60)}:${String(
                          Math.floor(track.duration % 60)
                        ).padStart(2, '0')}`
                      : '--:--'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        className="dj-btn-action load-a" 
                        onClick={() => void handleLoad('A', track)}
                      >
                        DECK A
                      </button>
                      <button 
                        className="dj-btn-action load-b" 
                        onClick={() => void handleLoad('B', track)}
                      >
                        DECK B
                      </button>
                      <button 
                        className="dj-btn-delete" 
                        onClick={() => removeFromPlaylist(track.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
