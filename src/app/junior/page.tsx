'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  Clock,
  User,
  Trophy,
  Star,
  BookOpen,
  Target,
  Award,
  MessageSquare,
  MapPin,
} from 'lucide-react'
import { createClientSupabase } from '@/lib/supabase'
import { useJuniorAuth } from '@/providers/JuniorAuthProvider'
import { JuniorPostsSection } from '@/components/JuniorPostsSection'
import RankingTable from '@/components/ranking/RankingTable'

interface BookingWithClass {
  id: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended'
  class_id: string
  classes: {
    id: string
    date: string
    start_time: string
    end_time: string
    instructor_name: string
    level: string
    notes: string | null
    field: string | null
  }
}

export default function JuniorDashboard() {
  const { juniorProfile } = useJuniorAuth()
  const [upcomingBookings, setUpcomingBookings] = useState<BookingWithClass[]>(
    []
  )
  const [isLoading, setIsLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState<BookingWithClass | null>(
    null
  )
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const supabase = createClientSupabase()

  const fetchUpcomingBookings = useCallback(async () => {
    if (!juniorProfile?.id) {
      console.log('❌ No juniorProfile.id:', juniorProfile)
      return
    }

    try {
      setIsLoading(true)
      console.log(
        '🔍 Fetching MIS RESERVAS for junior:',
        juniorProfile.unique_code
      )

      // Get current date (without time) for comparison
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // First get all junior's bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, status, class_id')
        .eq('junior_id', juniorProfile.id)
        .in('status', ['confirmed', 'attended'])

      if (bookingsError) {
        console.error('❌ Error fetching bookings:', bookingsError)
        console.error('Error al cargar las reservas')
        return
      }

      console.log('📋 Bookings query result:', bookingsData)

      if (!bookingsData || bookingsData.length === 0) {
        console.log('📭 No bookings found for this junior')
        setUpcomingBookings([])
        return
      }

      // Get unique class IDs
      // @ts-expect-error - Temporary ignore for type inference issue
      const classIds = bookingsData.map(booking => booking.class_id)
      console.log('🎯 Class IDs to fetch:', classIds)

      // Get class information
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select(
          `id, date, start_time, end_time, instructor_name, level, notes, field`
        )
        .in('id', classIds)
        .gte('date', today.toISOString().split('T')[0]) // Only future dates
        .order('date', { ascending: true }) // Order by date ascending

      if (classesError) {
        console.error('❌ Error fetching classes:', classesError)
        console.error('Error al cargar información de clases')
        return
      }

      console.log('🏫 Classes query result:', classesData)

      // Combine bookings with classes
      const validBookings = bookingsData
        .map(booking => {
          // @ts-expect-error - Temporary ignore for type inference issue
          const classInfo = classesData?.find(c => c.id === booking.class_id)
          if (classInfo) {
            return {
              // @ts-expect-error - Temporary ignore for type inference issue
              ...booking,
              classes: classInfo,
            }
          } else {
            console.log(
              // @ts-expect-error - Temporary ignore for type inference issue
              `⚠️ No class found for booking ${booking.id} with class_id ${booking.class_id}`
            )
            return null
          }
        })
        .filter(booking => booking !== null)

      console.log('✅ Próximas reservas encontradas:', validBookings.length)
      console.log('📋 Valid bookings:', validBookings)
      setUpcomingBookings(validBookings)
    } catch (error) {
      console.error('💥 Error:', error)
      console.error('Error al cargar las reservas')
    } finally {
      setIsLoading(false)
    }
  }, [juniorProfile, supabase])

  useEffect(() => {
    console.log('🔄 useEffect triggered with juniorProfile:', juniorProfile)
    if (juniorProfile) {
      console.log('✅ Calling fetchUpcomingBookings')
      fetchUpcomingBookings()
    } else {
      console.log('❌ No juniorProfile, not fetching bookings')
    }
  }, [juniorProfile, fetchUpcomingBookings])

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

  if (isLoading && !juniorProfile) {
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

      {/* Navegación por tabs */}
      <Tabs defaultValue='dashboard' className='w-full'>
        <TabsList className='grid w-full grid-cols-3 mb-6 bg-white/90 backdrop-blur-sm'>
          <TabsTrigger
            value='dashboard'
            className='flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white'
          >
            <User className='h-4 w-4' />
            Mi Dashboard
          </TabsTrigger>
          <TabsTrigger
            value='content'
            className='flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white'
          >
            <BookOpen className='h-4 w-4' />
            Contenido
          </TabsTrigger>
          <TabsTrigger
            value='ranking'
            className='flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white'
          >
            <Award className='h-4 w-4' />
            Ranking
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value='dashboard' className='space-y-6'>
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
                  <Badge
                    variant='secondary'
                    className='bg-blue-100 text-blue-800'
                  >
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
              {isLoading ? (
                <div className='flex justify-center py-8'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                </div>
              ) : upcomingBookings.length === 0 ? (
                <div className='text-center py-8'>
                  <BookOpen className='mx-auto h-12 w-12 text-gray-400 mb-4' />
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    No tienes clases reservadas
                  </h3>
                  <p className='text-gray-500'>
                    ¡Pídele a tus padres que reserven clases para ti!
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {upcomingBookings.map(booking => (
                    <div
                      key={booking.id}
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
                            Clase con {booking.classes.instructor_name}
                          </h3>
                          <Badge
                            variant={
                              booking.classes.level === 'mixed'
                                ? 'outline'
                                : 'default'
                            }
                            className='text-xs'
                          >
                            {booking.classes.level === 'mixed'
                              ? 'MIXTO'
                              : booking.classes.level.toUpperCase()}
                          </Badge>
                          <Badge
                            variant='secondary'
                            className={`text-xs ${
                              booking.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {booking.status === 'confirmed' && '✓ Confirmada'}
                            {booking.status === 'pending' && '⏳ Pendiente'}
                            {booking.status === 'cancelled' && '✗ Cancelada'}
                          </Badge>
                        </div>

                        {/* Notes Section */}
                        {booking.classes.notes && (
                          <div className='flex items-start gap-2 mb-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200'>
                            <MessageSquare className='h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0' />
                            <p className='text-sm text-yellow-800 font-medium'>
                              {booking.classes.notes}
                            </p>
                          </div>
                        )}

                        <div className='flex items-center gap-4 text-sm text-gray-600'>
                          <div className='flex items-center gap-1'>
                            <Calendar className='w-3 h-3' />
                            {formatDate(booking.classes.date)}
                          </div>
                          <div className='flex items-center gap-1'>
                            <Clock className='w-3 h-3' />
                            {formatTime(booking.classes.start_time)} -{' '}
                            {formatTime(booking.classes.end_time)}
                          </div>
                          {/* Location Section - Only added this */}
                          {booking.classes.field && (
                            <div className='flex items-center gap-1'>
                              <MapPin className='w-3 h-3 text-green-600' />
                              <span>{booking.classes.field}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className='flex-shrink-0'>
                        <Button
                          size='sm'
                          className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                          onClick={() => {
                            setSelectedClass(booking)
                            setShowDetailsModal(true)
                          }}
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
              <Star className='h-6 w-6' />
              <span className='text-sm font-medium'>Progreso</span>
            </Button>

            <Button
              className='h-20 bg-white/90 hover:bg-white text-gray-700 hover:text-blue-600 border-0 shadow-lg flex-col gap-2'
              variant='outline'
            >
              <User className='h-6 w-6' />
              <span className='text-sm font-medium'>Mi Perfil</span>
            </Button>
          </div>
        </TabsContent>

        {/* Contenido Tab */}
        <TabsContent value='content' className='space-y-6'>
          <JuniorPostsSection />
        </TabsContent>

        {/* Ranking Tab */}
        <TabsContent value='ranking' className='space-y-6'>
          <RankingTable />
        </TabsContent>
      </Tabs>

      {/* Modal de detalles de clase */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Detalles de la Clase</DialogTitle>
            <DialogDescription>
              Información completa de tu reserva
            </DialogDescription>
          </DialogHeader>

          {selectedClass && (
            <div className='space-y-4'>
              {/* Información del instructor */}
              <div className='flex items-center space-x-3'>
                <Avatar className='h-12 w-12'>
                  <AvatarImage
                    src={`/avatars/${selectedClass.classes.instructor_name?.toLowerCase().replace(' ', '-')}.jpg`}
                    alt={selectedClass.classes.instructor_name}
                  />
                  <AvatarFallback className='bg-gradient-to-br from-purple-500 to-pink-500 text-white'>
                    {selectedClass.classes.instructor_name
                      ?.split(' ')
                      .map(n => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className='font-semibold text-lg'>
                    {selectedClass.classes.instructor_name}
                  </h3>
                  <p className='text-sm text-gray-600'>Instructor</p>
                </div>
              </div>

              {/* Notes Section in Modal */}
              {selectedClass.classes.notes && (
                <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3'>
                  <div className='flex items-center gap-2 mb-2'>
                    <MessageSquare className='h-4 w-4 text-yellow-600' />
                    <h4 className='font-semibold text-yellow-800'>
                      <div className='text-center'>Notas Importantes</div>
                    </h4>
                  </div>
                  <p className='text-sm text-yellow-700'>
                    {selectedClass.classes.notes}
                  </p>
                </div>
              )}

              {/* Información de la clase */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Calendar className='w-4 h-4 text-purple-500' />
                    <span className='text-sm font-medium'>Fecha</span>
                  </div>
                  <p className='text-sm text-gray-600'>
                    {new Date(selectedClass.classes.date).toLocaleDateString(
                      'es-ES',
                      {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </p>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Clock className='w-4 h-4 text-purple-500' />
                    <span className='text-sm font-medium'>Horario</span>
                  </div>
                  <p className='text-sm text-gray-600'>
                    {formatTime(selectedClass.classes.start_time)} -{' '}
                    {formatTime(selectedClass.classes.end_time)}
                  </p>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Target className='w-4 h-4 text-purple-500' />
                    <span className='text-sm font-medium'>Nivel</span>
                  </div>
                  <p className='text-sm text-gray-600'>
                    {selectedClass.classes.level}
                  </p>
                </div>

                {/* Location Section in Modal - Only added this */}
                {selectedClass.classes.field && (
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <MapPin className='w-4 h-4 text-green-500' />
                      <span className='text-sm font-medium'>Ubicación</span>
                    </div>
                    <p className='text-sm text-gray-600'>
                      {selectedClass.classes.field}
                    </p>
                  </div>
                )}

                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <BookOpen className='w-4 h-4 text-purple-500' />
                    <span className='text-sm font-medium'>Estado</span>
                  </div>
                  <Badge
                    variant={
                      selectedClass.status === 'confirmed'
                        ? 'default'
                        : 'secondary'
                    }
                    className='text-xs'
                  >
                    {selectedClass.status === 'confirmed'
                      ? 'Confirmada'
                      : 'Pendiente'}
                  </Badge>
                </div>
              </div>

              {/* Botón de acción */}
              <div className='pt-4'>
                <Button
                  className='w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  onClick={() => setShowDetailsModal(false)}
                >
                  Entendido
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
