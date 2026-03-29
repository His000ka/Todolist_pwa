type Member = {
  id: string
  username?: string
  role: string
}

type List = {
  id: string
  name: string
  emoji: string
  tasks: { done: boolean }[]
  ownerId: string
  members: Member[]
}

type Props = {
  list: List 
  isOwner: boolean
  onToggleShare: () => void
  onToggleOptions: () => void
}

export default function ListHeader({
  list,
  isOwner,
  onToggleShare,
  onToggleOptions,
}: Props) {
  return (
    <div className="lc-header">
      <div className="lc-header-left">
        <span className="lc-header-emoji">{list.emoji}</span>
        <h2 className="lc-header-name">{list.name}</h2>
        <span className="lc-header-count">
          {list.tasks.filter((t) => !t.done).length} restantes
        </span>
      </div>

      <div className="lc-header-actions">
        {isOwner && (
          <button className="lc-icon-btn" onClick={onToggleShare}>
            👥
          </button>
        )}
        {isOwner && (
          <button className="lc-icon-btn" onClick={onToggleOptions}>
            ⋯
          </button>
        )}
      </div>
    </div>
  )
}