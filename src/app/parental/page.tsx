'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { createClientSupabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  Baby,
  Calendar,
  Clock,
  User,
  Star,
  Plus,
  BookOpen,
  Trophy,
} from 'lucide-react'

type JuniorProfile = {
  id: string
  parental_id: string
  unique_code: string
  full_name: string
  nickname: string | null
  birth_date: string | null
  avatar_url: string | null
  handicap: number
  level: 'alpha' | 'beta'
  active: boolean
  created_at: string
  updated_at: string
}

type ClassInfo = {
  id: string
  date: string
  start_time: string
  end_time: string
  instructor_name: string
  capacity: number
  level: 'alpha' | 'beta' | 'mixed'
  field: string | null
  notes: string | null
  current_bookings: number
}

type Booking = {
  id: string
  status: 'confirmed' | 'cancelled' | 'attended' | 'no_show'
  class_date: string
  start_time: string
  end_time: string
  instructor_name: string
  junior_name: string
  junior_nickname: string | null
}

export default function ParentalDashboard() {
  const { user, profile } = useAuth()
  const [children, setChildren] = useState<JuniorProfile[]>([])
  const [upcomingClasses, setUpcomingClasses] = useState<ClassInfo[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null)
  const [selectedJuniors, setSelectedJuniors] = useState<string[]>([])
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [showAddChildModal, setShowAddChildModal] = useState(false)
  const [newChildForm, setNewChildForm] = useState({
    full_name: '',
    nickname: '',
    birth_date: '',
    level: 'alpha' as 'alpha' | 'beta',
  })

  const supabase = createClientSupabase()

  // Función para obtener los hijos del usuario parental
  const fetchChildren = useCallback(async () => {
    if (!profile?.id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('junior_profiles')
        .select('*')
        .eq('parental_id', profile.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      console.log('Children data:', data) // Debug
      console.log('Profile ID:', profile.id) // Debug
      setChildren(data || [])
    } catch (err) {
      console.error('Error fetching children:', err)
      setError('Error al cargar perfiles de hijos')
    } finally {
      setLoading(false)
    }
  }, [profile?.id, supabase])

  // Función para obtener clases próximas
  const fetchUpcomingClasses = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .gte('date', today)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(10)

      if (error) throw error
      setUpcomingClasses(data || [])
    } catch (err) {
      console.error('Error fetching classes:', err)
    }
  }, [supabase])

  // Función para obtener reservas del parental
  const fetchBookings = useCallback(async () => {
    if (!profile?.id) return

    try {
      const { data, error } = await supabase
        .from('simple_bookings_view')
        .select('*')
        .eq('parental_id', profile.id)
        .order('class_date', { ascending: true })

      if (error) throw error
      setBookings(data || [])
    } catch (err) {
      console.error('Error fetching bookings:', err)
    }
  }, [profile?.id, supabase])

  // Función para crear una reserva
  const createBooking = async (classId: string, juniorIds: string[]) => {
    if (!profile?.id || juniorIds.length === 0) return

    try {
      setBookingLoading(true)

      const successCount = []
      const errors = []

      console.log('🔍 Creando reservas para:', juniorIds.length, 'hijo(s)')

      // Crear una reserva para cada hijo seleccionado
      for (const juniorId of juniorIds) {
        try {
          console.log('🔍 Creando reserva con parámetros:', {
            p_junior_id: juniorId,
            p_class_id: classId,
          })

          const { data, error } = await supabase.rpc(
            'create_reservation_final',
            {
              p_junior_id: juniorId,
              p_class_id: classId,
            }
          )

          console.log('🔍 Respuesta de create_reservation_final:', {
            data,
            error,
          })

          // Revisar si la función devolvió un error dentro de data
          if (data && data.success === false) {
            console.error('🚨 Error dentro de data:', data.error)
            console.error('🔍 Debug info:', data.debug)
            console.error('🔍 Parental ID:', data.parental_id)
            console.error('🔍 Full data object:', JSON.stringify(data, null, 2))
            errors.push(`Error para ${juniorId}: ${data.error}`)
            continue
          }

          if (error) {
            console.error('🚨 Error en create_reservation_final:', error)
            errors.push(`Error para ${juniorId}: ${error.message}`)
            continue
          }

          console.log('✅ Booking creado exitosamente para junior:', juniorId)
          successCount.push(juniorId)
        } catch (err: unknown) {
          console.error('🚨 Error creating booking para junior:', juniorId, err)
          const errorMessage =
            err instanceof Error ? err.message : 'Error desconocido'
          errors.push(`Error para ${juniorId}: ${errorMessage}`)
        }
      }

      // Refrescar datos
      await Promise.all([fetchBookings(), fetchUpcomingClasses()])

      setError(null)
      setShowBookingModal(false)
      setSelectedClass(null)
      setSelectedJuniors([])

      // Mostrar mensaje basado en los resultados
      if (successCount.length === juniorIds.length) {
        alert(`¡${successCount.length} reserva(s) creada(s) exitosamente!`)
      } else if (successCount.length > 0) {
        alert(
          `${successCount.length} de ${juniorIds.length} reservas creadas exitosamente. Algunos errores ocurrieron.`
        )
        if (errors.length > 0) {
          console.error('🚨 Errores en algunas reservas:', errors)
        }
      } else {
        throw new Error(
          'No se pudo crear ninguna reserva: ' + errors.join(', ')
        )
      }
    } catch (err: unknown) {
      console.error('🚨 Error creating bookings:', err)
      console.error('🚨 Error type:', typeof err)
      console.error('🚨 Error constructor:', err?.constructor?.name)

      if (err && typeof err === 'object') {
        console.error('🚨 Error keys:', Object.keys(err))
        console.error('🚨 Error JSON:', JSON.stringify(err, null, 2))
      }

      const errorMessage =
        err instanceof Error ? err.message : 'Error al crear las reservas'
      setError(errorMessage)
    } finally {
      setBookingLoading(false)
    }
  }

  // Función para abrir modal de reserva
  const openBookingModal = (classInfo: ClassInfo) => {
    setSelectedClass(classInfo)
    setSelectedJuniors([])
    setShowBookingModal(true)
  }

  // Función para confirmar reserva
  const handleConfirmBooking = async () => {
    if (!selectedClass || selectedJuniors.length === 0) return
    await createBooking(selectedClass.id, selectedJuniors)
  }

  // Función para manejar selección múltiple de hijos
  const toggleJuniorSelection = (juniorId: string) => {
    setSelectedJuniors(prev => {
      if (prev.includes(juniorId)) {
        return prev.filter(id => id !== juniorId)
      } else {
        return [...prev, juniorId]
      }
    })
  }

  // Función para crear un nuevo hijo
  const createChild = async () => {
    if (!profile?.id || !newChildForm.full_name) return

    try {
      setLoading(true)

      // Generar código único de 7 caracteres
      const randomCode = Math.random()
        .toString(36)
        .substring(2, 9)
        .toUpperCase()
      const uniqueCode = randomCode.padEnd(7, '0') // Asegurar que tenga exactamente 7 caracteres

      const { error } = await supabase
        .from('junior_profiles')
        .insert({
          parental_id: profile.id,
          unique_code: uniqueCode,
          full_name: newChildForm.full_name,
          nickname: newChildForm.nickname || null,
          birth_date: newChildForm.birth_date || null,
          level: newChildForm.level,
          active: true,
        })
        .select()
        .single()

      if (error) throw error

      // Actualizar lista de hijos
      await fetchChildren()

      // Limpiar formulario y cerrar modal
      setNewChildForm({
        full_name: '',
        nickname: '',
        birth_date: '',
        level: 'alpha',
      })
      setShowAddChildModal(false)

      alert('¡Hijo agregado exitosamente!')
    } catch (err) {
      console.error('Error creating child:', err)
      setError('Error al crear el perfil del hijo')
    } finally {
      setLoading(false)
    }
  }

  // Función para abrir modal de agregar hijo
  const openAddChildModal = () => {
    setShowAddChildModal(true)
  }

  useEffect(() => {
    if (profile?.role === 'parental') {
      fetchChildren()
      fetchUpcomingClasses()
      fetchBookings()
    }
  }, [profile, fetchChildren, fetchUpcomingClasses, fetchBookings])

  // Función para obtener estadísticas
  const getStats = () => {
    const totalChildren = children.length
    const activeChildren = children.filter(child => child.active).length
    const alphaChildren = children.filter(
      child => child.level === 'alpha'
    ).length
    const betaChildren = children.filter(child => child.level === 'beta').length

    return {
      totalChildren,
      activeChildren,
      alphaChildren,
      betaChildren,
    }
  }

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Función para formatear hora
  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5) // HH:MM
  }

  // Verificar acceso
  if (!user) {
    return (
      <div className='text-center py-12'>
        <Alert className='max-w-md mx-auto'>
          <AlertDescription>
            Debes iniciar sesión para acceder al dashboard parental.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (profile?.role !== 'parental') {
    return (
      <div className='text-center py-12'>
        <Alert className='max-w-md mx-auto border-orange-200 bg-orange-50'>
          <AlertDescription className='text-orange-800'>
            Esta área es solo para usuarios parentales.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const stats = getStats()

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            ¡Hola, {profile.full_name}!
          </h1>
          <p className='text-gray-600'>
            Bienvenido al portal de familias de Rodapolo
          </p>
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <Alert className='border-red-200 bg-red-50'>
          <AlertDescription className='text-red-800'>{error}</AlertDescription>
        </Alert>
      )}

      {/* Estadísticas */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center'>
              <div className='rounded-full bg-blue-500 p-3'>
                <Baby className='h-6 w-6 text-white' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Mis Hijos</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {stats.totalChildren}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center'>
              <div className='rounded-full bg-green-500 p-3'>
                <Users className='h-6 w-6 text-white' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Activos</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {stats.activeChildren}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center'>
              <div className='rounded-full bg-purple-500 p-3'>
                <Star className='h-6 w-6 text-white' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Nivel Alpha</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {stats.alphaChildren}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center'>
              <div className='rounded-full bg-orange-500 p-3'>
                <Trophy className='h-6 w-6 text-white' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Nivel Beta</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {stats.betaChildren}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para contenido */}
      <Tabs defaultValue='children' className='w-full'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='children'>Mis Hijos</TabsTrigger>
          <TabsTrigger value='classes'>Clases Disponibles</TabsTrigger>
          <TabsTrigger value='bookings'>Mis Reservas</TabsTrigger>
        </TabsList>

        {/* Tab de Hijos */}
        <TabsContent value='children' className='space-y-4'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold'>Perfiles de Mis Hijos</h2>
            <Button onClick={openAddChildModal}>
              <Plus className='mr-2 h-4 w-4' />
              Agregar Hijo
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Hijos</CardTitle>
              <CardDescription>
                Administra los perfiles de tus hijos registrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='text-center py-8'>
                  <div className='text-sm text-gray-500'>
                    Cargando perfiles...
                  </div>
                </div>
              ) : children.length === 0 ? (
                <div className='text-center py-8'>
                  <Baby className='mx-auto h-12 w-12 text-gray-400' />
                  <h3 className='mt-2 text-sm font-medium text-gray-900'>
                    No hay hijos registrados
                  </h3>
                  <p className='mt-1 text-sm text-gray-500'>
                    Contacta al administrador para registrar a tus hijos.
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {children.map(child => (
                    <div
                      key={child.id}
                      className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50'
                    >
                      <div className='flex items-center space-x-4'>
                        <div className='flex-shrink-0'>
                          <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
                            <span className='text-lg font-medium text-blue-600'>
                              {child.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className='flex items-center gap-2'>
                            <h3 className='text-lg font-medium text-gray-900'>
                              {child.full_name}
                            </h3>
                            {child.nickname && (
                              <span className='text-sm text-gray-500'>
                                &ldquo;{child.nickname}&rdquo;
                              </span>
                            )}
                            <Badge
                              variant={
                                child.level === 'alpha'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {child.level.toUpperCase()}
                            </Badge>
                            <Badge
                              variant={child.active ? 'default' : 'destructive'}
                            >
                              {child.active ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </div>
                          <div className='flex items-center gap-4 mt-1 text-sm text-gray-500'>
                            <div className='flex items-center gap-1'>
                              <User className='w-3 h-3' />
                              Código: {child.unique_code}
                            </div>
                            <div className='flex items-center gap-1'>
                              <Star className='w-3 h-3' />
                              Handicap: {child.handicap}
                            </div>
                            {child.birth_date && (
                              <div className='flex items-center gap-1'>
                                <Calendar className='w-3 h-3' />
                                {new Date(
                                  child.birth_date
                                ).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Clases */}
        <TabsContent value='classes' className='space-y-4'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold'>Clases Disponibles</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Próximas Clases</CardTitle>
              <CardDescription>
                Clases disponibles para reservar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingClasses.length === 0 ? (
                <div className='text-center py-8'>
                  <BookOpen className='mx-auto h-12 w-12 text-gray-400' />
                  <h3 className='mt-2 text-sm font-medium text-gray-900'>
                    No hay clases programadas
                  </h3>
                  <p className='mt-1 text-sm text-gray-500'>
                    Las clases aparecerán aquí cuando estén disponibles.
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {upcomingClasses.map(classInfo => (
                    <div
                      key={classInfo.id}
                      className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50'
                    >
                      <div className='flex items-center space-x-4'>
                        <div className='flex-shrink-0'>
                          <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center'>
                            <BookOpen className='h-6 w-6 text-green-600' />
                          </div>
                        </div>
                        <div>
                          <div className='flex items-center gap-2'>
                            <h3 className='text-lg font-medium text-gray-900'>
                              {classInfo.instructor_name}
                            </h3>
                            <Badge
                              variant={
                                classInfo.level === 'mixed'
                                  ? 'outline'
                                  : classInfo.level === 'alpha'
                                    ? 'default'
                                    : 'secondary'
                              }
                            >
                              {classInfo.level === 'mixed'
                                ? 'MIXTO'
                                : classInfo.level.toUpperCase()}
                            </Badge>
                          </div>
                          <div className='flex items-center gap-4 mt-1 text-sm text-gray-500'>
                            <div className='flex items-center gap-1'>
                              <Calendar className='w-3 h-3' />
                              {formatDate(classInfo.date)}
                            </div>
                            <div className='flex items-center gap-1'>
                              <Clock className='w-3 h-3' />
                              {formatTime(classInfo.start_time)} -{' '}
                              {formatTime(classInfo.end_time)}
                            </div>
                            <div className='flex items-center gap-1'>
                              <Users className='w-3 h-3' />
                              {classInfo.current_bookings || 0}/
                              {classInfo.capacity}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => openBookingModal(classInfo)}
                          disabled={children.length === 0}
                        >
                          Reservar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Reservas */}
        <TabsContent value='bookings' className='space-y-4'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold'>Mis Reservas</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reservas Activas</CardTitle>
              <CardDescription>
                Historial y estado de tus reservas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className='text-center py-8'>
                  <Calendar className='mx-auto h-12 w-12 text-gray-400' />
                  <h3 className='mt-2 text-sm font-medium text-gray-900'>
                    No hay reservas activas
                  </h3>
                  <p className='mt-1 text-sm text-gray-500'>
                    Tus reservas aparecerán aquí una vez que reserves clases.
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {bookings.map(booking => (
                    <div
                      key={booking.id}
                      className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50'
                    >
                      <div className='flex items-center space-x-4'>
                        <div className='flex-shrink-0'>
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              booking.status === 'confirmed'
                                ? 'bg-green-100'
                                : 'bg-gray-100'
                            }`}
                          >
                            <BookOpen className='h-6 w-6 text-green-600' />
                          </div>
                        </div>
                        <div>
                          <div className='flex items-center gap-2'>
                            <h3 className='text-lg font-medium text-gray-900'>
                              {booking.instructor_name}
                            </h3>
                            <Badge
                              variant={
                                booking.status === 'confirmed'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {booking.status === 'confirmed'
                                ? 'CONFIRMADA'
                                : booking.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className='flex items-center gap-4 mt-1 text-sm text-gray-500'>
                            <div className='flex items-center gap-1'>
                              <User className='w-3 h-3' />
                              {booking.junior_name}
                            </div>
                            <div className='flex items-center gap-1'>
                              <Calendar className='w-3 h-3' />
                              {formatDate(booking.class_date)}
                            </div>
                            <div className='flex items-center gap-1'>
                              <Clock className='w-3 h-3' />
                              {formatTime(booking.start_time)} -{' '}
                              {formatTime(booking.end_time)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Reserva */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reservar Clase</DialogTitle>
            <DialogDescription>
              Selecciona para cuál(es) de tus hijos quieres reservar esta clase
            </DialogDescription>
          </DialogHeader>

          {selectedClass && (
            <div className='space-y-4'>
              <div className='p-4 bg-gray-50 rounded-lg'>
                <h3 className='font-medium'>{selectedClass.instructor_name}</h3>
                <div className='flex items-center gap-4 mt-2 text-sm text-gray-600'>
                  <span>{formatDate(selectedClass.date)}</span>
                  <span>
                    {formatTime(selectedClass.start_time)} -{' '}
                    {formatTime(selectedClass.end_time)}
                  </span>
                  <Badge
                    variant={
                      selectedClass.level === 'mixed' ? 'outline' : 'default'
                    }
                  >
                    {selectedClass.level === 'mixed'
                      ? 'MIXTO'
                      : selectedClass.level.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className='space-y-3'>
                <label className='text-sm font-medium'>
                  Seleccionar hijo(s):
                </label>
                <div className='space-y-3 max-h-48 overflow-y-auto'>
                  {children
                    .filter(
                      child =>
                        child.active &&
                        (selectedClass.level === 'mixed' ||
                          child.level === selectedClass.level)
                    )
                    .map(child => (
                      <div
                        key={child.id}
                        className='flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50'
                      >
                        <Checkbox
                          id={`junior-${child.id}`}
                          checked={selectedJuniors.includes(child.id)}
                          onCheckedChange={() =>
                            toggleJuniorSelection(child.id)
                          }
                        />
                        <label
                          htmlFor={`junior-${child.id}`}
                          className='flex items-center gap-2 cursor-pointer flex-1'
                        >
                          <span>{child.full_name}</span>
                          <Badge variant='outline'>
                            {child.level.toUpperCase()}
                          </Badge>
                        </label>
                      </div>
                    ))}
                </div>
                {children.filter(
                  child =>
                    child.active &&
                    (selectedClass.level === 'mixed' ||
                      child.level === selectedClass.level)
                ).length === 0 && (
                  <p className='text-sm text-gray-500 italic'>
                    No tienes hijos disponibles para esta clase.
                  </p>
                )}
              </div>

              <div className='flex justify-end gap-2 pt-4'>
                <Button
                  variant='outline'
                  onClick={() => setShowBookingModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmBooking}
                  disabled={selectedJuniors.length === 0 || bookingLoading}
                >
                  {bookingLoading
                    ? 'Reservando...'
                    : selectedJuniors.length === 1
                      ? 'Confirmar Reserva'
                      : `Confirmar ${selectedJuniors.length} Reservas`}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para agregar hijo */}
      <Dialog open={showAddChildModal} onOpenChange={setShowAddChildModal}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Hijo</DialogTitle>
            <DialogDescription>
              Completa la información para registrar un nuevo hijo
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='full_name'>Nombre completo *</Label>
              <Input
                id='full_name'
                placeholder='Nombre completo del hijo/a'
                value={newChildForm.full_name}
                onChange={e =>
                  setNewChildForm(prev => ({
                    ...prev,
                    full_name: e.target.value,
                  }))
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='nickname'>Apodo (opcional)</Label>
              <Input
                id='nickname'
                placeholder='Apodo o diminutivo'
                value={newChildForm.nickname}
                onChange={e =>
                  setNewChildForm(prev => ({
                    ...prev,
                    nickname: e.target.value,
                  }))
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='birth_date'>Fecha de nacimiento (opcional)</Label>
              <Input
                id='birth_date'
                type='date'
                value={newChildForm.birth_date}
                onChange={e =>
                  setNewChildForm(prev => ({
                    ...prev,
                    birth_date: e.target.value,
                  }))
                }
              />
            </div>

            <div className='space-y-2'>
              <Label>Nivel inicial</Label>
              <Select
                value={newChildForm.level}
                onValueChange={value =>
                  setNewChildForm(prev => ({
                    ...prev,
                    level: value as 'alpha' | 'beta',
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='alpha'>Alpha (Principiante)</SelectItem>
                  <SelectItem value='beta'>Beta (Intermedio)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='flex justify-end gap-2 pt-4'>
              <Button
                variant='outline'
                onClick={() => setShowAddChildModal(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={createChild}
                disabled={!newChildForm.full_name || loading}
              >
                {loading ? 'Creando...' : 'Crear Hijo'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
