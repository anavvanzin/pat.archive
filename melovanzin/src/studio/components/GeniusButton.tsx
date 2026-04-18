// ============================================================
// GENIUS BUTTON - Placeholder visual do co-producer futuro
// ============================================================

export function GeniusButton() {
  const handleClick = () => {
    alert('🧞 Co-producer em desenvolvimento...\n\nEm breve o gênio da lâmpada帮你 produzir músicas!')
  }

  return (
    <button className="genius-button" onClick={handleClick}>
      <span className="genie-icon">🧞</span>
      <span className="genie-label">Gênio</span>
    </button>
  )
}