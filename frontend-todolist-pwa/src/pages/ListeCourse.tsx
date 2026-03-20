import { useEffect, useState, useRef } from "react";
import Input from "../components/Input/Input";
import SelectField from "../components/Select/SelectField";
// Note : J'ai retiré l'import du Theme et des classes liées.

type TaskType = "one" | "daily" | "weekly";

type Task = {
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
};

export default function ListCourse() { // Attention au nom de la fonction
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem("todo_tasks");
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

  const createTask = (type: TaskType): Task => {
    const base = { id: crypto.randomUUID(), text: input, type, createdAt: Date.now(), done: false, weight: 1 };
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

// import { useEffect, useState, useRef } from "react";
// import Input from "../components/Input/Input";
// import SelectField from "../components/Select/SelectField";

// type TaskType = "one" | "daily" | "weekly";

// type Task = {
//     id: string;
//     text: string;
//     type: TaskType;

//     createdAt: number;
//     done: boolean;

//     //daily
//     streak?: number;
//     lastCompleted?: number | null;

//     //weekly
//     target?: number;
//     progress?: number;

//     //importance
//     weight: number;
// };

// const themes = {
//   sunset: { name: "🌅", class: "theme-sunset" },
//   ocean: { name: "🌊", class: "theme-ocean" },
//   emerald: { name: "🍃", class: "theme-emerald" },
// };

// export default function ListCourse() {
//   const [tasks, setTasks] = useState<Task[]>(() => {
//     const stored = localStorage.getItem("todo_tasks");
//     return stored ? JSON.parse(stored) : [];
//   });
//   const [input, setInput] = useState("");
//   const [theme, setTheme] = useState("sunset");
//   const [taskType, setTaskType] = useState<TaskType>("one");
//   const [taskProgress, setTaskProgress] = useState(1);
//   const inputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     localStorage.setItem("todo_tasks", JSON.stringify(tasks));
//   }, [tasks]);

//   useEffect(() => {
//     // On applique la classe du thème directement sur l'élément HTML
//     const currentThemeClass = themes[theme as keyof typeof themes].class;
//     document.documentElement.className = currentThemeClass;
//     }, [theme]);


//     const addTask = () => {
//         if (!input.trim()) return;

//         const newTask = createTask(taskType);

//         setTasks((prev) => [...prev, newTask]);
//         setInput("");
//         inputRef.current?.focus();
//     };

//     const createTask = (type: TaskType): Task => {
//         const base = {
//             id: crypto.randomUUID(),
//             text: input,
//             type,
//             createdAt: Date.now(),
//             done: false,
//             weight: 1,
//         };

//         if (type === "daily") {
//             return {
//             ...base,
//             streak: 0,
//             lastCompleted: 0,
//             };
//         }

//         if (type === "weekly") {
//             return {
//             ...base,
//             target: taskProgress,
//             progress: 0,
//             };
//         }

//         return base; // one-time
//     };

//     const toggleTask = (id: string) => {
//     setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
//     };

//     const deleteTask = (id: string) => {
//     setTasks(tasks.filter(t => t.id !== id));
//     };

//   return (
//     <div className={`app-wrapper ${themes[theme as keyof typeof themes].class}`}>
//       {/* Background vivant */}
//       <div className="bg-animation">
//         <div className="orbe orbe-1"></div>
//         <div className="orbe orbe-2"></div>
//       </div>

//       <div className="app-container">
//         <header className="app-header">
//           <h1>Ma Todo</h1>
//           <div className="theme-selector">
//             {Object.entries(themes).map(([key, t]) => (
//               <button 
//                 key={key} 
//                 className={theme === key ? "active" : ""} 
//                 onClick={() => setTheme(key)}
//               >
//                 {t.name}
//               </button>
//             ))}
//           </div>
//         </header>
        

//         <div className="input-group">
//           <Input
//             ref={inputRef}
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && addTask()}
//             placeholder="Nouvelle tâche..."
//           />
//           <SelectField
//             value={taskType}
//             onChange={(v) => setTaskType(v as TaskType)}
//             options={[
//                 { value: "one", label: "Tâche unique" },
//                 { value: "daily", label: "Quotidienne" },
//                 { value: "weekly", label: "Hebdomadaire" },
//             ]}
//             />
//           {taskType === "weekly" && (
//             <SelectField
//                 value={taskProgress}
//                 onChange={(v) => setTaskProgress(Number(v))}
//                 options={[
//                     { value: 1, label: "Faible importance" },
//                     { value: 5, label: "Normal" },
//                     { value: 10, label: "Prioritaire" },
//                 ]}
//             />
//           )}
//           <button className="btn-add" onClick={addTask}>Ajouter</button>
//         </div>

//         <ul className="task-list">
//           {tasks.map((task) => (
//             <li key={task.id} className={task.done ? "task-item done" : "task-item"}>
//               <span className="task-text" onClick={() => toggleTask(task.id)}>
//                 {task.text.length > 20 ? task.text.substring(0, 20) + "..." : task.text}
//                 [{task.type}]
//                 {task.type === "weekly" && (
//                     <span className="task-progress">
//                         {task.progress} / {task.target}
//                     </span>
//                     )}
//               </span>
//               <button 
//                 className="btn-del" 
//                 onClick={() => task.done && deleteTask(task.id)}
//               >
//                 {task.done ? "🗑️" : "🔒"}
//               </button>
//             </li>
//           ))}
//         </ul>

//         {tasks.length === 0 && (
//           <p className="empty-state">💤 Aucune tâche pour le moment</p>
//         )}
//       </div>
//     </div>
//   );
// }


// import { useEffect, useState, useRef } from "react";
// import Input from "../components/Input/Input";
// import SelectField from "../components/Select/SelectField";

// type TaskType = "one" | "daily" | "weekly";

// type Task = {
//     id: string;
//     text: string;
//     type: TaskType;

//     createdAt: number;
//     done: boolean;

//     //daily
//     streak?: number;
//     lastCompleted?: number | null;

//     //weekly
//     target?: number;
//     progress?: number;

//     //importance
//     weight: number;
// };

// const themes = {
//   sunset: { name: "🌅", class: "theme-sunset" },
//   ocean: { name: "🌊", class: "theme-ocean" },
//   emerald: { name: "🍃", class: "theme-emerald" },
// };

// export default function App() {
//   const [tasks, setTasks] = useState<Task[]>(() => {
//     const stored = localStorage.getItem("todo_tasks");
//     return stored ? JSON.parse(stored) : [];
//   });
//   const [input, setInput] = useState("");
//   const [theme, setTheme] = useState("sunset");
//   const [taskType, setTaskType] = useState<TaskType>("one");
//   const [taskProgress, setTaskProgress] = useState(1);
//   const inputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     localStorage.setItem("todo_tasks", JSON.stringify(tasks));
//   }, [tasks]);

//   useEffect(() => {
//     // On applique la classe du thème directement sur l'élément HTML
//     const currentThemeClass = themes[theme as keyof typeof themes].class;
//     document.documentElement.className = currentThemeClass;
//     }, [theme]);


//     const addTask = () => {
//         if (!input.trim()) return;

//         const newTask = createTask(taskType);

//         setTasks((prev) => [...prev, newTask]);
//         setInput("");
//         inputRef.current?.focus();
//     };

//     const createTask = (type: TaskType): Task => {
//         const base = {
//             id: crypto.randomUUID(),
//             text: input,
//             type,
//             createdAt: Date.now(),
//             done: false,
//             weight: 1,
//         };

//         if (type === "daily") {
//             return {
//             ...base,
//             streak: 0,
//             lastCompleted: 0,
//             };
//         }

//         if (type === "weekly") {
//             return {
//             ...base,
//             target: taskProgress,
//             progress: 0,
//             };
//         }

//         return base; // one-time
//     };

//     const toggleTask = (id: string) => {
//     setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
//     };

//     const deleteTask = (id: string) => {
//     setTasks(tasks.filter(t => t.id !== id));
//     };

//   return (
//     <div className={`app-wrapper ${themes[theme as keyof typeof themes].class}`}>
//       {/* Background vivant */}
//       <div className="bg-animation">
//         <div className="orbe orbe-1"></div>
//         <div className="orbe orbe-2"></div>
//       </div>

//       <div className="app-container">
//         <header className="app-header">
//           <h1>Ma Todo</h1>
//           <div className="theme-selector">
//             {Object.entries(themes).map(([key, t]) => (
//               <button 
//                 key={key} 
//                 className={theme === key ? "active" : ""} 
//                 onClick={() => setTheme(key)}
//               >
//                 {t.name}
//               </button>
//             ))}
//           </div>
//         </header>
        

//         <div className="input-group">
//           <Input
//             ref={inputRef}
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && addTask()}
//             placeholder="Nouvelle tâche..."
//           />
//           <SelectField
//             value={taskType}
//             onChange={(v) => setTaskType(v as TaskType)}
//             options={[
//                 { value: "one", label: "Tâche unique" },
//                 { value: "daily", label: "Quotidienne" },
//                 { value: "weekly", label: "Hebdomadaire" },
//             ]}
//             />
//           {taskType === "weekly" && (
//             <SelectField
//                 value={taskProgress}
//                 onChange={(v) => setTaskProgress(Number(v))}
//                 options={[
//                     { value: 1, label: "Faible importance" },
//                     { value: 5, label: "Normal" },
//                     { value: 10, label: "Prioritaire" },
//                 ]}
//             />
//           )}
//           <button className="btn-add" onClick={addTask}>Ajouter</button>
//         </div>

//         <ul className="task-list">
//           {tasks.map((task) => (
//             <li key={task.id} className={task.done ? "task-item done" : "task-item"}>
//               <span className="task-text" onClick={() => toggleTask(task.id)}>
//                 {task.text.length > 20 ? task.text.substring(0, 20) + "..." : task.text}
//                 [{task.type}]
//                 {task.type === "weekly" && (
//                     <span className="task-progress">
//                         {task.progress} / {task.target}
//                     </span>
//                     )}
//               </span>
//               <button 
//                 className="btn-del" 
//                 onClick={() => task.done && deleteTask(task.id)}
//               >
//                 {task.done ? "🗑️" : "🔒"}
//               </button>
//             </li>
//           ))}
//         </ul>

//         {tasks.length === 0 && (
//           <p className="empty-state">💤 Aucune tâche pour le moment</p>
//         )}
//       </div>
//     </div>
//   );
// }