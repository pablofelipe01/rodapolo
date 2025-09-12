'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientSupabase } from '@/lib/supabase'
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
import {
  Plus,
  Calendar,
  Users,
  Clock,
  Edit,
  Trash2,
  CheckCircle,
} from 'lucide-react'
import type { Database } from '@/types/database'

// Definir tipos específicos para mayor claridad
type ClassRow = Database['public']['Tables']['classes']['Row']
type ClassInsert = Database['public']['Tables']['classes']['Insert']
// type ClassUpdate = Database['public']['Tables']['classes']['Update'] // Comentado temporalmente

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassRow | null>(null)

  const [formData, setFormData] = useState<ClassInsert>({
    date: '',
    start_time: '',
    end_time: '',
    instructor_name: '',
    capacity: 20,
    level: 'mixed',
    status: 'scheduled',
    field: null,
    notes: null,
  })

  const supabase = createClientSupabase()

  const fetchClasses = useCallback(async () => {
    try {
      console.log('🔍 Intentando obtener clases...')
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('date', { ascending: true })

      if (error) {
        console.error('❌ Error al obtener clases:', error)
        throw error
      }

      console.log('✅ Clases obtenidas:', data)
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

  const resetForm = () => {
    setFormData({
      date: '',
      start_time: '',
      end_time: '',
      instructor_name: '',
      capacity: 20,
      level: 'mixed',
      status: 'scheduled',
      field: null,
      notes: null,
    })
    setEditingClass(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (editingClass) {
        // Actualizar clase existente - TEMPORALMENTE COMENTADO PARA DEBUGGING
        /*
        const updateFields: ClassUpdate = {
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          instructor_name: formData.instructor_name,
          capacity: formData.capacity,
          level: formData.level || 'mixed',
          status: formData.status || 'scheduled',
          field: formData.field ?? null,
          notes: formData.notes ?? null,
        }

        const { error } = await supabase
          .from('classes')
          .update(updateFields)
          .eq('id', editingClass.id)

        if (error) throw error
        */
        setSuccess('Actualización temporalmente deshabilitada para debugging')
      } else {
        // Crear nueva clase - usando cliente sin tipos estrictos temporalmente
        const insertData = {
          date: formData.date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          instructor_name: formData.instructor_name,
          capacity: formData.capacity,
          current_bookings: formData.current_bookings || 0,
          level: formData.level || 'mixed',
          status: formData.status || 'scheduled',
          field: formData.field || null,
          notes: formData.notes || null,
          admin_id: null,
        }

        // Usar any temporalmente para evitar el problema de tipos never
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('classes')
          .insert([insertData])

        if (error) throw error
        setSuccess('Clase creada exitosamente')
      }

      resetForm()
      fetchClasses()
    } catch (err) {
      console.error('Error saving class:', err)
      setError('Error al guardar la clase')
    }
  }

  const handleEdit = (classItem: ClassRow) => {
    setEditingClass(classItem)
    setFormData({
      date: classItem.date,
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

      {/* Formulario */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingClass ? 'Editar Clase' : 'Nueva Clase'}
            </CardTitle>
            <CardDescription>
              Completa la información de la clase
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                      setFormData({ ...formData, start_time: e.target.value })
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
                <Button type='submit'>
                  {editingClass ? 'Actualizar' : 'Crear'} Clase
                </Button>
                <Button type='button' variant='outline' onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de clases */}
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
                          {new Date(classItem.date).toLocaleDateString(
                            'es-ES',
                            {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }
                          )}
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
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
