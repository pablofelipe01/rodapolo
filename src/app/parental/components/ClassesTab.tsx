import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Calendar, Clock, Users, MapPin, ChevronDown, ChevronUp, Info } from 'lucide-react'
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
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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

  const toggleExpand = (classId: string) => {
    setExpandedClassId(expandedClassId === classId ? null : classId)
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
        <CardHeader className='pb-3'>
          <CardTitle className='text-lg'>Filtros</CardTitle>
          <CardDescription className='text-sm'>
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
                  className='flex items-center gap-1 text-xs px-3 py-2 h-auto'
                >
                  <MapPin className='h-3 w-3' />
                  <span>{label}</span>
                  <Badge variant='secondary' className='ml-1 text-xs'>
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
                  className='flex items-center gap-1 text-xs px-3 py-2 h-auto'
                >
                  {label}
                  <Badge variant='secondary' className='ml-1 text-xs'>
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
              {filteredClasses.map(classInfo => {
                const isExpanded = expandedClassId === classInfo.id
                const hasNotes = classInfo.notes && classInfo.notes.trim().length > 0
                const hasField = classInfo.field && classInfo.field.trim().length > 0

                return (
                  <div
                    key={classInfo.id}
                    className='border rounded-lg hover:bg-gray-50 transition-colors'
                  >
                    {/* Class Header - Always Visible */}
                    <div className='flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3'>
                      <div className='flex items-start space-x-3 flex-1'>
                        <div className='flex-shrink-0'>
                          <div className='w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center'>
                            <BookOpen className='h-5 w-5 sm:h-6 sm:w-6 text-green-600' />
                          </div>
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex flex-wrap items-center gap-2 mb-2'>
                            <h3 className='text-base sm:text-lg font-medium text-gray-900 truncate'>
                              {classInfo.instructor_name}
                            </h3>
                            <div className='flex flex-wrap gap-1'>
                              <Badge
                                variant={
                                  classInfo.level === 'mixed'
                                    ? 'outline'
                                    : classInfo.level === 'alpha'
                                      ? 'default'
                                      : 'secondary'
                                }
                                className='text-xs'
                              >
                                {classInfo.level === 'mixed'
                                  ? 'MIXTO'
                                  : classInfo.level.toUpperCase()}
                              </Badge>
                              {hasField && (
                                <Badge 
                                  variant='outline' 
                                  className={`text-xs ${getLocationColor(classInfo.field)}`}
                                >
                                  <MapPin className='h-3 w-3 mr-1' />
                                  {getLocationDisplayName(classInfo.field)}
                                </Badge>
                              )}
                              {hasNotes && (
                                <Badge variant='outline' className='text-xs bg-yellow-100 text-yellow-800 border-yellow-200'>
                                  <Info className='h-3 w-3 mr-1' />
                                  Notas
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className='flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 text-sm text-gray-500'>
                            <div className='flex items-center gap-1'>
                              <Calendar className='w-3 h-3' />
                              <span className='text-xs'>{formatDate(classInfo.date)}</span>
                            </div>
                            <div className='flex items-center gap-1'>
                              <Clock className='w-3 h-3' />
                              <span className='text-xs'>
                                {formatTime(classInfo.start_time)} -{' '}
                                {formatTime(classInfo.end_time)}
                              </span>
                            </div>
                            <div className='flex items-center gap-1'>
                              <Users className='w-3 h-3' />
                              <span className='text-xs'>
                                {classInfo.current_bookings || 0}/{classInfo.capacity}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className='flex items-center gap-2 self-end sm:self-auto'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => onBookClass(classInfo)}
                          disabled={children.length === 0}
                          className='w-full sm:w-auto'
                        >
                          Reservar
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => toggleExpand(classInfo.id)}
                          className='p-2 h-9 w-9'
                        >
                          {isExpanded ? (
                            <ChevronUp className='h-4 w-4' />
                          ) : (
                            <ChevronDown className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && (
                      <div className='px-4 pb-4 border-t pt-4 bg-white rounded-b-lg'>
                        <div className='space-y-3'>
                          {/* Field Information */}
                          {hasField && (
                            <div>
                              <h4 className='font-medium text-sm text-gray-900 mb-1'>Ubicación</h4>
                              <p className='text-sm text-gray-600'>{classInfo.field}</p>
                            </div>
                          )}

                          {/* Notes Section */}
                          {hasNotes && (
                            <div>
                              <h4 className='font-medium text-sm text-gray-900 mb-1 flex items-center gap-1'>
                                <Info className='h-4 w-4 text-yellow-600' />
                                Notas del Instructor
                              </h4>
                              <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3'>
                                <p className='text-sm text-yellow-800 whitespace-pre-wrap'>
                                  {classInfo.notes}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Class Details */}
                          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
                            <div>
                              <h4 className='font-medium text-gray-900 mb-1'>Información de la Clase</h4>
                              <div className='space-y-1 text-gray-600'>
                                <p><strong>Instructor:</strong> {classInfo.instructor_name}</p>
                                <p><strong>Nivel:</strong> {classInfo.level.toUpperCase()}</p>
                                <p><strong>Capacidad:</strong> {classInfo.current_bookings || 0}/{classInfo.capacity}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className='font-medium text-gray-900 mb-1'>Fecha y Hora</h4>
                              <div className='space-y-1 text-gray-600'>
                                <p><strong>Fecha:</strong> {formatDate(classInfo.date)}</p>
                                <p><strong>Horario:</strong> {formatTime(classInfo.start_time)} - {formatTime(classInfo.end_time)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}