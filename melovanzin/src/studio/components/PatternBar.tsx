import { useActiveProject, useStudioStore } from '../useStudioStore'

export function PatternBar() {
  const project = useActiveProject()
  const { selection, selectPattern, duplicateSelectedPattern } = useStudioStore()

  return (
    <section className="pattern-bar panel-card">
      <div className="panel-heading">
        <div>
          <h3>Patterns</h3>
          <p>Duplica ideias e testa variacoes como quem descobre um refrão novo.</p>
        </div>
        <button className="tiny-button" onClick={duplicateSelectedPattern}>
          duplicar
        </button>
      </div>

      <div className="pattern-list">
        {project.patternOrder.map((patternId, index) => {
          const pattern = project.patterns[patternId]
          return (
            <button
              key={patternId}
              className={`pattern-pill ${selection.selectedPatternId === patternId ? 'active' : ''}`}
              onClick={() => selectPattern(patternId)}
            >
              <span className="pattern-letter">{String.fromCharCode(65 + index)}</span>
              <span>{pattern.name}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
