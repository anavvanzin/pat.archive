import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'

const TRACK_DURATION = 195 // ~3:15 seconds for SORRY - Nemzzz

export default function SpotifyPlayer() {
  const { spotifyPlaying, setSpotifyPlaying, spotifyProgress, setSpotifyProgress } = useStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (spotifyPlaying) {
      let cur = spotifyProgress
      intervalRef.current = setInterval(() => {
        cur = cur >= TRACK_DURATION ? 0 : cur + 1
        setSpotifyProgress(cur)
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [spotifyPlaying, setSpotifyProgress])

  const minutes = Math.floor(spotifyProgress / 60)
  const seconds = spotifyProgress % 60
  const totalMin = Math.floor(TRACK_DURATION / 60)
  const totalSec = TRACK_DURATION % 60
  const progressPct = (spotifyProgress / TRACK_DURATION) * 100

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
              background: 'var(--grn)',
              boxShadow: '0 0 6px var(--grn)',
              animation: spotifyPlaying ? 'pulse 1.5s infinite' : 'none',
            }}
          />
          <div className="text-xs font-medium truncate" style={{ fontFamily: 'Inter, sans-serif', color: '#fff' }}>
            SORRY
          </div>
          <div className="text-xs shrink-0" style={{ color: 'var(--tx3)' }}>—</div>
          <div className="text-xs truncate" style={{ color: 'var(--tx2)' }}>Nemzzz</div>
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
              setSpotifyProgress(Math.floor(pct * TRACK_DURATION))
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
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setSpotifyProgress(Math.max(0, spotifyProgress - 10))}
          className="text-sm transition-colors hover:text-white"
          style={{ background: 'none', border: 'none', color: 'var(--tx2)', cursor: 'pointer' }}
        >
          ⏮
        </button>
        <button
          onClick={() => setSpotifyPlaying(!spotifyPlaying)}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
          style={{ background: 'var(--grn)', border: 'none', cursor: 'pointer', color: '#000', fontSize: '12px', fontWeight: 700 }}
        >
          {spotifyPlaying ? '⏸' : '▶'}
        </button>
        <button
          onClick={() => setSpotifyProgress(Math.min(TRACK_DURATION, spotifyProgress + 10))}
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
