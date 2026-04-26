type Props = {
  onExit: () => void
  onOpenWorld: (world: 'hub' | 'discord' | 'tibia' | 'botlane') => void
}

export default function StudioScreen({ onExit }: Props) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        color: 'var(--pk)',
      }}
    >
      <h1>Studio</h1>
      <p>Coming soon</p>
      <button onClick={onExit}>← back</button>
    </div>
  )
}
