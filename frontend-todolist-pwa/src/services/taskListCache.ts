import type { TaskList } from '../types/taskList'

const CACHE_KEY = 'tasklists_cache'

export const taskListCache = {
  get(): TaskList[] {
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  },

  set(lists: TaskList[]): void {
    localStorage.setItem(CACHE_KEY, JSON.stringify(lists))
  },

  clear(): void {
    localStorage.removeItem(CACHE_KEY)
  },
}