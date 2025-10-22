import type { ClassRow } from '../types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface WeekViewProps {
  classes: ClassRow[]
  selectedDate: Date
  onDateChange: (date: Date) => void
  onEdit: (classItem: ClassRow) => void
  onDelete: (id: string) => void
  onViewDetails: (classItem: ClassRow) => void
}

export function WeekView({ classes, selectedDate, onDateChange, onEdit, onDelete, onViewDetails }: WeekViewProps) {
  const formatDateForDisplay = (dateString: string) => {
    const [year, month, day] = dateString.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
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

  const weekClasses = getClassesForWeek(selectedDate)

  return (
    <div className='space-y-4'>
      {/* Header with Week Navigation */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
        <h2 className='text-lg sm:text-xl font-semibold text-center sm:text-left'>
          Semana del {formatDateForDisplay(selectedDate.toISOString().split('T')[0])}
        </h2>
        <div className='flex items-center justify-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              const newDate = new Date(selectedDate)
              newDate.setDate(selectedDate.getDate() - 7)
              onDateChange(newDate)
            }}
            className='flex items-center gap-1 px-3'
          >
            <ChevronLeft className='h-4 w-4' />
            <span className='hidden sm:inline'>Semana anterior</span>
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onDateChange(new Date())}
            className='px-3'
          >
            Esta semana
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              const newDate = new Date(selectedDate)
              newDate.setDate(selectedDate.getDate() + 7)
              onDateChange(newDate)
            }}
            className='flex items-center gap-1 px-3'
          >
            <span className='hidden sm:inline'>Siguiente</span>
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Week Grid */}
      <div className='grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3'>
        {weekClasses.map((dayData, index) => (
          <Card key={index} className='min-h-32'>
            <CardHeader className='pb-2 px-3 sm:px-4'>
              <div className='text-sm font-medium text-center'>
                {dayData.date.toLocaleDateString('es-ES', {
                  weekday: 'short',
                  day: 'numeric',
                })}
              </div>
            </CardHeader>
            <CardContent className='pt-0 px-3 sm:px-4'>
              <div className='space-y-1.5'>
                {dayData.classes.map(classItem => (
                  <div
                    key={classItem.id}
                    className='text-xs p-2 bg-blue-100 rounded cursor-pointer hover:bg-blue-200 transition-colors'
                    onClick={() => onEdit(classItem)}
                  >
                    <div className='font-medium truncate'>{classItem.start_time}</div>
                    <div className='truncate' title={classItem.instructor_name}>
                      {classItem.instructor_name}
                    </div>
                    <div className='text-xs text-gray-600'>
                      {classItem.current_bookings}/{classItem.capacity}
                    </div>
                  </div>
                ))}
                {dayData.classes.length === 0 && (
                  <div className='text-xs text-gray-400 text-center py-2'>
                    Sin clases
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}