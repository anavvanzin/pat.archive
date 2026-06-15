import { useEffect, useState } from 'react'

import { studioEngine } from './engine'
import { djEngine } from './djEngine'
import { useActiveProject, useStudioStore } from './useStudioStore'
import { ChannelRack } from './components/ChannelRack'
import { GeniusButton } from './components/GeniusButton'
import { MixerPanel } from './components/MixerPanel'
import { PatternBar } from './components/PatternBar'
import { Playlist } from './components/Playlist'
import { SourceBrowser } from './components/SourceBrowser'
import { StudioHeader } from './components/StudioHeader'
import { DJDeck } from './components/DJDeck'
import { DJMixer } from './components/DJMixer'
import { TrackBrowser } from './components/TrackBrowser'
import { useDJStore } from '../store/useDJStore'
import patriciaDj from '../assets/patricia_dj.jpg'
import './studio.css'

function DJCam() {
  const isPlayingA = useDJStore((s) => s.deckA.isPlaying)
  const isPlayingB = useDJStore((s) => s.deckB.isPlaying)
  const isPlaying = isPlayingA || isPlayingB

  return (
    <div
      className="dj-cam-container"
      style={{
        flex: '0.45',
        background: 'rgba(22, 0, 42, 0.85)',
        border: '2px solid rgba(168, 85, 247, 0.4)',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        minHeight: '180px',
      }}
    >
      {/* Header Cam */}
      <div
        className="dj-cam-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 12px',
          background: 'rgba(13, 0, 21, 0.9)',
          borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
          zIndex: 2,
        }}
      >
        <span
          className="pixel-font"
          style={{ fontSize: '7px', color: 'var(--tx3)', letterSpacing: '0.5px' }}
        >
          CAM 01: DJ BOOTH
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isPlaying ? 'var(--pk)' : 'var(--tx3)',
              boxShadow: isPlaying ? '0 0 8px var(--pk)' : 'none',
              animation: isPlaying ? 'blink 1s infinite' : 'none',
              transition: 'all 0.3s ease',
            }}
          />
          <span
            className="pixel-font"
            style={{ fontSize: '7px', color: isPlaying ? 'var(--pk)' : 'var(--tx3)' }}
          >
            {isPlaying ? 'LIVE' : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* Cam Screen */}
      <div
        className="dj-cam-feed"
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
        }}
      >
        <img
          src={patriciaDj}
          alt="DJ Paty"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: isPlaying ? 'none' : 'grayscale(30%) brightness(70%)',
            transition: 'filter 0.3s ease',
          }}
          draggable={false}
        />
        {/* CRT Scanline overlay on top of the image */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)',
            backgroundSize: '100% 4px',
            opacity: 0.85,
            zIndex: 1,
          }}
        />
        {/* VHS Glitch text overlay */}
        <div
          className="absolute bottom-2 left-2 pixel-font"
          style={{
            fontSize: '6px',
            color: 'rgba(255, 255, 255, 0.6)',
            textShadow: '1px 1px 0 #000',
            zIndex: 2,
          }}
        >
          REC: ANA & PATY
        </div>
      </div>
    </div>
  )
}


interface StudioScreenProps {
  onExit: () => void
  onOpenWorld: (world: 'hub' | 'memories' | 'recipes') => void
}

export function StudioScreen({ onExit, onOpenWorld }: StudioScreenProps) {
  const project = useActiveProject()
  const [studioMode, setStudioMode] = useState<'sequencer' | 'dj'>('sequencer')

  useEffect(() => {
    studioEngine.setStepCallback((step, bar) => {
      useStudioStore.getState().setCurrentStep(step)
      useStudioStore.getState().setCurrentBar(bar)
    })

    return () => {
      studioEngine.dispose()
      djEngine.dispose()
    }
  }, [])

  useEffect(() => {
    if (studioMode === 'sequencer') {
      void studioEngine.syncProject(project)
    }
  }, [project, studioMode])

  const handleExit = () => {
    djEngine.dispose()
    onExit()
  }

  const handleOpenWorld = (w: 'hub' | 'memories' | 'recipes') => {
    djEngine.dispose()
    onOpenWorld(w)
  }

  return (
    <div className="studio-container">
      {/* TABS SWITCHER */}
      <div className="studio-mode-tabs">
        <button 
          className={`studio-mode-tab ${studioMode === 'sequencer' ? 'active' : ''}`}
          onClick={() => {
            djEngine.dispose()
            setStudioMode('sequencer')
          }}
        >
          ✦ BEAT SEQUENCER
        </button>
        <button 
          className={`studio-mode-tab ${studioMode === 'dj' ? 'active' : ''}`}
          onClick={() => {
            studioEngine.stop()
            useStudioStore.getState().setPlaying(false)
            setStudioMode('dj')
          }}
        >
          ✦ MELOMIXER (DJ DECK)
        </button>
      </div>

      <StudioHeader 
        onExit={handleExit} 
        onOpenWorld={handleOpenWorld} 
        hideSequencerControls={studioMode === 'dj'} 
      />

      {studioMode === 'sequencer' ? (
        <div className="studio-layout">
          <SourceBrowser />
          <main className="studio-center">
            <PatternBar />
            <ChannelRack />
            <Playlist />
          </main>
          <MixerPanel />
        </div>
      ) : (
        <div className="dj-layout">
          <div className="dj-top-section">
            <DJDeck deck="A" />
            <DJMixer />
            <DJDeck deck="B" />
          </div>
          <div className="dj-bottom-section-grid" style={{ display: 'flex', gap: '16px', flex: 0.9, minHeight: 0 }}>
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <TrackBrowser />
            </div>
            <DJCam />
          </div>
        </div>
      )}

      {studioMode === 'sequencer' && <GeniusButton />}
    </div>
  )
}
