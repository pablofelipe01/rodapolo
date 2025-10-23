import type { ClassRow } from '../types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ClassCard } from './ClassCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DayViewProps {
  classes: ClassRow[]
  selectedDate: Date
  onDateChange: (date: Date) => void
  onEdit: (classItem: ClassRow) => void
  onDelete: (id: string) => void
  onViewDetails: (classItem: ClassRow) => void
}

export function DayView({
  classes,
  selectedDate,
  onDateChange,
  onEdit,
  onDelete,
  onViewDetails,
}: DayViewProps) {
  const formatDateForDisplay = (dateString: string) => {
    const [year, month, day] = dateString.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
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
    <div className='space-y-4 w-full max-w-full overflow-hidden'>
      {/* Header with Date Navigation */}
      <div className='flex flex-col gap-3 w-full max-w-full'>
        <h2 className='text-lg sm:text-xl font-semibold text-center break-words px-2'>
          {formatDateForDisplay(selectedDate.toISOString().split('T')[0])}
        </h2>
        <div className='flex items-center justify-center gap-2 w-full max-w-full px-1'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              const newDate = new Date(selectedDate)
              newDate.setDate(selectedDate.getDate() - 1)
              onDateChange(newDate)
            }}
            className='flex items-center justify-center gap-1 px-2 sm:px-3 flex-1 min-w-0 max-w-28'
          >
            <ChevronLeft className='h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0' />
            <span className='hidden xs:inline text-xs sm:text-sm truncate'>
              Anterior
            </span>
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onDateChange(new Date())}
            className='px-2 sm:px-3 flex-1 min-w-0 max-w-20 text-xs sm:text-sm'
          >
            Hoy
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              const newDate = new Date(selectedDate)
              newDate.setDate(selectedDate.getDate() + 1)
              onDateChange(newDate)
            }}
            className='flex items-center justify-center gap-1 px-2 sm:px-3 flex-1 min-w-0 max-w-28'
          >
            <span className='hidden xs:inline text-xs sm:text-sm truncate'>
              Siguiente
            </span>
            <ChevronRight className='h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0' />
          </Button>
        </div>
      </div>

      {/* Classes List */}
      <div className='space-y-3 w-full max-w-full'>
        {dayClasses.length === 0 ? (
          <Card className='w-full max-w-full'>
            <CardContent className='pt-6'>
              <div className='text-center text-gray-500 py-4'>
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
