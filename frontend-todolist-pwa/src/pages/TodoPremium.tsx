import { useState, useRef, useEffect } from "react";
import Input from "../components/Input/Input";
import SelectField from "../components/Select/SelectField";



type TaskType = "one" | "daily" |"weekly";

type TaskPremium = {
  id: string;
  text: string;
  type: TaskType;
  createdAt: number;
  done: boolean;

  streak?: number; 
  lastCompleted?: number | null;

  target?: number; //weekly
  progress?: number; //step

  weight: number; // importance /10
  difficulty: number; // auto pronostique de difficulté àeffectué la tache
};

export default function TodoPremium() {
    const [tasks, setTasks] = useState<TaskPremium[]>(() => {
        const stored = localStorage.getItem("tasks_premium");
        return stored ? JSON.parse(stored) : [];
      });
    const [input, setInput] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("one");
  const [taskProgress, setTaskProgress] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem("todo_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!input.trim()) return;
    const newTask = createTask(taskType);
    setTasks((prev) => [...prev, newTask]);
    setInput("");
    inputRef.current?.focus();
  };

  const createTask = (type: TaskType): TaskPremium => {
    const base = { id: crypto.randomUUID(), text: input, type, createdAt: Date.now(), done: false, weight: 1, difficulty: 1 };
    if (type === "daily") return { ...base, streak: 0, lastCompleted: 0 };
    if (type === "weekly") return { ...base, target: taskProgress, progress: 0 };
    return base;
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    // J'ai enlevé "app-wrapper", "app-container" et "header" car ils sont gérés dans App.tsx
    <div className="list-course-content"> 
      <div className="input-group">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Nouvelle tâche..."
        />
        <SelectField
          value={taskType}
          onChange={(v) => setTaskType(v as TaskType)}
          options={[
            { value: "one", label: "Tâche unique" },
            { value: "daily", label: "Quotidienne" },
            { value: "weekly", label: "Hebdomadaire" },
          ]}
        />
        {taskType === "weekly" && (
          <SelectField
            value={taskProgress}
            onChange={(v) => setTaskProgress(Number(v))}
            options={[
              { value: 1, label: "Faible importance" },
              { value: 5, label: "Normal" },
              { value: 10, label: "Prioritaire" },
            ]}
          />
        )}
        <button className="btn-add" onClick={addTask}>Ajouter</button>
      </div>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className={task.done ? "task-item done" : "task-item"}>
            <span className="task-text" onClick={() => toggleTask(task.id)}>
              {task.text.length > 20 ? task.text.substring(0, 20) + "..." : task.text} [{task.type}]
              {task.type === "weekly" && (
                <span className="task-progress"> {task.progress} / {task.target} </span>
              )}
            </span>
            <button className="btn-del" onClick={() => task.done && deleteTask(task.id)}>
              {task.done ? "🗑️" : "🔒"}
            </button>
          </li>
        ))}
      </ul>

      {tasks.length === 0 && (
        <p className="empty-state">💤 Aucune tâche pour le moment</p>
      )}
    </div>
  );
}