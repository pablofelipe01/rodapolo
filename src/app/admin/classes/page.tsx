'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClientSupabase } from '@/lib/supabase'
import type { ClassRow, TimeFilter, CityFilter as CityFilterType } from './types'
import { ViewNavigation } from './components/ViewNavigation'
import { AlertMessage } from './components/AlertMessage'
import { ClassListView } from './components/ClassListView'
import { DayView } from './components/DayView'
import { WeekView } from './components/WeekView'
import { MonthView } from './components/MonthView'
import { ClassForm } from './components/ClassForm'
import { TimeFilter } from './components/TimeFilter'
import { CityFilter } from './components/CityFilter'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, Filter, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassRow | null>(null)
  const [currentView, setCurrentView] = useState<'list' | 'day' | 'week' | 'month'>('list')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'individual' | 'season'>('individual')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('upcoming')
  const [cityFilter, setCityFilter] = useState<CityFilterType>('all')
  const [showFilters, setShowFilters] = useState(false)

  const supabase = createClientSupabase()
  const router = useRouter()

  // Filter classes based on time and city filters
  const filteredClasses = useMemo(() => {
    const today = new Date().toISOString().split('T')[0] // Get today's date in YYYY-MM-DD format
    
    return classes.filter(classItem => {
      // Time filter - Show all classes from today onwards for "upcoming"
      let timeMatch = true
      switch (timeFilter) {
        case 'upcoming':
          timeMatch = classItem.date >= today
          break
        case 'past':
          timeMatch = classItem.date < today
          break
        case 'all':
        default:
          timeMatch = true
      }
      
      // City filter (using field column)
      let cityMatch = true
      switch (cityFilter) {
        case 'sotogrande':
          cityMatch = classItem.field === 'sotogrande'
          break
        case 'marbella':
          cityMatch = classItem.field === 'marbella'
          break
        case 'all':
        default:
          cityMatch = true
      }
      
      return timeMatch && cityMatch
    })
  }, [classes, timeFilter, cityFilter])

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error
      setClasses(data || [])
    } catch (err) {
      console.error('Error fetching classes:', err)
      setError('Error al cargar las clases')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null)
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, error])

  const resetForm = () => {
    setEditingClass(null)
    setShowForm(false)
    setActiveTab('individual')
  }

  const handleEdit = (classItem: ClassRow) => {
    setEditingClass(classItem)
    setShowForm(true)
    setActiveTab('individual')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta clase?')) return

    try {
      const { error } = await supabase.from('classes').delete().eq('id', id)

      if (error) throw error
      setSuccess('Clase eliminada exitosamente')
      fetchClasses()
    } catch (err) {
      console.error('Error deleting class:', err)
      setError('Error al eliminar la clase')
    }
  }

  const handleViewDetails = (classItem: ClassRow) => {
    router.push(`/admin/classes/${classItem.id}`)
  }

  const handleFormSuccess = () => {
    setSuccess(editingClass ? 'Clase actualizada exitosamente' : 'Clase creada exitosamente')
    resetForm()
    fetchClasses()
  }

  // Get count stats for the filters
  const getFilterStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const upcomingCount = classes.filter(cls => cls.date >= today).length
    const pastCount = classes.filter(cls => cls.date < today).length
    const sotograndeCount = classes.filter(cls => cls.field === 'sotogrande').length
    const marbellaCount = classes.filter(cls => cls.field === 'marbella').length
    const noCityCount = classes.filter(cls => !cls.field).length
    
    return {
      upcoming: upcomingCount,
      past: pastCount,
      all: classes.length,
      sotogrande: sotograndeCount,
      marbella: marbellaCount,
      noCity: noCityCount
    }
  }, [classes])

  if (loading) return <div className="flex justify-center items-center min-h-64 p-4">Cargando clases...</div>

  return (
    <div className='space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-0'>
      {/* Header Section */}
      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
        <div className='text-center sm:text-left'>
          <h1 className='text-2xl sm:text-3xl font-bold tracking-tight'>Gestión de Clases</h1>
          <p className='text-muted-foreground text-sm sm:text-base mt-1'>
            Administra horarios, cupos y programación de clases
          </p>
        </div>
        
        {/* Desktop Actions */}
        <div className='hidden sm:flex items-center gap-3'>
          <TimeFilter 
            currentFilter={timeFilter} 
            onFilterChange={setTimeFilter} 
          />
          <CityFilter 
            currentFilter={cityFilter} 
            onFilterChange={setCityFilter} 
          />
          <Button onClick={() => setShowForm(true)} className='whitespace-nowrap'>
            <Plus className='mr-2 h-4 w-4' />
            Nueva Clase
          </Button>
        </div>

        {/* Mobile Actions */}
        <div className='flex sm:hidden items-center gap-2 justify-between'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowFilters(!showFilters)}
            className='flex items-center gap-2 flex-1'
          >
            <Filter className='h-4 w-4' />
            Filtros
            {showFilters ? <X className='h-4 w-4' /> : null}
          </Button>
          <Button 
            onClick={() => setShowForm(true)} 
            size='sm'
            className='flex items-center gap-1 whitespace-nowrap flex-shrink-0'
          >
            <Plus className='h-4 w-4' />
            <span className='hidden xs:inline'>Nueva</span>
          </Button>
        </div>
      </div>

      {/* Mobile Filters */}
      {showFilters && (
        <div className='sm:hidden bg-muted/30 p-4 rounded-lg space-y-4'>
          <div className='space-y-3'>
            <h3 className='font-medium text-sm'>Filtro de Tiempo</h3>
            <TimeFilter 
              currentFilter={timeFilter} 
              onFilterChange={setTimeFilter} 
            />
          </div>
          <div className='space-y-3'>
            <h3 className='font-medium text-sm'>Filtro de Ciudad</h3>
            <CityFilter 
              currentFilter={cityFilter} 
              onFilterChange={setCityFilter} 
            />
          </div>
        </div>
      )}

      {/* Filter Stats */}
      <div className='flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground justify-center sm:justify-start'>
        <span className='bg-muted px-2 py-1 rounded'>Total: {getFilterStats.all}</span>
        <span className='bg-green-100 text-green-800 px-2 py-1 rounded'>Próximas: {getFilterStats.upcoming}</span>
        <span className='bg-gray-100 text-gray-800 px-2 py-1 rounded'>Pasadas: {getFilterStats.past}</span>
        <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded'>Sotogrande: {getFilterStats.sotogrande}</span>
        <span className='bg-green-100 text-green-800 px-2 py-1 rounded'>Marbella: {getFilterStats.marbella}</span>
        {getFilterStats.noCity > 0 && (
          <span className='bg-yellow-100 text-yellow-800 px-2 py-1 rounded'>Sin ciudad: {getFilterStats.noCity}</span>
        )}
        <span className='bg-primary/10 text-primary px-2 py-1 rounded font-medium'>
          Mostrando: {filteredClasses.length}
        </span>
      </div>

      {/* View Navigation */}
      <div className='w-full'>
        <ViewNavigation currentView={currentView} onViewChange={setCurrentView} />
      </div>

      {/* Alerts */}
      {error && <AlertMessage type="error" message={error} />}
      {success && <AlertMessage type="success" message={success} />}

      {/* Class Form */}
      {showForm && (
        <ClassForm
          editingClass={editingClass}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSuccess={handleFormSuccess}
          onError={setError}
          onCancel={resetForm}
        />
      )}

      {/* Views */}
      <div className='w-full'>
        {currentView === 'list' && (
          <ClassListView
            classes={filteredClasses}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetails={handleViewDetails}
          />
        )}

        {currentView === 'day' && (
          <DayView
            classes={filteredClasses}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetails={handleViewDetails}
          />
        )}

        {currentView === 'week' && (
          <WeekView
            classes={filteredClasses}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetails={handleViewDetails}
          />
        )}

        {currentView === 'month' && (
          <MonthView
            classes={filteredClasses}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetails={handleViewDetails}
          />
        )}

        {filteredClasses.length === 0 && classes.length > 0 && (
          <div className='text-center p-6 border rounded-lg bg-muted/20'>
            <Calendar className='mx-auto h-12 w-12 text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No hay clases que coincidan con los filtros
            </h3>
            <p className='text-gray-500 text-sm mb-4'>
              {timeFilter === 'upcoming' && cityFilter === 'all' 
                ? 'No hay clases próximas programadas.' 
                : `Filtros activos: ${timeFilter === 'upcoming' ? 'Próximas' : timeFilter === 'past' ? 'Pasadas' : 'Todas'} • ${cityFilter === 'sotogrande' ? 'Sotogrande' : cityFilter === 'marbella' ? 'Marbella' : 'Todas las ciudades'}`}
            </p>
            <Button 
              variant='outline' 
              size='sm'
              onClick={() => {
                setTimeFilter('all')
                setCityFilter('all')
                setShowFilters(false)
              }}
            >
              Ver todas las clases
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}