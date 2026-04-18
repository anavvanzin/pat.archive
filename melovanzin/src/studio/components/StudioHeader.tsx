// ============================================================
// STUDIO HEADER - Barra de título, transporte e BPM
// ============================================================

import { useStudioStore, useActiveProject } from '../useStudioStore'
import { studioEngine } from '../engine'
import { downloadProjectJson } from '../export'

export function StudioHeader() {
  const project = useActiveProject()
  const { transport, setPlaying, setBpm, setStudioActive } = useStudioStore()

  const handlePlayPause = async () => {
    if (!project) return

    if (transport.isPlaying) {
      studioEngine.stop()
      setPlaying(false)
    } else {
      // Load channels and start
      for (const channel of project.channels) {
        await studioEngine.loadChannel(channel)
      }
      await studioEngine.start(project)
      setPlaying(true)
    }
  }

  const handleStop = () => {
    studioEngine.stop()
    setPlaying(false)
    useStudioStore.getState().setCurrentStep(0)
    useStudioStore.getState().setCurrentBar(0)
  }

  const handleExport = () => {
    if (project) {
      downloadProjectJson(project)
    }
  }

  const handleExit = () => {
    studioEngine.stop()
    setPlaying(false)
    setStudioActive(false)
  }

  if (!project) return null

  return (
    <div className="studio-header">
      <div className="header-left">
        <span className="project-name">{project.name}</span>
      </div>

      <div className="header-center">
        <button className="transport-btn" onClick={handleStop}>
          ⏹
        </button>
        <button className="transport-btn play" onClick={handlePlayPause}>
          {transport.isPlaying ? '⏸' : '▶'}
        </button>
        <div className="step-indicator">
          <span className="step">{transport.currentStep + 1}</span>
          <span className="sep">/</span>
          <span className="bar">{transport.currentBar + 1}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="bpm-control">
          <label>BPM</label>
          <input
            type="number"
            min={60}
            max={200}
            value={project.bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
          />
        </div>
        <button className="header-btn" onClick={handleExport}>
          💾
        </button>
        <button className="header-btn exit" onClick={handleExit}>
          ✕
        </button>
      </div>
    </div>
  )
}