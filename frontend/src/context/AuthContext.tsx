import { useState, type ReactNode } from 'react'
import { authContext, type User } from './authContext'

function loadInitialToken(): string | null {
  try {
    return localStorage.getItem('token')
  } catch {
    return null
  }
}

function loadInitialUser(): User | null {
  try {
    const saved = localStorage.getItem('user')
    if (saved) return JSON.parse(saved) as User
  } catch {
    localStorage.removeItem('user')
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadInitialUser)
  const [token, setToken] = useState<string | null>(loadInitialToken)

  const login = (newToken: string, newUser: User) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <authContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </authContext.Provider>
  )
}
