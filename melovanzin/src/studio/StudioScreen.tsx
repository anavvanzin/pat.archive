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
import './studio.css'

interface StudioScreenProps {
  onExit: () => void
  onOpenWorld: (world: 'hub' | 'discord' | 'tibia' | 'botlane') => void
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

  const handleOpenWorld = (w: 'hub' | 'discord' | 'tibia' | 'botlane') => {
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
          <div className="dj-bottom-section">
            <TrackBrowser />
          </div>
        </div>
      )}

      {studioMode === 'sequencer' && <GeniusButton />}
    </div>
  )
}
