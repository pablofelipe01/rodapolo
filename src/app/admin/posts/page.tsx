import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Plus, FileText, Eye, Heart } from 'lucide-react'

export default function PostsPage() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Gestión de Posts
          </h1>
          <p className='text-gray-600'>
            Crea y administra contenido para los juniors
          </p>
        </div>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Nuevo Post
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-3'>
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
              Contenido disponible para juniors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Vistas</CardTitle>
            <Eye className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-xs text-muted-foreground'>
              Vistas en todos los posts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Likes Totales</CardTitle>
            <Heart className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-xs text-muted-foreground'>
              Interacciones positivas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Posts List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Posts</CardTitle>
          <CardDescription>
            Todo el contenido creado para los juniors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            <FileText className='mx-auto h-12 w-12 text-gray-400' />
            <h3 className='mt-2 text-sm font-medium text-gray-900'>
              No hay posts
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              Comienza creando tu primer post para los juniors.
            </p>
            <div className='mt-6'>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                Nuevo Post
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
