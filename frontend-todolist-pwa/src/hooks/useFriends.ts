import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export type FriendStatus = 'pending' | 'accepted' | 'declined'

export type Friendship = {
  id:           string
  requesterId:  string
  receiverId:   string
  status:       FriendStatus
  createdAt:    string
  profile?:     FriendProfile
}

export type FriendProfile = {
  id:         string
  username:   string | null
  email:      string | null
  avatarUrl:  string | null
  level:      number
  totalXP:    number
  inviteCode: string | null
}

export function useFriends() {
  const { user } = useAuth()
  const [friends,          setFriends]           = useState<Friendship[]>([])
  const [pendingReceived,  setPendingReceived]   = useState<Friendship[]>([])
  const [pendingSent,      setPendingSent]       = useState<Friendship[]>([])
  const [loading,          setLoading]           = useState(false)
  const [newRequestAlert,  setNewRequestAlert]   = useState(false)
  const [giftsStatus, setGiftsStatus]            = useState<Record<string, boolean>>({})

  const loadFriends = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const { data, error } = await supabase
      .from('friendships')
      .select('*')
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)

    if (error || !data) { setLoading(false); return }

    // Récupère les profils
    const friendIds = data.map(f =>
      f.requester_id === user.id ? f.receiver_id : f.requester_id
    )

    const checkGiftsStatus = async (friendIds: string[]) => {
        if (!user || friendIds.length === 0) return
        const today = new Date().toISOString().slice(0, 10)

        const { data } = await supabase
            .from('daily_gifts')
            .select('receiver_id')
            .eq('sender_id', user.id)
            .eq('sent_at', today)
            .in('receiver_id', friendIds)

        if (data) {
            const map: Record<string, boolean> = {}
            data.forEach(g => { map[g.receiver_id] = true })
            setGiftsStatus(map)
        }
    }

    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, invite_code')
      .in('id', friendIds)

    const { data: gardensData } = await supabase
      .from('garden')
      .select('user_id, level, total_xp')
      .in('user_id', friendIds)

    const profileMap = new Map(profilesData?.map(p => [p.id, p]) ?? [])
    const gardenMap  = new Map(gardensData?.map(g => [g.user_id, g]) ?? [])

    const enriched: Friendship[] = data.map(f => {
      const friendId = f.requester_id === user.id ? f.receiver_id : f.requester_id
      const profile  = profileMap.get(friendId)
      const garden   = gardenMap.get(friendId)
      return {
        id:          f.id,
        requesterId: f.requester_id,
        receiverId:  f.receiver_id,
        status:      f.status,
        createdAt:   f.created_at,
        profile: profile ? {
          id:         friendId,
          username:   profile.username,
          email:      null,
          avatarUrl:  profile.avatar_url,
          level:      garden?.level ?? 1,
          totalXP:    garden?.total_xp ?? 0,
          inviteCode: profile.invite_code,
        } : undefined,
      }
    })

    setFriends(enriched.filter(f => f.status === 'accepted'))
    setPendingReceived(enriched.filter(f =>
      f.status === 'pending' && f.receiverId === user.id
    ))
    setPendingSent(enriched.filter(f =>
      f.status === 'pending' && f.requesterId === user.id
    ))

    const acceptedFriendIds = enriched
        .filter(f => f.status === 'accepted')
        .map(f => f.profile?.id ?? '')
        .filter(Boolean)

    await checkGiftsStatus(acceptedFriendIds)
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!user) return
    loadFriends()

    const channel = supabase
      .channel('friendships')
      .on('postgres_changes', {
        event:  'INSERT',
        schema: 'public',
        table:  'friendships',
        filter: `receiver_id=eq.${user.id}`,
      }, _ => {
        setNewRequestAlert(true)
        loadFriends()
        if (Notification.permission === 'granted') {
          new Notification('Nouvelle demande d\'ami !', {
            body: 'Quelqu\'un veut t\'ajouter comme ami.',
            icon: '/icon-192.png',
          })
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, loadFriends])

  const searchUser = useCallback(async (query: string): Promise<FriendProfile | null> => {
    if (!user || !query.trim()) return null

    // Cherche par username ou invite_code
    const { data } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, invite_code')
        .or(`username.ilike.%${query}%,invite_code.eq.${query}`)
        .neq('id', user.id)
        .limit(5)

    if (!data || data.length === 0) return null

    const profile = data[0]
    const { data: garden } = await supabase
        .from('garden')
        .select('level, total_xp')
        .eq('user_id', profile.id)
        .maybeSingle()

        console.log('gardens:', garden)

    return {
        id:         profile.id,
        username:   profile.username,
        email:      null,
        avatarUrl:  profile.avatar_url,
        level:      garden?.level    ?? 1,
        totalXP:    garden?.total_xp ?? 0,
        inviteCode: profile.invite_code,
    }
    }, [user])

//   const searchUser = useCallback(async (query: string): Promise<FriendProfile | null> => {
//     if (!user || !query.trim()) return null

//     const { data } = await supabase
//       .from('profiles')
//       .select('id, username, avatar_url, invite_code')
//       .or(`username.ilike.%${query}%,invite_code.eq.${query}`)
//       .neq('id', user.id)
//       .limit(5)

//     if (!data || data.length === 0) {
//       const { data: userData } = await supabase
//         .from('profiles')
//         .select('id, username, avatar_url, invite_code')
//         .eq('email', query)
//         .neq('id', user.id)
//         .single()

//       if (!userData) return null
//       return {
//         id:         userData.id,
//         username:   userData.username,
//         email:      query,
//         avatarUrl:  userData.avatar_url,
//         level:      1,
//         totalXP:    0,
//         inviteCode: userData.invite_code,
//       }
//     }

//     const profile = data[0]
//     const { data: garden } = await supabase
//       .from('garden')
//       .select('level, total_xp')
//       .eq('user_id', profile.id)
//       .single()

//     return {
//       id:         profile.id,
//       username:   profile.username,
//       email:      null,
//       avatarUrl:  profile.avatar_url,
//       level:      garden?.level ?? 1,
//       totalXP:    garden?.total_xp ?? 0,
//       inviteCode: profile.invite_code,
//     }
//   }, [user])

  const sendRequest = useCallback(async (receiverId: string): Promise<boolean> => {
    if (!user) return false
    const { error } = await supabase
      .from('friendships')
      .insert({ requester_id: user.id, receiver_id: receiverId })
    if (error) return false
    await loadFriends()
    return true
  }, [user, loadFriends])

  const acceptRequest = useCallback(async (friendshipId: string): Promise<void> => {
    await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId)
    setNewRequestAlert(false)
    await loadFriends()
  }, [loadFriends])

  const declineRequest = useCallback(async (friendshipId: string): Promise<void> => {
    await supabase
      .from('friendships')
      .update({ status: 'declined' })
      .eq('id', friendshipId)
    await loadFriends()
  }, [loadFriends])

  const removeFriend = useCallback(async (friendshipId: string): Promise<void> => {
    await supabase.from('friendships').delete().eq('id', friendshipId)
    await loadFriends()
  }, [loadFriends])

  const sendGift = useCallback(async (receiverId: string): Promise<boolean> => {
    if (!user) return false
    const { error } = await supabase
      .from('daily_gifts')
      .insert({ sender_id: user.id, receiver_id: receiverId, amount: 100 })
    if (error) return false
    setGiftsStatus(prev => ({ ...prev, [receiverId]: true }))
    return true
  }, [user])

  const claimGift = useCallback(async (
    giftId: string,
    addXP: (amount: number) => void
  ): Promise<boolean> => {
    const { error } = await supabase
      .from('daily_gifts')
      .update({ claimed_at: new Date().toISOString() })
      .eq('id', giftId)
      .is('claimed_at', null)
    if (error) return false
    addXP(100)
    return true
  }, [])

  const getInviteLink = useCallback(async (): Promise<string> => {
    if (!user) return ''
    const { data } = await supabase
      .from('profiles')
      .select('invite_code')
      .eq('id', user.id)
      .single()
    return `${window.location.origin}/friends?invite=${data?.invite_code}`
  }, [user])

  return {
    friends, pendingReceived, pendingSent,
    loading, newRequestAlert, giftsStatus,
    searchUser, sendRequest, acceptRequest,
    declineRequest, removeFriend,
    sendGift, claimGift, getInviteLink,
    reload: loadFriends,
  }
}