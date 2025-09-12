import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Users, UserPlus, Baby, ShieldCheck } from 'lucide-react'

export default function UsersPage() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Gestión de Usuarios
          </h1>
          <p className='text-gray-600'>
            Administra cuentas de padres y juniors en el sistema
          </p>
        </div>
        <Button>
          <UserPlus className='mr-2 h-4 w-4' />
          Invitar Usuario
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Usuarios
            </CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-xs text-muted-foreground'>
              Usuarios registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Padres</CardTitle>
            <ShieldCheck className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-xs text-muted-foreground'>Cuentas parentales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Juniors</CardTitle>
            <Baby className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-xs text-muted-foreground'>Perfiles de menores</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Activos Hoy</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-xs text-muted-foreground'>Usuarios conectados</p>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            Todos los usuarios registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            <Users className='mx-auto h-12 w-12 text-gray-400' />
            <h3 className='mt-2 text-sm font-medium text-gray-900'>
              No hay usuarios
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              Los usuarios aparecerán aquí cuando se registren.
            </p>
            <div className='mt-6'>
              <Button>
                <UserPlus className='mr-2 h-4 w-4' />
                Invitar Usuario
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
