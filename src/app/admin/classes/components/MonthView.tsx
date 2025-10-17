import type { ClassRow } from '../types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Users, Edit, Trash2, Eye } from 'lucide-react'

interface MonthViewProps {
  classes: ClassRow[]
  selectedDate: Date
  onDateChange: (date: Date) => void
  onEdit: (classItem: ClassRow) => void
  onDelete: (id: string) => void
  onViewDetails: (classItem: ClassRow) => void
}

export function MonthView({ classes, selectedDate, onDateChange, onEdit, onDelete, onViewDetails }: MonthViewProps) {
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
              onDateChange(newDate)
            }}
          >
            ← Mes anterior
          </Button>
          <Button
            variant='outline'
            onClick={() => onDateChange(new Date())}
          >
            Este mes
          </Button>
          <Button
            variant='outline'
            onClick={() => {
              const newDate = new Date(selectedDate)
              newDate.setMonth(selectedDate.getMonth() + 1)
              onDateChange(newDate)
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
              {monthClasses.length} clases programadas este mes
            </p>
            <div className='mt-4 grid gap-2 max-h-96 overflow-y-auto'>
              {monthClasses.map(classItem => (
                <div
                  key={classItem.id}
                  className='flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors'
                  onClick={() => onEdit(classItem)}
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
                  </div>
                  <div className='flex gap-1'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={e => {
                        e.stopPropagation()
                        onEdit(classItem)
                      }}
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
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={e => {
                        e.stopPropagation()
                        onViewDetails(classItem)
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
  )
}