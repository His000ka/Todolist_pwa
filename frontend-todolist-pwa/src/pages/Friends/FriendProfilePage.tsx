import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useFriends } from '../../hooks/useFriends'
import { useGarden } from '../../hooks/useGarden'
import './FriendProfilePage.css'

type FriendData = {
  id:         string
  username:   string | null
  avatarUrl:  string | null
  level:      number
  totalXP:    number
  xp:         number
  tasksDone:  number
  streak:     number
  memberSince: string
}

function getInitials(username: string | null): string {
  return (username ?? '?').slice(0, 2).toUpperCase()
}

export default function FriendProfilePage() {
  const { id }    = useParams<{ id: string }>()
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const { addXP } = useGarden()
  const { friends, sendGift, claimGift } = useFriends()

  const [friend,      setFriend]      = useState<FriendData | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [giftSent,    setGiftSent]    = useState(false)
  const [giftPending, setGiftPending] = useState<{ id: string } | null>(null)
  const [error,       setError]       = useState<string | null>(null)

  // Vérifie que c'est bien un ami
  const isFriend = friends.some(
    f => f.profile?.id === id
  )

  useEffect(() => {
    if (!user) { navigate('/auth'); return }
    if (!id)   { navigate('/friends'); return }
    loadFriendData()
    checkGiftStatus()
  }, [id, user])

  const loadFriendData = async () => {
    setLoading(true)

    // Profil
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, created_at')
      .eq('id', id)
      .single()

    // Garden
    const { data: garden } = await supabase
      .from('garden')
      .select('level, total_xp, xp')
      .eq('user_id', id)
      .single()

    // Tâches complétées
    const { count } = await supabase
      .from('tasks_premium')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id)
      .eq('done', true)

    // Streak max daily
    const { data: dailyTasks } = await supabase
      .from('tasks_premium')
      .select('streak')
      .eq('user_id', id)
      .eq('type', 'daily')
      .order('streak', { ascending: false })
      .limit(1)

    if (!profile) {
      setError('Profil introuvable')
      setLoading(false)
      return
    }

    setFriend({
      id:          profile.id,
      username:    profile.username,
      avatarUrl:   profile.avatar_url,
      level:       garden?.level    ?? 1,
      totalXP:     garden?.total_xp ?? 0,
      xp:          garden?.xp       ?? 0,
      tasksDone:   count            ?? 0,
      streak:      dailyTasks?.[0]?.streak ?? 0,
      memberSince: profile.created_at,
    })
    setLoading(false)
  }

  const checkGiftStatus = async () => {
    if (!user || !id) return
    // Vérifie si un cadeau a déjà été envoyé aujourd'hui
    const { data } = await supabase
      .from('daily_gifts')
      .select('id, claimed_at')
      .eq('sender_id', user.id)
      .eq('receiver_id', id)
      .eq('sent_at', new Date().toISOString().slice(0, 10))
      .maybeSingle()

    if (data) setGiftSent(true)

    // Vérifie si un cadeau en attente a été reçu
    const { data: received } = await supabase
      .from('daily_gifts')
      .select('id')
      .eq('sender_id', id)
      .eq('receiver_id', user.id)
      .eq('sent_at', new Date().toISOString().slice(0, 10))
      .is('claimed_at', null)
      .maybeSingle()

    if (received) setGiftPending({ id: received.id })
  }

  const handleSendGift = async () => {
    if (!id) return
    const ok = await sendGift(id)
    if (ok) setGiftSent(true)
  }

  const handleClaimGift = async () => {
    if (!giftPending) return
    const ok = await claimGift(giftPending.id, addXP)
    if (ok) setGiftPending(null)
  }

  const xpPercent = Math.round(((friend?.xp ?? 0) / 100) * 100)

  if (!user) return null

  return (
    <div className="fp-page">

      <button className="fp-back" onClick={() => navigate('/friends')}>
        ← Retour
      </button>

      {loading && <p className="fp-loading">Chargement...</p>}
      {error   && <p className="fp-error">{error}</p>}

      {friend && !loading && (
        <>
          {/* Header profil */}
          <div className="fp-header">
            <div className="fp-avatar">
              {getInitials(friend.username)}
            </div>
            <h2 className="fp-name">{friend.username ?? 'Ami'}</h2>
            <p className="fp-since">
              Membre depuis {new Date(friend.memberSince).toLocaleDateString('fr-FR', {
                month: 'long', year: 'numeric'
              })}
            </p>
          </div>

          {/* Cadeau reçu en attente */}
          {giftPending && (
            <div className="fp-gift-received">
              <p className="fp-gift-received__text">
                {friend.username} t'a envoyé un cadeau !
              </p>
              <button className="fp-gift-received__btn" onClick={handleClaimGift}>
                Réclamer +100 xp
              </button>
            </div>
          )}

          {/* XP Bar */}
          <div className="fp-card">
            <div className="fp-card__header">
              <span className="fp-card__label">Niveau</span>
              <span className="fp-card__level">{friend.level}</span>
            </div>
            <div className="fp-xp-track">
              <div className="fp-xp-fill" style={{ width: `${xpPercent}%` }} />
            </div>
            <div className="fp-card__sub">
              {friend.xp} / 100 xp · {friend.totalXP} xp total
            </div>
          </div>

          {/* Stats */}
          <div className="fp-stats">
            <div className="fp-stat">
              <span className="fp-stat__val fp-stat__val--green">{friend.tasksDone}</span>
              <span className="fp-stat__label">tâches</span>
            </div>
            <div className="fp-stat">
              <span className="fp-stat__val fp-stat__val--amber">{friend.streak}</span>
              <span className="fp-stat__label">streak max</span>
            </div>
            <div className="fp-stat">
              <span className="fp-stat__val fp-stat__val--purple">{friend.level}</span>
              <span className="fp-stat__label">niveau</span>
            </div>
          </div>

          {/* Jardin */}
          <div className="fp-card">
            <p className="fp-card__title">Jardin zen</p>
            <div className="fp-garden-stage">
              <span className="fp-garden-emoji">
                {friend.level >= 10 ? '🎋'
                  : friend.level >= 6 ? '🌿'
                  : friend.level >= 3 ? '🌱'
                  : '🌰'}
              </span>
              <div>
                <p className="fp-garden-label">
                  {friend.level >= 10 ? 'Arbre zen'
                    : friend.level >= 6 ? 'Plante'
                    : friend.level >= 3 ? 'Pousse'
                    : 'Graine'}
                </p>
                <p className="fp-garden-sub">Stade {
                  friend.level >= 10 ? '4' : friend.level >= 6 ? '3'
                    : friend.level >= 3 ? '2' : '1'
                } / 4</p>
              </div>
            </div>
          </div>

          {/* Bouton cadeau */}
          {isFriend && (
            <button
              className={`fp-gift-btn ${giftSent ? 'sent' : ''}`}
              onClick={handleSendGift}
              disabled={giftSent}
            >
              {giftSent ? 'Cadeau envoyé aujourd\'hui' : '🎁 Envoyer 100 xp'}
            </button>
          )}
        </>
      )}
    </div>
  )
}