'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientSupabase } from '@/lib/supabase'
import type {
  Class as ClassBase,
  FlexibleClassInsert,
  FlexibleClassUpdate,
} from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  CalendarDays,
  CalendarCheck,
  CalendarRange,
  Clock,
  Users,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Eye,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

type UserProfile = {
  id: string
  role: 'admin' | 'parental' | 'junior'
}

type ClassRow = ClassBase & {
  current_bookings: number
}

type FormData = {
  date: string
  start_time: string
  end_time: string
  instructor_name: string
  capacity: number
  level: 'alpha' | 'beta' | 'mixed'
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed'
  field?: string | null
  notes?: string | null
}

type CalendarView = 'list' | 'day' | 'week' | 'month'

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassRow | null>(null)
  const [currentView, setCurrentView] = useState<CalendarView>('list')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'individual' | 'season'>(
    'individual'
  )
  const [seasonData, setSeasonData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    daysOfWeek: [] as number[], // 0 = Domingo, 1 = Lunes, etc.
    startTime: '',
    endTime: '',
    instructorName: '',
    capacity: 8,
    level: 'mixed' as 'alpha' | 'beta' | 'mixed',
    field: '',
    notes: '',
  })
  const [formData, setFormData] = useState<FormData>({
    date: '',
    start_time: '',
    end_time: '',
    instructor_name: '',
    capacity: 8,
    level: 'mixed',
    status: 'scheduled',
    field: null,
    notes: null,
  })

  const supabase = createClientSupabase()
  const router = useRouter()

  const getCurrentUserProfile = async (): Promise<UserProfile> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      if (!profile) throw new Error('Profile not found')
      return profile as UserProfile
    } catch (err) {
      console.error('Error getting user profile:', err)
      throw err
    }
  }

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error
      setClasses(data || [])
    } catch (err) {
      console.error('Error fetching classes:', err)
      setError('Error al cargar las clases')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null)
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  const formatDateForInput = (dateString: string) => {
    return dateString
  }

  const formatDateForDisplay = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const resetForm = () => {
    setFormData({
      date: '',
      start_time: '',
      end_time: '',
      instructor_name: '',
      capacity: 8,
      level: 'mixed',
      status: 'scheduled',
      field: null,
      notes: null,
    })
    setSeasonData({
      name: '',
      startDate: '',
      endDate: '',
      daysOfWeek: [],
      startTime: '',
      endTime: '',
      instructorName: '',
      capacity: 8,
      level: 'mixed',
      field: '',
      notes: '',
    })
    setEditingClass(null)
    setShowForm(false)
    setActiveTab('individual')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 handleSubmit iniciado')

    try {
      // Obtener perfil del usuario actual
      const userProfile = await getCurrentUserProfile()
      console.log('👤 Usuario actual:', userProfile)

      if (userProfile.role !== 'admin') {
        throw new Error('Solo los administradores pueden gestionar clases')
      }

      console.log('📝 Datos de formulario:', formData)

      if (editingClass) {
        console.log('✏️ Actualizando clase existente:', editingClass.id)

        // Para update, usamos solo los campos que cambiaron
        const updateData: FlexibleClassUpdate = {
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          instructor_name: formData.instructor_name,
          capacity: formData.capacity,
          level: formData.level,
          field: formData.field || null,
          notes: formData.notes || null,
        }

        const { data, error } = await supabase
          .from('classes')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .update(updateData as any)
          .eq('id', editingClass.id)
          .select()

        if (error) throw error
        console.log('✅ Clase actualizada:', data)
        setSuccess('Clase actualizada exitosamente')
      } else {
        console.log('➕ Creando nueva clase')
        const insertData: FlexibleClassInsert = {
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          instructor_name: formData.instructor_name,
          capacity: formData.capacity,
          level: formData.level,
          field: formData.field || null,
          notes: formData.notes || null,
          admin_id: userProfile.id,
          current_bookings: 0,
        }

        const { data, error } = await supabase
          .from('classes')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .insert([insertData as any])
          .select()

        if (error) throw error
        console.log('✅ Clase creada:', data)
        setSuccess('Clase creada exitosamente')
      }

      resetForm()
      fetchClasses()
    } catch (err) {
      console.error('Error saving class:', err)
      setError('Error al guardar la clase')
    }
  }

  // Función para generar clases recurrentes
  const generateRecurringClasses = async () => {
    try {
      setLoading(true)
      setError(null)

      // Validaciones básicas
      if (!seasonData.name || !seasonData.startDate || !seasonData.endDate) {
        throw new Error('Nombre, fecha de inicio y fecha de fin son requeridos')
      }

      if (seasonData.daysOfWeek.length === 0) {
        throw new Error('Selecciona al menos un día de la semana')
      }

      if (!seasonData.startTime || !seasonData.endTime) {
        throw new Error('Hora de inicio y fin son requeridas')
      }

      if (!seasonData.instructorName) {
        throw new Error('Nombre del instructor es requerido')
      }

      // Obtener perfil del usuario para admin_id
      const userProfile = await getCurrentUserProfile()

      // Generar todas las fechas en el rango que coincidan con los días seleccionados
      const startDate = new Date(seasonData.startDate)
      const endDate = new Date(seasonData.endDate)
      const classesToCreate: FlexibleClassInsert[] = []

      for (
        let currentDate = new Date(startDate);
        currentDate <= endDate;
        currentDate.setDate(currentDate.getDate() + 1)
      ) {
        const dayOfWeek = currentDate.getDay() // 0 = Domingo, 1 = Lunes, etc.

        if (seasonData.daysOfWeek.includes(dayOfWeek)) {
          const classData: FlexibleClassInsert = {
            date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD format
            start_time: seasonData.startTime,
            end_time: seasonData.endTime,
            instructor_name: seasonData.instructorName,
            capacity: seasonData.capacity,
            level: seasonData.level,
            field: seasonData.field || null,
            notes: seasonData.notes || null,
            admin_id: userProfile.id,
            current_bookings: 0,
          }
          classesToCreate.push(classData)
        }
      }

      if (classesToCreate.length === 0) {
        throw new Error(
          'No se generaron clases. Verifica el rango de fechas y días seleccionados.'
        )
      }

      console.log(
        `📅 Generando ${classesToCreate.length} clases para la temporada "${seasonData.name}"`
      )

      // Crear todas las clases en batch
      const { data, error } = await supabase
        .from('classes')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .insert(classesToCreate as any)
        .select()

      if (error) throw error

      console.log('✅ Temporada creada exitosamente:', data)
      setSuccess(
        `Temporada "${seasonData.name}" creada con ${classesToCreate.length} clases`
      )

      resetForm()
      fetchClasses()
    } catch (err) {
      console.error('Error creating season:', err)
      setError(
        err instanceof Error ? err.message : 'Error al crear la temporada'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (classItem: ClassRow) => {
    console.log('✏️ handleEdit llamado con:', classItem)
    setEditingClass(classItem)
    setFormData({
      date: formatDateForInput(classItem.date),
      start_time: classItem.start_time,
      end_time: classItem.end_time,
      instructor_name: classItem.instructor_name,
      capacity: classItem.capacity,
      level: classItem.level,
      status: classItem.status,
      field: classItem.field,
      notes: classItem.notes,
    })
    setShowForm(true)
    console.log('📝 Formulario configurado para edición')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta clase?')) return

    try {
      const { error } = await supabase.from('classes').delete().eq('id', id)

      if (error) throw error
      setSuccess('Clase eliminada exitosamente')
      fetchClasses()
    } catch (err) {
      console.error('Error deleting class:', err)
      setError('Error al eliminar la clase')
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: 'default',
      confirmed: 'secondary',
      cancelled: 'destructive',
      completed: 'outline',
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status === 'scheduled' && 'Programada'}
        {status === 'confirmed' && 'Confirmada'}
        {status === 'cancelled' && 'Cancelada'}
        {status === 'completed' && 'Completada'}
      </Badge>
    )
  }

  const getLevelBadge = (level: string) => {
    return (
      <Badge variant='outline'>
        {level === 'alpha' && 'Alpha'}
        {level === 'beta' && 'Beta'}
        {level === 'mixed' && 'Mixto'}
      </Badge>
    )
  }

  // Funciones auxiliares para las vistas del calendario
  const getClassesForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return classes.filter(cls => cls.date === dateString)
  }

  const getClassesForWeek = (date: Date) => {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay()) // Domingo como primer día

    const weekClasses = []
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek)
      currentDate.setDate(startOfWeek.getDate() + i)
      const dateString = currentDate.toISOString().split('T')[0]
      weekClasses.push({
        date: currentDate,
        classes: classes.filter(cls => cls.date === dateString),
      })
    }
    return weekClasses
  }

  const getClassesForMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    return classes.filter(cls => {
      const classDate = new Date(cls.date + 'T00:00:00')
      return classDate >= firstDay && classDate <= lastDay
    })
  }

  if (loading) return <div>Cargando clases...</div>

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Gestión de Clases
          </h1>
          <p className='text-muted-foreground'>
            Administra horarios, cupos y programación de clases
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Nueva Clase
        </Button>
      </div>

      {/* Barra de navegación de vistas */}
      <div className='flex gap-2 border-b'>
        <Button
          variant={currentView === 'list' ? 'default' : 'ghost'}
          onClick={() => setCurrentView('list')}
          className='rounded-b-none'
        >
          Lista
        </Button>
        <Button
          variant={currentView === 'day' ? 'default' : 'ghost'}
          onClick={() => setCurrentView('day')}
          className='rounded-b-none'
        >
          <CalendarDays className='mr-2 h-4 w-4' />
          Día
        </Button>
        <Button
          variant={currentView === 'week' ? 'default' : 'ghost'}
          onClick={() => setCurrentView('week')}
          className='rounded-b-none'
        >
          <CalendarCheck className='mr-2 h-4 w-4' />
          Semana
        </Button>
        <Button
          variant={currentView === 'month' ? 'default' : 'ghost'}
          onClick={() => setCurrentView('month')}
          className='rounded-b-none'
        >
          <CalendarRange className='mr-2 h-4 w-4' />
          Mes
        </Button>
      </div>

      {error && (
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className='h-4 w-4' />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Formulario con Pestañas */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === 'individual'
                ? editingClass
                  ? 'Editar Clase'
                  : 'Nueva Clase'
                : 'Nueva Temporada'}
            </CardTitle>
            <CardDescription>
              {activeTab === 'individual'
                ? 'Completa la información de la clase'
                : 'Configura una temporada para crear múltiples clases automáticamente'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={value =>
                setActiveTab(value as 'individual' | 'season')
              }
            >
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='individual'>Clase Individual</TabsTrigger>
                <TabsTrigger value='season'>Temporada</TabsTrigger>
              </TabsList>

              {/* Pestaña: Clase Individual */}
              <TabsContent value='individual'>
                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='date'>Fecha</Label>
                      <Input
                        id='date'
                        type='date'
                        value={formData.date}
                        onChange={e =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='instructor'>Instructor</Label>
                      <Input
                        id='instructor'
                        value={formData.instructor_name}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            instructor_name: e.target.value,
                          })
                        }
                        placeholder='Nombre del instructor'
                        required
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-3 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='start_time'>Hora de Inicio</Label>
                      <Input
                        id='start_time'
                        type='time'
                        value={formData.start_time}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            start_time: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='end_time'>Hora de Fin</Label>
                      <Input
                        id='end_time'
                        type='time'
                        value={formData.end_time}
                        onChange={e =>
                          setFormData({ ...formData, end_time: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='capacity'>Capacidad</Label>
                      <Input
                        id='capacity'
                        type='number'
                        min='1'
                        max='50'
                        value={formData.capacity}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            capacity: parseInt(e.target.value),
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-3 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='level'>Nivel</Label>
                      <Select
                        value={formData.level || 'mixed'}
                        onValueChange={value =>
                          setFormData({
                            ...formData,
                            level: value as 'alpha' | 'beta' | 'mixed',
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='alpha'>Alpha</SelectItem>
                          <SelectItem value='beta'>Beta</SelectItem>
                          <SelectItem value='mixed'>Mixto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='status'>Estado</Label>
                      <Select
                        value={formData.status || 'scheduled'}
                        onValueChange={value =>
                          setFormData({
                            ...formData,
                            status: value as
                              | 'scheduled'
                              | 'confirmed'
                              | 'cancelled'
                              | 'completed',
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='scheduled'>Programada</SelectItem>
                          <SelectItem value='confirmed'>Confirmada</SelectItem>
                          <SelectItem value='cancelled'>Cancelada</SelectItem>
                          <SelectItem value='completed'>Completada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='field'>Cancha</Label>
                      <Input
                        id='field'
                        value={formData.field || ''}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            field: e.target.value || null,
                          })
                        }
                        placeholder='Nombre de la cancha'
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='notes'>Notas</Label>
                    <Input
                      id='notes'
                      value={formData.notes || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          notes: e.target.value || null,
                        })
                      }
                      placeholder='Notas adicionales'
                    />
                  </div>

                  <div className='flex gap-2'>
                    <Button
                      type='button'
                      onClick={() => {
                        console.log('🖱️ Botón clickeado directamente!')
                        // Crear un evento sintético para handleSubmit
                        const syntheticEvent = {
                          preventDefault: () => {},
                        } as React.FormEvent
                        handleSubmit(syntheticEvent)
                      }}
                    >
                      {editingClass ? 'Actualizar' : 'Crear'} Clase
                    </Button>
                    <Button type='button' variant='outline' onClick={resetForm}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Pestaña: Temporada */}
              <TabsContent value='season'>
                <form className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='season-name'>Nombre de la Temporada</Label>
                    <Input
                      id='season-name'
                      value={seasonData.name}
                      onChange={e =>
                        setSeasonData({ ...seasonData, name: e.target.value })
                      }
                      placeholder='Ej: Clases Alpha - Septiembre 2025'
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='start-date'>Fecha de Inicio</Label>
                      <Input
                        id='start-date'
                        type='date'
                        value={seasonData.startDate}
                        onChange={e =>
                          setSeasonData({
                            ...seasonData,
                            startDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='end-date'>Fecha de Fin</Label>
                      <Input
                        id='end-date'
                        type='date'
                        value={seasonData.endDate}
                        onChange={e =>
                          setSeasonData({
                            ...seasonData,
                            endDate: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label>Días de la Semana</Label>
                    <div className='flex gap-2 flex-wrap'>
                      {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(
                        (day, index) => (
                          <Button
                            key={index}
                            type='button'
                            variant={
                              seasonData.daysOfWeek.includes(index)
                                ? 'default'
                                : 'outline'
                            }
                            className='w-16'
                            onClick={() => {
                              const newDays = seasonData.daysOfWeek.includes(
                                index
                              )
                                ? seasonData.daysOfWeek.filter(d => d !== index)
                                : [...seasonData.daysOfWeek, index]
                              setSeasonData({
                                ...seasonData,
                                daysOfWeek: newDays,
                              })
                            }}
                          >
                            {day}
                          </Button>
                        )
                      )}
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='season-start-time'>Hora de Inicio</Label>
                      <Input
                        id='season-start-time'
                        type='time'
                        value={seasonData.startTime}
                        onChange={e =>
                          setSeasonData({
                            ...seasonData,
                            startTime: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='season-end-time'>Hora de Fin</Label>
                      <Input
                        id='season-end-time'
                        type='time'
                        value={seasonData.endTime}
                        onChange={e =>
                          setSeasonData({
                            ...seasonData,
                            endTime: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='season-instructor'>Instructor</Label>
                      <Input
                        id='season-instructor'
                        value={seasonData.instructorName}
                        onChange={e =>
                          setSeasonData({
                            ...seasonData,
                            instructorName: e.target.value,
                          })
                        }
                        placeholder='Nombre del instructor'
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='season-capacity'>Capacidad</Label>
                      <Input
                        id='season-capacity'
                        type='number'
                        min='1'
                        max='20'
                        value={seasonData.capacity}
                        onChange={e =>
                          setSeasonData({
                            ...seasonData,
                            capacity: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='season-level'>Nivel</Label>
                      <Select
                        value={seasonData.level}
                        onValueChange={value =>
                          setSeasonData({
                            ...seasonData,
                            level: value as 'alpha' | 'beta' | 'mixed',
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='alpha'>Alpha</SelectItem>
                          <SelectItem value='beta'>Beta</SelectItem>
                          <SelectItem value='mixed'>Mixto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='season-field'>Campo</Label>
                      <Input
                        id='season-field'
                        value={seasonData.field}
                        onChange={e =>
                          setSeasonData({
                            ...seasonData,
                            field: e.target.value,
                          })
                        }
                        placeholder='Ej: Campo A'
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='season-notes'>Notas</Label>
                    <Input
                      id='season-notes'
                      value={seasonData.notes}
                      onChange={e =>
                        setSeasonData({ ...seasonData, notes: e.target.value })
                      }
                      placeholder='Notas adicionales'
                    />
                  </div>

                  <div className='flex gap-2'>
                    <Button
                      type='button'
                      disabled={loading}
                      onClick={generateRecurringClasses}
                    >
                      {loading ? 'Creando...' : 'Crear Temporada'}
                    </Button>
                    <Button type='button' variant='outline' onClick={resetForm}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Renderizado condicional basado en la vista */}
      {currentView === 'list' && (
        <div className='grid gap-4'>
          {classes.length === 0 ? (
            <Card>
              <CardContent className='pt-6'>
                <div className='text-center'>
                  <Calendar className='mx-auto h-12 w-12 text-gray-400' />
                  <h3 className='mt-2 text-sm font-medium text-gray-900'>
                    No hay clases programadas
                  </h3>
                  <p className='mt-1 text-sm text-gray-500'>
                    Comienza creando una nueva clase.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            classes.map(classItem => (
              <Card key={classItem.id}>
                <CardContent className='pt-6'>
                  <div className='flex items-center justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-4 mb-2'>
                        <div className='flex items-center gap-2'>
                          <Calendar className='h-4 w-4 text-gray-500' />
                          <span className='font-medium'>
                            {formatDateForDisplay(classItem.date)}
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Clock className='h-4 w-4 text-gray-500' />
                          <span>
                            {classItem.start_time} - {classItem.end_time}
                          </span>
                        </div>
                      </div>

                      <div className='flex items-center gap-4 mb-2'>
                        <div className='flex items-center gap-2'>
                          <Users className='h-4 w-4 text-gray-500' />
                          <span>
                            {classItem.current_bookings}/{classItem.capacity}{' '}
                            cupos
                          </span>
                        </div>
                        <span className='text-gray-600'>
                          Instructor: {classItem.instructor_name}
                        </span>
                        {classItem.field && (
                          <span className='text-gray-600'>
                            Cancha: {classItem.field}
                          </span>
                        )}
                      </div>

                      <div className='flex items-center gap-2'>
                        {getStatusBadge(classItem.status)}
                        {getLevelBadge(classItem.level)}
                      </div>

                      {classItem.notes && (
                        <p className='mt-2 text-sm text-gray-600'>
                          {classItem.notes}
                        </p>
                      )}
                    </div>

                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleEdit(classItem)}
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleDelete(classItem.id)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() =>
                          router.push(`/admin/classes/${classItem.id}`)
                        }
                        title='Ver detalles de la clase'
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Vista de Día */}
      {currentView === 'day' && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-semibold'>
              {formatDateForDisplay(selectedDate.toISOString().split('T')[0])}
            </h2>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setDate(selectedDate.getDate() - 1)
                  setSelectedDate(newDate)
                }}
              >
                ← Anterior
              </Button>
              <Button
                variant='outline'
                onClick={() => setSelectedDate(new Date())}
              >
                Hoy
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setDate(selectedDate.getDate() + 1)
                  setSelectedDate(newDate)
                }}
              >
                Siguiente →
              </Button>
            </div>
          </div>

          <div className='grid gap-2'>
            {getClassesForDate(selectedDate).length === 0 ? (
              <Card>
                <CardContent className='pt-6'>
                  <div className='text-center text-gray-500'>
                    No hay clases programadas para este día
                  </div>
                </CardContent>
              </Card>
            ) : (
              getClassesForDate(selectedDate).map(classItem => (
                <Card key={classItem.id} className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                      <div className='text-lg font-semibold'>
                        {classItem.start_time} - {classItem.end_time}
                      </div>
                      <div>{classItem.instructor_name}</div>
                      <div className='flex items-center gap-1'>
                        <Users className='h-4 w-4' />
                        {classItem.current_bookings}/{classItem.capacity}
                      </div>
                      {getLevelBadge(classItem.level)}
                      {getStatusBadge(classItem.status)}
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleEdit(classItem)}
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => handleDelete(classItem.id)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() =>
                          router.push(`/admin/classes/${classItem.id}`)
                        }
                        title='Ver detalles de la clase'
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Vista de Semana */}
      {currentView === 'week' && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-semibold'>
              Semana del{' '}
              {formatDateForDisplay(selectedDate.toISOString().split('T')[0])}
            </h2>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setDate(selectedDate.getDate() - 7)
                  setSelectedDate(newDate)
                }}
              >
                ← Semana anterior
              </Button>
              <Button
                variant='outline'
                onClick={() => setSelectedDate(new Date())}
              >
                Esta semana
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setDate(selectedDate.getDate() + 7)
                  setSelectedDate(newDate)
                }}
              >
                Semana siguiente →
              </Button>
            </div>
          </div>

          <div className='grid grid-cols-7 gap-2'>
            {getClassesForWeek(selectedDate).map((dayData, index) => (
              <Card key={index} className='min-h-32'>
                <CardHeader className='pb-2'>
                  <div className='text-sm font-medium text-center'>
                    {dayData.date.toLocaleDateString('es-ES', {
                      weekday: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </CardHeader>
                <CardContent className='pt-0'>
                  <div className='space-y-1'>
                    {dayData.classes.map(classItem => (
                      <div
                        key={classItem.id}
                        className='text-xs p-1 bg-blue-100 rounded cursor-pointer'
                        onClick={() => handleEdit(classItem)}
                      >
                        <div className='font-medium'>
                          {classItem.start_time}
                        </div>
                        <div className='truncate'>
                          {classItem.instructor_name}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Vista de Mes */}
      {currentView === 'month' && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-semibold'>
              {selectedDate.toLocaleDateString('es-ES', {
                month: 'long',
                year: 'numeric',
              })}
            </h2>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setMonth(selectedDate.getMonth() - 1)
                  setSelectedDate(newDate)
                }}
              >
                ← Mes anterior
              </Button>
              <Button
                variant='outline'
                onClick={() => setSelectedDate(new Date())}
              >
                Este mes
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setMonth(selectedDate.getMonth() + 1)
                  setSelectedDate(newDate)
                }}
              >
                Mes siguiente →
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className='pt-6'>
              <div className='text-center'>
                <Calendar className='mx-auto h-12 w-12 text-blue-500' />
                <h3 className='mt-2 text-lg font-medium'>Vista de Mes</h3>
                <p className='text-gray-600'>
                  {getClassesForMonth(selectedDate).length} clases programadas
                  este mes
                </p>
                <div className='mt-4 grid gap-2 max-h-96 overflow-y-auto'>
                  {getClassesForMonth(selectedDate).map(classItem => (
                    <div
                      key={classItem.id}
                      className='flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors'
                      onClick={() => handleEdit(classItem)}
                    >
                      <div className='flex items-center gap-3'>
                        <span className='font-medium text-sm'>
                          {formatDateForDisplay(classItem.date)}
                        </span>
                        <span className='text-lg font-semibold text-blue-600'>
                          {classItem.start_time}
                        </span>
                        <span className='text-gray-700'>
                          {classItem.instructor_name}
                        </span>
                        <div className='flex items-center gap-1 text-sm text-gray-500'>
                          <Users className='h-4 w-4' />
                          {classItem.current_bookings}/{classItem.capacity}
                        </div>
                        {getLevelBadge(classItem.level)}
                        {getStatusBadge(classItem.status)}
                      </div>
                      <div className='flex gap-1'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={e => {
                            e.stopPropagation()
                            handleEdit(classItem)
                          }}
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={e => {
                            e.stopPropagation()
                            handleDelete(classItem.id)
                          }}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={e => {
                            e.stopPropagation()
                            router.push(`/admin/classes/${classItem.id}`)
                          }}
                          title='Ver detalles de la clase'
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
