import type { ClassRow } from '../types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Calendar,
  Users,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface MonthViewProps {
  classes: ClassRow[]
  selectedDate: Date
  onDateChange: (date: Date) => void
  onEdit: (classItem: ClassRow) => void
  onDelete: (id: string) => void
  onViewDetails: (classItem: ClassRow) => void
}

export function MonthView({
  classes,
  selectedDate,
  onDateChange,
  onEdit,
  onDelete,
  onViewDetails,
}: MonthViewProps) {
  const formatDateForDisplay = (dateString: string) => {
    const [year, month, day] = dateString.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
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

  const monthClasses = getClassesForMonth(selectedDate)

  return (
    <div className='space-y-4'>
      {/* Header with Month Navigation */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
        <h2 className='text-lg sm:text-xl font-semibold text-center sm:text-left'>
          {selectedDate.toLocaleDateString('es-ES', {
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        <div className='flex items-center justify-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              const newDate = new Date(selectedDate)
              newDate.setMonth(selectedDate.getMonth() - 1)
              onDateChange(newDate)
            }}
            className='flex items-center gap-1 px-3'
          >
            <ChevronLeft className='h-4 w-4' />
            <span className='hidden sm:inline'>Mes anterior</span>
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onDateChange(new Date())}
            className='px-3'
          >
            Este mes
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              const newDate = new Date(selectedDate)
              newDate.setMonth(selectedDate.getMonth() + 1)
              onDateChange(newDate)
            }}
            className='flex items-center gap-1 px-3'
          >
            <span className='hidden sm:inline'>Siguiente</span>
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <div className='text-center'>
            <Calendar className='mx-auto h-12 w-12 text-blue-500' />
            <h3 className='mt-2 text-lg font-medium'>Vista de Mes</h3>
            <p className='text-gray-600'>
              {monthClasses.length} clase{monthClasses.length !== 1 ? 's' : ''}{' '}
              programada{monthClasses.length !== 1 ? 's' : ''} este mes
            </p>
            <div className='mt-4 space-y-2'>
              {monthClasses.map(classItem => (
                <div
                  key={classItem.id}
                  className='flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors gap-2'
                  onClick={() => onEdit(classItem)}
                >
                  <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1 min-w-0'>
                    <span className='font-medium text-sm text-gray-700 whitespace-nowrap'>
                      {formatDateForDisplay(classItem.date)}
                    </span>
                    <span className='text-base font-semibold text-blue-600 whitespace-nowrap'>
                      {classItem.start_time}
                    </span>
                    <span
                      className='text-gray-700 truncate min-w-0'
                      title={classItem.instructor_name}
                    >
                      {classItem.instructor_name}
                    </span>
                    <div className='flex items-center gap-1 text-sm text-gray-500 whitespace-nowrap'>
                      <Users className='h-4 w-4 flex-shrink-0' />
                      {classItem.current_bookings}/{classItem.capacity}
                    </div>
                  </div>
                  <div className='flex gap-1 justify-end sm:justify-start'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={e => {
                        e.stopPropagation()
                        onEdit(classItem)
                      }}
                      className='h-8 w-8 p-0'
                    >
                      <Edit className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={e => {
                        e.stopPropagation()
                        onDelete(classItem.id)
                      }}
                      className='h-8 w-8 p-0'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={e => {
                        e.stopPropagation()
                        onViewDetails(classItem)
                      }}
                      className='h-8 w-8 p-0'
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
  )
}
