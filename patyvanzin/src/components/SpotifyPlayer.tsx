import { useEffect, useRef } from 'react'
import { Play, Pause, SkipBack, SkipForward, Repeat } from 'lucide-react'
import { pixelLoveAudio } from '../audio/pixelLoveAudio'
import { useStore } from '../store/useStore'
import AudioVisualizer from './AudioVisualizer'

const TRACK_DURATION = pixelLoveAudio.pixelLoveTrackDuration || 180

export default function SpotifyPlayer() {
  const { 
    spotifyPlaying, setSpotifyPlaying, 
    spotifyProgress, setSpotifyProgress,
    spotifyRepeat, setSpotifyRepeat 
  } = useStore()
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

  const minutes = Math.floor(spotifyProgress / 60)
  const seconds = spotifyProgress % 60
  const totalDuration = pixelLoveAudio.getMusicDuration() || TRACK_DURATION
  const totalMin = Math.floor(totalDuration / 60)
  const totalSec = Math.floor(totalDuration % 60)
  const progressPct = (spotifyProgress / (totalDuration || 1)) * 100
  const audioUnlocked = pixelLoveAudio.hasUnlockedAudio()

  const handleNext = () => {
    pixelLoveAudio.playBlip()
    pixelLoveAudio.nextTrack()
    setSpotifyPlaying(true)
  }

  const handlePrev = () => {
    pixelLoveAudio.playBlip()
    pixelLoveAudio.prevTrack()
    setSpotifyPlaying(true)
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 border-t shrink-0"
      style={{
        background: 'rgba(13,0,21,0.97)',
        borderColor: 'var(--border)',
        height: '64px',
      }}
    >
      <div
        className="w-10 h-10 rounded flex items-center justify-center shrink-0"
        style={{ background: 'linear-gradient(135deg, #1e0038, #0a1a3a)', border: '1px solid var(--border)' }}
      >
        <span className="text-xl">🎵</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium truncate text-white">SORRY</div>
            <span className="text-[10px] text-gray-500">by pixel-love</span>
          </div>
          <span className="text-[10px] text-gray-500">1 / 5</span>
        </div>
        
        <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                <AudioVisualizer />
            </div>
            <div className="flex items-center gap-2 relative">
                <span className="text-[10px] tabular-nums text-gray-400">
                {minutes}:{String(seconds).padStart(2, '0')}
                </span>
                <div
                className="flex-1 h-1.5 rounded-full cursor-pointer bg-white/10"
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const pct = (e.clientX - rect.left) / rect.width
                    const nextTime = Math.floor(pct * totalDuration)
                    pixelLoveAudio.seekMusic(nextTime)
                    setSpotifyProgress(nextTime)
                }}
                >
                <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${progressPct}%`, background: 'var(--grn)' }}
                />
                </div>
                <span className="text-[10px] tabular-nums text-gray-400">
                {totalMin}:{String(totalSec).padStart(2, '0')}
                </span>
            </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handlePrev} className="text-gray-400 hover:text-white transition-colors">
          <SkipBack size={18} />
        </button>
        <button
          onClick={() => {
            pixelLoveAudio.playBlip()
            setSpotifyPlaying(!spotifyPlaying)
          }}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-black hover:scale-105 transition-transform"
        >
          {spotifyPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        </button>
        <button onClick={handleNext} className="text-gray-400 hover:text-white transition-colors">
          <SkipForward size={18} />
        </button>
        <button 
          onClick={() => {
            pixelLoveAudio.playBlip()
            setSpotifyRepeat(!spotifyRepeat)
          }} 
          className={`ml-2 transition-colors ${spotifyRepeat ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}`}
        >
          <Repeat size={16} />
        </button>
      </div>
    </div>
  )
}
