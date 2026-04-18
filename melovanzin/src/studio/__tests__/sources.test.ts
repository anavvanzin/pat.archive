import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createLyraSourceFromUrl } from '../sources'

class MockFileReader {
  result: string | ArrayBuffer | null = null
  error: Error | null = null
  onload: ((this: FileReader, event: ProgressEvent<FileReader>) => void) | null = null
  onerror: ((this: FileReader, event: ProgressEvent<FileReader>) => void) | null = null

  readAsDataURL(blob: Blob): void {
    blob
      .arrayBuffer()
      .then((buffer) => {
        const mimeType = blob.type || 'application/octet-stream'
        this.result = `data:${mimeType};base64,${Buffer.from(buffer).toString('base64')}`
        this.onload?.call(this as unknown as FileReader, {} as ProgressEvent<FileReader>)
      })
      .catch((caught) => {
        this.error = caught instanceof Error ? caught : new Error('failed to read blob')
        this.onerror?.call(this as unknown as FileReader, {} as ProgressEvent<FileReader>)
      })
  }
}

describe('studio source ingestion', () => {
  beforeEach(() => {
    vi.stubGlobal('FileReader', MockFileReader as unknown as typeof FileReader)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('converts Lyra imports into serializable data URLs instead of transient blob URLs', async () => {
    const audioBytes = Uint8Array.from([1, 2, 3, 4])
    const blob = new Blob([audioBytes], { type: 'audio/mpeg' })

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(blob, {
          status: 200,
          headers: { 'Content-Type': 'audio/mpeg' },
        })
      )
    )

    const source = await createLyraSourceFromUrl('https://example.com/lyra/choir.mp3')

    expect(source.remoteUrl).toBe('https://example.com/lyra/choir.mp3')
    expect(source.sampleDataUrl).toBe('data:audio/mpeg;base64,AQIDBA==')
    expect(source.sampleDataUrl?.startsWith('data:audio/mpeg;base64,')).toBe(true)
    expect(source.sampleDataUrl?.startsWith('blob:')).toBe(false)
  })
})
