type List = {
  id: string
  name: string
  emoji: string
}

type Props = {
  lists: List[]
  activeListId?: string
  removingIds?: Set<string>
  onSelect: (id: string) => void
  onCreateClick: () => void
}

export default function ListSelector({
  lists,
  activeListId,
  removingIds,
  onSelect,
  onCreateClick,
}: Props) {
  return (
    <div className="lc-lists-row">
      <div className="lc-lists-scroll">
        {lists.map((l) => (
          <button
            key={l.id}
            className={`lc-list-pill glass-panel ${l.id === activeListId ? "active" : ""} ${removingIds?.has(l.id) ? "lc-exit" : ""}`}
            onClick={() => onSelect(l.id)}
          >
            <span>{l.emoji}</span>
            <span>{l.name}</span>
          </button>
        ))}
      </div>

      <button className="lc-new-list-btn" onClick={onCreateClick}>
        +
      </button>
    </div>
  )
}