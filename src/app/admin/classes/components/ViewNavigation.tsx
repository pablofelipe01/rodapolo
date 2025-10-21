import { Button } from '@/components/ui/button'
import { CalendarDays, CalendarCheck, CalendarRange, List } from 'lucide-react'
import type { CalendarView } from '../types'

interface ViewNavigationProps {
  currentView: CalendarView
  onViewChange: (view: CalendarView) => void
}

export function ViewNavigation({ currentView, onViewChange }: ViewNavigationProps) {
  return (
    <div className='w-full max-w-full overflow-hidden'>
      <div className='flex gap-2 border-b pb-0'>
        <Button
          variant={currentView === 'list' ? 'default' : 'ghost'}
          onClick={() => onViewChange('list')}
          className='rounded-b-none flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-2 whitespace-nowrap flex-1 sm:flex-initial min-w-0'
        >
          <List className='h-4 w-4 flex-shrink-0' />
          <span className='hidden sm:inline'>Lista</span>
        </Button>
        <Button
          variant={currentView === 'day' ? 'default' : 'ghost'}
          onClick={() => onViewChange('day')}
          className='rounded-b-none flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-2 whitespace-nowrap flex-1 sm:flex-initial min-w-0'
        >
          <CalendarDays className='h-4 w-4 flex-shrink-0' />
          <span className='hidden sm:inline'>Día</span>
        </Button>
        <Button
          variant={currentView === 'week' ? 'default' : 'ghost'}
          onClick={() => onViewChange('week')}
          className='rounded-b-none flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-2 whitespace-nowrap flex-1 sm:flex-initial min-w-0'
        >
          <CalendarCheck className='h-4 w-4 flex-shrink-0' />
          <span className='hidden sm:inline'>Semana</span>
        </Button>
        <Button
          variant={currentView === 'month' ? 'default' : 'ghost'}
          onClick={() => onViewChange('month')}
          className='rounded-b-none flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-2 whitespace-nowrap flex-1 sm:flex-initial min-w-0'
        >
          <CalendarRange className='h-4 w-4 flex-shrink-0' />
          <span className='hidden sm:inline'>Mes</span>
        </Button>
      </div>
    </div>
  )
}