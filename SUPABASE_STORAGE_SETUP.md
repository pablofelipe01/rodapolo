# Configuración de Supabase Storage para Medios

## Pasos para configurar el bucket de almacenamiento:

### 1. Crear el bucket

1. Ve a tu proyecto de Supabase en https://supabase.com
2. Navega a **Storage** en la barra lateral izquierda
3. Haz clic en **New bucket**
4. Configura el bucket con estos datos:
   - **Name**: `media`
   - **Public bucket**: Activar (marcado)
   - **File size limit**: 50 MB
   - **MIME types allowed**: `image/*,video/*`

### 2. Configurar políticas de seguridad (RLS)

Una vez creado el bucket, necesitas configurar las políticas de Row Level Security:

#### Política de lectura pública:

```sql
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');
```

#### Política de subida (inserción):

```sql
CREATE POLICY "Allow upload for authenticated users" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'service_role');
```

#### Política de actualización:

```sql
CREATE POLICY "Allow update for authenticated users" ON storage.objects
  FOR UPDATE USING (bucket_id = 'media' AND auth.role() = 'service_role');
```

#### Política de eliminación:

```sql
CREATE POLICY "Allow delete for authenticated users" ON storage.objects
  FOR DELETE USING (bucket_id = 'media' AND auth.role() = 'service_role');
```

### 3. Aplicar la migración de la base de datos

Ejecuta el archivo `create_media_table.sql` en el SQL Editor de Supabase:

1. Ve a **SQL Editor** en tu proyecto de Supabase
2. Copia y pega el contenido del archivo `create_media_table.sql`
3. Haz clic en **RUN**

### 4. Verificar configuración

- El bucket `media` debe aparecer en la sección Storage
- Las políticas deben estar activas
- La tabla `media_files` debe existir en Database > Tables

## Estructura de archivos en el bucket:

```
media/
└── posts/
    ├── 1632847299-abc123.jpg
    ├── 1632847301-def456.mp4
    └── ...
```

Los archivos se almacenarán con nombres únicos generados automáticamente para evitar conflictos.

## URLs de acceso:

Los archivos subidos serán accesibles públicamente a través de URLs como:

```
https://[tu-proyecto].supabase.co/storage/v1/object/public/media/posts/1632847299-abc123.jpg
```

## Tipos de archivos soportados:

- **Imágenes**: JPEG, JPG, PNG, GIF, WebP
- **Videos**: MP4, WebM, QuickTime (MOV)
- **Tamaño máximo**: 50 MB por archivo
- **Límite por post**: 5 archivos

Una vez completada esta configuración, la funcionalidad de upload de medios estará lista para usar! 📸🎥
