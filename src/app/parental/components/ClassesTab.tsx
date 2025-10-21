import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Calendar, Clock, Users, MapPin, ChevronDown, ChevronUp, Info, Filter } from 'lucide-react'
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
  const [showFilters, setShowFilters] = useState(false)
  const [showDesktopFilters, setShowDesktopFilters] = useState(true) // Separate state for desktop

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
      {/* Header with Mobile Filter Toggle */}
      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3'>
        <h2 className='text-xl font-semibold'>Clases Disponibles</h2>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setShowFilters(!showFilters)}
          className='sm:hidden flex items-center gap-2 w-full sm:w-auto'
        >
          <Filter className='h-4 w-4' />
          {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          <Badge variant='secondary' className='ml-1'>
            {filteredClasses.length}
          </Badge>
        </Button>
      </div>

      {/* Filters - Mobile Collapsible, Desktop Toggleable */}
      <div className={`${showFilters ? 'block' : 'hidden'} ${showDesktopFilters ? 'sm:block' : 'sm:hidden'}`}>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Filter className='h-5 w-5' />
              Filtros
            </CardTitle>
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
                    className='flex items-center gap-1 text-xs px-3 py-2 h-auto min-w-[100px] flex-1 sm:flex-initial'
                  >
                    <MapPin className='h-3 w-3 flex-shrink-0' />
                    <span className='truncate'>{label}</span>
                    <Badge variant='secondary' className='ml-1 text-xs flex-shrink-0'>
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
                    className='flex items-center gap-1 text-xs px-3 py-2 h-auto min-w-[80px] flex-1 sm:flex-initial'
                  >
                    <span className='truncate'>{label}</span>
                    <Badge variant='secondary' className='ml-1 text-xs flex-shrink-0'>
                      {count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>

            {/* Active Filters Summary */}
            {(locationFilter !== 'all' || levelFilter !== 'all') && (
              <div className='flex items-center justify-between pt-2 border-t'>
                <span className='text-sm text-gray-600'>
                  Filtros activos: 
                  {locationFilter !== 'all' && ` ${locationFilter}`}
                  {levelFilter !== 'all' && ` • ${levelFilter.toUpperCase()}`}
                </span>
                <Button 
                  variant='ghost' 
                  size='sm'
                  onClick={() => {
                    setLocationFilter('all')
                    setLevelFilter('all')
                  }}
                  className='text-xs h-8'
                >
                  Limpiar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Classes List */}
      <Card>
        <CardHeader className='pb-4'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
            <div>
              <CardTitle>Próximas Clases</CardTitle>
              <CardDescription className='flex flex-wrap items-center gap-1'>
                <span>{filteredClasses.length} clase(s) encontrada(s)</span>
                {locationFilter !== 'all' && (
                  <Badge variant='outline' className='text-xs'>
                    📍 {locationFilter}
                  </Badge>
                )}
                {levelFilter !== 'all' && (
                  <Badge variant='outline' className='text-xs'>
                    🎯 {levelFilter.toUpperCase()}
                  </Badge>
                )}
              </CardDescription>
            </div>
            {/* Desktop Filter Toggle */}
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowDesktopFilters(!showDesktopFilters)}
              className='hidden sm:flex items-center gap-2'
            >
              <Filter className='h-4 w-4' />
              {showDesktopFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className='px-2 sm:px-6'>
          {filteredClasses.length === 0 ? (
            <div className='text-center py-8 px-4'>
              <BookOpen className='mx-auto h-12 w-12 text-gray-400 mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                No hay clases programadas
              </h3>
              <p className='text-gray-500 mb-4 max-w-sm mx-auto'>
                {classes.length === 0 
                  ? 'Las clases aparecerán aquí cuando estén disponibles.'
                  : 'No hay clases que coincidan con los filtros seleccionados.'
                }
              </p>
              {(locationFilter !== 'all' || levelFilter !== 'all') && (
                <Button 
                  variant='outline' 
                  onClick={() => {
                    setLocationFilter('all')
                    setLevelFilter('all')
                  }}
                >
                  Ver todas las clases
                </Button>
              )}
            </div>
          ) : (
            <div className='space-y-3'>
              {filteredClasses.map(classInfo => {
                const isExpanded = expandedClassId === classInfo.id
                const hasNotes = classInfo.notes && classInfo.notes.trim().length > 0
                const hasField = classInfo.field && classInfo.field.trim().length > 0

                return (
                  <div
                    key={classInfo.id}
                    className='border rounded-lg hover:border-gray-300 transition-all duration-200 bg-white shadow-sm hover:shadow-md'
                  >
                    {/* Class Header - Always Visible */}
                    <div className='p-4'>
                      <div className='flex flex-col gap-3'>
                        {/* Top Row - Icon and Basic Info */}
                        <div className='flex items-start gap-3'>
                          <div className='flex-shrink-0'>
                            <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center'>
                              <BookOpen className='h-5 w-5 text-green-600' />
                            </div>
                          </div>
                          <div className='flex-1 min-w-0'>
                            {/* Instructor and Level */}
                            <div className='flex flex-col xs:flex-row xs:items-start xs:justify-between gap-2 mb-2'>
                              <h3 className='text-base font-semibold text-gray-900 truncate'>
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
                                className='text-xs w-fit'
                              >
                                {classInfo.level === 'mixed'
                                  ? 'MIXTO'
                                  : classInfo.level.toUpperCase()}
                              </Badge>
                            </div>

                            {/* Location and Notes Badges */}
                            <div className='flex flex-wrap gap-1 mb-3'>
                              {hasField && (
                                <Badge 
                                  variant='outline' 
                                  className={`text-xs ${getLocationColor(classInfo.field)}`}
                                >
                                  <MapPin className='h-3 w-3 mr-1 flex-shrink-0' />
                                  <span className='truncate'>{getLocationDisplayName(classInfo.field)}</span>
                                </Badge>
                              )}
                              {hasNotes && (
                                <Badge variant='outline' className='text-xs bg-yellow-100 text-yellow-800 border-yellow-200'>
                                  <Info className='h-3 w-3 mr-1 flex-shrink-0' />
                                  Notas
                                </Badge>
                              )}
                            </div>

                            {/* Date, Time, Capacity */}
                            <div className='flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 text-sm text-gray-600'>
                              <div className='flex items-center gap-1.5'>
                                <Calendar className='w-4 h-4 flex-shrink-0' />
                                <span className='text-sm'>{formatDate(classInfo.date)}</span>
                              </div>
                              <div className='flex items-center gap-1.5'>
                                <Clock className='w-4 h-4 flex-shrink-0' />
                                <span className='text-sm'>
                                  {formatTime(classInfo.start_time)} - {formatTime(classInfo.end_time)}
                                </span>
                              </div>
                              <div className='flex items-center gap-1.5'>
                                <Users className='w-4 h-4 flex-shrink-0' />
                                <span className='text-sm'>
                                  {classInfo.current_bookings || 0}/{classInfo.capacity}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Row - Actions */}
                        <div className='flex items-center justify-between gap-2 pt-2 border-t'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => onBookClass(classInfo)}
                            disabled={children.length === 0}
                            className='flex-1 sm:flex-initial'
                          >
                            {children.length === 0 ? 'Agregar Hijo Primero' : 'Reservar'}
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => toggleExpand(classInfo.id)}
                            className='p-2 h-9 w-9 flex-shrink-0'
                          >
                            {isExpanded ? (
                              <ChevronUp className='h-4 w-4' />
                            ) : (
                              <ChevronDown className='h-4 w-4' />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && (
                      <div className='px-4 pb-4 border-t bg-gray-50/50'>
                        <div className='space-y-4 pt-4'>
                          {/* Field Information */}
                          {hasField && (
                            <div>
                              <h4 className='font-medium text-sm text-gray-900 mb-2 flex items-center gap-2'>
                                <MapPin className='h-4 w-4 text-blue-600' />
                                Ubicación
                              </h4>
                              <p className='text-sm text-gray-600 pl-6'>{classInfo.field}</p>
                            </div>
                          )}

                          {/* Notes Section */}
                          {hasNotes && (
                            <div>
                              <h4 className='font-medium text-sm text-gray-900 mb-2 flex items-center gap-2'>
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
                            <div className='space-y-2'>
                              <h4 className='font-medium text-gray-900'>Información de la Clase</h4>
                              <div className='space-y-1.5 text-gray-600'>
                                <p className='flex justify-between'>
                                  <span>Instructor:</span>
                                  <span className='font-medium'>{classInfo.instructor_name}</span>
                                </p>
                                <p className='flex justify-between'>
                                  <span>Nivel:</span>
                                  <span className='font-medium'>{classInfo.level.toUpperCase()}</span>
                                </p>
                                <p className='flex justify-between'>
                                  <span>Capacidad:</span>
                                  <span className='font-medium'>{classInfo.current_bookings || 0}/{classInfo.capacity}</span>
                                </p>
                              </div>
                            </div>
                            <div className='space-y-2'>
                              <h4 className='font-medium text-gray-900'>Fecha y Hora</h4>
                              <div className='space-y-1.5 text-gray-600'>
                                <p className='flex justify-between'>
                                  <span>Fecha:</span>
                                  <span className='font-medium'>{formatDate(classInfo.date)}</span>
                                </p>
                                <p className='flex justify-between'>
                                  <span>Horario:</span>
                                  <span className='font-medium'>{formatTime(classInfo.start_time)} - {formatTime(classInfo.end_time)}</span>
                                </p>
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