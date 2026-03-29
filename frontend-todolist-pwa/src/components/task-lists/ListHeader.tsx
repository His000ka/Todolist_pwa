import type { SimpleTaskList } from "../../types/taskList"

type Props = {
  list: SimpleTaskList 
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