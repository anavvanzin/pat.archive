import { useActiveProject, useStudioStore } from '../useStudioStore'

export function MixerPanel() {
  const project = useActiveProject()
  const selectedChannel = useStudioStore((state) =>
    state.project.channels.find((channel) => channel.id === state.selection.selectedChannelId) ??
    state.project.channels[0] ??
    null
  )
  const updateChannel = useStudioStore((state) => state.updateChannel)

  if (!selectedChannel) {
    return (
      <aside className="mixer-panel panel-card">
        <div className="panel-heading">
          <div>
            <h3>Mixer</h3>
            <p>Quando um canal nascer, o controle fino aparece aqui.</p>
          </div>
        </div>
        <div className="empty-state">
          <strong>Sem canal selecionado.</strong>
          <span>Escolhe um sample e a gente abre volume, panorama e FX pra lapidar o som.</span>
        </div>
      </aside>
    )
  }

  const toggleBool = (field: 'mute' | 'solo') =>
    updateChannel(selectedChannel.id, { [field]: !selectedChannel[field] })

  return (
    <aside className="mixer-panel panel-card">
      <div className="panel-heading">
        <div>
          <h3>Mixer + FX</h3>
          <p>
            {selectedChannel.name} · o lugar onde o sample deixa de ser só recorte e vira escolha.
          </p>
        </div>
      </div>

      <div className="selected-strip">
        <span className="channel-swatch big" style={{ background: selectedChannel.color }} />
        <div>
          <strong>{selectedChannel.name}</strong>
          <p>{selectedChannel.source.sourceLabel}</p>
        </div>
      </div>

      <div className="mixer-group">
        <label>
          Volume
          <input
            type="range"
            min={-24}
            max={6}
            step={1}
            value={selectedChannel.volume}
            onChange={(event) => updateChannel(selectedChannel.id, { volume: Number(event.target.value) })}
          />
        </label>
        <label>
          Pan
          <input
            type="range"
            min={-1}
            max={1}
            step={0.05}
            value={selectedChannel.pan}
            onChange={(event) => updateChannel(selectedChannel.id, { pan: Number(event.target.value) })}
          />
        </label>
        <div className="toggle-row">
          <button className={selectedChannel.mute ? 'active' : ''} onClick={() => toggleBool('mute')}>
            mute
          </button>
          <button className={selectedChannel.solo ? 'active' : ''} onClick={() => toggleBool('solo')}>
            solo
          </button>
        </div>
      </div>

      <div className="mixer-group">
        <h4>Filter</h4>
        <div className="toggle-row">
          <button
            className={selectedChannel.fx.filter.enabled ? 'active' : ''}
            onClick={() =>
              updateChannel(selectedChannel.id, {
                fx: {
                  ...selectedChannel.fx,
                  filter: {
                    ...selectedChannel.fx.filter,
                    enabled: !selectedChannel.fx.filter.enabled,
                  },
                },
              })
            }
          >
            {selectedChannel.fx.filter.enabled ? 'on' : 'off'}
          </button>
        </div>
        <label>
          Frequency
          <input
            type="range"
            min={200}
            max={18000}
            step={100}
            value={selectedChannel.fx.filter.frequency}
            onChange={(event) =>
              updateChannel(selectedChannel.id, {
                fx: {
                  ...selectedChannel.fx,
                  filter: {
                    ...selectedChannel.fx.filter,
                    frequency: Number(event.target.value),
                  },
                },
              })
            }
          />
        </label>
      </div>

      <div className="mixer-group">
        <h4>Delay</h4>
        <div className="toggle-row">
          <button
            className={selectedChannel.fx.delay.enabled ? 'active' : ''}
            onClick={() =>
              updateChannel(selectedChannel.id, {
                fx: {
                  ...selectedChannel.fx,
                  delay: {
                    ...selectedChannel.fx.delay,
                    enabled: !selectedChannel.fx.delay.enabled,
                  },
                },
              })
            }
          >
            {selectedChannel.fx.delay.enabled ? 'on' : 'off'}
          </button>
        </div>
        <label>
          Wet
          <input
            type="range"
            min={0}
            max={0.9}
            step={0.05}
            value={selectedChannel.fx.delay.wet}
            onChange={(event) =>
              updateChannel(selectedChannel.id, {
                fx: {
                  ...selectedChannel.fx,
                  delay: {
                    ...selectedChannel.fx.delay,
                    wet: Number(event.target.value),
                  },
                },
              })
            }
          />
        </label>
        <label>
          Feedback
          <input
            type="range"
            min={0}
            max={0.85}
            step={0.05}
            value={selectedChannel.fx.delay.feedback}
            onChange={(event) =>
              updateChannel(selectedChannel.id, {
                fx: {
                  ...selectedChannel.fx,
                  delay: {
                    ...selectedChannel.fx.delay,
                    feedback: Number(event.target.value),
                  },
                },
              })
            }
          />
        </label>
      </div>

      <div className="mixer-group">
        <h4>Reverb</h4>
        <div className="toggle-row">
          <button
            className={selectedChannel.fx.reverb.enabled ? 'active' : ''}
            onClick={() =>
              updateChannel(selectedChannel.id, {
                fx: {
                  ...selectedChannel.fx,
                  reverb: {
                    ...selectedChannel.fx.reverb,
                    enabled: !selectedChannel.fx.reverb.enabled,
                  },
                },
              })
            }
          >
            {selectedChannel.fx.reverb.enabled ? 'on' : 'off'}
          </button>
        </div>
        <label>
          Wet
          <input
            type="range"
            min={0}
            max={0.95}
            step={0.05}
            value={selectedChannel.fx.reverb.wet}
            onChange={(event) =>
              updateChannel(selectedChannel.id, {
                fx: {
                  ...selectedChannel.fx,
                  reverb: {
                    ...selectedChannel.fx.reverb,
                    wet: Number(event.target.value),
                  },
                },
              })
            }
          />
        </label>
        <label>
          Decay
          <input
            type="range"
            min={0.6}
            max={5}
            step={0.2}
            value={selectedChannel.fx.reverb.decay}
            onChange={(event) =>
              updateChannel(selectedChannel.id, {
                fx: {
                  ...selectedChannel.fx,
                  reverb: {
                    ...selectedChannel.fx.reverb,
                    decay: Number(event.target.value),
                  },
                },
              })
            }
          />
        </label>
      </div>

      <div className="mixer-footer">
        <span>{project.channels.length} canais prontos para brincar de producao.</span>
      </div>
    </aside>
  )
}
