// import { useEffect, useState, useRef } from "react";
// import Input from "../components/Input/Input";
// import "./ListeCourse.css"


// type Task = {
//   id: string;
//   text: string;
//   createdAt: number;
//   done: boolean;
// };

// export default function ListeCourse() {
//   const [tasks, setTasks] = useState<Task[]>(() => {
//     const stored = localStorage.getItem("todo_tasks");
//     return stored ? JSON.parse(stored) : [];
//   });
//   const [input, setInput] = useState("");
//   const inputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     localStorage.setItem("todo_tasks", JSON.stringify(tasks));
//   }, [tasks]);

//   const addTask = () => {
//     if (!input.trim()) return;
//     const newTask = createTask();
//     setTasks((prev) => [...prev, newTask]);
//     setInput("");
//     inputRef.current?.focus();
//   };

//   const createTask = (): Task => {
//     const base = { id: crypto.randomUUID(), text: input, createdAt: Date.now(), done: false };
//     return base;
//   };

//   const toggleTask = (id: string) => {
//     setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
//   };

//   const deleteTask = (id: string) => {
//     setTasks(tasks.filter(t => t.id !== id));
//   };

//   return (
//     <div className="list-course-content"> 
//       <div className="input-group">
//         <Input
//           ref={inputRef}
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && addTask()}
//           placeholder="Nouvelle tâche..."
//         />
//         <button className="btn-add" onClick={addTask}>Ajouter</button>
//       </div>

//       <ul className="task-list">
//         {tasks.map((task) => (
//           <li key={task.id} className={task.done ? "lc-task-item done" : "lc-task-item"}>
//             <span className="task-text" onClick={() => toggleTask(task.id)}>
//               {task.text.length > 20 ? task.text.substring(0, 20) + "..." : task.text}
//             </span>
//             <button className="btn-del" onClick={() => task.done && deleteTask(task.id)}>
//               {task.done ? "🗑️" : "🔒"}
//             </button>
//           </li>
//         ))}
//       </ul>

//       {tasks.length === 0 && (
//         <p className="empty-state">💤 Aucune tâche pour le moment</p>
//       )}
//     </div>
//   );
// }


import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTaskLists } from '../hooks/useTaskLists'
import { useFriends } from '../hooks/useFriends'
import Input from '../components/Input/Input'

import ListHeader from '../components/task-lists/ListHeader'
import ListSelector from '../components/task-lists/ListSelector'
import TaskItem from "../components/task-lists/TaskItem"
import SharePanel from "../components/task-lists/SharePanel"
import CreateList from "../components/task-lists/CreateList"

import './ListeCourse.css'

type Task = {
  id: string
  text: string
  done: boolean
}

type Member = {
  id: string
  userId: string
  username?: string | null
  role: "owner" | "member" | string
}

export default function ListeCourse() {
  const { user }    = useAuth()
  const {
    lists, activeList, activeListId, loading,
    setActiveListId, createList, deleteList,
    addMember, removeMember,
    addTask, toggleTask, deleteTask,
  } = useTaskLists()
  const { friends } = useFriends()

  const [input,        setInput]        = useState('')
  const [showNewList,  setShowNewList]  = useState(false)
  const [showShare,    setShowShare]    = useState(false)
  const [showOptions,  setShowOptions]  = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAddTask = async () => {
    if (!input.trim() || !activeListId) return
    await addTask(activeListId, input.trim())
    setInput('')
    inputRef.current?.focus()
  }

  const handleCreateList = async (name: string, emoji: string) => {
    await createList(name, emoji)
    setShowNewList(false)
  }

  const handleAddMember = async (friendId: string) => {
    if (!activeListId) return
    await addMember(activeListId, friendId)
  }

  const isOwner = activeList?.ownerId === user?.id

  // Amis pas encore membres de la liste active
  const friendsNotInList = friends.filter(f =>
    !activeList?.members.some((m: Member) => m.userId === f.profile?.id)
  )

  return (
    <div className="lc-page">

      {/* ---- Sélecteur de listes ---- */}
      <ListSelector
        lists={lists}
        activeListId={activeListId}
        onSelect={setActiveListId}
        onCreateClick={() => setShowNewList(true)}
      />

      {/* ---- Créer une liste ---- */}
      {showNewList && (
        <CreateList
            onCreate={handleCreateList}
            onClose={() => setShowNewList(false)}
        />
      )}

      {/* ---- Header liste active ---- */}
      {activeList && (
        <ListHeader
          list={activeList}
          isOwner={isOwner}
          onToggleShare={() => setShowShare((s) => !s)}
          onToggleOptions={() => setShowOptions((s) => !s)}
        />
      )}

      {/* ---- Options liste - les '...' pour suprimer la liste ---- */}
      {showOptions && isOwner && activeList && (
        <div className="lc-options">
          <button
            className="lc-option-btn lc-option-btn--danger"
            onClick={() => {
              deleteList(activeList.id)
              setShowOptions(false)
            }}
          >
            Supprimer cette liste
          </button>
        </div>
      )}

      {/* ---- Partage ---- */}
      {showShare && activeList && (
        <SharePanel
            members={activeList.members}
            friendsNotInList={friendsNotInList}
            listId={activeList.id}
            isOwner={isOwner}
            onRemoveMember={removeMember}
            onAddMember={handleAddMember}
        />
      )}

      {/* ---- Input ajout tâche ---- */}
      {activeList && (
        <div className="input-group">
          <Input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddTask()}
            placeholder="Nouvelle tâche..."
          />
          <button className="btn-add" onClick={handleAddTask}>Ajouter</button>
        </div>
      )}

      {/* ---- Liste des tâches ---- */}
      {loading && <p className="lc-empty">Chargement...</p>}

      {!loading && !activeList && lists.length === 0 && (
        <div className="lc-empty-state">
          <p className="lc-empty">Aucune liste — crée-en une !</p>
        </div>
      )}

      {activeList && (
        <ul className="task-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {activeList.tasks.map((task: Task) => (
            <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
            />
          ))}
        </ul>
      )}

      {activeList && activeList.tasks.length === 0 && (
        <p className="lc-empty">Aucune tâche dans cette liste</p>
      )}

    </div>
  )
}