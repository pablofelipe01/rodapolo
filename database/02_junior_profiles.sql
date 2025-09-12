-- ============================================================================
-- TABLA JUNIOR_PROFILES
-- Perfiles de menores de edad con códigos únicos para acceso sin password
-- ============================================================================

-- Crear tabla junior_profiles
CREATE TABLE IF NOT EXISTS public.junior_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parental_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  unique_code TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  nickname TEXT,
  birth_date DATE,
  avatar_url TEXT,
  handicap INTEGER DEFAULT 0 CHECK (handicap >= 0),
  level TEXT DEFAULT 'alpha' CHECK (level IN ('alpha', 'beta')),
  active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS junior_profiles_parental_id_idx ON public.junior_profiles(parental_id);
CREATE INDEX IF NOT EXISTS junior_profiles_unique_code_idx ON public.junior_profiles(unique_code);
CREATE INDEX IF NOT EXISTS junior_profiles_level_idx ON public.junior_profiles(level);
CREATE INDEX IF NOT EXISTS junior_profiles_active_idx ON public.junior_profiles(active);

-- Trigger para actualizar updated_at en junior_profiles
CREATE TRIGGER update_junior_profiles_updated_at 
  BEFORE UPDATE ON public.junior_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para generar código único de 6-8 caracteres
CREATE OR REPLACE FUNCTION generate_unique_junior_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
  code_length INTEGER;
BEGIN
  -- Longitud aleatoria entre 6 y 8 caracteres
  code_length := 6 + (random() * 2)::INTEGER;
  
  -- Generar código aleatorio
  FOR i IN 1..code_length LOOP
    result := result || substr(chars, (random() * length(chars))::INTEGER + 1, 1);
  END LOOP;
  
  -- Verificar si ya existe, si sí, regenerar
  WHILE EXISTS (SELECT 1 FROM public.junior_profiles WHERE unique_code = result) LOOP
    result := '';
    FOR i IN 1..code_length LOOP
      result := result || substr(chars, (random() * length(chars))::INTEGER + 1, 1);
    END LOOP;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Función para asignar código único automáticamente
CREATE OR REPLACE FUNCTION set_junior_unique_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unique_code IS NULL OR NEW.unique_code = '' THEN
    NEW.unique_code := generate_unique_junior_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para asignar código único automáticamente
CREATE TRIGGER set_junior_code_on_insert
  BEFORE INSERT ON public.junior_profiles
  FOR EACH ROW EXECUTE FUNCTION set_junior_unique_code();

-- Configurar Row Level Security (RLS)
ALTER TABLE public.junior_profiles ENABLE ROW LEVEL SECURITY;

-- Política para que parentales solo vean sus propios hijos
CREATE POLICY "Parentals can view own children" ON public.junior_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = parental_id AND user_id = auth.uid()
    )
  );

-- Política para que parentales puedan crear hijos
CREATE POLICY "Parentals can create children" ON public.junior_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = parental_id AND user_id = auth.uid() AND role = 'parental'
    )
  );

-- Política para que parentales puedan actualizar sus hijos
CREATE POLICY "Parentals can update own children" ON public.junior_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = parental_id AND user_id = auth.uid()
    )
  );

-- Política para que admins puedan ver todos los juniors
CREATE POLICY "Admins can view all juniors" ON public.junior_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Política para que admins puedan actualizar cualquier junior
CREATE POLICY "Admins can update any junior" ON public.junior_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Comentarios para documentación
COMMENT ON TABLE public.junior_profiles IS 'Perfiles de menores de edad con acceso por código único';
COMMENT ON COLUMN public.junior_profiles.unique_code IS 'Código único de 6-8 caracteres para acceso sin password';
COMMENT ON COLUMN public.junior_profiles.handicap IS 'Handicap del jugador (0 = principiante)';
COMMENT ON COLUMN public.junior_profiles.level IS 'Nivel de juego: alpha (principiante) o beta (avanzado)';
COMMENT ON COLUMN public.junior_profiles.active IS 'Si el perfil está activo o deshabilitado';