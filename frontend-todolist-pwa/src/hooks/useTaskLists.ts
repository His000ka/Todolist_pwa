import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useOnlineStatus } from './useOnlineStatus'
import { taskListService } from '../services/taskListService'
import { taskListCache } from '../services/taskListCache'
import { mapTaskLists } from '../mappers/taskListMapper'
import type { SimpleTaskList } from '../types/taskList'

export function useTaskLists() {
  const { user }    = useAuth()
  const isOnline    = useOnlineStatus()
  const prevOnline  = useRef(isOnline)
  const isAddingTask = useRef(false)

  const [lists,        setLists]        = useState<SimpleTaskList[]>(taskListCache.get)
  const [activeListId, setActiveListId] = useState<string | undefined>()
  const [loading,      setLoading]      = useState(false)

  const activeList = lists.find(l => l.id === activeListId) ?? null

  // ── Fetch Supabase → cache → state ──────────────────────────────
  const syncFromSupabase = useCallback(async () => {
    if (!user) return

    if (!isOnline) {
        // Offline → charge depuis le cache uniquement
        const cached = taskListCache.get()
        setLists(cached)
        return
    }
    setLoading(true)

    const { data: listsData } = await taskListService.fetchLists()
    const listIds = listsData?.map(l => l.id) ?? []

    if (!listIds.length) {
      setLists([])
      taskListCache.set([])
      setLoading(false)
      return
    }

    const [membersRes, tasksRes] = await Promise.all([
      taskListService.fetchMembers(listIds),
      taskListService.fetchTasks(listIds),
    ])

    const memberUserIds = membersRes.data?.map(m => m.user_id) ?? []
    const taskCreatorIds = tasksRes.data?.map(t => t.created_by) ?? []
    const allUserIds     = [...new Set([...memberUserIds, ...taskCreatorIds])] 
    const profilesRes   = await taskListService.fetchProfiles(allUserIds)

    const mapped = mapTaskLists(
      listsData          ?? [],
      membersRes.data    ?? [],
      profilesRes.data   ?? [],
      tasksRes.data      ?? [],
    )

    setLists(mapped)
    taskListCache.set(mapped)   // ← miroir local
    setLoading(false)
  }, [user, isOnline])

  // ── Boot : localStorage immédiat, puis sync si online ───────────
  useEffect(() => {
    const cached = taskListCache.get()
    if (cached.length) setLists(cached)   // affichage immédiat
    if (user && isOnline) syncFromSupabase()
  }, [user])

  // ── Reconnexion → resync ─────────────────────────────────────────
  useEffect(() => {
    if (!prevOnline.current && isOnline && user) {
      syncFromSupabase()
    }
    prevOnline.current = isOnline
  }, [isOnline, user])

  // ── Helpers mutations (online only) ─────────────────────────────
  const guardOnline = () => {
    if (!isOnline) {
      alert('Pas de connexion — modifications impossibles hors ligne.')
      return false
    }
    return true
  }

  // Optimistic update : modifie le state local, puis resync
  const withOptimistic = async (
    optimisticFn: (prev: SimpleTaskList[]) => SimpleTaskList[],
    remoteFn: () => PromiseLike<unknown>,
  ) => {
    setLists(prev => {
      const next = optimisticFn(prev)
      taskListCache.set(next)
      return next
    })
    await remoteFn()
    await syncFromSupabase()  // resync pour cohérence
  }

  // ── Mutations ────────────────────────────────────────────────────
  const createList = async (name: string, emoji: string) => {
    if (!guardOnline() || !user) return false
    const { data } = await taskListService.createList({ owner_id: user.id, name, emoji })
    if (!data) return false
    await syncFromSupabase()
    setActiveListId(data.id)
    return true
  }

  const deleteList = async (listId: string) => {
    if (!guardOnline()) return
    await withOptimistic(
      prev => prev.filter(l => l.id !== listId),
      ()   => taskListService.deleteList(listId),
    )
    setActiveListId(undefined)
  }

  const addTask = async (listId: string, text: string) => {
    if (!guardOnline() || !user) return
    if (isAddingTask.current) return
    isAddingTask.current = true

    const tempId = `temp-${Date.now()}`

    // Optimistic uniquement — pas de syncFromSupabase
    setLists(prev => {
        const next = prev.map(l => l.id !== listId ? l : {
        ...l,
        tasks: [...l.tasks, {
            id: tempId, listId,
            createdBy: user.id, text,
            done: false,
            createdAt: new Date().toISOString()
        }],
        })
        taskListCache.set(next)
        return next
    })

    const { data } = await taskListService.addTask(listId, user.id, text)
    
    // Remplace le tempId par le vrai ID Supabase, sans refetch
    if (data) {
        setLists(prev => {
        const next = prev.map(l => l.id !== listId ? l : {
            ...l,
            tasks: l.tasks.map(t => t.id === tempId ? { ...t, id: data.id } : t),
        })
        taskListCache.set(next)
        return next
        })
    }

    isAddingTask.current = false
  }

    const toggleTask = async (taskId: string, done: boolean) => {
        if (!guardOnline()) return

        setLists(prev => {
            const next = prev.map(l => ({
            ...l,
            tasks: l.tasks.map(t => t.id === taskId ? { ...t, done: !done } : t),
            }))
            taskListCache.set(next)
            return next
        })

        await taskListService.toggleTask(taskId, done)
    }

    const deleteTask = async (taskId: string) => {
        if (!guardOnline()) return

        setLists(prev => {
            const next = prev.map(l => ({
            ...l,
            tasks: l.tasks.filter(t => t.id !== taskId),
            }))
            taskListCache.set(next)
            return next
        })

        await taskListService.deleteTask(taskId)
    }
  const addMember = async (listId: string, friendId: string) => {
    if (!guardOnline()) return
    await taskListService.addMember(listId, friendId)
    await syncFromSupabase()
  }

  const removeMember = async (listId: string, userId: string) => {
    if (!guardOnline()) return
    await taskListService.removeMember(listId, userId)
    await syncFromSupabase()
  }

  return {
    lists, activeList, activeListId, loading, isOnline,
    setActiveListId,
    createList, deleteList,
    addMember, removeMember,
    addTask, toggleTask, deleteTask,
  }
}