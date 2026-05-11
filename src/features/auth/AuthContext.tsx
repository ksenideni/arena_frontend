import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api, auth as tokenStore } from '../../api/client'
import type { AuthUser } from '../../api/types'

interface AuthState {
  user: AuthUser | null
  loading: boolean
  login: (login: string, password: string) => Promise<void>
  register: (login: string, password: string, displayName?: string) => Promise<void>
  logout: () => void
}

const AuthCtx = createContext<AuthState | null>(null)

/**
 * Глобальный auth-провайдер. При маунте пробует /api/me/profile, чтобы
 * восстановить сессию по сохранённому JWT — если токен битый, чистим его
 * молча и считаем, что пользователь не залогинен.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    if (!tokenStore.getToken()) {
      setLoading(false)
      return
    }
    api.profile()
      .then((p) => { if (!cancelled) setUser(p.user) })
      .catch(() => { tokenStore.setToken(null); if (!cancelled) setUser(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (loginValue: string, password: string) => {
    const res = await api.login(loginValue, password)
    tokenStore.setToken(res.token)
    setUser(res.user)
  }, [])

  const register = useCallback(async (loginValue: string, password: string, displayName?: string) => {
    const res = await api.register(loginValue, password, displayName)
    tokenStore.setToken(res.token)
    setUser(res.user)
  }, [])

  const logout = useCallback(() => {
    tokenStore.setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  )

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
