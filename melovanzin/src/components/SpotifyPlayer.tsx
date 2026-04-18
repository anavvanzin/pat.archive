import { useEffect, useRef } from 'react'
import { pixelLoveAudio } from '../audio/pixelLoveAudio'
import { useStore } from '../store/useStore'

const TRACK_DURATION = pixelLoveAudio.pixelLoveTrackDuration

export default function SpotifyPlayer() {
  const { spotifyPlaying, setSpotifyPlaying, spotifyProgress, setSpotifyProgress } = useStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    pixelLoveAudio.primeFromGesture()
  }, [])

  useEffect(() => {
    if (spotifyPlaying) {
      pixelLoveAudio.playMusic()
      intervalRef.current = setInterval(() => {
        setSpotifyProgress(Math.floor(pixelLoveAudio.getMusicPosition()))
      }, 150)
    } else {
      pixelLoveAudio.pauseMusic()
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [spotifyPlaying, setSpotifyProgress])

  useEffect(() => {
    setSpotifyProgress(Math.floor(pixelLoveAudio.getMusicPosition()))
  }, [setSpotifyProgress])

  const minutes = Math.floor(spotifyProgress / 60)
  const seconds = spotifyProgress % 60
  const totalDuration = pixelLoveAudio.getMusicDuration() || TRACK_DURATION
  const totalMin = Math.floor(totalDuration / 60)
  const totalSec = Math.floor(totalDuration % 60)
  const progressPct = (spotifyProgress / TRACK_DURATION) * 100
  const audioUnlocked = pixelLoveAudio.hasUnlockedAudio()

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 border-t shrink-0"
      style={{
        background: 'rgba(13,0,21,0.97)',
        borderColor: 'var(--border)',
        height: '56px',
      }}
    >
      {/* Album art placeholder */}
      <div
        className="w-9 h-9 rounded flex items-center justify-center shrink-0 text-base"
        style={{ background: 'linear-gradient(135deg, #1e0038, #0a1a3a)', border: '1px solid var(--border)' }}
      >
        🎵
      </div>

      {/* Track info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{
              background: spotifyPlaying ? 'var(--grn)' : 'var(--tx3)',
              boxShadow: spotifyPlaying ? '0 0 6px var(--grn)' : 'none',
              animation: spotifyPlaying ? 'pulse 1.5s infinite' : 'none',
            }}
          />
          <div className="text-xs font-medium truncate" style={{ fontFamily: 'Inter, sans-serif', color: '#fff' }}>
            SORRY
          </div>
          <div className="text-xs shrink-0" style={{ color: 'var(--tx3)' }}>—</div>
          <div className="text-xs truncate" style={{ color: 'var(--tx2)' }}>8-bit love loop</div>
        </div>
        {/* Progress bar */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs mono-font shrink-0" style={{ color: 'var(--tx3)', fontSize: '9px' }}>
            {minutes}:{String(seconds).padStart(2, '0')}
          </span>
          <div
            className="flex-1 h-1 rounded-full cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.12)' }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const pct = (e.clientX - rect.left) / rect.width
              const nextTime = Math.floor(pct * TRACK_DURATION)
              pixelLoveAudio.seekMusic(nextTime)
              setSpotifyProgress(nextTime)
            }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progressPct}%`, background: 'var(--grn)' }}
            />
          </div>
          <span className="text-xs mono-font shrink-0" style={{ color: 'var(--tx3)', fontSize: '9px' }}>
            {totalMin}:{String(totalSec).padStart(2, '0')}
          </span>
        </div>
        {!audioUnlocked && (
          <div className="text-[9px] mt-1" style={{ color: 'var(--tx3)' }}>
            clique em play para ligar o som
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => {
            pixelLoveAudio.playBlip()
            const nextTime = Math.max(0, spotifyProgress - 10)
            pixelLoveAudio.seekMusic(nextTime)
            setSpotifyProgress(nextTime)
          }}
          className="text-sm transition-colors hover:text-white"
          style={{ background: 'none', border: 'none', color: 'var(--tx2)', cursor: 'pointer' }}
        >
          ⏮
        </button>
        <button
          onClick={() => {
            pixelLoveAudio.playBlip()
            setSpotifyPlaying(!spotifyPlaying)
          }}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
          style={{ background: 'var(--grn)', border: 'none', cursor: 'pointer', color: '#000', fontSize: '12px', fontWeight: 700 }}
        >
          {spotifyPlaying ? '⏸' : '▶'}
        </button>
        <button
          onClick={() => {
            pixelLoveAudio.playBlip()
            const nextTime = Math.min(TRACK_DURATION, spotifyProgress + 10)
            pixelLoveAudio.seekMusic(nextTime)
            setSpotifyProgress(nextTime)
          }}
          className="text-sm transition-colors hover:text-white"
          style={{ background: 'none', border: 'none', color: 'var(--tx2)', cursor: 'pointer' }}
        >
          ⏭
        </button>
      </div>

      {/* Pixel font label */}
      <div className="pixel-font shrink-0" style={{ fontSize: '7px', color: 'var(--grn)', letterSpacing: '0.5px' }}>
        NOW<br />PLAYING
      </div>
    </div>
  )
}
