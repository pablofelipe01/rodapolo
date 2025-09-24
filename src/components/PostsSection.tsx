'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Calendar, Eye, Heart } from 'lucide-react'
import { MediaGallery } from './MediaGallery'

interface Post {
  id: string
  title: string
  content: string
  status: string
  audience: 'all' | 'parental' | 'junior'
  published_at?: string | null
  created_at: string
  updated_at: string
  views_count?: number
  likes_count?: number
}

interface MediaFile {
  id: string
  post_id: string
  file_url: string
  file_type: 'image' | 'video'
  file_name: string
  file_size?: number
  mime_type: string
}

export function PostsSection() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [mediaFiles, setMediaFiles] = useState<Record<string, MediaFile[]>>({})

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts/published?audience=parental')
      if (response.ok) {
        const data = await response.json()
        setPosts(data)

        // Fetch media files for each post
        const mediaPromises = data.map(async (post: Post) => {
          try {
            const mediaResponse = await fetch(`/api/posts/${post.id}/media`)
            if (mediaResponse.ok) {
              const mediaData = await mediaResponse.json()
              return { postId: post.id, media: mediaData }
            }
          } catch (error) {
            console.error(`Error fetching media for post ${post.id}:`, error)
          }
          return { postId: post.id, media: [] }
        })

        const mediaResults = await Promise.all(mediaPromises)
        const mediaMap: Record<string, MediaFile[]> = {}
        mediaResults.forEach(result => {
          mediaMap[result.postId] = result.media || []
        })
        setMediaFiles(mediaMap)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className='py-8'>
          <div className='text-center'>
            <div className='text-sm text-gray-500'>Cargando contenido...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className='py-8'>
          <div className='text-center'>
            <FileText className='mx-auto h-12 w-12 text-gray-400' />
            <h3 className='mt-2 text-sm font-medium text-gray-900'>
              No hay contenido disponible
            </h3>
            <p className='mt-1 text-sm text-gray-500'>
              Pronto habrá contenido educativo disponible para ti.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Stats Card */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base'>Contenido Disponible</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-4 text-sm text-gray-600'>
            <div className='flex items-center gap-1'>
              <FileText className='h-4 w-4' />
              <span>{posts.length} artículos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Grid */}
      <div className='grid gap-6 md:grid-cols-2'>
        {posts.map(post => (
          <Card key={post.id} className='hover:shadow-md transition-shadow'>
            <CardHeader>
              <div className='flex items-start justify-between'>
                <div className='space-y-1'>
                  <CardTitle className='text-lg line-clamp-2'>
                    {post.title}
                  </CardTitle>
                  <div className='flex items-center gap-2 text-sm text-gray-500'>
                    <Calendar className='h-4 w-4' />
                    <span>
                      {new Date(
                        post.published_at || post.created_at
                      ).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <Badge variant='secondary'>Publicado</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className='line-clamp-3 mb-4'>
                {post.content}
              </CardDescription>

              {/* Media Gallery */}
              {mediaFiles[post.id] && mediaFiles[post.id].length > 0 && (
                <div className='mb-4'>
                  <MediaGallery
                    mediaFiles={mediaFiles[post.id].map(media => ({
                      id: media.id,
                      url: media.file_url,
                      type: media.file_type as 'image' | 'video',
                      name: media.file_name,
                    }))}
                  />
                </div>
              )}

              {/* Stats */}
              <div className='flex items-center gap-4 text-sm text-gray-500'>
                <div className='flex items-center gap-1'>
                  <Eye className='h-4 w-4' />
                  <span>{post.views_count || 0}</span>
                </div>
                <div className='flex items-center gap-1'>
                  <Heart className='h-4 w-4' />
                  <span>{post.likes_count || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
