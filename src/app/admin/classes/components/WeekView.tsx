import type { ClassRow } from '../types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

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
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>
          Semana del {formatDateForDisplay(selectedDate.toISOString().split('T')[0])}
        </h2>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={() => {
              const newDate = new Date(selectedDate)
              newDate.setDate(selectedDate.getDate() - 7)
              onDateChange(newDate)
            }}
          >
            ← Semana anterior
          </Button>
          <Button
            variant='outline'
            onClick={() => onDateChange(new Date())}
          >
            Esta semana
          </Button>
          <Button
            variant='outline'
            onClick={() => {
              const newDate = new Date(selectedDate)
              newDate.setDate(selectedDate.getDate() + 7)
              onDateChange(newDate)
            }}
          >
            Semana siguiente →
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-7 gap-2'>
        {weekClasses.map((dayData, index) => (
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
                    className='text-xs p-1 bg-blue-100 rounded cursor-pointer hover:bg-blue-200 transition-colors'
                    onClick={() => onEdit(classItem)}
                  >
                    <div className='font-medium'>{classItem.start_time}</div>
                    <div className='truncate'>{classItem.instructor_name}</div>
                    <div className='text-xs text-gray-600'>
                      {classItem.current_bookings}/{classItem.capacity}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}