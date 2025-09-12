'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { MainLayout } from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && profile) {
      // Redirigir al dashboard apropiado según el tipo de usuario
      router.push(`/${profile.role}`)
    }
  }, [user, profile, loading, router])

  if (loading) {
    return (
      <MainLayout showNavigation={false}>
        <div className='flex min-h-screen items-center justify-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>
      </MainLayout>
    )
  }

  // Si el usuario está autenticado, no mostrar esta página (será redirigido)
  if (user && profile) {
    return null
  }

  return (
    <MainLayout>
      <div className='min-h-screen'>
        {/* Hero Section */}
        <section className='bg-gradient-to-r from-blue-600 to-purple-600 text-white'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='py-20 text-center'>
              <div className='mx-auto mb-8 flex justify-center'>
                <Image
                  src='/logo.png'
                  alt='Rodapolo'
                  width={120}
                  height={120}
                  className='h-30 w-30'
                />
              </div>
              <h1 className='mb-6 text-4xl font-bold sm:text-5xl lg:text-6xl'>
                Bienvenido a Rodapolo
              </h1>
              <p className='mx-auto mb-8 max-w-2xl text-xl'>
                La plataforma completa para la gestión de polo con monociclos
                eléctricos. Administra clases, reservas y conecta con la
                comunidad.
              </p>
              <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
                <Link href='/auth/register'>
                  <Button
                    size='lg'
                    variant='secondary'
                    className='w-full sm:w-auto'
                  >
                    Registrarse
                  </Button>
                </Link>
                <Link href='/auth/login'>
                  <Button
                    size='lg'
                    variant='outline'
                    className='w-full sm:w-auto bg-transparent border-white text-white hover:bg-white hover:text-blue-600'
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href='/auth/junior'>
                  <Button
                    size='lg'
                    variant='outline'
                    className='w-full sm:w-auto bg-transparent border-white text-white hover:bg-white hover:text-purple-600'
                  >
                    Acceso con Código
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className='py-20 bg-white'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-16'>
              <h2 className='text-3xl font-bold text-gray-900 mb-4'>
                Todo lo que necesitas en una plataforma
              </h2>
              <p className='text-xl text-gray-600'>
                Diseñado especialmente para la gestión de deportes con menores
              </p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              <div className='text-center'>
                <div className='mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center'>
                  <span className='text-2xl'>👨‍👩‍👧‍👦</span>
                </div>
                <h3 className='text-xl font-semibold mb-2'>Para Padres</h3>
                <p className='text-gray-600'>
                  Gestiona los perfiles de tus hijos, compra tickets y realiza
                  reservas de manera sencilla.
                </p>
              </div>
              <div className='text-center'>
                <div className='mx-auto mb-4 h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center'>
                  <span className='text-2xl'>🏆</span>
                </div>
                <h3 className='text-xl font-semibold mb-2'>
                  Para Administradores
                </h3>
                <p className='text-gray-600'>
                  Control completo de clases, usuarios, contenido y estadísticas
                  del sistema.
                </p>
              </div>
              <div className='text-center'>
                <div className='mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center'>
                  <span className='text-2xl'>⚡</span>
                </div>
                <h3 className='text-xl font-semibold mb-2'>Para Jóvenes</h3>
                <p className='text-gray-600'>
                  Acceso seguro con códigos únicos para ver contenido y
                  participar en la comunidad.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
