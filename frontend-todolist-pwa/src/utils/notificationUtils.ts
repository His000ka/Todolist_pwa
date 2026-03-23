import type { TaskPremium } from '../pages/TodoPremium'
import { getTodayKey, getYesterdayKey } from './taskUtils'

// Vérifie si une tâche nécessite une notification
export type NotificationPayload = {
  title: string
  body:  string
  delay: number // en millisecondes
}

export function getTasksNeedingNotification(
  tasks: TaskPremium[]
): NotificationPayload[] {
  const notifications: NotificationPayload[] = []
  const now = new Date()
  const dayOfWeek = now.getDay() // 0=dim, 6=sam

  for (const task of tasks) {
    if (!task.notificationsEnabled) continue

    // ---- Daily pas fait aujourd'hui ----
    if (task.type === 'daily') {
      const doneToday = task.lastCompleted
        ? new Date(task.lastCompleted).toISOString().slice(0, 10) === getTodayKey()
        : false

      if (!doneToday) {
        // Streak en danger — pas fait hier non plus
        const doneYesterday = task.lastCompleted
          ? new Date(task.lastCompleted).toISOString().slice(0, 10) === getYesterdayKey()
          : false

        if (!doneYesterday && (task.streak ?? 0) > 0) {
          // Streak va casser → notif urgente dans 1h
          notifications.push({
            title: `🔥 Streak en danger — ${task.text}`,
            body:  `Ton streak de ${task.streak} jours va être perdu si tu ne fais pas cette tâche aujourd'hui.`,
            delay: 60 * 60 * 1000, // 1h
          })
        } else {
          // Pas fait aujourd'hui → rappel dans 2h
          notifications.push({
            title: `📋 Tâche non faite — ${task.text}`,
            body:  `N'oublie pas de valider ta tâche quotidienne aujourd'hui.`,
            delay: 2 * 60 * 60 * 1000, // 2h
          })
        }
      }
    }

    // ---- Weekly en péril (dim ou sam, objectif pas atteint) ----
    if (task.type === 'weekly') {
      const progress = task.progress ?? 0
      const target   = task.target ?? 1
      const isEndOfWeek = dayOfWeek === 0 || dayOfWeek === 6 // sam ou dim

      if (isEndOfWeek && progress < target) {
        const remaining = target - progress
        notifications.push({
          title: `📅 Objectif hebdo — ${task.text}`,
          body:  `Il te reste ${remaining} validation${remaining > 1 ? 's' : ''} à faire avant la fin de semaine.`,
          delay: 60 * 60 * 1000, // 1h
        })
      }
    }
  }

  return notifications
}