import type { ClassRow } from '../types'
import { ClassCard } from './ClassCard'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, MapPin } from 'lucide-react'

interface ClassListViewProps {
  classes: ClassRow[]
  onEdit: (classItem: ClassRow) => void
  onDelete: (id: string) => void
  onViewDetails: (classItem: ClassRow) => void
}

export function ClassListView({ classes, onEdit, onDelete, onViewDetails }: ClassListViewProps) {
  // Separate classes by city with better matching
  const sotograndeClasses = classes.filter(cls => 
    cls.field && cls.field.toLowerCase().includes('sotogrande')
  )
  const marbellaClasses = classes.filter(cls => 
    cls.field && cls.field.toLowerCase().includes('marbella')
  )
  
  // All other classes should go to "Sin ciudad asignada"
  const noCityClasses = classes.filter(cls => 
    !sotograndeClasses.includes(cls) && !marbellaClasses.includes(cls)
  )

  if (classes.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className='pt-8 pb-8'>
          <div className='text-center'>
            <Calendar className='mx-auto h-16 w-16 text-gray-300 mb-4' />
            <h3 className='text-xl font-semibold text-gray-700 mb-2'>No hay clases programadas</h3>
            <p className='text-gray-500 text-lg'>Comienza creando una nueva clase</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderCitySection = (cityClasses: ClassRow[], cityName: string, color: string) => {
    if (cityClasses.length === 0) return null

    const colorClasses = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      gray: 'bg-gray-50 border-gray-200 text-gray-800'
    }

    return (
      <div className='w-full bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-200'>
        {/* City Header */}
        <div className={`p-4 border-b ${colorClasses[color as keyof typeof colorClasses]}`}>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className={`p-2 rounded-lg ${
                color === 'blue' ? 'bg-blue-100' : 
                color === 'green' ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <MapPin className={`h-5 w-5 ${
                  color === 'blue' ? 'text-blue-600' : 
                  color === 'green' ? 'text-green-600' : 'text-gray-600'
                }`} />
              </div>
              <div>
                <h2 className='text-lg font-bold'>{cityName}</h2>
                <p className='text-sm opacity-75'>
                  {cityClasses.length} clase{cityClasses.length !== 1 ? 's' : ''} disponible{cityClasses.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              color === 'blue' ? 'bg-blue-100 text-blue-700' : 
              color === 'green' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {cityClasses.length}
            </div>
          </div>
        </div>

        {/* Classes List */}
        <div className='p-4 space-y-3'>
          {cityClasses.map(classItem => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {renderCitySection(sotograndeClasses, 'Sotogrande', 'blue')}
      {renderCitySection(marbellaClasses, 'Marbella', 'green')}
      {renderCitySection(noCityClasses, 'Otras Ubicaciones', 'gray')}
    </div>
  )
}