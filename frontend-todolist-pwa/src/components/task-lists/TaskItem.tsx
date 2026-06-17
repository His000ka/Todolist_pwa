import type { SimpleTask } from "../../types/taskList"

type Props = {
  task: SimpleTask
  onToggle: (id: string, done: boolean) => void
  onDelete: (id: string) => void
  className?: string
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short'
  }) // "12 mars"
}

export default function TaskItem({ task, onToggle, onDelete, className = '' }: Props) {
  const isPending = task.id.startsWith('temp-')
  return (
    <li
      className={`lc-task-item glass-panel ${task.done ? 'done' : ''} ${task.id.startsWith('temp-') ? 'pending' : ''} ${className}`}
      onClick={() => onToggle(task.id, task.done)}
    >
      {/* checkbox */}
      <span className={`lc-task-check ${task.done ? "checked" : ""}`}>
        {task.done ? "✓" : ""}
      </span>

      {/* text */}
      <div className="lc-task-body">
        <span className="task-text">{task.text}</span>
        {!isPending && (
          <span className="lc-task-meta">
            {task.createdByUsername === undefined ? (
              <span className="lc-meta-skeleton" />
            ) : (
              task.createdByUsername ?? 'Sans pseudo'
            )} · {formatDate(task.createdAt)}
          </span>
        )}
      </div>

      {/* delete */}
      <button
        className="lc-task-delete"
        onClick={(e) => {
          e.stopPropagation()
          onDelete(task.id)
        }}
      >
        ✕
      </button>
    </li>
  )
}