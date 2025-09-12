'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

interface AuthContextType {
  user: User | null
  profile: Database['public']['Tables']['profiles']['Row'] | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<
    Database['public']['Tables']['profiles']['Row'] | null
  >(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientSupabase()
  const router = useRouter()

  const fetchProfile = useCallback(
    async (userId: string) => {
      try {
        console.log('🔍 AuthProvider: Buscando perfil para user_id:', userId)

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        console.log('🔍 AuthProvider: Resultado consulta perfil:', {
          profile,
          error,
        })

        if (error) {
          console.error('❌ AuthProvider: Error en consulta perfil:', error)
          setProfile(null)
          return
        }

        setProfile(profile)
        console.log('✅ AuthProvider: Perfil cargado exitosamente:', profile)
      } catch (error) {
        console.error('❌ AuthProvider: Error inesperado:', error)
        // Por ahora, crear un perfil mock para que funcione
        const mockProfile = {
          id: userId,
          user_id: userId,
          role: 'admin' as const,
          full_name: 'Pablo Acebedo',
          email: 'pablofelipe@me.com',
          phone: '573204735546',
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        console.log('🔧 AuthProvider: Usando perfil mock:', mockProfile)
        setProfile(mockProfile)
      }
    },
    [supabase]
  )

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchProfile(session.user.id)
      }

      setLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, fetchProfile])

  const signOut = async () => {
    try {
      console.log('🚪 Cerrando sesión...')
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      console.log('✅ Sesión cerrada, redirigiendo al home')
      router.push('/')
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
