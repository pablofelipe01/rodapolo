import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const url = request.nextUrl.clone()
    const pathname = url.pathname

    console.log('🚀 Middleware started for path:', pathname)

    // Rutas públicas que no requieren autenticación
    const publicRoutes = ['/auth/login', '/auth/register', '/auth/junior', '/']
    const isPublicRoute = publicRoutes.includes(pathname)

    // Si es una ruta pública, permitir acceso sin verificar sesión
    if (isPublicRoute) {
      console.log('✅ Public route, allowing access')
      return NextResponse.next()
    }

    const supabase = await createServerSupabase()
    
    // Get session with better error handling
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('❌ Session error:', sessionError)
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

    // Si no hay sesión, redirigir a login
    if (!session) {
      console.log('🔐 No session found, redirecting to login')
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

    console.log('👤 Session found for user:', session.user.email)

    // Si hay sesión, obtener el perfil para verificar el rol
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    if (profileError) {
      console.error('❌ Profile fetch error:', profileError)
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

    if (!profileData) {
      console.log('⚠️ No profile found, redirecting to login')
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

    const userRole = (profileData as any).role
    console.log('🔍 User role detected:', userRole, 'for path:', pathname)

    // Redirigir usuarios autenticados que van a la raíz
    if (pathname === '/') {
      console.log('🏠 Root path detected, checking role for redirect...')
      let redirectPath = '/auth/login'
      
      if (userRole === 'admin') {
        redirectPath = '/admin'
      } else if (userRole === 'parental') {
        redirectPath = '/parental'
      } else if (userRole === 'junior') {
        redirectPath = '/junior'
      }
      
      console.log(`🔄 Redirecting ${userRole} from / to ${redirectPath}`)
      url.pathname = redirectPath
      return NextResponse.redirect(url)
    }

    // Rutas solo para admins
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      const redirectPath = userRole === 'parental' ? '/parental' : '/auth/login'
      console.log(`🔄 Redirecting non-admin (${userRole}) from ${pathname} to ${redirectPath}`)
      url.pathname = redirectPath
      return NextResponse.redirect(url)
    }

    // Rutas solo para parentales
    if (pathname.startsWith('/parental') && userRole !== 'parental') {
      const redirectPath = userRole === 'admin' ? '/admin' : '/auth/login'
      console.log(`🔄 Redirecting non-parental (${userRole}) from ${pathname} to ${redirectPath}`)
      url.pathname = redirectPath
      return NextResponse.redirect(url)
    }

    // Rutas solo para juniors
    if (pathname.startsWith('/junior') && userRole !== 'junior') {
      const redirectPath = userRole === 'admin' ? '/admin' : userRole === 'parental' ? '/parental' : '/auth/login'
      console.log(`🔄 Redirecting non-junior (${userRole}) from ${pathname} to ${redirectPath}`)
      url.pathname = redirectPath
      return NextResponse.redirect(url)
    }

    // Allow access to the requested route
    console.log(`✅ Allowing access to ${pathname} for role ${userRole}`)
    return NextResponse.next()

  } catch (error) {
    console.error('❌ Middleware error:', error)

    // En caso de error, redirigir a login para rutas no públicas
    const url = request.nextUrl.clone()
    const pathname = url.pathname
    const publicRoutes = ['/auth/login', '/auth/register', '/auth/junior', '/']
    const isPublicRoute = publicRoutes.includes(pathname)

    if (!isPublicRoute) {
      console.log('🚨 Error occurred, redirecting to login')
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}
