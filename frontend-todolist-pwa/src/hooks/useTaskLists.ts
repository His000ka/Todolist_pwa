import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export type SimpleTask = {
  id:        string
  listId:    string
  createdBy: string
  text:      string
  done:      boolean
  createdAt: string
}

export type ListMember = {
  id:       string
  userId:   string
  role:     'owner' | 'editor'
  username: string | null
}

export type TaskList = {
  id:        string
  ownerId:   string
  name:      string
  emoji:     string
  createdAt: string
  members:   ListMember[]
  tasks:     SimpleTask[]
}

export function useTaskLists() {
  const { user } = useAuth()
  const [lists,          setLists]          = useState<TaskList[]>([])
  const [activeListId,   setActiveListId]   = useState<string | null>(null)
  const [loading,        setLoading]        = useState(false)

  const activeList = lists.find(l => l.id === activeListId) ?? null

  const loadLists = useCallback(async () => {
    if (!user) return
    setLoading(true)

    // Charge toutes les listes dont on est membre
    const { data: listsData, error: listsError } = await supabase
      .from('task_lists')
      .select('*')
      .order('created_at', { ascending: true })
    if (listsError) {
        console.error('LISTS ERROR:', listsError)
        setLoading(false)
        return
    }

    if (!listsData) { setLoading(false); return }

    // Charge les membres et tâches pour chaque liste
    const listIds = listsData.map(l => l.id)
    if (!listIds.length) {
        setLists([])
        setLoading(false)
        return
    }

    const { data: membersData, error: membersError } = await supabase
      .from('list_members')
      .select('id, list_id, user_id, role')
      .in('list_id', listIds)
    if (membersError) {
        console.error('LISTS ERROR:', membersError)
        setLoading(false)
        return
    }

    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', membersData?.map(m => m.user_id) ?? [])
    if (profilesError) {
        console.error('LISTS ERROR:', profilesError)
        setLoading(false)
        return
    }

    const { data: tasksData, error: tasksError } = await supabase
      .from('simple_tasks')
      .select('*')
      .in('list_id', listIds)
      .order('created_at', { ascending: true })
    if (tasksError) {
        console.error('LISTS ERROR:', tasksError)
        setLoading(false)
        return
    }

    const profileMap = new Map(profilesData?.map(p => [p.id, p]) ?? [])

    const enriched: TaskList[] = listsData.map(l => ({
      id:        l.id,
      ownerId:   l.owner_id,
      name:      l.name,
      emoji:     l.emoji ?? '📋',
      createdAt: l.created_at,
      members:   (membersData ?? [])
        .filter(m => m.list_id === l.id)
        .map(m => ({
          id:       m.id,
          userId:   m.user_id,
          role:     m.role,
          username: profileMap.get(m.user_id)?.username ?? null,
        })),
      tasks: (tasksData ?? [])
        .filter(t => t.list_id === l.id)
        .map(t => ({
          id:        t.id,
          listId:    t.list_id,
          createdBy: t.created_by,
          text:      t.text,
          done:      t.done,
          createdAt: t.created_at,
        })),
    }))

    setLists(enriched)

    // Sélectionne la première liste par défaut
    if (!activeListId && enriched.length > 0) {
      setActiveListId(enriched[0].id)
    }

    setLoading(false)
  }, [user, activeListId])

  useEffect(() => {
    if (!user) return
    loadLists()

    // Realtime — sync en temps réel sur les tâches
    const channel = supabase
      .channel('simple_tasks_changes')
      .on('postgres_changes', {
        event:  '*',
        schema: 'public',
        table:  'simple_tasks',
      }, () => loadLists())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  // ---- Listes ----
  const createList = useCallback(async (name: string, emoji: string): Promise<boolean> => {
    if (!user) return false

    const { data, error } = await supabase
      .from('task_lists')
      .insert({ owner_id: user.id, name, emoji })
      .select()
      .single()

    if (error || !data) return false

    // Ajoute le créateur comme owner dans list_members
    await supabase.from('list_members').insert({
      list_id: data.id,
      user_id: user.id,
      role:    'owner',
    })

    await loadLists()
    setActiveListId(data.id)
    return true
  }, [user, loadLists])

  const deleteList = useCallback(async (listId: string): Promise<void> => {
    await supabase.from('task_lists').delete().eq('id', listId)
    setActiveListId(null)
    await loadLists()
  }, [loadLists])

  const renameList = useCallback(async (listId: string, name: string): Promise<void> => {
    await supabase.from('task_lists').update({ name }).eq('id', listId)
    await loadLists()
  }, [loadLists])

  // ---- Membres ----
  const addMember = useCallback(async (listId: string, friendId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('list_members')
      .insert({ list_id: listId, user_id: friendId, role: 'editor' })
    if (error) return false
    await loadLists()
    return true
  }, [loadLists])

  const removeMember = useCallback(async (listId: string, userId: string): Promise<void> => {
    await supabase
      .from('list_members')
      .delete()
      .eq('list_id', listId)
      .eq('user_id', userId)
    await loadLists()
  }, [loadLists])

  // ---- Tâches ----
  const addTask = useCallback(async (listId: string, text: string): Promise<void> => {
    if (!user) return
    await supabase.from('simple_tasks').insert({
      list_id:    listId,
      created_by: user.id,
      text,
    })
    await loadLists()
  }, [user, loadLists])

  const toggleTask = useCallback(async (taskId: string, done: boolean): Promise<void> => {
    await supabase.from('simple_tasks').update({ done: !done }).eq('id', taskId)
    await loadLists()
  }, [loadLists])

  const deleteTask = useCallback(async (taskId: string): Promise<void> => {
    await supabase.from('simple_tasks').delete().eq('id', taskId)
    await loadLists()
  }, [loadLists])

  return {
    lists, activeList, activeListId, loading,
    setActiveListId,
    createList, deleteList, renameList,
    addMember, removeMember,
    addTask, toggleTask, deleteTask,
  }
}