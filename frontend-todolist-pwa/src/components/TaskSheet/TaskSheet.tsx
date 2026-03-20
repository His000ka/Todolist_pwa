import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { TaskPremium } from "../../pages/TodoPremium";
import "./TaskSheet.css";

type Props = {
  task: TaskPremium | null;
  onClose:    () => void;
  onToggle:   (id: string) => void;
  onDelete:   (id: string) => void;
  onDescEdit: (id: string, desc: string) => void;
};

export const TYPE_LABELS: Record<string, string> = {
  one: "unique", daily: "quotidien", weekly: "hebdo",
};

export default function TaskSheet({ task, onClose, onToggle, onDelete, onDescEdit }: Props) {

  // Ferme avec Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Bloque le scroll derrière quand ouvert
  useEffect(() => {
    if (task) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none"; // bloque aussi le scroll tactile iOS
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [task]);

  const progress = task?.progress ?? 0;
  const target   = task?.target   ?? 1;
  const pct      = Math.round((progress / target) * 100);

  return createPortal(
    <>
      {/* Overlay — clic ferme */}
      <div
        className={`task-sheet-overlay ${task ? "show" : ""}`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div className={`task-sheet ${task ? "show" : ""}`}>

        {task && (
          <>
            <div className="task-sheet__header">
              <span className={`task-sheet__pill task-sheet__pill--${task.type}`}>
                {TYPE_LABELS[task.type]}
              </span>
              <h2 className="task-sheet__title">{task.text}</h2>
              <button className="task-sheet__close" onClick={onClose}>✕</button>
            </div>

            <div className="task-sheet__body">

              {task.type === "weekly" && (
                <>
                  <div className="task-sheet__progress">
                    <div className="task-sheet__progress-header">
                      <span className="task-sheet__progress-label">Progression</span>
                      <span className="task-sheet__progress-count">{progress} / {target}×</span>
                    </div>
                    <div className="task-sheet__progress-bar">
                      <div className="task-sheet__progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="task-sheet__sep" />
                </>
              )}

              <textarea
                className="task-sheet__desc"
                placeholder="Ajouter une description..."
                value={task.description ?? ""}
                onChange={e => onDescEdit(task.id, e.target.value)}
                rows={3}
              />

              <div className="task-sheet__meta">
                <div className="task-sheet__meta-card">
                  <span className="task-sheet__meta-label">Importance</span>
                  <span className="task-sheet__meta-val">{task.weight} / 10</span>
                </div>
                <div className="task-sheet__meta-card">
                  <span className="task-sheet__meta-label">Difficulté</span>
                  <span className="task-sheet__meta-val">{task.difficulty} / 10</span>
                </div>
                {task.type === "daily" && task.streak != null && (
                  <div className="task-sheet__meta-card">
                    <span className="task-sheet__meta-label">Streak</span>
                    <span className="task-sheet__meta-val task-sheet__meta-val--streak">
                      {task.streak}j
                    </span>
                  </div>
                )}
              </div>

              <div className="task-sheet__actions">
                <button
                  className={`task-sheet__btn-done ${task.done ? "done" : ""}`}
                  onClick={() => { onToggle(task.id); onClose(); }}
                >
                  {task.done ? "✓ Fait" : "✓ Marquer fait"}
                </button>
                <button
                  className="task-sheet__btn-del"
                  onClick={() => { onDelete(task.id); onClose(); }}
                >
                  Supprimer
                </button>
              </div>

            </div>
          </>
        )}
      </div>
    </>,
    document.body
  );
}