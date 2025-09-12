import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Calendar, FileText, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Dashboard Administrativo
          </h1>
          <p className='text-gray-600'>
            Bienvenido al panel de control de Rodapolo
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
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
              Padres y juniors registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Clases Activas
            </CardTitle>
            <Calendar className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-xs text-muted-foreground'>Clases programadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Posts Publicados
            </CardTitle>
            <FileText className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-xs text-muted-foreground'>
              Contenido para juniors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Reservas del Mes
            </CardTitle>
            <BarChart3 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-xs text-muted-foreground'>
              Reservas confirmadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Clases</CardTitle>
            <CardDescription>
              Administra horarios, cupos y programación de clases
            </CardDescription>
          </CardHeader>
          <CardContent className='flex justify-between items-center'>
            <div className='space-y-2'>
              <Link href='/admin/classes'>
                <Button className='w-full'>
                  <Calendar className='mr-2 h-4 w-4' />
                  Ver Clases
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gestión de Posts</CardTitle>
            <CardDescription>
              Crea y publica contenido para los juniors
            </CardDescription>
          </CardHeader>
          <CardContent className='flex justify-between items-center'>
            <div className='space-y-2'>
              <Link href='/admin/posts'>
                <Button className='w-full'>
                  <FileText className='mr-2 h-4 w-4' />
                  Gestionar Posts
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gestión de Usuarios</CardTitle>
            <CardDescription>
              Administra cuentas de padres y juniors
            </CardDescription>
          </CardHeader>
          <CardContent className='flex justify-between items-center'>
            <div className='space-y-2'>
              <Link href='/admin/users'>
                <Button className='w-full'>
                  <Users className='mr-2 h-4 w-4' />
                  Ver Usuarios
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Últimas acciones en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-center justify-between py-2'>
              <span className='text-sm text-gray-600'>
                No hay actividad reciente
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
