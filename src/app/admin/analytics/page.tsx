import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Target,
} from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Analytics y Estadísticas
          </h1>
          <p className='text-gray-600'>
            Métricas y análisis del rendimiento de Rodapolo
          </p>
        </div>
      </div>

      {/* Main Stats */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Ingresos Mensuales
            </CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>$0</div>
            <p className='text-xs text-muted-foreground'>
              +0% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Usuarios Activos
            </CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-xs text-muted-foreground'>
              +0% desde la semana pasada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Clases Realizadas
            </CardTitle>
            <Calendar className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-xs text-muted-foreground'>
              En los últimos 30 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Tasa de Conversión
            </CardTitle>
            <Target className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0%</div>
            <p className='text-xs text-muted-foreground'>
              Visitantes a clientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Ingresos</CardTitle>
            <CardDescription>
              Ingresos mensuales de los últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-center h-40'>
              <div className='text-center'>
                <BarChart3 className='mx-auto h-12 w-12 text-gray-400' />
                <p className='mt-2 text-sm text-gray-500'>
                  Gráfico de ingresos disponible próximamente
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crecimiento de Usuarios</CardTitle>
            <CardDescription>Nuevos registros por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-center h-40'>
              <div className='text-center'>
                <TrendingUp className='mx-auto h-12 w-12 text-gray-400' />
                <p className='mt-2 text-sm text-gray-500'>
                  Gráfico de usuarios disponible próximamente
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>Top Posts Más Vistos</CardTitle>
            <CardDescription>
              Contenido más popular entre los juniors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='text-center py-4'>
                <p className='text-sm text-gray-500'>
                  No hay datos disponibles
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clases Más Populares</CardTitle>
            <CardDescription>Actividades con mayor demanda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='text-center py-4'>
                <p className='text-sm text-gray-500'>
                  No hay datos disponibles
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horarios Preferidos</CardTitle>
            <CardDescription>Franjas horarias con más reservas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='text-center py-4'>
                <p className='text-sm text-gray-500'>
                  No hay datos disponibles
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
