import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Baby, User, Star, Calendar, Plus } from 'lucide-react'
import { JuniorProfile } from './types'

interface ChildrenTabProps {
  children: JuniorProfile[]
  loading: boolean
  onAddChild: () => void
}

export function ChildrenTab({ children, loading, onAddChild }: ChildrenTabProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2'>
        <h2 className='text-xl font-semibold'>Perfiles de Mis Hijos</h2>
        <Button onClick={onAddChild} size='sm' className='w-full sm:w-auto'>
          <Plus className='mr-2 h-4 w-4' />
          Agregar Hijo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Hijos</CardTitle>
          <CardDescription>
            Administra los perfiles de tus hijos registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='text-center py-8'>
              <div className='text-sm text-gray-500'>Cargando perfiles...</div>
            </div>
          ) : children.length === 0 ? (
            <div className='text-center py-8'>
              <Baby className='mx-auto h-12 w-12 text-gray-400' />
              <h3 className='mt-2 text-sm font-medium text-gray-900'>
                No hay hijos registrados
              </h3>
              <p className='mt-1 text-sm text-gray-500'>
                Contacta al administrador para registrar a tus hijos.
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {children.map(child => (
                <div
                  key={child.id}
                  className='flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 gap-3'
                >
                  <div className='flex items-start space-x-3 flex-1'>
                    <div className='flex-shrink-0'>
                      <div className='w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center'>
                        <span className='text-sm sm:text-lg font-medium text-blue-600'>
                          {child.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <h3 className='text-base sm:text-lg font-medium text-gray-900 truncate'>
                          {child.full_name}
                        </h3>
                        {child.nickname && (
                          <span className='text-sm text-gray-500 hidden sm:inline'>
                            &ldquo;{child.nickname}&rdquo;
                          </span>
                        )}
                        <div className='flex flex-wrap gap-1'>
                          <Badge variant={child.level === 'alpha' ? 'default' : 'secondary'} className='text-xs'>
                            {child.level.toUpperCase()}
                          </Badge>
                          <Badge variant={child.active ? 'default' : 'destructive'} className='text-xs'>
                            {child.active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                      </div>
                      <div className='flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-3 mt-1 text-xs sm:text-sm text-gray-500'>
                        <div className='flex items-center gap-1'>
                          <User className='w-3 h-3' />
                          <span>Código: {child.unique_code}</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <Star className='w-3 h-3' />
                          <span>Handicap: {child.handicap}</span>
                        </div>
                        {child.birth_date && (
                          <div className='flex items-center gap-1'>
                            <Calendar className='w-3 h-3' />
                            <span>{formatDate(child.birth_date)}</span>
                          </div>
                        )}
                      </div>
                    </div>
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