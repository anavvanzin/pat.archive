import { create } from 'zustand'

import {
  addChannelToProject,
  createEmptyProject,
  createStudioChannel,
  duplicatePattern,
  placeClip,
  removeClip,
  toggleStepInProject,
} from './project'
import type {
  ChannelSource,
  StudioChannel,
  StudioProject,
  StudioSelectionState,
  TransportState,
} from './types'

interface StudioState {
  isStudioActive: boolean
  project: StudioProject
  transport: TransportState
  selection: StudioSelectionState
  setStudioActive: (active: boolean) => void
  resetSession: () => void
  renameProject: (name: string) => void
  addChannelFromSource: (input: { name: string; source: ChannelSource; color?: string }) => void
  updateChannel: (channelId: string, updates: Partial<StudioChannel>) => void
  removeChannel: (channelId: string) => void
  setSelectedChannel: (channelId: string | null) => void
  setSelectedBar: (barIndex: number | null) => void
  selectPattern: (patternId: string) => void
  duplicateSelectedPattern: () => void
  toggleStep: (channelId: string, stepIndex: number) => void
  toggleClip: (channelId: string, barIndex: number) => void
  setBpm: (bpm: number) => void
  setBars: (bars: number) => void
  setPlaying: (playing: boolean) => void
  setCurrentStep: (step: number) => void
  setCurrentBar: (bar: number) => void
}

const initialProject = () => createEmptyProject('Lucas Melo <3')

export const useStudioStore = create<StudioState>()((set, get) => ({
  isStudioActive: false,
  project: initialProject(),
  transport: {
    isPlaying: false,
    currentStep: 0,
    currentBar: 0,
  },
  selection: {
    selectedPatternId: 'pattern-a',
    selectedChannelId: null,
    selectedBarIndex: null,
  },
  setStudioActive: (active) => set({ isStudioActive: active }),
  resetSession: () => {
    const project = initialProject()
    set({
      project,
      selection: {
        selectedPatternId: project.selectedPatternId,
        selectedChannelId: null,
        selectedBarIndex: null,
      },
      transport: { isPlaying: false, currentStep: 0, currentBar: 0 },
    })
  },
  renameProject: (name) =>
    set((state) => ({
      project: { ...state.project, name, updatedAt: Date.now() },
    })),
  addChannelFromSource: ({ name, source, color }) =>
    set((state) => {
      const channel = createStudioChannel({ name, source, color })
      const project = addChannelToProject(state.project, channel)
      return {
        project,
        selection: { ...state.selection, selectedChannelId: channel.id },
      }
    }),
  updateChannel: (channelId, updates) =>
    set((state) => ({
      project: {
        ...state.project,
        updatedAt: Date.now(),
        channels: state.project.channels.map((channel) =>
          channel.id === channelId ? { ...channel, ...updates } : channel
        ),
      },
    })),
  removeChannel: (channelId) =>
    set((state) => ({
      project: {
        ...state.project,
        updatedAt: Date.now(),
        channels: state.project.channels.filter((channel) => channel.id !== channelId),
        playlist: state.project.playlist.filter((clip) => clip.channelId !== channelId),
      },
      selection:
        state.selection.selectedChannelId === channelId
          ? { ...state.selection, selectedChannelId: null }
          : state.selection,
    })),
  setSelectedChannel: (channelId) =>
    set((state) => ({ selection: { ...state.selection, selectedChannelId: channelId } })),
  setSelectedBar: (barIndex) =>
    set((state) => ({ selection: { ...state.selection, selectedBarIndex: barIndex } })),
  selectPattern: (patternId) =>
    set((state) => ({
      selection: { ...state.selection, selectedPatternId: patternId },
      project: { ...state.project, selectedPatternId: patternId, updatedAt: Date.now() },
    })),
  duplicateSelectedPattern: () =>
    set((state) => {
      const project = duplicatePattern(state.project, state.selection.selectedPatternId)
      return {
        project,
        selection: { ...state.selection, selectedPatternId: project.selectedPatternId },
      }
    }),
  toggleStep: (channelId, stepIndex) =>
    set((state) => ({
      project: toggleStepInProject(
        state.project,
        channelId,
        state.selection.selectedPatternId,
        stepIndex
      ),
    })),
  toggleClip: (channelId, barIndex) =>
    set((state) => {
      const exists = state.project.playlist.find(
        (clip) => clip.channelId === channelId && clip.barIndex === barIndex
      )
      const project = exists
        ? removeClip(state.project, { channelId, barIndex })
        : placeClip(state.project, {
            channelId,
            barIndex,
            patternId: state.selection.selectedPatternId,
          })
      return {
        project,
        selection: { ...state.selection, selectedBarIndex: barIndex },
      }
    }),
  setBpm: (bpm) =>
    set((state) => ({
      project: {
        ...state.project,
        bpm: Math.max(60, Math.min(180, bpm)),
        updatedAt: Date.now(),
      },
    })),
  setBars: (bars) =>
    set((state) => ({
      project: {
        ...state.project,
        bars: Math.max(2, Math.min(16, bars)),
        updatedAt: Date.now(),
      },
    })),
  setPlaying: (playing) =>
    set((state) => ({ transport: { ...state.transport, isPlaying: playing } })),
  setCurrentStep: (currentStep) =>
    set((state) => ({ transport: { ...state.transport, currentStep } })),
  setCurrentBar: (currentBar) =>
    set((state) => ({ transport: { ...state.transport, currentBar } })),
}))

export const useActiveProject = () => useStudioStore((state) => state.project)

export const useSelectedChannel = () =>
  useStudioStore((state) =>
    state.project.channels.find((channel) => channel.id === state.selection.selectedChannelId) ?? null
  )
