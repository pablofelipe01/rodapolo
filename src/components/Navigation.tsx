'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, Menu, X, Sparkles, User, Home } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Navigation() {
  const { user, profile, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('click', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const getNavigationItems = () => {
    if (!profile) return []

    switch (profile.role) {
      case 'admin':
        return [
          {
            href: '/admin',
            label: 'Dashboard',
            icon: <Home className='h-4 w-4' />,
          },
          {
            href: '/admin/classes',
            label: 'Clases',
            icon: <Sparkles className='h-4 w-4' />,
          },
          {
            href: '/admin/posts',
            label: 'Posts',
            icon: <Sparkles className='h-4 w-4' />,
          },
          {
            href: '/admin/users',
            label: 'Usuarios',
            icon: <User className='h-4 w-4' />,
          },
          {
            href: '/admin/analytics',
            label: 'Estadísticas',
            icon: <Sparkles className='h-4 w-4' />,
          },
        ]
      case 'parental':
        return [
          {
            href: '/parental',
            label: 'Dashboard',
            icon: <Home className='h-4 w-4' />,
          },
          {
            href: '/parental/children',
            label: 'Mis Hijos',
            icon: <User className='h-4 w-4' />,
          },
          {
            href: '/parental/tickets',
            label: 'Tickets',
            icon: <Sparkles className='h-4 w-4' />,
          },
          {
            href: '/parental/bookings',
            label: 'Reservas',
            icon: <Sparkles className='h-4 w-4' />,
          },
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

  // Public navigation (no user logged in)
  if (!user) {
    return (
      <nav
        className={`
        fixed top-0 w-full z-50 transition-all duration-500
        ${
          isScrolled
            ? 'bg-slate-900/95 backdrop-blur-xl border-b border-cyan-500/20 shadow-2xl'
            : 'bg-transparent'
        }
      `}
      >
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex h-24 items-center justify-between'>
            {' '}
            {/* Increased to h-24 for larger logo */}
            {/* Logo Only - 3x larger */}
            <Link href='/' className='flex items-center group'>
              <div className='relative'>
                <Image
                  src='/logo.png'
                  alt='Rodapolo'
                  width={144} /* 48 * 3 = 144 */
                  height={75.79} /* 25.26 * 3 = 75.79 for 19:6 ratio */
                  className='h-[75.79px] w-36 transition-transform duration-300 group-hover:scale-110 object-contain' /* 3x larger */
                />
                <div className='absolute inset-0 bg-cyan-400/20 rounded-full blur-sm group-hover:bg-cyan-400/30 transition-all duration-300'></div>
              </div>
            </Link>
            {/* Auth Buttons */}
            <div className='flex items-center space-x-3'>
              <Link href='/auth/login'>
                <Button
                  variant='outline'
                  className='border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 font-semibold px-6 py-2 rounded-xl backdrop-blur-sm transition-all duration-300'
                >
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href='/auth/register'>
                <Button className='bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105'>
                  <Sparkles className='mr-2 h-4 w-4' />
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // User without profile
  if (!profile) {
    return (
      <nav className='bg-slate-900/95 backdrop-blur-xl border-b border-cyan-500/20 shadow-2xl fixed top-0 w-full z-50'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex h-24 items-center justify-between'>
            {' '}
            {/* Increased to h-24 for larger logo */}
            {/* Logo Only - 3x larger */}
            <Link href='/' className='flex items-center'>
              <Image
                src='/logo.png'
                alt='Rodapolo'
                width={120} /* 40 * 3 = 120 */
                height={63.16} /* 21.05 * 3 = 63.16 for 19:6 ratio */
                className='h-[63.16px] w-30 object-contain' /* 3x larger */
              />
            </Link>
            <div className='flex items-center space-x-4'>
              <span className='text-cyan-100 text-sm'>{user.email}</span>
              <Button
                variant='outline'
                onClick={handleSignOut}
                className='border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 font-semibold'
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

  // Full navigation with user and profile
  return (
    <>
      {/* Background Overlay */}
      {isMobileMenuOpen && (
        <div className='fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300' />
      )}

      <nav
        className={`
        fixed top-0 w-full z-50 transition-all duration-500
        ${
          isScrolled
            ? 'bg-slate-900/95 backdrop-blur-xl border-b border-cyan-500/20 shadow-2xl'
            : 'bg-slate-900/90 backdrop-blur-lg border-b border-cyan-500/10'
        }
      `}
      >
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex h-24 items-center justify-between'>
            {' '}
            {/* Increased to h-24 for larger logo */}
            {/* Logo and Desktop Navigation */}
            <div className='flex items-center space-x-8'>
              {/* Logo Only - 3x larger */}
              <Link
                href='/'
                className='flex items-center group'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className='relative'>
                  <Image
                    src='/logo.png'
                    alt='Rodapolo'
                    width={120} /* 40 * 3 = 120 */
                    height={63.16} /* 21.05 * 3 = 63.16 for 19:6 ratio */
                    className='h-[63.16px] w-30 transition-transform duration-300 group-hover:scale-110 object-contain' /* 3x larger */
                  />
                  <div className='absolute inset-0 bg-cyan-400/20 rounded-full blur-sm group-hover:bg-cyan-400/30 transition-all duration-300'></div>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className='hidden lg:flex items-center space-x-1'>
                {navigationItems.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300
                      ${
                        index === 0
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'text-cyan-100/80 hover:text-cyan-300 hover:bg-white/5'
                      }
                    `}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
            {/* Desktop User Menu */}
            <div className='hidden lg:flex items-center space-x-4'>
              <div className='flex items-center space-x-3 bg-white/5 rounded-xl px-4 py-2 border border-cyan-500/20'>
                <Avatar className='h-8 w-8 border-2 border-cyan-400/50'>
                  <AvatarImage src={user.user_metadata?.avatar_url} alt='' />
                  <AvatarFallback className='bg-gradient-to-r from-cyan-500 to-blue-500 text-white'>
                    {profile.full_name?.[0] || user.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className='flex flex-col'>
                  <span className='text-sm font-semibold text-cyan-100'>
                    {profile.full_name}
                  </span>
                  <span className='text-xs text-cyan-100/60'>
                    {profile.role === 'admin' ? 'Administrador' : 'Padre'}
                  </span>
                </div>
              </div>
              <Button
                variant='outline'
                onClick={handleSignOut}
                className='border-red-400 text-red-400 hover:bg-red-400 hover:text-white font-semibold'
              >
                <LogOut className='mr-2 h-4 w-4' />
                Salir
              </Button>
            </div>
            {/* Mobile Menu Button */}
            <div className='flex lg:hidden items-center space-x-3 mobile-menu-container'>
              <div className='flex items-center space-x-2 bg-white/5 rounded-lg px-3 py-2 border border-cyan-500/20'>
                <Avatar className='h-8 w-8 border border-cyan-400/50'>
                  <AvatarImage src={user.user_metadata?.avatar_url} alt='' />
                  <AvatarFallback className='bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm'>
                    {profile.full_name?.[0] || user.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className='relative z-50 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900'
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
          <div
            className={`
            lg:hidden mobile-menu-container fixed top-24 left-4 right-4 
            bg-slate-800 rounded-2xl shadow-2xl border border-cyan-500/20 
            transform transition-all duration-300 ease-in-out z-50
            ${
              isMobileMenuOpen
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
            }
          `}
          >
            <div className='p-4 space-y-3'>
              {/* User Info Header */}
              <div className='flex items-center space-x-3 pb-3 border-b border-cyan-500/20'>
                <Avatar className='h-12 w-12 border-2 border-cyan-400/50'>
                  <AvatarImage src={user.user_metadata?.avatar_url} alt='' />
                  <AvatarFallback className='bg-gradient-to-r from-cyan-500 to-blue-500 text-white'>
                    {profile.full_name?.[0] || user.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-semibold text-cyan-100 truncate'>
                    {profile.full_name}
                  </p>
                  <p className='text-xs text-cyan-100/60 truncate'>
                    {user.email}
                  </p>
                  <p className='text-xs text-cyan-400 font-medium'>
                    {profile.role === 'admin' ? 'Administrador' : 'Padre'}
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
                      flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                      ${
                        index === 0
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'text-cyan-100/80 hover:text-cyan-300 hover:bg-white/5'
                      }
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>

              {/* Logout Button */}
              <div className='pt-3 border-t border-cyan-500/20'>
                <Button
                  variant='outline'
                  size='sm'
                  className='w-full justify-center bg-red-500/10 text-red-400 border-red-400/30 hover:bg-red-400 hover:text-white font-semibold'
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
