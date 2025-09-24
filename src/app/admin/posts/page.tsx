'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Plus, FileText, Eye, Heart, Edit, Trash2 } from 'lucide-react'
import { PostFormModal } from '@/components/PostFormModal'
import { Badge } from '@/components/ui/badge'

interface Post {
  id: string
  title: string
  content: string
  status: string
  audience: 'all' | 'parental' | 'junior'
  published_at?: string | null
  created_at: string
  updated_at: string
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = (savedPost: Post) => {
    setPosts(prev => {
      const existingIndex = prev.findIndex(p => p.id === savedPost.id)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = savedPost
        return updated
      } else {
        return [savedPost, ...prev]
      }
    })
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este post?')) {
      return
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId))
      } else {
        alert('Error al eliminar el post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Error al eliminar el post')
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])
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
        <PostFormModal
          trigger={
            <Button>
              <Plus className='mr-2 h-4 w-4' />
              Nuevo Post
            </Button>
          }
          onSave={handleSave}
        />
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
            <div className='text-2xl font-bold'>
              {posts.filter(p => p.status === 'published').length}
            </div>
            <p className='text-xs text-muted-foreground'>
              Contenido disponible para juniors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Posts</CardTitle>
            <Eye className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{posts.length}</div>
            <p className='text-xs text-muted-foreground'>
              Todos los posts creados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Borradores</CardTitle>
            <Heart className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {posts.filter(p => p.status === 'draft').length}
            </div>
            <p className='text-xs text-muted-foreground'>Posts sin publicar</p>
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
          {loading ? (
            <div className='text-center py-8'>
              <p>Cargando posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className='text-center py-8'>
              <FileText className='mx-auto h-12 w-12 text-gray-400' />
              <h3 className='mt-2 text-sm font-medium text-gray-900'>
                No hay posts
              </h3>
              <p className='mt-1 text-sm text-gray-500'>
                Comienza creando tu primer post para los juniors.
              </p>
              <div className='mt-6'>
                <PostFormModal
                  trigger={
                    <Button>
                      <Plus className='mr-2 h-4 w-4' />
                      Nuevo Post
                    </Button>
                  }
                  onSave={handleSave}
                />
              </div>
            </div>
          ) : (
            <div className='space-y-4'>
              {posts.map(post => (
                <div
                  key={post.id}
                  className='flex items-center justify-between p-4 border rounded-lg'
                >
                  <div className='flex-1'>
                    <div className='flex items-center gap-2'>
                      <h3 className='font-medium'>{post.title}</h3>
                      <Badge
                        variant={
                          post.status === 'published' ? 'default' : 'secondary'
                        }
                      >
                        {post.status === 'published' ? 'Publicado' : 'Borrador'}
                      </Badge>
                      <Badge
                        variant='outline'
                        className={`${
                          post.audience === 'all'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : post.audience === 'parental'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        {post.audience === 'all'
                          ? 'Todos'
                          : post.audience === 'parental'
                            ? 'Parental'
                            : 'Junior'}
                      </Badge>
                    </div>
                    <p className='text-sm text-gray-600 mt-1 line-clamp-2'>
                      {post.content}
                    </p>
                    <p className='text-xs text-gray-400 mt-2'>
                      Creado:{' '}
                      {new Date(post.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <PostFormModal
                      post={post}
                      trigger={
                        <Button variant='outline' size='sm'>
                          <Edit className='h-4 w-4' />
                        </Button>
                      }
                      onSave={handleSave}
                    />
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
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
