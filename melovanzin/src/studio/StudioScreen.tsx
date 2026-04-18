// ============================================================
// STUDIO SCREEN - Componente principal que compõe todos os painéis
// ============================================================

import { useEffect, useCallback } from 'react'
import { StudioHeader } from './components/StudioHeader'
import { ChannelRack } from './components/ChannelRack'
import { MixerPanel } from './components/MixerPanel'
import { PatternBar } from './components/PatternBar'
import { Playlist } from './components/Playlist'
import { ProjectManager } from './components/ProjectManager'
import { GeniusButton } from './components/GeniusButton'
import { useStudioStore, useActiveProject } from './useStudioStore'
import { studioEngine } from './engine'
import './studio.css'

export function StudioScreen() {
  const project = useActiveProject()
  const { createProject, setStudioActive } = useStudioStore()

  // Initialize engine callback
  const handleStep = useCallback((step: number, bar: number) => {
    useStudioStore.getState().setCurrentStep(step)
    useStudioStore.getState().setCurrentBar(bar)
  }, [])

  useEffect(() => {
    studioEngine.setStepCallback(handleStep)
    return () => {
      studioEngine.dispose()
    }
  }, [handleStep])

  // Auto-create project on first load
  useEffect(() => {
    const state = useStudioStore.getState()
    if (!state.activeProjectId && Object.keys(state.projects).length === 0) {
      createProject('Meu Primeiro Beat')
    }
  }, [createProject])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space to play/pause
      if (e.code === 'Space' && !e.target?.toString().includes('Input')) {
        e.preventDefault()
        const state = useStudioStore.getState()
        if (state.transport.isPlaying) {
          studioEngine.stop()
          state.setPlaying(false)
        } else if (project) {
          studioEngine.start(project)
          state.setPlaying(true)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [project])

  return (
    <div className="studio-container">
      <StudioHeader />

      <div className="studio-main">
        <ChannelRack />
        <PatternBar />
        <Playlist />
        <MixerPanel />
      </div>

      <ProjectManager />
      <GeniusButton />
    </div>
  )
}