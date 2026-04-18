// ============================================================
// STUDIO EXPORT - Export WAV e JSON para o FruitLoops Studio
// ============================================================

import * as Tone from 'tone'
import type { StudioProject } from './types'
import { serializeProject } from './project'

// --- Export JSON ---

export function exportProjectJson(project: StudioProject): string {
  return serializeProject(project)
}

export function downloadProjectJson(project: StudioProject): void {
  const json = exportProjectJson(project)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `${project.name.replace(/\s+/g, '_')}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// --- Export WAV (Offline Render) ---

export interface ExportOptions {
  duration: number      // bars
  bpm: number
  sampleRate?: number
  includeProjectJson?: boolean
}

// Simple WAV export placeholder - actual implementation would need
// access to loaded Tone buffers from the engine
export async function exportProjectWav(
  _project: StudioProject,
  _loadChannelSamples: (channelId: string) => Promise<Map<string, Tone.ToneAudioBuffer>>,
  options: ExportOptions
): Promise<Blob> {
  // For now, create an empty WAV file as placeholder
  // Real implementation would render the project to offline context
  const { sampleRate = 44100 } = options
  const duration = options.duration * 4 // assume 4 seconds per bar
  const length = duration * sampleRate

  // Create empty stereo AudioBuffer using Web Audio API
  const audioCtx = new OfflineAudioContext(2, length, sampleRate)
  const emptyBuffer = audioCtx.createBuffer(2, length, sampleRate)

  // Fill with silence
  const left = emptyBuffer.getChannelData(0)
  const right = emptyBuffer.getChannelData(1)
  left.fill(0)
  right.fill(0)

  return bufferToWavFromAudioBuffer(emptyBuffer)
}

// --- WAV Encoding ---

function bufferToWavFromAudioBuffer(buffer: AudioBuffer): Blob {
  const length = buffer.length
  const numberOfChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate

  const bytesPerSample = 2
  const blockAlign = numberOfChannels * bytesPerSample
  const byteRate = sampleRate * blockAlign
  const dataSize = length * blockAlign
  const bufferSize = 44 + dataSize

  const arrayBuffer = new ArrayBuffer(bufferSize)
  const view = new DataView(arrayBuffer)

  // RIFF header
  writeString(view, 0, 'RIFF')
  view.setUint32(4, bufferSize - 8, true)
  writeString(view, 8, 'WAVE')

  // fmt chunk
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // chunk size
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, numberOfChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bytesPerSample * 8, true) // bits per sample

  // data chunk
  writeString(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  // Interleave channels
  const channels: Float32Array[] = []
  for (let c = 0; c < numberOfChannels; c++) {
    channels.push(buffer.getChannelData(c))
  }

  let offset = 44
  for (let i = 0; i < length; i++) {
    for (let c = 0; c < numberOfChannels; c++) {
      const sample = Math.max(-1, Math.min(1, channels[c][i]))
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff
      view.setInt16(offset, int16, true)
      offset += 2
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

// --- Combined Export ---

export async function exportProjectBundle(
  project: StudioProject,
  loadChannelSamples: (channelId: string) => Promise<Map<string, Tone.ToneAudioBuffer>>
): Promise<void> {
  // Download JSON
  downloadProjectJson(project)

  // Download WAV
  const wav = await exportProjectWav(project, loadChannelSamples, {
    duration: project.bars,
    bpm: project.bpm,
  })

  const url = URL.createObjectURL(wav)
  const a = document.createElement('a')
  a.href = url
  a.download = `${project.name.replace(/\s+/g, '_')}.wav`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}