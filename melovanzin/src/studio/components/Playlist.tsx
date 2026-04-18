// ============================================================
// PLAYLIST - Grade de clips por barra/canal
// ============================================================

import { useStudioStore, useActiveProject } from '../useStudioStore'

export function Playlist() {
  const project = useActiveProject()
  const { selection, addClip, removeClip, setSelectedBar } = useStudioStore()

  if (!project) return null

  const handleCellClick = (barIndex: number, channelId: string) => {
    const existingClip = project.playlist.find(
      clip => clip.barIndex === barIndex && clip.channelId === channelId
    )

    if (existingClip) {
      // Toggle off - remove clip
      removeClip(barIndex, channelId)
    } else {
      // Toggle on - add clip with current pattern
      addClip(project.selectedPatternId, barIndex, channelId)
    }
    setSelectedBar(barIndex)
  }

  return (
    <div className="playlist">
      <div className="playlist-header">
        <h3>Playlist</h3>
        <span className="bars-count">{project.bars} bars</span>
      </div>

      <div className="playlist-grid">
        {/* Header row - bar numbers */}
        <div className="playlist-corner">
          <span></span>
        </div>
        <div className="bar-numbers">
          {Array.from({ length: project.bars }).map((_, barIndex) => (
            <div key={barIndex} className="bar-num">
              {barIndex + 1}
            </div>
          ))}
        </div>

        {/* Channel rows */}
        {project.channels.map((channel) => (
          <div key={channel.id} className="playlist-row">
            <div className="channel-label">{channel.name}</div>
            <div className="playlist-cells">
              {Array.from({ length: project.bars }).map((_, barIndex) => {
                const clip = project.playlist.find(
                  c => c.barIndex === barIndex && c.channelId === channel.id
                )
                const isSelected = selection.selectedBarIndex === barIndex

                return (
                  <button
                    key={barIndex}
                    className={`playlist-cell ${clip ? 'filled' : ''} ${isSelected ? 'selected' : ''}`}
                    style={{ backgroundColor: clip ? channel.color : undefined }}
                    onClick={() => handleCellClick(barIndex, channel.id)}
                  >
                    {clip && <span className="cell-pattern">{clip.patternId}</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {project.channels.length === 0 && (
          <div className="empty-playlist">
            <p>Adicione canais para criar a playlist</p>
          </div>
        )}
      </div>
    </div>
  )
}