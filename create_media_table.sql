-- Crear tabla para gestionar archivos multimedia de los posts
CREATE TABLE IF NOT EXISTS public.media_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para mejorar consultas por post_id
CREATE INDEX IF NOT EXISTS idx_media_files_post_id ON public.media_files(post_id);

-- Agregar trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_media_files_updated_at
  BEFORE UPDATE ON public.media_files
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos los usuarios autenticados y anónimos
CREATE POLICY "Allow public read access" ON public.media_files
  FOR SELECT USING (true);

-- Política para permitir inserción (necesitarás ajustar esto según tu sistema de autenticación)
CREATE POLICY "Allow insert for service role" ON public.media_files
  FOR INSERT WITH CHECK (true);

-- Política para permitir actualización (necesitarás ajustar esto según tu sistema de autenticación)
CREATE POLICY "Allow update for service role" ON public.media_files
  FOR UPDATE USING (true);

-- Política para permitir eliminación (necesitarás ajustar esto según tu sistema de autenticación)
CREATE POLICY "Allow delete for service role" ON public.media_files
  FOR DELETE USING (true);