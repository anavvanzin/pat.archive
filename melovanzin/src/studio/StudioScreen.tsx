import { useEffect } from 'react'

import { studioEngine } from './engine'
import { useActiveProject, useStudioStore } from './useStudioStore'
import { ChannelRack } from './components/ChannelRack'
import { GeniusButton } from './components/GeniusButton'
import { MixerPanel } from './components/MixerPanel'
import { PatternBar } from './components/PatternBar'
import { Playlist } from './components/Playlist'
import { SourceBrowser } from './components/SourceBrowser'
import { StudioHeader } from './components/StudioHeader'
import './studio.css'

interface StudioScreenProps {
  onExit: () => void
  onOpenWorld: (world: 'hub' | 'discord' | 'tibia' | 'botlane') => void
}

export function StudioScreen({ onExit, onOpenWorld }: StudioScreenProps) {
  const project = useActiveProject()

  useEffect(() => {
    studioEngine.setStepCallback((step, bar) => {
      useStudioStore.getState().setCurrentStep(step)
      useStudioStore.getState().setCurrentBar(bar)
    })

    return () => {
      studioEngine.dispose()
    }
  }, [])

  useEffect(() => {
    void studioEngine.syncProject(project)
  }, [project])

  return (
    <div className="studio-container">
      <StudioHeader onExit={onExit} onOpenWorld={onOpenWorld} />
      <div className="studio-layout">
        <SourceBrowser />
        <main className="studio-center">
          <PatternBar />
          <ChannelRack />
          <Playlist />
        </main>
        <MixerPanel />
      </div>
      <GeniusButton />
    </div>
  )
}
