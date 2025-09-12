'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { JuniorProfile } from '@/types/database'

interface JuniorAuthContextType {
  juniorProfile: JuniorProfile | null
  loading: boolean
  signIn: (profile: JuniorProfile) => void
  signOut: () => void
  isAuthenticated: boolean
}

const JuniorAuthContext = createContext<JuniorAuthContextType | undefined>(
  undefined
)

export function JuniorAuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [juniorProfile, setJuniorProfile] = useState<JuniorProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay una sesión junior guardada
    const savedProfile = localStorage.getItem('junior_profile')
    const accessTime = localStorage.getItem('junior_access_time')

    if (savedProfile && accessTime) {
      const timeDiff = Date.now() - parseInt(accessTime)
      const maxSessionTime = 24 * 60 * 60 * 1000 // 24 horas

      if (timeDiff < maxSessionTime) {
        setJuniorProfile(JSON.parse(savedProfile))
      } else {
        // Sesión expirada
        localStorage.removeItem('junior_profile')
        localStorage.removeItem('junior_access_time')
      }
    }

    setLoading(false)
  }, [])

  const signIn = (profile: JuniorProfile) => {
    setJuniorProfile(profile)
    localStorage.setItem('junior_profile', JSON.stringify(profile))
    localStorage.setItem('junior_access_time', Date.now().toString())
  }

  const signOut = () => {
    setJuniorProfile(null)
    localStorage.removeItem('junior_profile')
    localStorage.removeItem('junior_access_time')
  }

  return (
    <JuniorAuthContext.Provider
      value={{
        juniorProfile,
        loading,
        signIn,
        signOut,
        isAuthenticated: !!juniorProfile,
      }}
    >
      {children}
    </JuniorAuthContext.Provider>
  )
}

export function useJuniorAuth() {
  const context = useContext(JuniorAuthContext)
  if (context === undefined) {
    throw new Error('useJuniorAuth must be used within a JuniorAuthProvider')
  }
  return context
}
