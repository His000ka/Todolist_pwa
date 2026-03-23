import ThemeSelector from "../../components/Theme/ThemeSelector";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import "./ProfilePage.css";

function getInitials(username: string | null, email: string | null): string {
  const name = username ?? email ?? '?'
  return name.slice(0, 2).toUpperCase()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    month: "long", year: "numeric"
  });
}

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [username,    setUsername]    = useState('')
  const [editMode,    setEditMode]    = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [saveMsg,     setSaveMsg]     = useState<string | null>(null)
  const [inviteCode,  setInviteCode]  = useState<string | null>(null)
  const [copied,      setCopied]      = useState(false)

  useEffect(() => {
    if (!user) return
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .select('username, invite_code')
      .eq('id', user.id)
      .single()

    if (data) {
      setUsername(data.username ?? '')
      setInviteCode(data.invite_code)
    }
  }

  const saveUsername = async () => {
    if (!user || !username.trim()) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, username: username.trim() })

    if (error) {
      setSaveMsg('Ce pseudo est déjà pris')
    } else {
      setSaveMsg('Sauvegardé !')
      setEditMode(false)
      setTimeout(() => setSaveMsg(null), 2000)
    }
    setSaving(false)
  }

  const copyInvite = () => {
    const link = `${window.location.origin}/friends?invite=${inviteCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ---- Vue non connecté ----
  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-avatar profile-avatar--guest">?</div>
        <p className="profile-name profile-name--guest">Mode local</p>
        <p className="profile-email">Données sauvegardées sur cet appareil</p>

        <div className="profile-badge profile-badge--local">
          <span className="profile-dot profile-dot--gray" />
          Non connecté
        </div>

        <div className="profile-card" style={{ marginTop: 20 }}>
          <p className="profile-card-title">Pourquoi créer un compte ?</p>
          <div className="profile-reasons">
            <p className="profile-reason">Sauvegarde automatique sur tous tes appareils</p>
            <div className="profile-sep" />
            <p className="profile-reason">Ajoute des amis</p>
            <div className="profile-sep" />
            <p className="profile-reason">---</p>
          </div>
        </div>

        <button
          className="profile-btn profile-btn--login"
          onClick={() =>  navigate("/auth")}
        >
          Se connecter ou créer un compte
        </button>
      </div>
    );
  }

  // ---- Vue connecté ----
  return (
    <div className="profile-page">

      {/* Avatar + infos */}
      <div className="profile-avatar">
        {getInitials(username || null, user.email ?? null)}
      </div>

      {editMode ? (
        <div className="profile-username-edit">
          <input
            className="profile-username-input"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Nom d'utilisateur"
            maxLength={20}
            autoFocus
            onKeyDown={e => e.key === 'Enter' && saveUsername()}
          />
          <div className="profile-username-actions">
            <button className="profile-btn-sm profile-btn-sm--save"
              onClick={saveUsername} disabled={saving}>
              {saving ? '...' : 'Sauvegarder'}
            </button>
            <button className="profile-btn-sm profile-btn-sm--cancel"
              onClick={() => { setEditMode(false); loadProfile() }}>
              Annuler
            </button>
          </div>
          {saveMsg && (
            <p className={`profile-save-msg ${saveMsg.includes('pris') ? 'error' : ''}`}>
              {saveMsg}
            </p>
          )}
        </div>
      ) : (
        <div className="profile-name-row">
          <p className="profile-name">{username || 'Sans pseudo'}</p>
          <button className="profile-edit-btn" onClick={() => setEditMode(true)}>
            Modifier
          </button>
        </div>
      )}

      <p className="profile-email">{user.email}</p>

      <div className="profile-badge profile-badge--connected">
        <span className="profile-dot profile-dot--green" />
        Connecté
      </div>

      <div className="profile-card">
        <p className="profile-card-title">Thèmes</p>
        <ThemeSelector></ThemeSelector>
      </div>

      {/* Card compte */}
      <div className="profile-card">
        <p className="profile-card-title">Compte</p>
        <div className="profile-row">
          <span className="profile-row-label">Membre depuis</span>
          <span className="profile-row-value">{formatDate(user.created_at)}</span>
        </div>
        <div className="profile-sep" />
        <div className="profile-row">
          <span className="profile-row-label">Code d'invitation</span>
          <span className="profile-row-value profile-invite-code">
            {inviteCode ?? '...'}
          </span>
        </div>
        <div className="profile-sep" />
        <div className="profile-row">
          <span className="profile-row-label">Sync Supabase</span>
          <div className="profile-badge profile-badge--connected profile-badge--sm">
            <span className="profile-dot profile-dot--green" />
            Actif
          </div>
        </div>
      </div>

      {/* Partage */}
      <button className="profile-btn profile-btn--share" onClick={copyInvite}>
        {copied ? 'Lien copié !' : 'Copier mon lien d\'invitation'}
      </button>

      {/* Bouton déconnexion */}
      <button className="profile-btn profile-btn--logout" onClick={signOut}>
        Se déconnecter
      </button>

    </div>
  );
}