import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { TaskPremium } from '../pages/TodoPremium'

const LOCAL_KEY = 'tasks_premium'

// Convertit le format Supabase (snake_case) → app (camelCase)
function fromSupabase(row: Record<string, unknown>): TaskPremium {
  return {
    id:            row.id as string,
    text:          row.text as string,
    type:          row.type as TaskPremium['type'],
    done:          row.done as boolean,
    weight:        row.weight as number,
    difficulty:    row.difficulty as number,
    description:   row.description as string ?? '',
    target:        row.target as number | undefined,
    progress:      row.progress as number | undefined,
    streak:        row.streak as number | undefined,
    lastCompleted: row.last_completed as number | null | undefined,
    createdAt:     new Date(row.created_at as string).getTime(),
  }
}

// Convertit app → Supabase (ajoute user_id, snake_case)
function toSupabase(task: TaskPremium, userId: string) {
  return {
    id:             task.id,
    user_id:        userId,
    text:           task.text,
    type:           task.type,
    done:           task.done,
    weight:         task.weight,
    difficulty:     task.difficulty,
    description:    task.description,
    target:         task.target ?? null,
    progress:       task.progress ?? 0,
    streak:         task.streak ?? 0,
    last_completed: task.lastCompleted ?? null,
  }
}

export function usePremiumTasks() {
  const { user } = useAuth()
  const pendingSync = useRef<TaskPremium[]>([])

  const [tasks, setTasks] = useState<TaskPremium[]>(() => {
    const stored = localStorage.getItem(LOCAL_KEY)
    return stored ? JSON.parse(stored) : []
  })

  const [syncing, setSyncing] = useState(false)

  // Persiste dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(tasks))
  }, [tasks])

  // Charge depuis Supabase au login
  useEffect(() => {
    if (!user) return
    loadFromSupabase()
  }, [user])

  const loadFromSupabase = async () => {
    if (!user) return
    setSyncing(true)
    const { data, error } = await supabase
      .from('tasks_premium')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
        setSyncing(false)
        return
    }

    const localTasks: TaskPremium[] = JSON.parse(
        localStorage.getItem(LOCAL_KEY) ?? '[]'
    )

    if (data.length === 0 && localTasks.length > 0) {
        // Pas de données remote mais données locales → migration
        const toInsert = localTasks.map(t => toSupabase(t, user.id))
        await supabase.from('tasks_premium').insert(toInsert)
        // Les locales sont déjà dans le state, rien à changer
        setSyncing(false)
        return
    }

    if (data.length > 0) {
        // Données remote existent → elles ont priorité
        const remote = data.map(fromSupabase)
        setTasks(remote)
        localStorage.setItem(LOCAL_KEY, JSON.stringify(remote))
    }

    setSyncing(false)
  }

  // ---- Helpers Supabase (fire and forget) ----
  const upsertWithQueue = useCallback(async (task: TaskPremium) => {
    if (!user) return
    if (!navigator.onLine) {
        // Offline → stocke en queue
        pendingSync.current = [
        ...pendingSync.current.filter(t => t.id !== task.id),
        task
        ]
        return
    }
    await supabase.from('tasks_premium').upsert(toSupabase(task, user.id))
    }, [user])

    // Quand retour online → vide la queue
    useEffect(() => {
    const handleOnline = async () => {
        if (!user || pendingSync.current.length === 0) return
        
        const toSync = [...pendingSync.current]
        pendingSync.current = []
        
        await supabase
        .from('tasks_premium')
        .upsert(toSync.map(t => toSupabase(t, user.id)))
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [user])

  const deleteRemote = useCallback(async (id: string) => {
    if (!user) return
    await supabase.from('tasks_premium').delete().eq('id', id)
  }, [user])

  // ---- Actions ----
  const addTask = useCallback((task: TaskPremium) => {
    setTasks(prev => {
      const next = [...prev, task]
      return next
    })
    upsertWithQueue(task)
  }, [upsertWithQueue])

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => {
      const next = prev.map(t =>
        t.id === id ? { ...t, done: !t.done } : t
      )
      const updated = next.find(t => t.id === id)!
      upsertWithQueue(updated)
      return next
    })
  }, [upsertWithQueue])

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    deleteRemote(id)
  }, [deleteRemote])

  const editDesc = useCallback((id: string, description: string) => {
    setTasks(prev => {
      const next = prev.map(t =>
        t.id === id ? { ...t, description } : t
      )
      const updated = next.find(t => t.id === id)!
      upsertWithQueue(updated)
      return next
    })
  }, [upsertWithQueue])

  return {
    tasks,
    syncing,
    addTask,
    toggleTask,
    deleteTask,
    editDesc,
  }
}