'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Navigation() {
  const { user, profile, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu when clicking outside or on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (isMobileMenuOpen && !target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('click', handleClickOutside)
      document.body.style.overflow = 'hidden' // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('click', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

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

  const handleSignOut = () => {
    console.log('🔍 Navigation: Botón salir clickeado')
    signOut()
    setIsMobileMenuOpen(false)
  }

  // Mostrar navegación pública si no hay usuario o perfil
  if (!user) {
    console.log('🔍 Navigation - Mostrando navegación pública (no user)')
    return (
      <nav className='border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50'>
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
      <nav className='border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50'>
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
              <Button
                variant='outline'
                onClick={handleSignOut}
              >
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
    <>
      {/* Background Overlay */}
      {isMobileMenuOpen && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300' />
      )}
      
      <nav className='border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex h-16 items-center justify-between'>
            <div className='flex items-center space-x-8'>
              <Link 
                href='/' 
                className='flex items-center space-x-2'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Image
                  src='/logo.png'
                  alt='Rodapolo'
                  width={40}
                  height={40}
                  className='h-10 w-10'
                />
                <span className='text-xl font-bold'>Rodapolo</span>
              </Link>
              
              {/* Desktop Navigation */}
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

            {/* Desktop User Menu */}
            <div className='hidden md:flex items-center space-x-4'>
              <div className='flex items-center space-x-2'>
                <Avatar className='h-8 w-8'>
                  <AvatarImage src={user.user_metadata?.avatar_url} alt='' />
                  <AvatarFallback>
                    {profile.full_name?.[0] || user.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className='text-sm font-medium'>{profile.full_name}</span>
              </div>
              <Button
                variant='outline'
                onClick={handleSignOut}
              >
                <LogOut className='mr-2 h-4 w-4' />
                Salir
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className='flex md:hidden items-center space-x-3 mobile-menu-container'>
              <div className='flex items-center space-x-2'>
                <Avatar className='h-8 w-8'>
                  <AvatarImage src={user.user_metadata?.avatar_url} alt='' />
                  <AvatarFallback>
                    {profile.full_name?.[0] || user.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className='text-sm font-medium hidden sm:inline'>
                  {profile.full_name}
                </span>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className='relative z-50'
              >
                {isMobileMenuOpen ? (
                  <X className='h-4 w-4' />
                ) : (
                  <Menu className='h-4 w-4' />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Popup */}
          <div className={`
            md:hidden mobile-menu-container fixed top-16 left-4 right-4 
            bg-white rounded-lg shadow-2xl border border-gray-200 
            transform transition-all duration-300 ease-in-out z-50
            ${isMobileMenuOpen 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
            }
          `}>
            <div className='p-4 space-y-3'>
              {/* User Info Header */}
              <div className='flex items-center space-x-3 pb-3 border-b border-gray-100'>
                <Avatar className='h-10 w-10'>
                  <AvatarImage src={user.user_metadata?.avatar_url} alt='' />
                  <AvatarFallback className='bg-blue-100 text-blue-600'>
                    {profile.full_name?.[0] || user.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-semibold text-gray-900 truncate'>
                    {profile.full_name}
                  </p>
                  <p className='text-xs text-gray-500 truncate'>
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Navigation Items */}
              <div className='space-y-1'>
                {navigationItems.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
                      ${index === 0 ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Logout Button */}
              <div className='pt-3 border-t border-gray-100'>
                <Button
                  variant='outline'
                  size='sm'
                  className='w-full justify-center bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700'
                  onClick={handleSignOut}
                >
                  <LogOut className='mr-2 h-4 w-4' />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}