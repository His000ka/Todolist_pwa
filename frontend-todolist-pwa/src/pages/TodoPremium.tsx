import { useState, useRef, useEffect } from "react";
import Input from "../components/Input/Input";
import { usePremiumTasks } from '../hooks/usePremiumTasks'
import TaskSheet from "../components/TaskSheet/TaskSheet";
import { useGarden } from "../hooks/useGarden";
// import { calculateXP, getTodayKey, isTaskLocked } from '../utils/taskUtils'
import { useNotifications } from '../hooks/useNotifications'
import "./TodoPremium.css";



const TYPE_LABELS: Record<string, string> = {
  one: "unique",
  daily: "quotidien",
  weekly: "hebdo",
};

type TaskType = "one" | "daily" | "weekly";

export type TaskPremium = {
  id: string;
  text: string;
  type: TaskType;
  createdAt: number;
  done: boolean;
  streak?: number;
  lastCompleted?: number | null;
  target?: number;
  progress?: number;
  weight: number;
  difficulty: number;
  description: string;
  notificationsEnabled: boolean;
};

const TARGET_OPTIONS = [1,2,3,4,5,6,7];

// Met à jour le dégradé CSS du slider via une custom property
function updateSliderBg(el: HTMLInputElement) {
  const pct = ((Number(el.value) - 1) / 9 * 100).toFixed(0) + "%";
  el.style.setProperty("--slider-pct", pct);
}

export default function TodoPremium() {
    const { addXP } = useGarden()

  const { tasks, addTask, completeTask, deleteTask, editDesc, toggleNotif } = usePremiumTasks(addXP)

  const { requestPermission } = useNotifications(tasks)

  const [input,      setInput]      = useState("");
  const [taskType,   setTaskType]   = useState<TaskType>("one");
  const [importance, setImportance] = useState(5);
  const [difficulty, setDifficulty] = useState(3);
  const [target,     setTarget]     = useState(3);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask = tasks.find(t => t.id === selectedTaskId) ?? null;


  const inputRef     = useRef<HTMLInputElement>(null);
  const impSliderRef = useRef<HTMLInputElement>(null);
  const difSliderRef = useRef<HTMLInputElement>(null);

  // Init des dégradés sliders au montage
  useEffect(() => {
    if (impSliderRef.current) updateSliderBg(impSliderRef.current);
    if (difSliderRef.current) updateSliderBg(difSliderRef.current);
  }, []);

  useEffect(() => {
    requestPermission()
  }, [requestPermission])

  const handleAddTask = () => {
    if (!input.trim()) return
    const base: TaskPremium = {
      id:          crypto.randomUUID(),
      text:        input,
      type:        taskType,
      createdAt:   Date.now(),
      done:        false,
      weight:      importance,
      difficulty,
      description: '',
      notificationsEnabled: true,
    }
    const task = taskType === 'daily'
      ? { ...base, streak: 0, lastCompleted: null }
      : taskType === 'weekly'
      ? { ...base, target, progress: 0 }
      : base

    addTask(task)
    setInput('')
    inputRef.current?.focus()
  }

  const handleImpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportance(Number(e.target.value));
    updateSliderBg(e.target);
  };

  const handleDifChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDifficulty(Number(e.target.value));
    updateSliderBg(e.target);
  };

  return (
    <div className="list-course-content">

      {/* ---- Formulaire ---- */}
      <div className="task-form">

        <Input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAddTask()}
          placeholder="Nouvelle tâche..."
          className="task-form__input"
        />

        <div className="task-form__divider" />

        {/* Type */}
        <div className="task-form__row">
          <span className="task-form__label">Type</span>
          <div className="task-form__pills">
            {(["one", "daily", "weekly"] as TaskType[]).map(t => (
              <span
                key={t}
                onClick={() => setTaskType(t)}
                className={`task-form__pill task-form__pill--${t} ${taskType === t ? "active" : ""}`}
              >
                {t === "one" ? "Unique" : t === "daily" ? "Quotidien" : "Hebdo"}
              </span>
            ))}
          </div>
        </div>

        <div className="task-form__divider" />

        {/* Importance */}
        <div className="task-form__row">
          <span className="task-form__label">Importance</span>
          <div className="task-form__slider-wrap">
            <div className="task-form__slider-inner">
              <input
                ref={impSliderRef}
                type="range" min="1" max="10" step="1"
                value={importance}
                onChange={handleImpChange}
                className="task-form__slider task-form__slider--importance"
              />
              <span className="task-form__slider-val">{importance}</span>
            </div>
            <div className="task-form__slider-labels">
              <span>faible</span><span>critique</span>
            </div>
          </div>
        </div>

        {/* Difficulté */}
        <div className="task-form__row">
          <span className="task-form__label">Difficulté</span>
          <div className="task-form__slider-wrap">
            <div className="task-form__slider-inner">
              <input
                ref={difSliderRef}
                type="range" min="1" max="10" step="1"
                value={difficulty}
                onChange={handleDifChange}
                className="task-form__slider task-form__slider--difficulty"
              />
              <span className="task-form__slider-val">{difficulty}</span>
            </div>
            <div className="task-form__slider-labels">
              <span>facile</span><span>très dur</span>
            </div>
          </div>
        </div>

        {/* Objectif hebdo — visible seulement si weekly */}
        {taskType === "weekly" && (
          <>
            <div className="task-form__divider" />
            <div className="task-form__weekly">
              <div className="task-form__row">
                <span className="task-form__label">Objectif</span>
                <div className="task-form__targets">
                  {TARGET_OPTIONS.map(n => (
                    <button
                      key={n}
                      onClick={() => setTarget(n)}
                      className={`task-form__target-btn ${target === n ? "active" : ""}`}
                    >
                      {n}×
                    </button>
                  ))}
                </div>
              </div>
              <p className="task-form__weekly-summary">
                {target}× par semaine
              </p>
            </div>
          </>
        )}

        <button className="task-form__submit" onClick={handleAddTask}>
          Ajouter la tâche
        </button>
      </div>

      {/* ---- Liste ---- */}
      <div className="task-list">
        {tasks.map(task => (
            <div
            key={task.id}
            className={`task-item ${task.done ? "done" : ""}`}
            onClick={() => setSelectedTaskId(task.id)}
            >
            {/* Pill type */}
            <span className={`task-card__type task-card__type--${task.type}`}>
                {TYPE_LABELS[task.type]}
            </span>

            {/* Texte */}
            <span className="task-text">{task.text}</span>

            {/* Progress hebdo inline */}
            {task.type === "weekly" && (
                <span className="task-item__progress">
                {task.progress ?? 0}/{task.target}×
                </span>
            )}

            {/* Dots importance */}
            <div className="task-card__dots">
                {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className={`task-card__dot ${i < Math.round(task.weight / 2) ? `active ${task.type}` : ""}`}
                />
                ))}
            </div>
            </div>
        ))}
        </div>

    <TaskSheet
      task={selectedTask}
      onClose={() => setSelectedTaskId(null)}
      onComplete={completeTask}
      onDelete={deleteTask}
      onDescEdit={editDesc}
      onToggleNotif={toggleNotif}
    />

      {tasks.length === 0 && (
        <p className="empty-state">Aucune tâche pour le moment</p>
      )}
    </div>
  );
}
