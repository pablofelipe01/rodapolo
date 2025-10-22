import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, BookOpen, Info, ChevronDown, ChevronUp, MapPin, Trash2, Edit } from 'lucide-react'
import { Booking, ClassInfo } from './types'
import { useState } from 'react'

interface BookingsTabProps {
  bookings: Booking[]
  classes: ClassInfo[]
}

export function BookingsTab({ bookings, classes }: BookingsTabProps) {
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5)
  }

  const getClassInfo = (classId: string) => {
    return classes.find(classInfo => classInfo.id === classId)
  }

  const toggleExpand = (bookingId: string) => {
    setExpandedBookingId(expandedBookingId === bookingId ? null : bookingId)
  }

  // Separate bookings into upcoming and past
  const now = new Date()
  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.class_date)
    return bookingDate >= now
  }).sort((a, b) => new Date(a.class_date).getTime() - new Date(b.class_date).getTime()) // Ascending for upcoming

  const pastBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.class_date)
    return bookingDate < now
  }).sort((a, b) => new Date(b.class_date).getTime() - new Date(a.class_date).getTime()) // Descending for past

  const currentBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings

  // Commented out for now - might need these later
  /*
  const handleCancelBooking = (bookingId: string) => {
    // TODO: Implement cancel booking logic
    console.log('Cancel booking:', bookingId)
  }

  const handleRescheduleBooking = (bookingId: string) => {
    // TODO: Implement reschedule booking logic
    console.log('Reschedule booking:', bookingId)
  }
  */

  const handleViewDetails = (bookingId: string) => {
    // TODO: Implement view details logic
    console.log('View details:', bookingId)
  }

  const handleRateBooking = (bookingId: string) => {
    // TODO: Implement rating logic
    console.log('Rate booking:', bookingId)
  }

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const isExpanded = expandedBookingId === booking.id
    const classInfo = booking.class_id ? getClassInfo(booking.class_id) : null
    const hasNotes = classInfo?.notes && classInfo.notes.trim().length > 0
    const isUpcoming = activeTab === 'upcoming'

    return (
      <div className='border rounded-lg hover:bg-gray-50 transition-colors'>
        {/* Booking Header - Always Visible */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3'>
          <div className='flex items-start space-x-3 flex-1'>
            <div className='flex-shrink-0'>
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                  booking.status === 'confirmed'
                    ? 'bg-green-100'
                    : booking.status === 'cancelled'
                    ? 'bg-red-100'
                    : 'bg-gray-100'
                }`}
              >
                <BookOpen className={`h-5 w-5 sm:h-6 sm:w-6 ${
                  booking.status === 'confirmed'
                    ? 'text-green-600'
                    : booking.status === 'cancelled'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`} />
              </div>
            </div>
            <div className='flex-1 min-w-0'>
              <div className='flex flex-wrap items-center gap-2 mb-2'>
                <h3 className='text-base sm:text-lg font-medium text-gray-900 truncate'>
                  {booking.instructor_name}
                </h3>
                <div className='flex flex-wrap gap-1'>
                  <Badge
                    variant={
                      booking.status === 'confirmed'
                        ? 'default'
                        : booking.status === 'cancelled'
                        ? 'destructive'
                        : 'secondary'
                    }
                    className='text-xs'
                  >
                    {booking.status === 'confirmed'
                      ? 'CONFIRMADA'
                      : booking.status.toUpperCase()}
                  </Badge>
                  {hasNotes && (
                    <Badge variant='outline' className='text-xs bg-yellow-100 text-yellow-800 border-yellow-200'>
                      <Info className='h-3 w-3 mr-1' />
                      Notas
                    </Badge>
                  )}
                </div>
              </div>
              <div className='flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 text-sm text-gray-500'>
                <div className='flex items-center gap-1'>
                  <User className='w-3 h-3' />
                  <span className='text-xs'>{booking.junior_name}</span>
                </div>
                <div className='flex items-center gap-1'>
                  <Calendar className='w-3 h-3' />
                  <span className='text-xs'>{formatDate(booking.class_date)}</span>
                </div>
                <div className='flex items-center gap-1'>
                  <Clock className='w-3 h-3' />
                  <span className='text-xs'>
                    {formatTime(booking.start_time)} -{' '}
                    {formatTime(booking.end_time)}
                  </span>
                </div>
                {classInfo?.field && (
                  <div className='flex items-center gap-1'>
                    <MapPin className='w-3 h-3' />
                    <span className='text-xs'>{classInfo.field}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className='flex items-center gap-2 self-end sm:self-auto'>
            {/* Action Buttons */}
            <div className='flex gap-2'>
              {isUpcoming && booking.status === 'confirmed' && (
                <>
                  {/* Commented out for now - might need these later */}
                  {/*
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleRescheduleBooking(booking.id)}
                    className='text-xs'
                  >
                    <Edit className='h-3 w-3 mr-1' />
                    Reagendar
                  </Button>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => handleCancelBooking(booking.id)}
                    className='text-xs'
                  >
                    <Trash2 className='h-3 w-3 mr-1' />
                    Cancelar
                  </Button>
                  */}
                </>
              )}
              {!isUpcoming && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleRateBooking(booking.id)}
                  className='text-xs'
                >
                  Calificar
                </Button>
              )}
            </div>
            
            <Button
              variant='ghost'
              size='sm'
              onClick={() => toggleExpand(booking.id)}
              className='p-2 h-9 w-9'
            >
              {isExpanded ? (
                <ChevronUp className='h-4 w-4' />
              ) : (
                <ChevronDown className='h-4 w-4' />
              )}
            </Button>
          </div>
        </div>

        {/* Expandable Details */}
        {isExpanded && (
          <div className='px-4 pb-4 border-t pt-4 bg-white rounded-b-lg'>
            <div className='space-y-3'>
              {/* Notes Section */}
              {hasNotes && (
                <div>
                  <h4 className='font-medium text-sm text-gray-900 mb-1 flex items-center gap-1'>
                    <Info className='h-4 w-4 text-yellow-600' />
                    Notas del Instructor
                  </h4>
                  <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3'>
                    <p className='text-sm text-yellow-800 whitespace-pre-wrap'>
                      {classInfo!.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Booking Details */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                <div>
                  <h4 className='font-medium text-gray-900 mb-1'>Información de la Reserva</h4>
                  <div className='space-y-1 text-gray-600'>
                    <p><strong>Instructor:</strong> {booking.instructor_name}</p>
                    <p><strong>Alumno:</strong> {booking.junior_name}</p>
                    <p><strong>Estado:</strong> {booking.status === 'confirmed' ? 'Confirmada' : booking.status}</p>
                    {classInfo && (
                      <p><strong>Nivel:</strong> {classInfo.level.toUpperCase()}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className='font-medium text-gray-900 mb-1'>Fecha y Hora</h4>
                  <div className='space-y-1 text-gray-600'>
                    <p><strong>Fecha:</strong> {formatDate(booking.class_date)}</p>
                    <p><strong>Horario:</strong> {formatTime(booking.start_time)} - {formatTime(booking.end_time)}</p>
                    {classInfo?.field && (
                      <p><strong>Ubicación:</strong> {classInfo.field}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Actions */}
              <div className='flex justify-end pt-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleViewDetails(booking.id)}
                >
                  Ver Detalles Completos
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold'>Mis Reservas</h2>
      </div>

      <Card>
        <CardHeader>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div>
              <CardTitle>
                {activeTab === 'upcoming' ? 'Próximas Reservas' : 'Reservas Pasadas'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'upcoming' 
                  ? 'Tus reservas confirmadas y pendientes'
                  : 'Historial de tus reservas completadas'
                }
              </CardDescription>
            </div>
            
            {/* Improved Tab Navigation - Better for mobile */}
            <div className='w-full sm:w-auto'>
              <div className='flex space-x-1 bg-gray-100 p-1 rounded-lg w-full sm:w-auto'>
                <Button
                  variant={activeTab === 'upcoming' ? 'default' : 'ghost'}
                  size='sm'
                  onClick={() => setActiveTab('upcoming')}
                  className='flex-1 sm:flex-none text-xs px-3 py-2'
                >
                  <span className='sm:hidden'>Próximas</span>
                  <span className='hidden sm:inline'>Próximas</span>
                  <span className='ml-1'>({upcomingBookings.length})</span>
                </Button>
                <Button
                  variant={activeTab === 'past' ? 'default' : 'ghost'}
                  size='sm'
                  onClick={() => setActiveTab('past')}
                  className='flex-1 sm:flex-none text-xs px-3 py-2'
                >
                  <span className='sm:hidden'>Pasadas</span>
                  <span className='hidden sm:inline'>Pasadas</span>
                  <span className='ml-1'>({pastBookings.length})</span>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentBookings.length === 0 ? (
            <div className='text-center py-8'>
              <Calendar className='mx-auto h-12 w-12 text-gray-400' />
              <h3 className='mt-2 text-sm font-medium text-gray-900'>
                {activeTab === 'upcoming' 
                  ? 'No hay reservas próximas'
                  : 'No hay reservas pasadas'
                }
              </h3>
              <p className='mt-1 text-sm text-gray-500'>
                {activeTab === 'upcoming'
                  ? 'Tus próximas reservas aparecerán aquí.'
                  : 'Tu historial de reservas aparecerá aquí.'
                }
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {currentBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}