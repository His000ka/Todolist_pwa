import ThemeSelector from "../../components/Theme/ThemeSelector";
import { useAuth } from "../../context/AuthContext";
// import { supabase } from "../../lib/supabase";
import "./ProfilePage.css";

function getInitials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    month: "long", year: "numeric"
  });
}

export default function ProfilePage() {
  const { user, signOut } = useAuth();

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
            <p className="profile-reason">Synchronise tes tâches sur tous tes appareils</p>
            <div className="profile-sep" />
            <p className="profile-reason">Sauvegarde automatique dans le cloud</p>
            <div className="profile-sep" />
            <p className="profile-reason">Ne perds jamais tes données</p>
          </div>
        </div>

        <button
          className="profile-btn profile-btn--login"
          onClick={() => window.location.href = "/auth"}
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
        {getInitials(user.email ?? "?")}
      </div>
      <p className="profile-name">{user.user_metadata?.full_name ?? user.email}</p>
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
          <span className="profile-row-value">
            {formatDate(user.created_at)}
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
        <div className="profile-sep" />
        <div className="profile-row">
          <span className="profile-row-label">Email</span>
          <span className="profile-row-value">{user.email}</span>
        </div>
      </div>

      {/* Bouton déconnexion */}
      <button className="profile-btn profile-btn--logout" onClick={signOut}>
        Se déconnecter
      </button>

    </div>
  );
}