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
import { Plus, Calendar } from 'lucide-react'
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

  if (loading) return <div>Cargando clases...</div>

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Gestión de Clases</h1>
          <p className='text-muted-foreground'>
            Administra horarios, cupos y programación de clases
          </p>
        </div>
        <div className='flex items-center gap-4'>
          <TimeFilter 
            currentFilter={timeFilter} 
            onFilterChange={setTimeFilter} 
          />
          <CityFilter 
            currentFilter={cityFilter} 
            onFilterChange={setCityFilter} 
          />
          <Button onClick={() => setShowForm(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Nueva Clase
          </Button>
        </div>
      </div>

      {/* Filter Stats */}
      <div className='flex gap-4 text-sm text-muted-foreground flex-wrap'>
        <span>Total: {getFilterStats.all} clases</span>
        <span>Próximas: {getFilterStats.upcoming}</span>
        <span>Pasadas: {getFilterStats.past}</span>
        <span>Sotogrande: {getFilterStats.sotogrande}</span>
        <span>Marbella: {getFilterStats.marbella}</span>
        {getFilterStats.noCity > 0 && <span>Sin ciudad: {getFilterStats.noCity}</span>}
        <span>Mostrando: {filteredClasses.length}</span>
      </div>

      <ViewNavigation currentView={currentView} onViewChange={setCurrentView} />

      {error && <AlertMessage type="error" message={error} />}
      {success && <AlertMessage type="success" message={success} />}

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
        <div className='text-center p-8 border rounded-lg'>
          <Calendar className='mx-auto h-12 w-12 text-gray-400 mb-4' />
          <h3 className='text-lg font-medium text-gray-900'>
            No hay clases que coincidan con los filtros
          </h3>
          <p className='text-gray-500 mt-2'>
            {timeFilter === 'upcoming' && cityFilter === 'all' 
              ? 'No hay clases próximas programadas.' 
              : `No hay clases que coincidan con los filtros: ${timeFilter === 'upcoming' ? 'Próximas' : timeFilter === 'past' ? 'Pasadas' : 'Todas'} y ${cityFilter === 'sotogrande' ? 'Sotogrande' : cityFilter === 'marbella' ? 'Marbella' : 'Todas las ciudades'}.`}
          </p>
          <Button 
            variant='outline' 
            className='mt-4'
            onClick={() => {
              setTimeFilter('all')
              setCityFilter('all')
            }}
          >
            Ver todas las clases
          </Button>
        </div>
      )}
    </div>
  )
}