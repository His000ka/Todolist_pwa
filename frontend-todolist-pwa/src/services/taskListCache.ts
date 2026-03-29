import type { SimpleTaskList } from '../types/taskList'

const CACHE_KEY = 'SimpleTaskLists_cache'

export const taskListCache = {
  get(): SimpleTaskList[] {
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  },

  set(lists: SimpleTaskList[]): void {
    localStorage.setItem(CACHE_KEY, JSON.stringify(lists))
  },

  clear(): void {
    localStorage.removeItem(CACHE_KEY)
  },
}