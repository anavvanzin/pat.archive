import { useState } from 'react'
import { motion } from 'framer-motion'

import { downloadProjectJson, downloadProjectWav } from '../export'
import { studioEngine } from '../engine'
import { useActiveProject, useStudioStore } from '../useStudioStore'
import { loginWithGoogle, logout, auth } from '../../firebase'
import { useStore } from '../../store/useStore'

interface StudioHeaderProps {
  onExit: () => void
  onOpenWorld: (world: 'hub' | 'discord' | 'tibia' | 'botlane') => void
}

const WORLD_SHORTCUTS = [
  { id: 'hub', label: 'hub' },
  { id: 'discord', label: 'discord' },
  { id: 'tibia', label: 'tibia' },
  { id: 'botlane', label: 'bot lane' },
] as const

export function StudioHeader({ onExit, onOpenWorld }: StudioHeaderProps) {
  const project = useActiveProject()
  const { transport, renameProject, setBpm, setBars, setPlaying, resetSession } = useStudioStore()
  const [exporting, setExporting] = useState(false)
  
  const firebaseUser = useStore((s) => s.firebaseUser)
  const setFirebaseUser = useStore((s) => s.setFirebaseUser)

  const handleLogin = async () => {
    try {
      await loginWithGoogle()
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      setFirebaseUser(null)
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  const handlePlayToggle = async () => {
    if (transport.isPlaying) {
      studioEngine.stop()
      setPlaying(false)
      return
    }

    await studioEngine.syncProject(project)
    await studioEngine.play()
    setPlaying(true)
  }

  const handleStop = () => {
    studioEngine.stop()
    setPlaying(false)
    useStudioStore.getState().setCurrentStep(0)
    useStudioStore.getState().setCurrentBar(0)
  }

  const handleExportWav = async () => {
    try {
      setExporting(true)
      await studioEngine.syncProject(project)
      await downloadProjectWav(project)
    } finally {
      setExporting(false)
    }
  }

  const handleExit = () => {
    handleStop()
    onExit()
  }

  return (
    <header className="studio-header gradient-mesh">
      <div className="studio-identity">
        <motion.span 
          className="studio-kicker pixel-font"
          whileHover={{ scale: 1.05 }}
          style={{ 
            display: 'inline-block',
            cursor: 'default',
          }}
        >
          Lucas Melo Producer Pack
        </motion.span>
        <input
          className="project-name-input"
          value={project.name}
          onChange={(event) => renameProject(event.target.value)}
          aria-label="Nome da sessao"
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: '2px solid transparent',
            transition: 'border-color 0.3s ease',
          }}
          onFocus={(e) => e.target.style.borderBottomColor = 'var(--pu)'}
          onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
        />
        <p className="studio-dedication">
          um presente da Ana para o Lucas: aprender, samplear e deixar o coracao virar beat.
        </p>
      </div>

      <div className="studio-auth">
        {firebaseUser ? (
          <div className="user-info">
            <img 
              src={firebaseUser.photoURL || ''} 
              alt={firebaseUser.displayName || 'User'} 
              className="user-avatar"
            />
            <button className="auth-button" onClick={handleLogout}>
              sair
            </button>
          </div>
        ) : (
          <button className="auth-button login" onClick={handleLogin}>
            entrar com google
          </button>
        )}
      </div>

      <div className="studio-transport">
        <button className="transport-button stop" onClick={handleStop}>
          stop
        </button>
        <button className="transport-button play" onClick={() => void handlePlayToggle()}>
          {transport.isPlaying ? 'pause' : 'play'}
        </button>
        <div className="transport-readout">
          <span>bar {transport.currentBar + 1}</span>
          <span>step {transport.currentStep + 1}</span>
        </div>
      </div>

      <div className="studio-controls">
        <div className="world-shortcuts">
          <span>outros mundos</span>
          <div className="world-shortcuts-list">
            {WORLD_SHORTCUTS.map((world) => (
              <button
                key={world.id}
                className="world-shortcut"
                onClick={() => onOpenWorld(world.id)}
              >
                {world.label}
              </button>
            ))}
          </div>
        </div>

        <label className="header-field">
          <span>BPM</span>
          <input
            type="number"
            min={60}
            max={180}
            value={project.bpm}
            onChange={(event) => setBpm(Number(event.target.value))}
          />
        </label>

        <label className="header-field">
          <span>Bars</span>
          <input
            type="number"
            min={2}
            max={16}
            value={project.bars}
            onChange={(event) => setBars(Number(event.target.value))}
          />
        </label>

        <button className="header-action" onClick={() => downloadProjectJson(project)}>
          JSON
        </button>
        <button className="header-action strong" onClick={() => void handleExportWav()}>
          {exporting ? 'render...' : 'WAV'}
        </button>
        <button className="header-action" onClick={resetSession}>
          reset
        </button>
        <button className="header-action exit" onClick={handleExit}>
          mundos
        </button>
      </div>
    </header>
  )
}
