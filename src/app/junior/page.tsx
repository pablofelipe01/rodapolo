'use client'

import { useState, useEffect, useCallback } from 'react'
import { useJuniorAuth } from '@/providers/JuniorAuthProvider'
import { createClientSupabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Calendar,
  Clock,
  Trophy,
  Star,
  Target,
  User,
  BookOpen,
  Heart,
} from 'lucide-react'

interface _JuniorProfile {
  id: string
  full_name: string
  nickname: string | null
  birth_date: string | null
  handicap: number
  level: 'alpha' | 'beta'
  unique_code: string
  avatar_url: string | null
}

interface ClassInfo {
  id: string
  date: string
  start_time: string
  end_time: string
  instructor_name: string
  level: 'alpha' | 'beta' | 'mixed'
}

export default function JuniorDashboard() {
  const { juniorProfile } = useJuniorAuth()
  const [upcomingClasses, setUpcomingClasses] = useState<ClassInfo[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientSupabase()

  const fetchUpcomingClasses = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .gte('date', today)
        .or(`level.eq.${juniorProfile?.level},level.eq.mixed`)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(3)

      if (error) throw error
      setUpcomingClasses(data || [])
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }, [juniorProfile?.level, supabase])

  useEffect(() => {
    if (juniorProfile) {
      fetchUpcomingClasses()
    }
  }, [juniorProfile, fetchUpcomingClasses])

  const getAge = () => {
    if (!juniorProfile?.birth_date) return null
    const today = new Date()
    const birthDate = new Date(juniorProfile.birth_date)
    return today.getFullYear() - birthDate.getFullYear()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5)
  }

  const getLevelData = () => {
    const isAlpha = juniorProfile?.level === 'alpha'
    return {
      emoji: isAlpha ? '⭐' : '🌟',
      color: isAlpha
        ? 'from-yellow-400 to-orange-400'
        : 'from-blue-400 to-purple-400',
      text: isAlpha ? 'Alpha' : 'Beta',
      description: isAlpha ? '¡Nivel Avanzado!' : '¡Nivel Inicial!',
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '¡Buenos días'
    if (hour < 18) return '¡Buenas tardes'
    return '¡Buenas noches'
  }

  const getRandomMotivation = () => {
    const motivations = [
      '¡Hoy es un gran día para jugar polo!',
      '¡Cada práctica te hace más fuerte!',
      '¡Eres increíble en el campo!',
      '¡Sigue así, campeón!',
      '¡Tu técnica mejora cada día!',
    ]
    return motivations[Math.floor(Math.random() * motivations.length)]
  }

  const levelData = getLevelData()
  const displayName =
    juniorProfile?.nickname || juniorProfile?.full_name || 'Campeón'

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-96'>
        <div className='text-center'>
          <div className='animate-bounce text-6xl mb-4'>⚡</div>
          <p className='text-white text-xl'>Cargando tu información...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header de bienvenida */}
      <div className='text-center mb-8'>
        <div className='inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm mb-4'>
          <Avatar className='w-20 h-20 border-4 border-white'>
            <AvatarImage src={juniorProfile?.avatar_url} alt={displayName} />
            <AvatarFallback className='bg-gradient-to-r from-purple-400 to-pink-400 text-white text-2xl font-bold'>
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <h1 className='text-4xl font-bold text-white mb-2'>
          {getGreeting()}, {displayName}! 👋
        </h1>
        <p className='text-xl text-white/80 mb-4'>{getRandomMotivation()}</p>
        <Badge
          className={`bg-gradient-to-r ${levelData.color} text-white border-0 px-6 py-2 text-lg font-bold shadow-lg`}
        >
          {levelData.emoji} Nivel {levelData.text}
        </Badge>
      </div>

      {/* Tarjetas de información personal */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
        {/* Tarjeta de perfil */}
        <Card className='bg-white/90 backdrop-blur-sm border-0 shadow-xl'>
          <CardHeader className='text-center pb-3'>
            <CardTitle className='flex items-center justify-center gap-2 text-lg'>
              <User className='h-5 w-5 text-purple-600' />
              Mi Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-center'>
            <div>
              <p className='text-sm text-gray-500'>Mi Código</p>
              <p className='font-mono text-xl font-bold text-purple-600'>
                {juniorProfile?.unique_code}
              </p>
            </div>
            {getAge() && (
              <div>
                <p className='text-sm text-gray-500'>Edad</p>
                <p className='text-lg font-semibold'>{getAge()} años 🎂</p>
              </div>
            )}
            <div>
              <p className='text-sm text-gray-500'>Handicap</p>
              <div className='flex items-center justify-center gap-1'>
                <Target className='h-4 w-4 text-green-600' />
                <span className='text-lg font-semibold'>
                  {juniorProfile?.handicap}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tarjeta de estadísticas */}
        <Card className='bg-white/90 backdrop-blur-sm border-0 shadow-xl'>
          <CardHeader className='text-center pb-3'>
            <CardTitle className='flex items-center justify-center gap-2 text-lg'>
              <Trophy className='h-5 w-5 text-yellow-600' />
              Mis Stats
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>Clases tomadas</span>
              <Badge variant='secondary' className='bg-blue-100 text-blue-800'>
                12 📚
              </Badge>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>
                Logros desbloqueados
              </span>
              <Badge
                variant='secondary'
                className='bg-yellow-100 text-yellow-800'
              >
                5 🏆
              </Badge>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>Racha actual</span>
              <Badge
                variant='secondary'
                className='bg-green-100 text-green-800'
              >
                3 días 🔥
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tarjeta de motivación */}
        <Card className='bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-xl'>
          <CardHeader className='text-center pb-3'>
            <CardTitle className='flex items-center justify-center gap-2 text-lg'>
              <Star className='h-5 w-5' />
              ¡Sigue así!
            </CardTitle>
          </CardHeader>
          <CardContent className='text-center space-y-3'>
            <div className='text-4xl mb-2'>🌟</div>
            <p className='text-sm opacity-90'>
              ¡Estás haciendo un trabajo increíble!
            </p>
            <p className='text-xs opacity-75'>
              Cada práctica te acerca más a tus metas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Próximas clases */}
      <Card className='bg-white/90 backdrop-blur-sm border-0 shadow-xl'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-xl'>
            <Calendar className='h-6 w-6 text-blue-600' />
            Mis Próximas Clases
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingClasses.length === 0 ? (
            <div className='text-center py-8'>
              <BookOpen className='mx-auto h-12 w-12 text-gray-400 mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No hay clases programadas
              </h3>
              <p className='text-gray-500'>
                ¡Pídele a tus padres que reserven clases para ti!
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {upcomingClasses.map(classInfo => (
                <div
                  key={classInfo.id}
                  className='flex items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100'
                >
                  <div className='flex-shrink-0 mr-4'>
                    <div className='w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center'>
                      <Calendar className='h-6 w-6 text-white' />
                    </div>
                  </div>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <h3 className='font-semibold text-gray-900'>
                        Clase con {classInfo.instructor_name}
                      </h3>
                      <Badge
                        variant={
                          classInfo.level === 'mixed' ? 'outline' : 'default'
                        }
                        className='text-xs'
                      >
                        {classInfo.level === 'mixed'
                          ? 'MIXTO'
                          : classInfo.level.toUpperCase()}
                      </Badge>
                    </div>
                    <div className='flex items-center gap-4 text-sm text-gray-600'>
                      <div className='flex items-center gap-1'>
                        <Calendar className='w-3 h-3' />
                        {formatDate(classInfo.date)}
                      </div>
                      <div className='flex items-center gap-1'>
                        <Clock className='w-3 h-3' />
                        {formatTime(classInfo.start_time)} -{' '}
                        {formatTime(classInfo.end_time)}
                      </div>
                    </div>
                  </div>
                  <div className='flex-shrink-0'>
                    <Button
                      size='sm'
                      className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                    >
                      Ver detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botones de acción rápida */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <Button
          className='h-20 bg-white/90 hover:bg-white text-gray-700 hover:text-purple-600 border-0 shadow-lg flex-col gap-2'
          variant='outline'
        >
          <Calendar className='h-6 w-6' />
          <span className='text-sm font-medium'>Mis Clases</span>
        </Button>

        <Button
          className='h-20 bg-white/90 hover:bg-white text-gray-700 hover:text-yellow-600 border-0 shadow-lg flex-col gap-2'
          variant='outline'
        >
          <Trophy className='h-6 w-6' />
          <span className='text-sm font-medium'>Logros</span>
        </Button>

        <Button
          className='h-20 bg-white/90 hover:bg-white text-gray-700 hover:text-green-600 border-0 shadow-lg flex-col gap-2'
          variant='outline'
        >
          <Target className='h-6 w-6' />
          <span className='text-sm font-medium'>Mi Progreso</span>
        </Button>

        <Button
          className='h-20 bg-white/90 hover:bg-white text-gray-700 hover:text-pink-600 border-0 shadow-lg flex-col gap-2'
          variant='outline'
        >
          <Heart className='h-6 w-6' />
          <span className='text-sm font-medium'>Favoritos</span>
        </Button>
      </div>
    </div>
  )
}
