'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useJuniorAuth } from '@/providers/JuniorAuthProvider'
import { JuniorNavigation } from '@/components/junior/JuniorNavigation'

export default function JuniorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { juniorProfile, loading, isAuthenticated } = useJuniorAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/junior')
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin text-6xl mb-4'>⚡</div>
          <p className='text-white text-xl font-bold'>Cargando tu área...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !juniorProfile) {
    return null // Redirigiendo...
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400'>
      {/* Header con navegación junior */}
      <JuniorNavigation juniorProfile={juniorProfile} />

      {/* Contenido principal */}
      <main className='pt-20 pb-6 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>{children}</div>
      </main>

      {/* Footer divertido */}
      <footer className='bg-white/10 backdrop-blur-sm border-t border-white/20 py-4'>
        <div className='max-w-7xl mx-auto px-4 text-center'>
          <p className='text-white/80 text-sm'>
            🏌️‍♂️ ¡Diviértete jugando polo! 🎯
          </p>
        </div>
      </footer>
    </div>
  )
}
