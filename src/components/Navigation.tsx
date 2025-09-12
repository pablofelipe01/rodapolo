'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut } from 'lucide-react'

export function Navigation() {
  const { user, profile, signOut } = useAuth()

  // Debug logs
  console.log('🔍 Navigation - user:', !!user)
  console.log('🔍 Navigation - profile:', profile)

  const getNavigationItems = () => {
    if (!profile) return []

    switch (profile.role) {
      case 'admin':
        return [
          { href: '/admin', label: 'Dashboard' },
          { href: '/admin/classes', label: 'Clases' },
          { href: '/admin/posts', label: 'Posts' },
          { href: '/admin/users', label: 'Usuarios' },
          { href: '/admin/analytics', label: 'Estadísticas' },
        ]
      case 'parental':
        return [
          { href: '/parental', label: 'Dashboard' },
          { href: '/parental/children', label: 'Mis Hijos' },
          { href: '/parental/tickets', label: 'Tickets' },
          { href: '/parental/bookings', label: 'Reservas' },
        ]
      default:
        return []
    }
  }

  const navigationItems = getNavigationItems()

  // Mostrar navegación pública si no hay usuario o perfil
  if (!user) {
    console.log('🔍 Navigation - Mostrando navegación pública (no user)')
    return (
      <nav className='border-b'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex h-16 items-center justify-between'>
            <Link href='/' className='flex items-center space-x-2'>
              <Image
                src='/logo.png'
                alt='Rodapolo'
                width={40}
                height={40}
                className='h-10 w-10'
              />
              <span className='text-xl font-bold'>Rodapolo</span>
            </Link>
            <div className='flex items-center space-x-4'>
              <Link href='/auth/login'>
                <Button variant='outline'>Iniciar Sesión</Button>
              </Link>
              <Link href='/auth/register'>
                <Button>Registrarse</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // Si hay usuario pero no perfil, mostrar navegación básica con logout
  if (!profile) {
    console.log('🔍 Navigation - Usuario sin perfil, mostrando logout básico')
    return (
      <nav className='border-b'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex h-16 items-center justify-between'>
            <Link href='/' className='flex items-center space-x-2'>
              <Image
                src='/logo.png'
                alt='Rodapolo'
                width={40}
                height={40}
                className='h-10 w-10'
              />
              <span className='text-xl font-bold'>Rodapolo</span>
            </Link>
            <div className='flex items-center space-x-4'>
              <span className='text-sm'>{user.email}</span>
              <Button variant='outline' onClick={() => signOut()}>
                <LogOut className='mr-2 h-4 w-4' />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // Navegación completa con usuario y perfil
  console.log('🔍 Navigation - Mostrando navegación completa')
  return (
    <nav className='border-b'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          <div className='flex items-center space-x-8'>
            <Link href='/' className='flex items-center space-x-2'>
              <Image
                src='/logo.png'
                alt='Rodapolo'
                width={40}
                height={40}
                className='h-10 w-10'
              />
              <span className='text-xl font-bold'>Rodapolo</span>
            </Link>
            <div className='hidden md:flex items-center space-x-6'>
              {navigationItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className='text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors'
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-2'>
              <Avatar className='h-8 w-8'>
                <AvatarImage src={user.user_metadata?.avatar_url} alt='' />
                <AvatarFallback>
                  {profile.full_name?.[0] || user.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className='text-sm font-medium'>{profile.full_name}</span>
            </div>
            <Button variant='outline' onClick={() => signOut()}>
              <LogOut className='mr-2 h-4 w-4' />
              Salir
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
