import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../context/AuthContext"
import { taskListService } from "../services/taskListService"
import { mapTaskLists } from "../mappers/taskListMapper"

export function useTaskLists() {
  const { user } = useAuth()

  const [lists, setLists] = useState<any[]>([])
  const [activeListId, setActiveListId] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)

  const activeList =
    lists.find((l) => l.id === activeListId) ?? null

  const loadLists = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const { data: listsData } = await taskListService.fetchLists()

    const listIds = listsData?.map((l) => l.id) ?? []
    if (!listIds.length) {
      setLists([])
      setLoading(false)
      return
    }

    const [membersRes, tasksRes] = await Promise.all([
      taskListService.fetchMembers(listIds),
      taskListService.fetchTasks(listIds),
    ])

    const memberUserIds =
      membersRes.data?.map((m) => m.user_id) ?? []

    const profilesRes =
      await taskListService.fetchProfiles(memberUserIds)

    const mapped = mapTaskLists(
      listsData ?? [],
      membersRes.data ?? [],
      profilesRes.data ?? [],
      tasksRes.data ?? []
    )

    setLists(mapped)
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!user) return
    loadLists()
  }, [user])

  // ---- mutations ----
  const createList = async (name: string, emoji: string) => {
    if (!user) return false

    const { data } = await taskListService.createList({
      owner_id: user.id,
      name,
      emoji,
    })

    if (!data) return false

    setActiveListId(data.id)
    loadLists()
    return true
  }

  const deleteList = async (listId: string) => {
    await taskListService.deleteList(listId)
    setActiveListId(undefined)
    loadLists()
  }

  const addMember = async (listId: string, friendId: string) => {
    await taskListService.addMember(listId, friendId)
    loadLists()
  }

  const removeMember = async (listId: string, userId: string) => {
    await taskListService.removeMember(listId, userId)
    loadLists()
  }

  const addTask = async (listId: string, text: string) => {
    if (!user) return
    await taskListService.addTask(listId, user.id, text)
    loadLists()
  }

  const toggleTask = async (taskId: string, done: boolean) => {
    await taskListService.toggleTask(taskId, done)
    loadLists()
  }

  const deleteTask = async (taskId: string) => {
    await taskListService.deleteTask(taskId)
    loadLists()
  }

  return {
    lists,
    activeList,
    activeListId,
    loading,
    setActiveListId,
    createList,
    deleteList,
    addMember,
    removeMember,
    addTask,
    toggleTask,
    deleteTask,
  }
}