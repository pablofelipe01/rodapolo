import type { ClassRow } from '../types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Users, Edit, Trash2, Eye, MapPin } from 'lucide-react'

interface ClassCardProps {
  classItem: ClassRow
  onEdit: (classItem: ClassRow) => void
  onDelete: (id: string) => void
  onViewDetails: (classItem: ClassRow) => void
}

export function ClassCard({
  classItem,
  onEdit,
  onDelete,
  onViewDetails,
}: ClassCardProps) {
  const formatDateForDisplay = (dateString: string) => {
    const [year, month, day] = dateString.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
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

  const getCityBadge = (field: string | null) => {
    if (!field) return null

    const variants = {
      sotogrande: 'default',
      marbella: 'secondary',
    } as const

    return (
      <Badge variant={variants[field as keyof typeof variants] || 'default'}>
        <MapPin className='h-3 w-3 mr-1' />
        {field === 'sotogrande' && 'Sotogrande'}
        {field === 'marbella' && 'Marbella'}
      </Badge>
    )
  }

  return (
    <Card>
      <CardContent className='pt-6'>
        <div className='flex flex-col gap-4'>
          {/* Main Content */}
          <div className='flex items-start justify-between'>
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
                    {classItem.current_bookings}/{classItem.capacity} cupos
                  </span>
                </div>
                <span className='text-gray-600'>
                  Instructor: {classItem.instructor_name}
                </span>
                {classItem.field && (
                  <span className='text-gray-600'>
                    Ciudad:{' '}
                    {classItem.field === 'sotogrande'
                      ? 'Sotogrande'
                      : 'Marbella'}
                  </span>
                )}
              </div>

              <div className='flex items-center gap-2'>
                {getStatusBadge(classItem.status)}
                {getLevelBadge(classItem.level)}
                {getCityBadge(classItem.field)}
              </div>

              {/* Notes Section */}
              {classItem.notes && (
                <div className='mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                  <p className='text-sm text-yellow-800'>{classItem.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Now below everything */}
          <div className='flex justify-end gap-2 pt-3 border-t'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onEdit(classItem)}
              className='flex items-center gap-2'
            >
              <Edit className='h-4 w-4' />
              <span className='hidden sm:inline'>Editar</span>
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onDelete(classItem.id)}
              className='flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300'
            >
              <Trash2 className='h-4 w-4' />
              <span className='hidden sm:inline'>Eliminar</span>
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onViewDetails(classItem)}
              className='flex items-center gap-2'
            >
              <Eye className='h-4 w-4' />
              <span className='hidden sm:inline'>Ver</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
