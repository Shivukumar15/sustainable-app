import { useContext } from 'react'
import { authContext, type AuthContextType } from './authContext'

export function useAuth(): AuthContextType {
  const context = useContext(authContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
