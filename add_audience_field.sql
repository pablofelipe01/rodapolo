-- Agregar campo audience (audiencia/público objetivo) a la tabla posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS audience TEXT DEFAULT 'all' 
CHECK (audience IN ('all', 'parental', 'junior'));