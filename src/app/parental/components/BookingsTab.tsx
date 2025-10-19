import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, BookOpen } from 'lucide-react'
import { Booking } from './types'

interface BookingsTabProps {
  bookings: Booking[]
}

export function BookingsTab({ bookings }: BookingsTabProps) {
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

  return (
    <div className='space-y-4'>
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
    </div>
  )
}