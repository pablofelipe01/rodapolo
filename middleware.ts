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
        .eq('user_id', session.user.id) // FIXED: changed 'id' to 'user_id'
        .single()

      // Protección de rutas por rol
      if (profileData) {
        const userRole = (profileData as { role: string }).role

        console.log('🔍 Middleware - User role:', userRole, 'Path:', pathname)

        // Rutas solo para admins
        if (pathname.startsWith('/admin') && userRole !== 'admin') {
          url.pathname = userRole === 'parental' ? '/parental' : '/auth/login' // FIXED: 'parent' to 'parental'
          return NextResponse.redirect(url)
        }

        // Rutas solo para parentales - FIXED: use 'parental' instead of 'parent'
        if (pathname.startsWith('/parental') && userRole !== 'parental') {
          url.pathname = userRole === 'admin' ? '/admin' : '/auth/login'
          return NextResponse.redirect(url)
        }

        // Rutas solo para juniors (si existen)
        if (pathname.startsWith('/junior') && userRole !== 'junior') {
          url.pathname = userRole === 'admin' ? '/admin' : userRole === 'parental' ? '/parental' : '/auth/login' // FIXED: added parental check
          return NextResponse.redirect(url)
        }

        // Redirigir usuarios autenticados que van a la raíz
        if (pathname === '/') {
          if (userRole === 'admin') {
            url.pathname = '/admin'
            return NextResponse.redirect(url)
          } else if (userRole === 'parental') { // FIXED: 'parent' to 'parental'
            url.pathname = '/parental'
            return NextResponse.redirect(url)
          }
          // Si es junior, redirigir a junior dashboard si existe
          else if (userRole === 'junior') {
            url.pathname = '/junior'
            return NextResponse.redirect(url)
          }
        }

        // Allow access to the requested route
        return NextResponse.next()
      } else {
        // Si no hay perfil, redirigir a login
        console.log(
          '⚠️ Middleware: No se encontró perfil, redirigiendo a login'
        )
        url.pathname = '/auth/login'
        return NextResponse.redirect(url)
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
