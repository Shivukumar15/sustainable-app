import { createContext } from 'react'

export interface User {
  id: string
  username: string
  email: string
  ecoScore: number
  purchasedProducts: unknown[]
}

export interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isAuthenticated: boolean
}

export const authContext = createContext<AuthContextType | undefined>(undefined)
