// ============================================================
// STUDIO STORE - Zustand store com persistência para o FruitLoops Studio
// ============================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StudioProject, StudioChannel, StepPattern } from './types'
import { createEmptyProject, createSampleChannel, duplicatePattern, placeClip, addChannelToProject } from './project'

// --- Estado da UI ---
interface TransportState {
  isPlaying: boolean
  currentStep: number
  currentBar: number
}

interface SelectionState {
  selectedChannelId: string | null
  selectedPatternId: string | null
  selectedBarIndex: number | null
}

// --- Estado do Store ---
interface StudioState {
  // Projetos
  projects: Record<string, StudioProject>
  activeProjectId: string | null

  // UI State
  isStudioActive: boolean
  transport: TransportState
  selection: SelectionState

  // Actions - Projetos
  createProject: (name?: string) => string
  deleteProject: (id: string) => void
  setActiveProject: (id: string) => void
  updateProject: (project: StudioProject) => void

  // Actions - Canais
  addChannel: (input: { name: string; fileName: string; mimeType: string; sampleDataUrl: string }) => void
  removeChannel: (channelId: string) => void
  updateChannel: (channelId: string, updates: Partial<StudioChannel>) => void

  // Actions - Patterns
  selectPattern: (patternId: string) => void
  addPattern: () => void
  deletePattern: (patternId: string) => void
  toggleStep: (channelId: string, patternId: string, stepIndex: number) => void

  // Actions - Playlist
  addClip: (patternId: string, barIndex: number, channelId: string) => void
  removeClip: (barIndex: number, channelId: string) => void

  // Actions - Transport
  setPlaying: (playing: boolean) => void
  setCurrentStep: (step: number) => void
  setCurrentBar: (bar: number) => void
  setBpm: (bpm: number) => void

  // Actions - Selection
  setSelectedChannel: (channelId: string | null) => void
  setSelectedBar: (barIndex: number | null) => void

  // Actions - UI
  setStudioActive: (active: boolean) => void
}

// --- Implementação ---

export const useStudioStore = create<StudioState>()(
  persist(
    (set, get) => ({
      // Initial state
      projects: {},
      activeProjectId: null,
      isStudioActive: false,
      transport: {
        isPlaying: false,
        currentStep: 0,
        currentBar: 0,
      },
      selection: {
        selectedChannelId: null,
        selectedPatternId: null,
        selectedBarIndex: null,
      },

      // --- Projetos ---

      createProject: (name = 'Novo Projeto') => {
        const project = createEmptyProject(name)
        set((state) => ({
          projects: { ...state.projects, [project.id]: project },
          activeProjectId: project.id,
          selection: { ...state.selection, selectedPatternId: project.selectedPatternId },
        }))
        return project.id
      },

      deleteProject: (id) => {
        set((state) => {
          const { [id]: _, ...rest } = state.projects
          return {
            projects: rest,
            activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
          }
        })
      },

      setActiveProject: (id) => {
        const project = get().projects[id]
        if (project) {
          set({
            activeProjectId: id,
            selection: { ...get().selection, selectedPatternId: project.selectedPatternId },
          })
        }
      },

      updateProject: (project) => {
        set((state) => ({
          projects: { ...state.projects, [project.id]: project },
        }))
      },

      // --- Canais ---

      addChannel: (input) => {
        const { activeProjectId, projects } = get()
        if (!activeProjectId) return

        const channel = createSampleChannel(input)
        const project = projects[activeProjectId]
        if (!project) return

        const updated = addChannelToProject(project, channel)
        set((state) => ({
          projects: { ...state.projects, [activeProjectId]: updated },
          selection: { ...state.selection, selectedChannelId: channel.id },
        }))
      },

      removeChannel: (channelId) => {
        const { activeProjectId, projects } = get()
        if (!activeProjectId) return

        const project = projects[activeProjectId]
        if (!project) return

        const updated = {
          ...project,
          updatedAt: Date.now(),
          channels: project.channels.filter((ch) => ch.id !== channelId),
        }

        set((state) => ({
          projects: { ...state.projects, [activeProjectId]: updated },
          selection: state.selection.selectedChannelId === channelId
            ? { ...state.selection, selectedChannelId: null }
            : state.selection,
        }))
      },

      updateChannel: (channelId, updates) => {
        const { activeProjectId, projects } = get()
        if (!activeProjectId) return

        const project = projects[activeProjectId]
        if (!project) return

        const updated = {
          ...project,
          updatedAt: Date.now(),
          channels: project.channels.map((ch) =>
            ch.id === channelId ? { ...ch, ...updates } : ch
          ),
        }

        set((state) => ({
          projects: { ...state.projects, [activeProjectId]: updated },
        }))
      },

      // --- Patterns ---

      selectPattern: (patternId) => {
        const { activeProjectId, projects } = get()
        if (!activeProjectId) return

        const project = projects[activeProjectId]
        if (!project) return

        const updated = { ...project, selectedPatternId: patternId, updatedAt: Date.now() }

        set((state) => ({
          projects: { ...state.projects, [activeProjectId]: updated },
          selection: { ...state.selection, selectedPatternId: patternId },
        }))
      },

      addPattern: () => {
        const { activeProjectId, projects, selection } = get()
        if (!activeProjectId) return

        const project = projects[activeProjectId]
        if (!project || !selection.selectedPatternId) return

        const updated = duplicatePattern(project, selection.selectedPatternId)
        const newPatternId = updated.patternOrder[updated.patternOrder.length - 1]

        set((state) => ({
          projects: { ...state.projects, [activeProjectId]: updated },
          selection: { ...state.selection, selectedPatternId: newPatternId },
        }))
      },

      deletePattern: (patternId) => {
        const { activeProjectId, projects, selection } = get()
        if (!activeProjectId) return

        const project = projects[activeProjectId]
        if (!project || project.patternOrder.length <= 1) return

        const { [patternId]: _, ...remainingPatterns } = project.patterns

        const updated = {
          ...project,
          updatedAt: Date.now(),
          patternOrder: project.patternOrder.filter((id) => id !== patternId),
          patterns: remainingPatterns,
          selectedPatternId: selection.selectedPatternId === patternId
            ? project.patternOrder[0] ?? ''
            : selection.selectedPatternId ?? '',
        }

        set((state) => ({
          projects: { ...state.projects, [activeProjectId]: updated },
        }))
      },

      toggleStep: (channelId, patternId, stepIndex) => {
        const { activeProjectId, projects } = get()
        if (!activeProjectId) return

        const project = projects[activeProjectId]
        if (!project) return

        const updated = {
          ...project,
          updatedAt: Date.now(),
          channels: project.channels.map((ch) => {
            if (ch.id !== channelId) return ch

            const patternSteps = [...(ch.steps[patternId] || Array(project.patternLength).fill(false))]
            patternSteps[stepIndex] = !patternSteps[stepIndex]

            return {
              ...ch,
              steps: { ...ch.steps, [patternId]: patternSteps },
            }
          }),
        }

        set((state) => ({
          projects: { ...state.projects, [activeProjectId]: updated },
        }))
      },

      // --- Playlist ---

      addClip: (patternId, barIndex, channelId) => {
        const { activeProjectId, projects } = get()
        if (!activeProjectId) return

        const project = projects[activeProjectId]
        if (!project) return

        const updated = placeClip(project, { patternId, barIndex, channelId })

        set((state) => ({
          projects: { ...state.projects, [activeProjectId]: updated },
        }))
      },

      removeClip: (barIndex, channelId) => {
        const { activeProjectId, projects } = get()
        if (!activeProjectId) return

        const project = projects[activeProjectId]
        if (!project) return

        const updated = {
          ...project,
          updatedAt: Date.now(),
          playlist: project.playlist.filter(
            (clip) => !(clip.barIndex === barIndex && clip.channelId === channelId)
          ),
        }

        set((state) => ({
          projects: { ...state.projects, [activeProjectId]: updated },
        }))
      },

      // --- Transport ---

      setPlaying: (playing) => {
        set((state) => ({ transport: { ...state.transport, isPlaying: playing } }))
      },

      setCurrentStep: (step) => {
        set((state) => ({ transport: { ...state.transport, currentStep: step } }))
      },

      setCurrentBar: (bar) => {
        set((state) => ({ transport: { ...state.transport, currentBar: bar } }))
      },

      setBpm: (bpm) => {
        const { activeProjectId, projects } = get()
        if (!activeProjectId) return

        const project = projects[activeProjectId]
        if (!project) return

        const updated = { ...project, bpm, updatedAt: Date.now() }

        set((state) => ({
          projects: { ...state.projects, [activeProjectId]: updated },
        }))
      },

      // --- Selection ---

      setSelectedChannel: (channelId) => {
        set((state) => ({ selection: { ...state.selection, selectedChannelId: channelId } }))
      },

      setSelectedBar: (barIndex) => {
        set((state) => ({ selection: { ...state.selection, selectedBarIndex: barIndex } }))
      },

      // --- UI ---

      setStudioActive: (active) => {
        set({ isStudioActive: active })
      },
    }),
    {
      name: 'fruitloops-studio-storage',
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
      }),
    }
  )
)

// --- Selectors ---

export const useActiveProject = () => {
  const projects = useStudioStore((s) => s.projects)
  const activeId = useStudioStore((s) => s.activeProjectId)
  return activeId ? projects[activeId] : null
}

export const useSelectedChannel = () => {
  const project = useActiveProject()
  const selectedId = useStudioStore((s) => s.selection.selectedChannelId)
  return project?.channels.find((ch) => ch.id === selectedId) ?? null
}

export const useSelectedPattern = () => {
  const project = useActiveProject()
  const selectedId = useStudioStore((s) => s.selection.selectedPatternId)
  return selectedId && project ? project.patterns[selectedId] : null
}