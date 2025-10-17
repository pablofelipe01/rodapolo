import type { ClassRow } from '../types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ClassCard } from './ClassCard'

interface DayViewProps {
  classes: ClassRow[]
  selectedDate: Date
  onDateChange: (date: Date) => void
  onEdit: (classItem: ClassRow) => void
  onDelete: (id: string) => void
  onViewDetails: (classItem: ClassRow) => void
}

export function DayView({ classes, selectedDate, onDateChange, onEdit, onDelete, onViewDetails }: DayViewProps) {
  const formatDateForDisplay = (dateString: string) => {
    const [year, month, day] = dateString.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getClassesForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return classes.filter(cls => cls.date === dateString)
  }

  const dayClasses = getClassesForDate(selectedDate)

  return (
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
              onDateChange(newDate)
            }}
          >
            ← Anterior
          </Button>
          <Button
            variant='outline'
            onClick={() => onDateChange(new Date())}
          >
            Hoy
          </Button>
          <Button
            variant='outline'
            onClick={() => {
              const newDate = new Date(selectedDate)
              newDate.setDate(selectedDate.getDate() + 1)
              onDateChange(newDate)
            }}
          >
            Siguiente →
          </Button>
        </div>
      </div>

      <div className='grid gap-2'>
        {dayClasses.length === 0 ? (
          <Card>
            <CardContent className='pt-6'>
              <div className='text-center text-gray-500'>
                No hay clases programadas para este día
              </div>
            </CardContent>
          </Card>
        ) : (
          dayClasses.map(classItem => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewDetails={onViewDetails}
            />
          ))
        )}
      </div>
    </div>
  )
}