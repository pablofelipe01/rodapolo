import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareSupabase } from '@/lib/supabase-middleware'

// Define the profile type structure
interface Profile {
  role: string
  user_id: string
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const pathname = url.pathname

  console.log('🚀 Middleware triggered for:', pathname)

  // Public routes - allow without any checks
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/junior', '/']
  const isPublicRoute = publicRoutes.includes(pathname)

  if (isPublicRoute) {
    console.log('✅ Public route access allowed')
    return NextResponse.next()
  }

  try {
    // Use the middleware-specific Supabase client
    const { supabase, response } = createMiddlewareSupabase(request)

    // IMPORTANT: Use getUser() instead of getSession() for server-side validation
    // getSession() reads from cookies without validation, getUser() validates with Supabase
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log('🔐 No valid user found:', userError?.message || 'No user')
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/auth/login'
      const redirectResponse = NextResponse.redirect(redirectUrl)
      // Copy cookies from the original response
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      return redirectResponse
    }

    console.log('👤 User validated:', user.email)

    // Get user profile with proper typing
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('❌ Profile error:', profileError?.message || 'No profile found')
      // Don't redirect to login - let the client handle missing profile
      // This prevents loops when profile doesn't exist yet
      console.log('⚠️ Allowing access despite profile error - client will handle')
      return response
    }

    // Fix the TypeScript error by asserting the type
    const userRole = (profile as Profile).role
    console.log(`🔍 User role: ${userRole}, Path: ${pathname}`)

    // Role-based protection
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      const redirectPath = userRole === 'parental' ? '/parental' : '/auth/login'
      console.log(
        `🚫 Blocking non-admin from admin area, redirecting to ${redirectPath}`
      )
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = redirectPath
      const redirectResponse = NextResponse.redirect(redirectUrl)
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      return redirectResponse
    }

    if (pathname.startsWith('/parental') && userRole !== 'parental') {
      const redirectPath = userRole === 'admin' ? '/admin' : '/auth/login'
      console.log(
        `🚫 Blocking non-parental from parental area, redirecting to ${redirectPath}`
      )
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = redirectPath
      const redirectResponse = NextResponse.redirect(redirectUrl)
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      return redirectResponse
    }

    if (pathname.startsWith('/junior') && userRole !== 'junior') {
      const redirectPath = userRole === 'admin' ? '/admin' : userRole === 'parental' ? '/parental' : '/auth/login'
      console.log(
        `🚫 Blocking non-junior from junior area, redirecting to ${redirectPath}`
      )
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = redirectPath
      const redirectResponse = NextResponse.redirect(redirectUrl)
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      return redirectResponse
    }

    console.log(`✅ Allowing ${userRole} access to ${pathname}`)
    return response
  } catch (error) {
    console.error('❌ Middleware error:', error)
    // On error, allow the request to continue - let client handle auth
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
