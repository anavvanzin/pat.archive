import { useActiveProject, useStudioStore } from '../useStudioStore'

export function Playlist() {
  const project = useActiveProject()
  const selection = useStudioStore((state) => state.selection)
  const transport = useStudioStore((state) => state.transport)
  const toggleClip = useStudioStore((state) => state.toggleClip)

  return (
    <section className="playlist panel-card">
      <div className="panel-heading">
        <div>
          <h3>Playlist</h3>
          <p>Organiza os patterns em barras e deixa o beat contar uma historia inteira.</p>
        </div>
        <div className="playlist-badge">Pattern atual: {project.patterns[selection.selectedPatternId].name}</div>
      </div>

      <div className="playlist-scroll">
        <div className="playlist-grid">
          <div className="playlist-label heading-cell">canal</div>
          {Array.from({ length: project.bars }).map((_, barIndex) => (
            <div key={`bar-${barIndex}`} className="playlist-bar-header">
              {barIndex + 1}
            </div>
          ))}

          {project.channels.map((channel) => (
            <div className="playlist-row" key={channel.id}>
              <div className="playlist-label">{channel.name}</div>
              {Array.from({ length: project.bars }).map((_, barIndex) => {
                const clip = project.playlist.find(
                  (entry) => entry.channelId === channel.id && entry.barIndex === barIndex
                )
                return (
                  <button
                    key={`${channel.id}-${barIndex}`}
                    className={`playlist-cell ${clip ? 'filled' : ''} ${
                      transport.currentBar === barIndex ? 'now' : ''
                    }`}
                    style={clip ? { borderColor: channel.color, boxShadow: `inset 0 0 0 1px ${channel.color}` } : undefined}
                    onClick={() => toggleClip(channel.id, barIndex)}
                  >
                    {clip ? project.patterns[clip.patternId].name.replace('Pattern ', 'P') : '·'}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
