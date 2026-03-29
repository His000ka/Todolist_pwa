export type TaskListMember = {
  id: string
  userId: string
  username?: string | null
  role: 'owner' | 'editor' | string
}

export type SimpleTask = {
  id: string
  listId: string
  createdBy: string
  text: string
  done: boolean
  createdAt: string
}

export type SimpleTaskList = {
  id: string
  ownerId: string
  name: string
  emoji: string
  createdAt: string
  members: TaskListMember[]
  tasks: SimpleTask[]
}