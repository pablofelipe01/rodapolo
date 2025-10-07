'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Calendar, Eye, Heart, BookOpen, Sparkles, Star } from 'lucide-react'
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

export function JuniorPostsSection() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showPostModal, setShowPostModal] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<Record<string, MediaFile[]>>({})
  const [showAllPosts, setShowAllPosts] = useState(false)

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts/published?audience=junior')
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

  const openPost = (post: Post) => {
    setSelectedPost(post)
    setShowPostModal(true)
  }

  if (loading) {
    return (
      <Card className='bg-white/90 backdrop-blur-sm border-0 shadow-xl'>
        <CardHeader className='text-center pb-3'>
          <CardTitle className='flex items-center justify-center gap-2 text-lg'>
            <Sparkles className='h-5 w-5 text-purple-600' />
            Contenido para Ti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            <div className='animate-bounce text-4xl mb-4'>📚</div>
            <div className='text-sm text-gray-500'>Cargando contenido...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (posts.length === 0) {
    return (
      <Card className='bg-white/90 backdrop-blur-sm border-0 shadow-xl'>
        <CardHeader className='text-center pb-3'>
          <CardTitle className='flex items-center justify-center gap-2 text-lg'>
            <Sparkles className='h-5 w-5 text-purple-600' />
            Contenido para Ti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            <div className='text-6xl mb-4'>📝</div>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              ¡Pronto habrá contenido nuevo!
            </h3>
            <p className='text-sm text-gray-500'>
              Estamos preparando contenido súper genial para ti 🚀
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className='bg-white/90 backdrop-blur-sm border-0 shadow-xl'>
        <CardHeader className='text-center pb-3'>
          <CardTitle className='flex items-center justify-center gap-2 text-lg'>
            <Sparkles className='h-5 w-5 text-purple-600' />
            Contenido para Ti
          </CardTitle>
          <CardDescription className='text-center'>
            ¡{posts.length} artículos geniales esperándote! ✨
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {(showAllPosts ? posts : posts.slice(0, 3)).map(post => (
              <div
                key={post.id}
                className='flex items-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-orange-100 cursor-pointer hover:shadow-md transition-all duration-200'
                onClick={() => openPost(post)}
              >
                <div className='flex-shrink-0 mr-4'>
                  <div className='w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center'>
                    <BookOpen className='h-6 w-6 text-white' />
                  </div>
                </div>
                <div className='flex-1'>
                  <div className='flex items-start justify-between'>
                    <div className='space-y-1'>
                      <h3 className='font-semibold text-gray-900 line-clamp-1'>
                        {post.title}
                      </h3>
                      <p className='text-sm text-gray-600 line-clamp-2'>
                        {post.content}
                      </p>

                      {/* Media Preview */}
                      {mediaFiles[post.id] &&
                        mediaFiles[post.id].length > 0 && (
                          <div className='mt-2'>
                            <MediaGallery
                              mediaFiles={mediaFiles[post.id].map(media => ({
                                id: media.id,
                                url: media.file_url,
                                type: media.file_type as 'image' | 'video',
                                name: media.file_name,
                                size: media.file_size,
                                mimeType: media.mime_type,
                              }))}
                              maxItemsToShow={1}
                              compactMode={true}
                              className='rounded-lg overflow-hidden'
                            />
                          </div>
                        )}

                      <div className='flex items-center gap-3 text-xs text-gray-500 mt-2'>
                        <div className='flex items-center gap-1'>
                          <Calendar className='h-3 w-3' />
                          <span>
                            {new Date(
                              post.published_at || post.created_at
                            ).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <Eye className='h-3 w-3' />
                          <span>{post.views_count || 0}</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <Heart className='h-3 w-3' />
                          <span>{post.likes_count || 0}</span>
                        </div>
                      </div>
                    </div>
                    <Star className='h-4 w-4 text-yellow-500 flex-shrink-0 ml-2' />
                  </div>
                </div>
              </div>
            ))}

            {posts.length > 3 && !showAllPosts && (
              <div className='text-center pt-2'>
                <Button
                  variant='outline'
                  className='bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200 text-purple-700 hover:from-purple-200 hover:to-pink-200'
                  onClick={() => setShowAllPosts(true)}
                >
                  Ver más contenido ({posts.length - 3} más) 🎉
                </Button>
              </div>
            )}

            {showAllPosts && posts.length > 3 && (
              <div className='text-center pt-2'>
                <Button
                  variant='outline'
                  className='bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300 text-gray-600 hover:from-gray-200 hover:to-gray-300'
                  onClick={() => setShowAllPosts(false)}
                >
                  Ver menos contenido 📝
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal para ver post completo */}
      <Dialog open={showPostModal} onOpenChange={setShowPostModal}>
        <DialogContent className='max-w-2xl'>
          {selectedPost && (
            <>
              <DialogHeader>
                <DialogTitle className='text-xl font-bold text-gray-900 flex items-center gap-2'>
                  <Sparkles className='h-5 w-5 text-purple-600' />
                  {selectedPost.title}
                </DialogTitle>
                <DialogDescription className='flex items-center gap-2 text-sm text-gray-500'>
                  <Calendar className='h-4 w-4' />
                  Publicado el{' '}
                  {new Date(
                    selectedPost.published_at || selectedPost.created_at
                  ).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4'>
                <div className='prose prose-sm max-w-none'>
                  <div className='whitespace-pre-wrap text-gray-700 leading-relaxed'>
                    {selectedPost.content}
                  </div>
                </div>

                {/* Media Gallery */}
                {selectedPost &&
                  mediaFiles[selectedPost.id] &&
                  mediaFiles[selectedPost.id].length > 0 && (
                    <div className='space-y-2'>
                      <MediaGallery
                        mediaFiles={mediaFiles[selectedPost.id].map(media => ({
                          id: media.id,
                          url: media.file_url,
                          type: media.file_type as 'image' | 'video',
                          name: media.file_name,
                          size: media.file_size,
                          mimeType: media.mime_type,
                        }))}
                        showDownload={false}
                        compactMode={false}
                      />
                    </div>
                  )}

                {/* Stats */}
                <div className='flex items-center gap-4 text-sm text-gray-500 border-t pt-4'>
                  <div className='flex items-center gap-1'>
                    <Eye className='h-4 w-4' />
                    <span>{selectedPost.views_count || 0} vistas</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Heart className='h-4 w-4' />
                    <span>{selectedPost.likes_count || 0} likes</span>
                  </div>
                </div>

                <div className='flex justify-end'>
                  <Button
                    className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                    onClick={() => setShowPostModal(false)}
                  >
                    ¡Genial! 🌟
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
