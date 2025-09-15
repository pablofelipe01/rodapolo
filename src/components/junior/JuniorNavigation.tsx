'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useJuniorAuth } from '@/providers/JuniorAuthProvider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Home, Calendar, Trophy, LogOut, ChevronDown, User } from 'lucide-react'

interface JuniorProfile {
  id: string
  full_name: string
  nickname: string | null
  level: 'alpha' | 'beta'
  unique_code: string
  avatar_url: string | null
  handicap: number
}

interface JuniorNavigationProps {
  juniorProfile: JuniorProfile
}

export function JuniorNavigation({ juniorProfile }: JuniorNavigationProps) {
  const { signOut } = useJuniorAuth()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = () => {
    signOut()
    router.push('/auth/junior')
  }

  const navItems = [
    {
      label: 'Mi Espacio',
      icon: Home,
      href: '/junior',
      emoji: '🏠',
    },
    {
      label: 'Mis Clases',
      icon: Calendar,
      href: '/junior/classes',
      emoji: '📅',
    },
    {
      label: 'Mis Logros',
      icon: Trophy,
      href: '/junior/achievements',
      emoji: '🏆',
    },
  ]

  const getAvatarFallback = () => {
    return juniorProfile.full_name?.charAt(0)?.toUpperCase() || '👤'
  }

  const getLevelColor = () => {
    return juniorProfile.level === 'alpha' ? 'bg-yellow-400' : 'bg-blue-400'
  }

  const getLevelEmoji = () => {
    return juniorProfile.level === 'alpha' ? '⭐' : '🌟'
  }

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-white/20 shadow-lg'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo / Título */}
          <div className='flex items-center space-x-2'>
            <div className='text-2xl'>⚡</div>
            <h1 className='text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
              Mi Rodapolo
            </h1>
          </div>

          {/* Navegación central - Desktop */}
          <div className='hidden md:flex items-center space-x-1'>
            {navItems.map(item => (
              <Button
                key={item.href}
                variant='ghost'
                className='flex items-center space-x-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg transition-colors'
                onClick={() => router.push(item.href)}
              >
                <span className='text-lg'>{item.emoji}</span>
                <span className='font-medium'>{item.label}</span>
              </Button>
            ))}
          </div>

          {/* Perfil del usuario */}
          <div className='flex items-center space-x-3'>
            {/* Nivel badge */}
            <Badge
              className={`${getLevelColor()} text-white border-0 px-3 py-1 text-sm font-bold`}
            >
              {getLevelEmoji()} {juniorProfile.level?.toUpperCase()}
            </Badge>

            {/* Menú de perfil */}
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='flex items-center space-x-2 p-2 rounded-lg hover:bg-purple-50'
                >
                  <Avatar className='h-8 w-8'>
                    <AvatarImage
                      src={juniorProfile.avatar_url}
                      alt={juniorProfile.full_name}
                    />
                    <AvatarFallback className='bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold'>
                      {getAvatarFallback()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='hidden sm:block text-left'>
                    <p className='text-sm font-medium text-gray-700'>
                      {juniorProfile.nickname || juniorProfile.full_name}
                    </p>
                    <p className='text-xs text-gray-500'>
                      Código: {juniorProfile.unique_code}
                    </p>
                  </div>
                  <ChevronDown className='h-4 w-4 text-gray-500' />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align='end'
                className='w-56 bg-white/95 backdrop-blur-sm border border-white/20'
              >
                <div className='px-3 py-2'>
                  <p className='text-sm font-medium text-gray-900'>
                    ¡Hola, {juniorProfile.nickname || juniorProfile.full_name}!
                  </p>
                  <p className='text-xs text-gray-500'>
                    Handicap: {juniorProfile.handicap} ⛳
                  </p>
                </div>

                <DropdownMenuSeparator />

                {/* Navegación móvil */}
                <div className='md:hidden'>
                  {navItems.map(item => (
                    <DropdownMenuItem
                      key={item.href}
                      onClick={() => {
                        router.push(item.href)
                        setIsMenuOpen(false)
                      }}
                      className='flex items-center space-x-3 px-3 py-2 cursor-pointer'
                    >
                      <span className='text-lg'>{item.emoji}</span>
                      <span>{item.label}</span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </div>

                <DropdownMenuItem
                  onClick={() => {
                    router.push('/junior/profile')
                    setIsMenuOpen(false)
                  }}
                  className='flex items-center space-x-3 px-3 py-2 cursor-pointer'
                >
                  <User className='h-4 w-4' />
                  <span>Mi Perfil</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleSignOut}
                  className='flex items-center space-x-3 px-3 py-2 cursor-pointer text-red-600'
                >
                  <LogOut className='h-4 w-4' />
                  <span>Salir</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
