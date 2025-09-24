'use client'

import { useState } from 'react'
// import Image from 'next/image' // Temporarily disabled for debugging
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Play, Maximize2, Download } from 'lucide-react'

interface MediaFile {
  id?: string
  url: string
  type: 'image' | 'video'
  name: string
  size?: number
  mimeType?: string
}

interface MediaGalleryProps {
  mediaFiles: MediaFile[]
  className?: string
  maxItemsToShow?: number
  showDownload?: boolean
  compactMode?: boolean
}

export function MediaGallery({
  mediaFiles,
  className = '',
  maxItemsToShow = 0,
  showDownload = false,
  compactMode = false,
}: MediaGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null)
  const [showModal, setShowModal] = useState(false)

  if (!mediaFiles || mediaFiles.length === 0) {
    return null
  }

  const displayedFiles =
    maxItemsToShow > 0 ? mediaFiles.slice(0, maxItemsToShow) : mediaFiles
  const remainingCount = mediaFiles.length - displayedFiles.length

  const openModal = (media: MediaFile) => {
    setSelectedMedia(media)
    setShowModal(true)
  }

  const getGridClass = () => {
    if (compactMode) return 'grid-cols-2 gap-2'

    const count = displayedFiles.length
    if (count === 1) return 'grid-cols-1'
    if (count === 2) return 'grid-cols-2 gap-2'
    if (count === 3) return 'grid-cols-3 gap-2'
    if (count >= 4) return 'grid-cols-2 gap-2'
    return 'grid-cols-1'
  }

  return (
    <>
      <div className={className}>
        <div className={`grid ${getGridClass()}`}>
          {displayedFiles.map((media, index) => (
            <div
              key={media.id || index}
              className={`relative cursor-pointer group rounded-lg overflow-hidden ${
                compactMode ? 'h-32' : 'h-48'
              }`}
              onClick={() => openModal(media)}
            >
              {media.type === 'image' ? (
                <div className='relative w-full h-full group'>
                  <img
                    src={media.url}
                    alt={media.name}
                    className='w-full h-full object-cover rounded-lg'
                    onLoad={() => console.log('Image loaded:', media.name)}
                    onError={e => console.error('Image failed:', media.name, e)}
                  />
                  <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center rounded-lg'>
                    <Maximize2 className='w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity' />
                  </div>
                </div>
              ) : (
                <div className='relative w-full h-full bg-gray-100 rounded-lg'>
                  <video
                    src={media.url}
                    className='w-full h-full object-cover rounded-lg'
                    preload='metadata'
                  />
                  <div className='absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded-lg'>
                    <Play className='w-12 h-12 text-white' />
                  </div>
                </div>
              )}

              {/* Show remaining count overlay on last item */}
              {index === displayedFiles.length - 1 && remainingCount > 0 && (
                <div className='absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg'>
                  <span className='text-white text-lg font-semibold'>
                    +{remainingCount} más
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal for full view */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className='max-w-4xl max-h-[90vh] p-0'>
          <DialogHeader className='p-6 pb-0'>
            <DialogTitle className='flex items-center justify-between'>
              <span>{selectedMedia?.name}</span>
              {showDownload && selectedMedia && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    // Simple download
                    const link = document.createElement('a')
                    link.href = selectedMedia.url
                    link.download = selectedMedia.name
                    link.click()
                  }}
                >
                  <Download className='w-4 h-4 mr-2' />
                  Descargar
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className='p-6 pt-2'>
            {selectedMedia && (
              <div className='flex justify-center'>
                {selectedMedia.type === 'image' ? (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.name}
                    className='max-w-full max-h-[70vh] object-contain'
                  />
                ) : (
                  <video
                    src={selectedMedia.url}
                    controls
                    className='max-w-full max-h-[70vh]'
                    autoPlay
                  >
                    Tu navegador no soporta videos.
                  </video>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
