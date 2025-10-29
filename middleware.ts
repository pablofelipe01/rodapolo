import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareSupabase } from '@/lib/supabase-middleware'

// Define the profile type structure
interface Profile {
  role: string;
  user_id: string;
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const pathname = url.pathname

  console.log('🚀 Middleware triggered for:', pathname)

  // Public routes
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/junior', '/']
  const isPublicRoute = publicRoutes.includes(pathname)

  if (isPublicRoute) {
    console.log('✅ Public route access allowed')
    return NextResponse.next()
  }

  try {
    // Use the middleware-specific Supabase client
    const { supabase, response } = createMiddlewareSupabase(request)
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('❌ Session error:', sessionError)
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

    if (!session) {
      console.log('🔐 No session found')
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

    console.log('👤 Session found for:', session.user.email)

    // Get user profile with proper typing
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    if (profileError) {
      console.error('❌ Profile error:', profileError)
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

    if (!profile) {
      console.log('⚠️ No profile found')
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

    // Fix the TypeScript error by asserting the type
    const userRole = (profile as Profile).role
    console.log(`🔍 User role: ${userRole}, Path: ${pathname}`)

    // Handle root path redirect
    if (pathname === '/') {
      let redirectPath = '/auth/login'
      
      if (userRole === 'admin') {
        redirectPath = '/admin'
      } else if (userRole === 'parental') {
        redirectPath = '/parental'
      } else if (userRole === 'junior') {
        redirectPath = '/junior'
      }
      
      console.log(`🏠 Redirecting ${userRole} from / to ${redirectPath}`)
      url.pathname = redirectPath
      return NextResponse.redirect(url)
    }

    // Role-based protection
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      const redirectPath = userRole === 'parental' ? '/parental' : '/auth/login'
      console.log(`🚫 Blocking non-admin from admin area, redirecting to ${redirectPath}`)
      url.pathname = redirectPath
      return NextResponse.redirect(url)
    }

    if (pathname.startsWith('/parental') && userRole !== 'parental') {
      const redirectPath = userRole === 'admin' ? '/admin' : '/auth/login'
      console.log(`🚫 Blocking non-parental from parental area, redirecting to ${redirectPath}`)
      url.pathname = redirectPath
      return NextResponse.redirect(url)
    }

    console.log(`✅ Allowing ${userRole} access to ${pathname}`)
    return response

  } catch (error) {
    console.error('❌ Middleware error:', error)
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
