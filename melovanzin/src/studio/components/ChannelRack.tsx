import { studioEngine } from '../engine'
import { useActiveProject, useStudioStore } from '../useStudioStore'

export function ChannelRack() {
  const project = useActiveProject()
  const transport = useStudioStore((state) => state.transport)
  const selection = useStudioStore((state) => state.selection)
  const toggleStep = useStudioStore((state) => state.toggleStep)
  const setSelectedChannel = useStudioStore((state) => state.setSelectedChannel)
  const removeChannel = useStudioStore((state) => state.removeChannel)

  return (
    <section className="channel-rack panel-card">
      <div className="panel-heading">
        <div>
          <h3>Channel Rack</h3>
          <p>Marca os passos e ensina teu ouvido a sentir groove, repeticao e surpresa.</p>
        </div>
      </div>

      {project.channels.length === 0 ? (
        <div className="empty-state">
          <strong>Sem canais ainda.</strong>
          <span>Importa um sample ali na esquerda e eu transformo isso num pequeno laboratorio para o Lucas.</span>
        </div>
      ) : (
        <div className="rack-grid">
          {project.channels.map((channel) => (
            <article
              key={channel.id}
              className={`channel-card ${selection.selectedChannelId === channel.id ? 'selected' : ''}`}
              onClick={() => setSelectedChannel(channel.id)}
            >
              <div className="channel-meta">
                <div>
                  <div className="channel-title-row">
                    <span className="channel-swatch" style={{ background: channel.color }} />
                    <strong>{channel.name}</strong>
                  </div>
                  <p>
                    {channel.source.sourceLabel} · {channel.source.fileName}
                  </p>
                </div>
                <div className="channel-actions">
                  <button onClick={() => void studioEngine.previewSource(channel.source)}>preview</button>
                  <button onClick={() => removeChannel(channel.id)}>x</button>
                </div>
              </div>

              <div className="step-grid">
                {Array.from({ length: project.patternLength }).map((_, stepIndex) => {
                  const isActive = Boolean(channel.steps[selection.selectedPatternId]?.[stepIndex])
                  const isPlaying = transport.currentStep === stepIndex
                  return (
                    <button
                      key={`${channel.id}-${stepIndex}`}
                      className={`step-pad ${isActive ? 'active' : ''} ${isPlaying ? 'playing' : ''}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        toggleStep(channel.id, stepIndex)
                      }}
                    >
                      <span>{stepIndex + 1}</span>
                    </button>
                  )
                })}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
