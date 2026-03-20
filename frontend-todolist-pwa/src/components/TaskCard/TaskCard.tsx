import { useEffect, useRef } from "react";
import type { TaskPremium } from "../../pages/TodoPremium";
import "./TaskSheet.css";

type Props = {
  task: TaskPremium | null;
  onClose:    () => void;
  onToggle:   (id: string) => void;
  onDelete:   (id: string) => void;
  onDescEdit: (id: string, desc: string) => void;
};

const TYPE_LABELS: Record<string, string> = {
  one: "unique", daily: "quotidien", weekly: "hebdo",
};

export default function TaskSheet({ task, onClose, onToggle, onDelete, onDescEdit }: Props) {
  const sheetRef  = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startTRef = useRef(0);

  // Ferme avec Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Bloque le scroll du body quand le sheet est ouvert
  useEffect(() => {
    if (task) document.body.style.overflow = "hidden";
    else      document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [task]);

  // Drag to close
  const onTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    startTRef.current = Date.now();
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const dy = e.touches[0].clientY - startYRef.current;
    if (dy > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${dy}px)`;
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const dy = e.changedTouches[0].clientY - startYRef.current;
    const dt = Date.now() - startTRef.current;
    if (sheetRef.current) sheetRef.current.style.transform = "";
    // Ferme si glissé > 80px ou swipe rapide > 30px
    if (dy > 80 || (dy > 30 && dt < 200)) onClose();
  };

  const progress = task?.progress ?? 0;
  const target   = task?.target   ?? 1;
  const pct      = Math.round((progress / target) * 100);

  return (
    <>
      {/* Overlay blur */}
      <div
        className={`task-sheet-overlay ${task ? "show" : ""}`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`task-sheet ${task ? "show" : ""}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="task-sheet__handle" />

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

              {/* Progression hebdo */}
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

              {/* Description */}
              <textarea
                className="task-sheet__desc"
                placeholder="Ajouter une description..."
                value={task.description ?? ""}
                onChange={e => onDescEdit(task.id, e.target.value)}
                rows={3}
              />

              {/* Meta */}
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

              {/* Actions */}
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
    </>
  );
}