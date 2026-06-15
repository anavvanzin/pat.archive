import { createSourceFromLyra, createSourceFromUpload } from './project'
import type { ChannelSource } from './types'

export async function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Nao foi possivel ler o arquivo de audio.'))
    reader.onload = () => resolve(String(reader.result))
    reader.readAsDataURL(file)
  })
}

export async function createUploadSourceFromFile(file: File): Promise<ChannelSource> {
  const sampleDataUrl = await fileToDataUrl(file)
  return createSourceFromUpload({
    fileName: file.name,
    mimeType: file.type || 'audio/mpeg',
    sampleDataUrl,
  })
}

export function guessFileNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname
    const last = pathname.split('/').filter(Boolean).pop()
    return last || 'lyra-sample.mp3'
  } catch {
    return 'lyra-sample.mp3'
  }
}

export async function createLyraSourceFromUrl(
  url: string,
  sourceLabel = 'Lyra cloud'
): Promise<ChannelSource> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Nao consegui baixar o sample do Lyra.')
  }
  const blob = await response.blob()
  const sampleDataUrl = await fileToDataUrl(blob)

  return createSourceFromLyra({
    fileName: guessFileNameFromUrl(url),
    mimeType: blob.type || 'audio/mpeg',
    remoteUrl: url,
    sampleDataUrl,
    sourceLabel,
  })
}
