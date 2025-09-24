-- Políticas de seguridad para Supabase Storage bucket 'media'
-- Ejecutar estas políticas DESPUÉS de crear el bucket 'media'

-- Política de lectura pública (cualquiera puede ver los archivos)
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

-- Política de subida (solo service role puede subir archivos)
CREATE POLICY "Allow upload for service role" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'service_role');

-- Política de actualización (solo service role puede actualizar archivos)
CREATE POLICY "Allow update for service role" ON storage.objects
  FOR UPDATE USING (bucket_id = 'media' AND auth.role() = 'service_role');

-- Política de eliminación (solo service role puede eliminar archivos)
CREATE POLICY "Allow delete for service role" ON storage.objects
  FOR DELETE USING (bucket_id = 'media' AND auth.role() = 'service_role');