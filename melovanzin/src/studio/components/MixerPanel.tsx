// ============================================================
// MIXER PANEL - Volume/pan/mute/solo/FX por canal
// ============================================================

import { useStudioStore, useActiveProject, useSelectedChannel } from '../useStudioStore'
import { studioEngine } from '../engine'

export function MixerPanel() {
  const project = useActiveProject()
  const selectedChannel = useSelectedChannel()
  const { updateChannel } = useStudioStore()

  if (!project) return null

  const handleVolumeChange = (channelId: string, volume: number) => {
    updateChannel(channelId, { volume })
    studioEngine.setChannelVolume(channelId, volume)
  }

  const handlePanChange = (channelId: string, pan: number) => {
    updateChannel(channelId, { pan })
    studioEngine.setChannelPan(channelId, pan)
  }

  const handleMuteToggle = (channelId: string) => {
    const channel = project.channels.find(ch => ch.id === channelId)
    if (!channel) return
    const newMute = !channel.mute
    updateChannel(channelId, { mute: newMute })
    studioEngine.setChannelMute(channelId, newMute)
  }

  const handleSoloToggle = (channelId: string) => {
    const channel = project.channels.find(ch => ch.id === channelId)
    if (!channel) return
    const newSolo = !channel.solo

    // Update all channels - if turning on solo, others get muted
    const soloedIds = newSolo
      ? [...project.channels.filter(ch => ch.solo || ch.id === channelId).map(ch => ch.id)]
      : []

    project.channels.forEach(ch => {
      const shouldSolo = ch.id === channelId ? newSolo : (newSolo ? false : ch.solo)
      updateChannel(ch.id, { solo: shouldSolo })
    })

    studioEngine.setChannelSolo(soloedIds)
  }

  return (
    <div className="mixer-panel">
      <div className="mixer-header">
        <h3>Mixer</h3>
      </div>

      <div className="mixer-channels">
        {project.channels.map((channel) => (
          <div key={channel.id} className={`mixer-channel ${selectedChannel?.id === channel.id ? 'selected' : ''}`}>
            <div className="mixer-label">{channel.name}</div>

            <div className="mixer-controls">
              <div className="control-row">
                <label>Vol</label>
                <input
                  type="range"
                  min={-60}
                  max={6}
                  value={channel.volume}
                  onChange={(e) => handleVolumeChange(channel.id, Number(e.target.value))}
                />
                <span className="value">{channel.volume}dB</span>
              </div>

              <div className="control-row">
                <label>Pan</label>
                <input
                  type="range"
                  min={-1}
                  max={1}
                  step={0.1}
                  value={channel.pan}
                  onChange={(e) => handlePanChange(channel.id, Number(e.target.value))}
                />
                <span className="value">{channel.pan.toFixed(1)}</span>
              </div>

              <div className="control-buttons">
                <button
                  className={`mixer-btn mute ${channel.mute ? 'active' : ''}`}
                  onClick={() => handleMuteToggle(channel.id)}
                >
                  M
                </button>
                <button
                  className={`mixer-btn solo ${channel.solo ? 'active' : ''}`}
                  onClick={() => handleSoloToggle(channel.id)}
                >
                  S
                </button>
              </div>
            </div>
          </div>
        ))}

        {project.channels.length === 0 && (
          <div className="empty-mixer">
            <p>Adicione canais no Channel Rack</p>
          </div>
        )}
      </div>
    </div>
  )
}