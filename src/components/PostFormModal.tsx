'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MediaUpload } from './MediaUpload'

interface Post {
  id?: string
  title: string
  content: string
  status: string
  audience?: string
  published_at?: string | null
}

interface MediaFile {
  id?: string
  url: string
  type: 'image' | 'video'
  name: string
  size: number
  mimeType: string
}

interface PostFormModalProps {
  post?: Post
  trigger: React.ReactNode
  onSave: (post: Post) => void
}

export function PostFormModal({ post, trigger, onSave }: PostFormModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [formData, setFormData] = useState<{
    title: string
    content: string
    published: boolean
    audience: string
  }>({
    title: post?.title || '',
    content: post?.content || '',
    published: post?.status === 'published' || false,
    audience: post?.audience || 'all',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = post?.id ? `/api/posts/${post.id}` : '/api/posts'
      const method = post?.id ? 'PUT' : 'POST'

      console.log('Sending request:', { url, method, formData })

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Error al guardar el post')
      }

      const savedPost = await response.json()
      console.log('Saved post:', savedPost)

      // Associate media files with the post if there are any
      if (mediaFiles.length > 0) {
        const mediaPromises = mediaFiles.map(async media => {
          // Update existing media records with the post ID
          try {
            const response = await fetch(`/api/posts/${savedPost.id}/media`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                file_url: media.url,
                file_type: media.type,
                file_name: media.name,
                file_size: media.size,
                mime_type: media.mimeType,
              }),
            })
            if (!response.ok) {
              console.error(
                'Error associating media with post:',
                await response.json()
              )
            }
          } catch (error) {
            console.error('Error associating media:', error)
          }
        })

        await Promise.all(mediaPromises)
      }

      onSave(savedPost)
      setOpen(false)

      // Reset form if creating new post
      if (!post?.id) {
        setFormData({
          title: '',
          content: '',
          published: false,
          audience: 'all',
        })
      }
    } catch (error) {
      console.error('Error:', error)
      alert(
        'Error al guardar el post: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>{post?.id ? 'Editar Post' : 'Nuevo Post'}</DialogTitle>
          <DialogDescription>
            {post?.id
              ? 'Modifica el contenido del post'
              : 'Crea nuevo contenido para los juniors'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='title'>Título</Label>
              <Input
                id='title'
                value={formData.title}
                onChange={e =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder='Título del post'
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='content'>Contenido</Label>
              <Textarea
                id='content'
                value={formData.content}
                onChange={e =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder='Escribe el contenido del post aquí...'
                className='min-h-[200px]'
                required
              />
            </div>
            <div className='grid gap-2'>
              <Label>Archivos multimedia</Label>
              <MediaUpload
                onFilesChange={setMediaFiles}
                maxFiles={5}
                disabled={loading}
                existingFiles={mediaFiles}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='audience'>Dirigido a</Label>
              <Select
                value={formData.audience}
                onValueChange={value =>
                  setFormData({ ...formData, audience: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Selecciona el público objetivo' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Todos (Padres y Juniors)</SelectItem>
                  <SelectItem value='parental'>Solo Padres</SelectItem>
                  <SelectItem value='junior'>Solo Juniors</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='published'
                checked={formData.published}
                onCheckedChange={checked =>
                  setFormData({ ...formData, published: !!checked })
                }
              />
              <Label htmlFor='published'>Publicar inmediatamente</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? 'Guardando...' : post?.id ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
