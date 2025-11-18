'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useMemo,
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
  const router = useRouter()

  // Create supabase client inside component with useMemo
  const supabase = useMemo(() => createClientSupabase(), [])

  // Use refs to prevent duplicate fetches
  const isFetchingProfile = useRef(false)
  const lastFetchedUserId = useRef<string | null>(null)
  const initializationComplete = useRef(false)

  const fetchProfile = async (userId: string) => {
    // Prevent duplicate fetches for the same user
    if (isFetchingProfile.current || lastFetchedUserId.current === userId) {
      console.log('⏭️ Skipping duplicate profile fetch for:', userId)
      return
    }

    isFetchingProfile.current = true

    try {
      console.log('🔍 Fetching profile for user:', userId)

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('❌ Profile fetch error:', error.message, error.code)
        setProfile(null)
        return
      }

      if (!profileData) {
        console.error('❌ No profile found for user:', userId)
        setProfile(null)
        return
      }

      const profile =
        profileData as Database['public']['Tables']['profiles']['Row']
      console.log('✅ Profile loaded successfully:', profile.role)
      setProfile(profile)
      lastFetchedUserId.current = userId
    } catch (error) {
      console.error('❌ Unexpected error:', error)
      setProfile(null)
    } finally {
      isFetchingProfile.current = false
    }
  }

  const refreshProfile = async () => {
    if (user) {
      lastFetchedUserId.current = null // Force refresh
      await fetchProfile(user.id)
    }
  }

  useEffect(() => {
    let mounted = true

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (mounted && loading && !initializationComplete.current) {
        console.error('⏰ Auth initialization timeout after 10s')
        setLoading(false)
      }
    }, 10000)

    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing auth...')

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        console.log('📦 getSession result:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          error: error?.message,
        })

        if (!mounted) return

        if (error) {
          console.error('❌ Session error:', error)
          setUser(null)
          setProfile(null)
          setLoading(false)
          initializationComplete.current = true
          return
        }

        if (session?.user) {
          console.log('📋 Session found for:', session.user.email)
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          console.log('📋 No session found')
          setUser(null)
          setProfile(null)
        }

        setLoading(false)
        initializationComplete.current = true
        console.log('✅ Auth initialization complete')
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        setUser(null)
        setProfile(null)
        setLoading(false)
        initializationComplete.current = true
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, {
        hasSession: !!session,
        hasUser: !!session?.user,
      })

      if (!mounted) return

      // Handle events
      if (event === 'SIGNED_IN') {
        if (session?.user) {
          console.log('✅ User signed in:', session.user.email)
          setUser(session.user)
          lastFetchedUserId.current = null // Reset to force fetch
          await fetchProfile(session.user.id)
        }
        setLoading(false)
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out')
        setUser(null)
        setProfile(null)
        lastFetchedUserId.current = null
        setLoading(false)
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed')
        if (session?.user) {
          setUser(session.user)
        }
      } else if (event === 'INITIAL_SESSION') {
        // Only handle if initialization hasn't completed yet
        if (!initializationComplete.current) {
          console.log('📋 Initial session event')
          if (session?.user) {
            setUser(session.user)
            await fetchProfile(session.user.id)
          }
          setLoading(false)
          initializationComplete.current = true
        }
      }
    })

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    try {
      setUser(null)
      setProfile(null)
      lastFetchedUserId.current = null

      const { error } = await supabase.auth.signOut()
      if (error) throw error

      router.push('/')
    } catch (error) {
      console.error('❌ Sign out error:', error)
      router.push('/')
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signOut, refreshProfile }}
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
