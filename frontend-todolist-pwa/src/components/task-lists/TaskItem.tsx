import type { SimpleTask } from "../../types/taskList"

type Props = {
  task: SimpleTask
  onToggle: (id: string, done: boolean) => void
  onDelete: (id: string) => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short'
  }) // "12 mars"
}

export default function TaskItem({ task, onToggle, onDelete }: Props) {
  const isPending = task.id.startsWith('temp-')
  return (
    <li
      className={`lc-task-item glass ${task.done ? 'done' : ''} ${task.id.startsWith('temp-') ? 'pending' : ''}`}
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
            {task.createdByUsername ?? 'Inconnu'} · {formatDate(task.createdAt)}
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