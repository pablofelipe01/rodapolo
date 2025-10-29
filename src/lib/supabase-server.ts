import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

// Cliente para server components
export const createServerSupabase = async () => {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                // Vercel-specific settings
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                // Remove domain setting or set to your actual domain
              })
            })
          } catch (error) {
            console.error('Cookie set error in middleware:', error)
            // Don't swallow the error on Vercel - this is critical!
            throw error
          }
        },
      },
    }
  )
}

export type SupabaseServer = Awaited<ReturnType<typeof createServerSupabase>>
