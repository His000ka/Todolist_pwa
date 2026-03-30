import type { SimpleTask } from "../../types/taskList"

type Props = {
  task: SimpleTask
  onToggle: (id: string, done: boolean) => void
  onDelete: (id: string) => void
}

export default function TaskItem({ task, onToggle, onDelete }: Props) {
  return (
    <li
      className={`lc-task-item ${task.done ? 'done' : ''} ${task.id.startsWith('temp-') ? 'pending' : ''}`}
      onClick={() => onToggle(task.id, task.done)}
    >
      {/* checkbox */}
      <span className={`lc-task-check ${task.done ? "checked" : ""}`}>
        {task.done ? "✓" : ""}
      </span>

      {/* text */}
      <span className="task-text">{task.text}</span>

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