import { createServerSupabase } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const url = request.nextUrl.clone()
    const pathname = url.pathname

    // Rutas públicas que no requieren autenticación
    const publicRoutes = ['/auth/login', '/auth/register', '/auth/junior', '/']
    const isPublicRoute = publicRoutes.includes(pathname)

    // Si es una ruta pública, permitir acceso sin verificar sesión
    if (isPublicRoute) {
      return NextResponse.next()
    }

    // Crear timeout para operaciones de Supabase
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Middleware timeout')), 3000)
    )

    const supabaseOperations = async () => {
      const supabase = await createServerSupabase()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      // Si no hay sesión, redirigir a login
      if (!session) {
        url.pathname = '/auth/login'
        return NextResponse.redirect(url)
      }

      // Si hay sesión, obtener el perfil para verificar el rol
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
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

        // Allow access to the requested route
        return NextResponse.next()
      } else {
        // Si no hay perfil, permitir acceso a la ruta solicitada
        console.log('⚠️ Middleware: No se encontró perfil, permitiendo acceso')
        return NextResponse.next()
      }
    }

    // Ejecutar con timeout
    const result = await Promise.race([supabaseOperations(), timeoutPromise])
    return result as NextResponse
  } catch (error) {
    console.error('❌ Middleware error:', error)

    // En caso de error, permitir acceso a rutas públicas
    const url = request.nextUrl.clone()
    const pathname = url.pathname
    const publicRoutes = ['/auth/login', '/auth/register', '/auth/junior', '/']
    const isPublicRoute = publicRoutes.includes(pathname)

    if (!isPublicRoute) {
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

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