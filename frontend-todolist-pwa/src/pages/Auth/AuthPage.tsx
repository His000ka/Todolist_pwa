import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './AuthPage.css'



export default function AuthPage() {
    const [email,    setEmail]    = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const [error,    setError]    = useState<string | null>(null)
    const [loading,  setLoading]  = useState(false)
    const [username, setUsername] = useState('')
    
    const navigate = useNavigate()
    const { user } = useAuth()
    
    useEffect(() => {
        if (user) navigate('/profile')
    }, [user, navigate])

    const handleEmail = async () => {
        setLoading(true)
        setError(null)

        if (isSignUp) {
            const { data, error } = await supabase.auth.signUp({ email, password })
            if (error) { setError(error.message); setLoading(false); return }

            if (data.user) {
            await supabase.from('profiles').upsert({
                id:       data.user.id,
                email:    email,
                username: username.trim() || null,
            })
            }
            navigate('/profile')
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) setError(error.message)
            else navigate('/profile')
        }
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
        {isSignUp && (
            <input
                className="auth-input"
                type="text"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={e => setUsername(e.target.value)}
                maxLength={20}
            />
        )}
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