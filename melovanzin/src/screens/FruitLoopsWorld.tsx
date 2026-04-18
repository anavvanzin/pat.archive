import { useEffect } from 'react'

import { pixelLoveAudio } from '../audio/pixelLoveAudio'
import { useStore } from '../store/useStore'
import { StudioScreen } from '../studio/StudioScreen'
import { useStudioStore } from '../studio/useStudioStore'

export default function FruitLoopsWorld() {
  const setWorld = useStore((state) => state.setWorld)
  const setStudioActive = useStudioStore((state) => state.setStudioActive)

  useEffect(() => {
    setStudioActive(true)
    pixelLoveAudio.pauseMusic()

    return () => {
      setStudioActive(false)
      pixelLoveAudio.resumeMusic()
    }
  }, [setStudioActive])

  return (
    <div className="screen" style={{ background: '#05030b' }}>
      <StudioScreen
        onExit={() => {
          setStudioActive(false)
          pixelLoveAudio.resumeMusic()
          setWorld('hub')
        }}
        onOpenWorld={(world) => {
          setStudioActive(false)
          pixelLoveAudio.resumeMusic()
          setWorld(world)
        }}
      />
    </div>
  )
}
