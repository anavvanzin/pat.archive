// ============================================================
// PROJECT MANAGER - Salvar/carregar projetos
// ============================================================

import { useStudioStore } from '../useStudioStore'

export function ProjectManager() {
  const { projects, activeProjectId, createProject, deleteProject, setActiveProject } = useStudioStore()

  const handleNew = () => {
    const name = prompt('Nome do projeto:', 'Novo Projeto')
    if (name) {
      createProject(name)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      deleteProject(id)
    }
  }

  const projectList = Object.values(projects)

  return (
    <div className="project-manager">
      <div className="manager-header">
        <h3>Projetos</h3>
        <button className="new-project-btn" onClick={handleNew}>
          + Novo
        </button>
      </div>

      <div className="projects-list">
        {projectList.map((project) => (
          <div
            key={project.id}
            className={`project-item ${activeProjectId === project.id ? 'active' : ''}`}
          >
            <button
              className="project-name-btn"
              onClick={() => setActiveProject(project.id)}
            >
              {project.name}
            </button>
            <span className="project-info">
              {project.channels.length} canais • {project.bpm} BPM
            </span>
            <button
              className="delete-btn"
              onClick={() => handleDelete(project.id)}
            >
              🗑
            </button>
          </div>
        ))}

        {projectList.length === 0 && (
          <div className="empty-projects">
            <p>Nenhum projeto salvo</p>
            <button onClick={handleNew}>Criar primeiro projeto</button>
          </div>
        )}
      </div>
    </div>
  )
}