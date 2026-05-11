import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'

export function LoginPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (mode === 'login') await login(loginValue, password)
      else await register(loginValue, password, displayName || loginValue)
      navigate('/profile')
    } catch (e) {
      setError((e as Error).message || 'failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <h2>{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
      <form onSubmit={submit} className="auth__form">
        <label className="auth__field">
          <span>Login</span>
          <input
            value={loginValue}
            onChange={(e) => setLoginValue(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        {mode === 'register' && (
          <label className="auth__field">
            <span>Display name</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="optional"
            />
          </label>
        )}
        <label className="auth__field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
          />
        </label>
        {error && <div className="auth__error">{error}</div>}
        <button type="submit" className="auth__submit" disabled={busy}>
          {busy ? '...' : mode === 'login' ? 'Sign in' : 'Create'}
        </button>
      </form>
      <button
        type="button"
        className="auth__toggle"
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
      >
        {mode === 'login' ? 'Need an account? Register' : 'Have an account? Sign in'}
      </button>
    </div>
  )
}
