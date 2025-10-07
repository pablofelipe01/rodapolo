/**
 * Utilidades para manejar problemas de sesión y autenticación
 */

export const clearSessionData = () => {
  console.log('🧹 Limpiando datos de sesión...')

  try {
    // Limpiar localStorage
    localStorage.clear()
    console.log('✅ localStorage limpiado')

    // Limpiar sessionStorage
    sessionStorage.clear()
    console.log('✅ sessionStorage limpiado')

    // Limpiar cookies de Supabase (las principales)
    const cookiesToClear = [
      'sb-refresh-token',
      'sb-access-token',
      'supabase-auth-token',
      'supabase.auth.token',
    ]

    cookiesToClear.forEach(cookieName => {
      // Limpiar para diferentes dominios y paths
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.localhost;`
    })

    console.log('✅ Cookies principales limpiadas')

    // Intentar limpiar todas las cookies que empiecen con 'sb-'
    const allCookies = document.cookie.split(';')
    allCookies.forEach(cookie => {
      const [name] = cookie.split('=')
      const cleanName = name.trim()
      if (cleanName.startsWith('sb-') || cleanName.includes('supabase')) {
        document.cookie = `${cleanName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        document.cookie = `${cleanName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`
      }
    })

    console.log('✅ Todas las cookies de Supabase limpiadas')
  } catch (error) {
    console.error('❌ Error limpiando datos de sesión:', error)
  }
}

export const detectSessionStuck = () => {
  const stuckIndicators = [
    // Verificar si hay cookies pero no hay user en localStorage
    () => {
      const hasSupabaseCookies = document.cookie.includes('sb-')
      const hasUserInStorage =
        localStorage.getItem('supabase.auth.token') !== null
      return hasSupabaseCookies && !hasUserInStorage
    },

    // Verificar si hay múltiples tokens conflictivos
    () => {
      const cookies = document.cookie.split(';')
      const supabaseCookies = cookies.filter(c => c.includes('sb-'))
      return supabaseCookies.length > 4 // Demasiadas cookies de Supabase
    },
  ]

  return stuckIndicators.some(indicator => indicator())
}

export const forceSessionRefresh = async () => {
  console.log('🔄 Forzando actualización de sesión...')

  try {
    // Recargar la página completamente
    window.location.reload()
  } catch (error) {
    console.error('❌ Error forzando actualización:', error)
  }
}

export const emergencySessionReset = () => {
  console.log('🚨 Realizando reset de emergencia de sesión...')

  clearSessionData()

  // Esperar un momento y recargar
  setTimeout(() => {
    window.location.href = '/auth/login'
  }, 500)
}

// Hook para detectar y manejar sesiones problemáticas
export const useSessionHealthCheck = () => {
  const checkHealth = () => {
    if (detectSessionStuck()) {
      console.log('⚠️ Sesión problemática detectada')
      return false
    }
    return true
  }

  const repair = () => {
    emergencySessionReset()
  }

  return { checkHealth, repair }
}
