import { useEffect, useState, useRef } from "react";
import Input from "../components/Input/Input";
import "./ListeCourse.css"


type Task = {
  id: string;
  text: string;
  createdAt: number;
  done: boolean;
};

export default function ListeCourse() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem("todo_tasks");
    return stored ? JSON.parse(stored) : [];
  });
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem("todo_tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!input.trim()) return;
    const newTask = createTask();
    setTasks((prev) => [...prev, newTask]);
    setInput("");
    inputRef.current?.focus();
  };

  const createTask = (): Task => {
    const base = { id: crypto.randomUUID(), text: input, createdAt: Date.now(), done: false };
    return base;
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="list-course-content"> 
      <div className="input-group">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Nouvelle tâche..."
        />
        <button className="btn-add" onClick={addTask}>Ajouter</button>
      </div>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className={task.done ? "lc-task-item done" : "lc-task-item"}>
            <span className="task-text" onClick={() => toggleTask(task.id)}>
              {task.text.length > 20 ? task.text.substring(0, 20) + "..." : task.text}
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
