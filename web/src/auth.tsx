import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api, ApiError } from './api'

export interface User {
  username: string
  name: string
  role: string | null
  permissions: string[]
}

interface AuthState {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  can: (key: string) => boolean
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<User>('/me')
      .then(setUser)
      .catch((e) => {
        if (!(e instanceof ApiError && e.status === 401)) console.error(e)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    await api('/login', { method: 'POST', body: { username, password } })
    setUser(await api<User>('/me'))
  }, [])

  const logout = useCallback(async () => {
    await api('/logout', { method: 'POST' }).catch(() => undefined)
    setUser(null)
  }, [])

  // Hanya untuk menampilkan/menyembunyikan menu. Pengaman sebenarnya ada di API.
  const can = useCallback(
    (key: string) => !!user && (user.permissions.includes('*') || user.permissions.includes(key)),
    [user],
  )

  const value = useMemo(() => ({ user, loading, login, logout, can }), [user, loading, login, logout, can])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return ctx
}
