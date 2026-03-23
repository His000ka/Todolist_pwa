import type { TaskPremium } from '../pages/TodoPremium'

// ---- Clés de temps ----

export function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10) // "2026-03-23"
}

export function getWeekKey(): string {
  const d = new Date()
  const jan1 = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil(
    ((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7
  )
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}` // "2026-W12"
}

export function getYesterdayKey(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10) // "2026-03-22"
}

// ---- Reset checks ----

export function shouldResetDaily(task: TaskPremium): boolean {
  if (task.type !== 'daily') return false
  if (!task.lastCompleted) return false
  const completedDay = new Date(task.lastCompleted).toISOString().slice(0, 10)
  return completedDay !== getTodayKey() // reset si pas complété aujourd'hui
}

export function shouldResetWeekly(task: TaskPremium): boolean {
  if (task.type !== 'weekly') return false
  if (!task.lastCompleted) return false
  const completedWeek = getWeekKeyFromTimestamp(task.lastCompleted)
  return completedWeek !== getWeekKey() // reset si semaine différente
}

function getWeekKeyFromTimestamp(ts: number): string {
  const d = new Date(ts)
  const jan1 = new Date(d.getFullYear(), 0, 1)
  const week = Math.ceil(
    ((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7
  )
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`
}

// ---- Calcul XP ----

export function calculateXP(task: TaskPremium): number {
  const hasStreakBonus = (task.streak ?? 0) >= 7

  switch (task.type) {
    case 'one':
      return task.weight * 10

    case 'daily':
      const base = task.weight * 8
      return hasStreakBonus ? Math.round(base * 1.2) : base

    case 'weekly': {
      const xp = task.weight * 12
      const isComplete = (task.progress ?? 0) + 1 >= (task.target ?? 1)
      // Bonus 50% si on complète l'objectif de la semaine
      return isComplete ? Math.round(xp * 1.5) : xp
    }

    default:
      return 0
  }
}

// ---- Apply resets (appelé au boot) ----

export function applyResets(tasks: TaskPremium[]): TaskPremium[] {
  return tasks.map(task => {
    if (task.type === 'daily' && shouldResetDaily(task)) {
      return {
        ...task,
        done: false,
        // streak : si pas complété hier → cassé
        streak: wasCompletedYesterday(task) ? (task.streak ?? 0) : 0,
      }
    }

    if (task.type === 'weekly' && shouldResetWeekly(task)) {
      return {
        ...task,
        done:     false,
        progress: 0,
      }
    }

    return task
  })
}

function wasCompletedYesterday(task: TaskPremium): boolean {
  if (!task.lastCompleted) return false
  const completedDay = new Date(task.lastCompleted).toISOString().slice(0, 10)
  return completedDay === getYesterdayKey()
}

// Peut-on encore valider cette tâche aujourd'hui / cette semaine ?
export function isTaskLocked(task: TaskPremium): boolean {
  if (task.type === 'one') return false // jamais bloqué

  if (task.type === 'daily') {
    if (!task.lastCompleted) return false
    const completedDay = new Date(task.lastCompleted).toISOString().slice(0, 10)
    return completedDay === getTodayKey() // bloqué si déjà fait aujourd'hui
  }

  if (task.type === 'weekly') {
    return (task.progress ?? 0) >= (task.target ?? 1) // bloqué si objectif atteint
  }

  return false
}

// Texte du bouton selon l'état
export function getCompleteButtonLabel(task: TaskPremium): string {
  if (task.type === 'one') {
    return task.done ? '✓ Fait' : '✓ Valider et supprimer'
  }

  if (task.type === 'daily') {
    if (isTaskLocked(task)) return '✓ Fait aujourd\'hui'
    return '✓ Valider pour aujourd\'hui'
  }

  if (task.type === 'weekly') {
    const progress = task.progress ?? 0
    const target   = task.target ?? 1
    if (isTaskLocked(task)) return `✓ Objectif atteint (${progress}/${target}×)`
    return `✓ Valider (${progress}/${target}×)`
  }

  return '✓ Marquer fait'
}