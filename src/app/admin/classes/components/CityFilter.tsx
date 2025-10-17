import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MapPin, ChevronDown } from 'lucide-react'
import type { CityFilter } from '../types'

interface CityFilterProps {
  currentFilter: CityFilter
  onFilterChange: (filter: CityFilter) => void
}

export function CityFilter({ currentFilter, onFilterChange }: CityFilterProps) {
  const getFilterLabel = (filter: CityFilter) => {
    switch (filter) {
      case 'sotogrande':
        return 'Sotogrande'
      case 'marbella':
        return 'Marbella'
      case 'all':
      default:
        return 'Todas las ciudades'
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>{getFilterLabel(currentFilter)}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onFilterChange('all')}>
          Todas las ciudades
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFilterChange('sotogrande')}>
          Sotogrande
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onFilterChange('marbella')}>
          Marbella
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}