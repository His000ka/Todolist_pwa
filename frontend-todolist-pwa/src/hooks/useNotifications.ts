import { useEffect, useCallback } from 'react'
import type { TaskPremium } from '../pages/TodoPremium'
import { getTasksNeedingNotification } from '../utils/notificationUtils'

// Stocke les IDs des timeouts pour pouvoir les annuler
const scheduledTimeouts: ReturnType<typeof setTimeout>[] = []

function clearAllScheduled() {
  scheduledTimeouts.forEach(clearTimeout)
  scheduledTimeouts.length = 0
}

export function useNotifications(tasks: TaskPremium[]) {

  // Demande la permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false

    const result = await Notification.requestPermission()
    return result === 'granted'
  }, [])

  // Programme les notifications pour cette session
  const scheduleNotifications = useCallback(async (taskList: TaskPremium[]) => {
    if (!('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    // Annule les anciennes notifications programmées
    clearAllScheduled()

    const notifications = getTasksNeedingNotification(taskList)

    for (const notif of notifications) {
      const timeout = setTimeout(() => {
        new Notification(notif.title, {
          body: notif.body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
        })
      }, notif.delay)

      scheduledTimeouts.push(timeout)
    }
  }, [])

  // Lance au montage et quand les tâches changent
  useEffect(() => {
    scheduleNotifications(tasks)
    return () => clearAllScheduled()
  }, [tasks, scheduleNotifications])

  return { requestPermission, scheduleNotifications }
}