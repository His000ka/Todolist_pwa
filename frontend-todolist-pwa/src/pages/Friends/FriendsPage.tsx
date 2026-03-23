import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useFriends } from '../../hooks/useFriends'
// import { useGarden } from '../../hooks/useGarden'
import type { FriendProfile } from '../../hooks/useFriends'
import './FriendsPage.css'

function getInitials(username: string | null, email: string | null): string {
  const name = username ?? email ?? '?'
  return name.slice(0, 2).toUpperCase()
}

export default function FriendsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
//   const { addXP } = useGarden()
  const {
    friends, pendingReceived, pendingSent,
    loading, newRequestAlert, giftsStatus,
    searchUser, sendRequest, acceptRequest,
    declineRequest, removeFriend,
    sendGift, getInviteLink,
    // claimGift,
  } = useFriends()

  const [query,        setQuery]        = useState('')
  const [searchResult, setSearchResult] = useState<FriendProfile | null>(null)
  const [searching,    setSearching]    = useState(false)
  const [searchError,  setSearchError]  = useState<string | null>(null)
  const [inviteLink,   setInviteLink]   = useState('')
  const [copied,       setCopied]       = useState(false)

  useEffect(() => {
    if (!user) navigate('/auth')
  }, [user, navigate])

  useEffect(() => {
    getInviteLink().then(setInviteLink)
  }, [getInviteLink])

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    setSearchError(null)
    setSearchResult(null)
    const result = await searchUser(query.trim())
    if (!result) setSearchError('Aucun utilisateur trouvé')
    else setSearchResult(result)
    setSearching(false)
  }

  const handleSendRequest = async (id: string) => {
    const ok = await sendRequest(id)
    if (ok) setSearchResult(null)
  }

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendGift = async (friendId: string) => {
    await sendGift(friendId)
  }

  if (!user) return null

  return (
    <div className="friends-page">

      {/* Recherche */}
      <div className="friends-search">
        <input
          className="friends-search__input"
          placeholder="Pseudo, email ou code d'invitation..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button
          className="friends-search__btn"
          onClick={handleSearch}
          disabled={searching}
        >
          {searching ? '...' : 'Chercher'}
        </button>
      </div>

      {/* Résultat de recherche */}
      {searchError && (
        <p className="friends-empty">{searchError}</p>
      )}
      {searchResult && (
        <div className="friends-result">
          <div className="friend-avatar">
            {getInitials(searchResult.username, searchResult.email)}
          </div>
          <div className="friend-info">
            <p className="friend-name">{searchResult.username ?? searchResult.email}</p>
            <p className="friend-level">Niveau {searchResult.level} · {searchResult.totalXP} xp</p>
          </div>
          <button
            className="friends-btn friends-btn--add"
            onClick={() => handleSendRequest(searchResult.id)}
          >
            + Ajouter
          </button>
        </div>
      )}

      {/* Demandes reçues */}
      {pendingReceived.length > 0 && (
        <section>
          <p className="friends-section-title">
            Demandes reçues
            {newRequestAlert && <span className="friends-badge">{pendingReceived.length}</span>}
          </p>
          <div className="friends-list">
            {pendingReceived.map(f => (
              <div key={f.id} className="friend-card friend-card--pending">
                <div className="friend-avatar">
                  {getInitials(f.profile?.username ?? null, null)}
                </div>
                <div className="friend-info">
                  <p className="friend-name">{f.profile?.username ?? 'Utilisateur'}</p>
                  <p className="friend-level">Niveau {f.profile?.level ?? 1}</p>
                </div>
                <div className="friend-actions">
                  <button
                    className="friends-btn friends-btn--accept"
                    onClick={() => acceptRequest(f.id)}
                  >✓</button>
                  <button
                    className="friends-btn friends-btn--decline"
                    onClick={() => declineRequest(f.id)}
                  >✕</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Demandes envoyées */}
      {pendingSent.length > 0 && (
        <section>
          <p className="friends-section-title">Demandes envoyées</p>
          <div className="friends-list">
            {pendingSent.map(f => (
              <div key={f.id} className="friend-card">
                <div className="friend-avatar">
                  {getInitials(f.profile?.username ?? null, null)}
                </div>
                <div className="friend-info">
                  <p className="friend-name">{f.profile?.username ?? 'Utilisateur'}</p>
                  <p className="friend-level">En attente...</p>
                </div>
                <button
                  className="friends-btn friends-btn--cancel"
                  onClick={() => removeFriend(f.id)}
                >Annuler</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mes amis */}
      <section>
        <p className="friends-section-title">
          Mes amis {friends.length > 0 && `(${friends.length})`}
        </p>

        {loading && <p className="friends-empty">Chargement...</p>}

        {!loading && friends.length === 0 && (
          <p className="friends-empty">Pas encore d'amis — invite quelqu'un !</p>
        )}

        <div className="friends-list">
          {friends.map(f => {
            const alreadySent = giftsStatus[f.profile?.id ?? ''] ?? false
            return (
              <div key={f.id} className="friend-card">
                <div className="friend-avatar">
                  {getInitials(f.profile?.username ?? null, null)}
                </div>
                <div className="friend-info">
                  <p className="friend-name">{f.profile?.username ?? 'Ami'}</p>
                  <p className="friend-level">
                    Niveau {f.profile?.level ?? 1} · {f.profile?.totalXP ?? 0} xp
                  </p>
                </div>
                <button
                  className={`friends-btn friends-btn--gift ${alreadySent ? 'sent' : ''}`}
                  onClick={() => !alreadySent && handleSendGift(f.profile?.id ?? '')}
                  disabled={alreadySent}
                >
                  {alreadySent ? 'Envoyé' : '🎁 Cadeau'}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* Lien d'invitation */}
      <div className="friends-invite">
        <p className="friends-invite__text">
          Invite tes amis avec ton lien personnel
        </p>
        <button className="friends-invite__btn" onClick={handleCopyInvite}>
          {copied ? 'Lien copié !' : 'Copier mon lien d\'invitation'}
        </button>
      </div>

    </div>
  )
}