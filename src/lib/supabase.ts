import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

// Cliente para componentes client-side
export const createClientSupabase = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Tipos de autenticación para TypeScript
export type SupabaseClient = ReturnType<typeof createClientSupabase>
