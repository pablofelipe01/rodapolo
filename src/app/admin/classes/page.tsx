import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Plus, Calendar, Users, Clock } from 'lucide-react'

export default function ClassesPage() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Gestión de Clases
          </h1>
          <p className='text-gray-600'>
            Administra horarios, cupos y programación de clases
          </p>
        </div>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Nueva Clase
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Clases Activas
            </CardTitle>
            <Calendar className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-xs text-muted-foreground'>
              Clases programadas este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Participantes Totales
            </CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-xs text-muted-foreground'>
              Juniors inscritos en clases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Próxima Clase</CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>--</div>
            <p className='text-xs text-muted-foreground'>
              No hay clases programadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Classes List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clases</CardTitle>
          <CardDescription>
            Todas las clases programadas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            <Calendar className='mx-auto h-12 w-12 text-gray-400' />
            <h3 className='mt-2 text-sm font-medium text-gray-900'>
              No hay clases
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              Comienza creando tu primera clase.
            </p>
            <div className='mt-6'>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                Nueva Clase
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
