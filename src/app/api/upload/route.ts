import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const postId = formData.get('postId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validar tipo de archivo
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido' },
        { status: 400 }
      )
    }

    // Validar tamaño (50MB máximo)
    const maxSize = 50 * 1024 * 1024 // 50MB en bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Archivo demasiado grande. Máximo 50MB' },
        { status: 400 }
      )
    }

    // Generar nombre único para el archivo
    const fileExtension = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`
    const filePath = `posts/${fileName}`

    // Subir archivo a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Error al subir archivo' },
        { status: 500 }
      )
    }

    // Obtener URL pública del archivo
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath)

    // Determinar tipo de archivo
    const fileType = file.type.startsWith('image/') ? 'image' : 'video'

    // Guardar información del archivo en la base de datos si se proporciona postId
    let mediaRecord = null
    if (postId) {
      const { data: insertData, error: insertError } = await supabase
        .from('media_files')
        .insert({
          post_id: postId,
          file_url: urlData.publicUrl,
          file_type: fileType,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Database insert error:', insertError)
        // Si falla la inserción en DB, eliminar archivo subido
        await supabase.storage.from('media').remove([filePath])
        return NextResponse.json(
          { error: 'Error al guardar información del archivo' },
          { status: 500 }
        )
      }

      mediaRecord = insertData
    }

    return NextResponse.json({
      success: true,
      file: {
        url: urlData.publicUrl,
        type: fileType,
        name: file.name,
        size: file.size,
        mimeType: file.type,
        ...(mediaRecord && { id: mediaRecord.id }),
      },
    })
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
