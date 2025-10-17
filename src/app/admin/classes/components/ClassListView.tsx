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
  // Separate classes by city
  const sotograndeClasses = classes.filter(cls => 
    cls.field === 'sotogrande' || cls.field === 'Sotogrande'
  )
  const marbellaClasses = classes.filter(cls => 
    cls.field === 'marbella' || cls.field === 'Marbella'
  )
  
  // All other classes should go to "Sin ciudad asignada"
  const noCityClasses = classes.filter(cls => 
    !sotograndeClasses.includes(cls) && !marbellaClasses.includes(cls)
  )

  if (classes.length === 0) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <div className='text-center'>
            <Calendar className='mx-auto h-12 w-12 text-gray-400' />
            <h3 className='mt-2 text-sm font-medium text-gray-900'>No hay clases programadas</h3>
            <p className='mt-1 text-sm text-gray-500'>Comienza creando una nueva clase.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-8'>
      {/* Sotogrande Section */}
      {sotograndeClasses.length > 0 && (
        <div>
          <div className='flex items-center gap-2 mb-4'>
            <MapPin className='h-5 w-5 text-blue-600' />
            <h2 className='text-xl font-semibold text-blue-800'>Sotogrande</h2>
            <span className='bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full'>
              {sotograndeClasses.length} clase{sotograndeClasses.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className='grid gap-4'>
            {sotograndeClasses.map(classItem => (
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
      )}

      {/* Marbella Section */}
      {marbellaClasses.length > 0 && (
        <div>
          <div className='flex items-center gap-2 mb-4'>
            <MapPin className='h-5 w-5 text-green-600' />
            <h2 className='text-xl font-semibold text-green-800'>Marbella</h2>
            <span className='bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full'>
              {marbellaClasses.length} clase{marbellaClasses.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className='grid gap-4'>
            {marbellaClasses.map(classItem => (
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
      )}

      {/* No City Section */}
      {noCityClasses.length > 0 && (
        <div>
          <div className='flex items-center gap-2 mb-4'>
            <MapPin className='h-5 w-5 text-gray-600' />
            <h2 className='text-xl font-semibold text-gray-800'>Sin ciudad asignada</h2>
            <span className='bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-full'>
              {noCityClasses.length} clase{noCityClasses.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className='grid gap-4'>
            {noCityClasses.map(classItem => (
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
      )}
    </div>
  )
}