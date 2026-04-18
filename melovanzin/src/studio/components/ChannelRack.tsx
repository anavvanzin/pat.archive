// ============================================================
// CHANNEL RACK - Lista de canais com step pads
// ============================================================

import { useStudioStore, useActiveProject } from '../useStudioStore'
import { studioEngine } from '../engine'

export function ChannelRack() {
  const project = useActiveProject()
  const { selection, setSelectedChannel, toggleStep } = useStudioStore()

  if (!project) return null

  const handleUpload = async (channelId: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'audio/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = async () => {
        const dataUrl = reader.result as string
        useStudioStore.getState().updateChannel(channelId, {
          source: {
            fileName: file.name,
            mimeType: file.type,
            sampleDataUrl: dataUrl,
          },
        })
        // Reload in engine
        const updatedCh = project.channels.find(ch => ch.id === channelId)
        if (updatedCh) {
          await studioEngine.loadChannel({ ...updatedCh, source: { ...updatedCh.source!, sampleDataUrl: dataUrl } })
        }
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const handleAddChannel = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'audio/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        useStudioStore.getState().addChannel({
          name: file.name.replace(/\.[^/.]+$/, ''),
          fileName: file.name,
          mimeType: file.type,
          sampleDataUrl: dataUrl,
        })
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  return (
    <div className="channel-rack">
      <div className="rack-header">
        <h3>Canais</h3>
        <button className="add-channel-btn" onClick={handleAddChannel}>
          + Add
        </button>
      </div>

      <div className="channels-list">
        {project.channels.map((channel) => (
          <div
            key={channel.id}
            className={`channel-item ${selection.selectedChannelId === channel.id ? 'selected' : ''}`}
            onClick={() => setSelectedChannel(channel.id)}
          >
            <div className="channel-info">
              <span className="channel-name">{channel.name}</span>
              {!channel.source?.sampleDataUrl && (
                <button
                  className="upload-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUpload(channel.id)
                  }}
                >
                  📁
                </button>
              )}
            </div>

            <div className="step-grid">
              {Array.from({ length: project.patternLength }).map((_, stepIndex) => {
                const patternId = project.selectedPatternId
                const isActive = channel.steps[patternId]?.[stepIndex] ?? false
                const isCurrentStep = selection.selectedChannelId === channel.id &&
                  useStudioStore.getState().transport.currentStep === stepIndex

                return (
                  <button
                    key={stepIndex}
                    className={`step-pad ${isActive ? 'active' : ''} ${isCurrentStep ? 'playing' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleStep(channel.id, patternId, stepIndex)
                    }}
                  />
                )
              })}
            </div>
          </div>
        ))}

        {project.channels.length === 0 && (
          <div className="empty-rack">
            <p>Nenhum canal ainda</p>
            <button onClick={handleAddChannel}>Adicionar_sample</button>
          </div>
        )}
      </div>
    </div>
  )
}