import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const url = request.nextUrl.clone()
    const pathname = url.pathname

    // Rutas públicas que no requieren autenticación
    const publicRoutes = ['/auth/login', '/auth/register', '/auth/junior', '/']
    const isPublicRoute = publicRoutes.includes(pathname)

    // Si no hay sesión y la ruta no es pública, redirigir a login
    if (!session && !isPublicRoute) {
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

    // Si hay sesión, obtener el perfil para verificar el rol
    if (session) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      // Protección de rutas por rol
      if (profileData) {
        const userType = (profileData as { role: string }).role

        // Rutas solo para admins
        if (pathname.startsWith('/admin') && userType !== 'admin') {
          url.pathname = userType === 'parental' ? '/parental' : '/junior'
          return NextResponse.redirect(url)
        }

        // Rutas solo para parentales
        if (pathname.startsWith('/parental') && userType !== 'parental') {
          url.pathname = userType === 'admin' ? '/admin' : '/junior'
          return NextResponse.redirect(url)
        }

        // Rutas solo para juniors
        if (pathname.startsWith('/junior') && userType !== 'junior') {
          url.pathname = userType === 'admin' ? '/admin' : '/parental'
          return NextResponse.redirect(url)
        }

        // Redirigir desde la raíz al dashboard apropiado
        if (pathname === '/' && session) {
          url.pathname = `/${userType}`
          return NextResponse.redirect(url)
        }
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
