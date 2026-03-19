import { useEffect, useState, useRef } from "react";
import "./App.css";
import Input from "./components/Input";

type Task = { id: string; text: string; done: boolean };

const themes = {
  sunset: { name: "🌅", class: "theme-sunset" },
  ocean: { name: "🌊", class: "theme-ocean" },
  emerald: { name: "🍃", class: "theme-emerald" },
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem("todo_tasks");
    return stored ? JSON.parse(stored) : [];
  });
  const [input, setInput] = useState("");
  const [theme, setTheme] = useState("sunset");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem("todo_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    // On applique la classe du thème directement sur l'élément HTML
    const currentThemeClass = themes[theme as keyof typeof themes].class;
    document.documentElement.className = currentThemeClass;
    }, [theme]);

  const addTask = () => {
    if (!input.trim()) return;
    
    const newTask: Task = {
      id: crypto.randomUUID(), 
      text: input,
      done: false,
    };

    setTasks((prev) => [...prev, newTask]);
    setInput("");
    inputRef.current?.focus();
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className={`app-wrapper ${themes[theme as keyof typeof themes].class}`}>
      {/* Background vivant */}
      <div className="bg-animation">
        <div className="orbe orbe-1"></div>
        <div className="orbe orbe-2"></div>
      </div>

      <div className="app-container">
        <header className="app-header">
          <h1>Ma Todo</h1>
          <div className="theme-selector">
            {Object.entries(themes).map(([key, t]) => (
              <button 
                key={key} 
                className={theme === key ? "active" : ""} 
                onClick={() => setTheme(key)}
              >
                {t.name}
              </button>
            ))}
          </div>
        </header>
        

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
            <li key={task.id} className={task.done ? "task-item done" : "task-item"}>
              <span className="task-text" onClick={() => toggleTask(task.id)}>
                {task.text.length > 20 ? task.text.substring(0, 20) + "..." : task.text}
              </span>
              <button 
                className="btn-del" 
                onClick={() => task.done && deleteTask(task.id)}
              >
                {task.done ? "🗑️" : "🔒"}
              </button>
            </li>
          ))}
        </ul>

        {tasks.length === 0 && (
          <p className="empty-state">💤 Aucune tâche pour le moment</p>
        )}
      </div>
    </div>
  );
}