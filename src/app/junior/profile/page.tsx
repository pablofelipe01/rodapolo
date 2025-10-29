'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit,
  Shield,
  Target,
  Award,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { useJuniorAuth } from '@/providers/JuniorAuthProvider'
import { createClientSupabase } from '@/lib/supabase'

interface ParentProfile {
  email: string
  phone: string
  full_name: string
}

interface JuniorStats {
  totalClasses: number
  attendedClasses: number
  upcomingClasses: number
  currentHandicap: number
  attendanceRate: number
}

export default function ProfilePage() {
  const { juniorProfile } = useJuniorAuth()
  const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null)
  const [juniorStats, setJuniorStats] = useState<JuniorStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!juniorProfile?.id) {
        setLoading(false)
        return
      }

      try {
        const supabase = createClientSupabase()

        // Fetch parent data
        if (juniorProfile.parental_id) {
          const { data: parentData } = await supabase
            .from('profiles')
            .select('email, phone, full_name')
            .eq('id', juniorProfile.parental_id)
            .single()

          setParentProfile(parentData)
        }

        // Define the type for bookings
        interface Booking {
          status: string
          handicap: number | null
          class_date: string
          start_time: string
        }

        // Fetch junior statistics from simple_bookings_view
        const bookingsResult = await supabase
          .from('simple_bookings_view')
          .select('status, handicap, class_date, start_time')
          .eq('junior_id', juniorProfile.id)

        const bookings: Booking[] | null = bookingsResult.data
        const error = bookingsResult.error

        if (error) {
          console.error(
            'Error fetching bookings from simple_bookings_view:',
            error
          )
        } else {
          console.log('Fetched bookings:', bookings) // Debug log

          // Calculate statistics
          const totalClasses = bookings?.length || 0
          const attendedClasses =
            bookings?.filter(booking => booking.status === 'attended').length ||
            0

          const upcomingClasses =
            bookings?.filter(booking => {
              if (booking.status !== 'confirmed') return false
              const classDateTime = new Date(
                booking.class_date + 'T' + booking.start_time
              )
              return classDateTime > new Date()
            }).length || 0

          // Get current handicap (from the most recent booking with handicap)
          const recentBookingWithHandicap = bookings
            ?.filter(
              booking =>
                booking.handicap !== null && booking.handicap !== undefined
            )
            ?.sort(
              (a, b) =>
                new Date(b.class_date).getTime() -
                new Date(a.class_date).getTime()
            )[0]

          const currentHandicap =
            recentBookingWithHandicap?.handicap || juniorProfile?.handicap || 0
          const attendanceRate =
            totalClasses > 0
              ? Math.round((attendedClasses / totalClasses) * 100)
              : 0

          setJuniorStats({
            totalClasses,
            attendedClasses,
            upcomingClasses,
            currentHandicap,
            attendanceRate,
          })
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [juniorProfile])

  const getLevelColor = () => {
    return juniorProfile?.level === 'alpha' ? 'bg-yellow-400' : 'bg-blue-400'
  }

  const getLevelEmoji = () => {
    return juniorProfile?.level === 'alpha' ? '⭐' : '🌟'
  }

  const getAvatarFallback = () => {
    return juniorProfile?.full_name?.charAt(0)?.toUpperCase() || '👤'
  }

  const getAttendanceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-300'
    if (rate >= 60) return 'text-yellow-300'
    return 'text-red-300'
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-4 border-purple-400 border-t-transparent mx-auto mb-4'></div>
          <p className='text-white'>Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen'>
      {/* Header */}
      <div className='text-center mb-8'>
        <h1 className='text-4xl font-bold text-white mb-4'>Mi Perfil</h1>
        <p className='text-lg text-white/80'>
          Gestiona tu información personal y preferencias
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Column - Profile Card */}
        <div className='lg:col-span-1'>
          <Card className='bg-white/10 backdrop-blur-sm border-white/20 sticky top-24'>
            <CardContent className='pt-6'>
              <div className='text-center'>
                <Avatar className='h-24 w-24 mx-auto mb-4'>
                  <AvatarImage
                    src={juniorProfile?.avatar_url}
                    alt={juniorProfile?.full_name}
                  />
                  <AvatarFallback className='bg-gradient-to-r from-purple-400 to-pink-400 text-white text-2xl font-bold'>
                    {getAvatarFallback()}
                  </AvatarFallback>
                </Avatar>

                <h2 className='text-xl font-bold text-white'>
                  {juniorProfile?.nickname || juniorProfile?.full_name}
                </h2>
                <p className='text-white/80'>{juniorProfile?.full_name}</p>

                <Badge
                  className={`${getLevelColor()} text-white border-0 px-3 py-1 text-sm font-bold mt-2`}
                >
                  {getLevelEmoji()} {juniorProfile?.level?.toUpperCase()}
                </Badge>

                <div className='mt-4 space-y-2'>
                  <div className='flex items-center justify-center text-sm text-white/80'>
                    <span className='font-semibold'>Código:</span>
                    <span className='ml-2 font-mono'>
                      {juniorProfile?.unique_code}
                    </span>
                  </div>
                  <div className='flex items-center justify-center text-sm text-white/80'>
                    <span className='font-semibold'>Handicap:</span>
                    <span className='ml-2'>
                      ⛳{' '}
                      {juniorStats?.currentHandicap ||
                        juniorProfile?.handicap ||
                        0}
                    </span>
                  </div>
                </div>

                <Button className='w-full mt-6 bg-white/20 hover:bg-white/30 border-white/20'>
                  <Edit className='h-4 w-4 mr-2' />
                  Editar Perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Personal Information */}
          <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-white'>
                <User className='h-5 w-5' />
                Información Personal
              </CardTitle>
              <CardDescription className='text-white/70'>
                Tus datos de contacto e información básica
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex items-center space-x-3'>
                  <Mail className='h-4 w-4 text-white/60' />
                  <div>
                    <p className='text-sm font-medium text-white'>
                      Email del Padre/Madre
                    </p>
                    <p className='text-sm text-white/80'>
                      {parentProfile?.email || 'No disponible'}
                    </p>
                  </div>
                </div>

                <div className='flex items-center space-x-3'>
                  <Phone className='h-4 w-4 text-white/60' />
                  <div>
                    <p className='text-sm font-medium text-white'>
                      Teléfono del Padre/Madre
                    </p>
                    <p className='text-sm text-white/80'>
                      {parentProfile?.phone || 'No disponible'}
                    </p>
                  </div>
                </div>

                <div className='flex items-center space-x-3'>
                  <Calendar className='h-4 w-4 text-white/60' />
                  <div>
                    <p className='text-sm font-medium text-white'>
                      Fecha de Nacimiento
                    </p>
                    <p className='text-sm text-white/80'>
                      {juniorProfile?.birth_date
                        ? new Date(juniorProfile.birth_date).toLocaleDateString(
                            'es-ES'
                          )
                        : 'No especificada'}
                    </p>
                  </div>
                </div>

                <div className='flex items-center space-x-3'>
                  <Shield className='h-4 w-4 text-white/60' />
                  <div>
                    <p className='text-sm font-medium text-white'>
                      Padre/Madre
                    </p>
                    <p className='text-sm text-white/80'>
                      {parentProfile?.full_name || 'No disponible'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parent Information */}
          <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
            <CardHeader>
              <CardTitle className='text-white'>
                Información del Padre/Madre
              </CardTitle>
              <CardDescription className='text-white/70'>
                Datos de contacto de tu responsable
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex justify-between items-center p-4 bg-white/5 rounded-lg'>
                  <div className='flex items-center space-x-3'>
                    <User className='h-5 w-5 text-purple-400' />
                    <div>
                      <p className='font-medium text-white'>Nombre</p>
                      <p className='text-sm text-white/80'>
                        {parentProfile?.full_name || 'No disponible'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='flex justify-between items-center p-4 bg-white/5 rounded-lg'>
                  <div className='flex items-center space-x-3'>
                    <Mail className='h-5 w-5 text-blue-400' />
                    <div>
                      <p className='font-medium text-white'>Email</p>
                      <p className='text-sm text-white/80'>
                        {parentProfile?.email || 'No disponible'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='flex justify-between items-center p-4 bg-white/5 rounded-lg'>
                  <div className='flex items-center space-x-3'>
                    <Phone className='h-5 w-5 text-green-400' />
                    <div>
                      <p className='font-medium text-white'>Teléfono</p>
                      <p className='text-sm text-white/80'>
                        {parentProfile?.phone || 'No disponible'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real Statistics from simple_bookings_view */}
          <Card className='bg-white/10 backdrop-blur-sm border-white/20'>
            <CardHeader>
              <CardTitle className='text-white'>Estadísticas Reales</CardTitle>
              <CardDescription className='text-white/70'>
                Tu progreso basado en {juniorStats?.totalClasses || 0} clases
                registradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-center'>
                <div className='p-4 bg-white/10 rounded-lg'>
                  <div className='flex items-center justify-center mb-2'>
                    <Target className='h-6 w-6 text-purple-300' />
                  </div>
                  <p className='text-2xl font-bold text-purple-300'>
                    {juniorStats?.totalClasses || 0}
                  </p>
                  <p className='text-sm text-white/70'>Total Clases</p>
                </div>

                <div className='p-4 bg-white/10 rounded-lg'>
                  <div className='flex items-center justify-center mb-2'>
                    <Award className='h-6 w-6 text-green-300' />
                  </div>
                  <p className='text-2xl font-bold text-green-300'>
                    {juniorStats?.attendedClasses || 0}
                  </p>
                  <p className='text-sm text-white/70'>Asistencias</p>
                </div>

                <div className='p-4 bg-white/10 rounded-lg'>
                  <div className='flex items-center justify-center mb-2'>
                    <Clock className='h-6 w-6 text-blue-300' />
                  </div>
                  <p className='text-2xl font-bold text-blue-300'>
                    {juniorStats?.upcomingClasses || 0}
                  </p>
                  <p className='text-sm text-white/70'>Próximas</p>
                </div>

                <div className='p-4 bg-white/10 rounded-lg'>
                  <div className='flex items-center justify-center mb-2'>
                    <TrendingUp className='h-6 w-6 text-yellow-300' />
                  </div>
                  <p className='text-2xl font-bold text-yellow-300'>
                    {juniorStats?.currentHandicap ||
                      juniorProfile?.handicap ||
                      0}
                  </p>
                  <p className='text-sm text-white/70'>Handicap</p>
                </div>
              </div>

              {/* Attendance Rate */}
              {juniorStats && juniorStats.totalClasses > 0 && (
                <div className='mt-6 p-4 bg-white/5 rounded-lg'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium text-white'>
                        Tasa de Asistencia
                      </p>
                      <p className='text-sm text-white/70'>
                        {juniorStats.attendedClasses} de{' '}
                        {juniorStats.totalClasses} clases
                      </p>
                    </div>
                    <div className='text-right'>
                      <p
                        className={`text-2xl font-bold ${getAttendanceColor(juniorStats.attendanceRate)}`}
                      >
                        {juniorStats.attendanceRate}%
                      </p>
                      <p className='text-sm text-white/70'>Asistencia</p>
                    </div>
                  </div>
                  <div className='mt-2 w-full bg-white/20 rounded-full h-2'>
                    <div
                      className={`h-2 rounded-full ${
                        juniorStats.attendanceRate >= 80
                          ? 'bg-green-400'
                          : juniorStats.attendanceRate >= 60
                            ? 'bg-yellow-400'
                            : 'bg-red-400'
                      }`}
                      style={{ width: `${juniorStats.attendanceRate}%` }}
                    />
                  </div>
                </div>
              )}

              {(!juniorStats || juniorStats.totalClasses === 0) && (
                <div className='text-center py-8'>
                  <p className='text-white/70'>
                    Aún no tienes clases registradas
                  </p>
                  <p className='text-sm text-white/50 mt-2'>
                    Tus estadísticas aparecerán aquí cuando empieces a tomar
                    clases
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
