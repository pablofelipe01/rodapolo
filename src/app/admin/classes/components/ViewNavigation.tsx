import { Button } from '@/components/ui/button'
import { CalendarDays, CalendarCheck, CalendarRange } from 'lucide-react'
import type { CalendarView } from '../types'

interface ViewNavigationProps {
  currentView: CalendarView
  onViewChange: (view: CalendarView) => void
}

export function ViewNavigation({ currentView, onViewChange }: ViewNavigationProps) {
  return (
    <div className='flex gap-2 border-b'>
      <Button
        variant={currentView === 'list' ? 'default' : 'ghost'}
        onClick={() => onViewChange('list')}
        className='rounded-b-none'
      >
        Lista
      </Button>
      <Button
        variant={currentView === 'day' ? 'default' : 'ghost'}
        onClick={() => onViewChange('day')}
        className='rounded-b-none'
      >
        <CalendarDays className='mr-2 h-4 w-4' />
        Día
      </Button>
      <Button
        variant={currentView === 'week' ? 'default' : 'ghost'}
        onClick={() => onViewChange('week')}
        className='rounded-b-none'
      >
        <CalendarCheck className='mr-2 h-4 w-4' />
        Semana
      </Button>
      <Button
        variant={currentView === 'month' ? 'default' : 'ghost'}
        onClick={() => onViewChange('month')}
        className='rounded-b-none'
      >
        <CalendarRange className='mr-2 h-4 w-4' />
        Mes
      </Button>
    </div>
  )
}