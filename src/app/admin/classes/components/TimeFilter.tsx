import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Calendar, ChevronDown } from 'lucide-react'
import type { TimeFilter } from '../types'

interface TimeFilterProps {
  currentFilter: TimeFilter
  onFilterChange: (filter: TimeFilter) => void
}

export function TimeFilter({ currentFilter, onFilterChange }: TimeFilterProps) {
  const getFilterLabel = (filter: TimeFilter) => {
    switch (filter) {
      case 'upcoming':
        return 'Próximas'
      case 'past':
        return 'Pasadas'
      case 'all':
        return 'Todas'
      default:
        return 'Todas'
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{getFilterLabel(currentFilter)}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onFilterChange('all')}>
          Todas las clases
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFilterChange('upcoming')}>
          Próximas clases
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFilterChange('past')}>
          Clases pasadas
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}