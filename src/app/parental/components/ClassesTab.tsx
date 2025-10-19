import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Calendar, Clock, Users, MapPin } from 'lucide-react'
import { ClassInfo, JuniorProfile } from './types'
import { useState } from 'react'

interface ClassesTabProps {
  classes: ClassInfo[]
  children: JuniorProfile[]
  onBookClass: (classInfo: ClassInfo) => void
}

type LocationFilter = 'all' | 'Sotogrande' | 'Marbella'

export function ClassesTab({ classes, children, onBookClass }: ClassesTabProps) {
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('all')
  const [levelFilter, setLevelFilter] = useState<'all' | 'alpha' | 'beta' | 'mixed'>('all')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5)
  }

  // Get location color based on admin side colors
  const getLocationColor = (field: string | null) => {
    if (!field) return 'bg-gray-100 text-gray-800 border-gray-200'
    
    const fieldLower = field.toLowerCase()
    if (fieldLower.includes('marbella')) return 'bg-green-100 text-green-800 border-green-200'
    if (fieldLower.includes('sotogrande')) return 'bg-blue-100 text-blue-800 border-blue-200'
    
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  // Get display name for field
  const getLocationDisplayName = (field: string | null) => {
    if (!field) return 'Sin ubicación'
    
    const fieldLower = field.toLowerCase()
    if (fieldLower.includes('marbella')) return 'Marbella'
    if (fieldLower.includes('sotogrande')) return 'Sotogrande'
    
    return field
  }

  // Filter classes based on selected filters
  const filteredClasses = classes.filter(classInfo => {
    const locationMatch = locationFilter === 'all' || 
      (classInfo.field && getLocationDisplayName(classInfo.field) === locationFilter)
    
    const levelMatch = levelFilter === 'all' || classInfo.level === levelFilter
    
    return locationMatch && levelMatch
  })

  // Count classes by location (using the field property with flexible matching)
  const locationCounts = {
    all: classes.length,
    Sotogrande: classes.filter(c => 
      c.field && getLocationDisplayName(c.field) === 'Sotogrande'
    ).length,
    Marbella: classes.filter(c => 
      c.field && getLocationDisplayName(c.field) === 'Marbella'
    ).length,
  }

  const levelCounts = {
    all: classes.length,
    alpha: classes.filter(c => c.level === 'alpha').length,
    beta: classes.filter(c => c.level === 'beta').length,
    mixed: classes.filter(c => c.level === 'mixed').length,
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold'>Clases Disponibles</h2>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Filtros</CardTitle>
          <CardDescription>
            Filtra por ubicación y nivel de clase
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Location Filter */}
          <div>
            <label className='text-sm font-medium mb-2 block'>Ubicación</label>
            <div className='flex flex-wrap gap-2'>
              {[
                { value: 'all', label: 'Todas', count: locationCounts.all },
                { value: 'Sotogrande', label: 'Sotogrande', count: locationCounts.Sotogrande },
                { value: 'Marbella', label: 'Marbella', count: locationCounts.Marbella },
              ].map(({ value, label, count }) => (
                <Button
                  key={value}
                  variant={locationFilter === value ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setLocationFilter(value as LocationFilter)}
                  className='flex items-center gap-2'
                >
                  <MapPin className='h-4 w-4' />
                  {label}
                  <Badge variant='secondary' className='ml-1'>
                    {count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Level Filter */}
          <div>
            <label className='text-sm font-medium mb-2 block'>Nivel</label>
            <div className='flex flex-wrap gap-2'>
              {[
                { value: 'all', label: 'Todos', count: levelCounts.all },
                { value: 'alpha', label: 'Alpha', count: levelCounts.alpha },
                { value: 'beta', label: 'Beta', count: levelCounts.beta },
                { value: 'mixed', label: 'Mixto', count: levelCounts.mixed },
              ].map(({ value, label, count }) => (
                <Button
                  key={value}
                  variant={levelFilter === value ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setLevelFilter(value as any)}
                  className='flex items-center gap-2'
                >
                  {label}
                  <Badge variant='secondary' className='ml-1'>
                    {count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximas Clases</CardTitle>
          <CardDescription>
            {filteredClasses.length} clase(s) encontrada(s)
            {locationFilter !== 'all' && ` en ${locationFilter}`}
            {levelFilter !== 'all' && ` - Nivel ${levelFilter.toUpperCase()}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredClasses.length === 0 ? (
            <div className='text-center py-8'>
              <BookOpen className='mx-auto h-12 w-12 text-gray-400' />
              <h3 className='mt-2 text-sm font-medium text-gray-900'>
                No hay clases programadas
              </h3>
              <p className='mt-1 text-sm text-gray-500'>
                {classes.length === 0 
                  ? 'Las clases aparecerán aquí cuando estén disponibles.'
                  : 'No hay clases que coincidan con los filtros seleccionados.'
                }
              </p>
              {(locationFilter !== 'all' || levelFilter !== 'all') && (
                <Button 
                  variant='outline' 
                  className='mt-4'
                  onClick={() => {
                    setLocationFilter('all')
                    setLevelFilter('all')
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          ) : (
            <div className='space-y-4'>
              {filteredClasses.map(classInfo => (
                <div
                  key={classInfo.id}
                  className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50'
                >
                  <div className='flex items-center space-x-4'>
                    <div className='flex-shrink-0'>
                      <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center'>
                        <BookOpen className='h-6 w-6 text-green-600' />
                      </div>
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-2'>
                        <h3 className='text-lg font-medium text-gray-900'>
                          {classInfo.instructor_name}
                        </h3>
                        <Badge
                          variant={
                            classInfo.level === 'mixed'
                              ? 'outline'
                              : classInfo.level === 'alpha'
                                ? 'default'
                                : 'secondary'
                          }
                        >
                          {classInfo.level === 'mixed'
                            ? 'MIXTO'
                            : classInfo.level.toUpperCase()}
                        </Badge>
                        <Badge 
                          variant='outline' 
                          className={getLocationColor(classInfo.field)}
                        >
                          <MapPin className='h-3 w-3 mr-1' />
                          {getLocationDisplayName(classInfo.field)}
                        </Badge>
                      </div>
                      <div className='flex items-center gap-4 text-sm text-gray-500'>
                        <div className='flex items-center gap-1'>
                          <Calendar className='w-3 h-3' />
                          {formatDate(classInfo.date)}
                        </div>
                        <div className='flex items-center gap-1'>
                          <Clock className='w-3 h-3' />
                          {formatTime(classInfo.start_time)} -{' '}
                          {formatTime(classInfo.end_time)}
                        </div>
                        <div className='flex items-center gap-1'>
                          <Users className='w-3 h-3' />
                          {classInfo.current_bookings || 0}/{classInfo.capacity}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => onBookClass(classInfo)}
                      disabled={children.length === 0}
                    >
                      Reservar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}