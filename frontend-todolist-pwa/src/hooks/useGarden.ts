import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Garden } from '../game/types'
import { XP_PER_LEVEL } from '../game/constants'

const LOCAL_KEY = 'garden'

const defaultGarden: Garden = {
  plants:  [],
  xp:      0,
  level:   1,
  weather: 'sunny',
  lastSeen: new Date().toISOString().slice(0, 10),
}

function fromSupabase(row: Record<string, unknown>): Partial<Garden> {
  return {
    xp:      row.xp as number,
    level:   row.level as number,
    weather: row.weather as Garden['weather'],
    lastSeen: row.last_seen as string,
  }
}

export function useGarden() {
  const { user } = useAuth()
  const gardenPending = useRef(false)
  const loadingRef = useRef(false)

  const [garden, setGarden] = useState<Garden>(() => {
    const stored = localStorage.getItem(LOCAL_KEY)
    return stored ? JSON.parse(stored) : defaultGarden
  })

  const [totalXP, setTotalXP] = useState<number>(() => {
    return Number(localStorage.getItem('garden_totalXP') ?? 0)
  })

  // Persiste localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(garden))
  }, [garden])

  useEffect(() => {
    localStorage.setItem('garden_totalXP', String(totalXP))
  }, [totalXP])

  // Charge depuis Supabase au login
  useEffect(() => {
    if (!user) return
    loadFromSupabase()
  }, [user])

  const loadFromSupabase = async () => {
    if (!user) return
    if (loadingRef.current) return
    loadingRef.current = true

    const { data, error } = await supabase
        .from('garden')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

    if (error) {
        console.error('Garden load error:', error)
        loadingRef.current = false
        return
    }

    if (data) {
        // Ligne existante → charge depuis Supabase
        setGarden(prev => ({ ...prev, ...fromSupabase(data) }))
        setTotalXP(data.total_xp as number)
        localStorage.setItem('garden_totalXP', String(data.total_xp))
    } else {
        // Pas de ligne → crée le jardin pour ce user
        await supabase.from('garden').upsert({
            user_id:  user.id,
            xp:       garden.xp,
            level:    garden.level,
            weather:  garden.weather,
            total_xp: totalXP,
            last_seen: garden.lastSeen,
        })
    }
    loadingRef.current = true
  }

  const upsertWithQueue = useCallback(async (g: Garden, xp: number) => {
    if (!user) return
    if (!navigator.onLine) {
        gardenPending.current = true
        return
    }
    await supabase.from('garden').upsert({
        user_id:  user.id,
        xp:       g.xp,
        level:    g.level,
        weather:  g.weather,
        total_xp: xp,
        last_seen: g.lastSeen,
    }, {onConflict: 'user_id'})
    }, [user])

    useEffect(() => {
    const handleOnline = async () => {
        if (!user || !gardenPending.current) return
        gardenPending.current = false
        // Sync le state actuel
        await supabase.from('garden').upsert({
        user_id:  user.id,
        xp:       garden.xp,
        level:    garden.level,
        weather:  garden.weather,
        total_xp: totalXP,
        last_seen: garden.lastSeen,
        }, {onConflict: 'user_id'})
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [user, garden, totalXP])

  const addXP = useCallback((amount: number, streakBonus = false) => {
    const final = streakBonus ? Math.round(amount * 1.2) : amount
    setTotalXP(prev => {
      const next = prev + final
      return next
    })
    setGarden(prev => {
      let xp    = prev.xp + final
      let level = prev.level
      while (xp >= XP_PER_LEVEL) { xp -= XP_PER_LEVEL; level++ }
      const next = { ...prev, xp, level }
      upsertWithQueue(next, totalXP + final)
      return next
    })
  }, [upsertWithQueue, totalXP])

  const setWeather = useCallback((weather: Garden['weather']) => {
    setGarden(prev => {
      const next = { ...prev, weather }
      upsertWithQueue(next, totalXP)
      return next
    })
  }, [upsertWithQueue, totalXP])

  return { garden, totalXP, addXP, setWeather }
}