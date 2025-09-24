'use client'

import { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Upload, Video } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'

interface MediaFile {
  id?: string
  url: string
  type: 'image' | 'video'
  name: string
  size: number
  mimeType: string
}

interface MediaUploadProps {
  onFilesChange: (files: MediaFile[]) => void
  maxFiles?: number
  disabled?: boolean
  existingFiles?: MediaFile[]
}

export function MediaUpload({
  onFilesChange,
  maxFiles = 5,
  disabled = false,
  existingFiles = [],
}: MediaUploadProps) {
  const [files, setFiles] = useState<MediaFile[]>(existingFiles)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const uploadFile = async (file: File): Promise<MediaFile> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Error al subir archivo')
    }

    const result = await response.json()
    return result.file
  }

  const handleFileSelect = useCallback(
    async (selectedFiles: FileList) => {
      if (disabled || uploading) return

      const newFiles = Array.from(selectedFiles)
      if (files.length + newFiles.length > maxFiles) {
        alert(`Máximo ${maxFiles} archivos permitidos`)
        return
      }

      setUploading(true)

      try {
        const uploadPromises = newFiles.map(uploadFile)
        const uploadedFiles = await Promise.all(uploadPromises)

        const updatedFiles = [...files, ...uploadedFiles]
        setFiles(updatedFiles)
        onFilesChange(updatedFiles)
      } catch (error) {
        console.error('Error uploading files:', error)
        alert(
          error instanceof Error ? error.message : 'Error al subir archivos'
        )
      } finally {
        setUploading(false)
      }
    },
    [disabled, uploading, files, maxFiles, onFilesChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)

      if (disabled || uploading) return

      const droppedFiles = e.dataTransfer.files
      if (droppedFiles.length > 0) {
        handleFileSelect(droppedFiles)
      }
    },
    [disabled, uploading, handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files)
    }
  }

  return (
    <div className='space-y-4'>
      {/* Drop zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className='flex flex-col items-center gap-2'>
          <Upload className='h-8 w-8 text-gray-400' />
          <div className='text-sm text-gray-600'>
            <p>
              <strong>Clic para seleccionar</strong> o arrastra archivos aquí
            </p>
            <p className='text-xs text-gray-500 mt-1'>
              Imágenes (JPG, PNG, GIF, WebP) y Videos (MP4, WebM, MOV) - Máx.
              50MB
            </p>
          </div>
        </div>
      </div>

      <Input
        ref={fileInputRef}
        type='file'
        multiple
        accept='image/*,video/*'
        onChange={handleInputChange}
        disabled={disabled || uploading}
        className='hidden'
      />

      {/* Loading state */}
      {uploading && (
        <div className='text-center py-4'>
          <div className='inline-flex items-center gap-2 text-sm text-blue-600'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
            Subiendo archivos...
          </div>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className='space-y-2'>
          <h4 className='text-sm font-medium text-gray-700'>
            Archivos ({files.length}/{maxFiles})
          </h4>
          <div className='grid grid-cols-1 gap-2'>
            {files.map((file, index) => (
              <Card key={index} className='p-3'>
                <CardContent className='p-0'>
                  <div className='flex items-center gap-3'>
                    {/* File icon/thumbnail */}
                    <div className='flex-shrink-0'>
                      {file.type === 'image' ? (
                        <div className='relative'>
                          <Image
                            src={file.url}
                            alt={file.name}
                            width={48}
                            height={48}
                            className='w-12 h-12 object-cover rounded'
                          />
                        </div>
                      ) : (
                        <div className='w-12 h-12 bg-gray-100 rounded flex items-center justify-center'>
                          <Video className='h-6 w-6 text-gray-500' />
                        </div>
                      )}
                    </div>

                    {/* File info */}
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-900 truncate'>
                        {file.name}
                      </p>
                      <p className='text-xs text-gray-500'>
                        {formatFileSize(file.size)} • {file.type}
                      </p>
                    </div>

                    {/* Remove button */}
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={e => {
                        e.stopPropagation()
                        removeFile(index)
                      }}
                      disabled={disabled || uploading}
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
