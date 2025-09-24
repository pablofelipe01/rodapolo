'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientSupabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Clock,
  Users,
  User,
  AlertCircle,
  ArrowLeft,
  MapPin,
  Download,
  Phone,
  MoreVertical,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'

interface ClassDetails {
  id: string
  date: string
  start_time: string
  end_time: string
  instructor_name: string
  level: string
  capacity: number
  field: string
  notes: string | null
}

interface JuniorProfile {
  id: string
  full_name: string
  nickname: string | null
  unique_code: string
  level: string
  handicap: number | null
}

interface ParentalProfile {
  id: string
  full_name: string
  phone: string
}

interface BookingData {
  id: string
  status: string
  booked_at: string
  cancelled_at: string | null
  cancellation_reason: string | null
  attended_at: string | null
  junior_profiles: JuniorProfile
  profiles: ParentalProfile
}

export default function ClassDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string
  const supabase = createClientSupabase()

  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null)
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null)

  const loadClassDetails = useCallback(async () => {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single()

    if (error) {
      toast.error('Error al cargar los detalles de la clase')
      return
    }

    setClassDetails(data)
  }, [classId, supabase])

  const loadBookings = useCallback(async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select(
        `
        id,
        status,
        booked_at,
        cancelled_at,
        cancellation_reason,
        attended_at,
        junior_profiles!inner (
          id,
          full_name,
          nickname,
          unique_code,
          level,
          handicap
        ),
        profiles!inner (
          id,
          full_name,
          phone
        )
      `
      )
      .eq('class_id', classId)
      .order('booked_at', { ascending: true })

    if (error) {
      toast.error('Error al cargar las reservas')
      return
    }

    setBookings(data || [])
  }, [classId, supabase])

  const loadPageData = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([loadClassDetails(), loadBookings()])
    } catch (error) {
      console.error('Error loading page data:', error)
    } finally {
      setLoading(false)
    }
  }, [loadClassDetails, loadBookings])

  useEffect(() => {
    if (classId) {
      loadPageData()
    }
  }, [classId, loadPageData])

  async function toggleAttendance(bookingId: string, attended: boolean) {
    const updateData: { attended_at: string | null; status: string } = attended
      ? {
          attended_at: new Date().toISOString(),
          status: 'attended',
        }
      : {
          attended_at: null,
          status: 'confirmed',
        }

    const { error } = await supabase
      .from('bookings')
      // @ts-expect-error - Temporary ignore for type inference issue
      .update(updateData)
      .eq('id', bookingId)

    if (error) {
      toast.error('Error al actualizar la asistencia')
      return
    }

    toast.success(attended ? 'Asistencia marcada' : 'Asistencia desmarcada')
    loadBookings()
  }

  async function handleCancelBooking() {
    if (!bookingToCancel) return

    const { error } = await supabase
      .from('bookings')
      // @ts-expect-error - Temporary ignore for type inference issue
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: 'Cancelado por administrador',
      })
      .eq('id', bookingToCancel)

    if (error) {
      toast.error('Error al cancelar la reserva')
      return
    }

    toast.success('Reserva cancelada exitosamente')
    setCancelDialogOpen(false)
    setBookingToCancel(null)
    loadBookings()
  }

  function exportToCSV() {
    if (!classDetails || bookings.length === 0) {
      toast.error('No hay datos para exportar')
      return
    }

    const headers = [
      'Junior',
      'Código',
      'Nivel',
      'Padre/Madre',
      'Teléfono',
      'Estado',
      'Asistió',
    ]

    const rows = bookings.map(booking => [
      booking.junior_profiles.full_name,
      booking.junior_profiles.unique_code,
      booking.junior_profiles.level,
      booking.profiles.full_name,
      booking.profiles.phone,
      booking.status,
      booking.attended_at ? 'Sí' : 'No',
    ])

    const csvContent = [
      `Clase: ${classDetails.instructor_name} - ${format(new Date(classDetails.date), 'dd/MM/yyyy', { locale: es })}`,
      '',
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `clase_${classDetails.id}_asistentes.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Archivo CSV descargado')
  }

  function getStatusBadge(status: string) {
    const statusConfig = {
      confirmed: {
        label: 'Confirmado',
        className: 'bg-green-100 text-green-800',
      },
      cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
      attended: { label: 'Asistió', className: 'bg-blue-100 text-blue-800' },
      pending: {
        label: 'Pendiente',
        className: 'bg-yellow-100 text-yellow-800',
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: 'bg-gray-100 text-gray-800',
    }

    return <Badge className={config.className}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary'></div>
      </div>
    )
  }

  if (!classDetails) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <AlertCircle className='h-16 w-16 text-muted-foreground mb-4' />
        <h2 className='text-xl font-semibold mb-2'>Clase no encontrada</h2>
        <p className='text-muted-foreground mb-4'>
          La clase que buscas no existe o ha sido eliminada
        </p>
        <Button onClick={() => router.push('/admin/classes')}>
          Volver a clases
        </Button>
      </div>
    )
  }

  const activeBookings = bookings.filter(b => b.status !== 'cancelled')
  const isFull = activeBookings.length >= classDetails.capacity

  return (
    <div className='container mx-auto py-6 px-4 max-w-7xl'>
      {/* Navigation */}
      <div className='mb-6'>
        <Button
          variant='ghost'
          onClick={() => router.push('/admin/classes')}
          className='gap-2'
        >
          <ArrowLeft className='h-4 w-4' />
          Volver a clases
        </Button>
      </div>

      {/* Class Info Card */}
      <Card className='mb-8'>
        <CardHeader>
          <div className='flex flex-col sm:flex-row justify-between items-start gap-4'>
            <div>
              <CardTitle className='text-2xl'>Detalles de la Clase</CardTitle>
              <CardDescription className='text-base mt-1'>
                {format(new Date(classDetails.date), "EEEE d 'de' MMMM, yyyy", {
                  locale: es,
                })}
              </CardDescription>
            </div>
            <Badge
              variant={isFull ? 'destructive' : 'default'}
              className='text-sm px-3 py-1'
            >
              {activeBookings.length}/{classDetails.capacity} inscritos
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6'>
            <div className='flex items-center gap-3'>
              <Clock className='h-5 w-5 text-muted-foreground' />
              <div>
                <p className='text-sm text-muted-foreground'>Horario</p>
                <p className='font-medium'>
                  {classDetails.start_time} - {classDetails.end_time}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <User className='h-5 w-5 text-muted-foreground' />
              <div>
                <p className='text-sm text-muted-foreground'>Instructor</p>
                <p className='font-medium'>{classDetails.instructor_name}</p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <MapPin className='h-5 w-5 text-muted-foreground' />
              <div>
                <p className='text-sm text-muted-foreground'>Ubicación</p>
                <p className='font-medium'>Campo {classDetails.field}</p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <Users className='h-5 w-5 text-muted-foreground' />
              <div>
                <p className='text-sm text-muted-foreground'>Nivel</p>
                <p className='font-medium'>{classDetails.level}</p>
              </div>
            </div>
          </div>
          {classDetails.notes && (
            <div className='mt-6 p-4 bg-muted rounded-lg'>
              <p className='text-sm font-medium mb-1'>Notas:</p>
              <p className='text-sm text-muted-foreground'>
                {classDetails.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendees List */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Lista de Asistentes</CardTitle>
          {bookings.length > 0 && (
            <Button
              onClick={exportToCSV}
              size='sm'
              variant='outline'
              className='gap-2'
            >
              <Download className='h-4 w-4' />
              Exportar CSV
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className='text-center py-12'>
              <Users className='h-12 w-12 mx-auto mb-4 text-muted-foreground' />
              <p className='text-lg font-medium mb-1'>No hay reservas</p>
              <p className='text-sm text-muted-foreground'>
                Aún no hay juniors inscritos en esta clase
              </p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Junior</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Padre/Madre</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className='text-center'>Asistencia</TableHead>
                    <TableHead className='w-[50px]'></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map(booking => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <p className='font-medium'>
                            {booking.junior_profiles.full_name}
                          </p>
                          <p className='text-sm text-muted-foreground'>
                            Código: {booking.junior_profiles.unique_code}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline'>
                          {booking.junior_profiles.level}
                        </Badge>
                      </TableCell>
                      <TableCell>{booking.profiles.full_name}</TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1 text-sm'>
                          <Phone className='h-3 w-3' />
                          {booking.profiles.phone}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell className='text-center'>
                        <Checkbox
                          checked={!!booking.attended_at}
                          onCheckedChange={checked =>
                            toggleAttendance(booking.id, checked as boolean)
                          }
                          disabled={booking.status === 'cancelled'}
                        />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='icon'>
                              <MoreVertical className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem
                              onClick={() => {
                                setBookingToCancel(booking.id)
                                setCancelDialogOpen(true)
                              }}
                              disabled={booking.status === 'cancelled'}
                              className='text-destructive'
                            >
                              Cancelar reserva
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar cancelación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas cancelar esta reserva? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              onClick={() => {
                setCancelDialogOpen(false)
                setBookingToCancel(null)
              }}
            >
              Mantener reserva
            </Button>
            <Button variant='destructive' onClick={handleCancelBooking}>
              Cancelar reserva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
