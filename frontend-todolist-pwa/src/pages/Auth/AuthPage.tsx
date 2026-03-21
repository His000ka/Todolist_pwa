import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import './AuthPage.css'

export default function AuthPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)

  const handleEmail = async () => {
    setLoading(true)
    setError(null)
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">
          {isSignUp ? 'Créer un compte' : 'Connexion'}
        </h1>

        <input
          className="auth-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="auth-input"
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleEmail()}
        />

        {error && <p className="auth-error">{error}</p>}

        <button className="auth-btn-primary" onClick={handleEmail} disabled={loading}>
          {loading ? '...' : isSignUp ? 'Créer le compte' : 'Se connecter'}
        </button>

        <div className="auth-divider"><span>ou</span></div>

        <button className="auth-btn-google" onClick={handleGoogle}>
          Continuer avec Google
        </button>

        <p className="auth-switch">
          {isSignUp ? 'Déjà un compte ?' : 'Pas encore de compte ?'}
          <span onClick={() => setIsSignUp(s => !s)}>
            {isSignUp ? ' Se connecter' : ' Créer un compte'}
          </span>
        </p>
      </div>
    </div>
  )
}