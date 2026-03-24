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
import './ListeCourse.css'

const LIST_EMOJIS = ['📋','🛒','🏠','📚','💼','🎯','🏋️','🌱','✈️','🎮']

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
  const [newListName,  setNewListName]  = useState('')
  const [newListEmoji, setNewListEmoji] = useState('📋')
  const [showShare,    setShowShare]    = useState(false)
  const [showOptions,  setShowOptions]  = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAddTask = async () => {
    if (!input.trim() || !activeListId) return
    await addTask(activeListId, input.trim())
    setInput('')
    inputRef.current?.focus()
  }

  const handleCreateList = async () => {
    if (!newListName.trim()) return
    await createList(newListName.trim(), newListEmoji)
    setNewListName('')
    setNewListEmoji('📋')
    setShowNewList(false)
  }

  const handleAddMember = async (friendId: string) => {
    if (!activeListId) return
    await addMember(activeListId, friendId)
  }

  const isOwner = activeList?.ownerId === user?.id

  // Amis pas encore membres de la liste active
  const friendsNotInList = friends.filter(f =>
    !activeList?.members.some(m => m.userId === f.profile?.id)
  )

  return (
    <div className="lc-page">

      {/* ---- Sélecteur de listes ---- */}
      <div className="lc-lists-row">
        <div className="lc-lists-scroll">
          {lists.map(l => (
            <button
              key={l.id}
              className={`lc-list-pill ${l.id === activeListId ? 'active' : ''}`}
              onClick={() => setActiveListId(l.id)}
            >
              <span>{l.emoji}</span>
              <span>{l.name}</span>
            </button>
          ))}
        </div>
        <button
          className="lc-new-list-btn"
          onClick={() => setShowNewList(true)}
        >+</button>
      </div>

      {/* ---- Créer une liste ---- */}
      {showNewList && (
        <div className="lc-new-list-form">
          <div className="lc-emoji-picker">
            {LIST_EMOJIS.map(e => (
              <button
                key={e}
                className={`lc-emoji-btn ${e === newListEmoji ? 'active' : ''}`}
                onClick={() => setNewListEmoji(e)}
              >{e}</button>
            ))}
          </div>
          <div className="lc-new-list-input-row">
            <input
              className="lc-new-list-input"
              placeholder="Nom de la liste..."
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateList()}
              autoFocus
            />
            <button className="lc-new-list-confirm" onClick={handleCreateList}>
              Créer
            </button>
            <button className="lc-new-list-cancel" onClick={() => setShowNewList(false)}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ---- Header liste active ---- */}
      {activeList && (
        <div className="lc-header">
          <div className="lc-header-left">
            <span className="lc-header-emoji">{activeList.emoji}</span>
            <h2 className="lc-header-name">{activeList.name}</h2>
            <span className="lc-header-count">
              {activeList.tasks.filter(t => !t.done).length} restantes
            </span>
          </div>
          <div className="lc-header-actions">
            {isOwner && (
              <button
                className="lc-icon-btn"
                onClick={() => setShowShare(s => !s)}
              >👥</button>
            )}
            {isOwner && (
              <button
                className="lc-icon-btn"
                onClick={() => setShowOptions(s => !s)}
              >⋯</button>
            )}
          </div>
        </div>
      )}

      {/* ---- Options liste ---- */}
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
      {showShare && isOwner && activeList && (
        <div className="lc-share-panel">
          <p className="lc-share-title">Membres actuels</p>
          {activeList.members.map(m => (
            <div key={m.id} className="lc-member-row">
              <span className="lc-member-name">
                {m.username ?? 'Utilisateur'} {m.role === 'owner' ? '👑' : ''}
              </span>
              {m.role !== 'owner' && (
                <button
                  className="lc-member-remove"
                  onClick={() => removeMember(activeList.id, m.userId)}
                >Retirer</button>
              )}
            </div>
          ))}

          {friendsNotInList.length > 0 && (
            <>
              <p className="lc-share-title" style={{ marginTop: 12 }}>
                Ajouter un ami
              </p>
              {friendsNotInList.map(f => (
                <div key={f.id} className="lc-member-row">
                  <span className="lc-member-name">
                    {f.profile?.username ?? 'Ami'}
                  </span>
                  <button
                    className="lc-member-add"
                    onClick={() => handleAddMember(f.profile?.id ?? '')}
                  >+ Ajouter</button>
                </div>
              ))}
            </>
          )}
        </div>
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
          {activeList.tasks.map(task => (
            <li
              key={task.id}
              className={`lc-task-item ${task.done ? 'done' : ''}`}
              onClick={() => toggleTask(task.id, task.done)}
            >
              <span className={`lc-task-check ${task.done ? 'checked' : ''}`}>
                {task.done ? '✓' : ''}
              </span>
              <span className="task-text">{task.text}</span>
              <button
                className="lc-task-delete"
                onClick={e => {
                  e.stopPropagation()
                  deleteTask(task.id)
                }}
              >✕</button>
            </li>
          ))}
        </ul>
      )}

      {activeList && activeList.tasks.length === 0 && (
        <p className="lc-empty">Aucune tâche dans cette liste</p>
      )}

    </div>
  )
}