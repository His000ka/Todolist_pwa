import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { TaskPremium } from '../pages/TodoPremium'
import { calculateXP, applyResets, isTaskLocked } from '../utils/taskUtils'

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
    notificationsEnabled: row.notifications_enabled as boolean ?? true,
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
    notifications_enabled: task.notificationsEnabled ?? true,
  }
}

export function usePremiumTasks(addXP?: (amount: number, streakBonus?: boolean) => void) {
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
    await supabase.from('tasks_premium').upsert(toSupabase(task, user.id), { onConflict: 'id' })
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

// ---- Reset au boot et à la reprise ----

const checkAndReset = useCallback(() => {
  setTasks(prev => {
      const reset = applyResets(prev)
      // Si des tâches ont changé → sync Supabase
      const hasChanges = reset.some((t, i) =>
      t.done !== prev[i].done || t.streak !== prev[i].streak || t.progress !== prev[i].progress
      )
      if (hasChanges && user) {
      reset.forEach(t => upsertWithQueue(t))
      }
      return reset
  })
  }, [user, upsertWithQueue])

  // Au montage — premier lancement
  useEffect(() => {
      checkAndReset()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Retour au premier plan — multitâche iOS
  useEffect(() => {
      const handleVisibility = () => {
          if (document.visibilityState === 'visible') checkAndReset()
      }
      document.addEventListener('visibilitychange', handleVisibility)
      return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [checkAndReset])

  // Timer minuit — si l'app est ouverte à 00h00
  useEffect(() => {
      const getMsUntilMidnight = () => {
          const now = new Date()
          const midnight = new Date()
          midnight.setHours(24, 0, 0, 0) // prochain minuit
          return midnight.getTime() - now.getTime()
      }

      // Premier timeout jusqu'à minuit
      const timeout = setTimeout(() => {
          checkAndReset()

          // Puis toutes les 24h
          const interval = setInterval(checkAndReset, 24 * 60 * 60 * 1000)
          return () => clearInterval(interval)
      }, getMsUntilMidnight())

      return () => clearTimeout(timeout)
  }, [checkAndReset])
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

  const completeTask = useCallback((id: string) => {
    setTasks(prev => {
        const task = prev.find(t => t.id === id)
        if (!task) return prev

        if (isTaskLocked(task)) return prev
        
        const now = Date.now()
        const xp = calculateXP(task)
        let updated: TaskPremium

        if (task.type === 'one') {
            if (addXP) addXP(xp)
            deleteRemote(task.id)
            return prev.filter(t => t.id !== id)
        }
        else if (task.type === 'daily') {
            if (task.done) {
                // Déjà fait aujourd'hui → on ne peut pas décocher un daily
                return prev
            }
            const hasStreakBonus = (task.streak ?? 0) >= 7
            updated = {
                ...task,
                done:          true,
                lastCompleted: now,
                streak:        (task.streak ?? 0) + 1,
            }
            if (addXP) addXP(xp, hasStreakBonus)
        }

        else {
        // Weekly — incrémente progress
        const newProgress = (task.progress ?? 0) + 1
        const isDone = newProgress >= (task.target ?? 1)
        updated = {
            ...task,
            done:          isDone,
            progress:      newProgress,
            lastCompleted: now,
        }
        if (addXP) addXP(xp)
        }

        upsertWithQueue(updated)
        return prev.map(t => t.id === id ? updated : t)
    })
  }, [upsertWithQueue, addXP])

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

  const toggleNotif = useCallback((id: string) => {
    setTasks(prev => {
        const next = prev.map(t =>
        t.id === id
            ? { ...t, notificationsEnabled: !t.notificationsEnabled }
            : t
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
    completeTask,
    deleteTask,
    editDesc,
    toggleNotif,
  }
}