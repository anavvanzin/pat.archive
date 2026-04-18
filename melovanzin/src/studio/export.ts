import type { StudioProject } from './types'
import { serializeProject, resolveChannelStepAtSongPosition } from './project'

function dataUrlToArrayBuffer(dataUrl: string): ArrayBuffer {
  const base64 = dataUrl.split(',')[1] ?? ''
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes.buffer
}

async function decodeSourceToBuffer(
  audioContext: BaseAudioContext,
  sampleDataUrl: string
): Promise<AudioBuffer> {
  const arrayBuffer = dataUrlToArrayBuffer(sampleDataUrl)
  return audioContext.decodeAudioData(arrayBuffer.slice(0))
}

function dbToGain(db: number): number {
  return Math.pow(10, db / 20)
}

function createImpulseResponse(
  audioContext: OfflineAudioContext,
  decay: number
): AudioBuffer {
  const durationSeconds = Math.max(0.5, Math.min(6, decay))
  const length = Math.floor(audioContext.sampleRate * durationSeconds)
  const impulse = audioContext.createBuffer(2, length, audioContext.sampleRate)

  for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
    const data = impulse.getChannelData(channel)
    for (let index = 0; index < length; index += 1) {
      const fade = Math.pow(1 - index / length, decay)
      data[index] = (Math.random() * 2 - 1) * fade
    }
  }

  return impulse
}

export function exportProjectJson(project: StudioProject): string {
  return serializeProject(project)
}

export function downloadProjectJson(project: StudioProject): void {
  const blob = new Blob([exportProjectJson(project)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function renderProjectToWav(project: StudioProject): Promise<Blob> {
  const stepDuration = 60 / project.bpm / 4
  const totalDuration = Math.max(project.bars * project.patternLength * stepDuration + 2, 2)
  const offline = new OfflineAudioContext(2, Math.ceil(totalDuration * 44100), 44100)
  const soloed = project.channels.filter((channel) => channel.solo).map((channel) => channel.id)
  const shouldUseSolo = soloed.length > 0

  const sourceBuffers = await Promise.all(
    project.channels.map(async (channel) => {
      if (!channel.source.sampleDataUrl) return [channel.id, null] as const
      const buffer = await decodeSourceToBuffer(offline, channel.source.sampleDataUrl)
      return [channel.id, buffer] as const
    })
  )
  const bufferMap = new Map(sourceBuffers)

  for (const channel of project.channels) {
    const audioBuffer = bufferMap.get(channel.id)
    if (!audioBuffer) continue
    if (channel.mute) continue
    if (shouldUseSolo && !channel.solo) continue

    const filterNode = offline.createBiquadFilter()
    filterNode.type = 'lowpass'
    filterNode.frequency.value = channel.fx.filter.enabled ? channel.fx.filter.frequency : 22000
    filterNode.Q.value = channel.fx.filter.resonance

    const dryGain = offline.createGain()
    dryGain.gain.value = 1

    const delayNode = offline.createDelay(4)
    delayNode.delayTime.value = channel.fx.delay.time
    const delayFeedback = offline.createGain()
    delayFeedback.gain.value = channel.fx.delay.feedback
    const delayWet = offline.createGain()
    delayWet.gain.value = channel.fx.delay.enabled ? channel.fx.delay.wet : 0
    delayNode.connect(delayFeedback)
    delayFeedback.connect(delayNode)

    const convolver = offline.createConvolver()
    convolver.buffer = createImpulseResponse(offline, channel.fx.reverb.decay)
    const reverbWet = offline.createGain()
    reverbWet.gain.value = channel.fx.reverb.enabled ? channel.fx.reverb.wet : 0

    const panner = offline.createStereoPanner()
    panner.pan.value = channel.pan

    const volume = offline.createGain()
    volume.gain.value = dbToGain(channel.volume)

    filterNode.connect(dryGain)
    dryGain.connect(panner)
    filterNode.connect(delayNode)
    delayNode.connect(delayWet)
    delayWet.connect(panner)
    filterNode.connect(convolver)
    convolver.connect(reverbWet)
    reverbWet.connect(panner)
    panner.connect(volume)
    volume.connect(offline.destination)

    for (let barIndex = 0; barIndex < project.bars; barIndex += 1) {
      for (let stepIndex = 0; stepIndex < project.patternLength; stepIndex += 1) {
        if (!resolveChannelStepAtSongPosition(project, channel.id, barIndex, stepIndex)) continue
        const when = (barIndex * project.patternLength + stepIndex) * stepDuration
        const source = offline.createBufferSource()
        source.buffer = audioBuffer
        source.connect(filterNode)
        source.start(when)
      }
    }
  }

  const rendered = await offline.startRendering()
  return audioBufferToWav(rendered)
}

export async function downloadProjectWav(project: StudioProject): Promise<void> {
  const blob = await renderProjectToWav(project)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}.wav`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const bytesPerSample = 2
  const blockAlign = buffer.numberOfChannels * bytesPerSample
  const byteRate = buffer.sampleRate * blockAlign
  const dataSize = buffer.length * blockAlign
  const fileSize = 44 + dataSize

  const arrayBuffer = new ArrayBuffer(fileSize)
  const view = new DataView(arrayBuffer)

  writeString(view, 0, 'RIFF')
  view.setUint32(4, fileSize - 8, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, buffer.numberOfChannels, true)
  view.setUint32(24, buffer.sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bytesPerSample * 8, true)
  writeString(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  let offset = 44
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, index) =>
    buffer.getChannelData(index)
  )

  for (let sampleIndex = 0; sampleIndex < buffer.length; sampleIndex += 1) {
    for (let channelIndex = 0; channelIndex < buffer.numberOfChannels; channelIndex += 1) {
      const sample = Math.max(-1, Math.min(1, channels[channelIndex][sampleIndex]))
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff
      view.setInt16(offset, int16, true)
      offset += 2
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

function writeString(view: DataView, offset: number, value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index))
  }
}
