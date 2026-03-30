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
import type { SimpleTask, TaskListMember } from '../types/taskList'



export default function ListeCourse() {
  const { user }    = useAuth()
  const {
    lists, activeList, activeListId, loading, isOnline,
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
    const task = input.trim()
    setInput('')
    await addTask(activeListId, task)
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
    !activeList?.members.some((m: TaskListMember) => m.userId === f.profile?.id)
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
          <button className="btn-add" onClick={handleAddTask} disabled={!isOnline} title={!isOnline ? 'Hors ligne' : ''}>Ajouter</button>
        </div>
      )}

      {/* ---- Liste des tâches ---- */}
      {!loading && !activeList && lists.length === 0 && (
        <div className="lc-empty-state">
          <p className="lc-empty">Aucune liste — crée-en une !</p>
        </div>
      )}

      {activeList && (
        <ul className="task-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {activeList.tasks.map((task: SimpleTask) => (
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