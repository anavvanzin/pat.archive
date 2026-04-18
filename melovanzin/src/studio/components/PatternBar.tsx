// ============================================================
// PATTERN BAR - Seletor de patterns e duplicar
// ============================================================

import { useStudioStore, useActiveProject } from '../useStudioStore'

export function PatternBar() {
  const project = useActiveProject()
  const { selection, selectPattern, addPattern, deletePattern } = useStudioStore()

  if (!project) return null

  return (
    <div className="pattern-bar">
      <div className="pattern-header">
        <h3>Patterns</h3>
      </div>

      <div className="pattern-list">
        {project.patternOrder.map((patternId, index) => (
          <button
            key={patternId}
            className={`pattern-btn ${selection.selectedPatternId === patternId ? 'active' : ''}`}
            onClick={() => selectPattern(patternId)}
          >
            {String.fromCharCode(97 + index)}
          </button>
        ))}

        <button className="pattern-btn add" onClick={addPattern}>
          +
        </button>
      </div>

      {project.patternOrder.length > 1 && (
        <button
          className="delete-pattern-btn"
          onClick={() => {
            if (selection.selectedPatternId) {
              deletePattern(selection.selectedPatternId)
            }
          }}
        >
          🗑
        </button>
      )}
    </div>
  )
}